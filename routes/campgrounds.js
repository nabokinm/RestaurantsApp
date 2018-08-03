var express=require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX ROUTE - show all campgrounds
router.get("/",function(req, res){
     
        Campground.find({}, function(err, allCampgrounds){
            if(err){
         console.log("Something went wrong with the DB");
         console.log(err)
    }
    else{
        res.render("index", {campgrounds: allCampgrounds});
    }
        });
        
})
// NEW ROUTE - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("new");
})

//CREATE ROUTE add new campground to the DB
router.post("/", middleware.isLoggedIn, function(req, res){
    
    var name = req.body.campName;
    var url = req.body.campUrl;
    var price = req.body.campPrice;
    var desc = req.body.description; 
    var author = {
        id: req.user._id,
        userName: req.user.username
    };
    
    console.log("This is desc " + desc );

Campground.create({
    name: name, 
    image: url,
    price: price,
    description: desc,
    author: author
}, function(err,campgrounds){
    if(err){
         console.log("Something went wrong with the DB");
         console.log(err)
    }
    else{
       console.log(campgrounds);
         res.redirect("/index");
    }
    });
});

//SHOW ROUTE - show info about one campground
router.get("/:id", function(req, res){
    var id = req.params.id;
    
    Campground.findById(id).populate("comments").exec(function(err, foundCampground){
            if(err || !foundCampground){
         console.log("Something went wrong with the DB");
         console.log(err);
         req.flash("error", "Restaurant not found");
         res.redirect("back");
    }
    else{
        res.render("show", {campground: foundCampground});
       // console.log(foundCampground);
    }
        })
        })
        

//UPDATE ROUTES        
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    var id = req.params.id;
    Campground.findById(id).populate("comments").exec(function(err, foundCampground){
        if(err){
            return res.redirect("back");
        }
        res.render("editCamp", {campground: foundCampground}); 
            })
});
    
    
        
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    var id = req.params.id;
    var data ={name: req.body.campName, image: req.body.campUrl, price: req.body.campPrice,
    description: req.body.description};
    Campground.findByIdAndUpdate(id, data, function(err, updatedCampground){
            if(err){
         console.log("Something went wrong with the DB");
         console.log(err)
    }
    else{
        
        res.redirect("/index/" + id);
      console.log(updatedCampground);
    }
        })
        })
        
        
//DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
   
    var id = req.params.id;
    Campground.findByIdAndRemove(id, function(err){
            if(err){
         console.log("Something went wrong with the DB");
         console.log(err)
    }
    else{
        
        res.redirect("/index");
      
    }
})
})

module.exports = router;