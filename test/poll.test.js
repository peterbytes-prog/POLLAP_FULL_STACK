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
  // User.find({},(err, users)=>{
  //       console.log("A", err)
  //       models['users'] = users.map((user)=>user.id);
  //       Question.find({},(err, qs)=>{
  //         console.log("B", err)
  //         models['questions'] = qs.map((q)=>q.id);
  //         User.insertMany(new_users)
  //         .then((users)=>{
  //           for(let usr in users){
  //             new_users[usr] = users[usr]
  //             questions[usr].userid = users[usr]
  //           }
  //           Question.insertMany(questions,(error, qs)=>{
  //             console.log("D", err)
  //             if(error){
  //
  //
  //               return Promise.resolve('Done A')
  //             }
  //             else{
  //               for(let q in qs){
  //                 questions[q] = qs[q]
  //               }
  //               console.log('returning before cb')
  //               return Promise.resolve('Done B')
  //             }
  //           })
  //         }, (err)=>{
  //           console.log("C", err)
  //           return Promise.resolve('Done C')
  //         })
  //         .catch((err)=>{
  //           console.log("E", err)
  //
  //           return Promise.resolve('Done D')
  //         })
  //       });
  //
  //     });
  //       console.log('end save model')
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
                      console.log('Cleaned Question DB',q);
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
    .send({userId: "629c05df79c499367028a4d2"})
    .expect(401)
    .expect("Invalid Authentication")
    .end((err, res)=>{
      console.log(err, res);
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
    .expect("Invalid Authentication")
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
    .send({userId:new_users[0].id})
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
    .send({userId:new_users[0].id, question_text:"Favorite Color"})
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
    .send({userId:new_users[0].id, question_text:"Favorite Color", choice_text:["Yellow", "Green","Blue"]})
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
// describe("Test poll/:id routes", function(){
//   it('GET / should return all a poll matching id', function(done){
//     response = null;
//     chai.expect(response).to.be.a('object');
//     done();
//   });
//   it('POST / update vote for provide choice id', function(done){
//     response = null;
//     chai.expect(response).to.be.a('object');
//     done()
//   })
//   it('put / update poll detail with prodived id', function(done){
//     response = null;
//     chai.expect(response).to.be.a('object');
//     done()
//   })
//   it('delete / delete poll with prodived id', function(done){
//     response = null;
//     chai.expect(response).to.be.a('object');
//     done()
//   })
// });
