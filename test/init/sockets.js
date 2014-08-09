var socketClient = require("socket.io-client"),
    _ = require("underscore");

describe("init/sockets", function () {
    this.timeout(5000);

    it("loads sockets module based on apper.json", function (done) {
        var app = require("../app-maker")();
        
        app.start(function () {
            var serverAddress = app.server.address(),
                socketURL = "http://localhost:" + serverAddress.port;
            
            socketClient.connect(socketURL).on("lol", done);
        });
    });
    
    it("works independently across subapp namespaces", function (done) {
        var app = require("../app-maker")();

        app.start(function () {
            var serverAddress = app.server.address(),
                socketURL = "http://localhost:" + serverAddress.port,
                socketOpts = { "force new connection" : true };
            
            var rootClient = socketClient.connect(socketURL, socketOpts);
            var subappClient = socketClient.connect(socketURL + "/subapp", socketOpts);
            
            var partDone = _.after(2, done),
                throwError = function () {
                    done(new Error("Didn't work"));
                };
            
            var partConnected = _.after(2, emitStuff);
            
            function emitStuff() {
                app.expressApp.sockets.emit("hi");
                app.subapps.subapp.expressApp.sockets.emit("hello");
            }
            
            rootClient.on("connect", partConnected);
            subappClient.on("connect", partConnected);
            
            rootClient.on("hi", partDone);
            subappClient.on("hello", partDone);
            
            rootClient.on("hello", throwError);
            subappClient.on("hi", throwError);
        });
    });
});

