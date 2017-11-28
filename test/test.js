var test = require("./toolkit");
/* Conversational Flows */
var stockFlow = require("./flows/stockFlow");
var positiveFeedbackFlow = require("./flows/positiveFeedbackFlow.js");
var negativeFeedbackFlow = require("./flows/negativeFeedbackFlow.js");
var appointmentFlow = require("./flows/appointmentFlow.js");

describe("Bot Conversational Flows", () => {
    
    it("Stocks", function(done) {
        this.timeout(15000);
        test.testConversationalLogic(stockFlow, done);
    });

    it("Positive Feedback Sentiment Analysis", function(done) {
        this.timeout(10000);
        test.testConversationalLogic(positiveFeedbackFlow, done);
    });

    it("Negative Feedback Sentiment Analysis", function(done) {
        this.timeout(10000);
        test.testConversationalLogic(negativeFeedbackFlow, done);
    });

    it("Appointment Booking", function(done) {
        this.timeout(15000);
        test.testConversationalLogic(appointmentFlow.bookAppointment, done);
    })
    
    it("Appointment Viewing", function(done) {
        this.timeout(15000);
        test.testConversationalLogic(appointmentFlow.viewAppointments, done);
    })

});

