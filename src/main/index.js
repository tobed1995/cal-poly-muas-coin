const muas_node = require('../muas_node/muas_node');
const muas_unverfied_pool_node = require('../pools/transaction_pool');

const parallel = require('async/parallel');

const Transaction = require('../blockchain/transaction/transaction');
const Input = require('../blockchain/transaction/input');
const Output = require('../blockchain/transaction/output');

const path = require("path");
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const util = require('util')
const logger = require('../logger/logger')

app.use(require('express').static(path.join(__dirname, '..', 'visualization')));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'visualization', 'index.html'));
});
http.listen(8080, () => {
});


const create_muas_node = util.promisify(muas_node.createNode);

let nodes = [];

let transaction;


create_muas_node(io, null).then(function (n1) {
    nodes.push(n1);

    let pool = new muas_unverfied_pool_node.MUAS_Unverified_Pool_Node().start_pool_node(io, n1.chain[0]);
    let n2 = create_muas_node(io, n1.chain[0]);
    let n3 = create_muas_node(io, n1.chain[0]);
    let n4 = create_muas_node(io, n1.chain[0]);
    let n5 = create_muas_node(io, n1.chain[0]);


    Promise.all([pool, n2, n3, n4, n5]).then(function (nodes) {

        setInterval(function () {
            nodes[1].broadcast_get_random_transaction().then(function (transaction) {

            });
            nodes[2].broadcast_get_random_transaction().then(function (transaction) {

            });
            nodes[3].broadcast_get_random_transaction().then(function (transaction) {

            });
            nodes[4].broadcast_get_random_transaction().then(function (transaction) {

            });
            nodes[5].broadcast_get_random_transaction().then(function (transaction) {

            });

        }, 2000)

        setInterval(function () {
            logger.info('not stopped');
        }, 1000)


    }).catch(function (err) {

    });

}).catch(function (err) {
    logger.error(err);
});



