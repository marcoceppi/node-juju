var exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	fs = require('fs');

var run = function(container, command, opts, cb)
{
	config = { cwd: container, env: process.env };
	config.env.HOME = container;
	console.log('juju '+command+' '+build_args(opts));

	if( opts.format && opts.format == 'png' )
	{
		// TODO: Refactor this, we shouldn't have to write to a file, but
		//       I really don't know enough about streams, buffers, and types
		//       to do more with this right now.
		mpoch = new Date().getTime();
		var streamFileName = container + '/' + mpoch + '.png'
		var streamFile = fs.createWriteStream(streamFileName);
		var runner = spawn('juju', ['status'].concat(build_args(opts).split(" ")), config);
		runner.stdout.on('data', function(data) { streamFile.write(data); });
		runner.stdout.on('end', function(data) { streamFile.end(); });
		//runner.stderr.on('data', function(data) { console.log(data.toString()); });
		runner.on('exit', function(code)
		{
			if( code != 0 )
			{
				cb('Juju cmd error!', streamFileName);
			}
			else
			{
				cb(null, streamFileName);
			}
		});
	}
	else
	{
		config.timeout = 240000;

		exec('juju '+command+' '+build_args(opts), config, function(err_arr, results, err_str)
		{
			cb(err_arr, results);
		});
	}
};

var build_args = function(args)
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

exports.status = function(container, job, redis, cb)
{
	opts = {e: job.environment, format: "json"};

	run(container, 'status', opts, function(error, results)
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
		redis.HMSET(job.user+':'+job.environment+':'+job.action, data, function(err, res){});

		opts.format = 'png';
		run(container, 'status', opts, function(error, results)
		{
			if( !error )
			{
				fs.readFile(results, function(err, data)
				{
					redis.SET(job.user+':'+job.environment+':layout', data);
					fs.unlink(results);
				});
			}

			cb(error, container, job);
		});
	});
}

exports.bootstrap = function(container, job, redis, cb)
{
	opts = {e: job.environment};

	run(container, 'bootstrap', opts, function(error, results)
	{
		cb(error, container, job);
	});
}

