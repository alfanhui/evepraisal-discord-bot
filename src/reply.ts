import AsciiTable from 'ascii-table';
import { uuid, flattenJSONtoArray } from './utils/utils.js';
import { readJson } from './utils/fs.js';
import { Message } from 'discord.js';
import { AxiosResponse } from 'axios';
import { Appraisal } from './models/evepraisal.js';
const { RIGHT } = AsciiTable;

const DISCORD_MAX_MESSAGE_LENGTH = 1800;
const ACCEPTED_MATERIALS = flattenJSONtoArray(readJson('./data/corp/buyback.json'));

export const reply = (msg: Message, market: string, percentage: number, response: AxiosResponse<{"appraisal": Appraisal}, any>) => {
    if (response == null)
        return;
    let table = new AsciiTable()
    table.setHeading("ITEM", "1x SELL", "1x BUY", "TOTAL")
    let total = 0
    let unaccepted_materials: string[] = []
    response.data.appraisal.items.map(item => {
        let buy_total = Number(((item.prices.buy.max * (percentage / 100) * item.quantity)).toFixed(2))
        total += buy_total
        if (!(ACCEPTED_MATERIALS.indexOf(item.name.toLowerCase()) > -1)) {
            unaccepted_materials.push(item.name)
        }
        table.addRow(`${Number(item.quantity).toLocaleString()} x ${item.name}`, Number((item.prices.sell.min * (percentage / 100)).toFixed(0)).toLocaleString(), Number((item.prices.buy.max * (percentage / 100)).toFixed(0)).toLocaleString(), buy_total.toLocaleString())
    })
    if (total == 0) { //invalid response
        return;
    }

    table.addRow("BUYBACK", "--", "->", Number(total.toFixed(2)).toLocaleString())
    table
        .removeBorder()
        .setAlign(1, RIGHT)
        .setAlign(2, RIGHT)
        .setAlign(3, RIGHT)
    let evepriasal_header = `I will receive: ${Number(total.toFixed(2)).toLocaleString()}\nDescription: ${market}_${percentage}pc_${uuid()}\t${Number(total.toFixed(2)).toLocaleString()}`
    let evepriasal_footer = `\n ** Rejected ** buyback program does not accept: ${JSON.stringify(unaccepted_materials)}`

    let reply: string[][] = split_message_content(table)

    if (unaccepted_materials.length > 0) {
        reply[reply.length - 1].push(evepriasal_footer)
    }

    //reply to message
    msg.react("💳");
    if (reply.length == 1) {
        const singleMessage = reply.join("\n")
        msg.reply(`\`\`\`css\n${evepriasal_header}\n${singleMessage}\`\`\``)
    } else {
        reply.forEach((message: string[], index)=>{
            let partMessage = message.join("\n");
            if (index == 0) {
                msg.reply(`\`\`\`css\n${evepriasal_header}\n${partMessage}\`\`\``)
            } else {
                msg.channel.send(`\`\`\`css\n${partMessage}\`\`\``)
            }
        })
    }
}

const split_message_content = (table: any) => {
    let reply: string[][] = [];
    if (table.toString().length > DISCORD_MAX_MESSAGE_LENGTH) {
        let division_count = Math.ceil(table.toString().length / DISCORD_MAX_MESSAGE_LENGTH)
        let split_rows = table.__rows.length / division_count
        let temp = table.toString().split('\n')
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