const express = require('express');
const router =  express.Router();
// const authenticators = require('../middlewares/authenticate');
const authenticators = require('../../middlewares/api/authenticate');
const User = require("../../models/user.js");

router.get("/", async (req, res)=>{
  User.findById(req.body.id)
    .then((user)=>{
        res.json({ user });
      }, (err)=>{
        res.writeHead(500)
        res.end('Internal Error '+err);
      })
    .catch((err)=>{
      res.writeHead(500)
      res.end('Internal Error '+err);
    })
});
router.put("/", async (req,res)=>{
  const {id, ...data} = req.body;
  User.findByIdAndUpdate(id,{$set:data}, {new: true})
  .then((user)=>{
      if(!user){
        res.writeHead(404)
        res.end("No User Found")
      }else{
        res.json({ user });
      }
    }, (err)=>{
      res.writeHead(500)
      res.end('Internal Error '+error);
    })
  .catch((err) => {
    res.writeHead(500)
    res.end('Internal Error '+error);
  })
});
router.post("/",(req,res)=>{
    res.writeHead(405);
    res.end("Post Not Allow");
});
router.delete("/",(req,res)=>{
  const {id, ...data} = req.body;
  User.findByIdAndRemove(id)
  .then((user)=>{
      if(!user){
        res.writeHead(404)
        res.end("No User Found")
      }else{
        res.json({ user });
      }
    }, (err)=>{
      console.log('Internal Error '+error)
      res.writeHead(500)
      res.end('Internal Error '+error);
    })
  .catch((err) => {
    res.writeHead(500)
    res.end('Internal Error '+error);
  })
});


router.get("/login",(req,res)=>{
    res.writeHead(405);
    res.end("GET Not Allow");
});
router.post("/login", async (req, res)=>{

  const username = req.body.username || "";
  const password = req.body.password || "";
  User.findOne({username:username, password:password})
  .then((user)=>{
    if(user){
      res.json({ user });
    }else{
      res.writeHead(400)
      res.end('No User Found');
    }

  }, (err)=>{
    res.writeHead(300)
    res.end('Sever error'+err);
  })
});
router.put("/login",(req,res)=>{
    res.writeHead(405);
    res.end("PUT Not Allow");
});
router.delete("/login",(req,res)=>{
    res.writeHead(405);
    res.end("Delete Not Allow");
});


router.get("/create", (req, res)=>{
  res.writeHead(405);
  res.end("Get Not Allow");
})
router.put("/create", (req, res)=>{
  res.writeHead(405);
  res.end("PUT Not Allow");
})
router.delete("/create", (req, res)=>{
  res.writeHead(405);
  res.end("Delete Not Allow");
})
router.post("/create", async (req, res)=>{
  const data = {};
  data.email = req.body.email;
  data.username = req.body.username;
  data.password = req.body.password;
  data.gender = req.body.gender;
  data.firstname = req.body.firstname;
  data.lastname = req.body.lastname;
  data.age = req.body.age;
  if ((data.username)
      && (req.body.password)
    ){
      await User.create(data, (error, user)=>{
        if(error || !user){
          res.writeHead(400);
          return res.end("Error can create user"+error);
        }else{
          return res.json({'id':user.id});
        }
      })
    }
  else{
    res.writeHead(400);
    res.end("Bad Request, data missing");
  }
})

module.exports = router;
