const AWS = require("aws-sdk");
require("dotenv").config();

// S3 Credientials
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Generate a presigned Put Object URL
async function getPreSignedURL(keyPath, contentType) {
  console.log("entered", keyPath, contentType);
  const bucket_params = {
    Bucket: process.env.bucketName,
    Key: `uploads/${keyPath}`,
    Expires: 120, // 2min
    ContentType: contentType,
  };
  try {
    const url = await s3.getSignedUrl("putObject", bucket_params);
    return url;
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = getPreSignedURL;
