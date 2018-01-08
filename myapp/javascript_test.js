	  var tempFeature;
	  var editedFeature;
	  var obsLayer;
	  var dc="none"; // pour les points éviter double clic
	  var dcsave;

	  $(document).ready(function(){
	  
	  // définition du style des points d'observation
	  var Point_style = new ol.style.Style({
		  image: new ol.style.Circle({
			  radius: 5,
			  fill: new ol.style.Fill({color: 'red'}),
			  stroke: new ol.style.Stroke({color: 'black', width: 0})
		  })
	  });
	  
	  // Point en cours de modificaiton ou suppression
	  var Point_modsup = new ol.style.Style({
		  image: new ol.style.Circle({
			  radius: 5,
			  fill: new ol.style.Fill({color: 'yellow'}),
			  stroke: new ol.style.Stroke({color: 'black', width: 0})
		  })
	  });
	  
	  // définition du style des points des ouvrages
	  var Point_style_Ouvrages = new ol.style.Style({
		  image: new ol.style.Circle({
			  radius: 5,
			  fill: new ol.style.Fill({color: 'black'}),
			  stroke: new ol.style.Stroke({color: 'black', width: 0})
		  })
	  });
	  
	  // style Routes et Pistes
	  var Routes = new ol.style.Style({
		  fill: new ol.style.Fill({color:'rgba(200,10,10,0.2)',width:4}),
		  stroke: new ol.style.Stroke({color:'rgba(255,0,0,1)',width:1}),			  
	  });
	  
	  var Pistes = new ol.style.Style({
		  fill: new ol.style.Fill({color:'rgba(200,10,10,0.2)',width:2}),
		  stroke: new ol.style.Stroke({color:'rgba(204,204,0,1)',width:1}),			  
	  });
	  
	  // import routesLL et pistesLL
	  var Routes_Import = new ol.layer.Vector({
		  style: Routes,
		  source: new ol.source.Vector({
			  url: '/jsonmap/routesLL',
			  format: new ol.format.GeoJSON(),
			  projection:'EPSG:4326',
		  })
	  });
	  
	  var Pistes_Import = new ol.layer.Vector({
		  style: Pistes,
		  source: new ol.source.Vector({
			  url: '/jsonmap/pistesLL',
			  format: new ol.format.GeoJSON(),
			  projection:'EPSG:4326',
		  })
	  });
	  
	  // carte de base
	  var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
      });
	  
	  // carte Bing pour image satellite
	  var bing = new ol.layer.Tile({
        source: new ol.source.BingMaps({
          key: 'AjszTerrqnhuyrJY2xP9yRNJazKVcNdRGmgsBpzxfNUFRPgSMB5n2MJ6dEPyYO1t',
          imagerySet: 'Aerial'
        })
      });
	  
	  // Ajout de la couche "observations"
	  obsLayer = new ol.layer.Vector({
		  style: Point_style,
		  source: new ol.source.Vector({
			  format: new ol.format.GeoJSON(),
			  projection: 'EPSG:4326'
		  })
	  });
	  
	  // overlay pour le popup
	  var infobox_overlay = new ol.Overlay({
		  element: document.getElementById("infobox"),
		  autoPan: true,
		  autoPanAnimation: {
			  duration: 250
		  }
	  });
	  
      /* var source = new ol.source.Vector();

      var styleFunction = function(feature) {
        var geometry = feature.getGeometry();
        var styles = [
          // linestring
          new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#ffffff',
              width: 2
            })
          })
        ];
		
        geometry.forEachSegment(function(start, end) {
          var dx = end[0] - start[0];
          var dy = end[1] - start[1];
          var rotation = Math.atan2(dy, dx);
          // arrows
          styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(end),
            image: new ol.style.Icon({
              src: 'https://openlayers.org/en/v4.5.0/examples/data/arrow.png',
              anchor: [0.75, 0.5],
              rotateWithView: true,
              rotation: -rotation
            })
          }));
        
		styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(end),
			text: new ol.style.Text({
              text: 'X :'+end[0]+' | Y :'+end[1],
			  // text: 'Coordonnées :'+ol.proj.transform([end[1],end[0]], 'EPSG:3857', 'EPSG:4326');,
              anchor: [0.75, 0.5],
              // rotateWithView: true,
              // rotation: -rotation
            })
          }));
		});

        return styles;
      };
	  
      var vector = new ol.layer.Vector({
        source: source,
        style: styleFunction
      }); */
	

	// crée la carte
		  
      var map = new ol.Map({
        layers: [raster],
		overlays: [infobox_overlay],
        target: 'map',
        view: new ol.View({
          center: [-200000, 1400000],
          zoom: 7
        })
      });

	  // Ajout de la couche des Routes et Pistes
	  // map.addLayer(Routes_Import);
	  // map.addLayer(Pistes_Import);
	  
      // map.addInteraction(new ol.interaction.Draw({
        // source: source,
        // type: /** @type {ol.geom.GeometryType} */ ('LineString')
      // }));
	  
	  // cool : https://gis.stackexchange.com/questions/126909/remove-selected-feature-openlayers-3
	  // Draw and Modify Features : https://openlayers.org/en/latest/examples/draw-and-modify-features.html
	  
	  // gestion du fonctionnement des boutons add et modify
	  var mode = "none";
	  function setMode() {
		  if (this.id == "addButton" && mode!="edit" && mode!="del") {
			  if(mode=="add") {
				  mode="none";
				  this.style.color="white";
				  this.style.backgroundColor="#4CAF50";
				  map.removeLayer(obsLayer);
				  document.getElementById("formulaireAjouter").style.visibility="hidden";
				  document.getElementById("editButton").style.color="white";
				  document.getElementById("editButton").style.backgroundColor="#4CAF50";
				  document.getElementById("delButton").style.color="white";
				  document.getElementById("delButton").style.backgroundColor="#4CAF50";
				  // On vide le formulaire éviter les problèmes si on passe en édition
				  document.getElementById("IDinput").value = '';
				  document.getElementById("Nominput").value = '';
				  document.getElementById("Commentinput").value = '';
				  document.getElementById("Dateinput").value = '';
				  document.getElementById("Xinput").value = '';
				  document.getElementById("Yinput").value = '';
				  document.getElementById("IDinput").style.backgroundColor = '';
				  if (tempFeature) {obsLayer.getSource().clear(tempFeature);}
			  }
			  else {
				  mode="add";
				  this.style.color="red";
				  this.style.backgroundColor="yellow";
				  map.addLayer(obsLayer);
				  document.getElementById("formulaireAjouter").style.visibility="visible";
				  document.getElementById("editButton").style.color="black";
				  document.getElementById("editButton").style.backgroundColor="grey";
				  document.getElementById("delButton").style.color="black";
				  document.getElementById("delButton").style.backgroundColor="grey";
				  // On fait bien attention à ce que le formulaire soit vierge
				  document.getElementById("IDinput").value = '';
				  document.getElementById("Nominput").value = '';
				  document.getElementById("Commentinput").value = '';
				  document.getElementById("Dateinput").value = '';
				  document.getElementById("Xinput").value = '';
				  document.getElementById("Yinput").value = '';
				  document.getElementById("IDinput").style.backgroundColor = '';
			  }
			  // on clean si la infobox est visible
			  infobox_overlay.setPosition(undefined);
			  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
			  // On affiche le boutton save et cache le delete
			  document.getElementById("SaveButton").type="button";
			  document.getElementById("DeleteButton").type="hidden";
		  }
		  else if (this.id == "editButton" && mode!="add" && mode!="del") {
			  if(mode=="edit") {
				  mode="none";
				  this.style.color="white";
				  this.style.backgroundColor="#4CAF50";
				  map.removeLayer(obsLayer);
				  document.getElementById("formulaireAjouter").style.visibility="hidden";
				  document.getElementById("addButton").style.color="white";
				  document.getElementById("addButton").style.backgroundColor="#4CAF50";
				  document.getElementById("delButton").style.color="white";
				  document.getElementById("delButton").style.backgroundColor="#4CAF50";
				  // On vide le formulaire éviter les problèmes si on quitte l'édition
				  document.getElementById("IDinput").value = '';
				  document.getElementById("Nominput").value = '';
				  document.getElementById("Commentinput").value = '';
				  document.getElementById("Dateinput").value = '';
				  document.getElementById("Xinput").value = '';
				  document.getElementById("Yinput").value = '';
				  document.getElementById("IDinput").style.backgroundColor = '';
				  if (tempFeature) {obsLayer.getSource().clear(tempFeature);}
				  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
			  }
			  else {
				  mode="edit";
				  this.style.color="red";
				  this.style.backgroundColor="yellow";
				  // Nettoyage avant modification
				  dc="none";
				  map.addLayer(obsLayer);
				  document.getElementById("formulaireAjouter").style.visibility="visible";
				  document.getElementById("addButton").style.color="black";
				  document.getElementById("addButton").style.backgroundColor="grey";
				  document.getElementById("delButton").style.color="black";
				  document.getElementById("delButton").style.backgroundColor="grey";
			  }
			  // on clean si la infobox est visible
			  infobox_overlay.setPosition(undefined);
			  // On affiche le boutton save et cache le delete
			  document.getElementById("SaveButton").type="button";
			  document.getElementById("DeleteButton").type="hidden";
		  }
		  else if (this.id == "delButton" && mode!="add" && mode!="edit") {
			  if(mode=="del") {
				  mode="none";
				  // On affiche le boutton save et cache le delete
				  document.getElementById("SaveButton").type="button";
				  document.getElementById("DeleteButton").type="hidden";
				  this.style.color="white";
				  this.style.backgroundColor="#4CAF50";
				  document.getElementById("formulaireAjouter").style.visibility="hidden";
				  document.getElementById("addButton").style.color="white";
				  document.getElementById("addButton").style.backgroundColor="#4CAF50";
				  document.getElementById("editButton").style.color="white";
				  document.getElementById("editButton").style.backgroundColor="#4CAF50";
				  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
				  // remmettre tous les champs en éditables
				  document.getElementById("Nominput").disabled = false;
				  document.getElementById("Commentinput").disabled = false;
				  document.getElementById("Dateinput").disabled = false;
				  document.getElementById("Xinput").disabled = false;
				  document.getElementById("Yinput").disabled = false;
				  document.getElementById("ImageButton").disabled = false;
			  }
			  else {
				  mode="del";
				  // On affiche le boutton delete et cache le save
				  document.getElementById("SaveButton").type="hidden";
				  document.getElementById("DeleteButton").type="button";
				  this.style.color="red";
				  this.style.backgroundColor="yellow";
				  document.getElementById("formulaireAjouter").style.visibility="visible";
				  document.getElementById("addButton").style.color="black";
				  document.getElementById("addButton").style.backgroundColor="grey";
				  document.getElementById("editButton").style.color="black";
				  document.getElementById("editButton").style.backgroundColor="grey";
				  // mettre tous les champs en disabled
				  document.getElementById("Nominput").disabled = true;
				  document.getElementById("Commentinput").disabled = true;
				  document.getElementById("Dateinput").disabled = true;
				  document.getElementById("Xinput").disabled = true;
				  document.getElementById("Yinput").disabled = true;
				  document.getElementById("ImageButton").disabled = true;
			  }
			  // on clean si la infobox est visible
			  infobox_overlay.setPosition(undefined);
		  }
	  };
	  
	  document.getElementById("addButton").onclick=setMode;
	  document.getElementById("editButton").onclick=setMode;
	  document.getElementById("delButton").onclick=setMode;
	  
	  map.on('click', mapClick);
	  
	  // Arrêter un ajout
	  document.getElementById("CancelButton").onclick=cancelform;
	  function cancelform() {
		  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
		  editedFeature=null;
		  onsaved(null,'cancelled');
	  }
	  
	  // Enregistrement d'un ajout de point
	  document.getElementById("SaveButton").onclick=function() {saveform(onsaved)};

	  // ce qui est fait lorsqu'une observation a été stockée sur BD Mongo
	  function onsaved(arg, msg) {
		  if(arg==null){
			  console.log(msg);
		  }
		  else {
			  /* if(mode=='add') { tempFeature._id = arg._id; }
			  else if (mode='edit') {
				  editedFeature.setProperties({ "name": document.getElementById("Nominput").value});
				  editedFeature.setProperties({ "comment": document.getElementById("Commentinput").value});
				  editedFeature.setProperties({ "added": document.getElementById("Dateinput").value});
				  editedFeature.setProperties({ "image": null});
				  var geom = new ol.geom.Point([document.getElementById("Xinput").value, document.getElementById("Yinput").value]);
				  editedFeature.setGeometry(geom);
				  editedFeature=null;
			  } */
		  }
		  // rétablissement des boutons
		  document.getElementById("addButton").style.color="white";
		  document.getElementById("addButton").style.backgroundColor="#4CAF50";
		  document.getElementById("editButton").style.color="white";
		  document.getElementById("editButton").style.backgroundColor="#4CAF50";
		  document.getElementById("delButton").style.color="white";
		  document.getElementById("delButton").style.backgroundColor="#4CAF50";

		  // rétablissementdu formulaire
		  document.getElementById("IDinput").value = '';
		  document.getElementById("Nominput").value = '';
		  document.getElementById("Commentinput").value = '';
		  document.getElementById("Dateinput").value = '';
		  document.getElementById("Xinput").value = '';
		  document.getElementById("Yinput").value = '';
		  document.getElementById("IDinput").style.backgroundColor = '';
		  document.getElementById("formulaireAjouter").style.visibility="hidden";
		  
		  // remmettre tous les champs en éditables
		  document.getElementById("Nominput").disabled = false;
		  document.getElementById("Commentinput").disabled = false;
		  document.getElementById("Dateinput").disabled = false;
		  document.getElementById("Xinput").disabled = false;
		  document.getElementById("Yinput").disabled = false;
		  document.getElementById("ImageButton").disabled = false;
		  mode="none";
		  dc="none";
		  if (tempFeature) {obsLayer.getSource().clear(tempFeature);}
		  map.removeLayer(obsLayer);
	  }
	  
	  // ce qui est fait lorsque le bouton "sauver" est cliqué
	  function saveform(callback) {
		savedata(callback);
	  }
	  	  
	  // ce qui est fait lorsque le bouton "sauver" est cliqué
	  function savedata(callback) {
		var request = window.superagent; // superagent attention
		// contrôle de la date bien saisie
		if (document.getElementById("Dateinput").value=="") {document.getElementById("Dateinput").value="0001-01-01";}
		var observation = {
		"type": "Feature",
		"properties": {
			"id": document.getElementById("IDinput").value,
			"name": document.getElementById("Nominput").value,
			"comment": document.getElementById("Commentinput").value,
			"added": document.getElementById("Dateinput").value,
			"image": null,
		},
		"geometry": {
			"type": "Point",
			"coordinates": [
				document.getElementById("Xinput").value,
				document.getElementById("Yinput").value],
			}
		};
		if(mode==='add') {
			request
				.post('/form')
				.send(observation)
				.end(function(err,res) {
					if (err) {
						return callback(null, 'Erreur de connexion au serveur, ' + err.message);
					}
					if (res.status !== 200) {
						return callback(null, res.text);
					}
					// var jsonResp = JSON.parse(res.text);
					var jsonResp = res.text;
					// console.log(observation);
					callback(jsonResp);
				});
		} else if (mode==='edit') {
			request
				.put('/form/update')
				.send(observation)
				.end(function(err,res) {
					if (err) {
						return callback(null, 'Erreur de connexion au serveur, ' + err.message);
					}
					if (res.status !== 200) {
						return callback(null, res.text);
					}
					callback('updated');
				});
		} else {
			console.log("Interdit, pas de point");
			document.getElementById("IDinput").style.backgroundColor = 'red'; // par exemple
		}
		addObservations(); // on réactualise la carte avec le nouveau point
		// On nettoye les points
		if (tempFeature) {obsLayer.getSource().clear(tempFeature);}
		if (editedFeature) {Ouvrages_Layer.getSource().clear(editedFeature);}
	  }
	  
	  // Suppression d'un point
	  document.getElementById("DeleteButton").onclick=deletePoint;
	  
	  function deletePoint() {
		var request = window.superagent; // superagent attention
		// pour supprimer un point il n'y aurait pas besoin de tout le tralala, juste l'id en fait
		var observation = {
		"type": "Feature",
		"properties": {
			"id": document.getElementById("IDinput").value,
			"name": document.getElementById("Nominput").value,
			"comment": document.getElementById("Commentinput").value,
			"added": document.getElementById("Dateinput").value,
			"image": null,
		},
		"geometry": {
			"type": "Point",
			"coordinates": [
				document.getElementById("Xinput").value,
				document.getElementById("Yinput").value],
			}
		};
		request
			.put('/form/delete')
			.send(observation)
			.end(function(err,res) {
				if (err) {
					console.log('Erreur de connexion au serveur, ' + err.message);
				}
				if (res.status !== 200) {
					console.log(res.text);
				}
				// console.log('deleted');
				onsaved(null,'Suppression terminée');
			});
		addObservations(); // on réactualise la carte avec le point en moins
		if (editedFeature) { // et on oublie pas de nettoyer le point
			Ouvrages_Layer.getSource().clear(editedFeature);
		}
	  }
	  
	  function mapClick(e) {
		  // modèle tFeature
		  var tFeature = {
			  '_id': '',
			  'type': 'Feature',
			  'properties':{
				  'id': '',
				  'name': 'name',
				  'comment': 'comment',
				  'added': formatDate(Date()),
				  'image': ''
			  },
			  'geometry': {
				  'type': 'Point',
				  'coordinates': e.coordinate
			  }
		  };
		  
		  // Pour avoir le bon format de date
		  function formatDate(date) {
			  var d = new Date(date),
				  month = '' + (d.getMonth() + 1),
				  day = '' + d.getDate(),
				  year = d.getFullYear();

			  if (month.length < 2) month = '0' + month;
			  if (day.length < 2) day = '0' + day;

			  return [year, month, day].join('-');
		  }
		  
		  if(mode==="add") {
			  if(dc==="addone") {
				  obsLayer.getSource().clear(dcsave);
			  }

			  var reader = new ol.format.GeoJSON();
			  tempFeature = reader.readFeature(tFeature);
			  obsLayer.getSource().addFeature(tempFeature);
			  
			  document.getElementById("Nominput").value = tFeature.properties.name;
			  document.getElementById("Commentinput").value = tFeature.properties.comment;
			  document.getElementById("Dateinput").value = tFeature.properties.added;
			  document.getElementById("Xinput").value = tFeature.geometry.coordinates[0];
			  document.getElementById("Yinput").value = tFeature.geometry.coordinates[1];
			  // document.getElementById("formulaireAjouter").style.visibility = "visible";
			  dc="addone";
			  dcsave=tempFeature;
		  }
		  else if (mode==="edit") {
			  // pour modifier un objet
			  var test_true=false;
			  // Ouvrages_Layer.setStyle(Point_style_Ouvrages);
			  this.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
				  if(layer == Ouvrages_Layer) {
					  // Nettoyage si on a sélectionné un point du layer
					  dc="none";
					  if (tempFeature) {obsLayer.getSource().clear(tempFeature);}
					  if (editedFeature) { editedFeature.setStyle(Point_style_Ouvrages);}
					  document.getElementById("IDinput").value=feature.getProperties().id;
					  document.getElementById("Nominput").value=feature.getProperties().name;
					  document.getElementById("Commentinput").value=feature.getProperties().comment;
					  document.getElementById("Xinput").value=feature.getProperties().geometry.getCoordinates()[0];
					  document.getElementById("Yinput").value=feature.getProperties().geometry.getCoordinates()[1];
					  document.getElementById("Dateinput").value=feature.getProperties().added.substring(0,10);
					  editedFeature=feature;
					  test_true=true;
					  editedFeature.setStyle(Point_modsup);
					  return;
				  }
			  });
			  if (test_true===false && document.getElementById("IDinput").value) {
				  // console.log("nouveau point");
				  // c'est un nouveau point
				  if(dc==="addone") {
					  obsLayer.getSource().clear(dcsave);
				  }
			  
				  var reader = new ol.format.GeoJSON();
				  tempFeature = reader.readFeature(tFeature);
				  obsLayer.getSource().addFeature(tempFeature);
			  
				  document.getElementById("Xinput").value=tFeature.geometry.coordinates[0];
				  document.getElementById("Yinput").value=tFeature.geometry.coordinates[1];
			  
				  dc="addone";
			  }
		  }
		  else if (mode==="del") {
			  // ce serait bien de mettre les champs non modifiables
			  // pour supprimer un objet
			  this.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
				  if(layer == Ouvrages_Layer) {
					  if (editedFeature) { editedFeature.setStyle(Point_style_Ouvrages);}
					  document.getElementById("IDinput").value=feature.getProperties().id;
					  document.getElementById("Nominput").value=feature.getProperties().name;
					  document.getElementById("Commentinput").value=feature.getProperties().comment;
					  document.getElementById("Xinput").value=feature.getProperties().geometry.getCoordinates()[0];
					  document.getElementById("Yinput").value=feature.getProperties().geometry.getCoordinates()[1];
					  document.getElementById("Dateinput").value=feature.getProperties().added.substring(0,10);
					  editedFeature=feature;
					  editedFeature.setStyle(Point_modsup);
					  return;
				  }
			  });
		  }
		  else {
			  // on clean si le click se fait dans le vide
			  infobox_overlay.setPosition(undefined);
			  // et on clean le point
			  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
			  document.getElementById("IDinput").value = '';
			  document.getElementById("Nominput").value = '';
			  document.getElementById("Commentinput").value = '';
			  document.getElementById("Dateinput").value = '';
			  document.getElementById("Xinput").value = '';
			  document.getElementById("Yinput").value = '';
			  this.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
				  if(layer == Ouvrages_Layer) {
					  document.getElementById("infoID").innerHTML=feature.getProperties().id;
					  document.getElementById("infoNom").innerHTML=feature.getProperties().name;
					  document.getElementById("infoComment").innerHTML=feature.getProperties().comment;
					  document.getElementById("infoX").innerHTML=feature.getProperties().geometry.getCoordinates()[0];
					  document.getElementById("infoY").innerHTML=feature.getProperties().geometry.getCoordinates()[1];
					  document.getElementById("infoDate").innerHTML=feature.getProperties().added;
					  document.getElementById("infoImage").innerHTML=feature.getProperties().image;
					  // On rend l'infobox visible finalement
					  document.getElementById("infobox").style.visibility="visible";
					  infobox_overlay.setPosition(feature.getProperties().geometry.getCoordinates());
					  // et on colorie le point
					  feature.setStyle(Point_modsup);					  
					  // On prépare déjà les données si on veut les ajouter ou éditer ensuite
					  document.getElementById("IDinput").value=feature.getProperties().id;
					  document.getElementById("Nominput").value=feature.getProperties().name;
					  document.getElementById("Commentinput").value=feature.getProperties().comment;
					  document.getElementById("Xinput").value=feature.getProperties().geometry.getCoordinates()[0];
					  document.getElementById("Yinput").value=feature.getProperties().geometry.getCoordinates()[1];
					  document.getElementById("Dateinput").value=feature.getProperties().added.substring(0,10);
					  editedFeature=feature;
					  return;
				  }
			  });
		  }
	  };
	  
	  // Ajout de la couche ouvrages des observations
	  Ouvrages_Layer = new ol.layer.Vector({
		  style: Point_style_Ouvrages,
		  source: new ol.source.Vector({
			  format: new ol.format.GeoJSON(),
			  projection: 'EPSG:4326'
		  })
	  });
	  
	  // map.addLayer(Ouvrages_Layer);
	  addObservations();
	  
	  // Affichage des objets ouvrages des observations
	  function addObservations() {
		  var request = window.superagent;
		  request
			.get('/form')
			.end(function(err,res) {
				if (err) {
					console.log('Erreur de connexion au serveur, ' + err.message);
				}
				if (res.status !== 200) {
					console.log(res.text);
				}
				// var data = JSON.parse(res.text);
				var data = res.body;
				// console.log(res.body[0].geometry.coordinates[0]); // exemple
				for (i=0; i<data.length; i++) {
					var geojsonFeature = {
						"type": "Feature",
						"properties": {
							"id": data[i]._id,
							"name": data[i].properties.name,
							"comment": data[i].properties.comment,
							"added": data[i].properties.added.substring(0,10),
							"image": data[i].properties.image,
						},
						"geometry": {
							"type": "Point",
							"coordinates": [
								Number(data[i].geometry.coordinates[0]),
								Number(data[i].geometry.coordinates[1])]
						}
					};
					// console.log(geojsonFeature);
					var reader = new ol.format.GeoJSON();
					var olFeature = reader.readFeature(geojsonFeature);
					Ouvrages_Layer.getSource().addFeature(olFeature);
				}
			});
	  }
	  
	  // Affichage des pays pour tester
	  var style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#319FD3',
          width: 2
        }),
        text: new ol.style.Text({
          font: '12px Calibri,sans-serif',
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        })
      });
	  
	  var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          url: 'https://openlayers.org/en/v4.6.4/examples/data/geojson/countries.geojson',
          format: new ol.format.GeoJSON()
        }),
        style: function(feature) {
          style.getText().setText(feature.get('name'));
          return style;
        }
      });
	  // map.addLayer(vectorLayer);
	  
	  // définit le style du texte affiché
      /* var highlightStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#f00',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,0,0,0.1)'
        }),
        text: new ol.style.Text({
          font: '12px Calibri,sans-serif',
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#f00',
            width: 3
          })
        })
      });

      var featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector(),
        map: map,
        style: function(feature) {
          return highlightStyle;
        }
      });

      var highlight;
      var displayFeatureInfo = function(pixel) {

        var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        });

		// définit la composition du texte affiché -> infobulle
        var info = document.getElementById('info');
        if (feature) {
          info.innerHTML = feature.getId() + ': ' + feature.get('name');
        } else {
          info.innerHTML = '&nbsp;';
        }

        if (feature !== highlight) {
          if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
          }
          if (feature) {
            featureOverlay.getSource().addFeature(feature);
          }
          highlight = feature;
        }

      };

      map.on('pointermove', function(evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel);
      });

      map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel);
      }); */
	  
	  // Visibilité des couches
	  var first=true; // first car il y avait un bug lorsqu'on prend direct la prama visibility
	  document.getElementById("AffichButton").onclick=couches;
	  function couches() {
		  if (document.getElementById("ListeCouches").style.visibility==="hidden" || first) {
			  document.getElementById("ListeCouches").style.visibility="visible";
			  first=false;
		  } else {
			  document.getElementById("ListeCouches").style.visibility="hidden";
		  }
	  }
	  document.getElementById("box_routes").onclick=routes_details;
	  function routes_details() {
		  if (document.getElementById("box_routes").checked==true) {
			  // on affiche la couche routes
			  map.addLayer(Routes_Import);
		  } else {
			  // on désaffiche la couche routes
			  map.removeLayer(Routes_Import);
		  }
	  }
	  document.getElementById("box_pistes").onclick=pistes_details;
	  function pistes_details() {
		  if (document.getElementById("box_pistes").checked==true) {
			  // on affiche la couche pistes
			  map.addLayer(Pistes_Import);
		  } else {
			  // on désaffiche la couche pistes
			  map.removeLayer(Pistes_Import);
		  }
	  }
	  document.getElementById("box_ouvrages").onclick=ouvrages_details;
	  function ouvrages_details() {
		  if (document.getElementById("box_ouvrages").checked==true) {
			  // on affiche la couche ouvrages
			  map.addLayer(Ouvrages_Layer);
			  // on affiche les boutons
			  document.getElementById("button").style.visibility="visible";
		  } else {
			  // on désaffiche la couche ouvrages
			  map.removeLayer(Ouvrages_Layer);
			  // on enlève les boutons
			  document.getElementById("button").style.visibility="hidden";
			  // on clean tout tout tout
			  mode="none";
			  this.style.color="white";
			  this.style.backgroundColor="#4CAF50";
			  map.removeLayer(obsLayer);
			  document.getElementById("formulaireAjouter").style.visibility="hidden";
			  document.getElementById("editButton").style.color="white";
			  document.getElementById("editButton").style.backgroundColor="#4CAF50";
			  document.getElementById("delButton").style.color="white";
			  document.getElementById("delButton").style.backgroundColor="#4CAF50";
			  // On vide le formulaire éviter les problèmes si on passe en édition
			  document.getElementById("IDinput").value = '';
			  document.getElementById("Nominput").value = '';
			  document.getElementById("Commentinput").value = '';
			  document.getElementById("Dateinput").value = '';
			  document.getElementById("Xinput").value = '';
			  document.getElementById("Yinput").value = '';
			  document.getElementById("IDinput").style.backgroundColor = '';
			  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
			  // On affiche le boutton save et cache le delete
			  document.getElementById("SaveButton").type="button";
			  document.getElementById("DeleteButton").type="hidden";
		  }
	  }
	  document.getElementById("carte1").onclick=pays_limits;
	  function pays_limits() {
		  if (document.getElementById("carte1").checked==true) {
			  // on affiche la couche des pays
			  map.addLayer(vectorLayer);
		  } else {
			  // on désaffiche la couche ouvrages
			  map.removeLayer(vectorLayer);
			  document.getElementById("carte1").checked==false;
		  }
	  }
	  document.getElementById("carte2").onclick=satellite;
	  function satellite() {
		  if (document.getElementById("carte2").checked==true) {
			  // on affiche la couche des pays
			  map.addLayer(bing);
			  map.removeLayer(raster);
		  } else {
			  // on désaffiche la couche ouvrages
			  map.addLayer(raster);
			  map.removeLayer(bing);
		  }
	  }
	  // gestion de l'ordre de superposition des couches
	  obsLayer.setZIndex(20);
	  Ouvrages_Layer.setZIndex(15)
	  Routes_Import.setZIndex(9);
	  Pistes_Import.setZIndex(8);
	  vectorLayer.setZIndex(5);
	  
	});