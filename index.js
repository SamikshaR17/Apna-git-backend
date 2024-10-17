const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router.js");

const yargs = require('yargs');


const { hideBin } = require('yargs/helpers');

const { initRepo } = require('./controllers/init.js');
const { addRepo } = require('./controllers/add.js');
const { commitRepo } = require('./controllers/commit.js');
const { pushRepo } = require('./controllers/push.js');
const { pullRepo } = require('./controllers/pull.js');
const { revertRepo } = require('./controllers/revert.js');

// .env file me ke sare values will be enebled to process
dotenv.config();

yargs(hideBin(process.argv))
    // This command is to start the server
    .command("start", "Starts a new server", {}, startServer)

    .command("init", "Initialize a new Repository", {}, initRepo)

    .command("add <file>", "Add a file to the Repository", (yargs) => {
        yargs.positional("file", {
            describe: "File to add to the staging area",
            type: "string",
        })
    },
        // argument ko pass karna to use in add.js file as a function argumnet, argv will give all the arguments coming from the command  
        // "argv.file" likha hai kyu ki "add <file>" likha hai, if we will write "add <filename>" then "argv.filename"
        (argv) => {
            addRepo(argv.file)
        })

    .command("commit <message>", "Commit the staged files", (yargs) => {
        yargs.positional("message", {
            describe: "Commit message",
            type: "string",
        })
    },
        (argv) => {
            commitRepo(argv.message)
        })

    .command("push", "Push commits to S3", {}, pushRepo)

    .command("pull", "Pull commands from S3", {}, pullRepo)

    .command("revert <commitID>", "Revert to a specific commit", (yargs) => {
        yargs.positional("commitID", {
            describe: "Commit Id to revert to",
            type: "string",
        })
    },
        (argv) => {
            revertRepo(argv.commitID)
        })

    .demandCommand(1, "You need atleast 1 command")
    .help().
    argv;



function startServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(bodyParser.json());
    app.use(express.json());
    const mongoURI = process.env.MONGODB_URI;
    mongoose.connect(mongoURI)
        .then(() => console.log("Mongo connected"))
        .catch((err) => console.error("Unable to connected: ", err));

    app.use(cors({ origin: "*" }));

    // when user gon to home page, then redirect them to the mainRouter
    app.use("/", mainRouter);
    

    let user = "test";

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    // whenever this server will be triggerd, this will be called to etablish  a connection
    io.on("connection", (socket) => {
        // we want to add the user to that connection
        socket.on("joinRoom", (userID) => {
            user = userID;
            console.log("====");
            console.log(user);
            console.log("====");
            socket.join(userID);
        });
    });


    // Database
    const db = mongoose.connection;

    db.once("open", async () => {
        console.log("CRUD operations called");
        // crud operations
    });

// creating server
httpServer.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})
}