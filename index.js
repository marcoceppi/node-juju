var exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	fs = require('fs'),
	extend = require('node.extend'),
	what = Object.prototype.toString;

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
				((args[key] === true || args[key] === null) ? "" : "="+args[key]);
		}
	}

	return args_s;
}

// TODO: Add parameter validity to each command
var Juju = function(environment, format, env)
{
	this.format = format || 'json';
	this.environment = environment;
	this.env = env || {};
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
	cb = cb || (typeof opts == 'function') ? opts : function() {};
	opts = (typeof opts == 'object') ? extend(true, default_opts, opts) : default_opts;

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
	opts = (opts) ? extend(true, default_opts, opts) : default_opts;

	this._run('destroy-enivronment', opts, function(err, result)
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
 * @param service/unit
 * @param cb - Callback
 */
Juju.prototype.destroy_service = function(service, cb)
{
	if( !cb && (!service || typeof service != 'string') )
	{
		if( typeof service == 'function' )
		{
			cb(new Error('No service defined'));
		}

		// We tried to notify them if we could.
		return;
	}

	this._run('destroy-service', {argv: service}, cb);
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

	this._run('add-unit', {n: incrby, argv: service}, cb);
}

/**
 * Remove Unit(s)
 *
 * Increase the units
 */
Juju.prototype.remove_unit = function(service, cb)
{
	cb = cb || function() {};
	if( typeof service != 'string' )
	{
		return cb(new Error('Not a valid service'));
	}

	this._run('remove-unit', {argv: service}, cb);
}

/**
 * Resolved
 *
 * Resolve errors
 */
Juju.prototype.resolved = function(unit, relation, retry, cb)
{
	cb = cb || (typeof opts == "function") ? opts : function() {};
	retry = (typeof retry == "boolean") ? retry : (typeof relation == "boolean") ? retry : false;
	relation = (typeof relation == "string") ? relation : null;

	this._run('resolved', {retry: retry, argv: [unit, relation]}, cb);
}

Juju.prototype.resolve = Juju.prototype.resolved;

Juju.prototype.terminate_machine = function()
{
	// Check if the last argument is a callback. It better be but sometimes
	// people are stupid and don't use callbacks. Just letting the code run
	// wild, wind in it's hair, flowing...
	potential_cb = arguments.pop();
	if( typeof potential_cb == 'function' )
	{
		cb = potential_cb
	}
	else
	{
		cb = function(){};
		// Put the record back
		arguments.push(potential_cb);
	}

	// Need _AT LEAST_ one machine to terminate
	if( arguments.length < 1 )
	{
		return cb(new Error('Need at least one machine to terminate'));
	}

	// If someone did Juju.terminate_machine([1, 2], cb) expect it.
	if( arguments.length == 1 && what.call(arguments[0]) == '[object Array]' )
	{
		arguments = arguments[0];
	}

	this._run('terminate-machine', {argv: arguments.join(' ')}, cb);
}

Juju.prototype._run = function(subcommand, opts, cb)
{
	cb = cb || (typeof env == "function") ? env : function() {};
	default_opts = {format: this.format};
	// Need to extend default opts with opts
	config = {cwd: container, env: process.env};
	config.env.HOME = container;

	// Pretty sure this is where this goes...
	process.nextTick(function()
	{
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
					cb(new Error('Juju cmd error!'), streamFileName);
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
	});
}

// Make these over-rideable for testing
Juju.prototype._exec = exec;
Juju.prototype._spawn = spawn;

module.exports = Juju;
