const User = require("../../models/user.js");
const config = require("../../config");
const { Choice, Question, Vote } = require('../../models/poll');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken = (user)=>{
  return jwt.sign(user, config.secretKey, {expiresIn: 3600000})
}
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done)=>{

  User.findOne({_id:jwt_payload._id}, (err, user)=>{
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
  })
})



}))

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyOwner = (req, res, next) => {
  Question.findById(req.params.pollId)
  .then((question)=>{
    req.poll = question
    if((req.poll.user._id).toString()!==req.user._id.toString()){
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json');
      return res.json({'message': 'Unauthorize to edit poll information'})
    }
    return next()
  }, (err)=>{
      return _404Error(req,res, err);
  })
  .catch((err) => {
      return _404Error(req,res, err);
  })
}
