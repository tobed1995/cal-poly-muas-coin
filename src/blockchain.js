const Block  = require('./block')
const fs = require('fs')

class Blockchain {

  constructor() {
    this.chain = [];
/* var self = this;
    fs.readFileSync('chain.json', 'utf8', function (err, data) {
      if (err) {
        console.error('Could not found chain data. Create new file.');
        fs.writeFileSync('chain.json', '')
      } else {
        console.log('Load chaindata: ' + data);
        self.chain = JSON.parse(data);
      }
    }); */
  }

  latestBlock() {
    if (this.chain.length > 0) {
      return this.chain[this.chain.length - 1];
    } else {
      return null;
    }
  }

  addBlock(newBlock) {
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
    fs.writeFileSync("chain.json", JSON.stringify(this.chain), {encoding:'utf8',flag:'w'});
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
    for (var index = 0; index < this.chain.length; index++) {
      var singleBlock = this.chain[index];

      for (var index2 = 0; index2 < singleBlock.transaction.length; index2++) {
        var singleTrans = singleBlock.transaction[index2];

        if (singleTrans.getTransactionHash() === transactionHash) {
          return singleTrans;
        }
      }
    }
    return null;
  }

  getNumberOfReferencesForOutput(transaction, outputIndex) {
      var transHash = transaction.getTransactionHash();
      var amount = 0;

      for (var index = this.chain.length - 1; index >= 0; index--) {
        var singleBlock = this.chain[index];

        for (var index2 = 0; index2 < singleBlock.transaction.length; index2++) {
          var singleTrans = singleBlock.transaction[index2];

          for (var index3 = 0; index3 < singleTrans.getInput().length; index3++) {
            var singleInput = singleTrans.getInput();

            if (singleInput.transaction_hash === transHash
              && singleInput.output_index === outputIndex) {
              amount++;
            }
          }
        }
      }

      return amount;
  }

  verifyTransaction(transaction) {
    console.log('Start validation of transaction ' + transaction.getTransactionHash());

    // Check if transaction with same hash already exists in blockchain (collision)
    if (this.getTransactionByHash(transaction.getTransactionHash()) !== null) {
      console.log('Found collision');
      return false;
    }

    // Verify transaction input and output: input === output
    // Plus verify that input object is the newest.
    var transOutputSum = 0; // sum of output coins of this transaction.
    var transInputSum = 0; // sum of input coins of this transaction.
    transaction.getOutput().forEach(function(item) {
      transOutputSum += item.getAmount();
    });
    for (var index = 0; index < transaction.getInput().length; index++) {
      let item = transaction.getInput()[index];
      let referencedInputTransaction = this.getTransactionByHash(item.transaction_hash);

      if (referencedInputTransaction === null) {
        // This case happens, if the transaction in input object is not in chain yet.
        return null;
      }
      transInputSum += referencedInputTransaction.getOutput()[item.output_index].amount;

      // Verify used output not used yet(getNumberOfReferencesForOutput must be zero):
      var number = this.getNumberOfReferencesForOutput(referencedInputTransaction, item.output_index);
      console.log('Number of output usages: ' + number);
      if (number > 0) {
        return false;
      }
    }

    return transOutputSum === transInputSum;
  }

}

module.exports = Blockchain;
