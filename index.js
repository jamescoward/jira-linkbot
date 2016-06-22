var Bot = require('slackbots');

var ticketRegex = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;

// This will get the slack token passed to SLACK_TOKEN
// You can hard code this if you like.
var token = process.env.SLACK_TOKEN;
var url = process.env.JIRA_URL;

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

var groups = [];
bot.getGroups().then(function (data) {
    groups = data.groups;
});


var users = [];
bot.getUsers().then(function (data) {
    users = data.members;
});



bot.on('message', function (message) {
    console.log(message.channel);

    // Only respond to messages in a channel that are not sent by the bot itself
    if (isChatMessage(message) && (isChannelMessage(message) || isGroupMessage(message)) && !isFromSelf(message)) {
        var responses = getJiraLinks(message.text);

        var room;
        if(isChannelMessage(message)) {
            room = getChannelNameById(message.channel);
        } else if( isGroupMessage(message)) {
            room = getGroupNameById(message.channel);
        } else {
            return;
        }


        for (var i = 0; i < responses.length; i++) {
            bot.postMessageToChannel(getChannelNameById(room), responses[i], messageParams);
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
    // return bot.channels.filter(function (item) {
    //   return item.id === channelId;
    //})[0].name;
    return getRoomTypeById(channelId, channels);
}

function getGroupNameById(groupId) {
    return getRoomTypeById(groupId, groups);
}

function getRoomTypeById(id, rooms) {
    return rooms.filter(function (item) {
        return item.id === id;
    })[0].name;
}

function reverse(s){
    return s.split("").reverse().join("");
}

function isChannelMessage (message) {
    return getMessageType(message, 'C');
}

function isGroupMessage (message) {
    return getMessageType(message, 'G');
}

function getMessageType(message, type) {
    return typeof message.channel === 'string' &&
        (message.channel[0] === type);
}

function isFromSelf(message) {
    return message.user === user.id;
}

function isChatMessage(message) {
    return message.type === 'message' && message.text;
}

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
    return '<' + url + '/' + ticket + '|' + ticket + '>';
}

