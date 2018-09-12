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


class MUAS_Unverified_Pool_Node {
    constructor(io) {
        var self = this;

        muas_node.createNode(io, function (err, node) {

            self.node = node;
            self.pool = [];
            self.verified_pool = [];
            self.idSet = new Set();

            self.node.handle('/add_unverified_transaction', function (protocol, conn) {
                pull(
                    conn,
                    pull.collect(function (err, transaction) {
                        self.add_unverified_transaction(transaction);
                    })
                )
            });

            self.node.handle('/add_verified_transaction', function (protocol, conn) {
                pull(
                    conn,
                    pull.collect(function (err, transaction) {
                        self.add_unverified_transaction(transaction);
                    })
                )
            });

            self.node.handle('/delete_unverified_transaction', (protocol, conn) => {
                pull(
                    conn,
                    pull.collect(function (err, transaction) {
                        console.log('deleting  ' + transaction);
                        self.delete_unverified_transaction(transaction);
                    })
                )
            });

            self.node.handle('/delete_verified_transaction', (protocol, conn) => {
                pull(
                    conn,
                    pull.collect(function (err, transaction) {
                        console.log('deleting  ' + transaction);
                        self.delete_unverified_transaction(transaction);
                    })
                )
            });

            self.node.handle('/get_random_transaction', (protocol, conn) => {
                pull(
                    pull.values(self.get_random_transaction()),
                    conn
                )
            });

            self.node.handle('/get_verified_transaction', (protocol, conn) => {
                pull(
                    pull.values(self.get_random_transaction()),
                    conn
                )
            });

        });
    }

    print_pool() {
        if (this.pool != null && typeof this.pool != "undefined") {
            console.log(this.pool);
        }
    }

    add_unverified_transaction(transaction) {
        let transactionObj = JSON.parse(transaction.join(''));
        if (this.pool != null && typeof this.pool != "undefined" && !this.idSet.has(JSON.parse(transaction.join('')).id)) {
            this.pool.push(transaction.join(''));
            this.idSet.add(transactionObj.id);
        }
    }

    add_verified_transaction(transaction) {
        let transactionObj = JSON.parse(transaction.join(''));
        if (this.verified_pool != null && typeof this.verified_pool != "undefined" && !this.idSet.has(JSON.parse(transaction.join('')).id)) {
            this.verified_pool.push(transaction.join(''));
            this.idSet.add(transactionObj.id);
        }
    }

    delete_unverified_transaction(transaction_to_delete) {
        let transactionObj = JSON.parse(transaction_to_delete.join(''));
        if (this.pool != null && typeof this.pool != "undefinded" && this.pool.length > 0) {
            for (var i = 0; i < this.pool.length; i++) {
                if (this.pool[i].id === transaction_to_delete.id) ;
                {
                    this.pool.splice(i, 1);
                    console.log('deleted id: ' + transaction_to_delete.id);
                }
            }
        }
    }

    delete_verified_transaction(transaction_to_delete) {
        let transactionObj = JSON.parse(transaction_to_delete.join(''));
        if (this.verified_pool != null && typeof this.verified_pool != "undefinded" && this.verified_pool.length > 0) {
            for (var i = 0; i < this.verified_pool.length; i++) {
                if (this.verified_pool[i].id === transaction_to_delete.id) {
                    this.verified_pool.splice(i, 1);
                }
            }
        }
    }

    get_random_transaction() {
        if (this.pool != null && typeof this.pool != "undefined" && this.pool.length > 0) {
            let index = Math.floor(Math.random() * this.pool.length);
            let transaction = this.pool[index];
            return transaction;
        }
        return null;
    }


    get_verified_transaction() {
        if (this.verified_pool != null && typeof this.verified_pool != "undefined" && this.verified_pool.length > 0) {
            let transaction = this.verified_pool[0];
            return transaction;
        }
        return null;
    }
}

module.exports = {
    MUAS_Unverified_Pool_Node
};
