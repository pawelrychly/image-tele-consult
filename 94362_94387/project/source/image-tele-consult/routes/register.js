
module.exports.controller = function(app, passport) {
	app.get('/register', function(req, res) {
		res.render('register', { title: 'Image TeleConsult' });
	});
}