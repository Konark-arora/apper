var fs = require("fs");

var fsUtils = require("../fs-utils");

module.exports = function () {
    // load the routes last,
    // because they should only be matched if nothing else did.
    // hence it's possible to have catch-all routes.
    if (this.routesModulePath && fsUtils.loadModule(this, this.routesModulePath)) {
        this.log("Loaded routes.");
    }

    // expose server logs
    this.expressApp.get("/_logs", function (req, res) {
        res.json(this.appLog());
    }.bind(this));
    
    // if a static content directory exists for current app, expose it
    if (this.hasStaticContent) {
        this.expressApp.use("/", this.expressApp.express.static(this.staticContentPath));
        this.log("Exposed " + this.staticContentPath);
    }
};
