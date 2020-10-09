//jshint -W033, esversion:6
//f init code
require('dotenv').config()
const express = require("express")
const bodyParser = require('body-parser')
const ejs = require("ejs")
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')

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

var secret = process.env.SECRET

userSchema.plugin(encrypt, {secret:secret, encryptedFields:['password']})

const User = new mongoose.model("User", userSchema)

app.get("/", (req, res)=>{
  res.render('home', {})
})

app.get("/login", (req, res)=>{
  res.render('login', {})
})

app.get("/register", (req, res)=>{
  res.render('register', {})
})

app.post("/register", (req, res)=>{
  var newUser = new User({
    username:req.body.username,
    password:req.body.password
  })
  newUser.save((err)=>{
    if(!err){
      res.render("secrets")
    }
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
      if (found.password==req.body.password) {
        res.render('secrets')
      }else {
        res.send("<h1>You are unauthorised</h1>")
      }
    }
  })
})

//f server started
app.listen(process.env.PORT || 3000, function(){
  console.log("Server started successfully(3000)");
})
///f server started