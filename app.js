const express = require("express");
const app = express();
const collectionlogin = require("./model/login");
const collectionstudent = require("./model/student");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const QRcode = require("qrcode");
const path = require("path");
const fs = require("fs");
const passwordHash = require("password-hash");
const login_data = require("./data/LOGIN_DATA.json");

require("dotenv").config();
const multer = require("multer");
app.use(express.urlencoded({ extended: false })); 

const Img_Dir = "./images/";
app.use(express.json());

// async function generatefilename(getstudentid){
//   const imagepath =  `./Img_Dir/${getstudentid}.png`;
//   return imagepath
// }

//storage for image
const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, Img_Dir);
  },
  filename: async (req, file, cb) => {
    const FileName = uuidv4() + path.extname(file.originalname);
    cb(null, FileName);
    // const Filename = `./Img_Dir/${studentId}.png`
    // try{
    //   const studentId = await generatefilename(req.body.studentId);
    // //   if (!studentId) {
    // //     return cb(new Error("Student ID not provided"));
    // // }
    // const FileName = `${studentId}${path.extname(file.originalname)}`;
    // cb(null, FileName);
    // }
    // catch(err){
    //   console.log(err)
    // }
  },
});

//upload image
const upload = multer({
storage: Storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      console.log("Wrong file type alert");
      return cb(alert("Only PNG, JPG, and JPEG file types are allowed"));
    }
  },
});

async function generateqrcode(studentId,firstname,lastname,course,dateofbirth,phonenumber,emailId) {
  try {
    const qrcodedata = `StudentId : ${studentId}\n,Firstname : ${firstname}\n,Lastname : ${lastname}\n,Course : ${course}\n,DateofBirth : ${dateofbirth}\n,Phone_Number : ${phonenumber}\n,Email_Id : ${emailId}`;
    const qrfilepath = `./qrcodes/${studentId}.png`;
    
    await QRcode.toFile(qrfilepath, qrcodedata);

    return qrfilepath;
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
}
//login
app.get("/", (req, res) => {

});

app.post("/login", async (req, res) => {
  //   const data = {
  //     email: req.body.email,
  //     password: req.body.password,
  //   };

  //   await collectionlogin.insertMany([data]);
  try {
    const check_login = await collectionlogin.findOne({
      email: req.body.email,
      // password: req.body.password,
    });

    // var hashedpassword = passwordHash.generate(check_login.password);
    if (check_login) {
      if (passwordHash.verify(req.body.password, check_login.password)) {
        console.log(`Login Successful with ${check_login.email}`);
        console.log("Login ID:", check_login._id);
        res.status(200).json({
          status: "success",
          message: `Login Successful with ${check_login.email}`,
          LoginId: check_login._id,
        });
      } else {
        console.log("Invalid password");
        res.status(401).json({
          status: "failed",
          message: "Invalid password",
        });
      }
    } else {
      console.log("User not found");
      res.status(401).json({
        status: "failed",
        message: "User not found",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//create a student id
app.post("/:loginId/studentrecords",upload.single("file"),async (req, res) => {
    const studentdata = new collectionstudent(req.body);
    const loginId = req.params.loginId;
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    try {
      const checkLogin = await collectionlogin.findById(loginId);
      if (!checkLogin) {
        return res.status(404).json({
          status: "failed",
          message: "Login ID not found",
        });
      }
      const checking = await collectionstudent.findOne({
        studentId: req.body.studentId,
      });

      if (checking && checking.studentId === req.body.studentId) {
        return res
          .status(400)
          .send(`This student with ${req.body.studentId} already exists`);
      }

      const qrCodeFilePath = await generateqrcode(req.body.studentId,req.body.firstname,req.body.lastname,req.body.course,req.body.dateofbirth,req.body.phonenumber,req.body.emailId);
      studentdata.qrCode = qrCodeFilePath;

      if (req.file && req.file.path) {
        // const filepath = await generatefilename(req.body.studentId);
        // studentdata.image = filepath
        studentdata.image = req.file.path;
      }

      const savedstudent = await studentdata.save();
      console.log(`Student saved with id: ${req.body.studentId}`);
      console.log("Student DB Id:", savedstudent._id);
      console.log(
        `Student with ${savedstudent._id} saved with login id : ${loginId}`
      );
      res.json(savedstudent);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//get student for update
app.get("/:loginId/studentrecords/:id", async (req, res) => {
  const loginId = req.params.loginId;
  try {
    const checkLogin = await collectionlogin.findById(loginId);
      if (!checkLogin) {
        return res.status(404).json({
          status: "failed",
          message: "Login ID not found",
        });
      }

    const student = await collectionstudent.findById(req.params.id);
    if (student) {
      console.log(
        `Student record with StudentId ${student.studentId} fetched success : Update Id is - ${student.id}`
      );
    }
    res.status(500).json(studentupdate);
  } catch (error) {
    console.log(error.message);
  }
});

//update student
app.put("/:loginId/studentrecords/:id",upload.single("file"),async (req, res, next) => {
  const loginId = req.params.loginId;
  try {
    const checkLogin = await collectionlogin.findById(loginId);
      if (!checkLogin) {
        return res.status(404).json({
          status: "failed",
          message: "Login ID not found",
        });
      }
  } catch (error) {
    console.log(error)
  }

    if (req.file) {
      try {
        const oldStudentDetails = await Student.findById(req.params.id);
        if (!oldStudentDetails) {
          throw new Error("Student not found!");
        }

        if (fs.existsSync(oldStudentDetails.image)) {
          fs.unlink(oldStudentDetails.image, (err) => {
            if (err) {
              throw new Error("Failed to delete file..");
            } else {
              console.log("file deleted");
            }
          });
        }
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }

    try {
      const updatedstudent = await collectionstudent.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
          image: req.file.path, 
        },
        { new: true }
      );
      console.log(
        `Student record with StudentId ${updatedstudent.studentId} update success : Update Id is - ${updatedstudent.id} `
      );
      res.status(500).json(updatedstudent);
    } catch (error) {
      console.log(error.message);
      res.status(201).json({ error: error });
    }
  }
);

//delete student
app.delete("/:loginId/studentrecords/:id", async (req, res) => {
  const loginId = req.params.loginId;
  try {
    const checkLogin = await collectionlogin.findById(loginId);
      if (!checkLogin) {
        return res.status(404).json({
          status: "failed",
          message: "Login ID not found",
        });
      }

    const deletedstudent = await collectionstudent.findByIdAndDelete(
      req.params.id
    );
    res.status(201).json(`Student has been deleted`);
    console.log(`Student with id ${deletedstudent.studentId} has been deleted`);
    console.log(`Deleted DB id is : ${deletedstudent.id}`);
  } catch (error) {
    console.log(error.message);
  }
});

//search student
app.get("/studentrecords", async (req, res) => {
  const searchId = req.query.studentId;

  if (searchId) {
    try {
      let student;

      student = await collectionstudent.find({ studentId });
      return res.status(200).json(student);
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }
});

//server
app.listen(8000, () => {
  console.log("successfully running on local host 8000 ");
});

//database connection
mongoose
  .connect(process.env.Mongo_URL, {})
  //   .then(() => console.log("connected to database successfully"))
  .then(async () => {
    console.log("connected to database successfully");

    const hashedLoginData = login_data.map((user) => {
      const hashedPassword = passwordHash.generate(user.password);
      return { email: user.email, password: hashedPassword };
    });

    return collectionlogin.insertMany(hashedLoginData);
  })

  .then((result) => {
    console.log("Mock data stored in database");
    console.log("Users details:", result);
  })
  .catch((err) => console.log(err));
