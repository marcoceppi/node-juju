var fs  = require('fs'),
	Juju = require('../index');

exports.testJujuExists = function(test)
{
	test.ok(fs.lstatSync('/usr/bin/juju').isFile(), "Juju exists and is installed");
	test.done();
}

exports.actions =
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
	environment: function(test)
	{
		test.expect(3);
		test.ok('bootstrap' in juju, 'bootstrap command exists');
		test.ok('destroy_environment' in juju, 'destroy-environment command exists');
		test.ok('destroy' in juju, 'destroy command exists');
		test.done();
	},
	status: function(test)
	{
		test.expect(2);
		test.ok('status' in juju, 'status command exists');
		test.ok('layout' in juju, 'layout command exists');
		test.done();
	},
	service: function(test)
	{
		test.expect(2);
		test.ok('deploy' in juju, 'deploy command exists');
		test.ok('destroy_service' in juju, 'destroy-service command exists');
		test.done();
	},
	unit: function(test)
	{
		test.expect(4);
		test.ok('add_unit' in juju, 'add-unit command exists');
		test.ok('remove_unit' in juju, 'remove-unit command exists');
		test.ok('resolved' in juju, 'resolved command exists');
		test.ok('resolve' in juju, 'resolve command exists');
		test.done();
	},
	expose: function(test)
	{
		test.expect(2);
		test.ok('expose' in juju, 'expose command exists');
		test.ok('unexpose' in juju, 'unexpose command exists');
		test.done();
	},
	relation: function(test)
	{
		test.expect(2);
		test.ok('add_relation' in juju, 'add-relation command exists');
		test.ok('remove_relation' in juju, 'remove-relation command exists');
		test.done();
	},
	terminate_machine: function(test)
	{
		test.ok('terminate_machine' in juju, 'terminate-machine command exists');
		test.done();
	}
}
