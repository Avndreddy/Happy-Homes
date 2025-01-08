// const AWS = require("aws-sdk");
// const express = require("express");
// const router = express.Router();
// require("dotenv").config();

// class S3Service {
//   constructor(logger) {
//     this.logger = logger;
//   }

//   // Initialize S3 client
//   getS3() {
//     return new AWS.S3({
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     });
//   }

//   // Upload a file to S3
//   async uploadS3(file, bucket, name) {
//     this.logger.log({ message: "S3 upload", data: bucket });

//     const s3 = this.getS3();

//     const params = {
//       Bucket: bucket,
//       Key: String(name),
//       Body: file,
//       // ACL: "public-read", // Optional: Adjust permissions as needed
//     };

//     this.logger.log({ message: "S3 upload params", data: params });

//     try {
//       const result = await s3.upload(params).promise();
//       this.logger.log({ message: "File uploaded to S3", data: result });

//       return result.Location; // Return the file's S3 URL
//     } catch (error) {
//       this.logger.error({ message: "uploadS3: Error occurred", error });
//       throw new Error("S3 Upload Failed: " + error.message);
//     }
//   }
// }

// // Example usage
// router.post("/upload-user", async (req, res) => {
//   const logger = {
//     log: console.log,
//     error: console.error,
//   };

//   const s3Service = new S3Service(logger);

//   console.log("qwfegwr",req.file)

//   try {
//     const file = Buffer.from("Example file content"); // Replace with actual file data
//     const bucket = "happy-homes";
//     const name = "test.pdf";

//     const fileUrl = await s3Service.uploadS3(file, bucket, name);
//     console.log("Uploaded file URL:", fileUrl);
//     res.status(200).send(fileUrl);
//   } catch (error) {

//     console.error("File upload failed:", error.message);
//     res.status(500).json("fsiled");
//   }
// });

// module.exports = router;

const AWS = require("aws-sdk");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
require("dotenv").config();

class S3Service {
  constructor(logger) {
    this.logger = logger;
  }

  // Initialize S3 client
  getS3() {
    return new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  // Upload a file to S3
  async uploadS3(file, bucket, name) {
    this.logger.log({ message: "S3 upload", data: bucket });

    const s3 = this.getS3();

    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
    };

    this.logger.log({ message: "S3 upload params", data: params });

    try {
      const result = await s3.upload(params).promise();
      this.logger.log({ message: "File uploaded to S3", data: result });

      return result.Location; // Return the file's S3 URL
    } catch (error) {
      this.logger.error({ message: "uploadS3: Error occurred", error });
      throw new Error("S3 Upload Failed: " + error.message);
    }
  }
}

// Configure Multer for file upload handling
const upload = multer({ dest: "uploads/" }); // Temporarily stores files in the "uploads/" folder

// Example usage
router.post("/upload-user", upload.single("file"), async (req, res) => {
  const logger = {
    log: console.log,
    error: console.error,
  };

  const s3Service = new S3Service(logger);

  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Read the uploaded file
    const fileContent = fs.readFileSync(req.file.path);
    const fileName = req.file.originalname; // Original file name
    const bucket = "happy-homes";

    // Upload file to S3
    const fileUrl = await s3Service.uploadS3(fileContent, bucket, fileName);
    console.log("Uploaded file URL:", fileUrl);

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).send(fileUrl);
  } catch (error) {
    console.error("File upload failed:", error.message);

    // Cleanup temporary file in case of an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).send("File upload failed");
  }
});

module.exports = router;
