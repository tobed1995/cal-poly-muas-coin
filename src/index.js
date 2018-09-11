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


const UnverifiedTransactionPool = require('./unverifiedTransactionPool')
const Blockchain = require('./blockchain')
const Transaction = require('./transaction')
const Input = require('./input')
const Output = require('./output')
const TransactionType = require('./transaction-type')
const Block = require('./block')

const MUASNode = require('./muasNode')

let chain = new Blockchain();

// create genesis block
let genout = new Output('0000000000000000000000000000000000000000000000000000000000000000', 25);
let gentrans = new Transaction(null, genout, null, TransactionType.TRANSFER);
let genblock = new Block(gentrans, null);
genblock.setNonce(123456789);
genblock.setBlockHash(genblock.calculateHash());
chain.chain.push(genblock);

// Test verification of transactions in chain.
let input1 = new Input(gentrans.transactionHash, 0);
let output11 = new Output('46565582949553546526595695326592326596', 10);
let output12 = new Output('0000000000000000000000000000000000000000000000000000000000000000', 15);
let trans1 = new Transaction(input1, [output11, output12], null, TransactionType.TRANSFER);
let result = chain.verifyTransaction(trans1);

if (result) {
  console.log('Transaction valid');
  var newBlock = new Block(trans1, chain.latestBlock());
  chain.addBlock(newBlock);
} else {
  console.log('Transaction invalid');
}
// -----------------------------------------------------
result = chain.verifyTransaction(trans1);
if (result) {
  console.log('Transaction valid');
  var newBlock2 = new Block(trans1, chain.latestBlock());
  chain.addBlock(newBlock2);
} else {
  console.log('Transaction invalid');
}
// --------------------------------------------------------
let input2 = new Input(trans1.transactionHash, 0);
let output21 = new Output('0000000000000000000000000000000000000000000000000000000000000000', 10);
let trans2 = new Transaction(input2, output21, null, TransactionType.TRANSFER);
let result3 = chain.verifyTransaction(trans2);

if (result3) {
  console.log('Transaction valid');
  var newBlock2 = new Block(trans2, chain.latestBlock());
  chain.addBlock(newBlock2);
} else {
  console.log('Transaction invalid');
}


/** TODO: Improve coding, now it will broadcast but the main functionalities are still missing!!!! */
parallel([
  /** Create six nodes in the queue */
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
  let node2 = nodes[1];
  node2.id = "Node2"; // id is changed for testing purposes (Can be removed afterwards)
  let node3 = nodes[2];
  node3.id = "Node3";
  let node4 = nodes[3];
  node4.id = "Node3";
  let node5 = nodes[4];
  node5.id = "Node4";
  let node6 = nodes[5];
  node6.id = "Node5";


  let counter = 0;

  nodes.forEach(node => {
      if(node1 !== node) {
        /** An own protocol has been inventend for the purposes of "muas-coin" */
        node1.dialProtocol(node.peerInfo, '/echo/1.0.0', (err, conn) => {
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
    })

});

/** END OF IMPROVEMENT */
