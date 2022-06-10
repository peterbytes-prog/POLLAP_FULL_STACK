const express = require('express');
const { Choice, Question, Vote } = require('../../models/poll');
const authenticators = require("../../middlewares/api/authenticate");
const util = require('util')
const User = require('../../models/user');
const router = express.Router();

router.get('/', (req, res)=>{
  const questions = Question.find({}).populate('choices').populate('choices.votes');

  questions.then(async (questions)=>{
    for(let q in questions){
      let q_vote_count = 0;
      for(let choice of questions[q].choices){
        q_vote_count+=choice.votes.length;
      }
      questions[q].votes_count = q_vote_count;
    }
    res.json({questions});
  }, (err)=>{
              res.writeHead(500);
              res.end('Internal Error '+error);
            })
  .catch((err)=>{
    res.writeHead(500)
    res.end('Internal Error '+error);
  })

});
router.put('/', async(req, res)=>{
  res.writeHead(405);
  res.end("Delete Not Allow");
})
router.delete('/', async(req, res)=>{
  res.writeHead(405);
  res.end("Delete Not Allow");
})
router.post('/',authenticators.loginRequired, (req, res)=>{
    let q = req.body.question_text || "";
    req.body.userid = req.user;
    if(q.length >=3 ){
      let _choices = req.body.choice_text || []
      if(_choices.length<2){
        res.writeHead(400)
        return res.end('choice_text[] must be provide and lenth greater than one')
      }
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
          question.choices.addToSet(choice_data)
        };

        question.save()
        .then((question)=>{
          return res.json({question})
        }, (err)=>{console.log(err)})
      })
      .catch((err)=>{
        console.log(err);
      })
    }
    else{
      res.writeHead(400)
      res.end('question text must be greater than 3')
    }
});

router.get('/:id', (req, res)=>{
  Question.findById(req.params.id, (err, question)=>{
    if(err){
      res.writeHead(500)
      return res.end("Error "+ err.message)
    }
    return res.json({ question })
  })
})
router.put('/:id', authenticators.loginRequired, (req, res)=>{
  const to_remove = req.body.delete_choices || [];
  Question.findById(req.params.id, (err, question)=>{
    if(err){
      res.writeHead(500);
      return res.end("Error: "+err.message)
    }else if(!question){
      res.writeHead(400)
      return res.end("Poll macthing query does not exist")
    }else if(!question.userid.equals(req.user._id)){
      res.writeHead(401)
      return res.end("The Poll edit is unauthorize by non creator")
    }else{
        let query = [];
        if(req.body.question_text){
          query.push({
            updateOne:{
              filter:{id:question.id},
              update:{question_text:req.body.question_text}
            }
          });
        }

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
              return res.send({ question })
            }, (err)=>{
              res.writeHead(400)
              return res.end('Error '+ err.message)
            })
          }else{
            return res.send({ question })
          }
        }, (err)=>{
          res.writeHead(400)
          return res.end('Error '+ err.message)
        });

    }
  })
})
router.post('/:id', authenticators.loginRequired, (req, res)=>{
  v = {
    userid:req.user,
    choiceid: req.body.choice_id
  }
  Question.updateOne(
    {_id:req.params.id},
    {
      $addToSet:{
        'choices.$[e].votes':v
      }
    },
    {arrayFilters: [ {'e._id':req.body.choice_id} ], multi: true }
  ).then((question)=>{
    Question.findById(req.params.id,(err, question)=>{
      if(err){
        res.writeHead(500);
        return res.end("Error: "+err.message)
      }else{
        res.send({question})
      }
    })
  }, (err)=>{
      res.writeHead(500);
      return res.end("Error: "+err.message)
    })
  .catch((err)=>{
    res.writeHead(500);
    return res.end("Error: "+err.message)
  })
})
router.delete('/:id', authenticators.loginRequired, (req, res)=>{

  Question.findById(req.params.id, (err, question)=>{

    if(err){
      res.writeHead(500);
      return res.end("Error: "+err.message)
    }else if(!question){
      res.writeHead(400)
      return res.end("Poll macthing query does not exist")
    }else if(!question.userid.equals(req.user._id)){
      res.writeHead(401)
      return res.end("The Poll edit is unauthorize by non creator")
    }else{
        Question.findByIdAndRemove(req.params.id, (err, q)=>{
          if(err){
            res.writeHead(500);
            return res.end("Error: "+err.message)
          }else{
            return res.send({ q })
          }

        });
    }
  })
})

module.exports = router;
