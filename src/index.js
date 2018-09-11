'use strict'

const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const PeerInfo = require('peer-info')
const MulticastDNS = require('libp2p-mdns')
const defaultsDeep = require('@nodeutils/defaults-deep')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const series = require('async/series')
const pull = require('pull-stream')

const forge = require('node-forge');
const UnverifiedTransactionPool = require('./unverifiedTransactionPool')
const Blockchain = require('./blockchain')
const Transaction = require('./transaction')
const Input = require('./input')
const Output = require('./output')
const Block = require('./block')

const MUASNode = require('./muasNode')

let chain = new Blockchain();

// Global Keypair of node
var keyPair = null;


var input = [];
input.push(new Input('0xblub', 2));

var output = [];
output.push(new Output('234', 4));
var trans = new Transaction(input, output);

var rsa = forge.pki.rsa;
console.log("Start");

// Blocking
keyPair = rsa.generateKeyPair({bits: 1024, e: 0x10001});

  // Sign Transaction
  trans.sign(keyPair.privateKey);
  console.log("Transaction");
  console.log(trans)

  console.log("Jetzt verify");
  // Verify Sign
  var md = forge.md.sha256.create();
  md.update(trans.data, 'utf8');
  var verified = keyPair.publicKey.verify(md.digest().bytes(), trans.getSignatures()[0]);
  console.log("verified? ");
  console.log(verified);

  // Hash complete Transaction after it is completed
  console.log("hash Transaction");
  trans.createTransactionHash();
  console.log(trans);


//How to Verify a Transaction:

  // Compare Hash of Transaction with own creation
  var md = forge.md.sha256.create();
  console.log(trans.getTransactionHash() === md.update(trans.data + trans.signatures).digest().toHex());





/** TODO: Improve coding, now it will broadcast but the main functionalities are still missing!!!! */
parallel([
  /** Create ten nodes in the queue */
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),
  (cb) => MUASNode.createNode(cb),

], (err, nodes) => {
  if (err) {
    throw err;
  }

  /**
   * Declare six nodes and let them interact
   */
  let node1 = nodes[0];
  node1.id = "Node1";
  let node2 = nodes[1];
  node2.id = "Node2"; // id is changed for testing purposes (Can be removed afterwards)
  let node3 = nodes[2];
  node3.id = "Node3";
  let node4 = nodes[3];
  node4.id = "Node4";
  let node5 = nodes[4];
  node5.id = "Node5";
  let node6 = nodes[5];
  node6.id = "Node6";
  let node7 = nodes[6];
  node7.id = "Node7";
  let node8 = nodes[7];
  node8.id = "Node8";
  let node9 = nodes[8];
  node9.id = "Node9";
  let node10 = nodes[9];
  node10.id = "Node10";


  let counter = 0;


  /** NEED TO BE REMOVED - BEGIN */

  /**
   * Loop through all of the nodes
   */
  nodes.forEach(node => {
    /**
     * A node cannot dial itself
     *
     * An own protocol has been inventend for the purposes of "muas-coin
     */

    if (node !== node1) {
      /**
       * First the nodes will subscribe to the "network"
       *
       * After that the node that wants to send something to the
       * network will dial the protocol and connects to the nodes
       */
      node1.dialProtocol(node.peerInfo, '/muas', (err, conn) => {
        if (err) { throw err }
        /*console.log(pull)*/
        pull(pull.values(['my own protocol, wow!']), conn)

        /** TEST FOR COMMUNICATING IN NETWORK - BEGIN */
        node.testMethod("Test from" + node1.id);
        console.log(node2.testMethodReturn());
        /** TEST FOR COMMUNICATING IN NETWORK - END */
      })

      node.handle('/muas', (protocol, conn) => {
        pull(
          conn,
          console.log("The current node is: " + node.id),
          pull.map((v) => v.toString()),
          pull.log()
        )
      })
    }
  });

  /** NEED TO BE REMOVED - END */

  /*
  nodes.forEach(node => {
      if(node1 !== node) { */
        /** An own protocol has been inventend for the purposes of "muas-coin" */
        /*node1.dialProtocol(node.peerInfo, '/echo/1.0.0', (err, conn) => {
            if (err) {
              throw err
            }

            console.log('nodeA dialed to nodeB on protocol: /echo/1.0.0');
            console.log("Node: " + node.id);
            counter++;

            pull(
              pull.values(['hey']),
              conn,
              pull.collect((err, data) => {
                if (err) {
                  throw err
                }
                console.log('received echo:', data.toString())
              })
            )
          })
        }
    }) */

});

/** END OF IMPROVEMENT */
