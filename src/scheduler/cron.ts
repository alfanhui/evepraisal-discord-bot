import { AxiosResponse } from 'axios';
import { CronJob } from 'cron';
import { getGroup, getType } from '../apis/eve-api';
import { Group, Type } from '../models/eve';
import { read, writeStringArray } from '../utils/fs';

export class Cron {

    itemUpdateJob: CronJob;
    ITEMS_FILENAME: string = './data/items.csv';

    constructor() {
        if (process.env.ITEM_UPDATE_CRON) {
            // Do initial pull if no items exist
            if(read(this.ITEMS_FILENAME).length == 0){
                this.itemUpdateScheduler();
            }

            this.itemUpdateJob = new CronJob(process.env.ITEM_UPDATE_CRON, async () => {
                try {
                    await this.itemUpdateScheduler();
                } catch (e) {
                    console.error(e);
                }
            });
            if (!this.itemUpdateJob.running) {
                this.itemUpdateJob.start();
            }
        }else{
            this.itemUpdateScheduler();
        }
    }

    async itemUpdateScheduler() {
        console.log("Starting ItemUpdateScheduler..")
        try {
            //Obtain config of what data to pull
            let groups: number[] = [].concat(process.env.GROUPS.split(","));
            let types: number[] = process.env.TYPES ? [].concat(process.env.TYPES.split(",")) : [];
            let items: string[] = [];

            let responseGroup: AxiosResponse<Group, any>;
            let responseType: AxiosResponse<Type, any>;

            //Obtain pull data from Eve API
            
            //Obtain list of types from groups
            for(let group of groups){
                try{
                    responseGroup = await getGroup(Number(group));
                } catch(e){
                    console.log(e)
                }
                types = types.concat(responseGroup.data.types);
            }

            //Obtain all items in types
            for(let type of types){
                try{
                    responseType = await getType(Number(type));
                } catch(e){
                    console.log(e)
                }
                items = items.concat(responseType.data.name.trimEnd().toLowerCase());
            }

            //Save to file
            writeStringArray(this.ITEMS_FILENAME, items)
        } catch (e) {
            console.error(e)
        } finally {
            console.log("Finished ItemUpdateScheduler.")
        }
    }
}


