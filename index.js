const Discord = require('discord.js');
const FuzzySet = require('fuzzyset.js');
var api = require('./api.js').api;
var fs = require('./fs.js');
var utils = require('./utils.js');

//data
const items = require('./items.js').items;
const token = require('./secret.js').token

var client = new Discord.Client();
var fuzzy = FuzzySet(items, false);

const markets = ["jita", "perimeter", "universe", "amarr", "dodixie", "hek", "rens"]
const ACCEPTED_CHANNELS_FILENAME = 'accepted_channels.csv';
const OFFICERS_FILENAME = 'officers.csv';
const MARKET_FILENAME = 'market.txt';
const PERCENTAGE_FILENAME = 'percentage.txt';

let officers = fs.readCsv(OFFICERS_FILENAME)
let accepted_channels = fs.readCsv(ACCEPTED_CHANNELS_FILENAME)
let market = fs.read(MARKET_FILENAME)
let percentage = fs.read(PERCENTAGE_FILENAME)

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: "online", //You can show online, idle....
        activity: {
            name: "Evepraisal", //The message shown
            type: "PLAYING" //PLAYING: WATCHING: LISTENING: STREAMING:
        }
    });
});


client.on('message', msg => {
    try {
        //don't react to messages from itself
        if (msg.author.id === '841662638811250699') {
            return null;
        }
        regex = /^[!a-zA-Z0-9]+$/;
        if (!msg.content[0].match(regex)) {
            return null;
        }
        //setup and help
        switch (msg.content) {
            case '!init-evepraisal':
                if (!(accepted_channels.indexOf(msg.channel.id) > -1)) {
                    accepted_channels.push(msg.channel.id)
                    fs.write(ACCEPTED_CHANNELS_FILENAME, accepted_channels)
                    msg.reply(`Channel registered: ${msg.channel.id}`)
                }
                return null;
            case '!rm-evepraisal':
                if ((accepted_channels.indexOf(msg.channel.id) > -1)) {
                    accepted_channels = accepted_channels.filter(e => e !== msg.channel.id);
                    fs.write(ACCEPTED_CHANNELS_FILENAME, accepted_channels)
                    msg.reply(`Channel unregistered`)
                }
                return null;
        }
        //From now, only reply if message origined from channel
        if (!(accepted_channels.indexOf(msg.channel.id) > -1)) {
            return null;
        }
        try {
            switch (msg.content[0]) {
                case '@':
                case '!':
                    adminReply(msg)
                    break;
                default:
                    contentArray = msg.content.split("\n");
                    input = []
                    contentArray.map(line => {
                        line = line.trim().replace(/[\s]{2,}/g, " ") //remove extra spaces
                        line_reg = line.trim().match(".+?(?=(\\s[1-9][,0-9]*))");
                        quantity = 1
                        item_name = ""
                        if (!line_reg || line_reg[0] === "") {
                            line_reg = line.trim().match("([1-9][,0-9]*)|\\d\\s|\\s\\d\\s|\\s(?=(.*))");
                            if (!line_reg || line_reg[0] === "") {
                                item_name = line //I guess theres no numbers, so treat as solo
                            } else {
                                line = line.replace(/[x*]\s/, " ")
                                quantity = Number(line.match("[1-9][,0-9]*")[0].replace(/[,]/g, ''))
                                item_name = line.match("([1-9][,0-9]*)(?=(\\s.*))")[2].trim();
                            }
                        } else {
                            item_name = line_reg[0].trim()
                            quantity = Number(line_reg[1].trim().replace(/[,]/g, ''))
                        }
                        //Check if item_name is actually an item.
                        found_item = fuzzy.get(item_name, null, 0.70);
                        if (!found_item) {
                            console.error(`Could not find eve item match for ${item_name}`)
                            return null;
                        }
                        input.push({ "name": found_item[0][1], "quantity": quantity })
                    })
                    api(msg, input, market, percentage)
                    break;
            }
        } catch (e) {
            console.error("Error: ", e)
            return null;
        }
    } catch (e) {
        return null;
    }
});

const adminReply = (msg) => {
    if (!(officers.indexOf(msg.author.id) > -1)) {
        throw `Permission denied: ${msg.author.id}`
    }
    string = msg.content.split("!")[1].split(" ")[0]
    if (string && string != "") {
        if (string === "help") {
            msg.reply(`\`\`\`bash
!init-evepraisal (register channel)
!rm-evepraisal   (unregister channel)
!market          (change market)     | example: !jita
!number          (change percentage) | example: !90 
            \`\`\``)
            return null;
        } else if (utils.isNumeric(string)) {
            if ((Number(string) > 0) && (Number(string) < 101)) {
                percentage = Number(string)
                fs.write(PERCENTAGE_FILENAME, percentage.toString())
                msg.reply(`Hello PxKn Officer.\nPercentage now changed to: **${percentage}%**`);
                msg.react('💸')
                return null;
            } else {
                throw "Percentage only between 1 and 100 allowed."
            }
        } else {
            if (markets.indexOf(string.toLowerCase()) > -1) {
                market = string;
                fs.write(MARKET_FILENAME, market.toString())
                msg.reply(`Hello PxKn Officer.\nMarket now changed to: **${market}**`);
                msg.react('📈')
                return null;
            } else {
                throw `Unrecognised market, choose one of the following: ${JSON.stringify(markets)}`
            }
        }
    }
}

client.login(token);