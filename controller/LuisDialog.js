var builder = require('botbuilder');
var stocks = require('../API/stockAPI');
var booking = require("../API/bookingAPI");
var cognitive = require("../API/cognitiveAPI");


exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e83d3f5b-3fb7-4ca9-9bee-e806d2b38f40?subscription-key=3ea31847e9574a0ab50e5be888236823&verbose=true&timezoneOffset=0&q=');
    
    bot.recognizer(recognizer);

    bot.dialog('SearchStocks', [ function (session, args, next) {
        //console.log(args.intent);
        var companyObj = builder.EntityRecognizer.findEntity(args.intent.entities, 'company');
        
        if(!companyObj || companyObj == null || companyObj.entity == null)  {
            builder.Prompts.text(session, "Enter a company you want to get the stock value for:");
        } else {
            session.dialogData.company = companyObj.entity;
            next();
        }

    }, function (session, results, next) {

    
        if (results.response) {
            session.dialogData.company = results.response;
        }
         // let user know we're grabbing their data!
        session.sendTyping();
         
        stocks.getStock(session.dialogData.company, (data) => {
           
            var stockCard = stocks.buildStockCard(data);
            var msg = new builder.Message(session).addAttachment({
                contentType: "application/vnd.microsoft.card.adaptive",
                content: stockCard
            });
        
            session.endDialog(msg);
        
        })
    }]).triggerAction({
        matches: 'SearchStocks'
    });

    bot.dialog('BookAppointment', [(session, args, next) => {
        
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
            session.dialogData.time = results.response.resolution.start;
        }

        builder.Prompts.text(session, "What is this appointment for?");
    }, (session, results, next) => {
        session.dialogData.description = results.response;
        session.sendTyping();

        cognitive.analyseSentiment(session.dialogData.description, session, (session, body) => {
            var sentiment = Number(body.documents[0].score);

            var severity = "3"; // Defaults as Low severity

            if(sentiment > 0.3 && sentiment < 0.9) {
                severity = "2" // Normal
            } else if (sentiment <= 0.3) {
                severity = "1"; // High
            }



            var bookingData = {
                name: session.conversationData.username,
                time: session.dialogData.time,
                description: session.dialogData.description,
                severity: severity
            } // Severity can be 1 = High, 2 = Normal, 3 = Low
            
            var reviewCard  = booking.reviewBookingCard(bookingData);
            var msg = new builder.Message(session).addAttachment({
                contentType: "application/vnd.microsoft.card.adaptive",
                content: reviewCard
            });
    
            session.endDialog(msg);
        });
        


    }]).triggerAction({
        matches: 'BookAppointment'
    });

    bot.dialog("ViewAppointments",[(session, args, next) => {
        if(!session.conversationData.username) {
            builder.Prompts.text(session, "What is your name?");
        } else {
            next();
        }
    }, (session, results, next) => {
        if(results.response) {
            session.conversationData.username = results.response;
        }
        session.sendTyping();
        booking.getBookings(session, session.conversationData.username, (body, session, username) => {
            var bookings = JSON.parse(body);
            var attachments = [];
            for (var index in bookings) {
                var appointment = bookings[index];

                if(username.toLowerCase() == appointment.username.toLowerCase()) {  
                    attachments.push({
                        contentType: "application/vnd.microsoft.card.adaptive",
                        content: booking.genericBookingCard("Booking", appointment)
                    });
                }
            }

            var message = new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel).attachments(attachments);
            session.endDialog(message);
        });
    }]).triggerAction({
        matches: "ViewAppointments"
    });

    bot.dialog("DeleteAppointment",[(session, args, next) => {
        builder.Prompts.text(session, "Enter a delete code for an appointment: ");
    }, (session, results, next) => {
        if(results.response) {
            session.dialogData.code = results.response;
        }
        session.sendTyping();
        booking.deleteBooking(session, session.dialogData.code, (body, session) => {
            
            var msg = new builder.Message(session).addAttachment({
                contentType: "application/vnd.microsoft.card.adaptive",
                content:booking.genericBookingCard("Booking succesfully deleted!", JSON.parse(body))
            });
            
            session.send(msg);
            session.endDialog("The booking was successfully deleted.")
        })

    }]).triggerAction({
        matches:"DeleteAppointment"
    });

    bot.dialog("LeaveFeedback",[(session, args, next) => {
        builder.Prompts.text(session, "Please enter some feedback on your experience and tell us what we can do to make it better next time!")
    }, (session, results, next) => {

        cognitive.analyseSentiment(results.response, session, (session, body) => {
            var sentiment = body.documents[0].score;
            if(Number(sentiment) > 0.8) {
                session.endDialog("Your feedback has been noted! We're glad you had a pleasant experience!");
            } else {
                session.endDialog("Your feedback has been noted! We're sorry you didn't have a pleasant experience.");
            }
            
        });

    }]).triggerAction({
        matches: "LeaveFeedback"
    })  
   
    bot.dialog("Welcome",[(session, args, next) => {
        var facts = [
            {
                "title": "Get Stocks:",
                "value": "Get the stock value for Microsoft"
            },
            {
                "title": "Book an Appointment:",
                "value": "I'd like to book an appointment"
            },
            {
                "title": "View your appointments:",
                "value": "I'd like to view my appointments"
            },
            {
                "title": "Delete an appointment:",
                "value": "I'd like to delete an appointment"
            },
            {
                "title": "Leave us feedback:",
                "value": "I'd like to leave some feedback"
            }
        ]
        
        var card = {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                /*{
                    "type": "Container",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "Welcome to Contoso Bank!",
                            "weight": "bolder",
                            "size": "medium"
                        }
                    ]
                },*/
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": "auto",
                                    "items": [
                                        {
                                            "type": "Image",
                                            "url": "https://i.imgur.com/FH2VLut.png",
                                            "size": "large"
                                        }
                                    ]
                                },
                                {
                                    "type": "Column",
                                    "width": "stretch",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "text": "Welcome to the Contoso banking bot!\nHere's what you can try!",
                                            "weight": "bolder",
                                            "wrap": true
                                        },
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "FactSet",
                            "facts": facts
                        }
                    ]
                }
            ]
            
        }

        
        var msg = new builder.Message(session).addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content:card
        });

        session.send(msg).endDialog();

    }]).triggerAction({
        matches: "Welcome"
    })

    

}

