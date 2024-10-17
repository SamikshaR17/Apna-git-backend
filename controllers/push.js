const fs = require('fs').promises; // node file system, within this we need promises, iit is utility which helps to create files
const path = require("path"); // it will give current path to the directory(cwd=> current working directory ka access lenee ke liye)
const {s3, S3_BUCKET} = require("../config/aws-config.js");


async function pushRepo(){
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    
    const commitsPath = path.join(repoPath, "commits");

    try{ 
        // All files we are reading from commitPath directory
        const commitDirs = await fs.readdir(commitsPath);

        // loop to push all files/sub-folders from every directory
        // We want to push all commits, not only 1
        
        // This loop for every commit(folder level)
        for(const commitDir of commitDirs){
            const commitPath = path.join(commitsPath, commitDir);
            
            // External loop can conatins multiple file
            const files = await fs.readdir(commitPath);

            // This loop for every commit(file level)
            for(const file of files){

                // each file inside the folder
                const filePath = path.join(commitPath, file);

                // storing same file's content
                const fileContent = await fs.readFile(filePath);

                // properties which we need to send to aws
                const params = {

                    // Service konsi hai aws ki, bucket ka naam
                    Bucket: S3_BUCKET,

                    // bucket ke ander folder path kya hona chahiye
                    // commits naame ke folder ke ander commitId hoga uske ander jo read ki hai file uska content store karna hai 
                    Key:`commits/${commitDir}/${file}`,

                    Body : fileContent,
                }

                await s3.upload(params).promise();
            }
        }

        console.log("All commits pushed to S3");
    }catch(err){
        console.error("Error pushing to S3 : ", err);
    }
}

module.exports = {pushRepo};