
const SHA256 = require('crypto-js/sha256')
const forge = require('node-forge');

class Transaction {
  constructor(inputParam, outputParam) {
    this.data = {};
    if (Array.isArray(inputParam)) {
      this.data.input = inputParam;
    } else {
      this.data.input = [];
      this.data.input.push(inputParam);
    }

    if (Array.isArray(outputParam)) {
      this.data.output = outputParam;
    } else {
      this.data.output = [];
      this.data.output.push(outputParam);
    }
    this.signatures = [];
    this.transactionHash = '';
  }

  createTransactionHash() {
    var md = forge.md.sha256.create();
    md.update(this.data + this.signatures);
    this.transactionHash = md.digest().toHex();
  }

  // Signs the data part of the Transaction
  sign(privateKey) {
    var md = forge.md.sha256.create();
    md.update(this.data, 'utf8');
    var signature = privateKey.sign(md);
    this.signatures.push(signature);
  }

  checkSign(publicKey) {
    return publicKey.verify(md.digest().bytes(), signature);
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
