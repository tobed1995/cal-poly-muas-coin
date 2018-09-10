const Block  = require('./block');

class Blockchain {

  constructor() {
    this.chain = [];
  }

  latestBlock() {
    if (this.chain.length > 0) {
      return this.chain[this.chain.length - 1];
    } else {
      return null;
    }
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.latestBlock();
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  checkValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  getTransactionByHash(transactionHash) {
    var transactionResult = null;
    this.chain.forEach(function(item) {
      item.getTransactions().forEach(function(transaction) {
        if (transaction.getTransactionHash() === transactionHash) {
          console.log('Found a collision!');
          return transaction;
        }
      });
    });
    return null;
  }

  verifyTransaction(transaction) {
    console.log('Start validation of transaction ' + transaction.getTransactionHash());

    // Check if transaction with same hash already exists in blockchain (collision)
    if (this.getTransactionByHash(transaction.getTransactionHash()) === null) {
      return false;
   }

    // Verify transaction input and output: input === output
    var transOutputSum = 0; // sum of output coins of this transaction.
    var transInputSum = 0; // sum of input coins of this transaction.
    transaction.getOutput().forEach(function(item){
      transOutputSum += item.getAmount();
    });
    transaction.getInput().forEach(function(item){
      // Load reference transaction
      var referencedOutputTransaction = getTransactionByHash(item.transaction_hash);
      if (referencedOutputTransaction === null) {
        // This case happens, if the transaction in input object is not in chain yet.
        return null;
      }
      transInputSum += referencedOutputTransaction.getOutput()[item.output_index].amount;
    });

    if (transOutputSum !== transInputSum) {
      return false;
    }

    // TODO: Add signature check!


    return true;
  }

}

module.exports = Blockchain;
