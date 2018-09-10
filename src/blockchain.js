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
          return transaction;
        }
      });
    });
    return null;
  }

// TODO: double spending of output objects
  verifyTransaction(transaction) {
    console.log('Start validation of transaction ' + transaction.getTransactionHash());

    // Check if transaction with same hash already exists in blockchain (collision)
    if (this.getTransactionByHash(transaction.getTransactionHash()) !== null) {
      console.log('Found collision');
      return false;
   }

    // Verify transaction input and output: input === output
    var transOutputSum = 0; // sum of output coins of this transaction.
    var transInputSum = 0; // sum of input coins of this transaction.
    transaction.getOutput().forEach(function(item) {
      transOutputSum += item.getAmount();
    });

    for (var index = 0; index < transaction.getInput().length; index++) {
      var item = transaction.getInput()[index];
      console.log(item);
      var referencedInputTransaction = this.getTransactionByHash(item.transaction_hash);
      console.log(this.getTransactionByHash(item.transaction_hash));
      console.log(referencedInputTransaction);

      if (referencedInputTransaction === null) {
        // This case happens, if the transaction in input object is not in chain yet.
        return null;
      }
      transInputSum += referencedInputTransaction.getOutput()[item.output_index].amount;
    }

    console.log('Inputsum: ' + transInputSum);
    console.log('Outputsum: ' + transOutputSum);

    return transOutputSum === transInputSum;
  }

}

module.exports = Blockchain;
