var builder = require('botbuilder');
var stocks = require('../API/stockAPI');
var booking = require("../API/bookingAPI");



exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e83d3f5b-3fb7-4ca9-9bee-e806d2b38f40?subscription-key=3ea31847e9574a0ab50e5be888236823&verbose=true&timezoneOffset=0&q=');
    
    bot.recognizer(recognizer);

    bot.dialog('SearchStocks', function (session, args) {

        var companyObj = builder.EntityRecognizer.findEntity(args.intent.entities, 'company');
        
        if(!companyObj || companyObj == null || companyObj.entity == null) 
            return;

        // let user know we're grabbing their data!
        session.sendTyping();

        stocks.getStock(companyObj.entity, (data) => {
            console.log(data.price);
            var stockCard = stocks.buildStockCard(data);
            var msg = new builder.Message(session).addAttachment({
                contentType: "application/vnd.microsoft.card.adaptive",
                content: stockCard
            });

            session.send(msg);

        })
    }).triggerAction({
        matches: 'SearchStocks'
    });

    bot.dialog('BookAppointment', [(session, args, next) => {
        console.log(args);
        session.dialogData.args = args || {};
        if(!session.conversationData.username) {
            builder.Prompts.text(session, "What is your name?");
        } else {
            next();
        }
         
        },(session, results, next) => {
            if(results.response)
                session.conversationData.username =  results.response;
        

        args = session.dialogData.args;
        if(!args)
            console.log("Args doesnt exist!");

        var timeObj = args.intent.entities[0];
        
  

        if(!timeObj || timeObj == null || timeObj.entity == null) {
            builder.Prompts.time(session, "What time do you want to set the appointment for?");
        } else {
            session.dialogData.time = builder.EntityRecognizer.parseTime(timeObj.entity);
          
            next()
        }
    }, (session, results, next) => {
        if(results.response) {
            session.dialogData.time = builder.EntityRecognizer.parseTime(results.response);
        }

        builder.Prompts.text(session, "What is this appointment for?");
    }, (session, results, next) => {
        session.dialogData.description = results.response;

        var bookingData = {
            name: session.conversationData.username,
            time: session.dialogData.time,
            description: session.dialogData.description,
        } // Severity can be 1 = High, 2 = Normal, 3 = Low
        
        var reviewCard  = booking.reviewBookingCard(bookingData);
        var msg = new builder.Message(session).addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content: reviewCard
        });

        session.endDialog(msg);


    }, (session, results, next) => {
        console.log(results);
    }]).triggerAction({
        matches: 'BookAppointment'
    });

   

    

}

