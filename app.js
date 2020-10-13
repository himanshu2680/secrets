//jshint -W033, esversion:6, -W112
//f require
require('dotenv').config()
const express = require("express")
const bodyParser = require('body-parser')
const ejs = require("ejs")
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const findOrCreate = require('mongoose-findorcreate')
const app = express()
///f require

//f app.use and app.set

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
///f app use and app set

//f mongoose config
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false})

const userSchema = new mongoose.Schema({
  username:String,
  password:String,
  googleId: String,
  secret: String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User", userSchema)
///f mongoose config

//f passport+google config
passport.use(User.createStrategy())

passport.serializeUser(function(user, done) {done(null, user.id)})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user)
  })
})

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID ,
    clientSecret: process.env.CLIENT_SECRET ,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user)
    })
  }
))
///f passport config

app.get("/", (req, res)=>{
  res.render('home', {})
})


app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))


app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets')
  }
)


app.get("/submit", (req, res)=>{
  if (req.isAuthenticated()) {
    res.render("submit")
  }else {
    res.redirect("/login")
  }
})

app.post("/submit", (req, res)=>{
  var secret = req.body.secret
  User.findById(req.user._id, (err, foundUser)=>{
    if (err) {
      console.log(err);
    }else {
      if (foundUser) {
        foundUser.secret = secret
        foundUser.save((err, saved) => {if(saved && !err){res.redirect("/secrets")}})
      }
    }
  })
})


app.get("/login", (req, res)=>{
  res.render('login')
})

app.post("/login", (req, res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password
  })
  req.login(user, (err)=>{
    if (err) {
      console.log(err)
    }else{
      passport.authenticate("local")(req, res, ()=>{
        res.redirect("/secrets")
      })
    }
  })
})


app.get("/register", (req, res)=>{
  res.render('register', {})
})

app.post("/register", (req, res)=>{
  
  User.register({username:req.body.username}, req.body.password, function(err, user) {
    if (err) { 
      console.log(err)
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req, res, ()=>{
        res.redirect('/secrets')
      })
    }
  })
})


app.get("/secrets", (req, res)=>{
  User.find({"secret": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
})


app.get("/logout", (req, res)=>{
  req.logout()
  res.redirect("/")
})

//f server started
app.listen(process.env.PORT || 3000, function(){
  console.log("Server started successfully(3000)")
})
///f server started