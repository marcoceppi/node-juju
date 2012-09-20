var exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	fs = require('fs'),
	extend = require('node.extend');


/**
 * TODO, turn this whole thing in to a prototyped object
 * var juju = require('juju');
 *
 * env = juju.bootstrap('env_name');
 * env.status();
 * env.deploy(charm);
 * env.destroy();
 */

var Juju = function(options)
{
	// Environments can be JSON or Yaml, need to check
	options = (typeof options == "object") ? options : null;

	this.environments = environments;
}

/**
 * Bootstrap
 *
 * If a callback is provided, bootstrap will loop over status until the
 * environment is set up.
 *
 */
Juju.prototype.bootstrap = function(environment, options, cb)
{
	
}

Juju.prototype.status
module.exports = Juju;


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

exports.layout = function(container, job, cb)
{
	job.data.format = 'png';
	exports.status(container, job, cb);
}

exports.status = function(container, job, cb)
{
	// Defaults
	opts = {e: job.environment, format: "json"};
	opts = ( job.data ) ? extend(true, opts, job.data) : opts;

	run(container, 'status', opts, function(error, results)
	{
		// Build a status object
		if( error )
		{
			data = { bootstrapped: false, units: 0, services: 0, data: '' };
			cb(error, container, job, data);
		}
		else
		{
			if( opts.format == 'json' )
			{
				results = results || JSON.stringify({});
				results = JSON.parse(results);

				data =
				{
					services: Object.keys(results.services).length,
					units: Object.keys(results.machines).length,
					bootstrapped: Object.keys(results.machines).length > 0,
					data: JSON.stringify(results)
				};

				cb(error, container, job, data);
			}
			else if( opts.format == 'png' )
			{
				fs.readFile(results, function(err, data)
				{
					fs.unlink(results);
					cb(error, container, job, data);
				});
			}
			else
			{
				cb('Not a valid format', container, job, null);
			}
		}
	});
}

exports.bootstrap = function(container, job, cb)
{
	opts = {e: job.environment};
	opts = ( job.data ) ? extend(true, opts, job.data) : opts;

	run(container, 'bootstrap', opts, function(error, results)
	{
		cb(error, container, job);
	});
}

exports.destroy_environment = function(container, job, cb)
{
	opts = {e: job.environment};
	opts = ( job.data ) ? extend(true, opts, job.data) : opts;

	run(container, 'destroy-enivronment', opts, function(error, results)
	{
		cb(error, container, job);
	});
}
