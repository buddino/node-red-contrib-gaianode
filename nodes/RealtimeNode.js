module.exports = function (RED) {
    let auth = require('../lib/auth');
    let ws = require("sockjs-client");
    let Stomp = require("stompjs");

    function RealTime(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        this.path = config.path;
        this.attempts = 0;
        this.onMessage = onMessage;
        let node = this;
        auth.authenticate(node);
        this.on('close', function (done) {
            if (!node.stompClient) {
                done();
                return;
            }
            node.stompClient.disconnect(function () {
                node.status({fill: "red", shape: "dot", text: "Disconnected"});
                done();
            });
        });
    }

    function onMessage(node) {
        let flow = node.context().flow;
        let access_token = flow.get("token");
        let url = "https://ws.sparkworks.net/ws?access_token=" + access_token;
        let socket = new ws(url); //TODO
        node.stompClient = Stomp.over(socket);
        node.stompClient.connect({}, function (frame) {
            node.status({fill: "green", shape: "dot", text: "Connected"});
            node.stompClient.subscribe('/path/' + node.path , function (message) {
                    node.attempts = 0;
                    let parsed = JSON.parse(message.body);
                    node.send({payload: parsed});  //TODO
                    node.status({fill: "green", shape: "dot", text: "Message: " + new Date().toLocaleTimeString()});
                }
            );
        }, function (e) {
            //let s = e.toString().split('\n');
            console.log(e);
            if (e.toString().startsWith("Whoops!")) {
                //May be authentication problem
                node.status({fill: "yellow", shape: "dot", text: "Re-Authenticating"});
                if (node.attempts > 0) {
                    node.status({fill: "red", shape: "dot", text: "Authentication error"});
                    node.error("Could not authenticate");
                } else {
                    node.attempts = 1;
                    auth.authenticate(node);
                }
            }
            else {
                console.log(e);
                let s = e.toString().split('\\c');
                node.status({fill: "red", shape: "dot", text: s[1]});
                node.error(s[1]);
            }
        });
    }


    RED.nodes.registerType("RealTime", RealTime);
}