var juju =
{
	exec: function(container, opts, cb)
	{
		config = { env: process.env, timeout: 240000 };
		config.env.HOME = container;
		console.log('juju '+command+' '+this.parse_arguments(opts));
		exec('juju '+command+' '+this.parse_arguments(opts), config, function(err_arr, results, err_str)
		{
			cb(err_arr, results);
		});
	},
	status: function(container, job, cb)
	{
		opts = {e: job.environment, format: "json"};

		juju.exec(container, command, opts, function(error, results)
		{
			results = results || JSON.stringify({});
			results = JSON.parse(results);

			// Build a status object
			if( error )
			{
				data = { bootstrapped: false, units: 0, services: 0, data: JSON.stringify(results) };
			}
			else
			{
				data =
				{
					services: Object.keys(results.services).length,
					units: Object.keys(results.machines).length,
					bootstrapped: Object.keys(results.machines).length > 0,
					data: JSON.stringify(results)
				};
			}

			// Do we even need a callback?
			redisClient.HMSET(job.user+':'+job.environment+':'+job.action, data, function(err, res){});

			opts.format = 'png';
			juju.exec(container, command, opts, function(error, results)
			{
				if( !error )
				{
					redisClient.SET(job.user+':'+job.environment+':layout', results);
					cb(null, container, job);
				}
				else
				{
					cb(error, container, job);
				}
			});
		});
	},
	bootstrap: function(container, job, cb)
	{
		opts = {e: job.environment};

		juju.exec(container, command, opts, function(error, results)
		{
			cb(error, container, job);
		});
	},
	arguments: function(args)
	{
		args_s = "";
		for(var key in args)
		{
			if( key == 'argv' )
			{
				argv = "";
				for(var el in args[key])
				{
					argv += ((argv) ? " " : "")+args[key];
				}

				args_s += ((args_s) ? " " : "")+argv;
			}
			else
			{
				args_s += ((args_s) ? " " : "")+((typeof key == "number") ? "" : ((key.length == 1) ? "-" : "--"))+key+"="+args[key];
			}
		}

		return args_s;
	}
}

exports.juju = juju;
