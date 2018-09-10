const SHA256 = require('crypto-js/sha256')

class Block {

  constructor(transaction, previousHash) {
    this.transaction = transaction;
    this.previousHash = previousHash;
  }

  calculateHash() {
    return SHA256(this.transaction_hash + this.input + this.output + this.signatures + this.previous_hash + this.nonce + this.p_o_w).toString();
  }

}


class Input {

  constructor(transaction_hash, output_index) {
    this.transaction_hash = transaction_hash;
    this.output_index = output_index;
  }

}

/*
 * class representing an output object.
 * 3 arguments arr of receiver -> value pairs.
 * a pair consists of : public key,
 *
 */
class Output {

  constructor(sender_id, receiver_id, amount) {
    this.sender_id = sender_id;
    this.receiver_id = receiver_id;
    this.amount = amount;
  }

}


module.exports = {
  Block,
  Input,
  Output
};
