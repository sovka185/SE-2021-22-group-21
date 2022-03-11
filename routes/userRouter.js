var express = require('express');
var router = express.Router();
var auth = require("../auth")
const User = require("../models/userModel");
const School = require("../models/schoolModel");
const passport = require("passport");

/* GET users listing. */
router.get('/', auth.loginRequired, function(req, res, next) {
  res.render('userHome.html',  {message:req.flash('message')});
});

router.get('/tutorial', auth.loginRequired,function(req, res, next) {
  var user = req.user;
  user.initialized = 1;
  user.save();
  res.render('userTutorial.html', { title: 'Express' });
});

router.get('/classroom', auth.loginRequired,function(req, res, next) {
  var color = req.user.wallColour;
  var bell = req.user.bell;
  var chatter = req.user.chatter;
  // if (!color){
  //   color = "green";
  // }

  if (color && bell && chatter){
    res.render('userClassroom.html', { title: 'Express' , message:req.flash('message'), color:color, done: "true"});
  }
  else{
    if (!color){
      color = "green";
    }
    res.render('userClassroom.html', { title: 'Express' , message:req.flash('message'), color:color});
  }
  
});

// router.get('/checkDone', auth.loginRequired,function(req, res, next) {
//   var color = req.user.wallColour;
//   var bell = req.user.bell;
//   if (color && bell){
//     res.render('endpage.html', { title: 'Express' });
//   }
//   else{
//     res.redirect("/user/classroom");
//   }
// });

router.get('/endpage', auth.loginRequired,function(req, res, next) {
  res.render('userEndpage.html', { title: 'Express' });
});

router.get('/wallcolour', auth.loginRequired,function(req, res, next) {
  res.render('eventWallColour.html', { title: 'Express' });
});

router.post('/wallcolour', auth.loginRequired,function(req, res, next) {
  var colour = req.body.options;
  var user = req.user;
  user.wallColour = colour;
  user.save(function (err) {
    if(err){
      req.flash("message", err);
      res.redirect("/user/wallcolour");
    }
    res.redirect("/user/classroom");
  })
});

router.get('/bell', auth.loginRequired,function(req, res, next) {
  res.render('eventBell.html', { title: 'Express' });
});

router.get('/chatter', auth.loginRequired,function(req, res, next) {
  res.render('eventChatter.html', { title: 'Express' });
});

router.post('/bell', auth.loginRequired,function(req, res, next) {
  var bell = req.body.bell;
  var user = req.user;
  user.bell = bell;
  user.save(function (err) {
    if(err){
      req.flash("message", err);
      res.redirect("/user/bell");
    }
    res.redirect("/user/classroom");
  })
});

router.post('/chatter', auth.loginRequired,function(req, res, next) {
  var chatter = req.body.chatter;
  var user = req.user;
  user.chatter = chatter;
  user.save(function (err) {
    if(err){
      req.flash("message", err);
      res.redirect("/user/chatter");
    }
    res.redirect("/user/classroom");
  })
});

router.get('/index', async function(req, res, next) {
  res.render('index.html', { message: req.flash("message")});
});

router.post('/index', async function(req, res, next) {
  let schoolString = req.body.schoolString;
  const doc = await School.findOne({string: schoolString});
  if (doc){
    // req.flash('message', "School String is correct! please continue enter ID now.")
    res.redirect("/user/login/"+schoolString)
  }else{
    req.flash('message', "Invalid input, please try again! ")
    res.render('index.html', { title: 'Express', message:req.flash('message')});
  }
});

router.get('/login/:string', async function(req, res, next) {
  let schoolString = req.params["string"];
  const doc = await School.findOne({accessString: schoolString});
  console.log(doc)
  if (doc){
    res.render('userLogin.html', { title: 'Express', doc:doc});
  }else{
    req.flash('message', "Invalid input, please try again! ")
    res.redirect("/index")
  }
});


router.post('/login/:string',  function(req, res, next) {
    User.findOne({username:req.body.username}).populate("school").exec(function (err, user) {
        if (err){
          req.flash("message", err)
          res.render('userLogin.html', { message: req.flash("message")});
        }
        if (!user){
          req.flash("message", "User Not Found")
          res.render('userLogin.html', { message: req.flash("message")});
        }else{
          if (user.school.accessString === req.body.schoolstring ){
            req.flash("message", "Login Successfully!")
            req.login(user, function (err) {
              if (err) {
                req.flash('message', err)
                res.render("userLogin.html", {message: req.flash('message')});
              }
              req.flash('message', "login successful!");
              res.redirect("/user/tutorial")

            })
          }else{
            req.flash("message", "Login Failed! School Not Matched")
            res.redirect("/user/login/:string")
          }

        }
    })
});



router.get('/logout', function (req,res) {
  req.logout();
  res.redirect("/user/index");
})



module.exports = router;
