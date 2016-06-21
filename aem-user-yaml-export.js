#!/usr/bin/env node

var commandLineArgs = require('command-line-args');
var request = require('request');
var log4js = require('log4js');
var log = log4js.getLogger();
var fs = require('fs');
var uuid = require('uuid');
var YAML = require('yamljs');

var ignorePrincipalsDefaultList = ['admin', 'anonymous', 'author'];

var commandLineArgsOptions = [
	{name: 'hostname', alias: 'h', type: String, defaultValue: 'localhost'},
	{name: 'port', type: Number, defaultValue: 4502},
	{name: 'username', alias: 'u', type: String, defaultValue: 'admin'},
	{name: 'password', alias: 'p', type: String, defaultValue: 'admin'},
	{name: 'filename', alias: 'f', type: String, defaultValue: 'users.yaml'},
	{name: 'ignoreUsers', alias: 'i', type: String, multiple:true, defaultValue: ignorePrincipalsDefaultList},
	{name: 'ignoreUnprivileged', type: Boolean, defaultValue: false}
];

var cli = commandLineArgs(commandLineArgsOptions);
var options = cli.parse();

console.log(cli.getUsage());

var connectionString = 'http://' + options.hostname + ':' + options.port + '/bin/security/authorizables.json?_charset_=utf-8&hideGroups=true';

var connectionOptions = {
	url: connectionString, auth: {
		'user': options.username, 'pass': options.password, 'sendImmediately': true
	}, json: true
};

log.debug('Request user list from AEM: ' + connectionOptions.url);
request(connectionOptions, function(error, response, users) {
	if (error)
	{
		log.error('Error while receiving user list from AEM: ' + error.toString())
	}
	else
	{
		var outputObject = {};
		outputObject.user_config = [];

		var wstream = fs.createWriteStream(options.filename);
		var userList = users.authorizables;
		log.debug("Will process " + userList.length + " users.");
		userList.forEach(function(user, index) {
			//Skip user in case it is on the ignore list
			if (options.ignoreUsers.indexOf(user.principal) != -1)
			{
				return;
			}

			var progress = Math.round((index + 1) / userList.length * 100);

			var userMembership = [];
			user.memberOf.forEach(function(membership) {
				if(membership.id != "everyone")
				{
					userMembership.push(membership.id);
				}
			});

			if(!options.ignoreUnprivileged || userMembership.length > 0)
			{
				log.debug(progress + "%: Add user '" + user.principal + "'");

				var userOutput = {};
				var userOutputDetails = {};
				userOutput[user.principal] = [userOutputDetails];
				outputObject.user_config.push(userOutput);

				var userPath = '/home/users/' + user.principal.substring(0,1);
				userOutputDetails['path'] = userPath;

				userOutputDetails['password'] = uuid.v4();

				var userName = "";
				if (user.givenName)
				{
					userName += user.givenName + " ";
				}
				if (user.familyName)
				{
					userName += user.familyName;
				}

				if (userName.length > 0)
				{
					userOutputDetails['name'] = userName;
				}
				if(userMembership.length > 0)
				{
					userOutputDetails['isMemberOf'] = userMembership.join(',');
				}
			}

		});
		wstream.write('  - ' + YAML.stringify(outputObject));
		wstream.end();
	}
});
