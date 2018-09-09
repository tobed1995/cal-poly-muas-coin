class Output {

  constructor(receiverId, amount) {
    this.receiverId = receiverId;
    this.amount = amount;
  }

  getReceiverId() {
    return this.receiverId;
  }

  getAmount() {
    return this.amount;
  }

}

module.exports = Output
