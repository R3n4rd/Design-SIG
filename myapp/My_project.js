var express = require('express')
var app = express()

app.use('/pr', express.static(__dirname + '/pr.js'));
app.use('/javascript_test', express.static(__dirname + '/javascript_test.js'));
app.use('/capitales_amerique_sud', express.static(__dirname + '/capitales_amerique_sud.geojson'));
app.use('/countries', express.static(__dirname + '/countries.geojson'));
app.use('/css', express.static(__dirname + '/pr.css'));

// ajout de superagent
app.use('/superagent', express.static(__dirname + '/node_modules/superagent/superagent.js'));

// app.use('/routesLL', express.static(__dirname + '/routesLL.geojson'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/pr.html');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))

// erreur 404
/* app.use(function(req, res, next) {
	var err=new Error('Not Found');
	err.status = 404;
	next(err);
}); */

var mongores = require('./mongoresult');
app.use('/', mongores);
