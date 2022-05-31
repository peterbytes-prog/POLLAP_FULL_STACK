const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.set('view engine', 'ejs');

const userRouter = require('./routes/userRouter');

function templates(name=null){
  let t = path.resolve(__dirname, 'templates');
  if(name){
    return path.resolve(t,name)
  }
  return t;
}
app.use(express.json());
app.use(express.urlencoded())
app.use(express.static('public'));

app.listen(3000, ()=>{
  console.log("App Listening on port 3000");
});
app.get("/", (req, res)=>{
  res.render('index');
});
app.use("/users", userRouter);
app.get("/create", (req, res)=>{
  res.render('create');
});
