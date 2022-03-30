export interface Type {
    "capacity"?: number,
    "description": string,
    "dogma_attributes"?: object[],
    "dogma_effects"?: object[],
    "graphic_id"?: number,
    "group_id": number,
    "icon_id"?: number,
    "market_group_id"?: number,
    "mass"?: number,
    "name": string,
    "packaged_volume"?: number,
    "portion_size"?: number,
    "published": boolean,
    "radius"?: number,
    "type_id": number,
    "volume"?: number
}

export interface Group {
    "category_id": number,
    "group_id": number,
    "name": string,
    "published": boolean,
    "types": number[]
}