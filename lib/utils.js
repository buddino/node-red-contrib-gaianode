module.exports = {
    parseSite: function(node){
        let mustache = require("mustache");
        if (!isNaN(parseInt(node.resource))) {
            console.log("From config: " + node.resource);
            return node.resource;
        }
        //Try to render
        let res = mustache.render(node.resource, {msg: node.msg});
        if (!isNaN(parseInt(res))) {
            console.log("From msg: " + node.resource);
            return res;
        }
        node.status({fill: "red", shape: "dot", text: "Resource parse error"});
        node.error("Could not parse resource id: " + res, node.msg);
    },
    parseMustache: function(node, template){
        let mustache = require("mustache");
        let regex = "\{\{[a-zA-Z.]*\}\}";
        if(template.match(regex)){
            return mustache.render(template, {msg: node.msg});
        }
        return template;
    }
};