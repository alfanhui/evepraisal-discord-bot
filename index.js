const Discord = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var AsciiTable = require('ascii-table')
var materials = require('./valid-items.js');
var utils = require('./utils.js');
var token = require('./secret.js').token
var fs = require('./fs.js')

const client = new Discord.Client();
const markets = ["jita", "perimeter", "universe", "amarr", "dodixie", "hek", "rens"]
accepted_materials = [].concat(
    materials.ore,
    materials.compressed_ore,
    materials.salavage,
    materials.pi_fuel)
officers = fs.readCsv('officers.csv')
accepted_channels = fs.readCsv('accepted_channels.csv')
market = fs.read('market.txt')
percentage = fs.read('percentage.txt')

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
            evepriasal_header = `Description: ${market}_${percentage}pc_${utils.uuid()}\t${Number(total.toFixed(2)).toLocaleString()}`
            reply = `\n${evepriasal_header}\n${table.toString()}`
            if (unaccepted_materials.length > 0) {
                reply += `\n**Rejected** buyback program does not accept: ${JSON.stringify(unaccepted_materials)}`
            }

            if (total == 0) {
                msg.reply("No result found")
                msg.react("❌")
                return null;
            }
            msg.react("💳")
            msg.reply(`\`\`\`css\n${reply}\`\`\``)
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
        if (!(accepted_channels.indexOf(msg.channel.id) > -1)) {
            return null;
        }
        //don't react to messages from itself
        if (msg.author.id === '841662638811250699') {
            return null;
        } else if (msg.content[0] === '!') {
            if (msg.content === "!help") {
                msg.reply(`\`\`\`bash
!init-evepraisal (register channel)
!rm-evepraisal   (unregister channel)
!market          (change market)     | example: !jita
!number          (change percentage) | example: !90 
                \`\`\``)
                return null;
            }
            if ((officers.indexOf(msg.author.id) > -1)) {
                if (msg.content === '!int-evepraisal') {
                    if (!(accepted_channels.indexOf(msg.channel.id) > -1)) {
                        accepted_channels.push(msg.channel.id)
                        fs.write('accepted_channels.csv', accepted_channels)
                        msg.reply(`
                Channel registered: $ { msg.channel.id }
                `)
                    }
                    return null;
                }
                if (msg.content === '!rm-evepraisal') {
                    if ((accepted_channels.indexOf() > -1)) {
                        accepted_channels = accepted_channels.filter(e => e !== msg.channel.id);
                        fs.write('accepted_channels.csv', accepted_channels)
                        msg.reply(`
                Channel unregistered `)
                    }
                    return null;
                }
                msg.reply("Hello PxKn Officer.")
                string = msg.content.split("!")[1].split(" ")[0]
                if (string && string != "") {
                    if (utils.isNumeric(string)) {
                        if ((Number(string) > 0) && (Number(string) < 101)) {
                            percentage = Number(string)
                            fs.write('percentage.csv', percentage.toString('utf8'))
                            msg.reply(`Percentage now changed to: ${percentage}`);
                            return null;
                        } else {
                            throw "Percentage only between 1 and 100 allowed."
                        }
                    } else {
                        if (markets.indexOf(string.toLowerCase()) > -1) {
                            market = string;
                            fs.write('market.csv', market.toString('utf8'))
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
                if (!items) {
                    throw "Please repackaged your items, quantity required."
                }
                quantity = items && items[1] ? Number(items[1].trimLeft()) : 1
                if (items[0] === "") {
                    throw "Invalid input. Enter items copied from list detail."
                }
                input.push({ "name": items[0].trimRight(), "quantity": quantity })
            })
            api(msg, input)
        }
    } catch (e) {
        msg.reply(`ERROR: ${e}`);
        msg.react("❌")
        return null;
    }

});

client.login(token);