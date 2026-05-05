// controllers/navigationController.js
// COMPLETE WORKING CODE WITH getLiveTracking

const Order = require("../models/Order");
const User = require("../models/User");
const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

// ===============================
// 1. START NAVIGATION
// ===============================
exports.startNavigation = async (req, res) => {
    try {
        const { orderId, currentLat, currentLng } = req.body;

        if (!orderId || !currentLat || !currentLng) {
            return res.status(400).json({ 
                message: "orderId, currentLat, currentLng are required" 
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.deliveryBoy?.toString() !== req.user.id) {
            return res.status(403).json({ 
                message: "You are not assigned to this order" 
            });
        }

        // Auto create deliveryLocation if not exists
        let destination = order.deliveryLocation;
        
        if (!destination || !destination.lat || !destination.lng) {
            let lat = 26.9124;
            let lng = 75.7873;
            
            if (GOOGLE_MAPS_API_KEY && order.address) {
                try {
                    const geoResponse = await axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json`,
                        { params: { address: order.address, key: GOOGLE_MAPS_API_KEY } }
                    );
                    if (geoResponse.data.status === "OK" && geoResponse.data.results[0]) {
                        lat = geoResponse.data.results[0].geometry.location.lat;
                        lng = geoResponse.data.results[0].geometry.location.lng;
                    }
                } catch (geoError) {
                    console.log("Geocoding failed, using default");
                }
            }
            
            destination = { lat, lng, address: order.address };
            order.deliveryLocation = destination;
            await order.save();
        }

        const directions = await getDirectionsFromGoogle(
            { lat: currentLat, lng: currentLng },
            { lat: destination.lat, lng: destination.lng }
        );

        order.tracking = {
            latitude: currentLat,
            longitude: currentLng,
            updatedAt: new Date()
        };
        await order.save();

        res.json({
            success: true,
            message: "Navigation started",
            orderId: order._id,
            from: { lat: currentLat, lng: currentLng },
            to: {
                lat: destination.lat,
                lng: destination.lng,
                address: destination.address || order.address
            },
            route: directions
        });

    } catch (error) {
        console.error("Navigation error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// 2. GET ROUTE INFO
// ===============================
exports.getRoute = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { currentLat, currentLng } = req.query;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.deliveryBoy?.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        let destination = order.deliveryLocation;
        if (!destination || !destination.lat) {
            destination = { lat: 26.9124, lng: 75.7873, address: order.address };
        }

        let routeData = null;
        if (currentLat && currentLng) {
            routeData = await getDirectionsFromGoogle(
                { lat: parseFloat(currentLat), lng: parseFloat(currentLng) },
                { lat: destination.lat, lng: destination.lng }
            );
        }

        res.json({
            success: true,
            orderId: order._id,
            orderStatus: order.status,
            destination,
            currentLocation: currentLat && currentLng ? { lat: currentLat, lng: currentLng } : null,
            route: routeData,
            tracking: order.tracking
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// 3. UPDATE LOCATION & ROUTE
// ===============================
exports.updateLocationAndRoute = async (req, res) => {
    try {
        const { orderId, currentLat, currentLng } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.deliveryBoy?.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        order.tracking = {
            latitude: currentLat,
            longitude: currentLng,
            updatedAt: new Date()
        };
        await order.save();

        const destination = order.deliveryLocation || { lat: 26.9124, lng: 75.7873 };
        const routeInfo = await getDirectionsFromGoogle(
            { lat: currentLat, lng: currentLng },
            { lat: destination.lat, lng: destination.lng }
        );

        res.json({
            success: true,
            currentLocation: { lat: currentLat, lng: currentLng },
            remainingDistance: routeInfo.distance,
            remainingTime: routeInfo.duration,
            estimatedArrival: new Date(Date.now() + (routeInfo.durationSeconds * 1000))
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// 4. GET OPTIMIZED ROUTE
// ===============================
exports.getOptimizedRoute = async (req, res) => {
    try {
        const { orderIds } = req.body;

        if (!orderIds || !orderIds.length) {
            return res.status(400).json({ message: "orderIds required" });
        }

        const orders = await Order.find({
            _id: { $in: orderIds },
            deliveryBoy: req.user.id
        });

        if (!orders.length) {
            return res.status(404).json({ message: "No orders found" });
        }

        const waypoints = orders.map(order => ({
            lat: order.deliveryLocation?.lat || 26.9124,
            lng: order.deliveryLocation?.lng || 75.7873,
            orderId: order._id
        }));

        const optimizedRoute = await getOptimizedWaypoints(waypoints);

        res.json({
            success: true,
            orders: orders.map(o => ({ id: o._id, address: o.address })),
            optimizedOrder: optimizedRoute.orderSequence,
            totalDistance: optimizedRoute.totalDistance,
            totalTime: optimizedRoute.totalTime
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// 5. GET LIVE TRACKING (NEW - FIXED)
// ===============================
exports.getLiveTracking = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check permission: delivery boy, admin, or order owner
        if (order.deliveryBoy?.toString() !== req.user.id && 
            req.user.role !== "admin" && 
            order.userId?.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get delivery boy details
        const deliveryBoy = await User.findById(order.deliveryBoy).select("name currentLocation isOnline");

        // Calculate remaining distance if tracking exists
        let remainingInfo = null;
        if (order.tracking?.latitude && order.tracking?.longitude && order.deliveryLocation) {
            remainingInfo = await getDirectionsFromGoogle(
                { lat: order.tracking.latitude, lng: order.tracking.longitude },
                { lat: order.deliveryLocation.lat, lng: order.deliveryLocation.lng }
            );
        }

        res.json({
            success: true,
            orderId: order._id,
            orderStatus: order.status,
            orderStatusHistory: {
                acceptedAt: order.acceptedAt,
                pickedUpAt: order.pickedUpAt,
                deliveredAt: order.deliveredAt
            },
            deliveryBoy: deliveryBoy ? {
                name: deliveryBoy.name,
                isOnline: deliveryBoy.isOnline,
                currentLocation: deliveryBoy.currentLocation
            } : null,
            deliveryLocation: order.deliveryLocation,
            currentLocation: order.tracking,
            remainingInfo,
            lastUpdated: order.tracking?.updatedAt || null
        });

    } catch (error) {
        console.error("Live tracking error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ===============================
// HELPER: Google Maps Directions API
// ===============================
async function getDirectionsFromGoogle(origin, destination) {
    try {
        if (!GOOGLE_MAPS_API_KEY) {
            return getMockRouteData(origin, destination);
        }

        const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
            params: {
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                key: GOOGLE_MAPS_API_KEY,
                mode: "driving"
            }
        });

        if (response.data.status !== "OK") {
            return getMockRouteData(origin, destination);
        }

        const route = response.data.routes[0];
        const leg = route.legs[0];

        return {
            distance: leg.distance.text,
            distanceMeters: leg.distance.value,
            duration: leg.duration.text,
            durationSeconds: leg.duration.value,
            polyline: route.overview_polyline.points,
            steps: leg.steps.map(step => ({
                instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || "",
                distance: step.distance.text,
                duration: step.duration.text
            })),
            startAddress: leg.start_address,
            endAddress: leg.end_address
        };
    } catch (error) {
        return getMockRouteData(origin, destination);
    }
}

function getMockRouteData(origin, destination) {
    const distanceKm = getDistance(origin, destination);
    const durationMin = Math.round(distanceKm * 3);
    
    return {
        distance: `${distanceKm.toFixed(1)} km`,
        distanceMeters: Math.round(distanceKm * 1000),
        duration: `${durationMin} mins`,
        durationSeconds: durationMin * 60,
        polyline: "mock_polyline",
        steps: [],
        startAddress: "Current Location",
        endAddress: "Delivery Location"
    };
}

async function getOptimizedWaypoints(waypoints) {
    if (waypoints.length <= 1) {
        return {
            orderSequence: waypoints.filter(w => w.orderId).map(w => w.orderId),
            totalDistance: "0 km",
            totalTime: "0 mins"
        };
    }

    const optimized = [];
    let remaining = [...waypoints];
    let current = remaining.shift();
    optimized.push(current);
    
    while (remaining.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        
        for (let i = 0; i < remaining.length; i++) {
            const dist = getDistance(current, remaining[i]);
            if (dist < nearestDistance) {
                nearestDistance = dist;
                nearestIndex = i;
            }
        }
        
        current = remaining[nearestIndex];
        optimized.push(current);
        remaining.splice(nearestIndex, 1);
    }
    
    const totalDistance = optimized.reduce((sum, _, i) => {
        if (i === 0) return sum;
        return sum + getDistance(optimized[i-1], optimized[i]);
    }, 0);
    
    return {
        orderSequence: optimized.filter(w => w.orderId).map(w => w.orderId),
        totalDistance: `${totalDistance.toFixed(1)} km`,
        totalTime: `${Math.round(totalDistance * 3)} mins`
    };
}

function getDistance(point1, point2) {
    const R = 6371;
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}