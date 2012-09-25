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

## Juju(environment, format='json')

## juju.add_relation()


## juju.add_unit()


## juju.bootstrap()


## juju.destroy(), juju.destroy_environment()


## juju.get()

