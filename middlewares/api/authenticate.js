const User = require("../../models/user.js");
const { Choice, Question, Vote } = require('../../models/poll');

const mongoose = require('mongoose');

// const connect = mongoose.connect(
//   "mongodb://localhost/polldb", {useNewUrlParser:true}
// );

function loginRequired(req, res, next){
  User.findById(req.body.userId, (err, user)=>{
    if(err||!user){
      res.writeHead(401)
      res.end("Invalid Authentication");
    }else{
      req.user = user;
      next()
    }
  })
}

function isPollOwner(req, res, next){
  Question.findById(req.params.id, (err,poll)=>{
    if(err || !poll || !req.session.userId){
      res.redirect('/polls');
    }else if (poll.userid == req.session.userId) {
      next();
    }else{
      res.redirect('/polls');
    }

  })
}
module.exports = {loginRequired, isPollOwner }
