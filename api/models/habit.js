const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true,
    },
    repeatMode: {
        type: String,
        enum: ["daily", "weekly"],
        default: "daily"
    },
    days: {
        type: [String], // Array of day abbreviations, e.g., ["M", "W", "F"]
        default: []
    },
    reminder: {
        type: Boolean,
        default: false,
    },
    completed: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const Habit = mongoose.model("Habit",habitSchema);

module.exports = Habit