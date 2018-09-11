const SHA256 = require('crypto-js/sha256')

class Block {

  constructor(transaction, previousBlock) {
    if (Array.isArray(transaction)) {
      this.transaction = transaction;
    } else {
      this.transaction = [];
      this.transaction.push(transaction);
    }
    this.previousBlock = previousBlock;
    this.nonce = null;
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
    if (this.nonce === null) {
      this.nonce = nonce;
    }
  }

  setBlockHash(hash) {
    if (this.blockHash === null) {
      this.blockHash = hash;
    }
  }

  calculateHash() {
    return SHA256(this.transaction + this.previousBlock + this.nonce).toString();
  }

}

module.exports = Block;
