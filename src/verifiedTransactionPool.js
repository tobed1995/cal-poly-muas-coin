const Transaction = require('./transaction');

class VerifiedTransactionPool {

    constructor() {
        this.transArray = [];
    }

    pushTransaction(transaction) {
        if (transaction === undefined || transaction === null) {
            return false;
        }

        this.transArray.push(transaction);
        console.log('Push new length: ' + this.transArray.length);
        return true;
    }

    getNextTransaction() {
        if (this.transArray.length < 1) return null;

        return this.transArray.splice(0, 1)[0];
    }

    getCurrentPoolSize() {
        return this.transArray.length;
    }
}

module.exports = VerifiedTransactionPool;
