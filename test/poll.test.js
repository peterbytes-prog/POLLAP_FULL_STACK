const supertest = require('supertest');
const chai = require('chai');
const User = require("../models/user.js");
const { Question } = require("../models/poll.js");
const app = require("../index");
const models = {
  questions:[],
  users:[]
}

var new_users = [
  {
    username: 'testuser1',
    password:'pwtestuser1',
    id:"629c05df79c499367028a4d4"
  },
  {
    username: 'testuser2',
    password:'pwtestuser2',
    id:"629c045579c499367028a4ca"
  }
]

let userHash = [
                  "Basic "+ new Buffer(new_users[0].username+':'+new_users[0].password).toString('base64'),
                  "Basic "+ new Buffer(new_users[1].username+':'+new_users[1].password).toString('base64'),
                ]
var questions = [
  {
  "question_text": "First English Alphabet",
  "userid": "",
  "choices": [
    {
      "choice_text": "D",
      "votes": []
    },
    {
      "choice_text": "C",
      "votes": []
    },
    {
      "choice_text": "Z",
      "votes": []
    },
    {
      "choice_text": "A",
      "votes": []
    }
  ]
},
  {
  "question_text": "Greet",
  "userid": "",
  "choices": [
    {
      "choice_text": "Hello",
      "votes": []
    },
    {
      "choice_text": "Konishiwa",
      "votes": []
    },
    {
      "choice_text": "Hola",
      "votes": []
    },
    {
      "choice_text": "Hoai0",
      "votes": []
    }
  ]
}
]

