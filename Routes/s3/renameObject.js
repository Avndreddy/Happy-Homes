const AWS = require("aws-sdk");
require("dotenv").config();
const deleteOldObject = require("./deleteObject");

// S3 Credientials
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function renameObject(oldKey, newKey) {
  const bucket_params = {
    Bucket: process.env.bucketName,
    CopySource: `${process.env.bucketName}/${oldKey.documentType}/${oldKey.keyPath}`,
    Key: `${newKey.documentType}/${newKey.keyPath}`,
  };

  try {
    const status = await s3.copyObject(bucket_params).promise();
    if (status) {
      console.log("Object Renamed Successfully");
      const deleteStatus = deleteOldObject(oldKey.documentType,oldKey.keyPath)
      return true;
    }
  } catch (err) {
    console.log("Failed to rename object");
    return false;
  }
}

module.exports = renameObject;
