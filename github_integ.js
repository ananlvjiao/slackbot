'use strict';

require('sugar');
require('dotenv').load();

let util = require('util');
let GitHubApi = require("github");

let githubTask = module.exports = {};

let github = new GitHubApi({
    version: "3.0.0"
});

github.authenticate({
    type: "oauth",
    token: process.env.GITTOKEN
});



githubTask.getIssues = function(done) {
		github.issues.repoIssues({
		user:"ananlvjiao",
		repo:process.env.REPO
	}, (err, res)=>{
		if(err) return done(err);
		done(null, formatIssues(res));
	});
}


function formatIssues(issues)
{
	let issueStrs = [];
	issues.map( i=>{
		issueStrs.push(util.format(' %s %s', i.user.login, i.title));
	});
	return issueStrs.join('\n');
}

// githubTask.getIssues((err, res) =>{
// 	console.log(err, res);
// });