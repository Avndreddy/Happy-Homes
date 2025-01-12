const AWS = require('aws-sdk');
require('dotenv').config();

const s3 =new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

function getUserDocs(name, type){
    const bucket_params = {
        Bucket: process.env.bucketName,
        Key: `${type}/${name}`,
        Expires: 3600,
    }
    
    try {
       const url = s3.getSignedUrl('getObject',bucket_params);
       return url;
    }catch(error){
        console.log(error);
        return null;
    }

}

module.exports = getUserDocs;