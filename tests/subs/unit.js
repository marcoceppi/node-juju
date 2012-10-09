var Juju = require('../../index.js', true);

exports.testJujuExists = function(test)
{
	test.ok(true, "Juju exists, we can continue");
	test.done();
}

exports.add_unit =
{
	setUp: function(cb)
	{
		// Create a dummy environment
		bad_juju = new Juju('bad-env');
		good_juju = new Juju('stupid');
		opts_juju = new Juju('stupid');

		old_exec = good_juju._exec;
		good_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju add-unit -n=1 wordpress' )
			{
				return ncb(null, {});
			}

			ncb(new Error('Bad command'), {});
		}

		opts_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju add-unit -n=5 wordpress' )
			{
				return ncb(null, {});
			}

			ncb(new Error('Failed to add-units'), null);
		}

		cb();
	},
	tearDown: function(cb)
	{
		good_juju, bad_juju, opts_juju = null;
		cb();
	},
	testJujuAddUnit: function(test)
	{
		test.expect(1);
		good_juju.add_unit('wordpress', function(err, data)
		{
			console.log('done');
			test.strictEqual(err, null, 'Can add a single unit');
			test.done();
		});
	},
	testJujuAddUnitBy: function(test)
	{
		test.expect(1);
		opts_juju.add_unit('wordpress', 5, function(err, data)
		{
			test.strictEqual(err, null, 'Add multiple units');
			test.done();
		});
	},
}

exports.remove_unit = 
{
	setUp: function(cb)
	{
		// Create dummy environments
		good_juju = new Juju('stupid');

		old_exec = good_juju._exec;
		good_juju._exec = function(cmd, cfg, ncb)
		{
			return ncb(null, {});
		}

		cb();
	},
	tearDown: function(cb)
	{
		good_juju = null;
		cb();
	},
	testJujuRemoveUnit: function(test)
	{
		good_juju.remove_unit('wordpress/0', function(err)
		{
			test.strictEqual(err, null, 'Removed wordpress/0');
			test.done();
		});
	},
	testJujuRemoveUnitFails: function(test)
	{
		bad_juju.remove_unit(function(err)
		{
			test.notStrictEqual(err, null, 'Expect an error on bad call');
			test.done();
		});
	}
}
