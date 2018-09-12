class Output {
    /**
     receiverId is public key or sth else to identify receiver of coins.
     amount is the amount of coins, which the receiver gets.
     */
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

module.exports = Output;
