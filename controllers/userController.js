// FOR SIGNUP => requiring 3 packages => 1. JSON webtoken(beacuse this will be a JWT based authentication) 2. 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb')
const dotenv = require('dotenv');

// object id from mongodb package
// id ko jab hum url pas=rameter se fetch karne wale hai, to usko hume mongodb ke format me convert kar lenge
var objectId = require("mongodb").ObjectId;

dotenv.config();
const uri = process.env.MONGODB_URI;

// client varisble will establish connection
let client;

// connection to db logic, bcoz we need connection before doing any task 
async function connectClient() {
    // if client is not connected to mongodb, then connect to the URI and these 2 parameters are required for connecting to mongodb
    if (!client) {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTOpology: true });

        // wait till the connection is established
        await client.connect();
    }
}

// For individuls user creation
async function signup(req, res) {
    const { username, password, email } = req.body;
    try {
        await connectClient();
        // githubclone is our db name, basically we are trying to accesss a particular database
        const db = client.db("githubclone");

        // Accessing users collection, if collection not exists then will create
        const userCollection = db.collection("users");

        // Accessing user from db
        const user = await userCollection.findOne({ username });

        // if user me kuch bhi value aati hai, then no need to create a new user
        if (user) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // creating new user
        // 10 baar encrypt karega to reach a secure setup
        // salt => 10 Number of rounds to use, defaults to 10
        const salt = await bcrypt.genSalt(10);

        // user cha password ani salt la mix karun hashedPass will generate, this will go to the db, not the user's original password
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUser: [],
            starRepos: []
        }

        // we are insering a new user into db
        const result = await userCollection.insertOne(newUser);

        // if successfully insert, then we need to return a token
        // sign is a method provided by jwt
        // jo abhi isert kiya tha uske ander ek id milti hai, created by mongodb automatically
        // and we need to provide a secret key, this can be anything
        // and expiry, after how many days ttoken will expire(1 hour)
        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })
        res.json({ token, userId:result.insertId})
    } catch (err) {
        console.error("Error during signup: ", err.message);
        res.status(500).send("Server error");
    }

};

async function login(req, res) {
    const { email, password } = req.body;

    // 3steps => connection establish, find user if user is already their if credentials are correct, token ko check karna if token is not valid then we need to re-create the token if token is valid then we will extend its duration 
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollection = db.collection("users");
        const user = await userCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // creating new token for every session(login to logout(1h))
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, userId: user._id });

    } catch (err) {
        console.error("Error during login: ", err.message);

        // if server is not running / db connection issue
        res.status(500).send("Server error");
    }
}

// we need this for search results, if user search something then we will show users & repo. lit
async function getAllUsers(req, res) {
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollection = db.collection("users");

        // this line will generate an error, as it is not able to convert it into json format as it is in array of objects format
        // const users = await userCollection.find({});

        // therefore
        const users = await userCollection.find({}).toArray();

        res.json(users);
    } catch (err) {
        console.error("Error during fetching: ", err.message);

        // if server is not running / db connection issue
        res.status(500).send("Server error");
    }
};


// CRUD

// this can be based on unique id / mail
async function getUserProfile(req, res) {
    // it is a string
    const currentId = req.params.id;

    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollection = db.collection("users");
        const user = await userCollection.findOne({
            // and _id is a class therefore objectId
            _id: new objectId(currentId)
        });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.send(user);
    } catch (err) {
        console.error("Error during fetching profile: ", err.message);

        // if server is not running / db connection issue
        res.status(500).send("Server error");
    }
};

// If the user is logged in then updateUserProfile & deleteUserProfile
async function updateUserProfile(req, res) {
    const currentId = req.params.id;

    // username is not gone update as it is a unique
    // these 2 fields, bcoz that can be updated
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollection = db.collection("users");

        let updateFields = { email };
        // if password is provided then do encryption again
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // password will also update
            updateFields.password = bcrypt.hashedPassword
        }

        const result = await userCollection.findOneAndUpdate({
            _id: new objectId(currentId),
        }, 
        
        // Jo bhi value updateField me hai usko hame store kar dena hai
        {$set:updateFields},
        
        // after updation will done uske baad hume response me updated document hume milni chahiye, to show user that this field is updated
        { returnDocument:"after"}
        );

        // if result is uccessful /not
        // no value returned, means process fail
        if(!result.value){
            return res.status(404).json({message:"User not found"});
        }

        res.send(result.value);
        
    } catch (err) {
        console.error("Error during updating profile: ", err.message);
        // if server is not running / db connection issue
        res.status(500).send("Server error");
    }
};

async function deleteUserProfile(req, res) {
    const currentId = req.params.id;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const userCollection = db.collection("users");

        const result = await userCollection.deleteOne({
            _id:new ObjectId(currentId)
        })

        if(result.deleteCount == 0){
            return res.status(404).json({message:"User not found"});
        }
        res.json({message:"User deleted"});
    } catch (err) {
        console.error("Error during fetching profile: ", err.message);

        // if server is not running / db connection issue
        res.status(500).send("Server error");
    }
};

module.exports = {
    getAllUsers, signup, login, getUserProfile, updateUserProfile, deleteUserProfile
}