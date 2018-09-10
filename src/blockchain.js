const Block  = require('./block');

class Blockchain {

  constructor() {
    this.chain = [new Block('0','0')];
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.latestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  checkValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  getTransactionByHash(transactionHash) {
    var transaction = null;
  //  this.chain.forEach(function(item) {

  //  });
    return transaction;
  }

  verifyTransaction(transaction) {
    console.log('Start validation of transaction ' + transaction.getTransactionHash());

    // Check if transaction with same hash already exists (collision)
  //  if (getTransactionByHash(transaction.getTransactionHash()) === null) {
  //    return false;
//    }

    // Verify transaction input and output: input === output
    var transOutputSum = 0;
    transaction.getOutput().forEach(function(item){
      transOutputSum += item.getAmount();
    });



    return false;
  }

}

let jsChain = new Blockchain();
jsChain.addBlock(new Block({amount: 5},{amount:5},'asda123',0,true));
jsChain.addBlock(new Block({amount: 15},{amount:15},'asda123',20,true));

console.log(JSON.stringify(jsChain, null, 4));
console.log("Is blockchain valid? " + jsChain.checkValid());

module.exports = Blockchain;
