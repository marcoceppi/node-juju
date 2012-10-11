var Juju = require('../../index.js', true);

exports.testJujuExists = function(test)
{
	test.ok(true, "Juju exists, we can continue");
	test.done();
}

exports.expose =
{
	setUp: function(cb)
	{
		// Create dummy environments
		basic_juju = new Juju('stupid');

		basic_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju expose wordpress' )
			{
				return ncb(null, {});
			}

			return ncb(new Error('Command failed'));
		}

		cb();
	},
	tearDown: function(cb)
	{
		basic_juju = null;
		cb();
	},
	testJujuExpose: function(test)
	{
		basic_juju.expose('wordpress', function(err)
		{
			test.strictEqual(err, null, 'Exposed a service');
			test.done();
		});
	},
	testJujuExposeFail: function(test)
	{
		basic_juju.expose(function(err)
		{
			test.notStrictEqual(err, null, 'Failed to expose');
			test.done();
		});
	}
}

exports.unexpose =
{
	setUp: function(cb)
	{
		// Create dummy environments
		basic_juju = new Juju('stupid');

		basic_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju unexpose wordpress' )
			{
				return ncb(null, {});
			}

			return ncb(new Error('Command failed'));
		}

		cb();
	},
	tearDown: function(cb)
	{
		basic_juju = null;
		cb();
	},
	testJujuExpose: function(test)
	{
		basic_juju.unexpose('wordpress', function(err)
		{
			test.strictEqual(err, null, 'Unexposed a service');
			test.done();
		});
	},
	testJujuExposeFail: function(test)
	{
		basic_juju.unexpose(function(err)
		{
			test.notStrictEqual(err, null, 'Failed to unexpose');
			test.done();
		});
	}
}
