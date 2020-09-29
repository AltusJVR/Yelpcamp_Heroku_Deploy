const express = require("express");
const router = express.Router();

const Campground = require("../models/campground")
const Comment = require("../models/comment")
const middleware = require('../middleware')

// =====================Route to all campgrounds - INDEX=======================
router.get("/", function (req, res) {
  req.user
  // get all campgrounds from db
  Campground.find({}, function (err, allCampgrounds) {
    if (err) {
      console.log(err)
    } else {
      res.render("campgrounds/index", { campgrounds: allCampgrounds });
    }
  });
});

// ====================Create new campground POST route========================
router.post("/", middleware.isLoggedIn, function (req, res) {
  // Get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var price = req.body.price;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newCampground = { name: name, image: image, description: desc, author: author, price: price };
  // Create a new campground and save to DB
  Campground.create(newCampground, function (err, newlyCreated) {
    if (err) {
      console.log(err)
    } else {
      // redirect back to camprounds page
      res.redirect("/campgrounds");
    }
  });
});

// ================New campground form================
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new.ejs")
});

// =====================The order of this is important==================
// SHOW - Shows more info about the campground, likes, comments, rating etc
router.get("/:id", function (req, res) {
  Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
    if (err) {
      console.log(err);
    } else {
      if (!foundCampground) {
        req.flash('error', 'Campground not found!');
        res.redirect('back')
      }
      res.render("campgrounds/show", { campground: foundCampground });
    }
  });
});

// ======== Edit Route ========

router.get('/:id/edit', middleware.checkCampgroundOwner, function (req, res) {
  Campground.findById(req.params.id, function (err, foundCampground) {
    if (err) {
      req.flash('error', "Campground not found!")
      res.redirect('/:id');
    } else {
      res.render('campgrounds/edit', { campground: foundCampground });
    }
  });
});



// ======== Update Route ========

router.put('/:id', middleware.checkCampgroundOwner, function (req, res) {
  // find and update
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      // Redirect
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

// ======== Delete =======
router.delete('/:id', middleware.checkCampgroundOwner, function (req, res) {
  Campground.findByIdAndDelete(req.params.id, function (err, removedCampground) {
    if (err) {
      req.flash('error', 'Something went wrong!')
      res.redirect('/campgrounds');
    }
    Comment.deleteMany({ _id: { $in: removedCampground.comments } }, function (err) {
      if (err) {
        req.flash('error', 'Something went wrong!')
        console.log(err)
      }
      req.flash('success', 'Campground deleted!')
      res.redirect('/campgrounds');
    })
  })
});

module.exports = router;