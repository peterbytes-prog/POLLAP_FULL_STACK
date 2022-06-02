const express = require('express');
const { Choice, Question, Vote } = require('../models/poll');
const util = require('util')
const User = require('../models/user');
const router = express.Router();

router.get('/', async (req, res)=>{
  const questions = Question.find({}).populate('choices').populate('choices.votes');

  questions.then(async (questions)=>{
    for(let q in questions){
      let q_vote_count = 0;
      for(let choice of questions[q].choices){
        q_vote_count+=choice.votes.length;
      }
      questions[q].votes_count = q_vote_count;
    }
    res.render('polls/list', {questions});
  }, (err)=>{console.log(err)})
  .catch((err)=>{console.log(err)})

});


router.get('/delete/:id', async (req, res)=>{
  const question =  Question.findById(req.params.id).populate('choices');

  question.then(async(question)=>{
      let q_vote_count = 0;
      for(let choice of question.choices){
        q_vote_count+=choice.votes.length
      }
      question.votes_count = q_vote_count;
      res.render('polls/delete', {question});
  }, (err)=>{console.log(err)})
  .catch((err)=>{console.log(err)})

});

router.post('/delete/:id', async (req, res)=>{
  const question =  Question.findById(req.params.id);
  question.then(async(question)=>{
      question.remove()
      .then((question)=>{
        res.redirect('/polls');
      }, (err)=>console.log(err))

  }, (err)=>{console.log(err)})
  .catch((err)=>{console.log(err)})

});


router
.get('/edit/:id', async (req, res)=>{
  const question = await Question.findById(req.params.id).populate('choices');
  // const choices = await Choice.find({questionid:req.params.id}).populate('votes');
  res.render('polls/edit', { question })
});
router.post('/edit/:id', async (req, res)=>{

  console.log(req.body);
  const question = await Question.findById(req.params.id).populate('choices');
  let to_remove = [];
  let query = [];
  query.push({
    updateOne:{
      filter:{id:question.id},
      update:{question_text:req.body.question_text}
    }
  });
  for(let choice of question.choices)
    {
      if(req.body[choice.id])
      {
          let opt = false;
          opt = {
                        updateOne:{
                                    "filter": {id:req.params.id},
                                    'update': {"choices.$[e].choice_text":req.body[choice.id]},
                                    "arrayFilters":[{'e._id':choice._id}]
                                  }
                        }
          if(opt){query.push(opt)}
      }else{
        to_remove.push(choice.id);
      }
    }
  Question.bulkWrite(query)
  .then(async (response)=>{
    const question = await Question.findById(req.params.id).populate('choices');
    let update = false;
    req.body.choice_text = req.body.choice_text || [];
    for(let nw_choice of req.body.choice_text){
      if(nw_choice.length >=1){
        let choice_data = {
          choice_text: nw_choice,
          questionid: question._id
        }
        update = true;
        question.choices.push(choice_data);
      }

    }
    for(let choiceid of to_remove){
      question.choices.id(choiceid).remove();
      update = true;
    }
    if(update){
      question.save()
      .then((question)=>{
        res.render('polls/edit', { question })
      }, (err)=>console.error(err))
    }else{
      res.render('polls/edit', { question })
    }
  }, (err)=>{console.log(err)});

})




router.get('/details/:id', async (req, res)=>{
  const question = await Question.findById(req.params.id).populate('choices');
  const choices = await Choice.find({questionid:req.params.id}).populate('votes');
  res.render('polls/detail', { question })
});
router.post('/details/:id', async (req, res)=>{
  const user = await User.findOne({username:"udosamuel"});
  let v = {
            userid:user._id,
            choiceid:req.body.choice
          };
  const question = Question.update(
    {_id:req.params.id},
    {
        $addToSet:{
          'choices.$[e].votes':v
        },

    },
    { arrayFilters: [ { 'e._id': req.body.choice } ], multi: true }
  )
  .then(
          (question) => { res.redirect(`/polls/details/${req.params.id}`)},
          (err) => {
                      console.log(err);
                  }
  )
  .catch((err) => console.log(err) )

});


router.get('/create',(req, res)=>{
    res.render('polls/create');
});

router.post('/create',async (req, res)=>{
    let q = req.body.question_text || "";
    if(q.length >=3 ){
      const question = Question.create(req.body);
      question
      .then((question)=>{
        let choice_objects = []
        for(let c of req.body.choice_text){
          if(c.length<1){
            continue
          }
          let choice_data = {
            choice_text: c,
            questionid: question._id
          }
          // choice_objects.push(choice_data);
          question.choices.addToSet(choice_data)
        };

        question.save()
        .then((question)=>{
          res.redirect('/polls');
        }, (err)=>{console.log(err)})
      })
      .catch((err)=>{
        console.log(err);
      })
    }
});

module.exports = router;
