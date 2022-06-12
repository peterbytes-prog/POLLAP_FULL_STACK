const express = require('express');
const router =  express.Router();
const passport = require('passport');
const authenticate = require('../../middlewares/api/authenticate');
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
router.post("/login", passport.authenticate('local', {session:false}), (req, res)=>{
  var token = authenticate.getToken({_id:req.user._id});
  res.statusCode = 200;
  return res.json({success: true, token: token, status: 'You are successfully logged in!'});

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
router.post("/create", (req, res)=>{
  req.body.password = req.body.password || ""
  req.body.username = req.body.username || ""
  User.register(
                new User({username:req.body.username}),
                req.body.password, (err, user)=>{
                    if(err){
                        res.statusCode = 400
                        return res.send("Error can create user "+err.message);
                    }else{

                      passport.authenticate('local')(req, res, ()=>{
                        console.log('B', err, user);
                        // if(err){
                        //   console.log('err 1', err.message)
                        //   res.statusCode = 400
                        //   return res.end("Error can create user "+err.message);
                        // }
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({success: true, status: 'Registration Successful!'});
                      })
                    }

                  })
})

module.exports = router;
