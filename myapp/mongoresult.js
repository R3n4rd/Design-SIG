var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

mongoose.Promise = global.Promise;

// Mongoose connection to MongoDB
mongoose.connect('mongodb://localhost:27017/Burkina', {useMongoClient: true}, function(error) {
	if (error){
		console.log(error);
	}
});

// Mongoose general Schema and model definition
var JsonSchema = new Schema ({
	name: String,
	type: Schema.Types.Mixed,
});
var Json = mongoose.model('JString', JsonSchema, 'Routes_Pistes_Layer');

// GET home page
/* router.get('/', function(req, res, next) {
	res.render('/pr.html', {title: 'Accueil'});
}); */ 

// GET GeoJSON data
// Le nom cest routesLL
router.get('/jsonmap/:name', function(req, res) {
	if (req.params.name) {
		Json.findOne({ name: req.params.name }, {}, function(err, docs) {
			res.json(docs);
		});
	}
});

// Traitement de l'observation
var obs = new Schema({
	// _id: Object,
	type: String,
	properties: {
		id: String,
		name: String,
		comment: String,
		added: Date,
		image: String,
	},
	geometry: {
		$type: String,
		coordinates: Array,
	}
});
var observation = mongoose.model('observation', obs, 'Observations');

router.post('/form', function(req,res) {
	// console.log(req.body);
	var newObs = new observation(req.body);
	newObs.save(function(err, newobj) {
		if(err) {
			res.send(err.message);
			// console.log(err.message);
		} else {
			res.send(newobj);
		};
	});
});

// recherche des objets observations
router.get('/form', function(req,res) {
	observation.find({}, function(err,docs) {
		res.send(docs);
	});
});

router.put('/form/update', function(req,res) {
	// console.log(req.body);
	var id=req.body.properties.id, body=req.body;
	observation.findByIdAndUpdate(id, body, function(err, docs) {
		// console.log(err.message);
		// console.log(id);
		if (err) {
			res.send(err.message);
		} else {
			res.send("OK");
		}
	});
});

router.put('/form/update', function(req,res) {
	// console.log(req.body);
	var id=req.body.properties.id, body=req.body;
	observation.findByIdAndUpdate(id, body, function(err, docs) {
		// console.log(err.message);
		// console.log(id);
		if (err) {
			res.send(err.message);
		} else {
			res.send("OK");
		}
	});
});

router.put('/form/delete', function(req,res) {
	var id=req.body.properties.id, body=req.body;
	observation.findByIdAndRemove(id, function(err, docs) {
		if (err) {
			res.send(err.message);
			console.log(err.message);
		} else {
			res.send("OK");
		}
	});
});

module.exports = router;
