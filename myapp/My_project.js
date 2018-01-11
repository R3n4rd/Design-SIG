var express = require('express')
var app = express()

// Chargement de projet et des couches
app.use('/javascript_project', express.static(__dirname + '/javascript_project.js'));
app.use('/css', express.static(__dirname + '/pr.css'));
app.use('/countries', express.static(__dirname + '/geojson/countries.geojson'));
app.use('/admin4', express.static(__dirname + '/geojson/admin_region/admin_level_4.geojson'));
app.use('/admin5', express.static(__dirname + '/geojson/admin_region/admin_level_5.geojson'));

// Ancienne manière de charger les routes et pistes
// app.use('/pistesLL', express.static(__dirname + '/geojson/pistesLL.geojson'));
// app.use('/routesLL', express.static(__dirname + '/geojson/routesLL.geojson'));

// Chargement des images
app.use('/zebu', express.static(__dirname + '/images/zebu.png'));
app.use('/epfl', express.static(__dirname + '/images/Logo_EPFL.png'));
app.use('/refresh', express.static(__dirname + '/images/resfresh-icon.png'));

// Ajout de superagent
app.use('/superagent', express.static(__dirname + '/node_modules/superagent/superagent.js'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/pr.html');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))

var mongores = require('./mongoresult_project');
app.use('/', mongores);
