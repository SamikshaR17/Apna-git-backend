const fs = require('fs').promises; // node file system, within this we need promises, iit is utility which helps to create files
const path = require("path"); // it will give current path to the directory(cwd=> current working directory ka access lenee ke liye)
const {v4 : uuidv4} = require("uuid");

async function commitRepo(message){
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    
    // staging ke file ko commit me move karna hai , therefore we need staging path
    // "staging" => this should be teh same folder name
    const stagedPath = path.join(repoPath, "staging");

    const commitPath = path.join(repoPath, "commits");

    try{
        // creating unique id 
        const commitID = uuidv4();

        // new folder, jo commitID iss ID ke nam se banan hai
        // "commitPath" me "commitID" join hoga
        const commitDir =  path.join(commitPath, commitID);

        // craeting folder
        await fs.mkdir(commitDir, {recursive: true});

        // staging folder me jo file hai, usko move/copy karna hai commitDir folder me 
        // this line will read all the files which are presnet inside the satgedPath
        const files = await fs.readdir(stagedPath);

        // loop for copying/moving
        for(const file of files){

            // copyFile has 2 arguments - 
            // initial path => path.join(stagedPath, file) => file is a name of a file
            // final path => path.join(commitDir, file) => file is a name of a file
            await fs.copyFile(path.join(stagedPath, file), path.join(commitDir, file))
        }

        // creating file
        // file kaha pr banani hai = commitDir
        // file kis name se banani hai = commit.json
        // uss file me kya data jana chahiye = message(comes from command(index.js)), time
        // JSON.stringify (stringify => will convert JS to JSON)
        await fs.writeFile(path.join(commitDir, "commit.json"), JSON.stringify({message, date: new Date().toISOString()}));
    
        console.log(`Commit ${commitID} created with message : ${message}`)
    }catch(err){
        console.error("Error commiting files : ", err);
    }
}

module.exports = {commitRepo};