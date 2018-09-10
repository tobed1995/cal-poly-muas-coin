const SHA256 = require('crypto-js/sha256')

class Block {

  constructor(transaction, previousHash) {
    this.transaction = transaction;
    this.previousHash = previousHash;
    this.nonce = null;
    this.blockHash = null;
  }

  getTransaction() {
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

  calculateHash() {
    return SHA256(this.transaction + this.previousHash + this.nonce + this.blockHash).toString();
  }

}

module.exports = Block;
