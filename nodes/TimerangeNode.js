module.exports = function (RED) {
    let auth = require('../lib/auth');
    let utils = require("../lib/utils");

    function Timerange(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        this.resource = config.resource;
        this.onMessage = onMessage;
        let node = this;
        this.on('input', function (msg) {
            this.msg = msg;
            this.uri = utils.parseSite(this);
            this.status({fill: "yellow", shape: "dot", text: "Requesting: " + this.uri});
            //TODO Simplify expressions
            if (msg.from)
                this.from = new Date(msg.from).getTime();
            else
                this.from = new Date(config.from).getTime();

            if (msg.to)
                this.to = new Date(msg.to).getTime();
            else
                this.to = new Date(config.to).getTime();

            if (msg.granularity)
                this.granularity = msg.granularity;
            else
                this.granularity = config.granularity;

            onMessage(this);
        });

        this.on('close', function (done) {
            node.status({});
            done();
        });
    }

    function onMessage(node) {
        let query = {
            queries: [
                {
                    from: node.from,
                    granularity: node.granularity,
                    resourceID: parseInt(node.uri),
                    to: node.to
                }
            ]
        };
        let url = node.server.api + "resource/query/timerange";
        console.log("Node " + node.id + " requesting resource " + node.uri);
        let request = auth.getAuthenticatedHttp(node);
        request.post({url: url, json: true, body: query}, function (error, resp, body) {
            if(error){
                node.status({fill: "red", shape: "dot", text: "Connection error"});
                node.error(error);
                return;
            }
            if (resp.statusCode === 200) {
                node.status({fill: "green", shape: "dot", text: "success at " + new Date().toLocaleTimeString()});
                let results = body.results;
                let output = {};
                for (let key in results) {
                    if (results.hasOwnProperty(key)) {
                        output[JSON.parse(key).resourceID] = results[key];
                    }
                }
                let payload = {...node.msg.payload, ...output};
                node.send({payload: payload});
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

    RED.nodes.registerType("Timerange", Timerange);
}