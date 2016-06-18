var Bot = require('slackbots');

var ticketRegex = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;

var token = process.env.SLACK_TOKEN;

// create a bot
var settings = {
    token: token,
    name: 'linkbot'
};

var bot = new Bot(settings);

var channels = [];
bot.getChannels().then(function (data) {
    channels = data.channels;
});

var users = [];
bot.getUsers().then(function (data) {
    users = data.members;
});

bot.on('message', function(message) {
    
    if(!isChatMessage(message)) {
           
    } else {

        if (isChannelMessage(message) && !isFromSelf(message)) {

            var messages = getJiraLinks(message.text);

            for (var i = 0; i < messages.length; i++) {
                bot.postMessageToChannel(getChannelNameById(message.channel), messages[i]);
            }
        }
    }
});

var user = '';
function getUser () {
    
   if(user !== '') {
       return user;
   }
    
    user = bot.users.filter(function(item) {
       return  item.name = bot.name;
    })[0];
    
    return user;
}

function getChannelNameById(channelId) {
    return bot.channels.filter(function (item) {
        return item.id === channelId;
    })[0].name;
}

function reverse(s){
    return s.split("").reverse().join("");
}

function isChannelMessage (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
}

function isFromSelf(message) {
    return message.user === user.id;
}

function isChatMessage(message) {
    return message.type === 'message' && message.text;
};

function getJiraLinks (messageText) {
    
    var matches = getMatches(messageText);
    
    return matches.map(getLink);  
}

function getMatches (msg){
    
    var matches = reverse(msg).match(ticketRegex);
       
    if(matches === null) {
        matches = [];
    }
    
    return matches.map(reverse);
}

function getLink(ticket) {
    return '<http://www.google.com/' + ticket + '|' + ticket + '>'; 
}
 