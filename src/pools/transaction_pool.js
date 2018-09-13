'use strict';

const libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const Mplex = require('libp2p-mplex');
const SECIO = require('libp2p-secio');
const PeerInfo = require('peer-info');
const MulticastDNS = require('libp2p-mdns');
const waterfall = require('async/waterfall');
const parallel = require('async/parallel');
const defaultsDeep = require('@nodeutils/defaults-deep');
const pull = require('pull-stream');
const PeerId = require('peer-id');
const muas_node = require('../muas_node/muas_node');
const ProofOfWork = require('../blockchain/pow')
const logger = require('../logger/logger')


class MUAS_Unverified_Pool_Node {

    constructor() {
        this.node = null;
        this.chain = [];
        this.pool = [];
        this.verified_pool = [];
        this.idSet = new Set();
        this.idSetVerified = new Set();
    }

    start_pool_node(io, genesisBlock) {
        let self = this;
        return new Promise(function (resolve, reject) {
            muas_node.createNode(io, genesisBlock, function (err, node) {
                if(err){reject(err)}
                self.node = node;
                self.node.handle('/add_unverified_transaction', function (protocol, conn) {
                    pull(
                        conn,
                        pull.collect(function (err, transaction) {
                            if (err) {
                                throw err
                            }
                            self.add_unverified_transaction(transaction);
                        })
                    )
                });

                self.node.handle('/add_verified_transaction_to_chain', function (protocol, conn) {
                    pull(
                        conn,
                        pull.collect(function (err, transaction) {
                            if (err) {
                                throw err;
                            }
                            self.add_verified_transaction_to_chain(transaction);
                        })
                    )
                });

                self.node.handle('/add_verified_transaction', function (protocol, conn) {
                    pull(
                        conn,
                        pull.collect(function (err, transaction) {
                            if (err) {
                                throw err
                            }
                            self.add_verified_transaction(transaction);
                        })
                    )
                });

                self.node.handle('/delete_unverified_transaction', (protocol, conn) => {
                    pull(
                        conn,
                        pull.collect(function (err, transaction) {
                            self.delete_unverified_transaction(transaction);
                        })
                    )
                });

                self.node.handle('/delete_verified_transaction', (protocol, conn) => {
                    pull(
                        conn,
                        pull.collect(function (err, transaction) {
                            self.delete_unverified_transaction(transaction);
                        })
                    )
                });

                self.node.handle('/get_random_transaction', (protocol, conn) => {
                    pull(
                        pull.values(JSON.stringify(self.get_random_transaction())),
                        conn
                    )
                });

                self.node.handle('/get_verified_transaction', (protocol, conn) => {
                    pull(
                        pull.values(JSON.stringify(self.get_random_transaction())),
                        conn
                    )
                });
                resolve(node);
            });
        });

    }

    print_pool() {
        if (this.pool !== null && typeof this.pool !== "undefined") {
            console.log(this.pool);
        }
    }

    print_verified_pool() {
        if (this.verified_pool !== null && typeof this.verified_pool !== 'undefined') {
            console.log(this.verified_pool);
        }
    }

    print_chain() {
        if (this.chain !== null && typeof this.chain !== 'undefined') {
            console.log(this.chain);
        }
    }

    add_unverified_transaction(transaction) {

        transaction = JSON.parse(transaction.join(''));
        if (this.pool !== null && typeof this.pool !== "undefined" && !this.idSet.has(transaction.transactionHash)) {
            this.pool.push(transaction);
            this.idSet.add(transaction.transactionHash);
            logger.info('added transactionHash %s to unverified_pool',transaction.transactionHash);
        }else{
            logger.warn('transactionHash %s already in unverified pool or pool not initialized', transaction.transactionHash);
        }

    }



    // TODO need to be implemented w/o stub!!!!
    add_verified_transaction_to_chain(block) {

        block = JSON.parse(block.toString());
        if (this.chain !== null && typeof this.chain !== 'undefined' && !this.idSetVerified.has(block.transaction[0].transactionHash)) {
            //check validity of chain --> resolve branches && broadcast if added to my own chain.
            //TODO: add check if block is valid. if yes add to own block --> else not.
            let pow = new ProofOfWork();
            if(pow.validatePow(block)){
                logger.info('block %s is valid. adding to chain', block.blockHash);
                this.chain.push(block);
                this.idSetVerified.add(block.transaction[0].transactionHash);
                this.delete_unverified_transaction(JSON.stringify(block.transaction[0]));
            }else{
                logger.warn('block %s is not valid. not adding to chain', block.blockHash);
            }



            logger.info('node id %s added block: %s to chain', this.node.id, block.transaction[0].transactionHash);
        }else{
            logger.info('node id %s refused to add block %s to chain', this.node.id, block.transaction[0].transactionHash);
        }
    }

    add_verified_transaction(transaction) {
        transaction = JSON.parse(transaction.toString());
        if (this.verified_pool !== null && typeof this.verified_pool !== "undefined" && !this.idSetVerified.has(transaction.transactionHash)) {
            this.verified_pool.push(transaction);
            this.idSetVerified.add(transaction.transactionHash);
            logger.info('node id %s added transaction: %s to verified_pool', this.node.id, transaction.transactionHash);
        }
    }

    delete_unverified_transaction(transaction) {
        transaction = JSON.parse(transaction);
        if (this.pool !== null && typeof this.pool !== 'undefined' && this.pool.length > 0) {
            for (let i = 0; i < this.pool.length; i++) {
                if (this.pool[i].transactionHash === transaction.transactionHash) {
                    this.pool.splice(i, 1);
                    logger.info('node id %s deleted transaction: %s from unverified_pool', this.node.id, transaction.transactionHash);
                }
            }
        } else {
            logger.warn('transaction: %s in node ids %s unverified_pool is already deleted or not found', transaction.transactionHash, this.node.id);

        }
    }

    delete_verified_transaction(transaction) {
        transaction = JSON.parse(transaction.join(''));
        if (this.verified_pool !== null && typeof this.verified_pool !== 'undefined' && this.verified_pool.length > 0) {
            for (let i = 0; i < this.verified_pool.length; i++) {
                if (this.verified_pool[i].transactionHash === transaction.transactionHash) {
                    this.verified_pool.splice(i, 1);
                    logger.info('node id %s deleted transaction: %s from verified_pool', this.node.id, transaction.transactionHash);
                }
            }
        } else {
            logger.warn('transaction: %s in node ids %s verified_pool is already deleted or not found', transaction.transactionHash, this.node.id);
        }
    }

    get_random_transaction() {
        if (this.pool !== null && typeof this.pool !== 'undefined' && this.pool.length > 0) {
            let index = Math.floor(Math.random() * this.pool.length);
            let transaction = this.pool[index];
            return transaction;
        }
        logger.warn('node ids %s unverified_pool is either null, undefined or length == 0', this.node.id);
        return null;
    }


    get_verified_transaction() {
        if (this.verified_pool !== null && typeof this.verified_pool !== 'undefined' && this.verified_pool.length > 0) {
            return this.verified_pool[0];
        }
        logger.warn('node ids %s unverified_pool is either null, undefined or length == 0', this.node.id);
        return null;
    }
}

module.exports = {
    MUAS_Unverified_Pool_Node
};
