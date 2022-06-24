const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProfileSchema = new Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title:{
    type: String,
    default:'Not Just Your Average Earthling!'
  },
  about:{
    type: String,
    default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'
  },
  image:{
    type:String,
    default:'/images/profiles/default_profile.jpg'
  },
  backgroundImage:{
    type:String,
    default:'/images/profiles/default_background.jpg'
  },
  fullname: String,
  gender: {
    type: String,
    enum: ['M', 'F','Other'],
    default: 'Other'
  },
  age: Number
})
const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
