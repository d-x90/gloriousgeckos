const solanaService = require('./solana-service');

require('../utils').init();
require('../models/associations');

// Resurrect nfts daily if at least one gecko is held
(async () => {
    const r = await solanaService.getNfts(
        '5vpZoYKJoKYoqYjXvU1yLKA82MvtTWSB1Ev5GoipfxP7'
    );
    console.log({ r });
})();
