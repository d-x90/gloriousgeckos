const bs58 = require('bs58');

const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

const logger = require('../logger-factory').get('./shitty-encryptor.js');

const shittyEncryptor = {};

shittyEncryptor.decode = (payload) => {
    try {
        const iter1 = bs58.decode(payload);
        const iter1String = nacl.util.encodeUTF8(iter1);
        if (!iter1String.startsWith('90')) {
            throw new Error();
        }
        const iter2 = bs58.decode(iter1String.substring(2)); // remove 90 from start
        const iter2String = nacl.util.encodeUTF8(iter2);
        if (!iter2String.startsWith('dx')) {
            throw new Error();
        }
        const iter3 = bs58.decode(iter2String.substring(2)); // remove dx from start

        return JSON.parse(nacl.util.encodeUTF8(iter3));
    } catch (err) {
        return false;
    }
};

module.exports = shittyEncryptor;
