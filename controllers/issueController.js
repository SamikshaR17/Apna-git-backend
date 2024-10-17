const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

// Creating Issue
async function createIssue(req, res) {
    const { title, description } = req.body;
    const { id } = req.params;
    try {
        const issue = new Issue({
            title, description, repository: id,
        });
        await issue.save();
        res.status(201).json(issue);
    } catch (err) {
        console.error("Error during creating issue : ", err.message);
        res.status(500).send("Server error");
    }
};

// For getting all repo
async function updateIssueById(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;
    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }
        issue.title = title;
        issue.description = description;
        issue.status = status;

        await issue.save();
        res.json(issue, {message:"Issue updated"});
    } catch (err) {
        console.error("Error during updating issue : ", err.message);
        res.status(500).send("Server error");
    }
};

// this can be based on unique id 
async function deleteIssueById(req, res) {
    const { id } = req.params;

    try {
        const issue = await Issue.findByIdAndDelete(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }
        res.json({message:"Issue deleted"});
    } catch (err) {
        console.error("Error during deleting issue : ", err.message);
        res.status(500).send("Server error");
    }
};

// for searching by name of repo
async function getAllIssues(req, res) {
    const { id } = req.params;

    try {
        const issues = await Issue.find({repository:id});
        if (!issues) {
            return res.status(404).json({ error: "Issue not found!" });
        }
        res.status(200).json(issues);
    } catch (err) {
        console.error("Error during fetching all issues : ", err.message);
        res.status(500).send("Server error");
    }
};

// getting a single issue fetails
async function getIssueById(req, res) {
    const { id } = req.params;

    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }
        res.json(issue);
    } catch (err) {
        console.error("Error during fetching issue by id : ", err.message);
        res.status(500).send("Server error");
    }
};

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById,
};