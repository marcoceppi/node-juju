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
		// Create a dummy environment
		bad_juju = new Juju('bad-env');
		good_juju = new Juju('stupid');
		service_name_juju = new Juju('stupid');
		opts_juju = new Juju('stupid');

		old_exec = good_juju._exec;
		good_juju._exec = function(cmd, cfg, ncb)
		{
			old_exec(cmd, cfg, function(err, results)
			{
				if( err.code < 2 )
				{
					return ncb(null, {});
				}

				ncb(err, results);
			});
		}

		service_name_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju deploy wordpress my_blog' )
			{
				return ncb(null, {});
			}

			ncb(new Error('Failed to deploy'), null);
		}

		opts_juju._exec = function(cmd, cfg, ncb)
		{
			if( cmd == 'juju deploy --constraints="instance-type=f1.fake" wordpress' )
			{
				return ncb(null, {});
			}

			ncb(new Error('Failed to deploy'), null);
		}

		cb();
	},
	tearDown: function(cb)
	{
		good_juju, bad_juju, service_name_juju, opts_juju = null;
		cb();
	},
	testJujuDeployFails: function(test)
	{
		test.expect(1);
		bad_juju.deploy('wordpress', function(err, data)
		{
			test.notStrictEqual(err, null, 'Deploy errors out');
			test.done();
		});
	},
	testJujuDeploy: function(test)
	{
		test.expect(1);
		good_juju.deploy('wordpress', function(err, data)
		{
			test.strictEqual(err, null, 'Deploy runs "cleanly"');
			test.done();
		});
	},
	testJujuDeployServiceName: function(test)
	{
		test.expect(1);
		service_name_juju.deploy('wordpress', 'my_blog', function(err, data)
		{
			test.strictEqual(err, null, 'Deploy charm with service_name');
			test.done();
		});
	},
	testJujuDeployOptions: function(test)
	{
		test.expect(1);
		opts_juju.deploy('wordpress', {'constraints': 'instance-type=f1.fake'}, function(err)
		{
			test.strictEqual(err, null, 'Deploy charm with additional command line options');
			test.done();
		});
	}
}
