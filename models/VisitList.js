const mongoose = require("mongoose");

const visitListSchema = new mongoose.Schema({
  visit: Array,
  user_id: String,
  patient_id: String,
});

mongoose.model("VisitList", visitListSchema);
