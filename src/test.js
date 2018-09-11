'use strict'

const ProofOfWork = require('./pow');
const Block = require('./block');


var testBlock = new Block()
var genesisBlock = testBlock.getGenesisBlock();
var proofOfWork = new ProofOfWork();
console.log("Nonce: " + genesisBlock.getNonce());
console.log(proofOfWork.proofOfWork(1234214, genesisBlock));