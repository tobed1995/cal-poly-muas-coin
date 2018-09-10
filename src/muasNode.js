'use strict'

const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const PeerInfo = require('peer-info')
const MulticastDNS = require('libp2p-mdns')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const defaultsDeep = require('@nodeutils/defaults-deep')
const pull = require('pull-stream')

/** MUASNode class for defining a simple node from the libp2p library
 *  
 *  Has been modified from the original one because of the implemenation of "muas-coin"
 * 
 */
class MUASNode extends libp2p {
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
            interval: 1000,
            enabled: true
          }
        }
      }
    }

    super(defaultsDeep(_options, defaults))
  }
}

var createNode = function(callback) {
  let node;

  waterfall([
    (cb) => PeerInfo.create(cb),
    (peerInfo, cb) => {
      peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
      node = new MUASNode({
        peerInfo
      });
      node['availablePeers'] = [];
      node.handle('/echo/1.0.0', (protocol, conn) => pull(conn, conn))
      node.on('peer:discovery', (peer) => {
        // Note how we need to dial, even if just to warm up the Connection (by not
        // picking any protocol) in order to get a full Connection. The Peer Discovery
        // doesn't make any decisions for you.
        if(!node.availablePeers.includes(peer.id.toB58String())){
          node.availablePeers.push(peer.id.toB58String());
        }
      });
      node.start(cb);
    }
  ], (err) => callback(err, node))

}

module.exports= {createNode};