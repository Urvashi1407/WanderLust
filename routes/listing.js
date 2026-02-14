const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../Models/listing.js");
const Review=require("../Models/review.js");
const {isLoggedIn, isOwner, isReviewAuthor}=require("../middleware.js");


const listingController=require("../controllers/listings.js");



const multer = require("multer");
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });


const validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);

if(error)
{
  let errmsg=error.details.map((el)=>el.message).join(",");
  throw new ExpressError(400,errmsg);
}else
{
  next();
}
}

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    let errmsg = error.details.map(el => el.message).join(",");
    return next(new ExpressError(400, errmsg));
  }

  next();
};


router.
route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));




router.get("/new",isLoggedIn,listingController.renderNewForm);


//show
router.get("/:id",wrapAsync(listingController.showListing));







//update listing
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))


router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm))




router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))



router.post("/:id/reviews",isLoggedIn,validateReview,wrapAsync(async(req,res)=>{
let listing=await Listing.findById(req.params.id);
let newReview=new Review(req.body.review);
newReview.author=req.user._id;
console.log(newReview);
listing.reviews.push(newReview);
await newReview.save();
await listing.save();
 req.flash("success","New Review Created!");
res.redirect(`/listings/${listing._id}`);
}));


//delete review route
router.delete("/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async(req,res)=>{
  let {id,reviewId}=req.params;

  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await Review.findByIdAndDelete(reviewId);  
  await Review.findById(reviewId);
   req.flash("success","New Review Deleted!");
  res.redirect(`/listings/${id}`);

}))


module.exports=router;
