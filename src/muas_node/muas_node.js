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

const TransactionValidator = require('../blockchain/transaction/transactionValidator');
const Transaction = require('../blockchain/transaction/transaction');
const ProofOfWork = require('../blockchain/pow');
const Block = require('../blockchain/block');
const logger = require('../logger/logger');

const forge = require('node-forge');

const pow = new ProofOfWork();

class MUASNode extends libp2p {
    constructor(_options) {
        const defaults = {
            modules: {
                transport: [TCP],
                streamMuxer: [Mplex],
                connEncryption: [SECIO],
                peerDiscovery: [MulticastDNS]
            },
            config: {
                peerDiscovery: {
                    mdns: {
                        interval: 1000,
                        enabled: true
                    }
                },
                EXPERIMENTAL: {
                    pubsub: true
                }
            }
        };
        super(defaultsDeep(_options, defaults));
        //define special node attributes.
        this.available_peers = new Map();
    }

    broadcast_add_unverified_transaction(transaction) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (transaction !== null && typeof transaction !== 'undefined') {
                self.available_peers.forEach(function (peer) {
                    self.dialProtocol(peer, '/add_unverified_transaction', function (err, conn) {
                        if (err) {
                            return
                        }
                        pull(
                            pull.values([JSON.stringify(transaction)]),
                            conn
                        )

                    });
                });
                resolve(transaction);
            }
            reject(transaction);
        });

    }

    broadcast_add_verified_transaction(transaction) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (transaction !== null && typeof transaction !== 'undefined') {
                self.available_peers.forEach(function (peer) {
                    self.dialProtocol(peer, '/add_verified_transaction', function (err, conn) {
                        if (err) {
                            return
                        }
                        pull(
                            pull.values([JSON.stringify(transaction)]),
                            conn
                        )
                    });
                });
                resolve(transaction);
            } else {
                reject();
            }

        });
    }

    broadcast_get_verified_transaction() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.available_peers.forEach((peer) => {
                self.dialProtocol(peer, '/get_verified_transaction', (err, conn) => {
                    if (err) {
                        return
                    }
                    pull(
                        conn,
                        pull.collect(function (err, transaction) {
                            if (transaction !== null, typeof transaction !== 'undefined' && transaction.length > 0) {
                                let transObj = JSON.parse(transaction.join(''));
                                //start calculating proof_of_work
                                let p_o_w = self.proof_of_work(transObj).then(function (transObj) {
                                    console.log('calculated proof of work -> success\n' + JSON.stringify(transObj));
                                    //add to chain
                                    self.broadcast_add_verified_transaction_to_chain(transObj);
                                });

                            }
                        })
                    )
                });
            });
        });
    }

    broadcast_added_block_to_chain(block) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.available_peers.forEach((peer) => {
                self.dialProtocol(peer, '/broadcast_added_block_to_chain', (err, conn) => {
                    if (err) {
                        return
                    }
                    pull(
                        pull.values([JSON.stringify(block)]),
                        conn
                    )
                });
            });
            resolve(block);
        });
    }


    broadcast_get_random_transaction() {
        let self = this;
        return new Promise(function (resolve) {
            self.available_peers.forEach((peer) => {
                self.dialProtocol(peer, '/get_random_transaction', (err, conn) => {
                    if (err) {
                        return
                    }
                    pull(
                        conn,
                        pull.collect(function (err, transaction) {
                            if (transaction !== null && typeof transaction !== 'undefined' && transaction.length > 0 && JSON.parse(transaction.join('')) !== null) {
                                let transObj = JSON.parse(transaction.join(''));
                                resolve(transObj);
                                //start working on transaction verification --> stub it by now.

                            } else {
                                //not generated yet --> add handling here ?!?
                            }
                        })
                    )
                });
            });
        });
    }

    broadcast_delete_unverified_transaction(transaction) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (transaction !== null && typeof transaction !== 'undefined') {
                self.available_peers.forEach(function (peer) {
                    self.dialProtocol(peer, '/delete_unverified_transaction', function (err, conn) {
                        if (err) {
                            return
                        }
                        pull(
                            pull.values([JSON.stringify(transaction)]),
                            conn
                        )
                    });
                });
                resolve(transaction);
            }
            reject(transaction);
        });
    }

    broadcast_delete_verified_transaction(transaction) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (transaction !== null && typeof transaction !== 'undefined') {
                self.available_peers.forEach(function (peer) {
                    self.dialProtocol(peer, '/delete_verified_transaction', function (err, conn) {
                        if (err) {
                            return
                        }
                        pull(
                            pull.values([JSON.stringify(transaction)]),
                            conn
                        )
                    });
                });
                resolve(transaction);
            }
            reject(transaction);

        });

    }


    verify_transaction(transaction, chain) {
        let validator = new TransactionValidator();
        let self = this;
        return new Promise(function (resolve, reject) {
            transaction = Object.setPrototypeOf(transaction, Transaction.prototype);
            let opCode = validator.verifyTransaction(transaction, chain);
            logger.info('node id %s validating transactionHash %s', self.id, transaction.transactionHash);
            if (opCode === 0) {
                logger.info('node id %s validated transactionHash %s successfully', self.id, transaction.transactionHash);
                resolve();
            } else {
                logger.info('node id %s failed to validata transactionHash %s', self.id, transaction.transactionHash);
                reject(opCode);
            }
        });
    }
}


