'use strict'

const ProofOfWork = require('./pow');
const Block = require('./block');


var testBlock = new Block()
var genesisBlock = testBlock.getGenesisBlock();
var proofOfWork = new ProofOfWork();

console.log(genesisBlock)
var blockPow = proofOfWork.proofOfWork(genesisBlock);

console.log(proofOfWork.validatePow(blockPow));
blockPow.nonce = 124142;

console.log(proofOfWork.validatePow(blockPow));