var express         = require("express");
var Campground      = require("./models/campground");
var Comment         = require("./models/comment");
var seedDB          = require("./seeds");
var methodOverride  = require("method-override");
var flash           = require("connect-flash");
var passport              = require("passport"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
var app = express();
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set('view engine', 'ejs');
var bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
var mongoose=require("mongoose");
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });

var campgroundRoutes = require("./routes/campgrounds"),
    commentsRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index");

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Harry Potter Lord of the Ring srings",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    var auser=req.user;
    res.locals.user=auser;
    res.locals.error= req.flash("error");
    res.locals.success= req.flash("success");
    next();
});

//seedDB();


app.use("/index", campgroundRoutes);
app.use("/index/:id/comments", commentsRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server has started.");
});