module.exports = function (RED) {
    let auth = require('../lib/auth');
    let utils = require("../lib/utils");

    function Summary(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        this.resource = config.resource;
        this.onMessage = onMessage;
        let node = this;
        this.on('input', function (msg) {
            this.msg = msg;
            this.uri = utils.parseSite(this);
            this.status({fill: "yellow", shape: "dot", text: "Requesting: " + this.uri});
            onMessage(this);
        });

        this.on('close', function (done) {
            node.status({});
            done();
        });
    }

    function onMessage(node) {
        let url = node.server.api + "resource/" + node.uri + "/summary";
        console.log("Node " + node.id + " requesting resource " + node.uri);
        let request = auth.getAuthenticatedHttp(node);
        request.get(url, function (error, resp, body) {
            if(error){
                node.status({fill: "red", shape: "dot", text: "Connection error"});
                node.error(error);
                return;
            }
            if (resp.statusCode === 200) {
                let payload = {...node.msg.payload, ...JSON.parse(body)};
                node.status({fill: "green", shape: "dot", text: "success at " + new Date().toLocaleTimeString()});
                node.send({payload: payload, topic: node.uri});
            }
            else if (resp.statusCode === 404) {
                node.status({fill: "yellow", shape: "dot", text: "Resource " + node.uri + " not found"});
                node.error(resp.statusCode, node.msg);
            }
            else if (resp.statusCode === 401) {
                auth.authenticate(node);
            }
            else {
                console.error(body);
                node.error(resp, node.msg);
            }
        });
    }

    RED.nodes.registerType("Summary", Summary);
}