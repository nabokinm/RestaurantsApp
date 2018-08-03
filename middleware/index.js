var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        var id = req.params.comment_id;
        Comment.findById(id, function(err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                console.log("Something went wrong with the DB");
                console.log(err);
                res.redirect("back");
            }
            else {
                if (foundComment && foundComment.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash("error", "Permission denied");
                    console.log("not found comment");
                    res.redirect("back");
                }
            }
        })
    }
    else {
        req.flash("error", "You must be logged in to perform this action!");
        res.redirect("back");
    }
}

middlewareObj.checkCampgroundOwnership = function checkCampgroundOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        var id = req.params.id;
        Campground.findById(id).populate("comments").exec(function(err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found");
                console.log("Something went wrong with the DB");
                console.log(err);
                res.redirect("back");
            }
            else {
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash("error", "Permission denied");
                    res.redirect("back");
                }
            }
        })
    }
    else {
        req.flash("error", "You must be logged in to perform this action!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash("error", "Please login first!");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;