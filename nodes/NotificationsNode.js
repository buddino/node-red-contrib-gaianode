module.exports = function (RED) {
    let ws = require("sockjs-client");
    let Stomp = require("stompjs");

    function Notifications(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        this.resource = config.resource;
        //this.onMessage = onMessage;
        let node = this;
        let socket = new ws("https://recommendations.gaia-project.eu/gs-guide-notification/");
        let stompClient = Stomp.over(socket);
        stompClient.connect({}, function () {
            let endpointurl = "/recommendations/" + config.resource;
            node.status({fill: "green", shape: "dot", text: "Connected"});
            stompClient.subscribe(endpointurl, function (message) {
                    let notification = JSON.parse(message.body);
                    node.send({payload: notification.suggestion, notification: notification});
                    node.status({fill: "green", shape: "dot", text: "Message: " + new Date().toTimeString()});
                }
            );
        }, function () {
            node.status({fill: "red", shape: "dot", text: "Connection error"});
        });

        stompClient.disconnect(function () {
            node.status({fill: "red", shape: "dot", text: "Disconnected"});
        });

        this.on('close', function(done) {
            stompClient.disconnect(function(){
                done();
                node.status({fill: "red", shape: "dot", text: "Disconnected"});
            });
        });
    }

    RED.nodes.registerType("Notifications", Notifications);
};