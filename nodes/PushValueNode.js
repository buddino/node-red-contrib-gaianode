module.exports = function (RED) {
    let auth = require('../lib/auth');
    let utils = require("../lib/utils");

    function PushValue(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        this.resource = config.resource;
        this.onMessage = onMessage;
        let node = this;
        this.on('input', function (msg) {
            this.msg = msg;
            this.uri = utils.parseSite(this);
            this.status({fill: "yellow", shape: "dot", text: "Requesting: " + this.uri});
            this.time = utils.parseMustache(this, config.time);
            onMessage(this);
        });

        this.on('close', function (done) {
            node.status({});
            done()
        });
    }

    function onMessage(node) {

        if (node.time === "" || node.time === " " || isNaN(parseInt(node.time))) {
            //node.log(node.time + " is not a valid time. Recovering with now.");
            node.time = new Date().getTime();
        }

        let value = parseFloat(node.msg.payload);
        if (isNaN(value)) {
            node.error(node.msg.payload + " is not a valid number.");
            return;
        }

        let query = {
            data: [
                {
                    resourceId: parseInt(node.uri),
                    time: node.time,
                    value: value
                }
            ]
        };
        let url = node.server.api + "ps/data";
        console.log("Node " + node.id + " requesting resource " + node.uri);
        let request = auth.getAuthenticatedHttp(node);
        request.post({url: url, json: true, body: query}, function (error, resp, body) {
            if(error){
                node.status({fill: "red", shape: "dot", text: "Connection error"});
                node.error(error);
                return;
            }
            if (resp.statusCode < 300) {
                node.status({fill: "green", shape: "dot", text: "Value (" + value + ") sent to " + node.uri});
            }
            else if (resp.statusCode === 404) {
                node.status({fill: "yellow", shape: "dot", text: "Resource " + node.uri + " not found"});
                node.error(resp.statusCode, node.msg);
            }
            else if (resp.statusCode === 401) {
                node.status({fill: "yellow", shape: "dot", text: "Authenticating"});
                auth.authenticate(node);
            }
            else {
                node.error(resp, node.msg);
            }
        });
    }

    RED.nodes.registerType("PushValue", PushValue);
}