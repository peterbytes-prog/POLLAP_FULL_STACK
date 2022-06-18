const express = require('express');
var ObjectId = require('mongodb').ObjectID;
const { Choice, Question, Vote } = require('../../models/poll');
const authenticate = require("../../middlewares/api/authenticate");
const util = require('util')
const User = require('../../models/user');
const _404Error = require('../../components/responses/404Error');



const router = express.Router();
router.route('/')
.get((req, res)=>{
  Question.find({}).populate('category')
  .then((questions)=>{
    Promise.all(questions.map( async (question)=>{
      const choices = await Choice.find({ question:question })
      return {...question._doc, 'choices':choices}
    }))
    .then((data)=>{
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json');
      return res.json(data)
    }, (err)=>{
      return _404Error(req,res, err);
    })
    .catch((err)=>{
      return _404Error(req,res, err);
    })
  }, (err)=>{
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })

})
.put((req, res)=>{

  res.writeHead(405);
  res.end("METHOD_NOT_ALLOWED");
})
.delete(async(req, res)=>{
  res.writeHead(405);
  res.end("METHOD_NOT_ALLOWED");
})
.post(authenticate.verifyUser, (req, res)=>{
    req.body.user = req.user;
    Question.create(req.body)
    .then((new_question)=>{
        if(req.body.choices && (req.body.choices.length>0) ){
          const choices = req.body.choices.map((choice)=>{return({choice_text:choice, question:new_question})})
          Choice.insertMany(choices)
          .then((result)=>{
            let respData = {'question':new_question, 'choices':result.map((c)=>c._id) };
            res.statusCode = 201
            res.setHeader('Content-Type', 'application/json');
            return res.json(respData);
          }, (err)=>{
            return _404Error(req,res, err);
          })
          .catch((err)=>{
            return _404Error(req,res, err);
          })
        }
        else{
          return res.json(new_question);
        }
      },(err)=>{
        return _404Error(req,res, err);
      })
    .catch((err)=>{
        return _404Error(req,res, err);
      })
  });

router.route('/:pollId')
.get((req, res)=>{
  Question.findById(req.params.pollId).populate('category')
  .then((question)=>{
    Choice.find({ question:question })
    .then((choices)=>{
      const data = {...question._doc, 'choices':choices}
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json');
      return res.json(data)
    },(err)=>{
        return _404Error(req,res, err);
    })
    .catch((err)=>{
        return _404Error(req,res, err);
    })
  }, (err)=>{
      return _404Error(req,res, err);
  })
  .catch((err) => {
      return _404Error(req,res, err);
  })
})
.put(authenticate.verifyUser, authenticate.verifyOwner,  (req, res)=>{
  Question.findByIdAndUpdate(req.poll._id,{$set:{question_text: req.body.question_text}})
  .then((question)=>{
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json');
    return res.json(question);
  }, (err)=>{
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })
})
.post((req, res)=>{
  res.writeHead(405);
  res.end("METHOD_NOT_ALLOWED");
})
.delete(authenticate.verifyUser, authenticate.verifyOwner, (req, res)=>{

  Question.findByIdAndDelete(req.poll._id)
  .then((question)=>{
    Choice.deleteMany({question: question})
    .then((choices)=>{
        res.statusCode = 201
        res.setHeader('Content-Type', 'application/json');
        return res.json(question)
      }, (err)=>{
        return _404Error(req,res, err);
      })
    .catch((err)=>{
      return _404Error(req,res, err);
      })
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json');
    return res.json(question);
  }, (err)=>{
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })

})


router.route('/:pollId/choices')
.get((req, res)=>{
  Choice.find({question:req.params.pollId})
  .then((choices)=>{
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json');
    return res.json(choices)
  },(err)=>{
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })
})
.post(authenticate.verifyUser, authenticate.verifyOwner, (req, res)=>{
  Choice.create(
    {
      choice_text: req.body.choice_text,
      question: req.poll
    }
  )
  .then((choice)=>{
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json');
    return res.json(choice)
  }, (err)=>{
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })
})
.put((req, res)=>{
  res.writeHead(405);
  res.end("METHOD_NOT_ALLOWED");
})
.delete((req, res)=>{
  res.writeHead(405);
  res.end("METHOD_NOT_ALLOWED");
})


router.route('/:pollId/choices/:choiceId')
.get((req,res)=>{
  Choice.findById(req.params.choiceId)
  .then((choice)=>{
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json');
    return res.json(choice)
  }, (err) => {
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })
})
.post(authenticate.verifyUser, (req,res)=>{

  Choice.update(
    {
      'question': ObjectId(req.params.pollId),
      'votes.user': req.user
    },
    {
      $pull: { votes: {'user': req.user}}
    },
    { multi: true }
  )
  .then((choice)=>{
    Choice.findOneAndUpdate(
      {
        'question': ObjectId(req.params.pollId),
        '_id':req.params.choiceId
      },
      {
        $push: {
              votes: {
                user:req.user
              }
        }
      }
    )
    .then((choice)=>{
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json');
      return res.json(choice)
    },(err)=>{
      return _404Error(req,res, err);
    })
    .catch((err)=>{
      return _404Error(req,res, err);
    })
  }, (err) => {
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })
})
.put(authenticate.verifyUser, authenticate.verifyOwner, (req,res)=>{
  Choice.findByIdAndUpdate(req.params.choiceId, {choice_text: req.body.choice_text})
  .then((choice)=>{
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json');
    return res.json(choice)
  }, (err)=>{
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })
})
.delete(authenticate.verifyUser, authenticate.verifyOwner, (req,res)=>{
  Choice.findByIdAndDelete(req.params.choiceId)
  .then((choice)=>{
    res.statusCode = 201
    res.setHeader('Content-Type', 'application/json');
    return res.json({"message": "choice deleted"})
  }, (err) => {
    return _404Error(req,res, err);
  })
  .catch((err)=>{
    return _404Error(req,res, err);
  })
})
module.exports = router;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmFkZjUxNDBmOTc3NmYzMjhlYmZkZjIiLCJpYXQiOjE2NTU1NzU1NDksImV4cCI6MTY1NTU3OTE0OX0.QVKLP5geciVQc8NBbELq6u0oJxNOewVqp3-eDuW3LB8
//client1

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmE1OWRkNzE2MWQ0ZDg2Y2JkM2FlMDAiLCJpYXQiOjE2NTU1NzgxNTYsImV4cCI6MTY1NTU4MTc1Nn0.CXnzKZWo-CKoNmR7gSsKSw9nCAfT6Tzso1Pu-qp7NZI
//admin
