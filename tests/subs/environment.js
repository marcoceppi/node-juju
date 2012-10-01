var Juju = require('../../index.js', true);

exports.setUp = function(cb)
{
	// Create a dummy environment
	juju = new Juju('stupid');
	cb();
}

exports.tearDown = function(cb)
{
	juju = null;
	cb();
}

exports.testJujuExists = function(test)
{
	test.ok(true, "Juju exists, we can continue");
	test.done();
}

exports.testJujuBootstrapFails = function(test)
{
	test.expect(1);
	bad_juju = new Juju('bad-env');
	bad_juju.bootstrap(function(err)
	{
		test.notEqual(err, null, 'Make sure we actually get an error');
		test.done();
	});
	
}

exports.testJujuBootstrap = function(test)
{
	test.expect(1);
	juju.bootstrap(function(err)
	{
		test.strictEqual(err, null, 'successful bootstrap');
		test.done();
	});
}

