// Start tests with npm test
//test are based on jasmine framework

const forge = require('node-forge');
const Blockchain = require('../src/blockchain/blockchain');
const Input = require('../src/blockchain/transaction/input');
const Output = require('../src/blockchain/transaction/output');
const Transaction = require('../src/blockchain/transaction/transaction');

describe("Transaction Tests", function() {

    const rsa = forge.pki.rsa;
    const keyPair = rsa.generateKeyPair({bits: 1024, e: 0x10001});
    const chain = new Blockchain();

    // helper-Function
    function createTransaction(numberOfInputs,...args) {

        var input = [];
        var output = [];

        for (var i = 0; i < args.length; i++) {
            if(i < numberOfInputs) input.push(args[i]);
            else output.push(args[i]);
        }
        return new Transaction(input, output);
    }


    it("I`m a testcase", function() {
        expect(false).not.toBe(true);
    });


    it("Create Transaction & Test hashing", function() {

        var trans1 = createTransaction(2,new Input("hashpointer0",0), new Input("hashpointer1",1), new Output("Pubkey1",10));

        trans1.sign(keyPair.privateKey);
        trans1.createTransactionHash();
        console.log(JSON.stringify(trans1,null,4));

        var md = forge.md.sha256.create();
        md.update(trans1.data + trans1.signatures);

        expect(trans1.getTransactionHash()).toBe(md.digest().toHex());
    });

    it("", function() {
        expect(false).not.toBe(true);
    });
    
});
