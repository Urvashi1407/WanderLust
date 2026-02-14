

const Listing=require("../Models/listing");
const axios = require("axios");
const mapToken=process.env.MAP_TOKEN;


module.exports.index=async(req,res)=>{
  const allListings= await Listing.find({});
  res.render("listings/index.ejs",{allListings});
}


module.exports.renderNewForm=(req,res)=>{
res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
let {id}=req.params;
const listing=await Listing.findById(id).populate({path:"reviews",
  populate:{
  path:"author"}
}).populate("owner");
if(!listing)
{
   req.flash("error","Listing you requested for does not exist ");
   return res.redirect("/listings");
  }
// res.render("listings/show.ejs",{listing});

res.render("listings/show.ejs", {
  listing,
  mapToken: process.env.MAP_TOKEN
});

};




module.exports.createListing=async(req,res,next)=>{



let url=req.file.path;
let filename=req.file.filename;
  let listing=req.body.listing;


  // 🌍 Forward Geocoding
  const geoResponse = await axios.get(
    `https://api.maptiler.com/geocoding/${listing.location}.json?key=${process.env.MAP_TOKEN}`
  );


  // Safety check
  if (!geoResponse.data.features.length) {
    req.flash("error", "Invalid location provided!");
    return res.redirect("/listings/new");
  }

  
   const coordinates = geoResponse.data.features[0].geometry.coordinates;


 const newlist= new Listing(listing);
newlist.owner = req.user._id;
newlist.image={url,filename};

  // 🗺 Save geometry
  newlist.geometry = {
    type: "Point",
    coordinates: coordinates
  };



 await newlist.save();
 req.flash("success","New Listing Created!");
 res.redirect("/listings");

};




module.exports.renderEditForm=async(req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id);
  if(!listing)
  {
     req.flash("error","Listing you requested for does not exist");
     res.redirect("/listings");
  }
  let originimageurl=listing.image.url;
  originimageurl=originimageurl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs",{listing,originimageurl});
};


module.exports.updateListing=async(req,res)=>{
   
  let {id}=req.params;
 
 let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
if(typeof req.file !="undefined"){
 let url=req.file.path;
let filename=req.file.filename;
listing.image={url,filename};
await listing.save();
}
   req.flash("success","Listing Updated!");
  res.redirect(`/listings/${id}`);
};



module.exports.destroyListing=async(req,res)=>{

  let {id}=req.params;
  await Listing.findByIdAndDelete(id);
   req.flash("success","New Listing Deleted!");
  res.redirect("/listings");
};



