const RequestCountCollector = require('./RequestCountCollector')
const RequestCountReporter = require("./RequestCountReporter");
const startAutoScaler = require('./autoscaler');


const requestCollector = new RequestCountCollector();
const requestReporter = new RequestCountReporter({objectMode: true});

const { floorToSecond } = require('./utils');

let mostRecentSec = floorToSecond(Date.now());

let eventQueue = [];

requestCollector.on('data', (e) => eventQueue.push(e));

requestReporter.on('readyToReceive', () => {
    if (eventQueue.length == 0) {
        return;
    }

    const currentSec = floorToSecond(Date.now());

    const writeable = eventQueue.filter((e) => e.timestamp < currentSec)
                                .reduce((prev, cur) => {
                                    return {
                                        ...prev,
                                        count: prev.count + cur.count
                                    }
                                }, { secondPrecisionTime: mostRecentSec, count: 0 });

    if (writeable.count > 0) {
        requestReporter._write(writeable, "UTF-8", () => {});
    }

    mostRecentSec = currentSec;
    eventQueue = eventQueue.filter((e) => e.timestamp >= mostRecentSec);
});

// Do not change/remove the code below this line
startAutoScaler(requestCollector, requestReporter);
