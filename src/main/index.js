const muas_node = require('../muas_node/muas_node');
const muas_unverfied_pool_node = require('../pools/unverified_transaction_pool');
const PeerInfo = require('peer-info');

const waterfall = require('async/waterfall');
const parallel = require('async/parallel');
const each = require('async/each');
const pull = require('pull-stream');

var path = require("path");

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
    (cb) => muas_node.createNode(io, cb),
    (cb) => muas_node.createNode(io, cb),
    (cb) => muas_node.createNode(io, cb)


], (err, nodes) => {
    if (err) {
        throw err;
    }

    let unverified_transaction_pool = new muas_unverfied_pool_node.MUAS_Unverified_Pool_Node(io);

    let node1 = nodes[0];
    /**
     setInterval(function() {
    nodes.forEach(function(node) {
      let transObj = {
        id: Math.floor(Math.random() * Math.floor(100)),
        value: 200
      };
      node.broadcast_add_unverified_transaction(transObj);
    });
    unverified_transaction_pool.print_pool();

  }, 2000);


     setInterval(function() {
    nodes.forEach(function(node) {
      node.broadcast_get_random_transaction();
    });
  }, 2000);
     */

    setInterval(function () {
        each(nodes, function (node) {
            let transObj = {
                id: Math.floor(Math.random() * Math.floor(100)),
                value: 200
            };
            node.broadcast_add_unverified_transaction(transObj),
                node.broadcast_get_random_transaction(),
                node.broadcast_delete_verified_transaction(transObj)
        }, function (err) {
            console.log("err");
        });
        unverified_transaction_pool.print_pool();

    }, 2000);


    //  node1.broadcast_add_unverified_transaction(JSON.stringify({"id" : Math.floor(Math.random()*Math.floor(200))}));


    /*

      setInterval(function(){
        let transaction = {"id":Math.floor(Math.random() * Math.floor(3000))};
        console.log("adding >> ", transaction );
        node1.broadcast_add_unverified_transaction(transaction);
      },2000)


    /*
      setInterval(function(){
        console.log('trying to fetch a random transaction');
        node1.broadcast('/get_random_transaction',null);
      },3000);

      //  let node2 = nodes[1];
      /*
      setInterval(function(){
        node1.broadcast('/echo/3.0.0', 'first broadcast from node 1');
      },2500);


      setInterval(function(){
        console.log(unverified_transaction_pool.get_random_transaction());
      },Math.floor(Math.random() * Math.floor(1000)));

      setInterval(function(){
        console.log(unverified_transaction_pool.add_transaction('new Transaction'));
      },Math.floor(Math.random() * Math.floor(3000)));
      */
});
