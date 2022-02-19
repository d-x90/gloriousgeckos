const waitFor = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const init = () => {
    Promise.waitFor = waitFor;
};

module.exports = { init };
