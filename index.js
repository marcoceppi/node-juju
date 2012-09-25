var exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	fs = require('fs'),
	extend = require('node.extend');

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
		else if( typeof args[key] != 'boolean' || 
			(typeof args[key] == 'boolean' && args[key] === true) )
		{
			// I do this because I hate you.
			args_s += ((args_s) ? " " : "")+
				((typeof key == "number") ? "" : 
					((key.length == 1) ? "-" : "--"))+key+
				((args[key] === true) ? "" : "="+args[key]);
		}
	}

	return args_s;
}

var Juju = function(environment)
{
	this.environment = environment;
}

/**
 * Bootstrap
 *
 * If a callback is provided, bootstrap will loop over status until the
 * environment is set up.
 *
 * @param opts optional - hash of key: value to be converted to command line args
 * @param cb - Callback
 */
Juju.prototype.bootstrap = function(opts, cb)
{
	default_opts = {e: this.environment};
	opts = ( opts ) ? extend(true, default_opts, opts) : default_opts;

	this._run('bootstrap', opts, function(err, results)
	{
		cb(err);
	});
}

/**
 * Layout
 *
 * This is here for legacy support. It's status with --format=png
 */
Juju.prototype.layout = function(opts, cb)
{
	opts.format = 'png';
	this.status(opts, cb);
}

/**
 * Status
 *
 * Poll Juju for a status of this.environment
 *
 * @param opts optional - hash of key: value to be converted to cli args
 * @param cb - Callback
 */
Juju.prototype.status = function(opts, cb)
{
	//job.data = opts
	default_opts = {e: this.environment, format: "json"};
	opts = ( opts ) ? extend(true, default_opts, opts) : default_opts;

	this._run('status', opts, function(err, results)
	{
		// Build a status object
		if( err )
		{
			data = { bootstrapped: false, units: 0, services: 0, data: '' };
			cb(err, data);
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

				cb(error, data);
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

/**
 * Destroy Environment
 *
 * Destroy the current this.environment
 *
 * @param opts optional - hash of key: value to be converted to cli args
 * @param cb - Callback
 */
Juju.prototype.destroy_environment = function(opts, cb)
{
	default_opts = {e: this.environment};
	opts = ( opts ) ? extend(true, default_opts, opts) : default_opts;

	this._run(container, 'destroy-enivronment', opts, function(err, result)
	{
		cb(err);
	});
}

Juju.prototype.destroy = Juju.prototype.destroy_environment;

/**
 * Destroy Service
 *
 * Destroy the specified service
 *
 * @param service/unit, ...
 * @param cb - Callback
 */
Juju.prototype.destroy_service = function()
{
	
}

/**
 * Add Unit
 *
 * Increase the units
 */
Juju.prototype.add_unit = function(service, incrby, cb)
{
	cb = cb || (typeof incrby == "object") ? incrby : function() {};
	incrby = (typeof incrby == "number") ? incrby : 1;

	this._run('add-unit', {n: incrby, argv: service});
}

/**
 * Remove Unit(s)
 *
 * Increase the units
 */
Juju.prototype.remove_unit = function()
{
	
	this._run('remove-unit', {n: incrby, argv: service});
}

/**
 * Resolved
 *
 * Resolve errors
 */
Juju.prototype.resolved = function(unit, relation, opts, cb)
{
	cb = cb || (typeof opts == "function") opts : function() {};
	opts = (opts && typeof opts == "object") ? opts : (relation && typeof relation == "object") ? relation : {};
	relation = (typeof relation == "string") ? relation : null;
	this._run('resolved', {n: incrby, argv: service});
}

Juju.prototype._run = function(subcommand, opts, cb)
{
	config = { cwd: container, env: process.env };
	config.env.HOME = container;
	console.log('juju '+subcommand+' '+build_args(opts));

	if( opts.format && opts.format == 'png' )
	{
		// TODO: Refactor this, we shouldn't have to write to a file, but
		//       I really don't know enough about streams, buffers, and types
		//       to do more with this right now.
		mpoch = new Date().getTime();
		var streamFileName = container + '/' + mpoch + '.png'
		var streamFile = fs.createWriteStream(streamFileName);
		var runner = this._spawn('juju', ['status'].concat(build_args(opts).split(" ")), config);
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

		this._exec('juju '+subcommand+' '+build_args(opts), config, function(err_arr, results, err_str)
		{
			cb(err_arr, results);
		});
	}
}

Juju.prototype._exec = exec;
Juju.prototype._spawn = spawn;

module.exports = Juju;
