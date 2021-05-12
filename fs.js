var fs = require("fs");

const write = (filename, data) => {
    fs.writeFileSync(`data/${filename}`, data.toString());
}

const read = (filename) => {
    output = fs.readFileSync(`data/${filename}`);
    return output.toString();
}

const readCsv = (filename) => {
    output = fs.readFileSync(`data/${filename}`);
    return output.toString().split(",");
}

module.exports = {
    write: write,
    read: read,
    readCsv: readCsv
}