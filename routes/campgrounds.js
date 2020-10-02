const express = require("express");
const router = express.Router();

const Campground = require("../models/campground")
const Comment = require("../models/comment")
const middleware = require('../middleware')
const multer = require('multer');
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (result) {
    // add cloudinary url for the image to the campground object under image property
    req.body.campground.image = result.secure_url;
    // add author to campground
    req.body.campground.author = {
      id: req.user._id,
      username: req.user.username
    }
    Campground.create(req.body.campground, function (err, campground) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/campgrounds/' + campground.id);
    });
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