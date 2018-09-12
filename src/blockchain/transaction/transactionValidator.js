const VerifyErrorCode = require("./verificationErrorCodes");

class TransactionValidator {

    /*
     Verifies Transaction like in Task 2
     - The signature verifies the transaction
     - Each input is only used once on the chain
     - The amount of coins in the output is satisfied by the number of coins in the input
     - The total number of coins in the input equals the number of coins in the output
    */
    verifyTransaction(transaction) {
        console.log('Start validation of transaction ' + transaction.getTransactionHash());

        if (!this.isTransactionHashValid(transaction)) {
            console.error('Transaction hash is empty or invalid.');
            return VerifyErrorCode.HASH_FAULT;
        }

        if (!this.isTransactionSignaturesCountLessOrEqualsInputs(transaction)) {
            console.error('Transaction inputs not matching with number of signatures.');
            return VerifyErrorCode.TOO_MANY_SIGNATURES;
        }

        if (!this.areSignaturesValid(transaction)) {
            console.error('Transaction signatures are invalid.');
            return VerifyErrorCode.SIGNATURES_INVALID;
        }

        if (!this.areTransactionInputsValid(transaction)) {
            // Errormessage will be logged in method itself, if anything occurs.
            return VerifyErrorCode.INPUTS_INVALID;
        }

        if (!this.isCoinInputEqualsOutput(transaction)) {
            console.error('Transaction Input and Output amount not equal.');
            return VerifyErrorCode.COIN_INBALANCE;
        }

        if (!this.isTransactionNotInChainYet(transaction)) {
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
        var hash = transaction.transactionHash;

        if (hash === undefined || hash === null || hash === '') {
            return false;
        }
        var md = forge.md.sha256.create();
        return hash === md.update(transaction.data + transaction.signatures).digest().toHex();
    }

    isTransactionSignaturesCountLessOrEqualsInputs(transaction) {
        var inputLength = transaction.getInput().length;
        var signatureLength = transaction.signatures.length;
        return inputLength >= signatureLength;
    }

    areSignaturesValid(transaction) {
        var md = forge.md.sha256.create();
        md.update(transaction.data, 'utf8');

        for (var index = 0; index < transaction.getInput().length; index++) {
            var singleInputItem = transaction.getInput()[index];
            let referencedOutputTransaction = this.getTransactionByHash(singleInputItem.transaction_hash);
            // senderPubKey == public key of sender which signed this transaction
            var senderPubKey = referencedOutputTransaction.getOutput()[singleInputItem.output_index].receiverId;

            var inputValidated = false;
            for (var index2 = 0; index2 < transaction.getSignatures().length; index2++) {
                var sig = transaction.signatures[index2];

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

    areTransactionInputsValid(transaction) {
        for (var index = 0; index < transaction.getInput().length; index++) {
            let item = transaction.getInput()[index];
            let referencedOutputTransaction = this.getTransactionByHash(item.transaction_hash);

            if (referencedInputTransaction === null) {
                console.error('Output referenced by Input is not in the chain!');
                return false;
            }

            if (!this.isTransactionOutputNotUsedYet(referencedOutputTransaction, item.output_index)) {
                console.error('Transaction Input and Output amount not equal.');
                return false;
            }
        }
    }

    isTransactionOutputNotUsedYet(transaction, outputIndex) {
        var transHash = transaction.getTransactionHash();
        var amount = 0;

        for (var index = this.chain.length - 1; index >= 0; index--) {
            var singleBlock = this.chain[index];

            for (var index2 = 0; index2 < singleBlock.transaction.length; index2++) {
                var singleTrans = singleBlock.transaction[index2];

                for (var index3 = 0; index3 < singleTrans.getInput().length; index3++) {
                    var singleInput = singleTrans.getInput();

                    if (singleInput.transaction_hash === transHash
                        && singleInput.output_index === outputIndex) {
                        amount++;
                    }
                }
            }
        }
        return amount < 1;
    }

    isCoinInputEqualsOutput(transaction) {
        var transOutputSum = 0; // sum of output coins of this transaction.
        var transInputSum = 0; // sum of input coins of this transaction.
        transaction.getOutput().forEach(function (item) {
            transOutputSum += item.getAmount();
        });
        for (var index = 0; index < transaction.getInput().length; index++) {
            let item = transaction.getInput()[index];
            let referencedInputTransaction = this.getTransactionByHash(item.transaction_hash);

            transInputSum += referencedInputTransaction.getOutput()[item.output_index].amount;
        }

        return transOutputSum === transInputSum;
    }

    isTransactionNotInChainYet(transaction) {
        return this.getTransactionByHash(transaction.getTransactionHash()) !== null;
    }

    areTransactionInputsUnique(transaction) {
        for (var index = 0; index < transaction.getInput().length; index++) {
            var currInput = transaction.getInput()[index];

            for (var index2 = 0; index2 < transaction.getInput().length; index2++) {
                if (index === index2) {
                    continue;
                }
                var input2 = transaction.getInput()[index2];

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
    getTransactionByHash(transactionHash) {
        for (var index = 0; index < this.chain.length; index++) {
            var singleBlock = this.chain[index];

            for (var index2 = 0; index2 < singleBlock.transaction.length; index2++) {
                var singleTrans = singleBlock.transaction[index2];

                if (singleTrans.getTransactionHash() === transactionHash) {
                    return singleTrans;
                }
            }
        }
        return null;
    }

}

module.exports = TransactionValidator;