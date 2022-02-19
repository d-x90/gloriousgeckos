const decorators = {};

decorators.limitUsageAtOnce = (fn, maxNumberOfCallsAtOnce) => {
    let currentNumberOfCalls = 0;

    return async (...args) => {
        while (maxNumberOfCallsAtOnce < currentNumberOfCalls + 1) {
            await Promise.waitFor(250);
        }
        currentNumberOfCalls++;
        const returnValue = await fn(...args);
        currentNumberOfCalls--;

        return returnValue;
    };
};

module.exports = decorators;
