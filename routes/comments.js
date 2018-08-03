var express=require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var mongoose=require("mongoose");
var middleware = require("../middleware");


router.get("/new", middleware.isLoggedIn,function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        }
        else{
            res.render("newComment", {campground: foundCampground});
        }
    })
    
});

router.post("/", middleware.isLoggedIn,function(req, res) {
    var idraw = req.params.id;
    var id = mongoose.Types.ObjectId(idraw);
    
    Campground.findById(id, function(err, foundCampground) {
        if (err) {
            console.log(err);
            console.log(id);
            console.log("Error in finding campground");
            res.redirect("/index");
        }
        else {
            // console.log(foundCampground);
            // console.log(req.user.username);
            
            Comment.create(req.body.comment, function(err, createdComment) {
                if (err) {
                    console.log("Error in posting comment");
                }
                else {
                    createdComment.author.id=req.user._id;
                    createdComment.author.userName=req.user.username;
                    createdComment.save();
                    foundCampground.comments.push(createdComment);
                    foundCampground.save();
                    req.flash("success", "Comment saved.");
                    console.log(createdComment);
                    res.redirect("/index/" + foundCampground._id);

                }
            });
        }
    })
});

//UPDATE ROUTES        
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    var id = req.params.comment_id;
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground ){
            req.flash("error", "Restaurant not found");
            return res.redirect("back");
        }
        
        else{
            Comment.findById(id, function(err, foundComment){
        if(err){
            return res.redirect("back");
        }
        res.render("editComment", {campground_id: req.params.id, comment: foundComment}); 
            })
        }
    })
    
});
    
    
        
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    var campId = req.params.id;
    var id = req.params.comment_id;
    var data =req.body.comment.text;
    Comment.findByIdAndUpdate(id, data, function(err, updatedComment){
            if(err){
         console.log("Something went wrong with the DB");
         console.log(err);
    }
    else{
        console.log(campId);
        console.log(id);
        res.redirect("/index/" + campId);
      console.log(updatedComment);
    }
        })
        })
        
//DELETE ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    var campId = req.params.id;
    var id = req.params.comment_id;
    Comment.findByIdAndRemove(id, function(err){
            if(err){
         console.log("Something went wrong with the DB");
         console.log(err)
    }
    else{
        console.log("deleting");
        console.log(campId);
        console.log(id);
        req.flash("success", "Comment was deleted");
        res.redirect("/index/" + campId);
      
    }
})
})

module.exports = router;