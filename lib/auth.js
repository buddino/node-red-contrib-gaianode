module.exports = {
    getAuthenticatedHttp: function(node){
        let request = require("request");
        let flow = node.context().flow;
        let token = flow.get("token");
/*        if(!token){
            this.authenticate(node);
        }*/
        let authenticatedRequest = request.defaults({
            headers: {
                "authorization": "Bearer " + token,
                "accept": "application/json"
            }
        });
        return authenticatedRequest;
    },
    authenticate : function(node){
        let request = require("request");
        //Check nodes set in context, if not, create
        let flow = node.context().flow;
        let nodes = flow.get("nodes");
        if(!nodes){
            //Create nodes set
            nodes = new Set();
            flow.set("nodes", nodes);
        }
        //Check
        if(flow.get("authenticating")){
            console.log(node.id +" waiting for authentication");
            nodes.add(node);
        }
        else {
            //Authentication
            nodes.add(node);
            flow.set("authenticating", true);
            let auth_request = node.server.auth;
            request.post({url: node.server.token_url, form: auth_request}, function (error, response, body) {
                if (error || response.statusCode !== 200) {
                    console.error("Error: " + body);
                    console.error("Request: " + auth_request);
                    node.status({fill: "red", shape: "dot", text: "Authentication error"});
                    node.error(response, body);
                }
                else {
                    let response = JSON.parse(body);
                    flow.set("token", response['access_token']);
                    console.log("Authenticated: " + response['access_token']);

                    //Callbacks
                    nodes.forEach(n => n.onMessage(node));
                    flow.set("nodes", new Set());
                    flow.set("authenticating", false)
                }
            });
        }

    }
};