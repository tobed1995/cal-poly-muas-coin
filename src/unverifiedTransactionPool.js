const Transaction = require('./transaction')

class UnverifiedTransactionPool {

  constructor() {
      this.transArray = [];
  }

  pushTransaction(transaction) {
    if (transaction === undefined || transaction === null) {
      console.error('Transaction can not be null or undefined!');
      return false;
    }

    this.transArray.push(transaction);
    console.log('Push new length: ' + this.transArray.length);
    return true;
  }

  getRandomTransaction() {
    if (this.transArray.length < 1) return null;

    const index = Math.floor(Math.random()*this.transArray.length);

    this.transArray.sort(() => Math.random() - 0.5);
    const transaction = this.transArray.splice(index,1)[0];

    console.log('New size of pool: ' + this.transArray.length);
    return transaction;
  }

  getCurrentPoolSize() {
      return this.transArray.length;
  }

  getPool() {
    return this.transArray;
  }
}

module.exports = UnverifiedTransactionPool
