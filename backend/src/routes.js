const routes = require('express').Router();

const userRoutes = require('./controllers/user-controller');
const authRoutes = require('./controllers/auth-controller');
const nftRoutes = require('./controllers/nft-controller');
const gameRoutes = require('./controllers/game-controller');
const tokenRoutes = require('./controllers/token-controller');
const storeRoutes = require('./controllers/store-controller');

routes.use('/v1/user', userRoutes);
routes.use('/v1/auth', authRoutes);
routes.use('/v1/nft', nftRoutes);
routes.use('v1/token', tokenRoutes);
routes.use('/v1/game', gameRoutes);
routes.use('/v1/store', storeRoutes);

module.exports = routes;
