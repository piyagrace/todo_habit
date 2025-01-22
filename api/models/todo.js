const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    category: {
        type: String,
        required: true,
    },
    notes: {
        type: String, 
        default: ""
    },
    dueDate: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});


const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo