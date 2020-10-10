//jshint -W033, esversion:6
//f init code
// require('dotenv').config()
const express = require("express")
const bodyParser = require('body-parser')
const ejs = require("ejs")
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
// const encrypt = require('mongoose-encryption')
// const md5 = require('md5');
const app = express()

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
  extended: true
}))

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false})
///f init code

const userSchema = new mongoose.Schema({
  username:String,
  password:String
})

// var secret = process.env.SECRET
// userSchema.plugin(encrypt, {secret:secret, encryptedFields:['password']})

const User = new mongoose.model("User", userSchema)

app.get("/", (req, res)=>{
  res.render('home', {})
})

app.get("/login", (req, res)=>{
  res.render('login', {noMatch:null})
})

app.get("/register", (req, res)=>{
  res.render('register', {})
})

app.post("/register", (req, res)=>{
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    var newUser = new User({
      username:req.body.username,
      password:hash
    })
    newUser.save((err)=>{
      if(!err){
        res.render("secrets")
      }
    })    
  })  
})

app.get("/logout", (req, res)=>{
  res.redirect("/")
})

app.post("/login", (req, res)=>{
  User.findOne({username:req.body.username}, (err, found)=>{
    if (err) {
      console.log(err);
    }else {
      bcrypt.compare(req.body.password, found.password, function(err, result) {
        if (result===true) {
          res.render("secrets")
        }else if(result==false){
          res.render("login", {noMatch:"Username and password do not match"})
        }
      })
    }
  })
})
// res.send("<h1>You are unauthorised</h1>")

//f server started
app.listen(process.env.PORT || 3000, function(){
  console.log("Server started successfully(3000)");
})
///f server started