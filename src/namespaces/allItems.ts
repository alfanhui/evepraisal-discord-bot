import { exists, writeStringArray, readCsv } from '../utils/fs';
import FuzzySet from 'fuzzyset.js';

export namespace AllItems {
    let items: Array<string> = [];
    const ITEMS_FILENAME: string = './data/all_items.csv';
    var fuzzy: FuzzySet = null;

    function readItems(): Array<string> {
        return readCsv(ITEMS_FILENAME);
    }

    function fileExists(): boolean {
        return exists(ITEMS_FILENAME);
    }

    function fileNotEmpty(): boolean {
        return readCsv(ITEMS_FILENAME).length > 0;
    }

    export function itemsHasBeenInitialised(): boolean {
        return fileExists() && fileNotEmpty();
    }

    export function getFuzzyItems(): FuzzySet {
        if(items.length < 1){
            console.warn("Items is empty, reading items for file..")
            items = readItems();
            fuzzy = FuzzySet(items, false, 1, 1); //We don't want any spell checking on all items, save memory
        } else if (!fuzzy){
            console.warn("Fuzzy is null, reading fuzzy from items..")
            fuzzy = FuzzySet(items, false, 1, 1); //We don't want any spell checking on all items, save memory
        }
        return fuzzy;
    }

    export function setItems(newItems: string[]):void {
        writeStringArray(ITEMS_FILENAME, newItems);
        items = newItems;
    }
}