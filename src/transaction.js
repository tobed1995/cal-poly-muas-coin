
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

    if (Array.isArray(signaturesParam)) {
      this.signatures = signaturesParam;
    } else {
      this.signatures = [];
      this.signatures.push(signaturesParam);
    }
    this.transactionType = transactionType;

    this.transactionHash = SHA256(this.transacinput + this.output + this.signatures + this.transactionType).toString();
  }

  /** Adds Signature to transaction

  **/
  sign(privateKey) {

  var md = forge.md.sha256.create();
  md.update(this.toString(), 'utf8');                    // this should be string
  console.log(md.digest().toHex());

  var signature = privateKey.sign(md);
  this.signatures.push(signature);            // signatures should be always a array

  }

  // Verifies Signature

  checkSign() {


// add for each
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
  getTransactionType() {
    return this.transactionType;
  }
}

module.exports = Transaction
