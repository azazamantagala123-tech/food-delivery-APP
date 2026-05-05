const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/BlacklistedToken");

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        // check blacklist
        const isBlacklisted = await BlacklistedToken.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({ message: "Token revoked" });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};