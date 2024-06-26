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
    phonenumber:{
      type:Number,
      required:true,
      unique:true
    },
    emailId:{
      type:String,
      required:true,
      unique:true
    },
    image: {
      type: String
    },
    qrcode:{
      type: String
    }
    // id: {
    //   type: String,
    // },
  },
  { timestamps: true }
);

const collectionstudent = mongoose.model("Studentrecord", studentSchema);

module.exports = collectionstudent;
