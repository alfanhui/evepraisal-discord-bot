import axios, { AxiosResponse } from 'axios';
import { Item } from '../../index';

export const api = async(input: Item[], market:string): Promise<AxiosResponse<any,any>> => {
    // create a JSON object
    const json = {
        "market_name": market,
        "items": input
    };
    try {
        let response = await axios.post(process.env.EVEPRAISAL_API_URL, JSON.stringify(json), {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': process.env.EVEPRAISAL_API_USER_AGENT
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