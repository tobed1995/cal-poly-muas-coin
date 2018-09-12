'use strict';

const ProofOfWork = require('./pow');
const Block = require('./block');


var testBlock = new Block();
var genesisBlock = testBlock.getGenesisBlock();
var proofOfWork = new ProofOfWork();

<<<<<<< HEAD
console.log(genesisBlock)
var blockPow = proofOfWork.proofOfWork(genesisBlock);

console.log(proofOfWork.validatePow(blockPow));
blockPow.nonce = 124142;

console.log(proofOfWork.validatePow(blockPow));
=======
console.log(genesisBlock);
var blockPow = proofOfWork.proofOfWork(genesisBlock.getNonce(), genesisBlock);

proofOfWork.validatePow(blockPow);

>>>>>>> afc8ad71339d2b1f8ed79b3ef837406da2262471
