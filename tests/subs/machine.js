var Juju = require('../../index.js', true);

exports.testJujuExists = function(test)
{
	test.ok(true, "Juju exists, we can continue");
	test.done();
}

exports.terminate_machine =
{
	setUp: function(cb)
	{
		// Create dummy environments
		basic_juju = new Juju('stupid');
		multi_juju = new Juju('stupid');
		nocb_juju = new Juju('stupid');
		onlycb_juju = new Juju('stupid');

		basic_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju terminate-machine 0' )
			{
				return ncb(null, {});
			}

			return ncb(new Error('Command failed'));
		}

		multi_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju terminate-machine 0 1 2' )
			{
				return ncb(null, {});
			}

			return ncb(new Error('Command failed'));
		}

		nocb_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju terminate-machine 0 1' )
			{
				return ncb(null, {});
			}

			throw new Error('Command failed');
		}

		onlycb_juju._exec = function(cmd, cfg, ncb)
		{
		}
		cb();
	},
	tearDown: function(cb)
	{
		basic_juju, multi_juju, nocb_juju, onlycb_juju = null;
		cb();
	},
	testJujuTerminateMachine: function(test)
	{
		basic_juju.terminate(0, function(err)
		{
			test.strictEqual(err, null, 'Terminated a machine');
			test.done();
		});
	},
	testJujuTerminateMultipleMachines: function(test)
	{
		multi_juju.terminate(0, 1, 2, function(err)
		{
			test.strictEqual(err, null, 'Terminate more machines');
			test.done();
		});
	},
	testJujuTerminateArrayMachines: function(test)
	{
		multi_juju.terminate([0, 1, 2], function(err)
		{
			test.strictEqual(err, null, 'Terminate array of machines');
			test.done();
		});
	},
	testJujuTerminateMachineWithOutCallback: function(test)
	{
		var error = false;
		try
		{
			nocb_juju.terminate(0, 1);
		}
		catch(e)
		{
			error = e;
		}

		test.strictEqual(error, false, 'Terminate without callback');
		test.done();
	},
	testJujuTerminateOnlyCallback: function(test)
	{
		onlycb_juju.terminate(function(err)
		{
			test.notStrictEqual(err, null, 'Terminate with only a callback');
			test.done();
		});
	}
}
