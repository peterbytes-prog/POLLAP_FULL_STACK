const express = require('express');
const bcrypt = require('bcrypt');
const expressSession = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
var passport = require('passport');

const category = require('./models/categories');

const authenticators = require("./middlewares/api/authenticate");

const app = express();
// global.loggedIn = null;
app.set('view engine', 'ejs');
// app.use(expressSession({
//   secret: 'pollapp123'
// }))
// app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded())
app.use(express.static('public'));

app.use(passport.initialize());
// app.use(passport.session());
global.loggedIn = false;
const userRouter = require('./routes/userRouter');
const pollRouter = require("./routes/pollRouter");

const apiUserRouter = require('./routes/apis/userRouter');
const apiPollRouter = require("./routes/apis/pollRouter");
const apiCategoryRouter = require("./routes/apis/categoryRouter");

function templates(name=null){
  let t = path.resolve(__dirname, 'templates');
  if(name){
    return path.resolve(t,name)
  }
  return t;
}

const connect = mongoose.connect(
  "mongodb://localhost/polldb", {useNewUrlParser:true}
);

app.listen(3000, ()=>{
  console.log("App Listening on port 3000");
});
app.get("/", (req, res)=>{
  console.log('home list');
  res.render('index');
});

app.use("/api/users", apiUserRouter);
app.use("/api/polls", apiPollRouter);
app.use("/api/categories", apiCategoryRouter);
app.use("/users", userRouter);
app.use("/polls", pollRouter);


module.exports = app;
