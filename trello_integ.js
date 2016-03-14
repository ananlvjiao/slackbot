'use strict';

require('sugar');
require('dotenv').load();

let util = require('util');
let Trello = require("node-trello");
let trello = new Trello(process.env.TRELLOKEY, process.env.TRELLOTOKEN);
 
let trelloTask = module.exports = {};

let bakerTrelloMap = {
	orgId: "56a9239b31ab8a520b774a94",
	dev:"56a925badfc6d7436b228f9a",
	bd:"56a925c854b9e259e10fb9a7",
	design:"56a925d104da7dc603cd7ed9"
};

trelloTask.getBoards= function(done){

	trello.get("/1/organizations/56a9239b31ab8a520b774a94/boards", function(err, data) {
	  if (err) return done(err);
	  let res = [];
	  data.map(d =>{
		res.push(util.format(' %s', d.name));	  	
	  });
	  done(null, res.join('\n'));
	});

};

trelloTask.getActionsByBoard = function(board, done){
	let bid = bakerTrelloMap[board];
	trello.get("/1/boards/"+bid+"/actions?limit=10", function(err, data) {
	  if (err) return done(err);
	  let res = [];
	  console.log(data);
	  data.map(d =>{
		res.push(util.format(' %s %s', d.memberCreator.fullName, d.type));	  	
	  });
	  done(null, res.join('\n'));
	});

};

trelloTask.getLists = function(board, done){
	let bid = bakerTrelloMap[board];
	trello.get("/1/boards/"+bid+"/lists", function(err, data) {
	  if (err) return done(err);
	  let res = [];
	  data.map(d =>{
		res.push(util.format(' %s %s', d.name, d.id));	  	
	  });
	  done(null, res.join('\n'));
	});

};

trelloTask.getCardsByList = function(listId, done){
	trello.get("/1/lists/"+listId+"/cards", function(err, data) {
	  if (err) return done(err);
	  let res = [];
	  data.map(d =>{
		res.push(util.format(' %s %s', d.name, d.id));
	  });
	  done(null, res.join('\n'));
	});
};


// trelloTask.getActionsByBoard('dev',(err, res) =>{
// 	console.log(err, res);
// });

