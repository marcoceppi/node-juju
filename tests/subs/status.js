var Juju = require('../../index.js', true),
	fs = require('fs');

exports.testJujuExists = function(test)
{
	test.ok(true, "Juju exists, we can continue");
	test.done();
}

exports.status = 
{
	setUp: function(cb)
	{
		// Create a dummy environment
		good_juju = new Juju('stupid');
		bad_juju = new Juju('bad-env');
		cb();
	},
	tearDown: function(cb)
	{
		good_juju, bad_juju = null;
		cb();
	},
	testJujuStatusFails: function(test)
	{
		test.expect(2);
		bad_juju.status(function(err, data)
		{
			test.notStrictEqual(err, null, 'Status errored out');
			test.strictEqual(data.bootstrapped, false, 'Wrapper header is correct');
			test.done();
		});
	}
}
