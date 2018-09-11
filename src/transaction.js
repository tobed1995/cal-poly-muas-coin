
const SHA256 = require('crypto-js/sha256')

class Transaction {
  constructor(inputParam, outputParam, signaturesParam, transactionType) {
    if (Array.isArray(inputParam)) {
      this.input = inputParam;
    } else {
      this.input = [];
      this.input.push(inputParam);
    }

    if (Array.isArray(outputParam)) {
      this.output = outputParam;
    } else {
      this.output = [];
      this.output.push(outputParam);
    }
//t follows is an attempt to explain, from the ground up, why the particular pieces (digital signatures, proof-of-work, transaction blocks) are needed, and how they all come together to form the "minimum viable block chain" with all of its remarkable properties.
    if (Array.isArray(signaturesParam)) {
      this.signatures = signaturesParam;
    } else {
      this.signatures = [];
      this.signatures.push(signaturesParam);
    }
    this.transactionType = transactionType;

    this.transactionHash = SHA256(this.input + this.output + this.signatures + this.transactionType).toString();
  }

  getInput() {
    return this.input;
  }
  getOutput() {
    return this.output;
  }
  getSignatures() {
    return this.signatures;
  }
  getTransactionHash() {
    return this.transactionHash;
  }
  getTransactionType() {
    return this.transactionType;
  }
}

module.exports = Transaction
