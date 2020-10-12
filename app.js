var express 		= require("express"),
	app 			= express(),
	bodyParser 		= require("body-parser"),
	mongoose 		= require('mongoose'),
	passport 		= require('passport'),
	localStrategy 	= require('passport-local'),
	methodOverride  = require('method-override'),
	flash			= require('connect-flash'),
	Campground  	= require('./models/campground'),
	Comment 		= require('./models/comment'),
	User 			= require("./models/user"),
	seedDB 			= require('./seeds');

//requiring routes
var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index");


//mongoose connection for local machine (goorm ide)

//var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp";
mongoose.connect("mongodb+srv://audarya:Shamala@2020@cluster0.0k4ic.mongodb.net/yelp_camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());
//seedDB();		//sedd the DB

//PASSPORT CONFIG
app.use(require('express-session')({
	secret: 'Rusty is the best',
	resave:false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res,next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


//SERVER STARTING
app.listen(process.env.PORT || 3000, function() {
	console.log("Yelp camp server has started");
});