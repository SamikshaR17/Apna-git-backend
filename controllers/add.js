const fs = require('fs').promises; // node file system, within this we need promises, iit is utility which helps to create files
const path = require("path"); // it will give current path to the directory(cwd=> current working directory ka access lenee ke liye)

// filePath=> we will get this fiel path from user, commming from index.js
async function addRepo(filePath){
    
    // gitting ".apnaGit" this repository path
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    
    // repoPath isme staging folder banega
    const stagingPath = path.join(repoPath, "staging");

    try{
        // stagingPath yaha pr folder banana chahiye & we will be able to create nested folders
        await fs.mkdir(stagingPath, {recursive: true});

        // user ne jo file provide ki thi, uss parameter ko hume lena hai
        // user ne jo bhi file path diya hai uss location me se filename nikalana hai
        const fileName = path.basename(filePath);

        // copy that file into our staging area
        // filePath => yaha se wo file leni hai
        // path.join(stagingPath, fileName) => staging path pr same fileName se file baanani hai  
        await fs.copyFile(filePath, path.join(stagingPath, fileName));

        console.log(`File ${fileName} added to the satging area!`);

    }catch(err){
        console.error("Error adding file", err);
    }
}

module.exports = {addRepo};