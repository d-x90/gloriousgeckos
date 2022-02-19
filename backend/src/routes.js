const routes = require('express').Router();

const userRoutes = require('./controllers/user-controller');
const authRoutes = require('./controllers/auth-controller');
const nftRoutes = require('./controllers/nft-controller');

routes.use('/v1/user', userRoutes);
routes.use('/v1/auth', authRoutes);
routes.use('/v1/nft', nftRoutes);

module.exports = routes;
