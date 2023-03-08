function floorToSecond(timestamp) {
    return Math.floor(timestamp/1000) * 1000;
}

module.exports = {
    floorToSecond,
}