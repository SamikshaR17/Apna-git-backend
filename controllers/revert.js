const fs = require('fs'); // node file system, this time we need full file system
const path = require("path"); // it will give current path to the directory(cwd=> current working directory ka access lenee ke liye)
const {promisify} = require("util"); //util is a package, preinstalled with node, allows us to check for existing things, if the given commitId is not exist then we can't do anything therefore we need promisify

// If there exist a commit file with that name, if yes then copy that file in oarent directory

// if directory exist then only read otherwise coresponding error msg will be printed
// We are overriding the function which exist inside promisify
const readdir = promisify(fs.readdir);

// We will be copying there
const copyFile = promisify(fs.copyFile);

async function revertRepo(commitID){
    const repoPath = path.resolve(process.cwd(), ".apnaGit");

    const commitsPath = path.join(repoPath, "commits");

    try{

        // trying to read commitid inside commit folder, commitid provided by the user
        const commitDir = path.join(commitsPath, commidID);

        // trying to read commitdir path
        // readdir => our custom path, which contains promisify
        const files = await fs.readdir(commitDir);

        // kaha move karna hai, kis parent dir me move karna hai
        // moving 2 folders outside
        const parentDir = path.resolve(repoPath, "..")

        // There must be multiple files
        for(const file of files){
            // path.join(commitDir, file) => copying from this folder
            // path.join(parentDir, file) => pasting to this folder
            await copyFile(path.join(commitDir, file), path.join(parentDir, file));
        }

        console.log(`Commit ${commitID} reverted successfully!`);
    }catch(err){
        console.error("Unable to revert : ", err);
    }
}

module.exports = {revertRepo};