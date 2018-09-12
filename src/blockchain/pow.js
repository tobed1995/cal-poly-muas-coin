'use strict';

const x11 = require('x11-hash-js');
const Block = require('./block');

class ProofOfWork {

    constructor() {

    }

    proofOfWork(block) {
        //not implemented because the showcase would take too much time
        //var targetValue = '00000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';

        //takes up to 5 - 30 seconds 
        var targetValue = '000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
        var t0 = new Date();
        while(true) {
            var x11Hash = this.calculateX11Hash(block.transaction + block.previousHash + block.nonce);
            console.log("x11Hash: " + x11Hash + "; targetValue: " + targetValue + "; true? " + (x11Hash < targetValue));
            if (x11Hash < targetValue) {
                var t1 = new Date();
                console.log("BLOCK MINED IN: " + (t1 - t0) + " milliseconds. Hash of mined block " + x11Hash + " Nonce of mined block: " + block.nonce);
                //set hash to block
                block.blockHash = x11Hash;
                return block;
            }
            var nonceInc = block.nonce + 1;
            block.nonce = nonceInc;
        }
    }

    validatePow(block) {
        var hashOfBlock = block.getBlockHash;
        console.log("Hash of block: " + hashOfBlock);
        var x11HashBlock = this.calculateX11Hash(block.transaction + block.previousHash + block.nonce);
        console.log("X11 hash of block: " + x11HashBlock);
        if(hashOfBlock === x11HashBlock) {
            return true;
        } else {
            return false;
        }
    }

    calculateX11Hash(input) {
        var blake = this.blakeHash(input);
        var bmw = this.bmwHash(blake);
        var groest = this.groestlHash(bmw);
        var jh = this.jhHash(groest);
        var keccak = this.keccakHash(jh);
        var skein = this.skeinHash(keccak);
        var luffa = this.luffaHash(skein);
        var cubehash = this.cubehashHash(luffa);
        var shavite = this.shaviteHash(cubehash);
        var simd = this.simdHash(shavite);
        var echo = this.echoHash(simd);
        return echo;
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