import { AxiosResponse } from 'axios';
import { CronJob } from 'cron';
import { getCategories, getCategory, getGroup, getType } from '../apis/eve-api';
import { Category, Group, Type } from '../models/eve';
import { AllItems } from '../namespaces/allItems';
import { BuybackItems } from '../namespaces/buybackItems';
import { SecondaryBuybackItems } from '../namespaces/secondaryBuybackItems';

export class Cron {

    buybackItemsUpdateJob: CronJob;
    secondaryBuybackItemsUpdateJob: CronJob;
    allItemsUpdateJob: CronJob;

    constructor() {
        //PRIMARY
        if (process.env.BUYBACK_ITEMS_UPDATE_CRON) {
            // Do initial pull if no items exist
            if(!BuybackItems.itemsHasBeenInitialised()){
                console.warn("Buyback have not been initialised, generating it now...")
                this.buybackItemUpdateScheduler();
            }

            this.buybackItemsUpdateJob = new CronJob(process.env.BUYBACK_ITEMS_UPDATE_CRON, async () => {
                try {
                    await this.buybackItemUpdateScheduler();
                } catch (e) {
                    console.error(e);
                }
            });
            if (!this.buybackItemsUpdateJob.running) {
                this.buybackItemsUpdateJob.start();
            }
            console.log(`Buyback Items Update Scheduled for: ${process.env.BUYBACK_ITEMS_UPDATE_CRON}`)
        }else{
            this.buybackItemUpdateScheduler();
        }

        //SECONDARY
        if (process.env.SECONDARY_BUYBACK_ITEMS_UPDATE_CRON) {
            // Do initial pull if no items exist
            if(!SecondaryBuybackItems.itemsHasBeenInitialised()){
                console.warn("Secondary Buyback have not been initialised, generating it now...")
                this.secondaryBuybackItemUpdateScheduler();
            }

            this.secondaryBuybackItemsUpdateJob = new CronJob(process.env.SECONDARY_BUYBACK_ITEMS_UPDATE_CRON, async () => {
                try {
                    await this.secondaryBuybackItemUpdateScheduler();
                } catch (e) {
                    console.error(e);
                }
            });
            if (!this.secondaryBuybackItemsUpdateJob.running) {
                this.secondaryBuybackItemsUpdateJob.start();
            }
            console.log(`Secondary Buyback Items Update Scheduled for: ${process.env.SECONDARY_BUYBACK_ITEMS_UPDATE_CRON}`)
        }else{
            this.secondaryBuybackItemUpdateScheduler();
        }

        //ALL ITEMS
        if (process.env.ALL_ITEMS_UPDATE_CRON) {
            // Do initial pull if no items exist
            if(!AllItems.itemsHasBeenInitialised()){
                console.warn("All Items have not been initialised, generating it now...")
                this.allItemUpdateScheduler();
            }

            //All items
            this.allItemsUpdateJob = new CronJob(process.env.ALL_ITEMS_UPDATE_CRON, async () => {
                try {
                    await this.allItemUpdateScheduler();
                } catch (e) {
                    console.error(e);
                }
            });
            if (!this.allItemsUpdateJob.running) {
                this.allItemsUpdateJob.start();
            }
            console.log(`All Items Update Scheduled for: ${process.env.ALL_ITEMS_UPDATE_CRON}`)
        }
    }

    async buybackItemUpdateScheduler() {
        console.log("Starting Buyback Item Update Scheduler..")
        try {
            //Obtain config of what data to pull
            let groups: number[] = [].concat(process.env.GROUPS.split(","));
            let types: number[] = process.env.TYPES ? [].concat(process.env.TYPES.split(",")) : [];
            let items: string[] = [];

            
            //Obtain list of types from groups
            for(let group of groups){
                try{
                    const responseGroup: AxiosResponse<Group, any> = await getGroup(Number(group));
                    if(!responseGroup.data || !responseGroup.data.published) continue; // skipped unpublished
                    types = types.concat(responseGroup.data.types);
                } catch(e){
                    console.log(e)
                }
            }
            
            //Obtain all items in types
            for(let type of types){
                try{
                    let responseType: AxiosResponse<Type, any> = await getType(Number(type));
                    if(!responseType.data || !responseType.data.published) continue; // skipped unpublished
                    items = items.concat(responseType.data.name.trimEnd().toLowerCase());
                } catch(e){
                    console.log(e)
                }
            }

            //Save to file
            BuybackItems.setItems(items);
        } catch (e) {
            console.error(e)
        } finally {
            console.log("Finished Buyback Item Update Scheduler.")
        }
    }

    async secondaryBuybackItemUpdateScheduler() {
        console.log("Starting Secondary Buyback Item Update Scheduler..")
        try {
            //Obtain config of what data to pull
            let groups: number[] = [].concat(process.env.SECONDARY_GROUPS.split(","));
            let types: number[] = process.env.SECONDARY_TYPES ? [].concat(process.env.SECONDARY_TYPES.split(",")) : [];
            let items: string[] = [];

            //Obtain list of types from groups
            for(let group of groups){
                try{
                    let responseGroup: AxiosResponse<Group, any> = await getGroup(Number(group));
                    if(!responseGroup.data || !responseGroup.data.published) continue; // skipped unpublished
                    types = types.concat(responseGroup.data.types);
                } catch(e){
                    console.log(e)
                }
            }
            
            //Obtain all items in types
            for(let type of types){
                try{
                    let responseType: AxiosResponse<Type, any> = await getType(Number(type));
                    if(!responseType.data || !responseType.data.published) continue; // skipped unpublished
                    items = items.concat(responseType.data.name.trimEnd().toLowerCase());
                } catch(e){
                    console.log(e)
                }
            }

            //Save to file
            SecondaryBuybackItems.setItems(items);
        } catch (e) {
            console.error(e)
        } finally {
            console.log("Finished Secondary Buyback Item Update Scheduler.")
        }
    }

    async allItemUpdateScheduler() {
        console.log("Starting All Item Update Scheduler..")
        try {
            //Obtain config of what data to pull
            let categories: number[] = [];
            let groups: number[] = [];
            let types: number[] = [];
            let items: string[] = [];

            // Get all categories
            categories = (await getCategories()).data;
            
            //Obtain list of groups from all categories
            for(let category of categories){
                try{
                    let responseCategory: AxiosResponse<Category, any> = await getCategory(category);
                    if(!responseCategory.data || !responseCategory.data.published) continue; // skipped unpublished
                    groups = groups.concat(responseCategory.data.groups)
                }catch(e){
                    console.log(e)
                }
            }
            
            //Obtain list of types from groups
            for(let group of groups){
                try{
                    let responseGroup: AxiosResponse<Group, any> = await getGroup(Number(group));
                    if(!responseGroup.data || !responseGroup.data.published) continue; // skipped unpublished
                    types = types.concat(responseGroup.data.types);
                } catch(e){
                    console.log(e)
                }
            }
            
            //Obtain all items in types
            for(let type of types){
                try{
                    let responseType: AxiosResponse<Type, any> = await getType(Number(type));
                    if(!responseType.data || !responseType.data.published) continue; // skipped unpublished
                    items = items.concat(responseType.data.name.trimEnd().toLowerCase());
                } catch(e){
                    console.log(e)
                }
            }
            
            //Save to file
            AllItems.setItems(items);
        } catch (e) {
            console.error(e)
        } finally {
            console.log("Finished All Item Update Scheduler.")
        }
    }
}


