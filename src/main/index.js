const muas_node = require('../muas_node/muas_node');
const muas_unverfied_pool_node = require('../pools/transaction_pool');
const PeerInfo = require('peer-info');

const waterfall = require('async/waterfall');
const parallel = require('async/parallel');
const each = require('async/each');
const pull = require('pull-stream');

const Blockchain = require('../blockchain/blockchain');
const Transaction = require('../blockchain/transaction/transaction');
const Input = require('../blockchain/transaction/input');
const Output = require('../blockchain/transaction/output');
const TransactionValidator = require('../blockchain/transaction/transactionValidator')
const forge = require('node-forge');
const Block = require('../blockchain/block');

const path = require("path");
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const winston = require('winston')

// Declare static folder to be served. It contains the js, images, css, etc.
app.use(require('express').static(path.join(__dirname, '..', 'visualization')));
// Declare default route which points to the p2p visualization
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'visualization', 'index.html'));
});
// Start server on port 8080
http.listen(8080, () => {
});

parallel([
    (cb) => muas_node.createNode(io, cb)

], (err, nodes) => {
    if (err) {
        throw err;
    }

    let transaction_pool = new muas_unverfied_pool_node.MUAS_Unverified_Pool_Node(io);
    let node1 = nodes[0];


    setInterval(function () {
        let transaction = {
            "transactionHash": "hash256 " + Math.floor(Math.random() * Math.floor(100)),
            "amount": Math.floor(Math.random() * Math.floor(1000))
        }
        node1.broadcast_add_verified_transaction_to_chain(transaction).then(function(transaction){
        });

        node1.broadcast_add_verified_transaction(transaction).then(function(transaction){
        });


    }, 2000);


});


function createValidTransaction() {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve({
                "transactionHash": "hash256 " + Math.floor(Math.random() * Math.floor(100)),
                "amount": Math.floor(Math.random() * Math.floor(1000))
            });
        }, Math.floor(Math.random() * Math.floor(2500)));
    });
}


