const User = require('./user');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
  userid:{
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  },
  choiceid:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Choice"
  }
});
const Vote = mongoose.model("Vote", VoteSchema);

const ChoiceSchema = new Schema({
  choice_text: String,
  questionid:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Question"
  },
  votes: [VoteSchema]
});

const Choice = mongoose.model('Choice', ChoiceSchema);


const QuestionSchema = new Schema({
    question_text: String,
    userid:{
      type: mongoose.Schema.Types.ObjectId,
      ref: User
    },
    choices: [ChoiceSchema]
});
QuestionSchema.pre('remove', function(next){

  let _choices = this.choices.map((c)=> c._id);
  Choice.deleteMany({_id:{$in:_choices}})
  .then((choices)=>{
     Vote.deleteMany({choiceid:{$in:_choices}})
     .then((votes)=>next(), (err)=>console.log(err));
  },(err)=>console.log(err))
});
const Question = mongoose.model('Question', QuestionSchema);


module.exports = {Choice, Question, Vote };
