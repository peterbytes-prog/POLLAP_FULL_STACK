const supertest = require("supertest");
const { assert } = require('chai');
const chai = require('chai');
const User = require("../models/user.js");
const app = require("../index");
var models = {}
const testuser1 ={
  username: 'testuser1',
  password:'pwtestuser1'
}
const testuser2 ={
  username: 'testuser2',
  password:'pwtestuser2'
}
async function saveModelBefore(){
      User.find({},(err, users)=>{
        models['users'] = users.map((user)=>user.id);
        console.log("Database Saved");
      });
}
async function cleanModelAfter(done){
  if (models.users){
    User.find({},(err, users)=>{
      let to_remove =[];
      for(let user of users){
        if(! models.users.includes(user.id)){
          to_remove.push(user.id)
        }
      }
      User.deleteMany({id:{$in:to_remove}})
      .then((user)=>{console.log('Cleaned DB'); done()},
            (err)=>console.log('err', err))
    });
  }else{
    console.log('No users')
  }
}
describe("User / routes", function() {
  before(async function(){
    await saveModelBefore();
  })
  after(function(done){
    cleanModelAfter(done);
  })
  it("GET/ it should has status code 200 with no user returned if no id matched", function(done) {

    User.create(testuser1)
    .then((user)=>{
      supertest(app)
        .get("/api/users")
        .send({id:'629acab60b9d63e94b782986'})
        .expect(200)
        .end(function(err, res){
          if (err) done(err);
          chai.expect(res.body.user).to.be.null;
          done()
        });
    },(err)=>done(err))
    .catch((err)=>done(err))

  });
  it("GET/ it should has status code 200 return user object that matched send id", function(done){
    User.create(testuser2)
    .then((user)=>{
      supertest(app)
        .get("/api/users")
        .send({id:user.id})
        .expect(200)
        .end(function(err, res){
          if (err) done(err);
          assert.equal(res.body.user.username, testuser2.username, "wrong user matched");
          done()
        });
    },(err)=>done(err))
    .catch((err)=>done(err))
  });
  it("PUT/ it should have status code 405 when ivalid edit id provided", function(done){
      supertest(app)
        .put("/api/users")
        .send({id:"629acab60b9d63e94b782986"})
        .expect(404)
        .end(function(err, res){
          if (err) done(err);
          assert.equal(res.body.user, null, "a user is found for invalid id");
          done()
        });
  });
  it("PUT/ it should have status code 200 when valid edit id provided and update user data", function(done){
    const new_email = 'new@user.email.com';
    User.findOne({username:testuser2.username})
    .then((user)=>{
      supertest(app)
        .put("/api/users")
        .send({id:user.id, email:new_email})
        .expect(200)
        .end(function(err, res){
          if (err) done(err);
          assert.equal(res.body.user.email, new_email, "wrong user matched");
          done()
        });
    },(err)=>done(err))
    .catch((err)=>done(err))
  });
  it("POST/ it should have status code 405", function(done){
    supertest(app)
    .post("/api/users")
    .expect(405)
    .end(function(err, res){
      if (err) done(err);
      done();
    });
  });
  it("DELETE/ it should have status code 404 when invalid id to remove", function(done){
    supertest(app)
      .delete("/api/users")
      .send({id:"629acab60b9d63e94b782986"})
      .expect(404)
      .end(function(err, res){
        if (err) done(err);
        assert.equal(res.body.user, null, "a user is found for invalid id");
        done()
      });
    });
  it("DELETE/ it should have status code 200 when valid id to remove", function(done){
    User.findOne({username:testuser2.username})
    .then((user)=>{
      supertest(app)
        .delete("/api/users")
        .send({id:user.id})
        .expect(200)
        .end(function(err, res){
          if (err) done(err);
          assert.equal(res.body.user.username, testuser2.username, "wrong user matched");
          done()
        });
    },(err)=>done(err))
    .catch((err)=>done(err))
  });
});

describe("users/sign up methods", function(){
  before(async function(){
    await saveModelBefore();
  })
  after(function(done){
    cleanModelAfter(done);
  })
  it("GET/ it should has status code 405", function(done){
    supertest(app)
    .get("/api/users/create")
    .expect(405)
    .end(function(err, res){
      if(err){
        done(err);
      }
      done();
    });
  });
  it("POST/ it should has status code 400 username and password require ", function(done){
    supertest(app)
    .post("/api/users/create")
    .expect(400)
    .end(function(err, res){
      assert.equal(res.text,"Bad Request, data missing", "Bad Request, data missing")
      if(err){
        done(err);
      }else done();
    });
  });
  it("POST/ it should has status code 201 user created ", function(done){
    supertest(app)
    .post("/api/users/create")
    .send({
        username:'Testuser',
        password: 'pettr6791'
    })
    .expect(200)
    .end(function(err, res){
      if(err){
        done(err);
      }else done();
    });
  });
  it("PUT/ it should has status code 405 ", function(done){
    supertest(app)
    .put("/api/users/create")
    .expect(405)
    .end(function(err, res){
      if(err){
        done(err);
      }else done();
    });
  });
  it("DELETE/ it should has status code 405 ", function(done){
    supertest(app)
    .delete("/api/users/create")
    .expect(405)
    .end(function(err, res){
      if(err){
        done(err);
      }else done();
    });
  });
  describe("users/api/login Testing Login Method", function(){
    it('GET / it should has status code 405 method not allow', function(done){
      supertest(app)
      .get('/api/users/login')
      .expect(405)
      .end(function(err, res){
        if(err){
          done(err)
        }else{
          done()
        }
      })
    });
    it('PUT / it should has status code 405 method not allow', function(done){
      supertest(app)
      .put('/api/users/login')
      .expect(405)
      .end(function(err, res){
        if(err){
          done(err)
        }else{
          done()
        }
      })
    });
    it('DELETE / it should has status code 405 method not allow', function(done){
      supertest(app)
      .delete('/api/users/login')
      .expect(405)
      .end(function(err, res){
        if(err){
          done(err)
        }else{
          done()
        }
      })
    });
    it('POST / it should has status code 200 method valid username and password sent', function(done){
      supertest(app)
      .post('/api/users/login')
      .send({
        username:'Testuser',
        password: 'pettr6791'
      })
      .expect(200)
      .end(function(err, res){

        if(err){
          done(err)
        }else{

          chai.expect(res.body).to.have.property('user');

          done()
        }
      })
    });
    it('POST / it should has status code 400 method (no user match)', function(done){
      supertest(app)
      .post('/api/users/login')
      .send({
        username:'',
        password: ''
      })
      .expect(400)
      .end(function(err, res){

        if(err){
          done(err)
        }else{
          assert.equal(res.body.user,null, "No user object");
          done()
        }
      })
    });
  });
})
