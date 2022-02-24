const {
    clusterApiUrl,
    Connection,
    Keypair,
    Transaction,
    SystemProgram,
    PublicKey,
} = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID, MintLayout } = require('@solana/spl-token');
const bs58 = require('bs58');

// connection
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

async () => {
    // 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8
    const feePayer = Keypair.fromSecretKey(
        bs58.decode(
            '588FU4PktJWfGfxtzpAAXywSNt74AvtroVzGfKkVN1LwRuvHwKGr851uH8czM5qm4iqLbs1kKoMKtMJG4ATR7Ld2'
        )
    );

    // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
    const alice = Keypair.fromSecretKey(
        bs58.decode(
            '4NMwxzmYj2uvHuq8xoqhY8RXg63KSVJM1DXkpbmkUY7YQWuoyQgFnnzn6yo3CMnqZasnNPNuAT2TLwQsCaKkUddp'
        )
    );

    // generate a new keypair for mint account
    const mint = Keypair.generate();
    console.log(`mint: ${mint.publicKey.toBase58()}`);

    let tx = new Transaction().add(
        // create mint account
        SystemProgram.createAccount({
            fromPubkey: feePayer.publicKey,
            newAccountPubkey: mint.publicKey,
            space: MintLayout.span,
            lamports: await Token.getMinBalanceRentForExemptMint(connection),
            programId: TOKEN_PROGRAM_ID,
        }),
        // init mint account
        Token.createInitMintInstruction(
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            mint.publicKey, // mint pubkey
            8, // decimals
            alice.publicKey, // mint authority
            alice.publicKey // freeze authority (if you don't need it, you can set `null`)
        )
    );
    console.log(
        `txhash: ${await connection.sendTransaction(tx, [feePayer, mint])}`
    );
};

(async () => {
    // const mint = "C2cPwsCGaFHuk8H8TqQ6DBtGaSsMb5xktFjfggxnsQMc";
    // let accountInfo = await connection.getParsedAccountInfo(new PublicKey(mint));
    // console.log(JSON.stringify(accountInfo, null, 4));

    const response = await connection.getParsedTransaction(
        'vKqyNz1DH8caKiabj5GuSuxnoiX9xusNwszXDwqjVsE8dRdHej7NjGhjbLpfuKjmgzsFS9fBWcU1EFE9F9eXhuW'
    );

    const wallet =
        response.transaction.message.instructions.parsed.info.authority; // user.wallet
    const tokenMint =
        response.transaction.message.instructions.parsed.info.mint; // token's mint
    const ourTokenAccount =
        response.transaction.message.instructions.parsed.info.destination; // Our token account for that token
    const amountSent =
        response.transaction.message.instructions.parsed.info.tokenAmount
            .uiAmount; // amount sent

    console.log(JSON.stringify(response, null, 2));
})();
