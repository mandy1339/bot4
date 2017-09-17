// IMPORTS
var Botkit = require('botkit');
var controller = Botkit.slackbot();
var request = require('request');           // http request support


// GLOBAL VARIABLES
weather_city = '';


//8d579adcdd567ec7b0fb936c1864fd89      WEATHER KEY

// EXAMPLE REQUEST USAGE
weather_city = 'London';
url = `http://api.openweathermap.org/data/2.5/weather?q=${weather_city}&APPID=8d579adcdd567ec7b0fb936c1864fd89&units=imperial`;
request.get(url, function(error, response, body) {
    if(error) {console.log('error: \n', error); return}
    parsedBody = JSON.parse(body);
    console.log(`There's:`, parsedBody.weather[0].main);
    console.log(`temperature:`, parsedBody.main.temp);
});

function weather_in(city, callback) {
    url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=8d579adcdd567ec7b0fb936c1864fd89&units=imperial`;
    request.get(url, function(error, response, body) {
        if(error) {console.log('error: \n', error); return}
        parsedBody = JSON.parse(body);
        var weather_main_temp;
        weather_main_temp += `There's ` + parsedBody.weather[0].main;
        weather_main_temp += ` and the temperature is ` + parsedBody.main.temp + ` F`;
        callback(weather_main_temp);
    });
}

weather_in('richmond', function(response) {
    console.log('response: ', response);
})

// ROUTING
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {
    bot.reply(message,`Hello yourself. Your user id is: ${message.user}`);
});

// slack username
controller.hears('whoami?', ['direct_message','direct_mention','mention'], (bot, message) => {
    bot.api.users.info({user: message.user}, (error, response) => {
        let {name, real_name} = response.user;
        console.log(name, real_name);
        bot.reply(message, `your name is ${real_name}`);
    })
})

// conversation
controller.hears('tacos','direct_mention, direct_message', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
        convo.say('Oh boy, taco time!');
        convo.ask('What type of taco do you want?', function(answer, convo) {
            var taco_type = answer.text;
            // do something with this answer!
            // storeTacoType(convo.context.user, taco_type);
            convo.say(`YUMMMM!!! ${taco_type}, AWESOME DUDE`); // add another reply
            convo.next(); // continue with conversation
        });
    });
});

// conversation 2
controller.hears('something', 'direct_mention, direct_message', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
        convo.addMessage('Series of questions', 'default');
        convo.addQuestion('do you want me to keep talking to you?', [
            {pattern: bot.utterances.yes, callback: function(response_message, convo){convo.say('YES');console.log('YES'); convo.gotoThread('question3')}},
            {pattern: bot.utterances.no, callback: function(response_message, convo){console.log('NO'); convo.stop();}},
            {default: true, callback: function(response_message, convo){console.log('QUIT'); convo.repeat(); convo.next();}}
        ]);
        // question 3
        convo.addQuestion('Do you want to continue this process?', [
            {pattern: bot.utterances.yes, callback: function(response_message, convo){convo.say('YES');console.log('YES'); convo.gotoThread('question4')}},
            {pattern: bot.utterances.no, callback: function(response_message, convo){console.log('NO'); convo.stop();}},
            {default: true, callback: function(response_message, convo){console.log('QUIT'); convo.repeat(); convo.next();}}
        ], {}, 'question3');
        // question 4
        convo.addQuestion('Do you want to take it even further?', [
            {pattern: bot.utterances.yes, callback: function(response_message, convo){convo.say('YES');console.log('YES'); convo.repeat(); convo.next()}},
            {pattern: bot.utterances.no, callback: function(response_message, convo){console.log('NO'); convo.stop();}},
            {default: true, callback: function(response_message, convo){console.log('QUIT'); convo.repeat(); convo.next();}}
        ], {}, 'question4');
    })
})

// weather
controller.hears('weather','direct_mention, direct_message', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
        convo.say('I think you want to know the weather!');
        convo.ask('What city do you want to know the weather of?', function(answer, convo) {
            
            var city = answer.text;
            weather_in(city, function(response){
                // do something with this answer!
                // storeTacoType(convo.context.user, taco_type);
                convo.say(`YUMMMM!!! ${response}, AWESOME DUDE`); // add another reply
                convo.next(); // continue with conversation    
            });
            
        });
    });
});

// simple response
controller.hears('a', ['direct_message','direct_mention','mention'],function(bot,message) {
    bot.reply(message,'you typed something with "a"');
});
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


// Initialise Bot
const bot = controller.spawn({
    token:require('./config').token
});

bot.startRTM(function(err, bot, payload) {
if(err){
    console.log(err);
    throw new Error('Could not connect to slack!');
}    
});






