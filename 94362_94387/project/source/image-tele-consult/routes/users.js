
module.exports.controller = function(app, passport) {
	app.get('/', function(req, res) {
		res.send('respond with a resource');
	});
}