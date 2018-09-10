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

let chain = new Blockchain();

class MyBundle extends libp2p {
  constructor (_options) {
    const defaults = {
      modules: {
        transport: [ TCP ],
        streamMuxer: [ Mplex ],
        connEncryption: [ SECIO ],
        peerDiscovery: [ MulticastDNS ]
      },
      config: {
        peerDiscovery: {
          mdns: {
            interval: 2000,
            enabled: true
          }
        },
        EXPERIMENTAL: {
          pubsub: true
        }
      }
    }

    super(defaultsDeep(_options, defaults))
  }
}

function createNode (callback) {
  let node

  waterfall([
    (cb) => PeerInfo.create(cb),
    (peerInfo, cb) => {
      peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
      node = new MyBundle({
        peerInfo
      })
      node.start(cb)
    }
  ], (err) => callback(err, node))
}

parallel([
  (cb) => createNode(cb),
  (cb) => createNode(cb)
], (err, nodes) => {
  if (err) { throw err }

  const node1 = nodes[0]
  const node2 = nodes[1]

  const pool = new UnverifiedTransactionPool();
  var input = [];
  input.push(new Input('123', 0));
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
  pool.pushTransaction(new Transaction(input, output, null));

  console.log(JSON.stringify(pool.getPool(), null, 4));
  // TODO: Broadcast the new Transaction!

  series([
    (cb) => node1.once('peer:discovery', (peer) => node1.dial(peer, cb)),
    (cb) => setTimeout(cb, 500)
  ], (err) => {
    if (err) { throw err }

    // Subscribe to the topic 'news'
    node1.pubsub.subscribe('news',
      (msg) => console.log(msg.from, msg.data.toString()),
      () => {
        setInterval(() => {
          // Publish the message on topic 'news'
          node2.pubsub.publish(
            'news',
            Buffer.from('Bird bird bird, bird is the word!'),
            () => {}
          )
        }, 1000)
      }
    )
  })
})
