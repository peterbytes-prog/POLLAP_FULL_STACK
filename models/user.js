const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  // username: {
  //             type: String,
  //             required:true,
  //             unique:true
  //           },
  // password: {
  //             type: String,
  //             required:true
  //           },
  // firstname:String,
  // lastname:String,
  // age: Number,
  // gender:{
  //     type:String,
  //     enum:['Male', 'Female']
  // },
  admin: {
    type:Boolean,
    default: false
  },
  email: {
            type:String,
            required:false,
            unique:false
          }
});
UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', UserSchema);

module.exports = User;
