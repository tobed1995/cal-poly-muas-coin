let Transaction = require('./transaction/transaction');
let Output = require('./transaction/output');

class Block {

    constructor(transaction, previousBlock) {
        if (Array.isArray(transaction)) {
            this.transaction = transaction;
        } else {
            this.transaction = [];
            this.transaction.push(transaction);
        }
        this.previousHash = previousBlock;
        this.nonce = 0;
        this.blockHash = null;
    }

    get getTransactions() {
        return this.transaction;
    }

    get getPreviousHash() {
        return this.previousHash;
    }

    get getNonce() {
        return this.nonce;
    }

    get getBlockHash() {
        return this.blockHash;
    }

    set setNonce(nonce) {
        if (this.nonce === 0) {
            this.nonce = nonce;
        }
    }

    set setBlockHash(hash) {
        if (this.blockHash === null) {
            this.blockHash = hash;
        }
    }

    /**
     * Generate Genesis block with initial 25 coins.
     */
    static getGenesisBlock(privKey, pubKey) {
        let amountOfCoins = 25;
        let input = null;
        let output = new Output(pubKey, amountOfCoins);

        let genTransaction = new Transaction(input, output);

        genTransaction.sign(privKey);
        genTransaction.createTransactionHash();

        return new Block(genTransaction, null);
    }

}

module.exports = Block;
