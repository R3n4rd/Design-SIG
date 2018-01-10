var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var grid = require('gridfs-stream');
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});

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
var JsonSchemaRoutes = new Schema ({
	type: String,
	properties: {
		Route: String,
		origine: String,
		Fin: String,
		Code: String,
		Longueur: Number,
		Classe: String,
		Type: String,
	},
	geometry: {
		$type: String,
		coordinates: [[[Number]]]
	}
});
var JsonSchemaPistes = new Schema ({
	type: String,
	properties: {
		Pistes: String,
		origine: String,
		Fin: String,
		Longueur: Number,
		Type: String,
		Etat: String,
		AnnéeCons: String,
		BureuEtud: String,
		Entreprise: String,
		Observation: String
	},
	geometry: {
		$type: String,
		coordinates: [[Number]]
	}
});
var JsonRoutes = mongoose.model('JStringRoutes', JsonSchemaRoutes, 'Routes');
var JsonPistes = mongoose.model('JStringPistes', JsonSchemaPistes, 'Pistes');

// recherche des objets Routes
router.get('/jsonmap/routesLL', function(req,res) {
	JsonRoutes.find({}, function(err,docs) {
		res.send(docs);
	});
});

// recherche des objets Pistes
router.get('/jsonmap/pistesLL', function(req,res) {
	JsonPistes.find({}, function(err,docs) {
		res.send(docs);
	});
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
var observation = mongoose.model('Observation', obs, 'Observations');

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

// gestion des images
grid.mongo = mongoose.mongo;
var conn = mongoose.createConnection('mongodb://localhost:27017/Burkina');
conn.once('open', function () {
	var gfs = new grid(conn.db);

	router.post('/photos/ouvrages', upload.single('fileToUpload'), function(req, res, next) {
		if (!req.file) {
			return next(new ServerError('Pas trouvé le fichier'),
				{context: 'files route', status:403});
		}
		var writestream = gfs.createWriteStream({
			mode: 'w', // w par défaut
			content_type: req.file.mimetype,
			filename: req.file.originalname,
		});
		fs.createReadStream(req.file.path).pipe(writestream);
		writestream.on('close', function(newFile) {
			return res.status(200).json({ _id:newFile._id});
			// return res.status(200).json({ _id:req.file.filename});
		});
	});

	router.get('/photos/ouvrages/:fileId', function(req, res, next) {
		// console.log(req.params.fileId);
		if (!req.params || !req.params.fileId) {
			return next(new ServerError('Pas trouvé le fichier'),
				{context: 'files route', status:403});
		}
		var id = gfs.tryParseObjectId(req.params.fileId);
		if(!id) {
			return next(new ServerError('Pas trouvé le fichier'),
				{context: 'files route', status:403});
		}
		gfs.files.find({_id: id}).toArray(function (err, files) {
			if (err || !files || files.length!==1) {
			return next(new ServerError('Peux pas lire les infos du fichier'+req.params.fileId+' error: '+err),
				{context: 'files route', status:403});
			}
			var fileInfo = files[0];
			var readstream = gfs.createReadStream({
				_id: req.params.fileId
			});
			readstream.on('error', function(err) {
				return next(new ServerError('Peux pas lire le fichier'+req.params.fileId+' error: '+err),
					{context: 'files route', status:403});
			});
			if (fileInfo.contentType) {
				res.setHeader('Content-type', fileInfo.contentType);
			}
			res.setHeader('Content-disposition', 'filename='+fileInfo.filename);
			return readstream.pipe(res);
		});
	});
});

module.exports = router;
