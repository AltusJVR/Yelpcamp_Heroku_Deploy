const Campground = require("../models/campground")
const Comment = require("../models/comment")


// All Middleware here

let middlewareObj = {};

middlewareObj.checkCampgroundOwner = function (req, res, next) {
  // Is user logged in
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function (err, foundCampground) {
      if (err) {
        console.log(err);
        req.flash('error', 'Camprround not found!')
        res.redirect('back')
      } else {
        if (!foundCampground) {
          req.flash('error', 'Campground not found!');
          req.redirect('back')
        }
        // if logged in, does user own campground
        if (foundCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          // req.flash('error', "You don't have permission to do that")
          res.redirect('back')
        }
      }
    });
  } else {
    req.flash('error', 'You need to be logged in to do that!')
    res.redirect('/login')
  }
}

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You need to be logged in!')
  res.redirect("/login");
};

middlewareObj.checkCommentOwner = function (req, res, next) {
  // Is user logged in
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        res.redirect('back');
      } else {
        // if logged in, does user own comment
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', "You don't have permission to do that")
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'You need to be logged in to do that!')
    res.redirect('back');
  }
}



module.exports = middlewareObj;