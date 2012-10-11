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

		good_juju._exec = function(cmd, cfg, ncb)
		{
			ncb(null, JSON.stringify({machines: ["bootstrap"], services: {}}));
		}
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
	},
	testJujuStatus: function(test)
	{
		test.expect(4);
		good_juju.status(function(err, data)
		{
			test.strictEqual(err, null, 'Status executed successfully');
			test.strictEqual(data.bootstrapped, true, 'Wrapper header is correct');
			test.strictEqual(data.services, 0, 'Wrapper service count is correct');
			test.strictEqual(data.units, 1, 'Wrapper units count is correct');
			test.done();
		});
	}
}

exports.layout =
{
	setUp: function(cb)
	{
		// I need to stub the entire spawn function, streams and all
		// I'll do that later...
		bad_juju = new Juju('bad-env');
		cb();
	},
	tearDown: function(cb)
	{
		bad_juju = null;
		cb();
	},
	testJujuLayoutFails: function(test)
	{
		test.expect(2);
		bad_juju.layout(function(err, data)
		{
			test.notStrictEqual(err, null, 'Layout errored out');
			test.strictEqual(data, null, 'No data is returned');
			test.done();
		});
	}
}
