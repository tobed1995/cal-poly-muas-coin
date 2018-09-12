const VerifyErrorCode = require("./verificationErrorCodes");

const forge = require('node-forge')

class TransactionValidator {

    /*
     Verifies Transaction like in Task 2
     - The signature verifies the transaction
     - Each input is only used once on the chain
     - The amount of coins in the output is satisfied by the number of coins in the input
     - The total number of coins in the input equals the number of coins in the output
    */
    verifyTransaction(transaction, chain) {
        console.log('Start validation of transaction ' + transaction.getTransactionHash());

        if (!this.isTransactionHashValid(transaction)) {
            console.error('Transaction hash is empty or invalid.');
            return VerifyErrorCode.HASH_FAULT;
        }

        if (!this.isTransactionSignaturesCountLessOrEqualsInputs(transaction)) {
            console.error('Transaction inputs not matching with number of signatures.');
            return VerifyErrorCode.TOO_MANY_SIGNATURES;
        }

        if (!this.areSignaturesValid(transaction, chain)) {
            console.error('Transaction signatures are invalid.');
            return VerifyErrorCode.SIGNATURES_INVALID;
        }

        if (!this.areTransactionInputsValid(transaction, chain)) {
            // Errormessage will be logged in method itself, if anything occurs.
            return VerifyErrorCode.INPUTS_INVALID;
        }

        if (!this.isCoinInputEqualsOutput(transaction, chain)) {
            console.error('Transaction Input and Output amount not equal.');
            return VerifyErrorCode.COIN_INBALANCE;
        }

        if (!this.isTransactionNotInChainYet(transaction, chain)) {
            console.error('Transaction already in chain!');
            return VerifyErrorCode.ALREADY_IN_CHAIN;
        }

        if (!this.areTransactionInputsUnique(transaction)) {
            console.error('Transaction uses same input more than once.');
            return VerifyErrorCode.DUPLICATE_INPUT;
        }

        return VerifyErrorCode.OK;
    }


    isTransactionHashValid(transaction) {
        let hash = transaction.transactionHash;

        if (hash === undefined || hash === null || hash === '') {
            return false;
        }
        let md = forge.md.sha256.create();
        return hash === md.update(transaction.data + transaction.signatures).digest().toHex();
    }

    isTransactionSignaturesCountLessOrEqualsInputs(transaction) {
        let inputLength = transaction.getInput().length;
        let signatureLength = transaction.signatures.length;
        return inputLength >= signatureLength;
    }

    areSignaturesValid(transaction, chain) {
        let md = forge.md.sha256.create();
        md.update(transaction.data, 'utf8');

        for (let index = 0; index < transaction.getInput().length; index++) {
            let singleInputItem = transaction.getInput()[index];
            let referencedOutputTransaction = this.getTransactionByHash(singleInputItem.transaction_hash, chain);
            // senderPubKey == public key of sender which signed this transaction
            let senderPubKey = referencedOutputTransaction.getOutput()[singleInputItem.output_index].receiverId;

            let inputValidated = false;
            for (let index2 = 0; index2 < transaction.getSignatures().length; index2++) {
                let sig = transaction.signatures[index2];

                if (senderPubKey.verify(md.digest().bytes(), sig)) {
                    inputValidated = true;
                    break;
                }
            }

            if (!inputValidated) {
                console.error('Could not verify signature');
                return false;
            }
        }

        return true;
    }

    areTransactionInputsValid(transaction, chain) {
        for (let index = 0; index < transaction.getInput().length; index++) {
            let item = transaction.getInput()[index];
            let referencedOutputTransaction = this.getTransactionByHash(item.transaction_hash, chain);

            if (referencedOutputTransaction === null) {
                console.error('Output referenced by Input is not in the chain!');
                return false;
            }

            if (!this.isTransactionOutputNotUsedYet(referencedOutputTransaction, item.output_index, chain)) {
                console.error('Transaction Input and Output amount not equal.');
                return false;
            }
        }
    }

    isTransactionOutputNotUsedYet(transaction, outputIndex, chain) {
        let transHash = transaction.getTransactionHash();
        let amount = 0;

        for (let index = chain.length - 1; index >= 0; index--) {
            let singleBlock = chain[index];

            for (let index2 = 0; index2 < singleBlock.transaction.length; index2++) {
                let singleTrans = singleBlock.transaction[index2];

                for (let index3 = 0; index3 < singleTrans.getInput().length; index3++) {
                    let singleInput = singleTrans.getInput();

                    if (singleInput.transaction_hash === transHash
                        && singleInput.output_index === outputIndex) {
                        amount++;
                    }
                }
            }
        }
        return amount < 1;
    }

    isCoinInputEqualsOutput(transaction, chain) {
        let transOutputSum = 0; // sum of output coins of this transaction.
        let transInputSum = 0; // sum of input coins of this transaction.
        transaction.getOutput().forEach(function (item) {
            transOutputSum += item.getAmount();
        });
        for (let index = 0; index < transaction.getInput().length; index++) {
            let item = transaction.getInput()[index];
            let referencedInputTransaction = this.getTransactionByHash(item.transaction_hash, chain);

            transInputSum += referencedInputTransaction.getOutput()[item.output_index].amount;
        }

        return transOutputSum === transInputSum;
    }

    isTransactionNotInChainYet(transaction, chain) {
        return this.getTransactionByHash(transaction.getTransactionHash(), chain) !== null;
    }

    areTransactionInputsUnique(transaction) {
        for (let index = 0; index < transaction.getInput().length; index++) {
            let currInput = transaction.getInput()[index];

            for (let index2 = 0; index2 < transaction.getInput().length; index2++) {
                if (index === index2) {
                    continue;
                }
                let input2 = transaction.getInput()[index2];

                if (currInput.transaction_hash === input2.transaction_hash) {
                    if (currInput.output_index === input2.output_index) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /*
    * Helper Funktion to get a Single Transaction out of Blockchain with Hashpointer
    */
    getTransactionByHash(transactionHash, chain) {
        for (let index = 0; index < chain.length; index++) {
            let singleBlock = chain[index];

            for (let index2 = 0; index2 < singleBlock.transaction.length; index2++) {
                let singleTrans = singleBlock.transaction[index2];

                if (singleTrans.getTransactionHash() === transactionHash) {
                    return singleTrans;
                }
            }
        }
        return null;
    }

}

module.exports = TransactionValidator;