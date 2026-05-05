import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const connectDB = async() => {
    try {
        // FIX: was \\Hospital (escape sequence) — changed to /Hospital
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/Hospital`);
        console.log(`MongoDB connected. Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server running on port: ${process.env.PORT || 8000}`);
    });
}).catch((err) => {
    console.log("MongoDB connection failed:", err.message);
});
