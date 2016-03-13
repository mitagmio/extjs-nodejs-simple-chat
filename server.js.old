var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var http = require('http');
var url = require('url');
var sys = require('sys');

var clients = [];//{name:'root',response:response}

http.createServer(function (request, response) {
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
}).listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + port )
});
