const containsList = (list, item) => {
    
    return list.indexOf(item) !== -1
}

const randomItemFromList = (list) => {
    const size = list.length
    const itemIndex = Math.floor(Math.random() * size);
    return list[itemIndex]
}

module.exports = { containsList, randomItemFromList }