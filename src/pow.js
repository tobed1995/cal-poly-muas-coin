'use strict'

const x11 = require('@dashevo/x11-hash-js');

class ProofOfWork {

    constructor() {

    }

    proofOfWork(nonce, block) {
        //not implemented because the showcase would take too much time
        //var targetValue = 0x00000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

        //takes up to 5 - 30 seconds 
        var targetValue = '000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';

        var t0 = new Date();

        while(true) {
            var x11Hash = this.calculateX11Hash(nonce + block);
            //console.log("x11Hash: " + x11Hash + "; targetValue: " + targetValue + "; true? " + (x11Hash < targetValue));
            if (x11Hash < targetValue) {
                var t1 = new Date();
                console.log("BLOCK MINED IN: " + (t1 - t0) + " milliseconds. Hash of mined block " + x11Hash + " Nonce of mined block: " + nonce);
                //set nonce and hash to block
                block.setNonce(nonce);
                block.setBlockHash(x11Hash);
                return block;
            }
            
            nonce++
        }
    }

    validatePow(block) {

        var nonceOfBlock = block.getNonce();
        
        var hashOfBlock = block.getBlockHash();
       
        var x11HashBlock = this.calculateX11Hash(nonceOfBlock + block);
        
        console.log(block)

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