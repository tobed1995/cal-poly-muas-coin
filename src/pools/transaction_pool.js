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

const logger = require('../logger/logger')


class MUAS_Unverified_Pool_Node {

    constructor(io,genesisBlock) {
        let self = this;

        muas_node.createNode(io, function (err, node) {

            self.node = node;
            self.chain = [];
            self.pool = [];
            self.verified_pool = [];
            self.idSet = new Set();
            self.idSetVerified = new Set();

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

            self.node.handle('/add_verified_transaction_to_chain', function(protocol,conn){
               pull(
                   conn,
                   pull.collect(function(err, transaction){
                     if(err){
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

        },genesisBlock);
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

    print_chain(){
        if(this.chain !== null && typeof this.chain !== 'undefined'){
            console.log(this.chain);
        }
    }

    add_unverified_transaction(transaction) {

        transaction = JSON.parse(transaction.join(''));
        if (this.pool !== null && typeof this.pool !== "undefined" && !this.idSet.has(transaction.transactionHash)) {
            this.pool.push(transaction);
            this.idSet.add(transaction.transactionHash);
            logger.info('added {' + transaction.transactionHash + '} to unverified_pool');

        }
    }

    add_verified_transaction_to_chain(transaction){
        transaction = JSON.parse(transaction.toString());
        if(this.chain !== null && typeof this.chain !== 'undefined'){
            //check validity of chain --> resolve branches && broadcast if added to my own chain.
            //if
            this.chain.push(transaction);
            logger.info('node id %s added transaction: %s to chain', this.node.id,transaction.transactionHash);


        }
    }

    add_verified_transaction(transaction) {
        transaction = JSON.parse(transaction.toString());
        if (this.verified_pool !== null && typeof this.verified_pool !== "undefined" && !this.idSetVerified.has(transaction.transactionHash)) {
            this.verified_pool.push(transaction);
            this.idSetVerified.add(transaction.transactionHash);
            logger.info('node id %s added transaction: %s to verified_pool', this.node.id,transaction.transactionHash);
        }
    }

    delete_unverified_transaction(transaction) {
        transaction = JSON.parse(transaction);
        if (this.pool !== null && typeof this.pool !== 'undefined' && this.pool.length > 0) {
            for (let i = 0; i < this.pool.length; i++) {
                if (this.pool[i].transactionHash === transaction.transactionHash) {
                    this.pool.splice(i, 1);
                    logger.info('node id %s deleted transaction: %s from unverified_pool', this.node.id,transaction.transactionHash);
                }
            }
        }else{
            logger.warn('transaction: %s in node ids %s unverified_pool is already deleted or not found',transaction.transactionHash,this.node.id);

        }
    }

    delete_verified_transaction(transaction) {
        transaction = JSON.parse(transaction.join(''));
        if (this.verified_pool !== null && typeof this.verified_pool !== 'undefined' && this.verified_pool.length > 0) {
            for (let i = 0; i < this.verified_pool.length; i++) {
                if (this.verified_pool[i].transactionHash === transaction.transactionHash) {
                    this.verified_pool.splice(i, 1);
                    logger.info('node id %s deleted transaction: %s from verified_pool', this.node.id,transaction.transactionHash);
                }
            }
        }else{
            logger.warn('transaction: %s in node ids %s verified_pool is already deleted or not found',transaction.transactionHash,this.node.id);
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
