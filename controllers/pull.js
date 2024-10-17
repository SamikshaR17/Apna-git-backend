const fs = require('fs').promises; // node file system, within this we need promises, iit is utility which helps to create files
const path = require("path"); // it will give current path to the directory(cwd=> current working directory ka access lenee ke liye)
const { s3, S3_BUCKET } = require("../config/aws-config.js");

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        // listObjectsV2=> comes from AWS S3
        // Kis bucket se hume details leni hai => S3_BUCKET
        // uss bucket me "commits" folder me jayga 
        const data = await s3.listObjectsV2({ Bucket: S3_BUCKET, Prefix: "commits/" }).promise();

        // s3 ke ander jitne bhi file and folers hai, wo milegi
        const objects = data.Contents;

        // logic for pull opposite to push
        for(const object of objects){

            // Key (name)
            const key = object.Key;

            // For reading folders
            // path.dirname(Key).split("/".pop()) => from aws  (taking till /)
            const commitDir = path.join(commitsPath, path.dirname(key).split("/".pop()));

            await fs.mkdir(commitDir, {recursive: true});

            // For reading  files
            const params = {
                Bucket : S3_BUCKET,
                Key: key,
            };

            const fileContent = await s3.getObject(params).promise();

            // jo bhi chize file se mil rahi hai usko write kar rahe hai
            await fs.writeFile(path.join(repoPath, key), fileContent.Body);
            console.log("All commits fulled from S3");
        }


    } catch (err) {
        console.error("Unable to pull : ", err);
    }

}

module.exports = { pullRepo };