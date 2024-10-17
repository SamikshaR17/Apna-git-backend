const fs = require('fs').promises; // node file system, within this we need promises, iit is utility which helps to create files
const path = require("path"); // it will give current path to the directory(cwd=> current working directory ka access lenee ke liye)

async function initRepo() {
    // Repository ka path milega iss line se (.apnGit => hidden folder banane me help karge) (Ex: C:\Users\asus\Desktop\ApnaGit\backend>)
    const repoPath = path.resolve(process.cwd(), ".apnaGit");

    // commitPath iske ander aur ek folder chahiye therfore, path.join, within repoPath we want to make a folder commits(not hidden therfore no dot). 
    const commitPath = path.join(repoPath, "commits");

    try {
        // repoPath me "process.cwd()" yaha pr dir banana hai
        // recursive: true => we can make nested folders (.apnaGit & commits)
        await fs.mkdir(repoPath, { recursive: true });

        // will create commits folder, iske ander bhi aur chize ho sakhti hai
        await fs.mkdir(commitPath, { recursive: true });

        // will craete config.json file, in this file, we will keep when the last commit was done & all these things which comes from aws bucket 
        await fs.writeFile(path.join(repoPath, "config.json"),
            JSON.stringify({ bucket: process.env.S3_BUCKET }));

        console.log("Repository initialized!");

    } catch (err) {
        console.log("Error initializing repository", err);
    }
}

module.exports = { initRepo };