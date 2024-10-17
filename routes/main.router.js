const express = require("express");

const userRouter = require("./user.router.js");
const repoRouter = require("./repo.router.js");
const issueRouter = require("./issue.router.js");

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);

mainRouter.get("/", (req, res) => {
    res.send("Welcome");
});

module.exports = mainRouter;

// From index.js se idher aayenge when we go to '/' page
// agar yaha pr '/' (home) ka hai to welcome send hoga
// nahi to userRouter pr refirect honge