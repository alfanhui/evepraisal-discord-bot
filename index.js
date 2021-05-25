const Discord = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var AsciiTable = require('ascii-table')
var materials = require('./valid-items.js');
var utils = require('./utils.js');
var token = require('./secret.js').token
var fs = require('./fs.js')

const client = new Discord.Client();
const markets = ["jita", "perimeter", "universe", "amarr", "dodixie", "hek", "rens"]
const ACCEPTED_CHANNELS_FILENAME = 'accepted_channels.csv';
const OFFICERS_FILENAME = 'officers.csv';
const MARKET_FILENAME = 'market.txt';
const PERCENTAGE_FILENAME = 'percentage.txt';
accepted_materials = [].concat(
    materials.ore,
    materials.compressed_ore,
    materials.salavage,
    materials.pi_fuel)
officers = fs.readCsv(OFFICERS_FILENAME)
accepted_channels = fs.readCsv(ACCEPTED_CHANNELS_FILENAME)
market = fs.read(MARKET_FILENAME)
percentage = fs.read(PERCENTAGE_FILENAME)

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

function api(msg, input) {
    const xhr = new XMLHttpRequest();
    // listen for `load` event
    xhr.onload = () => {
        // print JSON response
        if (xhr.status >= 200 && xhr.status < 300) {
            // parse JSON
            const response = JSON.parse(xhr.responseText);
            var table = new AsciiTable()
            table.setHeading("ITEM", "1x SELL", "1x BUY", "TOTAL")
            total = 0
            unaccepted_materials = []
            response.appraisal.items.map(item => {
                buy_total = Number(((item.prices.buy.max * (percentage / 100) * item.quantity)).toFixed(2))
                total += buy_total
                if (!(accepted_materials.indexOf(item.name.toLowerCase()) > -1)) {
                    unaccepted_materials.push(item.name)
                }
                table.addRow(`${Number(item.quantity).toLocaleString()}x ${item.name}`, Number(item.prices.sell.min * (percentage / 100)).toLocaleString(), Number(item.prices.buy.max * (percentage / 100)).toLocaleString(), buy_total.toLocaleString())
            })
            table.addRow("BUYBACK", "--", "->", Number(total.toFixed(2)).toLocaleString())
            table
                .removeBorder()
                .setAlign(1, AsciiTable.RIGHT)
                .setAlign(2, AsciiTable.RIGHT)
                .setAlign(3, AsciiTable.RIGHT)
            evepriasal_header = `Description: ${market}_${percentage}pc_${utils.uuid()}\t${Number(total.toFixed(2)).toLocaleString()}`
            reply = `\n${evepriasal_header}\n${table.toString()}`
            if (unaccepted_materials.length > 0) {
                reply += `\n**Rejected** buyback program does not accept: ${JSON.stringify(unaccepted_materials)}`
            }

            if (total == 0) {
                return null;
            }
            msg.react("💳")
            msg.reply(`\`\`\`css\n${reply}\`\`\``)
        }
    };

    // create a JSON object
    const json = {
        "market_name": market,
        "items": input
    };

    // open request
    xhr.open('POST', 'https://evepraisal.com/appraisal/structured.json');

    // set Content-Type header
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('User-Agent', 'PixelKnightsDiscordBot');

    // send rquest with JSON payload
    xhr.send(JSON.stringify(json));
}

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
                case '!':
                    adminReply(msg)
                    break;
                default:
                    contentArray = msg.content.split("\n");
                    input = []
                    contentArray.map(line => {
                        items = line.match(".+?(?=(\\s[1-9][,0-9]*))");
                        quantity = 1
                        item_name = ""
                        if (!items || items[0] === "") {
                            items = line.match("[1-9][,0-9]*(?=(\s.*))");
                            if (!items || items[0] === "") {
                                item_name = line.trim()
                            } else {
                                quantity = Number(items[0].trim().replace(',', ''));
                                item_name = items[1].trim();
                            }
                        } else {
                            item_name = items[0].trim()
                            quantity = Number(items[1].trim().replace(',', ''))
                        }
                        input.push({ "name": item_name, "quantity": quantity })
                    })
                    api(msg, input)
                    break;
            }
        } catch (e) {
            msg.reply(`ERROR: ${e}`);
            msg.react("❌")
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