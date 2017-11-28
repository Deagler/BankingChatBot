var builder = require('botbuilder');
var botMaker = require("../bot");
var assert = require("assert");

module.exports.testConversationalLogic = (flow, done) => {
    var connector = new  builder.ConsoleConnector();
    
    var step = 0;
    var bot = botMaker.createBot(connector);
    
    bot.on("send", function (incomingMessage) {
        
       if ((step+1) <= flow.length) {
           var toTest = flow[step];

            verifyIncomingMessage(incomingMessage, toTest, (err) => {
                if(err) {
                    console.error(err);
                    assert(false);
                   // done();
                   return;
                }
               
                if(flow[step].out) {
                    connector.processMessage(flow[step].out);
                }
                step++;
                if(step >= flow.length) {
                    setTimeout(done,100);
                }
           });
       }
    })

    if(flow[0].out) {
        connector.processMessage(flow[0].out);
    }
}
/*  Verifies the incoming message based on a dialogFlow,
    Make sure to call the callback with empty arguments if successful test,
    otherwise provide an error.
*/
function verifyIncomingMessage(message, toTest, callback) {
    if(toTest.type) {
        assert(message.type == toTest.type);
    }

    if (typeof(toTest.in) == 'function') {
        return (toTest.in(message, callback));
    } else if (toTest.in) {
        
       // console.log(`Message:'${message.text} ToTest:${toTest.in} Valid:${message.text != toTest.in}`);
        if(message.text != toTest.in) {
            console.error(`'${message.text}' does not match '${toTest.in}'`)
            assert(false);
        }
    }
    return (callback());
}