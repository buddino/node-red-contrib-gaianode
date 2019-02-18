module.exports = function (RED) {
    function GaiaServerNode(n) {
        RED.nodes.createNode(this, n);
        this.auth = {};
        this.api = n.api;
        this.auth.username = n.username;
        this.auth.password = n.password;
        this.auth.scope = "read";
        this.auth.grant_type = "password";
        this.auth.client_id = "spark";
        this.auth.client_secret = "spark";
        this.token_url = "https://sso.sparkworks.net/aa/oauth/token";
    }

    RED.nodes.registerType("gaia-server", GaiaServerNode);
};