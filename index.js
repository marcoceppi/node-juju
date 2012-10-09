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
			if( what.call(args[key]) == '[object Array]' )
			{
				for(var el in args[key])
				{
					argv += ((argv) ? " " : "")+args[key];
				}
			}
			else
			{
				argv = args[key];
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
				((args[key] === true || args[key] === null) ? "" : '=' + 
					((typeof args[key] == "number") ? args[key] : '"' + args[key] + '"'));
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
	if( opts )
	{
		if( typeof opts == 'object' )
		{
			opts.format = (!opts.format) ? 'png' : opts.format;
		}
		else if( typeof opts == 'function' )
		{
			cb = opts;
			opts = {format: 'png'};
		}
	}
	else
	{
		opts = {format: 'png'};
		cb = function(){};
	}

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
	cb = cb || opts;
	default_opts = {e: this.environment, format: this.format};
	opts = ( opts && typeof opts == 'object' ) ? extend(true, default_opts, opts) : default_opts;
	this._run('status', opts, function(err, results)
	{
		// Build a status object
		if( err )
		{
			data = (opts.format != 'png') ? { bootstrapped: false, units: 0, services: 0, data: '' } : null;
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
					cb(error, data);
				});
			}
			else
			{
				cb(new Error('Not a valid format'), null);
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
	cb = cb || opts
	default_opts = {e: this.environment};
	opts = (opts && typeof opts == 'object') ? extend(true, default_opts, opts) : default_opts;
	this._run('destroy-environment', opts, function(err, result)
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
			service(new Error('No service defined'));
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

Juju.prototype.deploy = function(charm, service_name, opts, cb)
{
	// Whole bunch of detection is going to happen. service_name and opts
	// are both optional. service_name is a string, opts is an "Object"
	// and cb is a function. We need to verify that charm is _actually_
	// a charm, which I hope to do this eventually with a Charm object
	// but for now we just need some rudimentary detection. Juju will do 
	// the rest for us.

	// Find out where the cb is
	cb = cb || (opts && typeof opts == 'function') ? opts : 
		((service_name && typeof service_name == 'function') ? service_name : 
			((charm && typeof charm == 'function') ? charm : function() {}));

	if( typeof charm != 'string' )
	{
		return cb(new Error('Not a valid charm'));
	}

	// Find out if we have a service name, or if we have opts, or neither.
	if( opts )
	{
		if( typeof opts != 'object' && service_name && typeof service_name == 'object' )
		{
			opts = service_name;
			service_name = null;
		}
		else
		{
			opts = {};
		}
	}
	else
	{
		opts = {};
		service_name = null;
	}

	// One day charm will be a Charm object that looks something like this:
	// {
	//	name: foo
	//	repository: null // Or local path, Or lp branch
	//	source: store // Or local, or lp
	// }

	// Why not make this an array sometime soon? (V);,,;(V)
	opts.argv = charm;
	opts.argv += (service_name) ? ' '+service_name : ''
	// Hopefully all of the variables should be sorted by now.
	this._run('deploy', opts, cb);
}

Juju.prototype.expose = function(service, cb)
{
	cb = cb || function() {};

	if( !service || typeof service != 'string' )
	{
		return cb(new Error('Not a valid service'));
	}

	this._run('expose', {argv: service}, cb);
}

Juju.prototype.unexpose = function(service, cb)
{
	cb = cb || function() {};

	if( !service || typeof service != 'string' )
	{
		return cb(new Error('Not a valid service'));
	}

	this._run('unexpose', {argv: service}, cb);
}

Juju.prototype.add_relation = function()
{
	
}

Juju.prototype.remove_relation = function()
{
	
}

Juju.prototype._run = function(subcommand, opts, cb)
{
	default_opts = {format: this.format};
	// Need to extend default opts with opts
	config = {"env": extend(true, process.env, this.env)};
	config.cwd = (this.env.HOME) ? this.env.HOME : __dirname;
	var scope = this;
	// Pretty sure this is where this goes...
	process.nextTick(function()
	{
		if( opts.format && opts.format == 'png' )
		{
			// TODO: Refactor this, we shouldn't have to write to a file, but
			//       I really don't know enough about streams, buffers, and types
			//       to do more with this right now.
			mpoch = new Date().getTime();
			streamFileName = config.cwd + '/' + mpoch + '.png'
			streamFile = fs.createWriteStream(streamFileName);
			var runner = scope._spawn('juju', ['status'].concat(build_args(opts).split(" ")), config);
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
			scope._exec('juju '+subcommand+' '+build_args(opts), config, function(err_arr, results, err_str)
			{
				cb(err_arr, results);
			});
		}
	});
}

/**
 * EXTRAS!
 */

/**
 * Watch
 */
// Not sure if I want this to just return a promise, or if it should just
// be like every other function here.
Juju.prototype.watch = function(settings, cb) {}

// Make these over-rideable for testing
Juju.prototype._exec = exec;
Juju.prototype._spawn = spawn;

module.exports = Juju;
