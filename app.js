var restify = require('restify');
var builder = require('botbuilder');
var botMaker = require("./bot");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: "eaaf54a6-f264-4bdb-9138-6bf6fb13e1bd",
    appPassword: "pVYV582[unlnuySPGO39_?$"
};


server.post('/api/messages', connector.listen());

var bot = botMaker.createBot(connector);

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            // Bot is joining conversation
            if (identity.id === message.address.bot.id) {

                bot.beginDialog(message.address, 'Welcome');
            }
        });
    }
});