//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
});

///////////////Level 2/////////////////////
//const secret = "ThisisourLittlesecret";
userSchema.plugin(encrypt, {secret : process.env.SECRET, encryptedFields:['password']});

const User = new mongoose.model("User", userSchema);

app.get("/" , function(req,res){
  res.render("home");
});

app.get("/login" , function(req,res){
  res.render("login");
});

app.get("/register" , function(req,res){
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save()
    .then(() => {
      res.render("secrets");
    })
    .catch(err => {
      console.error(err);
      // Handle the error appropriately, such as sending an error response
      res.status(500).send("Error saving user");
    });
});

// app.post ("/Login" , function(req,res) {
//   const username =  req.body.username;
//   const password = req.body.password;
//
//   User.findOne ({email: username} , function(err , foundUser) {
//     if(err){
//       console.log(err);
//     } else {
//       if (foundUser) {
//         if (foundUser.password === password){
//           res.render ("secrets");
//         }
//       }
//     }
//   });
// });
app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }).exec()
    .then(foundUser => {
      if (!foundUser) {
        // User not found, handle appropriately
        return res.status(404).send("User not found");
      }
      // Compare passwords securely
      if (foundUser.password === password) {
        // Passwords match, render secrets page
        return res.render("secrets");
      } else {
        // Passwords don't match
        return res.status(401).send("Incorrect Password");
      }
    })
    .catch(err => {
      console.error(err);
      // Handle other errors
      return res.status(500).send("Internal Server Error");
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
