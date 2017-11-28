var request = require("request");
var yahoo = require("yahoo-finance");

exports.getStock = (companyName, callback) => {
    /* Get Ticker Name */
    getTickerName(companyName, callback); 
};

/* Gets the final stock price and calls a callback function */
function getStockPrice(companyData, callback) {
    yahoo.quote({
        symbol: companyData.symbol,
        modules: ['price']
    }, (err, quotes) => {
        if(err)
            return(console.log(err));

        if(!quotes || !quotes.price)
            return;
        
        
        companyData.price = quotes.price;

        callback(companyData);
    });
}


/*  Function that uses Yahoo's API to get the 
    suggested ticker name for a company */
function getTickerName(companyName, callback) {
    var url = `http://d.yimg.com/aq/autoc?query=${companyName}&region=US&lang=en-US`
    request(url, function(err, resp, body) {
        if(err)
            return (console.log(err));
            
        if(!body)
            return;
        var data = JSON.parse(body);
        if(!data || data.length == 0)
            return;
        var companyData = {
            name: data.ResultSet.Result[0].name,
            symbol: data.ResultSet.Result[0].symbol,
            exchange: data.ResultSet.Result[0].exchDisp
        }
        //console.log(data.ResultSet);
        /* Get the actual stock price */
        getStockPrice(companyData, callback);
    })
}

exports.buildStockCard = (data) => {
    var options = {  
        month: "long",  day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short"  
    };  

    var marketTime = new Date(data.price.postMarketTime || data.price.regularMarketTime);

    var changeString = "";
    var changeColour = "";
    var valueChange = parseFloat(data.price.regularMarketChange).toFixed(2);
    var valuePercentage = (parseFloat(data.price.regularMarketChangePercent)*100).toFixed(2);
    if(valueChange < 0) {
        changeColour = "attention"; // Red
        changeSymbol = "▼";

    } else {
        changeColour = "good"; // Green
        changeSymbol = "▲";
    }
    var stockCard = {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.0",
        "body": [
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": `${data.name} (${data.exchange}: ${data.symbol})`,
                        "size": "medium",
                        "isSubtle": true
                    },
                    {
                        "type": "TextBlock",
                        "text": marketTime.toLocaleTimeString("en-us", options),
                        "isSubtle": true
                    }
                ]
            },
            {
                "type": "Container",
                "spacing": "none",
                "items": [
                    {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "width": "stretch",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": data.price.regularMarketPrice.toString(),
                                        "size": "extraLarge"
                                    },
                                    {
                                        "type": "TextBlock",
                                        "text": `${changeSymbol} ${Math.abs(valueChange)} (${Math.abs(valuePercentage)}%)`,
                                        "size": "small",
                                        "color": changeColour,
                                        "spacing": "none"
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "width": "auto",
                                "items": [
                                    {
                                        "type": "FactSet",
                                        "facts": [
                                            {
                                                "title": "Open",
                                                "value": data.price.regularMarketOpen.toString() 
                                            },
                                            {
                                                "title": "High",
                                                "value": data.price.regularMarketDayHigh.toString()
                                            },
                                            {
                                                "title": "Low",
                                                "value": data.price.regularMarketDayLow.toString() 
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    return (stockCard);
    
}