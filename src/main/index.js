const muas_node = require('../muas_node/muas_node');
const muas_unverfied_pool_node = require('../pools/transaction_pool');
const PeerInfo = require('peer-info');

const waterfall = require('async/waterfall');
const parallel = require('async/parallel');
const each = require('async/each');
const pull = require('pull-stream');

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

const logger = require('../logger/logger')

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
    (cb) => muas_node.createNode(io, cb, null)

], (err, nodes) => {
    if (err) {
        throw err;
    }
    let node1 = nodes[0];
    let transaction_pool = new muas_unverfied_pool_node.MUAS_Unverified_Pool_Node(io, node1.chain[0]);

    parallel([
        (cb) => muas_node.createNode(io, cb, node1.chain[0]),
        (cb) => muas_node.createNode(io, cb, node1.chain[0]),
        (cb) => muas_node.createNode(io, cb, node1.chain[0]),
        (cb) => muas_node.createNode(io, cb, node1.chain[0])
    ], (err, nodes) => {

        let input = [];
        let output = [];
//
        input.push(new Input('0xblub', 4));
        output.push(new Output('234', 4));

        let transaction = new Transaction(input, output);
        transaction.sign(node1.priv_sign_key);
        transaction.createTransactionHash();


        setInterval(function () {

            node1.broadcast_add_unverified_transaction(transaction);

            node1.broadcast_get_random_transaction().then(function (transaction) {
                logger.info('fetched trans');
                node1.verify_transaction(transaction, node1.chain).then(function () {
                    logger.info('validated transaction');
                }).catch(function (opCode) {
                    logger.info('failed validation with opCode %s', opCode);
                    //verification failed ... aborting
                    if (opCode === -1) {

                    }
                    if (opCode === -2) {

                    }
                    if (opCode === -3) {

                    }
                    if (opCode === -4) {

                    }
                    if (opCode === -5) {

                    }
                    if (opCode === -6) {

                    }
                    if (opCode === -7) {

                    }
                });
            });

        }, 2000);
    });


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


