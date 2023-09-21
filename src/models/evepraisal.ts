interface AppraisalPrice {
    "avg": number,
    "max": number,
    "median": number,
    "min": number,
    "order_count": number,
    "percentile": number,
    "stddev": number,
    "volume": number
}

interface AppraisalPrices {
    "all": AppraisalPrice,
    "buy": AppraisalPrice,
    "sell": AppraisalPrice,
    "strategy": string,
    "updated": string
}

export interface AppraisalItem {
    "meta": Object,
    "name": string,
    "prices": AppraisalPrices
    "quantity": number,
    "typeID": number,
    "typeName": string,
    "typeVolume": number
}

export interface Appraisal {
    "created": number,
    "items": AppraisalItem[],
    "kind": string,
    "live": false,
    "market_name": string,
    "private": false,
    "raw"?: string,
    "totals": {
        "buy": number,
        "sell": number,
        "volume": number
    },
    "unparsed"?: Object
}

