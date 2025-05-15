const mongoose = require('mongoose');
require('dotenv').config()

class Database {
    static async connect() {
        if (!process.env.MONGO_URI) {
            throw new Error("Missing Mongo URL for the specified NODE_ENV.");
        }

        try {
            mongoose.Promise = Promise;
            await mongoose.connect(process.env.MONGO_URI);
            console.log("MongoDB Connected");
        } catch (err) {
            console.error("Failed to connect to MongoDB", err);
            process.exit(1);
        }

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });
    }
}



module.exports = Database;

