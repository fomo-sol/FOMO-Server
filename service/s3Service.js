const fs = require('fs');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3Config'); // S3Client 객체

async function uploadFile(localFilePath, s3Key) {
    const fileContent = fs.readFileSync(localFilePath);

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: fileContent,
    });

    const result = await s3.send(command);

    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return { Location: url, result };
}

module.exports = { uploadFile };