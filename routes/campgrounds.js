var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//UPLOAD FILES FUNCTIONALITY
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.API_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


//INDEX ROUTE - show all campgrounds
router.get("/", function(req, res) {

    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log("Something went wrong with the DB");
            console.log(err)
        }
        else {
            res.render("index", { campgrounds: allCampgrounds });
        }
    });

})
// NEW ROUTE - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("new");
})

//CREATE ROUTE add new campground to the DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {

    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.image = result.secure_url;
        req.body.image_id = result.public_id;

        var image_id = req.body.image_id;
        var name = req.body.campName;
        var url = req.body.image;
        var price = req.body.campPrice;
        var desc = req.body.description;
        var author = {
            id: req.user._id,
            userName: req.user.username
        };

        console.log("This is desc " + desc);

        Campground.create({
            name: name,
            image: url,
            image_id: image_id,
            price: price,
            description: desc,
            author: author
        }, function(err, campgrounds) {
            if (err) {
                console.log("Something went wrong with the DB");
                console.log(err)
            }
            else {
                console.log(campgrounds);
                res.redirect("/index");
            }
        });

    });


});

//SHOW ROUTE - show info about one campground
router.get("/:id", function(req, res) {
    var id = req.params.id;

    Campground.findById(id).populate("comments").exec(function(err, foundCampground) {
        if (err || !foundCampground) {
            console.log("Something went wrong with the DB");
            console.log(err);
            req.flash("error", "Restaurant not found");
            res.redirect("back");
        }
        else {
            res.render("show", { campground: foundCampground });
            // console.log(foundCampground);
        }
    })
})


//UPDATE ROUTES        
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    var id = req.params.id;
    Campground.findById(id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            return res.redirect("back");
        }
        res.render("editCamp", { campground: foundCampground });
    })
});



router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res) {

    var id = req.params.id;
    // var data ={name: req.body.campName, image: req.body.campUrl, price: req.body.campPrice,
    // description: req.body.description};

    Campground.findById(id, async function(err, updatedCampground) {
        if (err) {
            console.log("Something went wrong with the DB");
            console.log(err)
        }
        else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(updatedCampground.image_id);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    updatedCampground.image_id = result.public_id;
                    updatedCampground.image = result.secure_url;
                }

                catch (err) {
                    console.log(err);
                    req.flash("error", "Restaurant not found");
                    res.redirect("back");
                }
            }
        }
        if (req.body.campName) {
            updatedCampground.name = req.body.campName;
        }
        if (req.body.description) {
            updatedCampground.description = req.body.description;
        }
        updatedCampground.save();
        req.flash("success", "Successefullu updated restaurant");
        res.redirect("/index/" + id);
        console.log(updatedCampground);
    })
})



//DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    var id = req.params.id;
  
    Campground.findById(id, async function(err, updatedCampground) {
        if (err) {
            console.log("Something went wrong with the DB");
            console.log(err);
        }
        else {
            try{
                await cloudinary.v2.uploader.destroy(updatedCampground.image_id);
                updatedCampground.remove();
                req.flash("success", "Restaurant successefully deleted.");
                res.redirect("/index");
            }
            catch(err){
                console.log("Something went wrong with the DB. cant delete restaurant!");
                console.log(err);
                req.flash("error", "Error deleting the restaurant.");
                return res.redirect("back")
            }
            

        }
    })
})






module.exports = router;