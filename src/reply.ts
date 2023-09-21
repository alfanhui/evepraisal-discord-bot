import AsciiTable from 'ascii-table';
import { uuid } from './utils/utils.js';
import { Message } from 'discord.js';
import { AxiosResponse } from 'axios';
// import { Appraisal, AppraisalItem } from './models/evepraisal.js';
import { Appraisal, AppraisalItem } from './models/janice.js';
import { SecondaryBuybackItems } from './namespaces/secondaryBuybackItems.js';
import { BuybackItems } from './namespaces/buybackItems.js';
const { RIGHT } = AsciiTable;

const DISCORD_MAX_MESSAGE_LENGTH = 1800;

export const reply = (msg: Message, market: number, percentages: number[], response: AxiosResponse<{ result: Appraisal}, any>) => {
    if (response == null)
        return;
    let table = new AsciiTable()
    table.setHeading("ITEM", "1x SELL", "1x BUY", "TOTAL")
    let total = 0
    let unaccepted_materials: string[] = [];
    let secondary_materials: string[] = [];
    response.data.result.items.map(item => {
        let local_percentage: number;
        if (SecondaryBuybackItems.getFuzzyItems().get(item.itemType.name, null, .99)) {
            local_percentage = percentages[1];
            secondary_materials.push(item.itemType.name);
        } else {
            local_percentage = percentages[0];
        }

        let buy_total = Number(((item.effectivePrices.buyPrice * (local_percentage / 100) * item.amount)).toFixed(2))
        total += buy_total
        if (!BuybackItems.getFuzzyItems().get(item.itemType.name.toLowerCase(), null, 0.99)) {
            unaccepted_materials.push(item.itemType.name)
        }
        table.addRow(`${Number(item.amount).toLocaleString()} x ${item.itemType.name}`, Number((item.effectivePrices.sellPrice * (local_percentage / 100)).toFixed(0)).toLocaleString(), Number((item.effectivePrices.buyPrice * (local_percentage / 100)).toFixed(0)).toLocaleString(), Number(buy_total.toFixed(0)).toLocaleString())
    })
    if (total == 0) { //invalid response
        return;
    }

    table.addRow("BUYBACK", "--", "->", Number(total.toFixed(0)).toLocaleString())
    table
        .removeBorder()
        .setAlign(1, RIGHT)
        .setAlign(2, RIGHT)
        .setAlign(3, RIGHT)
    let evepriasal_header: string = get_header(response.data.result.items, secondary_materials, total, market, percentages);
    let evepriasal_footer: string = get_footer(percentages, secondary_materials, unaccepted_materials);

    let reply: string[][] = split_message_content(table)

    if (evepriasal_footer.length > 0) {
        reply[reply.length - 1].push(evepriasal_footer)
    }

    //reply to message
    msg.react("💳");
    if (reply.length == 1) {
        const singleMessage = reply.join("\n")
        msg.reply(`\`\`\`css\n${evepriasal_header}\n${singleMessage}\`\`\``)
    } else {
        reply.forEach((message: string[], index) => {
            let partMessage = message.join("\n");
            if (index == 0) {
                msg.reply(`\`\`\`css\n${evepriasal_header}\n${partMessage}\`\`\``)
            } else {
                msg.channel.send(`\`\`\`css\n${partMessage}\`\`\``)
            }
        })
    }
}

const get_header = (items: AppraisalItem[], secondary_materials: string[], total: number, market: number, percentages: number[]): string => {
    let percentage_string: string;
    if (items.length == secondary_materials.length) percentage_string = `${percentages[1]}`;
    else if (secondary_materials.length > 0) percentage_string = 'mixed_';
    else percentage_string = `${percentages[0]}`;
    return `${Number(total.toFixed(0)).toLocaleString()} ISK Total\nDescription: ${market}_${percentage_string}pc_${uuid()}`;
}

const get_footer = (percentages: number[], secondary_materials: string[], unaccepted_materials: string[]): string => {
    let footer: string = "";
    if (secondary_materials.length > 0) footer += `\n** ${percentages[1]}% buyback items ** accepted at discount: ${JSON.stringify(secondary_materials)}`;
    if (unaccepted_materials.length > 0) footer += `\n ** Rejected ** buyback program does not accept: ${JSON.stringify(unaccepted_materials)}`;
    return footer;
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