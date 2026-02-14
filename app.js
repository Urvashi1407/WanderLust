if (process.env.NODE_ENV !== "production") {
  
require("dotenv").config();
}


const { cloudinary, storage } = require("./cloudConfig");




const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const Listing=require("./Models/listing.js");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const methodoverride=require("method-override");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./Models/review.js");
const listings=require("./routes/listing.js");




const session=require("express-session");
const MongoStore = require("connect-mongo");


const flash=require("connect-flash");

const ejsMate=require("ejs-mate");

const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const review = require("./Models/review.js");



const userRouter = require("./routes/user.js");





app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));








app.engine('ejs',ejsMate);

app.use(express.static(path.join(__dirname,"/public")));





if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


console.log("ATLAS URL:", process.env.ATLASDB_URL);






const store=MongoStore.create({
  mongoUrl:process.env.ATLASDB_URL,

   touchAfter: 24 * 3600, //no update then 24 ke bad change
   

}

);


store.on("error", (err) => {
  console.log("SESSION STORE ERROR", err);
});




const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false,
  cookie:{
   expires:Date.now()+7*24*60*60*1000,
   maxAge:7*24*60*60*1000,
   httpOnly:true,

  },
};




app.use(session(sessionOptions));

app.use(flash());


const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user");



app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




main().then(()=>{
  console.log("connected to db");
}).catch(err=>{
  console.log(err);
})

async function main()
{
 
  await mongoose.connect(process.env.ATLASDB_URL);
}








const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    let errmsg = error.details.map(el => el.message).join(",");
    return next(new ExpressError(400, errmsg));
  }

  next();
};







app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
   res.locals.error=req.flash("error");
   res.locals.currUser=req.user;
  next();
})

// app.get("/demouser", async (req, res) => { // include next here

//     let fakeUser = new User({
//       email: "rosu@gmail.com",
//       username: "rosu",
//     });
//     let registereduser = await User.register(fakeUser, "helo");
//     res.send(registereduser);
  
// });





app.use("/listings",listings);
app.use("/",userRouter);








// app.get("/testListing",async(req,res)=>{

// let sampleListing=new Listing({
//   title:"my enew villa",
//   description:"By the beach",
//   price:1200,
//   location:"Calengute,Goa",
//   country:"India",
// })
// await sampleListing.save();
// console.log("sample was saved");
// res.send("success");
// })
// All routes above this

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});



// Error handler (already you have)
app.use((err, req, res, next) => {
    let {statusCode=500,message="something went wrong"}=err;
res.status(statusCode).render("error.ejs",{message});
 
});


app.listen(8080,()=>{
  console.log("server is listening to port 8080");
})