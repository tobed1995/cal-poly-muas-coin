class Input {
  /**
    transaction_hash referes to transaction where the coins come from
    output_index indexes the output value from transaction_hash.
  */
  constructor(transaction_hash, output_index) {
    this.transaction_hash = transaction_hash;
    this.output_index = output_index;
  }

}

module.exports = Input
