const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true }
});

// Add username, hash, salt, setPassword(), etc.
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
