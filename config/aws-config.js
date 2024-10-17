const AWS = require("aws-sdk");

// region: "ap-south-1" => this should be near to your target audiance, not near where the developement takes palce
AWS.config.update({ region: "ap-south-1" });

const s3 = new AWS.S3();
const S3_BUCKET = "testbucketcodewithsami";

module.exports = { s3, S3_BUCKET };