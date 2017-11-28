module.exports.bookAppointment = [
    {
        out:'I\'d like to book an appointment',
    }, 
    {
        in: 'What is your name?',
        out: 'Sukhans'
    }, 
    {
        in: 'What time do you want to set the appointment for?',
        out: '10 PM'
    }, 
    {
        in: 'What is this appointment for?',
        out: 'Routine password change',
    }, 
    {
        type: "typing",
    },
    {
        in: (message, callback) => {
            if(message.attachments && message.attachments[0].contentType == 'application/vnd.microsoft.card.adaptive') {
                callback();
            } else {
                callback("Did not receive an adaptive card for appointments");
            }
        },
    }
];

module.exports.viewAppointments = [
    {
        out:'I\'d like to view my appointments',
    }, 
    {
        in: 'What is your name?',
        out: 'Sukhans'
    }, 
    {
        type: "typing",
    },
    {
        in: (message, callback) => {
            console.log(message);
            if(message.attachments && message.attachments[0].contentType == 'application/vnd.microsoft.card.adaptive') {
                callback();
            } else {
                callback("Did not receive an adaptive card for viewing appointments");
            }
        },
    }
];