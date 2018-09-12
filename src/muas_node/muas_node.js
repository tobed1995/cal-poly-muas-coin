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
        var self = this;
        this.available_peers.forEach(function (peer) {
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
    }

    broadcast_add_verified_transaction(transaction) {
        var self = this;
        this.available_peers.forEach(function (peer) {
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
    }


    broadcast_get_random_transaction() {
        var self = this;
        this.available_peers.forEach((peer) => {
            this.dialProtocol(peer, '/get_random_transaction', (err, conn) => {
                if (err) {
                    return
                }
                pull(
                    conn,
                    pull.collect(function (err, transaction) {
                        if (transaction !== null && typeof transaction !== 'undefined' && transaction.length > 0) {
                            let transObj = JSON.parse(transaction.join(''));
                            //start working on transaction verification --> stub it by now.
                            if (self.verify_transaction(transObj)) {
                                //broadcast message to the verified pool
                                self.broadcast_add_verified_transaction(transObj);
                            } else {

                            }
                            self.broadcast_delete_unverified_transaction(transObj);
                        } else {
                            //not generated yet --> add handling here ?!?
                        }
                    })
                )
            });
        });
    }

    broadcast_delete_unverified_transaction(transaction) {
        var self = this;
        this.available_peers.forEach(function (peer) {
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
    }

    broadcast_delete_verified_transaction(transaction) {
        var self = this;
        this.available_peers.forEach(function (peer) {
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
    }


    verify_transaction(transaction) {
        return true;
    }

    proof_of_work(transaction) {
        return true;
    }
}


var createNode = function (io, callback) {
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
                node.id = peerInfo.id.toB58String();
                //define protocols here

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
                node.start(cb);
            }
        ], (err) => callback(err, node))
    });
};

module.exports = {
    createNode,
    MUASNode
};