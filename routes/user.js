const express = require("express");
const router = express.Router();
const User = require("../Models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


// GET signup page
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// POST signup
// router.post("/signup", (req, res, next) => {
//   const { username, email, password } = req.body;
//   const newUser = new User({ username, email });

//   User.register(newUser, password, (err, user) => {
//     if (err) return next(err);

//     req.login(user, (err) => {
//       if (err) return next(err);
//       req.flash("success", "Welcome!");
//       res.redirect("/listings");
//     });
//   });
// });

router.post("/signup",wrapAsync(async(req,res,next)=>{
  try{
  let {username,email,password}=req.body;
  const newUser=new User({email,username});
 const registereduser=await User.register(newUser,password);
 console.log(registereduser);
 req.login(registereduser,(err)=>{
  if(err)
  {
  return next(err);
 }
 req.flash("success","welcome to wanderlust");
 res.redirect("/listings");
}
)
  }
  catch(err)
  {
    req.flash("error",err.message);
    res.redirect("/signup");

  }
}));



router.get("/login",(req,res)=>{
  res.render("users/login.ejs");
})


//here failureredirect if login is fail message is come and remain in same page
router.post("/login",saveRedirectUrl, passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}), async(req,res)=>{
req.flash("success","Welcome back to Wanderlust ! you are logged in!");
let redirectUrl=res.locals.redirectUrl||"/listings";
res.redirect(redirectUrl);
});



//passport has a method deselialization called passport.logout i used this there are many method but i used this
router.get("/logout",(req,res,next)=>{
  req.logout((err)=>{
    if(err){
 return next(err);
    }
    req.flash("success","you are logged out!");
    res.redirect("/listings");
  });  //logout take a callback 
})





module.exports = router;
