var Juju = require('../../index.js', true);

exports.testJujuExists = function(test)
{
	test.ok(true, "Juju exists, we can continue");
	test.done();
}

exports.bootstrap = 
{
	setUp: function(cb)
	{
		good_juju = new Juju('stupid', 'json', {HOME: '/tmp/node-juju-tests'});
		invalid_juju = new Juju('stupid');
		bad_juju = new Juju('bad-env');
		cb();
	},
	tearDown: function(cb)
	{
		good_juju, invalid_juju, bad_juju = null;
		cb();
	},
	testFails: function(test)
	{
		test.expect(1);
		bad_juju.bootstrap(function(err)
		{
			test.notStrictEqual(err, null, 'Error when not able to bootstrap?');
			test.done();
		});
		
	},
	testInvalidEnvironment: function(test)
	{
		test.expect(1);
		invalid_juju.bootstrap(function(err)
		{
			test.notStrictEqual(err, null, 'Error on non-existent environment?');
			test.done();
		});
	},
	testWorks: function(test)
	{
		test.expect(1);
		good_juju.bootstrap(function(err)
		{
			test.strictEqual(err, null, 'A successful bootstrap?');
			test.done();
		});
	}
}

exports.destroy_environment =
{
	setUp: function(cb)
	{
		bad_juju = new Juju('bad-env');
		good_juju = new Juju('stupid');

		old_exec = good_juju._exec;
		good_juju._exec = function(cmd, cfg, ncb)
		{
			old_exec("yes|"+cmd, cfg, ncb);
		}

		cb();
	},
	tearDown: function(cb)
	{
		good_juju, bad_juju = null;
		cb();
	},
	testFails: function(test)
	{
		test.expect(1);
		bad_juju.destroy_environment(function(err)
		{
			test.notStrictEqual(err, null, 'Failed to destroy a non-bootstrapped environment?');
			test.done();
		});
	},
	testWorks: function(test)
	{
		test.expect(1);
		good_juju.destroy_environment(function(err)
		{
			test.strictEqual(err, null, 'Succesfully destroyed environment?');
			test.done();
		});
	}
}

exports.destroy =
{
	setUp: function(cb)
	{
		bad_juju = new Juju('bad-env');
		good_juju = new Juju('stupid');

		old_exec = good_juju._exec;
		good_juju._exec = function(cmd, cfg, ncb)
		{
			old_exec("yes|"+cmd, cfg, ncb);
		}

		cb();
	},
	tearDown: function(cb)
	{
		good_juju, bad_juju = null;
		cb();
	},
	testFails: function(test)
	{
		test.expect(1);
		bad_juju.destroy(function(err)
		{
			test.notStrictEqual(err, null, 'Failed to destroy a non-bootstrapped environment?');
			test.done();
		});
	},
	testWorks: function(test)
	{
		test.expect(1);
		good_juju.destroy(function(err)
		{
			test.strictEqual(err, null, 'Succesfully destroyed environment?');
			test.done();
		});
	}
}
