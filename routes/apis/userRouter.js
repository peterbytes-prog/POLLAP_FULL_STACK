const express = require('express');
const router =  express.Router();
const path = require('path');
const passport = require('passport');
const _404Error = require('../../components/responses/404Error');
const authenticate = require('../../middlewares/api/authenticate');
const User = require("../../models/user.js");
const Profile = require("../../models/profile.js");

router.get("/checkJwtToken", (req, res)=>{
  passport.authenticate('jwt', {session:false}, (err, user, next)=>{
      if(err){
        return _404Error(req,res, err);
      }
      if(!user){
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json')
        return res.json({message: 'jwt invalid'})
      }
      else{
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        return res.json({message: 'jwt valid', user:user})
      }
  })(req, res);
})
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
      res.writeHead(500)
      res.end('Internal Error '+error);
    })
  .catch((err) => {
    res.writeHead(500)
    res.end('Internal Error '+error);
  })
});


async function UpdateProfile(req, data){
  return new Promise((resolve, reject)=>{
    Profile.findOneAndUpdate({user:req.user},data, {new:true})
    .then((profile)=>{
      resolve(profile)
    }, (err)=>{
      reject(err)
    })
    .catch((err)=>{
      reject(err)
    })
  })
}
async function createImageFile(image, path){
  await  image.mv(path)
  return image
}
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmE1OWRkNzE2MWQ0ZDg2Y2JkM2FlMDAiLCJpYXQiOjE2NTU5NjA5NTUsImV4cCI6MTY1OTU2MDk1NX0.TVVc6Deo31vrg9OXaWEODguETvbqSfflHAc3dmLWjKM
router.route('/profile/:id')
.get((req, res)=>{
  passport.authenticate('jwt',{session:false}, (err, user, next)=>{
    Profile.findOne({'user': req.params.id}).populate('user')
    .then((profile)=>{
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      let isOwner = false;
      if(user){
        isOwner = user.id === profile.user.id;
      }
      return res.json({profile:profile, isOwner: isOwner });
    }, (err)=>{
      return _404Error(req,res, err);
    })
    .catch((err)=>{
      return _404Error(req,res, err);
    })
  })(req, res)

})
.post((req, res)=>{
  res.writeHead(405);
  res.end("Post Not Allow");
})
.put(authenticate.verifyUser, async (req, res)=>{
  let data = req.body;
  if(req.files && req.files.image){
    const fl_path = (path.resolve(__dirname,"..","..",'public/images/profiles',(req.user.id).toString())).toString()+(path.extname(req.files.image.name));
    const image = await createImageFile(req.files.image, fl_path)
    data['image'] = '/images/profiles/'+(req.user.id).toString()+(path.extname(image.name)).toString();
  }
  if(req.files && req.files.backgroundImage){
    const bg_file = (path.resolve(__dirname,"..","..",'public/images/backgrounds',(req.user.id).toString())).toString()+(path.extname(req.files.backgroundImage.name));
    const bgImage = await createImageFile(req.files.backgroundImage, bg_file)
    data['backgroundImage'] = '/images/backgrounds/'+(req.user.id).toString()+(path.extname(bgImage.name)).toString();
  }
  UpdateProfile(req, data)
  .then((profile)=>{
      console.log('A')
      res.statusCode = 200;
      res.send({profile:profile})
  }, (err)=>{
    console.log('B')
     _404Error(req,res, err);
  })
  .catch((err)=>{
    console.log('C')
      _404Error(req,res, err);
  })
})
.delete((req, res)=>{
  res.writeHead(405);
  res.end("Delete Not Allow");
})
router.get("/login",(req,res)=>{
    res.writeHead(405);
    res.end("GET Not Allow");
});
router.post("/login", passport.authenticate('local', {session:false}), (req, res)=>{
  var token = authenticate.getToken({_id:req.user._id});
  res.statusCode = 200;
  return res.json({success: true, token: token, status: 'You are successfully logged in!', _id:req.user._id});

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
                        return _404Error(req,res, err);
                    }else{

                      passport.authenticate('local')(req, res, ()=>{
                        Profile.create({
                          user: user,
                          fullname: user.username,
                        })
                        .then((profile)=>{
                          res.statusCode = 200;
                          res.setHeader('Content-Type', 'application/json');
                          return res.json({success: true, status: 'Registration Successful!', profile:profile, user:user});
                        }, (err)=>{
                          return _404Error(req,res, err);
                        })
                        .catch((err)=> {
                          return _404Error(req,res, err);
                        })

                      })
                    }

                  })
})

module.exports = router;
