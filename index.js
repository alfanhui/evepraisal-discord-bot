const Discord = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var AsciiTable = require('ascii-table')
var materials = require('./valid-items.js');
var utils = require('./utils.js');
var token = require('./secret.js').token

const client = new Discord.Client();
const markets = ["jita", "perimeter", "universe", "amarr", "dodixie", "hek", "rens"]
accepted_materials = [].concat(
    materials.ore,
    materials.compressed_ore,
    materials.salavage,
    materials.pi_fuel)
officers = ["774615731014205440"]
market = "jita"
percentage = 90
accepted_channels = ["841665672836415584"]

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
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
            evepriasal_header = `**${market}**  @ **${percentage}%** ID **${uuid()}**`
            table.setHeading("ITEM", "1x SELL", "1x BUY", "TOTAL")
            total = 0
            unaccepted_materials = []
            response.appraisal.items.map(item => {
                buy_total = Number(((item.prices.buy.max * item.quantity) * (100 / percentage)).toFixed(2))
                total += buy_total
                if (!(accepted_materials.indexOf(item.name.toLowerCase()) > -1)) {
                    unaccepted_materials.push(item.name)
                }
                table.addRow(`${Number(item.quantity).toLocaleString()}x ${item.name}`, Number(item.prices.buy.max).toLocaleString(), Number(item.prices.sell.min).toLocaleString(), buy_total.toLocaleString())
            })
            table.addRow("BUYBACK", "--", "->", Number(total.toFixed(2)).toLocaleString())
            table.removeBorder()
            reply = `${evepriasal_header}\n\`\`\`css\n${table.toString()}\`\`\``
            if (unaccepted_materials.length > 0) {
                reply += `\n**Rejected** buyback program does not accept: ${JSON.stringify(unaccepted_materials)}`
            }
            reply = reply.replace(/"/g, " ");
            msg.react("💳")
            msg.reply(reply)
        }
    };

    // create a JSON object
    const json = {
        "market_name": market,
        "persist": "no", //doesn't do anything
        "expire_minutes": 21600, //doesn't do anything
        "price_percentage": percentage, //doesn't do anything
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
        if (msg.content[0] === '!setup-evepraisal') {
            msg.reply(`channel_id: ${msg.channel.id}`)
            return null;
        }
        if (!(accepted_channels.indexOf(msg.channel.id) > -1)) {
            return null;
        }
        //don't react to messages from itself
        if (msg.author.id === '841662638811250699') {
            return null;
        } else if (msg.content[0] === '!') {
            if ((officers.indexOf(msg.author.id) > -1)) {
                msg.reply("Hello PxKn Officer.")
                string = msg.content.split("!")[1].split(" ")[0]
                if (string && string != "") {
                    if (string === "help") {
                        msg.reply("To change market or percentage, type !new_market or !new_percentage")
                        return null;
                    }
                    if (isNumeric(string)) {
                        if ((Number(string) > 0) && (Number(string) < 101)) {
                            percentage = Number(string)
                            msg.reply(`Percentage now changed to: ${percentage}`);
                            return null;
                        } else {
                            throw "Percentage only between 1 and 100 allowed."
                        }
                    } else {
                        if (markets.indexOf(string.toLowerCase()) > -1) {
                            market = string;
                            msg.reply(`Market now changed to: ${market}`);
                        } else {
                            throw `Unrecognised market, choose one of the following: ${JSON.stringify(markets)}`
                        }
                    }
                }
            } else {
                throw `Permission denied: ${msg.author.id}`
            }
        } else {
            string = msg.content.split("\n");
            input = []
            string.map(line => {
                items = line.match(".+?(?=(\\s[1-9][0-9]*))");
                if (!items || !checkArray(items)) {
                    console.log(items)
                    throw "Invalid input. Enter items copied from list detail."
                }
                input.push({ "name": items[0].trimRight(), "quantity": Number(items[1].trimLeft()) })
            })
            api(msg, input)
        }
    } catch (e) {
        msg.reply(`ERROR: ${e}`);
        return null;
    }

});

client.login(token);