const Block  = require('./block')
const forge = require('node-forge');

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

  verifyTransaction(transaction) {
    console.log('Start validation of transaction ' + transaction.getTransactionHash());

    if (!this.isTransactionHashValid(transaction)) {
      console.error('Transaction hash is empty or invalid.');
      return false;
    }

    if (!this.isTransactionInputEqualsSignatures(transaction)) {
      console.error('Transaction inputs not matching with number of signatures.');
      return false;
    }

    if (!this.areSignaturesValid(transaction)) {
      console.error('Transaction signatures are invalid.');
      return false;
    }

    if (!this.areTransactionInputsValid(transaction)) {
      // Errormessage will be log in method itself, if anything occurs.
      return false;
    }

    if (!this.isCoinInputEqualsOutput(transaction)) {
      console.error('Transaction Input and Output amount not equal.');
      return false;
    }

    if (!this.isTransactionNotInChainYet(transaction)) {
      console.error('Transaction already in chain!');
      return false;
    }

    if (!this.areTransactionInputsUnique(transaction)) {
      console.error('Transaction uses same input more than once.');
      return false;
    }

    return true;
  }

  isTransactionHashValid(transaction) {
    var hash = transaction.transactionHash;

    if (hash === undefined || hash === null || hash === '') {
      return false;
    }
    var md = forge.md.sha256.create();
    return hash === md.update(transaction.data + transaction.signatures).digest().toHex();
  }

  isTransactionInputEqualsSignatures(transaction) {
    var inputLength = transaction.input.length;
    var signatureLength = transaction.signatures.length;
    return inputLength === signatureLength;
  }

  areSignaturesValid(transaction) {
    var md = forge.md.sha256.create();
    md.update(transaction.data, 'utf8');

    for (var index = 0; index < transaction.input.length; index++) {
      var item = transaction.input[index];
      let referencedInputTransaction = this.getTransactionByHash(item.transaction_hash);
      // receiverId == public key of reiceiver
      var receiverId = referencedInputTransaction.getOutput()[item.output_index].receiverId;

      var inputValidated = false;
      for (var index2 = 0; index2 < transaction.getSignatures().length; index2++) {
        var sig = transaction.signatures[index2];
        if (receiverId.verify(md.digest().bytes(), sig)) {

        }
        inputValidated = receiverId.verify(md.digest().bytes(), sig);
      }
    }


    return false;
  }

  areTransactionInputsValid(transaction) {
    for (var index = 0; index < transaction.getInput().length; index++) {
      let item = transaction.getInput()[index];
      let referencedOutputTransaction = this.getTransactionByHash(item.transaction_hash);

      if (referencedInputTransaction === null) {
        console.error('Output referenced by Input is not in the chain!');
        return false;
      }

      if (!this.isTransactionOutputNotUsedYet(referencedOutputTransaction, item.output_index)) {
        console.error('Transaction Input and Output amount not equal.');
        return false;
      }
    }
  }

  isTransactionOutputNotUsedYet(transaction, outputIndex) {
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
    return amount < 1;
  }

  isCoinInputEqualsOutput(transaction) {
      var transOutputSum = 0; // sum of output coins of this transaction.
      var transInputSum = 0; // sum of input coins of this transaction.
      transaction.getOutput().forEach(function(item) {
        transOutputSum += item.getAmount();
      });
      for (var index = 0; index < transaction.getInput().length; index++) {
        let item = transaction.getInput()[index];
        let referencedInputTransaction = this.getTransactionByHash(item.transaction_hash);

        transInputSum += referencedInputTransaction.getOutput()[item.output_index].amount;
      }

      return transOutputSum === transInputSum;
    }

  isTransactionNotInChainYet(transaction) {
    return this.getTransactionByHash(transaction.getTransactionHash()) !== null;
  }

  areTransactionInputsUnique(transaction) {
    for (var index = 0; index < transaction.input.length; index++) {
      var currInput = transaction.input[index];

      for (var index2 = 0; index2 < transaction.input.length; index2++) {
        if (index === index2) {
          continue;
        }
        var input2 = transaction.input[index2];

        if (currInput.transaction_hash === input2.transaction_hash) {
          if (currInput.output_index === input2.output_index) {
            return false;
          }
        }
      }
    }

    return true;
  }
}

module.exports = Blockchain;
