'use strict';

const x11 = require('x11-hash-js');
const Block = require('./block');

class ProofOfWork {

    constructor() {

    }

    proofOfWork(block) {
        //not implemented because the showcase would take too much time
        //let targetValue = '00000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';

        //takes up to 5 - 30 seconds 
        let targetValue = '000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
        return this.doPow(block, targetValue);
    }

    doPow(block, targetValue) {
        let t0 = new Date();

        while (true) {
            let x11Hash = this.calculateX11Hash(block.transaction + block.previousHash + block.nonce);
            // console.log("x11Hash: " + x11Hash + "; targetValue: " + targetValue + "; true? " + (x11Hash < targetValue));
            if (x11Hash < targetValue) {
                let t1 = new Date();
                console.log("BLOCK MINED IN: " + (t1 - t0) + " milliseconds. Hash of mined block " + x11Hash + " Nonce of mined block: " + block.nonce);
                //set hash to block
                block.blockHash = x11Hash;
                return block;
            }
            block.nonce = block.nonce + 1;
        }
    }

    validatePow(block) {
        let hashOfBlock = block.getBlockHash;
        // console.log("Hash of block: " + hashOfBlock);
        let x11HashBlock = this.calculateX11Hash(block.transaction + block.previousHash + block.nonce);
        // console.log("X11 hash of block: " + x11HashBlock);
        return hashOfBlock === x11HashBlock;
    }

    calculateX11Hash(input) {
        let blake = this.blakeHash(input);
        let bmw = this.bmwHash(blake);
        let groest = this.groestlHash(bmw);
        let jh = this.jhHash(groest);
        let keccak = this.keccakHash(jh);
        let skein = this.skeinHash(keccak);
        let luffa = this.luffaHash(skein);
        let cubehash = this.cubehashHash(luffa);
        let shavite = this.shaviteHash(cubehash);
        let simd = this.simdHash(shavite);
        return this.echoHash(simd);
    }

    blakeHash(input) {
        return x11.blake(input);
    }

    bmwHash(input) {
        return x11.bmw(input);
    }

    groestlHash(input) {
        return x11.groestl(input);
    }

    jhHash(input) {
        return x11.jh(input);
    }

    keccakHash(input) {
        return x11.keccak(input);
    }

    skeinHash(input) {
        return x11.skein(input);
    }

    luffaHash(input) {
        return x11.luffa(input);
    }

    cubehashHash(input) {
        return x11.cubehash(input);
    }

    shaviteHash(input) {
        return x11.shavite(input);
    }

    simdHash(input) {
        return x11.simd(input);
    }

    echoHash(input) {
        return x11.echo(input);
    }

}

module.exports = ProofOfWork;