
const SHA256 = require('crypto-js/sha256')

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

  sign(privateKey) {
    var md = forge.md.sha256.create();
    md.update(this.data, 'utf8');
    console.log(md.digest().toHex());

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
    if (this.transactionHash === '') {
      this.transactionHash = SHA256(this.data.input + this.data.output + this.signatures).toString();
    }
    return this.transactionHash;
  }
}

module.exports = Transaction
