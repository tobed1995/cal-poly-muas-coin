const muas_node = require('../muas_node/muas_node');
const muas_unverfied_pool_node = require('../pools/transaction_pool');

const parallel = require('async/parallel');

const Transaction = require('../blockchain/transaction/transaction');
const Input = require('../blockchain/transaction/input');
const Output = require('../blockchain/transaction/output');
const Block = require('../blockchain/block')

const ProofOfWork = require('../blockchain/pow')

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

const run_normal_flaw = true;

if (run_normal_flaw) {

create_muas_node(io, null).then(function (n1) {
    nodes.push(n1);

    let pool = new muas_unverfied_pool_node.MUAS_Unverified_Pool_Node().start_pool_node(io, n1.chain[0]);

    let n2 = create_muas_node(io, n1.chain[0]);
    let n3 = create_muas_node(io, n1.chain[0]);
    let n4 = create_muas_node(io, n1.chain[0]);
    let n5 = create_muas_node(io, n1.chain[0]);

    let input = [];
    let output = [];

    let genTrans = n1.chain[0].transaction[0];

    input.push(new Input(genTrans.transactionHash, 0));
    output.push(new Output(null, 4));
    output.push(new Output(n1.pub_sign_key, 21));

    let transaction = new Transaction(input, output);
    transaction.sign(n1.priv_sign_key);
    transaction.createTransactionHash();

        Promise.all([pool, n2, n3, n4, n5]).then(function (nodes) {

            n1.broadcast_add_unverified_transaction(transaction).then(function (transaction) {
                setInterval(function () {
                    nodes[1].broadcast_get_random_transaction().then(function (transaction) {
                        nodes[1].verify_transaction(transaction, nodes[1].chain).then(function () {

                            let previous_block = nodes[1].chain[nodes[1].chain.length - 1].transactionHash;
                            let block_to_append = new Block(transaction, previous_block);
                            new ProofOfWork().proofOfWork(block_to_append);

                            nodes[1].broadcast_added_block_to_chain(block_to_append).then(function () {
                                nodes[1].broadcast_delete_unverified_transaction(transaction);
                            }).catch(function (err) {
                            });

                        }).catch(function (err) {
                            //TODO: delete transaction from network
                            nodes[1].broadcast_delete_unverified_transaction(transaction);
                            logger.error('deleting transaction %s because node %s failed validation. reason %s', transaction.transactionHash, nodes[1].id, err);
                        });
                    }).catch(function (err) {
                        logger.error(err);
                    });
                }, 2000)
            }).catch(function (err) {
                logger.error(err);
            });
            setInterval(function () {
            }, 2000);
        }).catch(function (err) {
            logger.error(err);
        });


}).catch(function (err) {
    logger.error(err);
});

} else {
    let block = null;
    setInterval(function () {
        create_muas_node(io, block).then(function (n) {
            block = n.chain[0];
        })
    }, 5000);

}


