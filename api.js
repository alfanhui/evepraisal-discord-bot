var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var AsciiTable = require('ascii-table')
var utils = require('./utils.js');
const materials = require('./valid-items.js');
const DISCORD_MAX_MESSAGE_LENGTH = 1800;


//data
const accepted_materials = [].concat(
    materials.ore,
    materials.compressed_ore,
    materials.salavage,
    materials.pi_fuel,
    materials.moon_ore,
    materials.gas_clouds)

const api = (msg, input, market, percentage) => {
    const xhr = new XMLHttpRequest();
    // listen for `load` event
    xhr.onload = () => {
        // print JSON response
        try {
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
                    table.addRow(`${Number(item.quantity).toLocaleString()}x ${item.name}`, Number((item.prices.sell.min * (percentage / 100)).toFixed(0)).toLocaleString(), Number((item.prices.buy.max * (percentage / 100)).toFixed(0)).toLocaleString(), buy_total.toLocaleString())
                })
                if (total == 0) { //invalid response
                    return null;
                }

                table.addRow("BUYBACK", "--", "->", Number(total.toFixed(2)).toLocaleString())
                table
                    .removeBorder()
                    .setAlign(1, AsciiTable.RIGHT)
                    .setAlign(2, AsciiTable.RIGHT)
                    .setAlign(3, AsciiTable.RIGHT)
                evepriasal_header = `Description: ${market}_${percentage}pc_${utils.uuid()}\t${Number(total.toFixed(2)).toLocaleString()}`
                evepriasal_footer = `\n**Rejected** buyback program does not accept: ${JSON.stringify(unaccepted_materials)}`

                reply = split_message_content(table)

                if (unaccepted_materials.length > 0) {
                    reply[reply.length - 1].push(evepriasal_footer)
                }

                //reply to message
                msg.react("💳")
                if (reply.length == 1) {
                    reply = reply.join("\n")
                    msg.reply(`\`\`\`css\n${evepriasal_header}\n${reply}\`\`\``)
                } else {
                    for (let message in reply) {
                        joined = reply[message].join("\n");
                        if (message == 0) {
                            msg.reply(`\`\`\`css\n${evepriasal_header}\n${joined}\`\`\``)
                        } else {
                            msg.channel.send(`\`\`\`css\n${joined}\`\`\``)
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Error: ", e)
            return null;
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

const split_message_content = (table) => {
    reply = [];
    if (table.toString().length > DISCORD_MAX_MESSAGE_LENGTH) {
        division_count = Math.ceil(table.toString().length / DISCORD_MAX_MESSAGE_LENGTH)
        split_rows = table.__rows.length / division_count
        temp = table.toString().split('\n')
        reply = [];
        while (temp.length > 0) {
            reply.push(temp.splice(0, split_rows));
        }
    } else {
        reply = [
            [`\n${table.toString()}`]
        ]
    }
    return reply;
}

module.exports = {
    api: api
}