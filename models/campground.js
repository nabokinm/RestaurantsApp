var mongoose=require("mongoose");

var campgroundsSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    image_id: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        userName: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
        ]
});

module.exports = mongoose.model("Campground", campgroundsSchema);