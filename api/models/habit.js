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
        type: [String], // Array of day abbreviations 
        default: []
    },
    reminder: {
        enabled: {
            type: Boolean,
            default: false,
        },
        time: {
            type: String, // Format: "HH:MM AM/PM"
            default: null,
        },
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
        required: true, // Ensure every habit is associated with a user
    },
});

const Habit = mongoose.model("Habit", habitSchema);
module.exports = Habit;
