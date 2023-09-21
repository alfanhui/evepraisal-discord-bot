import { Client, Intents, Message } from 'discord.js';
//import { api } from './src/apis/evepraisal-api.js';
import { api } from './src/apis/evejaniace-api.js';
import { reply } from './src/reply.js';
import { Cron } from './src/scheduler/cron.js';
import { readCsv, read, readJson, writeString, writeStringArray } from './src/utils/fs.js';
import { isNumeric } from './src/utils/utils.js';
import { BuybackItems } from './src/namespaces/buybackItems';
import { AllItems } from './src/namespaces/allItems.js';
require('dotenv').config()

//Start scheduler
const cron = new Cron();

var client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    restRequestTimeout: 300000
});

const AVAILABLE_MARKETS = process.env.AVAILABLE_MARKETS.split(",");
const ACCEPTED_CHANNELS_FILENAME = './data/accepted_channels.csv';
const PERCENTAGE_FILENAME = './data/percentages.csv';
const MARKET_FILENAME = './data/market.txt';
let officers = readCsv('./data/corp/officers.csv')
let corp_members = readJson('./data/corp/members.json');
let accepted_channels = readCsv(ACCEPTED_CHANNELS_FILENAME)
let market = Number(read(MARKET_FILENAME));
let percentages: number[] = readCsv(PERCENTAGE_FILENAME).map(v=>Number(v));

export interface Item {
    name: String,
    quantity: number
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: "online", //You can show online, idle....
        activities: [{
            name: "Evepraisal", //The message shown
            type: "PLAYING" //PLAYING: WATCHING: LISTENING: STREAMING:
        }]
    });
});

const isChannelSetupCommand = (msg: Message) => {
    //setup and help
    switch (msg.content) {
        case '!init-evepraisal':
            if (!(accepted_channels.indexOf(msg.channel.id) > -1)) {
                accepted_channels.push(msg.channel.id)
                writeStringArray(ACCEPTED_CHANNELS_FILENAME, accepted_channels)
                msg.reply(`Channel registered: ${msg.channel.id}`)
            }
            return true;
        case '!rm-evepraisal':
            if ((accepted_channels.indexOf(msg.channel.id) > -1)) {
                accepted_channels = accepted_channels.filter(e => e !== msg.channel.id);
                writeStringArray(ACCEPTED_CHANNELS_FILENAME, accepted_channels)
                msg.reply('Channel unregistered')
            }
            return true;
    }
    return false;
}

const isSurpriseMention = async(msg: Message) => {
    if (msg.content[1] === "@") {
        //Substring 2 because of mysterious hidden char
        let username = msg.cleanContent.toLowerCase().trim().substring(2).replace(/[\s]/g, "");
        let input = corp_members[username];
        if (input) {
            let response = await api(input, market)
            reply(msg, market, percentages, response)
        }
        return true;
    }
    return false;
}

const isAdminReply = (msg: Message, percentages: number[]) => {
    try {
        if (msg.content[0] !== '!') {
            return false;
        }
        if (!(officers.indexOf(msg.author.id) > -1)) {
            throw `Permission denied: ${msg.author.id}`
        }
        const value: string = msg.content.split("!")[1].split(" ")[0];
        const secondary_value: string = msg.content.split("!")[1].split(" ")[1];
        if (!value || value === "") return true;
        if (value === "help") {
            msg.reply(`\`\`\`bash
!init-evepraisal (register channel)
!rm-evepraisal   (unregister channel)
!market          (change market)                | example: !2
!p number        (change primary percentage)    | example: !p 90
!s number        (change secondary percentage)  | example: !s 75
            \`\`\``)
        } else if (value === "p" && isNumeric(Number(secondary_value))) {
            if ((Number(secondary_value) < 0) || (Number(secondary_value) > 101)) throw "Percentage only between 1 and 100 allowed."
            percentages = [Number(secondary_value), percentages[1]];
            writeStringArray(PERCENTAGE_FILENAME, percentages.map(v=>v.toString()));
            msg.reply(`Hello PxKn Officer.\nPercentages now changed to: **${percentages}%**`);
            msg.react('💸')
        } else if (value === "s" && isNumeric(Number(secondary_value))) {
            if ((Number(secondary_value) < 0) || (Number(secondary_value) > 101)) throw "Percentage only between 1 and 100 allowed."
            percentages = [percentages[0], Number(secondary_value)];
            writeStringArray(PERCENTAGE_FILENAME, percentages.map(v=>v.toString()));
            msg.reply(`Hello PxKn Officer.\nPercentages now changed to: **${percentages}%**`);
            msg.react('💸')
        } else {
            if (AVAILABLE_MARKETS.indexOf(value.toLowerCase()) > -1) {
                market = Number(value);
                writeString(MARKET_FILENAME, market.toString())
                msg.reply(`Hello PxKn Officer.\nMarket now changed to: **${market}**`);
                msg.react('📈')
            } else {
                throw `Unrecognised market, choose one of the following: ${JSON.stringify(AVAILABLE_MARKETS)}`
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
        if (isAdminReply(msg, percentages)) {
            return null;
        }

        let contentArray = msg.content.split("\n");
        let input: string[] = [];
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
            let found_item = BuybackItems.getFuzzyItems().get(item_name, null, 0.70);
            if (!found_item) {
                found_item = AllItems.getFuzzyItems().get(item_name, null, 0.95); //try all items, but no spell checking
                if(!found_item){
                    console.error(`Could not find eve item match for ${item_name}`)
                    return null;
                }
            }
            input.push(`${quantity} ${found_item[0][1]}`)
        })
        if(input.length == 0){
            return null;
        }
        let response = await api(input, market)
        reply(msg, market, percentages, response)
    } catch (e) {
        console.error("Error: ", e)
        return null;
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);