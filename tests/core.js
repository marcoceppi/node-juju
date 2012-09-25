var fs  = require('fs'),
	Juju = require('../index');

exports.testJujuExists = function(test)
{
	test.ok(fs.lstatSync('/usr/bin/juju').isFile(), "Juju exists and is installed");
	test.done();
}

exports.subcommand =
{
	setUp: function(cb)
	{
		juju = new Juju(null);
		cb();
	},
	tearDown: function(cb)
	{
		cb();
	},
	bootstrap: function(test)
	{
		test.ok('bootstrap' in juju, 'bootstrap member exists');
		test.done();
	},
	status: function(test)
	{
		test.expect(2);
		test.ok('status' in juju, 'status member exists');
		test.ok('layout' in juju, 'layout member exists');
		test.done();
	},
	destroy: function(test)
	{
		test.expect(2);
		test.ok('destroy_environment' in juju, 'destroy-environment member exists');
		test.ok('destroy_service' in juju, 'destroy-service member exists');
		test.done();
	},
	units: function(test)
	{
		test.expect(2);
		test.ok('add_unit' in juju, 'add-unit member exists');
		test.ok('remove_unit' in juju, 'remove-unit member exists');
		test.done();
	},
	expose: function(test)
	{
		test.expect(2);
		test.ok('expose' in juju, 'expose member exists');
		test.ok('unexpose' in juju, 'unexpose member exists');
		test.done();
	},
	relation: function(test)
	{
		test.expect(2);
		test.ok('add_relation' in juju, 'add-relation member exists');
		test.ok('remove_relation' in juju, 'remove-relation member exists');
		test.done();
	},
	terminate_machine: function(test)
	{
		test.ok('terminate_machine' in juju, 'terminate-machine member exists');
		test.done();
	}
}
