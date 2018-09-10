// Creating a bundle that adds:
//   transport: websockets + tcp
//   stream-muxing: spdy & mplex
//   crypto-channel: secio
//   discovery: multicast-dns

const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const WS = require('libp2p-websockets')
const SPDY = require('libp2p-spdy')
const MPLEX = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const MulticastDNS = require('libp2p-mdns')
const DHT = require('libp2p-kad-dht')
const defaultsDeep = require('@nodeutils/defaults-deep')
const Protector = require('libp2p-pnet')

class MUASNode extends libp2p {
  constructor (_options) {
    const defaults = {
      // The libp2p modules for this libp2p bundle
      modules: {
        transport: [
          TCP,
          new WS()                    // It can take instances too!
        ],
        streamMuxer: [
          SPDY,
          MPLEX
        ],
        connEncryption: [
          SECIO
        ],
        // Encryption for private networks. Needs additional private key to work
        // connProtector: new Protector(/*protector specific opts*/),
        peerDiscovery: [
          MulticastDNS
        ],
        dht: DHT                      // DHT enables PeerRouting, ContentRouting and DHT itself components
      },

      // libp2p config options (typically found on a config.json)
      config: {                       // The config object is the part of the config that can go into a file, config.json.
        peerDiscovery: {
          mdns: {                     // mdns options
            interval: 1000,           // ms
            enabled: true
          },
          webrtcStar: {               // webrtc-star options
            interval: 1000,           // ms
            enabled: false
          }
          // .. other discovery module options.
        },
        relay: {                      // Circuit Relay options
          enabled: false,
          hop: {
            enabled: false,
            active: false
          }
        },
        dht: {
          kBucketSize: 20
        },
        // Enable/Disable Experimental features
        EXPERIMENTAL: {               // Experimental features ("behind a flag")
          pubsub: false,
          dht: false
        }
      }
    }

    // overload any defaults of your bundle using https://github.com/nodeutils/defaults-deep
    super(defaultsDeep(_options, defaults))
  }

}

module.exports = MUASNode;

// Now all the nodes you create, will have TCP, WebSockets, SPDY, MPLEX, SECIO and MulticastDNS support.
