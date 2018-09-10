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


const UnverifiedTransactionPool = require('./unverifiedTransactionPool')
const Blockchain = require('./blockchain')
const Transaction = require('./transaction')
const Input = require('./input')
const Output = require('./output')
const TransactionType = require('./transaction-type')

const MUASNode = require('./muasNode')

<<<<<<< Updated upstream
let chain = new Blockchain();
=======
  const node1 = nodes[0]
  const node2 = nodes[1]

  const pool = new UnverifiedTransactionPool();

  var input = [];
  //
  input.push(new Input('0xblub', 2));


  var output = [];
  output.push(new Output('234', 4));
  pool.pushTransaction(new Transaction(input, output, null, TransactionType.TRANSFER));
  pool.pushTransaction(new Transaction(input, output, null));
  pool.pushTransaction(new Transaction(input, output, null));
  console.log(JSON.stringify(pool.getPool(), null, 4));
  pool.getRandomTransaction();
  input.push(new Input('234', 5));
  output.push(new Output('234', 4));
  output.push(new Output('234', 4));
  output.push(new Output('234', 4));
  var trans = new Transaction(input, output, null);
  chain.verifyTransaction(trans);
  pool.pushTransaction(trans);

  console.log(JSON.stringify(pool.getPool(), null, 4));
  // TODO: Broadcast the new Transaction!

  series([
    (cb) => node1.once('peer:discovery', (peer) => node1.dial(peer, cb)),
    (cb) => setTimeout(cb, 500)
  ], (err) => {
    if (err) { throw err }
>>>>>>> Stashed changes

const pool = new UnverifiedTransactionPool();

var input = [];
//
input.push(new Input('0xblub', 2));

var output = [];
output.push(new Output('234', 4));
pool.pushTransaction(new Transaction(input, output, null));
pool.pushTransaction(new Transaction(input, output, null));
pool.pushTransaction(new Transaction(input, output, null));
console.log(JSON.stringify(pool.getPool(), null, 4));
pool.getRandomTransaction();
input.push(new Input('234', 5));
output.push(new Output('234', 4));
output.push(new Output('234', 4));
output.push(new Output('234', 4));
var trans = new Transaction(input, output, null);
chain.verifyTransaction(trans);
pool.pushTransaction(trans);

console.log(JSON.stringify(pool.getPool(), null, 4));
// TODO: Broadcast the new Transaction!
