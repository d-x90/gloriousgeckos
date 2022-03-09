const axios = require('axios');
const logger = require('../logger-factory').get('./degods-api.js');

const DEGODS_API_URL = 'https://api.degods.com/v1';

const degodsApi = {};

degodsApi.fetchStakingInfo = async (wallet) => {
    try {
        const response = await axios.post(`${DEGODS_API_URL}/farmerstats`, {
            pubkey: wallet,
        });

        if (response.status !== 200) {
            logger.error(response);
            throw new Error('Degods staking lookup failed');
        }

        return response.data;
    } catch (error) {
        logger.error(error);
        logger.error('Degods staking lookup failed');
        return null;
    }
};

module.exports = degodsApi;
