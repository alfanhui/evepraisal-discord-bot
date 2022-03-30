import { writeFileSync, readFileSync } from "fs";

export const writeString = (filePath:string, data: string) => {
    writeFileSync(`${filePath}`, `${data},\n`);
}

export const writeStringArray = (filePath:string, data: string[]) => {
    writeFileSync(`${filePath}`, data.join(',\n'));
}

export const read = (filePath: string) => {
    return readFileSync(`${filePath}`).toString();
}

export const readJson = (filePath: string) => {
    return JSON.parse(read(filePath));
}

export const readCsv = (filePath: string) => {
    return read(filePath).split(",\n");
}