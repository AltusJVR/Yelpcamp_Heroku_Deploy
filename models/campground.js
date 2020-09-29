const mongoose = require("mongoose");

// Define a schema for mongoose (This is a pattern for our data)
let campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: String,
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String
    },

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }
    ]
});

// Define a model for Mongoose
let Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;