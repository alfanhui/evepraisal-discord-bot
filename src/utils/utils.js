export const isNumeric = (num) => {
    return !isNaN(num)
}

export const uuid = () => {
    return `${random_id()}${random_id()}`;
}

export const random_id = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1).toLowerCase();
}

export const flattenJSONtoArray = (obj = {}) => {
    let array = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            array = array.concat(obj[key]);
        }
    };
    return array;
};