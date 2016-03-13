#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var clients = [];


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
        
        self.routes['/chating'] = function (request, response) {
        	var endConnection = function(answer){
        		response.end(answer);
        	}
        	
        	var parsed = url.parse(request.url,true);
        	var callback = parsed.query.callback;
        	if(!callback){
        		var answer = callback+"({status:'failure',text:\"Wasn't get name callback function for cross-domain.\"})";
        		endConnection(answer);
        	}
        	var action = parsed.query.action;
        			
        	switch(action){
        		case 'login':
        			var login = parsed.query.login;
        			var callback = parsed.query.callback;
        			clients.forEach(function (v) {
        				if(login==v.name){
        					answer = callback+"({status:'failure',text:\"This name is busy. Check another one.\"})";
        					endConnection(answer);
        				}
        			});
        			
        			clients.push({name:login,callback:callback});
        			//console.log(clients);
        			
        			answer = callback+"({status:'success',text:'true'})";
        			endConnection(answer);
        			
        			break;
        		case 'getMessage':
        			var login = parsed.query.login;
        			var callback = parsed.query.callback;
        			clients.forEach(function (v) {
        				console.log(login==v.name);
        				console.log(login+"=="+v.name);
        				if(login==v.name){
        					v.response=response;
        					v.callback=callback;
        				}
        			});
        			setTimeout(function(){
        				answer = callback+"({status:'success',reconnect:true,text:\"Hi.\"})";
        				endConnection(answer);
        			},25000);
        			break;
        		case 'sendMessage':
        			var msg = parsed.query.msg;
        			var login = parsed.query.login;
        			clients.forEach(function (v) {
        				console.log(v.callback);
        				console.log(v.name);
        				console.log(v.response);
        				v.response.end(v.callback+"({status:'success',login:'"+login+"',text:'"+msg+"'})");
        			});
        			endConnection(callback+"({status:'success'})");
        			break;
        		default:			
        			var answer = callback+"({'status':'failure','text':'This action is not defined'})";
        			response.end(answer);
        	}
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    //self.start = function() {
        //  Start the app on the specific interface (and port).
    //   self.app.listen(self.port, self.ipaddress, function() {
    //        console.log('%s: Node server started on %s:%d ...',
    //                    Date(Date.now() ), self.ipaddress, self.port);
    //    });
    //};

//};   /*  Sample Application.  */

    /**
     *  Start the server (starts up the chat application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            //console.log('%s: Node server started on %s:%d ...',
            //            Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Chat Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
