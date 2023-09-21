import axios, { AxiosResponse } from 'axios';

export const api = async(input: string[], market:number): Promise<AxiosResponse<any,any>> => {
    // create a JSON object
    const json = {
        "id": 4096,
        "method": "Appraisal.create",
        "params": {
            "marketId": 2,
            "designation": 100,
            "pricing": 200,
            "pricingVariant": 100,
            "pricePercentage": 1,
            "input": input.join('\n'),
            "comment": "",
            "compactize": true
        }
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

