const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

const Settings = require("./models/Settings");
const defaultSettings = require("./models/Settings").defaultSettings;

// ==================== CONFIG ====================
dotenv.config();
connectDB();

const app = express();

// ==================== CORS CONFIG ====================
const corsOptions = {
    origin: function (origin, callback) {

        // Allow requests without origin
        if (!origin) {
            return callback(null, true);
        }

        // Allow localhost
        if (
            /^http:\/\/localhost:\d+$/.test(origin) ||
            /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
        ) {
            return callback(null, true);
        }

        // Allow all origins in development
        return callback(null, true);
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cookie",
        "X-Requested-With"
    ],

    exposedHeaders: ["Authorization"],

    optionsSuccessStatus: 200
};

// ==================== MIDDLEWARE ====================

// CORS
app.use(cors(corsOptions));

// IMPORTANT:
// DON'T USE THIS IN EXPRESS 5
// app.options('*', cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);

// Cookie parser
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

console.log("⚠️ Rate limiting disabled for development");

// ==================== STATIC FILES ====================
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// ==================== ROUTES ====================

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// AI routes
app.use("/api/ai", require("./routes/aiRoutes"));

// User routes
app.use("/api/user", require("./routes/userRoutes"));

// Cart routes
app.use("/api/cart", require("./routes/cartRoutes"));

// Food routes
app.use("/api/food", require("./routes/foodRoutes"));

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));

// Order routes
app.use("/api/order", require("./routes/orderRoutes"));

// Review routes
app.use("/api", require("./routes/reviewRoutes"));

// Payment routes
app.use("/api/payment", require("./routes/paymentRoutes"));

// Delivery routes
app.use("/api/delivery", require("./routes/deliveryRoutes"));

// ==================== TEST ROUTES ====================

// Protected route
app.get("/api/profile", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Protected profile data",
        user: req.user
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "OK",
        message: "Server is running",
        timestamp: new Date()
    });
});

// Root route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend API Running 🚀"
    });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {

    console.error("❌ Error:", err);

    res.status(err.status || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Internal Server Error"
    });
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`✅ Server running on port ${PORT}`);

    console.log(
        `📍 Health Check: http://localhost:${PORT}/api/health`
    );
});

// ==================== INIT SETTINGS ====================
const initSettings = async () => {

    try {

        for (const setting of defaultSettings) {

            const exists = await Settings.findOne({
                key: setting.key
            });

            if (!exists) {

                await Settings.create(setting);

                console.log(
                    `✅ Created setting: ${setting.key}`
                );
            }
        }

        console.log("✅ Settings initialized");

    } catch (error) {

        console.log(
            "⚠️ Settings init error:",
            error.message
        );
    }
};

initSettings();