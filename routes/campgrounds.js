var express = require('express');
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index")

//Index route- homepage
router.get("/", function(req,res) {
	Campground.find({}, function(err, allCampgrounds) {
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/index",{campgrounds: allCampgrounds});	
		}
	});
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn , function(req, res) {
	//get data feom form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name:name, image:image, description:description, author: author, price:price};
	//Create new campground and add to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}else{
			res.redirect("/campgrounds");
		}
	});
});

//NEW - show form to create campground
router.get("/new", middleware.isLoggedIn, function(req,res) {
	res.render("campgrounds/new")
});

//SHOW - shows more info about ine campground
router.get("/:id", function(req, res) {
	//find campground will given ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
		if(err){
			console.log(err);
		}else{
			//render that particular campground
			res.render("campgrounds/show", {campground: foundCampground});	
		}
	});
});

//EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership ,function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		res.render("campgrounds/edit", {campground : foundCampground});
	});
});

//UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership , function(req, res) {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground ,function(err, updatedCampground) {
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership ,function(req,res) {
	Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if (err) {
            console.log(err);
        }
        Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {	//also remove related comments
            if (err) {
                console.log(err);
            }
            res.redirect("/campgrounds");
        });
    });
});

module.exports = router;