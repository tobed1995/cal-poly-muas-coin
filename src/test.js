'use strict'

const ProofOfWork = require('./pow');
const Block = require('./block');


var testBlock = new Block()
var genesisBlock = testBlock.getGenesisBlock();
var proofOfWork = new ProofOfWork();

console.log(genesisBlock)
var blockPow = proofOfWork.proofOfWork(genesisBlock.getNonce(), genesisBlock);

proofOfWork.validatePow(blockPow);
