module.exports = function (RED) {
    let auth = require('../lib/auth');
    let utils = require("../lib/utils");

    function ListResources(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        this.resource = config.site;
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
        let url = node.server.api + "location/site/" + node.uri + "/resource";
        console.log("Node " + node.id + " requesting resource " + node.uri);
        let request = auth.getAuthenticatedHttp(node);
        request.get(url, function (error, resp, body) {
            if(error){
                node.status({fill: "red", shape: "dot", text: "Connection error"});
                node.error(error);
                return;
            }
            if (resp.statusCode === 200) {
                node.status({fill: "green", shape: "dot", text: "success at " + new Date().toLocaleTimeString()});
                let payload = {...node.msg.payload, ...JSON.parse(body)};
                node.send({payload: payload, options: toOptions(payload.resources)});
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

    function toOptions(obj){
        let result = [];
        for(let i = 0; i < obj.length; i++){
            let dict = {};
            dict[obj[i].uri] = obj[i].resourceId;
            result.push(dict);
        }
        return result;
    }


    RED.nodes.registerType("ListResources", ListResources);
}