const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
// ✅ COMMENTED OUT RATE LIMIT
// const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cors = require("cors");

const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

const Settings = require("./models/Settings");
const defaultSettings = require("./models/Settings").defaultSettings;

dotenv.config();
connectDB();

const app = express();

// ==================== CORS CONFIGURATION ====================
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ RATE LIMITING DISABLED FOR DEVELOPMENT
console.log("⚠️ Rate limiting disabled for development");

// ❌ COMMENTED OUT - Rate limit code
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     message: "Too many requests, try again later"
// });
// app.use(limiter);

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/food", require("./routes/foodRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api", require("./routes/reviewRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/delivery", require("./routes/deliveryRoutes"));

app.get("/api/profile", authMiddleware, (req, res) => {
    res.json({ message: "Protected profile data", user: req.user });
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const initSettings = async () => {
    try {
        for (const setting of defaultSettings) {
            const exists = await Settings.findOne({ key: setting.key });
            if (!exists) {
                await Settings.create(setting);
                console.log(`Created setting: ${setting.key}`);
            }
        }
        console.log("Settings initialized");
    } catch (error) {
        console.log("Settings init error:", error.message);
    }
};

initSettings();