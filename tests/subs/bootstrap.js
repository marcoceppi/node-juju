var Juju = require('../../index.js'),
	fs = require('fs');

exports.setUp = function(cb)
{
	
	cb();
}

exports.tearDown = function(cb)
{
	cb();
}

exports.testJujuExists = function(test)
{
	test.ok(true, "Juju exists, we can continue");
	test.done();
};

exports.testJujuBootstrapFails = function(test)
{
	
}

/*
exports.testJujuNotBootstrapped = function(test)
{
	juju.bootstrap('/home/marco', {environment: "omg"}, function(err, c, j)
	{
		test.ifError(err);
		test.done();
	});
};
*/
