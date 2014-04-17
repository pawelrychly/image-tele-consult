
module.exports.controller = function(app, passport) {
	
	app.get('/', function(req, res) {
		res.render('index', { title: 'Image TeleConsult' });
	});
}