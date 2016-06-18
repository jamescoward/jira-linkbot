var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here! Ready to to post some links!")
});

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello. Do you need any links?')
});

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'If you post text that looks like a Jira ticket ID, I\'ll get the link for you :wink:';
  bot.reply(message, help)
})

controller.hears([/\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g], ['message_received'], areMatches, function(bot,message) {

    bot.reply(message, 'Looking for these?');

    var links = getJiraLinks(message);

    links.forEach(function (link) {
        bot.reply(message, link);
    });

});

function areMatches(patterns, message) {

    for(var i = 0; i < patterns.length; i++) {
        var pattern = patterns[i];
        var matches = getMatches(pattern, message);
        if (matches.length > 0) {
            return true;
        }
    }

    return false;
}

function getJiraLinks (messageText) {    
    return getMatches(messageText).map(getLink);  
}

function getMatches (pattern, msg){
    
    var matches = reverse(msg).match(pattern);
       
    if(matches === null) {
        matches = [];
    }
    
    return matches.map(reverse);
}

function getLink(ticket) {    
    return '<http://www.google.com/' + ticket + '|' + ticket + '>';
}