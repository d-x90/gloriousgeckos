const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('./utils').init();
require('./models/associations');

const { PORT, APPLICATION_NAME, CORS_ORIGIN } = require('./config');
const routes = require('./routes');
const middlewares = require('./middlewares');

const solanaService = require('./services/solana-service');

const app = express();

app.use(
    morgan('common', {
        stream: fs.createWriteStream(path.join(__dirname, '..', 'access.log'), {
            flags: 'a',
        }),
    })
);
app.use(
    helmet({
        contentSecurityPolicy: { reportOnly: true },
    })
);
app.use(
    cors({
        origin: CORS_ORIGIN,
    })
);
app.use(express.json());

app.use('/api', routes);

app.use('/api', middlewares.notFound);

app.use('/testtest', async (req, res) => {
    res.json({
        response: await solanaService.verifyNftWhitelist(
            req.query.mint,
            req.query.wallet
        ),
    });
});

app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'build')));
app.use(express.static(path.join(__dirname, '..', '..', 'unity')));

app.use((req, res) => {
    res.sendFile(
        path.join(__dirname, '..', '..', 'frontend', 'build', 'index.html')
    );
});

app.use(middlewares.notFound);

app.use(middlewares.errorHandler);

app.listen(PORT, () => {
    console.log(`${APPLICATION_NAME} started listening on port ${PORT}`);
});
