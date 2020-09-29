// ==================import dependances=====================
const express = require('express');
const app = express();
var port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const Campground = require("./models/campground")
const Comment = require("./models/comment")
const seedDB = require("./seeds")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const methodOverride = require('method-override');
const flash = require('connect-flash');

// ====================Routes require====================
const commentRoutes = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");
const indexRoutes = require("./routes/index");

// ===============Connect mongoose to the mongodb===================
const mongoose = require('mongoose');


function setDb(url) {
  if (process.env.USERDOMAIN === 'ALTUSLAPTOP') {
    console.log("Correct ENV")
    const localDB = 'mongodb://localhost/yelpcamp_deployed'
    const url = process.env.DATABASEURL || localDB;
    return url;
  } else {
    console.log('hosted ENV');
    // for testing!!!!!console.log(process.env.DATABASEURL)
    return url = process.env.DATABASEURL;
  }
}


// ======== Mongoose Connect ========
console.log(process.env.USERDOMAIN)
mongoose.connect(setDb(), {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to DB!'))
  .catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
// const { static } = require('express');
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());

// ======== Uses the currentuser data in all routes ========
// app.use(function (req, res, next) {
//   res.locals.currentUser = req.user;

//   next();
// });
// seedDB();

// ================================passport config==========================
app.use(require("express-session")({
  secret: "Nina is a very cute cat!",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// ====================Routes import ==========================
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

// ===================Server start=============
app.listen(port, function () {
  console.log("Server listening on port " + port)
});