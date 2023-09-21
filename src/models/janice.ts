export interface Payload {
    id: number,
    method: string,

}

export interface PayloadParams {
    marketId: number,
    designation: number,
    pricing: number,
    pricingVariant: number,
    pricePercentage: number,
    input: string,
    comment: string,
    compactize: boolean
}

export interface PricerMarket {
    id: number,
    name?: string,
}

export interface AppraisalValues {
    totalBuyPrice: number,
    totalSplitPrice: number,
    totalSellPrice: number,
}

export interface AppraisalItem {
    id: number,
    amount: number,
    buyOrderCount: number,
    buyVolume: number,
    sellOrderCount: number,
    sellVolume: number,
    effectivePrices: AppraisalItemValues,
    immediatePrices: AppraisalItemValues,
    top5AveragePrices: AppraisalItemValues,
    totalVolume: number,
    totalPackagedVolume: number,
    itemType: ItemType,
}

export interface AppraisalItemValues {
    buyPrice: number,
    splitPrice: number,
    sellPrice: number,
    buyPriceTotal: number,
    splitPriceTotal: number,
    sellPriceTotal: number,
    buyPrice5DayMedian: number,
    splitPrice5DayMedian: number,
    sellPrice5DayMedian: number,
    buyPrice30DayMedian: number,
    splitPrice30DayMedian: number,
    sellPrice30DayMedian: number,
}

export interface ItemType {
    eid: number,
    name?: string,
    volume: number,
    packagedVolume: number,
}

export interface Appraisal {
    id: number,
    created: string, //date
    expires: string, //date 
    datasetTime: string, //date
    code?: string,
    designation: string,
    pricing: string,
    pricingVariant: string,
    pricePercentage: number,
    comment?: string,
    isCompactized: boolean,
    input?: string,
    failures?: string,
    market: PricerMarket,
    totalVolume: number,
    totalPackagedVolume: number,
    effectivePrices: AppraisalValues,
    immediatePrices: AppraisalValues,
    top5AveragePrices: AppraisalValues,
    items: AppraisalItem[],
}
