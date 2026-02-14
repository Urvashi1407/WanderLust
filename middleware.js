
const Listing=require("./Models/listing");

module.exports.isLoggedIn=(req,res,next)=>{
  if(!req.isAuthenticated())
  {
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","you much be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl)
  {
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner=async(req,res,next)=>{
   let {id}=req.params;
  let listing=await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error","You are not the owner of this listing");
  return res.redirect(`/listings/${id}`);
  }
  next();
}


const Review = require("./Models/review"); // make sure you import Review

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;

  const review = await Review.findById(reviewId); // ✅ use Review model

  // check if review exists
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  // check if current user is the author
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
