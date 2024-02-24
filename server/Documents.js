let mongoose = require("mongoose");

let DocumentSchema = new mongoose.Schema({
  _id: String,
  data: Object,
});

module.exports = mongoose.model("Documents", DocumentSchema);
