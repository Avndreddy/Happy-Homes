const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
    });

async function deleteObject(name,type){
    const bucket_params = {
        Bucket: process.env.bucketName,
        Key: `${type}/${name}`
        };
try{
    const status = await s3.deleteObject(bucket_params).promise();
    console.log(status);
    return status;
}catch(error){
    console.log(error);
    return error;
}

}

module.exports = deleteObject;