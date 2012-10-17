# Node Juju
Ubuntu Juju interface for node.js

## Install 

Make sure you have the latest Juju installed. At this time Juju is only available
for Linux and Mac OSX. Install from npm or clone from [github](https://github.com/marcoceppi/node-juju.git)

    npm install juju

## Test

It's recommended that before you use node-juju you perform tests to insure
compatibility between releases of Juju have not broken.

    npm test

This will provide unit and functional tests.

## Usage

node-juju incorporates all commands from the Juju CLI with the exception of

 - debug-log
 - debug-hooks
 - open-tunnel
 - scp
 - ssh

These subcommands all require some interaction which isn't appropriate for this project.

Node-juju also providers the following extra commands:

 - watch
 - layout

Which are documented below under _extras_

### Example

```js
var Juju = require('juju');

// process.env.HOME + "/.juju/environments.yaml" needs to exist with valid
// Juju environments outlined in it.

hpcloud = new Juju('hp-cloud');

hpcloud.bootstrap(function(err) {
  console.log(this.environment + " bootstrapped!");
});

hpcloud.deploySync('mysql');

hpcloud.deploy('wordpress', {n: 2}, function(err) {
  this.add_relation('wordpress', 'mysql');
  this.expose('wordpress');
});
```

# API

## Juju(environment, format='json', env={})

Creates a new Juju object for the provided `environment`. Optional parameters include:

* REQUIRED STRING `environment` - The environment name in HOME/.juju/environments.yaml
* OPTIONAL STRING `format` - [json, yaml, png, svg, dot] the default being json
* OPTIONAL OBJECT `env` - Environment over-rides, the most common being HOME, see [process.env](http://nodejs.org/api/process.html#process_process_env) and [environ(7)](http://manpages.ubuntu.com/manpages/precise/man7/environ.7.html)

Example:

```js
var Juju = require('juju');

my_juju = new Juju('my-juju-environment', 'json', {"HOME": "/tmp/juju"});
```

## juju.add_relation()



## juju.add_unit()

Add additional n units

* REQUIRED

## juju.bootstrap(opts, cb)

Bootstrap the selected environment.

* OPTIONAL OBJECT `opts` - This is a key: pair of additional command line arguments for Juju.
* OPTIONAL FUNCTION `cb` - `Callback(error)`

Example:

```js
my_juju.bootstrap(function(err) {
	if(err) {
		console.log('Oh no!', err);
	} else {
		console.log('Bootstrapped!');
	}
});
```

## juju.deploy()

Deploy a new charm to the environment

* REQUIRED STRING `charm` - Name of the charm
* OPTIONAL STRING `service_name` - Name of the service to be deployed
* OPTIONAL OBJECT `opts` - Extra command-line options for Juju
* OPTOINAL FUNCTION `cb` - `Callback(error)`

Examples:

```js
my.juju.deploy('wordpress', 'my-blog', {'constraints': 'instance-type=f1.fake'}, function(err) {
	if(err) {
		console.log('Deploy failed', err);
	}
});

my_juju.deploy('mysql', function(err) {
	if(err) {
		console.log('NO MYSQL FOR YOU', err);
	}
});
```

## juju.destroy(cb), juju.destroy_environment(cb)

Destory the environment.

* REQUIRED FUNCTION `cb` - `Callback(error)`

Example:

```js
my_juju.destroy(function(err) {
	if(err) {
		console.log("This didn't work!", err);
	} else {
		console.log('The environment was destroyed');
	}
});
```

## juju.get(service, opts, cb)

Get the configuration options for a deployed service

* REQUIRED STRING `service` - Name of the deployed service
* OPTIONAL OBJECT `opts` - Extra command-line options for Juju
* REQUIRED FUNCTION `cb` - `Callback(error, results)`

Example:

```js
my_juju.get('wordpress', function(err, data) {
	if(err) {
		console.log('Oh dear!', err);
	} else {
		console.log(data); // Data will be in the `format` from `new Juju()`
	}
});
```

## juju.expose(service, cb)

Expose a service

* REQUIRED STRING `service` - Name of the deployed service
* OPTIONAL FUNCTION `cb` - `Callback(error)`

Example:

```js
my_juju.expose('wordpress', function(err) {
	if(err) {
		console.log('Dun dun dunnn', err);
	}
});
```

## juju.layout()



## juju.remove_relation()



## juju.remove_unit()



## juju.resolve(), juju.resolved()



## juju.status(opts, cb)

The status of the Juju environment

* OPTIONAL OBJECT `opts` - Extra command-line options for Juju
* REQUIRED FUNCTION `cb` - `Callback(error, results)`

Results are returned in a wrapper, in future versions this may become an 
option to preserve the raw results. The wrapper look like this:

```js
{
	services: INT,
	units: INT,
	bootstrapped: BOOL,
	data: JSON STRING
}
```

Example:

```js
my_juju.status(function(err, data) {
	if(err) {
		console.log('Yikes!', err);
	} else {
		if(data.bootstrapped) {
			console.log('We are strapped');
			console.log(JSON.parse(data.data));
		} else {
			console.log('Not bootstrapped yet...');
		}
	}
});
```

## juju.terminate_machine()



## juju.unexpose()


# Contributions

Please make contributions in the form of the pull requests in the form of a rebased single commit per feature/bug.
