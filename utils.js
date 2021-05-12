//return false if contains empty string
const checkArray = (my_arr) => {
    for (var i = 0; i < my_arr.length; i++) {
        if (my_arr[i] === "")
            return false;
    }
    return true;
}

const isNumeric = (num) => {
    return !isNaN(num)
}

const uuid = () => {
    return `${random_id()}${random_id()}`;
}

const random_id = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1).toLowerCase();
}


module.exports = {
    checkArray: checkArray,
    isNumeric: isNumeric,
    uuid: uuid
}