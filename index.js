var Bot = require('slackbots');

var ticketRegex = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;

// This will get the slack token passed to SLACK_TOKEN
// You can hard code this if you like.
var token = process.env.SLACK_TOKEN;

// create a bot
var settings = {
    token: token,
    name: 'jira-linkbot'
};

var messageParams = {
    icon_emoji: ':sunglasses:'
}

var bot = new Bot(settings);

// Get the list of channels and users
var channels = [];
bot.getChannels().then(function (data) {
    channels = data.channels;
});

var users = [];
bot.getUsers().then(function (data) {
    users = data.members;
});

bot.on('message', function (message) {
    // Only respond to messages in a channel that are not sent by the bot itself
    if (isChatMessage(message) && isChannelMessage(message) && !isFromSelf(message)) {
        var responses = getJiraLinks(message.text);

        for (var i = 0; i < responses.length; i++) {
            bot.postMessageToChannel(getChannelNameById(message.channel), responses[i], messageParams);
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
    // change the first half of this to the correct url
    return '<http://www.google.com/' + ticket + '|' + ticket + '>'; 
}
 