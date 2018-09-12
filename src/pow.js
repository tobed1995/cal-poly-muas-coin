'use strict';

var x11 = require('@dashevo/x11-hash-js');

class ProofOfWork {

    /** TODO: Figure out what we need as input */
    constructor(input) {

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