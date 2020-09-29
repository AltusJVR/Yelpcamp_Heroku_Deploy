const express = require("express");
const router = express.Router();

const passport = require("passport");
const User = require("../models/user")

// Route to landing page - HOME
router.get("/", function (req, res) {
  res.render("landing");
});

// Sign up form
router.get("/register", function (req, res) {
  res.render("register");
});

// Create new user
router.post("/register", function (req, res) {
  var newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      req.flash('error', err.message)

      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function () {
      req.flash('success', 'Welcome ' + user.username)
      res.redirect("/campgrounds");
    });
  });
});

//====================Login Routes=====================
// Show login form
router.get("/login", function (req, res) {
  res.render("login");
});

// handle user login
router.post("/login", function (req, res, next) {
  passport.authenticate("local",
    {
      successRedirect: "/campgrounds",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: "Welcome Back " + req.body.username + "!"
    })(req, res);
});
//====================Logout route=====================
router.get("/logout", function (req, res) {
  req.logOut();
  req.flash('success', 'Logout Successful!')
  res.redirect("/campgrounds");
});

module.exports = router;