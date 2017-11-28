module.exports = [
    {
        out:"get stock value for",
    }, 
    {
        in: "Enter a company you want to get the stock value for:",
        out: "Tesla"
    }, 
    {
        type: "typing",
    },
    {
        in: (message, callback) => {
            if(message.attachments && message.attachments[0].contentType == 'application/vnd.microsoft.card.adaptive') {
                callback();
            } else {
                callback("Did not receive an adaptive card for stocks");
            }
        },
    }
];