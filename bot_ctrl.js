'use strict';
require('sugar');
require('dotenv').load();

let util = require('util');
let github = require('./github_integ.js');
let trello = require('./trello_integ.js');

if (!process.env.BOTTOKEN) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

let Botkit = require('Botkit');
let os = require('os');

let controller = Botkit.slackbot({
    debug: true,
});

let bot = controller.spawn({
    token: process.env.BOTTOKEN
}).startRTM();


controller.hears(['hello','hi'],'direct_message,direct_mention,mention', (bot, message) =>{

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    },  (err, res) =>{
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(',err);
        }
    });


    controller.storage.users.get(message.user, (err, user) => {
        console.log(user);
        if (user && user.name) {
            bot.reply(message,'Hello ' + user.name + '!!');
        } else {
            bot.reply(message,'Hello.');
        }
    });
});

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',(bot, message) =>{
    let matches = message.text.match(/call me (.*)/i);
    let name = matches[1];
    controller.storage.users.get(message.user, (err, user) =>{
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, (err, id) =>{
            bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention', (bot, message) => {

    controller.storage.users.get(message.user, (err, user) => {
        if (user && user.name) {
            bot.reply(message,'Your name is ' + user.name);
        } else {
            bot.reply(message,'I don\'t know yet!');
        }
    });
});


controller.hears(['shutdown'],'direct_message,direct_mention,mention', (bot, message) =>{

    bot.startConversation(message, (err, convo) => {

        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: (response, convo) =>{
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(() => {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: (response, convo) =>{
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',(bot, message) =>{

    let hostname = os.hostname();
    let uptime = formatUptime(process.uptime());

    bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});

controller.hears(['hello','hi'],['direct_message','direct_mention','mention'], (bot,message) =>{
    bot.reply(message,"Hello.");
});

controller.hears(['attach'],['direct_message','direct_mention'], (bot,message) =>{

  let attachments = [];
  let attachment = {
    title: 'This is an attachment',
    color: '#FFCC99',
    fields: [],
  };

  attachment.fields.push({
    label: 'Field',
    value: 'A longish value',
    short: false,
  });

  attachment.fields.push({
    label: 'Field',
    value: 'Value',
    short: true,
  });

  attachment.fields.push({
    label: 'Field',
    value: 'Value',
    short: true,
  });

  attachments.push(attachment);

  bot.reply(message,{
    text: 'See below...',
    attachments: attachments,
  }, (err,resp) =>{
    console.log(err,resp);
  });
});

controller.hears(['dm me'],['direct_message','direct_mention'], (bot,message) =>{
  bot.startConversation(message, (err,convo) =>{
    convo.say('Heard ya');
  });

  bot.startPrivateConversation(message, (err,dm) =>{
    dm.say('Private reply!');
  });

});

controller.hears(['list git issues', 'git issues'],'direct_message,direct_mention,mention', (bot, message) => {

    github.getIssues((err, res)=>{
        if(err) {
            bot.reply(message, 'Failed.... Go check yourself');
            return;
        }
        bot.reply(message,util.format("```%s```", res));

    });
});


controller.hears(['list trello boards', 'trello boards'],'direct_message,direct_mention,mention', (bot, message) => {

    trello.getBoards((err, res)=>{
        if(err) {
            bot.reply(message, 'Failed.... Go check yourself');
            return;
        }
        bot.reply(message,util.format("```%s```", res));

    });
});

controller.hears(['trello lists for (.*)'],'direct_message,direct_mention,mention', (bot, message) => {
    let matches = message.text.match(/trello lists for (.*)/i);
    let board = matches[1];
    trello.getLists(board, (err, res)=>{
        if(err) {
            bot.reply(message, 'Failed.... Go check yourself');
            return;
        }
        bot.reply(message,util.format("```%s```", res));

    });
});

controller.hears(['trello cards for (.*)'],'direct_message,direct_mention,mention', (bot, message) => {
    let matches = message.text.match(/trello cards for (.*)/i);
    let list = matches[1];
    trello.getCardsByList(list, (err, res)=>{
        if(err) {
            bot.reply(message, 'Failed.... Go check yourself');
            return;
        }
        bot.reply(message,util.format("```%s```", res));

    });
});


function formatUptime(uptime) {
    let unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}