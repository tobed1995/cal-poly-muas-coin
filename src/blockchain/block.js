//const SHA256 = require('crypto-js/sha256');
var Transaction = require('./transaction/transaction');
var Output = require('./transaction/output');
const forge = require('node-forge');

class Block {

    constructor(transaction, previousBlock) {
        if (Array.isArray(transaction)) {
            this.transaction = transaction;
        } else {
            this.transaction = [];
            this.transaction.push(transaction);
        }
        this.previousBlock = previousBlock;
        this.nonce = 0;
        this.blockHash = null;
    }

    getTransactions() {
        return this.transaction;
    }

    getPreviousBlock() {
        return this.previousBlock;
    }

    getNonce() {
        return this.nonce;
    }

    getBlockHash() {
        return this.blockHash;
    }

    setNonce(nonce) {
        if (this.nonce === 0) {
            this.nonce = nonce;
        }
    }

    setBlockHash(hash) {
        if (this.blockHash === null) {
            this.blockHash = hash;
        }
    }

    calculateHash() {
      var md = forge.md.sha256.create();
      md.update(this.transaction + this.previousBlock + this.nonce);
      return hash = md.digest().toHex();

      //return SHA256(this.transaction + this.previousBlock + this.nonce).toString();
    }

    getGenesisBlock() {
        //the genesis block has 25 coins
        var amountOfCoins = 25;
        var input = null;
        /**
         * TODO: Figure out what we can put to pubKey for genesis block
         */
        var output = new Output("pubKey", amountOfCoins);
        var transactionTemp = new Transaction(null, output);
        var genesisBlock = new Block(transactionTemp, null);

        return genesisBlock;
    }

}

module.exports = Block;