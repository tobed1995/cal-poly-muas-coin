
const SHA256 = require('crypto-js/sha256')

class Transaction {
  constructor(inputParam, outputParam, signaturesParam) {
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
    if (Array.isArray(signaturesParam)) {
      this.signatures = signaturesParam;
    } else {
      this.signatures = [];
      this.signatures.push(signaturesParam);
    }
    this.transactionHash = SHA256(this.input + this.output + this.signatures).toString();
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
}

module.exports = Transaction
