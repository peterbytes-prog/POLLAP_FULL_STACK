const User = require("../../models/user.js");
const { Choice, Question, Vote } = require('../../models/poll');

const mongoose = require('mongoose');

// const connect = mongoose.connect(
//   "mongodb://localhost/polldb", {useNewUrlParser:true}
// );

function loginRequired(req, res, next){
  let authHeader = req.headers.authorization;
  if(!authHeader){
    var err = new Error('You are not authenticated');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
  }
  let auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
  var user= auth[0];
  var psw = auth[1];
  User.findOne({username:user, password:psw}, (err, user)=>{
    if(err||!user){
      var err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }else{
      req.user = user;
      return next()
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
