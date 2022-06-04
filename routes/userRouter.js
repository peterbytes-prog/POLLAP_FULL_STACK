const express = require('express');
const router =  express.Router();
const authenticators = require('../middlewares/authenticate');
const User = require("../models/user.js");

// const mongoose = require('mongoose');
//
// const connect = mongoose.connect(
//   "mongodb://localhost/polldb", {useNewUrlParser:true}
// );

router.get("/", async (req, res)=>{
  console.log("User List");
  const users = await User.find({});
  res.render('users/list', { users });
});

router.get("/login", async (req, res)=>{
  const users = await User.find({});
  const username = req.username || "";
  const password = req.password || "";
  res.render('users/login', { username, password });
});
router.post("/login", async (req, res)=>{
  const users = await User.find({});
  const username = req.body.username || "";
  const password = req.body.password || "";

  User.findOne({username:username, password:password})
  .then((user)=>{
    if(user){
      req.session.userId = user.id;
      res.redirect('/');
    }else{
      res.render('users/login', { username, password });
    }

  }, (err)=>{
    res.render('users/login', { username, password });
  })
});

router.get("/logout", async (req, res)=>{
  req.session.destroy(()=>res.redirect('/'));
});

router.get("/create", (req, res)=>{
  res.render('users/create', {user:{}});
})

router.post("/create", async (req, res)=>{
  const data = {};
  data.email = req.body.email;
  data.username = req.body.username;
  data.password = req.body.password1;
  data.gender = req.body.gender;
  data.firstname = req.body.firstname;
  data.lastname = req.body.lastname;
  data.age = req.body.age;
  if ((data.username)
      && (req.body.password1)
      && (req.body.password1 === req.body.password2)
    ){
      await User.create(data, (error, user)=>{
        if(error!==null){
          console.log(error);
        }else{
          console.log(user);
        }
      })
    }
  res.redirect('/users');
})

router.get("/edit/:id", async (req, res)=>{
  const user = await User.findById(req.params.id);
  res.render('users/edit', { user });
})
router.post("/edit/:id", async (req, res)=>{
  let verified = false;
  const data = {};
  data.email = req.body.email;
  data.username = req.body.username;
  data.gender = req.body.gender;
  data.firstname = req.body.firstname;
  data.lastname = req.body.lastname;
  data.age = req.body.age;
  if (
      (data.email)
      && (data.username)
    ){
      verified = true;
    }
  if (verified){
    const user = await User.findByIdAndUpdate(req.params.id, {$set:data});
  res.redirect('/users');
  }
});

router.get('/delete/:id', async (req, res)=>{
  const user = await User.findById(req.params.id);

  res.render('users/delete', {user});

  // res.redirect('/users');
})

router.post('/delete/:id', async (req, res)=>{
  const user = await User.findById(req.params.id);
  if ((req.body.delete=='delete')){
    await User.findByIdAndDelete(req.params.id);
  }
  res.redirect('/users');
})

module.exports = router;
