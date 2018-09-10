const SHA256 = require('crypto-js/sha256')

class Block {

  constructor(transaction, previousHash) {
    if (Array.isArray(transaction)) {
      this.transaction = transaction;
    } else {
      this.transaction = [];
      this.transaction.push(transaction);
    }
    this.previousHash = previousHash;
    this.nonce = null;
    this.blockHash = null;
  }

  getTransactions() {
    return this.transaction;
  }
  getPreviousHash() {
    return this.previousHash;
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
    return SHA256(this.transaction + this.previousHash + this.nonce).toString();
  }

}

module.exports = Block;
