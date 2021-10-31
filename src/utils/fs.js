import { createWriteStream, writeFileSync, readFileSync } from "fs";

export const write = (filePath, data) => {
    writeFileSync(`${filePath}`, data.join(',\n'));
}

export const read = (filePath) => {
    return readFileSync(`${filePath}`).toString();
}

export const readJson = (filePath) => {
    return JSON.parse(read(filePath));
}

export const readCsv = (filePath) => {
    return read(filePath).split(",\n");
}