function saveModelBefore(){

  return new Promise((resolve)=>{
    User.find({},(err, users)=>{
          models['users'] = users.map((user)=>user.id);
          Question.find({},(err, qs)=>{
            models['questions'] = qs.map((q)=>q.id);
            User.insertMany(new_users)
            .then((users)=>{
              for(let usr in users){
                new_users[usr] = users[usr]
                questions[usr].userid = users[usr]
              }
              Question.insertMany(questions,(error, qs)=>{
                if(error){
                  return resolve('Done A')
                }
                else{
                  for(let q in qs){
                    questions[q] = qs[q]
                  }
                  return resolve('Done B')
                }
              })
            }, (err)=>{
              return resolve('Done C')
            })
            .catch((err)=>{
              return resolve('Done D')
            })
          });

        });
  })
}
function cleanModelAfter(){
    return new Promise((resolve)=>{
      Question.find({}, (err, _questions)=>{
        let to_remove =[];
        for(let question of _questions){
          if(! models.questions.includes(question.id)){
            to_remove.push(question.id)
          }
        }
        Question.deleteMany({id:{$in:to_remove}})
        .then((q)=>{
                      User.find({},(err, users)=>{
                        let to_remove =[];
                        for(let user of users){
                          if(! models.users.includes(user.id)){
                            to_remove.push(user.id)
                          }
                        }
                        User.deleteMany({id:{$in:to_remove}})
                        .then((user)=>{console.log('Cleaned DB'); resolve('Completed')},
                              (err)=>{console.log('err', err); resolve('Completed')})
                      });
                     },
              (err)=>console.log('err  Question DB', err))
      })
    })


}
describe("Test poll/ routes", function(){
  before(()=>{

    return new Promise((resolve) => {
        saveModelBefore()
        .then((val)=>{console.log('before Completed');  resolve();}, (err)=>{resolve()})
        .catch((err)=>resolve())

  });

  });
  it("Post / Return 401 no user matched id", function(done){
    supertest(app)
    .post('/api/polls')
    .set({'Authorization': "Basic "+ new Buffer('new_users[0].username'+':'+"new_users[0].password").toString('base64')})
    .send({})
    .expect(401)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      done()
    })
  })
  it("Post / Return 401 if no user id send with header", function(done){
    supertest(app)
    .post('/api/polls')
    .expect(401)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      done()
    })
  })
  it("Post / Return 400 if valid user id send with header and question text length less than 3", function(done){
    supertest(app)
    .post('/api/polls')
    .set({'Authorization': userHash[0]})
    .expect(400)
    .expect("question text must be greater than 3")
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      done()
    })
  })
  it("Post / Return 400 if valid user id send with header and no choice text provided", function(done){
    supertest(app)
    .post('/api/polls')
    .set({'Authorization': userHash[0]})
    .send({question_text:"Favorite Color"})
    .expect(400)
    .expect("choice_text[] must be provide and lenth greater than one")
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      done()
    })
  })
  it("Post / Return 200 if valid user id send with header and choice text provided", function(done){
    supertest(app)
    .post('/api/polls')
    .set({'Authorization': userHash[0]})
    .send({question_text:"Favorite Color", choice_text:["Yellow", "Green","Blue"]})
    .expect(200)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      chai.expect(res.body).to.be.a('object').with.property('question');
      done()
    })
  })
  it('GET / should return all polls in database', function(done){
    supertest(app)
    .get('/api/polls')
    .expect(200)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      chai.expect(res.body).to.be.a('object').has.property('questions').with.length(3);
      done()
    })
  });
  it('put / error 404 method not allow', function(done){
    supertest(app)
    .put('/api/polls')
    .expect(405)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      done()
    })
  })
  it('delete / error 405 method not allow', function(done){
    supertest(app)
    .delete('/api/polls')
    .expect(405)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      done()
    })
  })
  after(()=>{
    return new Promise((resolve)=>{
      cleanModelAfter()
      .then((val)=>resolve(), (err)=>resolve())
      .catch((err)=> resolve())
    })

    })
});
describe("Test poll/:id routes", function(){
  before(()=>{

    return new Promise((resolve) => {
        saveModelBefore()
        .then((val)=>{console.log('before Completed');  resolve();}, (err)=>{resolve()})
        .catch((err)=>resolve())

  });
  });
  it('GET / should return a poll matching id', function(done){
    supertest(app)
    .get('/api/polls/629c05df79c499367028a4d8')
    .expect(200)
    .end((err, res)=>{
      chai.expect(err).to.be.null;
      chai.expect(res.body.question).to.be.null;
    });
    let q = questions[0];
    supertest(app)
    .get(`/api/polls/${q.id}`)
    .expect(200)
    .end((err, res)=>{
      chai.expect(err).to.be.null;
      chai.assert(res.body.question._id,q.id, "returned quesstion doesnt match id provided");
      done();
    })
  });
  it('POST / for voting reqires Authentication', function(done){
    supertest(app)
    .post('/api/polls/629c05df79c499367028a4d8')
    .expect(401)
    .end((err,res)=>{
      if(err){
        return done(err)
      }else{
        return done()
      }
    })
  })
  it('POST / updates votes of poll with choice id', function(done){
    let q = questions[0];
    let choice_id = q.choices[0].id
    supertest(app)
    .post(`/api/polls/${q.id}`)
    .set({'Authorization': userHash[1]})
    .send({choice_id:choice_id})
    .expect(200)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      chai.assert(q.choices[0].votes.length+1,res.body.question.choices[0].votes.length, "Votes Not added to choice")
      return done()
    })
  })
  it('PUT / require Authentication', function(done){
    supertest(app)
    .put("/api/polls/629c05df79c499367028a4d8")
    .expect(401)
    .end((err,res)=>{
      if(err){
        return done(err)
      }else{
        return done()
      }
    })
  })
  it('PUT / require owner', function(done){
    let q = questions[0];
    supertest(app)
    .delete(`/api/polls/${q.id}`)
    .set({'Authorization': userHash[1]})
    .send({})
    .expect(401)
    .expect("The Poll edit is unauthorize by non creator")
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      return done()
    })
  })
  it('PUT / update poll text, update choices and add new choice', function(done){
    let q = questions[1];
    let choice =q.choices[0].id;
    supertest(app)
    .put(`/api/polls/${q.id}`)
    .set({'Authorization': userHash[1]})
    .send({
      'question_text':q.question_text+"?",
      "choice_text": ["New choice", "????"],
      delete_choices:[q.choices[1].id],
      choice : q.choices[0].choice_text+" UPDATED"
    })
    .expect(200)
    .end((err,res)=>{
      if(err){
        return done(err)
      }else{
        return done()
      }
    })
  })
  it("Delete/ require Authentication", function(done){
    supertest(app)
    .delete('/api/polls/629c05df79c499367028a4d8')
    .expect(401)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      return done()
    })
  })
  it("Delete/ require owner", function(done){
    let q = questions[0];
    supertest(app)
    .delete(`/api/polls/${q.id}`)
    .set({'Authorization': userHash[1]})
    .send({})
    .expect(401)
    .expect("The Poll edit is unauthorize by non creator")
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      return done()
    })
  })
  it('Delete / delete poll with prodived id', function(done){
    let q = questions[1];
    supertest(app)
    .delete(`/api/polls/${q.id}`)
    .set({'Authorization': userHash[1]})
    .send({})
    .expect(200)
    .end((err, res)=>{
      if(err){
        return done(err)
      }
      return done()
    })
  })
  after(()=>{
    return new Promise((resolve)=>{
      cleanModelAfter()
      .then((val)=>resolve(), (err)=>resolve())
      .catch((err)=> resolve())
    })
  })
});