let createNode = function (io, genesisBlock, callback) {
    let node;
    PeerId.create({
        bits: 1024
    }, (err, id) => {
        if (err) {
            throw err
        }

        waterfall([
            (cb) => PeerInfo.create(id, cb),
            (peerInfo, cb) => {
                peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0');
                node = new MUASNode({
                    peerInfo
                });
                let rsa = forge.pki.rsa;
                let keypair = rsa.generateKeyPair({bits: 512, e: 0x10001});
                node.priv_sign_key = keypair.privateKey;
                node.pub_sign_key = keypair.publicKey;


                node.id = peerInfo.id.toB58String();
                node.chain = [];
                node.idSetVerified = new Set();

                if (genesisBlock === null || typeof genesisBlock === 'undefined') {
                    logger.info("node id %s generated genesis",node.id);
                    let genesisBlock1 = Block.getGenesisBlock(node.priv_sign_key, node.pub_sign_key);
                    let pow = new ProofOfWork();

                    do {
                        pow.proofOfWork(genesisBlock1);
                    } while (!pow.validatePow(genesisBlock1));

                    node.chain.push(genesisBlock1);
                } else {
                    node.chain.push(genesisBlock);
                }

                node.on('peer:discovery', (peer) => {
                    io.emit('nodeDiscovered', {
                        id: peer.id.toB58String(),
                        idDiscovered: node.id
                    });
                    // Note how we need to dial, even if just to warm up the Connection (by not
                    // picking any protocol) in order to get a full Connection. The Peer Discovery
                    // doesn't make any decisions for you.
                    if (!node.available_peers.has(peer.id.toB58String())) {
                        node.available_peers.set(peer.id.toB58String(), peer);
                    }
                });


                node.handle('/broadcast_added_block_to_chain', function(protocol,conn){
                    let new_block = null;
                    pull(
                        conn,
                        pull.collect(function(err,block){
                            new_block = JSON.parse(block.toString());
                            logger.info('node %s received call to add block %s to its chain', node.id,new_block.blockHash.substring(0,10));
                            if(new_block !== null && typeof new_block !== 'undefined' && pow.validatePow(new_block) && !node.idSetVerified.has(new_block.transaction[0].transactionHash)){
                                logger.info('node %s added validated block %s', node.id,new_block.blockHash.substring(0,10));
                                node.chain.push(new_block);
                                node.idSetVerified.add(new_block.transaction[0].transactionHash);
                            }else{
                                logger.warn('node %s failed to validate block %s', node.id, new_block.blockHash.substring(0,10));
                            }
                        })
                    )


                });

                node.start(cb);
                logger.info('node with id %s started', node.id);
            }
        ], (err) => callback(err, node))
    });
};

module.exports = {
    createNode,
    MUASNode
};
