const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    dateofbirth: {
      type: String,
      required: true,
    },
    image: {
      type: String
    },
    // id: {
    //   type: String,
    // },
  },
  { timestamps: true }
);

const collectionstudent = mongoose.model("Studentrecord", studentSchema);

module.exports = collectionstudent;
