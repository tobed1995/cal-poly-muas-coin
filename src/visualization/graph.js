const Graph = require('p2p-graph');
var socket = require('socket.io-client')();

var graph = new Graph('.root');

var nodeMap = new Set();
var connectionSet = new Set();

socket.on('nodeDiscovered', (payload) => {

    if (!connectionSet.has(payload.id + payload.idDiscovered) && !connectionSet.has(payload.idDiscovered + payload.id)) {

        connectionSet.add(payload.id + payload.idDiscovered);
        connectionSet.add(payload.idDiscovered + payload.id);

        connNeeded = false;
        if (!nodeMap.has(payload.id)) {
            graph.add({
                id: payload.id,
                name: payload.id
            });
            //graph.seed(payload.id, true);
            connNeeded = true;
            nodeMap.add(payload.id);
        }
        if (!nodeMap.has(payload.idDiscovered)) {
            graph.add({
                id: payload.idDiscovered,
                name: payload.idDiscovered
            });
            //graph.seed(payload.idDiscovered, true);
            connNeeded = true;
            nodeMap.add(payload.idDiscovered);
        }
        graph.connect(payload.id, payload.idDiscovered);
    }

});
