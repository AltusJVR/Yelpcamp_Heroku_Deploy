const express = require("express");
const router = express.Router({ mergeParams: true });

const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require('../middleware')

// New comment form
router.get("/new", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      res.redirect("/campgrounds/:id")
    } else {
      res.render("comments/new", { campground: campground })
    }
  })
});

// New comment create
router.post("/", middleware.isLoggedIn, function (req, res) {
  // Find Campground by id
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      req.flash('error', "Something went wrong!")
      console.log(err);
      res.redirect("back");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash('error', "Something went wrong!")
          res.redirect("back");
        } else {
          // add username and to id
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          // Associate comments with campground
          campground.comments.push(comment);
          // add new comments to campground
          campground.save();
          // Redirect to show page for campground
          req.flash('success', 'Sucessfully created comment!')
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

// ======== Comment Edit ========
router.get('/:comment_id/edit', middleware.checkCommentOwner, function (req, res) {
  Comment.findById(req.params.comment_id, function (err, foundComment) {
    if (err) {
      console.log(err)
      res.redirect('back')
    } else {
      res.render('comments/edit', { campground_id: req.params.id, comment: foundComment });
    }
  });
});

// Comment Update
router.put('/:comment_id', middleware.checkCommentOwner, function (req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
    if (err) {
      console.log(err)
      res.redirect("back");
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

// ====== Comment Delete ========

router.delete('/:comment_id', middleware.checkCommentOwner, function (req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function (err, dComment) {
    if (err) {
      console.log(err);
      res.redirect('back')
    } else {
      Campground.findByIdAndUpdate(req.params.id, { $pull: { comments: dComment.id } }, function (err) {
        if (err) {
          req.flash('Something went wrong!')
          console.log(err);
        } else {
          req.flash('success', 'Comment deleted!')
          res.redirect('/campgrounds/' + req.params.id);
        }
      });
    }
  })
})


module.exports = router;