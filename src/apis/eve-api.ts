import axios, { AxiosResponse } from 'axios';
import { Group, Type } from '../models/eve';

async function apiGet (queryString: string): Promise<AxiosResponse<any,any>> {
    try {
        let response = await axios.get(`${process.env.EVE_API_URL}${queryString}`, {
            headers: {
                'User-Agent': process.env.EVEPRAISAL_API_USER_AGENT,
                "accept": "application/json",
                "Accept-Language": "en",
                "Cache-Control": "no-cache"
            }
        });
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        return null;
    } catch (error) {
        console.error("Error: ", error)
        return null;
    }
}

export async function getType (typeId: number): Promise<AxiosResponse<Type,any>> {
    return apiGet(`latest/universe/types/${typeId}/?datasource=tranquility&language=en`);
}

export async function getGroup (groupId: number): Promise<AxiosResponse<Group,any>> {
    return apiGet(`latest/universe/groups/${groupId}/?datasource=tranquility&language=en`);
}