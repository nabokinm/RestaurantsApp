var express=require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res){
    res.render("landing");
    
});

//AUTH ROUTES
//show registration form
router.get("/register", function(req,res){
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    var password = req.body.password;
    User.register(newUser, password, function(err, user){
        if(err){
         console.log("Something went wrong with creation of the new user");
         console.log(err);
         req.flash("error", err.message);
         return res.redirect("/register");
    }
        else{
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to Foody " + user.username);
                res.redirect("index");
            });
        }
    });
});

//LOGIN ROUTES
//show login form
router.get("/login", function(req,res){
    res.render("login");
});

router.post("/login", 
    passport.authenticate("local", 
    {successRedirect: "/index",
    failureRedirect: "login"}), 
function (req, res){
   
    
});

//LOGOUT ROUTES
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/");
});   


module.exports = router;