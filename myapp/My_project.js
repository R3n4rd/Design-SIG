var express = require('express')
var app = express()
 
app.use('/pr', express.static(__dirname + '/pr.js'));
app.use('/javascript_test', express.static(__dirname + '/javascript_test.js'));
app.use('/capitales_amerique_sud', express.static(__dirname + '/capitales_amerique_sud.geojson'));
app.use('/countries', express.static(__dirname + '/countries.geojson'));
app.use('/css', express.static(__dirname + '/pr.css'));


app.get('/', (req, res) => {
res.sendFile(__dirname + '/pr.html');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))


/*

var express = require('express');
var router = express.Router();


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Mongoose connection to MongoDB
mongoose.connect('mongodb://localhost:27017/Burkina', function(error) {
	if (error){
		console.log(error);
	}
});

// Mongoose general Schema and model definition
var JsonSchema = new Schema ({
	name: String,
	type: Schema.Types.Mixed
});
var Json = mongoose.model('JString', JsonSchema, 'layercollection');

// GET home page
router.get('/', function(req, res, next)) {
	res.render('index', {title: 'Express'});
});

// GET GeoJSON data
router.get('/mapjson/:name', function(req, res)) {
	if (req.params.name) {
		Json.findOne({ name: req.params.name }, {}, function(err, docs) {
			res.json(docs);
		});
	}
});

module.exports = router;

*/

// superagent installer puis copier/coller dans le dossier public