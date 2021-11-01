import { Client, Intents } from 'discord.js';
import FuzzySet from 'fuzzyset.js';
import { api } from './api.js';
import { reply } from './reply.js';
import { readCsv, read, readJson, write } from './utils/fs.js';
import { isNumeric } from './utils/utils.js';
let corp_members = readJson('./data/corp/members.json');

var client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    restRequestTimeout: 300000
});

const AVAILABLE_MARKETS = process.env.AVAILABLE_MARKETS.split(",");
const ACCEPTED_CHANNELS_FILENAME = './data/accepted_channels.csv';
const ITEMS = readCsv('./data/items.csv');
var fuzzy = FuzzySet(ITEMS, false);
let officers = readCsv('./data/corp/officers.csv')
let accepted_channels = readCsv(ACCEPTED_CHANNELS_FILENAME)
let market = read('./data/market.txt')
let percentage = read('./data/percentage.txt')

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

const isChannelSetupCommand = (msg) => {
    //setup and help
    switch (msg.content) {
        case '!init-evepraisal':
            if (!(accepted_channels.indexOf(msg.channel.id) > -1)) {
                accepted_channels.push(msg.channel.id)
                write(ACCEPTED_CHANNELS_FILENAME, accepted_channels)
                msg.reply(`Channel registered: ${msg.channel.id}`)
            }
            return true;
        case '!rm-evepraisal':
            if ((accepted_channels.indexOf(msg.channel.id) > -1)) {
                accepted_channels = accepted_channels.filter(e => e !== msg.channel.id);
                write(ACCEPTED_CHANNELS_FILENAME, accepted_channels)
                msg.reply('Channel unregistered')
            }
            return true;
    }
    return false;
}

const isSurpriseMention = async(msg) => {
    if (msg.content[1] === "@") {
        //Substring 2 because of mysterious hidden char
        let username = msg.cleanContent.toLowerCase().trim().substring(2).replace(/[\s]/g, "");
        let input = corp_members[username];
        if (input) {
            let response = await api(input, market)
            reply(msg, market, percentage, response)
        }
        return true;
    }
    return false;
}

const isAdminReply = (msg) => {
    try {
        if (msg.content[0] !== '!') {
            return false;
        }
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
            } else if (isNumeric(string)) {
                if ((Number(string) > 0) && (Number(string) < 101)) {
                    percentage = Number(string)
                    write(PERCENTAGE_FILENAME, percentage.toString())
                    msg.reply(`Hello PxKn Officer.\nPercentage now changed to: **${percentage}%**`);
                    msg.react('💸')
                } else {
                    throw "Percentage only between 1 and 100 allowed."
                }
            } else {
                if (AVAILABLE_MARKETS.indexOf(string.toLowerCase()) > -1) {
                    market = string;
                    write(MARKET_FILENAME, market.toString())
                    msg.reply(`Hello PxKn Officer.\nMarket now changed to: **${market}**`);
                    msg.react('📈')
                } else {
                    throw `Unrecognised market, choose one of the following: ${JSON.stringify(AVAILABLE_MARKETS)}`
                }
            }
        }
        return true;
    } catch (e) {
        console.error(e);
        return true;
    }
}

client.on('messageCreate', async msg => {
    try {
        //don't react to messages from itself
        if (msg.author.id === process.env.DISCORD_BOT_AUTHOR_ID) {
            return null;
        }
        //Ignore messages with weird characters
        if (!msg.content[0].match(/^[!a-zA-Z0-9<]+$/)) {
            return null;
        }
        // Check if message is a setup command
        if (isChannelSetupCommand(msg)) {
            return null;
        }
        // Check if reply is from a registered channel
        if (!(accepted_channels.indexOf(msg.channel.id) > -1)) {
            return null;
        }
        //Mentions to specific corp members will give a suprise!
        if (await isSurpriseMention(msg)) {
            return null;
        }
        // Check if admin message
        if (isAdminReply(msg)) {
            return null;
        }
        let contentArray = msg.content.split("\n");
        let input = []
        contentArray.map(line => {
            line = line.trim().replace(/[\s]{2,}/g, " ") //remove extra spaces
            let line_reg = line.trim().match(".+?(?=(\\s[1-9][,0-9]*))");
            let quantity = 1
            let item_name = ""
            if (!line_reg || line_reg[0] === "") {
                line_reg = line.trim().match("([1-9][,0-9]*)|\\d\\s|\\s\\d\\s|\\s(?=(.*))");
                if (!line_reg || line_reg[0].trim() === "") {
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
            //Check if item_name is actually an item (helps if item is mis-spelled)
            let found_item = fuzzy.get(item_name, null, 0.70);
            if (!found_item) {
                console.error(`Could not find eve item match for ${item_name}`)
                return null;
            }
            input.push({ "name": found_item[0][1], "quantity": quantity })
        })
        let response = await api(input, market)
        reply(msg, market, percentage, response)
    } catch (e) {
        console.error("Error: ", e)
        return null;
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);