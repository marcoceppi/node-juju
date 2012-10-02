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
-`

# API

## Juju(environment, format='json', env={})

Creates a new Juju object for the provided `environment`. Optional parameters include:

* REQUIRED STRING `environment` - The environment name in HOME/.juju/environments.yaml
* OPTIONAL STRING `format` - [json, yaml, png, svg, dot] the default being json
* OPTIONAL OBJECT `env` - Environment over-rides, the most common being HOME, see [process.env](http://nodejs.org/api/process.html#process_process_env) and [environ(7)](http://manpages.ubuntu.com/manpages/precise/man7/environ.7.html)

Example:

```js
var Juju = require('juju');

my_juju = new Juju('my-juju-environment', 'yaml', {"HOME": "/tmp/juju"});
```
-`

## juju.add_relation()


## juju.add_unit()


## juju.bootstrap(opts, cb)

Bootstrap the selected environment.

* OPTIONAL OBJECT `opts` - This is a key: pair of additional command line arguments for Juju.
* OPTIONAL FUNCTION `cb` - Callback

Example:

```js
my_juju.bootstrap(function(err) { if(err) { console.log('Oh no!', err); } else { console.log('Bootstrapped!'); } });
```
-`

## juju.destroy(), juju.destroy_environment()


## juju.get()

