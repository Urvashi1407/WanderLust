const mongoose=require("mongoose");
const indata=require("./data.js");
const Listing=require("../Models/listing.js");


main().then(()=>{
  console.log("connected to db");
}).catch(err=>{
  console.log(err);
})

async function main()
{
  await mongoose.connect('mongodb://127.0.0.1:27017/WanderLust1');
}


const initDb=async()=>{
  await Listing.deleteMany({});
 indata.data = indata.data.map(obj => ({ ...obj, owner: "698c3b1b0bb9e13f3b2ce92a" }));

  await Listing.insertMany(indata.data);
  console.log("data was init");
};
initDb();
