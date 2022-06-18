const User = require('./user');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required:true
  },

},{timestamps: true });
const Vote = mongoose.model("Vote", VoteSchema);

const ChoiceSchema = new Schema({
  choice_text: {
    type:String,
    required:true,
    minLength: [1,"Choice Character length must be cannot be empty"]
  },
  question:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Question",
    required: true
  },
  votes: [VoteSchema]
});

const Choice = mongoose.model('Choice', ChoiceSchema);


const QuestionSchema = new Schema({
    question_text:{
      type:String,
      required:true,
      minLength: [1,"Question Character length must be cannot be empty"]
    },
    category:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    }
},{timestamps: true });
QuestionSchema.pre('remove', function(next){

  Choice.deleteMany({question:this})
  .then((choices)=>{
    next();
  },(err)=>console.log(err))
});
const Question = mongoose.model('Question', QuestionSchema);


module.exports = {Choice, Question, Vote };
