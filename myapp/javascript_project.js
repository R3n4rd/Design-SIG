	  // variables diverses
	  var tempFeature;
	  var editedFeature;
	  var obsLayer;
	  var dc="none"; // Contrôle pour les points éviter double clic
	  var dcsave; // Sauvegarde temporaire d'une tempFeature
	  
	  // Traitement d'une image du formulaire
	  function onFileSelected(event) {
		  // Il faudrait un regex pour controller le nom et l'extension
		  var selectedFile = event.target.files[0];
		  if (selectedFile) {
			  var reader = new FileReader();
			  var imgtitle = selectedFile.name;
			  reader.onload = function(event) {
				  var imgwidth; var imgheight;
				  var maxwidth = 147; var maxheight = 55;
				  var imgsrc = event.target.result;
				  var image = new Image();
				  image.src = imgsrc;
				  image.onload = function () {
					  var sourcewidth = this.width;
					  var sourceheight = this.height;
					  if (sourcewidth>maxwidth) {
						  imgheight=sourceheight/(sourcewidth/maxwidth); imgwidth=maxwidth;
						  if (imgheight>maxheight) {
							  imgwidth=imgwidth/(imgheight/maxheight); imgheight=maxheight;
						  }
					  } else if (sourceheight>maxheight) {
						  imgwidth=sourcewidth/(sourceheight/maxheight); imgheight=maxheight;
						  if (imgwidth>maxwidth) {
							  imgheighth=imgheight/(imgwidth/maxwidth); imgwidth=maxwidth;
						  }
					  }
					  // Affichge de l'image sur le formulaire
					  document.getElementById("boximage").innerHTML = "<img src="+imgsrc+" alt="+imgtitle+" width="+imgwidth+" height="+imgheight+">";
					  // on pourrait mettre un onclick sur l'image pour la voir en grand
				  }
			  };
			  reader.readAsDataURL(selectedFile);
		  } else {
			  event.target.value = '';
		  }
	  }
	
	// Ready
	$(document).ready(function(){
	  
	  // Style des points d'observation
	  var Point_style = new ol.style.Style({
		  image: new ol.style.Circle({
			  radius: 5,
			  fill: new ol.style.Fill({color: 'red'}),
			  stroke: new ol.style.Stroke({color: 'black', width: 0})
		  })
	  });
	  
	  // Style points en cours de modificaiton ou suppression
	  var Point_modsup = new ol.style.Style({
		  image: new ol.style.Circle({
			  radius: 5,
			  fill: new ol.style.Fill({color: 'yellow'}),
			  stroke: new ol.style.Stroke({color: 'black', width: 0})
		  })
	  });
	  
	  // Style des points des ouvrages
	  var Point_style_Ouvrages = new ol.style.Style({
		  image: new ol.style.Circle({
			  radius: 5,
			  fill: new ol.style.Fill({color: 'black'}),
			  stroke: new ol.style.Stroke({color: 'black', width: 0})
		  })
	  });
	  
	  // Style Routes et Pistes
	  var Routes = new ol.style.Style({
		  fill: new ol.style.Fill({color:'rgba(200,10,10,0.2)',width:4}),
		  stroke: new ol.style.Stroke({color:'rgba(255,0,0,1)',width:1}),			  
	  });
	  
	  var Pistes = new ol.style.Style({
		  fill: new ol.style.Fill({color:'rgba(200,10,10,0.2)',width:2}),
		  stroke: new ol.style.Stroke({color:'rgba(204,204,0,1)',width:1}),			  
	  });
	  
	  // Style des pays en surcouche
	  var style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#319FD3',
          width: 2
        }),
        text: new ol.style.Text({
          font: '16px Calibri,sans-serif',
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        })
      });
	  
	  // Import routesLL et pistesLL
	  var Routes_Import = new ol.layer.Vector({
		  style: Routes,
		  source: new ol.source.Vector({
			  // url: '/jsonmap/routesLL',
			  format: new ol.format.GeoJSON(),
			  projection: myProjectionName
		  })
	  });
	  
	  var Pistes_Import = new ol.layer.Vector({
		  style: Pistes,
		  source: new ol.source.Vector({
			  // url: '/jsonmap/pistesLL',
			  format: new ol.format.GeoJSON(),
			  projection: myProjectionName
		  })
	  });
	  
	  // carte de base
	  var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
      });
	  
	  // Ajout de la couche Observations
	  obsLayer = new ol.layer.Vector({
		  style: Point_style,
		  source: new ol.source.Vector({
			  format: new ol.format.GeoJSON(),
			  projection: myProjectionName
		  })
	  });
	  
	  // Ajout de la couche Ouvrages des observations
	  Ouvrages_Layer = new ol.layer.Vector({
		  style: Point_style_Ouvrages,
		  source: new ol.source.Vector({
			  format: new ol.format.GeoJSON(),
			  projection: myProjectionName
		  })
	  });
	  
	  // Carte Bing pour image satellite
	  var bing = new ol.layer.Tile({
        source: new ol.source.BingMaps({
          key: 'AjszTerrqnhuyrJY2xP9yRNJazKVcNdRGmgsBpzxfNUFRPgSMB5n2MJ6dEPyYO1t',
          imagerySet: 'Aerial'
        })
      });
	  
	  // Couche des limites des pays
	  var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          // url: 'https://openlayers.org/en/v4.6.4/examples/data/geojson/countries.geojson',
          url: '/countries',
		  format: new ol.format.GeoJSON()
        }),
        style: function(feature) {
          style.getText().setText(feature.get('name'));
          return style;
        }
      });
	  
	  // Overlay pour le popup
	  var infobox_overlay = new ol.Overlay({
		  element: document.getElementById("infobox"),
		  autoPan: true,
		  autoPanAnimation: {
			  duration: 250
		  }
	  });	

	  // Création de la carte avec projection perso
	  var myProjectionName = 'EPSG:32630';
	  proj4.defs(myProjectionName, '+proj=utm +zone=30 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ');
	  var myProjection = ol.proj.get(myProjectionName)

      var map = new ol.Map({
        layers: [raster],
		overlays: [infobox_overlay],
        target: 'map',
        view: new ol.View({
		  projection: myProjection,
          center: ol.proj.transform([-200000, 1400000], 'EPSG:3857', myProjectionName),
          zoom: 7
        })
      });
	  
	  // gestion du fonctionnement des boutons add et modify
	  var mode = "none";
	  function setMode() {
		  // console.log(infobox_overlay.getPosition()); // S'il y a une infox, il y a un point sélectionné
		  if (this.id == "addButton" && mode!="edit" && mode!="del") {
			  if(mode=="add") {
				  mode="none";
				  // this.style.color="white";
				  // this.style.backgroundColor="#4CAF50";
				  map.removeLayer(obsLayer);
				  document.getElementById("formulaireAjouter").style.visibility="hidden";
				  /* document.getElementById("editButton").style.color="white";
				  document.getElementById("editButton").style.backgroundColor="#4CAF50";
				  document.getElementById("delButton").style.color="white";
				  document.getElementById("delButton").style.backgroundColor="#4CAF50"; */
				  // On vide le formulaire éviter les problèmes si on passe en édition
				  document.getElementById("IDinput").value = '';
				  document.getElementById("Nominput").value = '';
				  document.getElementById("Commentinput").value = '';
				  document.getElementById("Dateinput").value = '';
				  document.getElementById("Xinput").value = '';
				  document.getElementById("Yinput").value = '';
				  document.getElementById("IDinput").style.backgroundColor = '';
				  document.getElementById("boximage").innerHTML="";
				  document.getElementById("ImageButton").value="";
				  if (tempFeature) {obsLayer.getSource().clear(tempFeature); tempFeature=null;}
			  }
			  else {
				  mode="add";
				  // this.style.color="red";
				  // this.style.backgroundColor="yellow";
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
				  document.getElementById("boximage").innerHTML="";
				  document.getElementById("ImageButton").value="";
			  }
			  // on clean si la infobox est visible
			  infobox_overlay.setPosition(undefined);
			  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
			  // On affiche le boutton save et cache le delete
			  document.getElementById("SaveButton").type="button";
			  document.getElementById("DeleteButton").type="hidden";
		  }
		  else if (this.id == "editButton" && mode!="add" && mode!="del") {
			  if(mode=="edit" || infobox_overlay.getPosition()==undefined) {
				  mode="none";
				  this.style.color="black";
				  this.style.backgroundColor="grey";
				  map.removeLayer(obsLayer);
				  document.getElementById("formulaireAjouter").style.visibility="hidden";
				  document.getElementById("addButton").style.color="white";
				  document.getElementById("addButton").style.backgroundColor="#4CAF50";
				  /* document.getElementById("delButton").style.color="white";
				  document.getElementById("delButton").style.backgroundColor="#4CAF50";*/
				  // On vide le formulaire éviter les problèmes si on quitte l'édition
				  document.getElementById("IDinput").value = '';
				  document.getElementById("Nominput").value = '';
				  document.getElementById("Commentinput").value = '';
				  document.getElementById("Dateinput").value = '';
				  document.getElementById("Xinput").value = '';
				  document.getElementById("Yinput").value = '';
				  document.getElementById("IDinput").style.backgroundColor = '';
				  document.getElementById("boximage").innerHTML="";
				  document.getElementById("ImageButton").value="";
				  if (tempFeature) {obsLayer.getSource().clear(tempFeature); tempFeature=null;}
				  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
			  }
			  else {
				  mode="edit";
				  // this.style.color="red";
				  // this.style.backgroundColor="yellow";
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
			  if(mode=="del" || infobox_overlay.getPosition()==undefined) {
				  mode="none";
				  // On affiche le boutton save et cache le delete
				  document.getElementById("SaveButton").type="button";
				  document.getElementById("DeleteButton").type="hidden";
				  this.style.color="black";
				  this.style.backgroundColor="grey";
				  document.getElementById("formulaireAjouter").style.visibility="hidden";
				  document.getElementById("addButton").style.color="white";
				  document.getElementById("addButton").style.backgroundColor="#4CAF50";
				  /* document.getElementById("editButton").style.color="white";
				  document.getElementById("editButton").style.backgroundColor="#4CAF50";*/
				  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
				  // remettre tous les champs en éditables
				  document.getElementById("Nominput").disabled = false;
				  document.getElementById("Commentinput").disabled = false;
				  document.getElementById("Dateinput").disabled = false;
				  document.getElementById("Xinput").disabled = false;
				  document.getElementById("Yinput").disabled = false;
				  document.getElementById("ImageButton").disabled = false;
				  // cases dégrisées
				  document.getElementById("Nominput").style.backgroundColor = "white";
				  document.getElementById("Commentinput").style.backgroundColor = "white";
				  document.getElementById("Dateinput").style.backgroundColor = "white";
				  document.getElementById("Xinput").style.backgroundColor = "white";
				  document.getElementById("Yinput").style.backgroundColor = "white";
				  document.getElementById("ImageButtonLabel").style.backgroundColor = "white";
			  }
			  else {
				  mode="del";
				  // On affiche le boutton delete et cache le save
				  document.getElementById("SaveButton").type="hidden";
				  document.getElementById("DeleteButton").type="button";
				  // this.style.color="red";
				  // this.style.backgroundColor="yellow";
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
				  // cases grisées
				  document.getElementById("Nominput").style.backgroundColor = "whitesmoke";
				  document.getElementById("Commentinput").style.backgroundColor = "whitesmoke";
				  document.getElementById("Dateinput").style.backgroundColor = "whitesmoke";
				  document.getElementById("Xinput").style.backgroundColor = "whitesmoke";
				  document.getElementById("Yinput").style.backgroundColor = "whitesmoke";
				  document.getElementById("ImageButtonLabel").style.backgroundColor = "whitesmoke";
			  }
			  // on clean si la infobox est visible
			  infobox_overlay.setPosition(undefined);
		  }
	  };
	  
	  document.getElementById("addButton").onclick=setMode;
	  document.getElementById("editButton").onclick=setMode;
	  document.getElementById("delButton").onclick=setMode;
	  
	  // Arrêter un ajout
	  document.getElementById("CancelButton").onclick=cancelform;
	  function cancelform() {
		  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
		  editedFeature=null;
		  onsaved(null,'cancelled');
	  }
	  
	  // Enregistrement d'un ajout de point
	  document.getElementById("SaveButton").onclick=checkform;
	  
	  // Eviter que des données manquent
	  function checkform() {
		  var err_form=0;
		  // réinitialise la couleur juste avant
		  document.getElementById("Nominput").style.backgroundColor="white";
		  document.getElementById("Xinput").style.backgroundColor="white";
		  document.getElementById("Yinput").style.backgroundColor="white";
		  var err_color='rgba(255, 0, 0, 0.2)';
		  if (document.getElementById("Nominput").value=="") {
			  document.getElementById("Nominput").style.backgroundColor=err_color;
			  err_form+=1;
		  }
		  if (document.getElementById("Xinput").value=="" || $.isNumeric(document.getElementById("Xinput").value)!=true) {
			  document.getElementById("Xinput").style.backgroundColor=err_color;
			  err_form+=1;
		  }
		  if (document.getElementById("Yinput").value=="" || $.isNumeric(document.getElementById("Yinput").value)!=true) {
			  document.getElementById("Yinput").style.backgroundColor=err_color;
			  err_form+=1;
		  }
		  if (err_form==0) {
			  saveform(onsaved);
		  } else {
			  if (err_form>1) {console.log("il y a "+err_form+" erreurs !");}
			  else {console.log("il y a 1 erreur !");}
		  }
	  }

	  // Restauration une fois un enregistrement ou une annulation effectué
	  function onsaved(arg, msg) {
		  if(arg==null){console.log(msg);}
		  
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
		  document.getElementById("boximage").innerHTML="";
		  document.getElementById("ImageButton").value="";
		  document.getElementById("formulaireAjouter").style.visibility="hidden";
		  
		  // remettre tous les champs en éditables
		  document.getElementById("Nominput").disabled = false;
		  document.getElementById("Commentinput").disabled = false;
		  document.getElementById("Dateinput").disabled = false;
		  document.getElementById("Xinput").disabled = false;
		  document.getElementById("Yinput").disabled = false;
		  document.getElementById("ImageButton").disabled = false;
		  
		  // boutons edit et del grisés tant qu'on pas un point sélectionné
		  document.getElementById("editButton").style.color="black";
		  document.getElementById("editButton").style.backgroundColor="grey";
		  document.getElementById("delButton").style.color="black";
		  document.getElementById("delButton").style.backgroundColor="grey";
		  
		  // cases dégrisées / dérougées
		  document.getElementById("Nominput").style.backgroundColor = "white";
		  document.getElementById("Commentinput").style.backgroundColor = "white";
		  document.getElementById("Dateinput").style.backgroundColor = "white";
		  document.getElementById("Xinput").style.backgroundColor = "white";
		  document.getElementById("Yinput").style.backgroundColor = "white";
		  document.getElementById("ImageButtonLabel").style.backgroundColor = "white";
		  
		  mode="none";
		  dc="none";
		  if (tempFeature) {obsLayer.getSource().clear(tempFeature); tempFeature=null;}
		  map.removeLayer(obsLayer);
	  }
	  
	  // Sauvegarde d'une point - partie 1
	  function saveform(callback) {
		  var files = document.getElementById("ImageButton").files;
		  if (files.length > 0) {
			  var file = files[0];
			  var request = window.superagent;
			  request
				  .post('/photos/ouvrages')
				  .attach('fileToUpload', file, file.name)
				  .end(function(err, res) {
					  if (res.status !== 200) {
						  return callback(null, res.text);
					  }
					  savedata(callback, res.body._id);
				  });
		  } else {
			  savedata(callback);
		  }
	  }
	  	  
	  // Sauvegarde d'une point - partie 2
	  function savedata(callback, _id) {
		var request = window.superagent; // superagent attention
		// contrôle de la date bien saisie
		if (document.getElementById("Dateinput").value=="") {document.getElementById("Dateinput").value="0001-01-01";}
		if (!_id && document.getElementById("img_id")) {_id=document.getElementById("img_id").title;}
		var observation = {
		"type": "Feature",
		"properties": {
			"id": document.getElementById("IDinput").value,
			"name": document.getElementById("Nominput").value,
			"comment": document.getElementById("Commentinput").value,
			"added": document.getElementById("Dateinput").value,
			"image": _id,
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
			// Attention : Lorsque l'image est modifiée il faudrait gérer la suppression des images du dossier uploads également
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
		}
		addObservations(); // on réactualise la carte avec le nouveau point
		// On nettoye les points
		if (tempFeature) {obsLayer.getSource().clear(tempFeature); tempFeature=null;}
		if (editedFeature) {Ouvrages_Layer.getSource().clear(editedFeature);}
	  }
	  
	  // Suppression d'un point
	  document.getElementById("DeleteButton").onclick=deletePoint;
	  
	  function deletePoint() {
		// Attention : Il faudrait gérer la suppression des images du dossier uploads également
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
	  
	  // Lors d'un clic sur la map
	  map.on('click', mapClick);
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
			  if(dc==="addone") {obsLayer.getSource().clear(dcsave);}
			  // on clean si on a déjà une tempFeature
			  if (tempFeature) {obsLayer.getSource().clear(tempFeature); tempFeature=null;}
			  
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
			  // on clean si on a déjà une tempFeature
			  if (tempFeature) {obsLayer.getSource().clear(tempFeature); tempFeature=null;}
			  // Ouvrages_Layer.setStyle(Point_style_Ouvrages);
			  this.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
				  if(layer == Ouvrages_Layer) {
					  // Nettoyage si on a sélectionné un point du layer
					  dc="none";
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
				  if(dc==="addone") {obsLayer.getSource().clear(dcsave);}
			  
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
			  // on désactive les boutons edit et del
			  document.getElementById("editButton").style.color="black";
			  document.getElementById("editButton").style.backgroundColor="grey";
			  document.getElementById("delButton").style.color="black";
			  document.getElementById("delButton").style.backgroundColor="grey";
			  // et on clean le point
			  if (editedFeature) {editedFeature.setStyle(Point_style_Ouvrages);}
			  document.getElementById("IDinput").value = '';
			  document.getElementById("Nominput").value = '';
			  document.getElementById("Commentinput").value = '';
			  document.getElementById("Dateinput").value = '';
			  document.getElementById("Xinput").value = '';
			  document.getElementById("Yinput").value = '';
			  document.getElementById("boximage").innerHTML="";
			  document.getElementById("ImageButton").value="";
			  // On ne veut que la 1ère feature sélectionnée
			  var feature_already_selected = false;
			  this.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
				  if(layer == Ouvrages_Layer && feature_already_selected == false) {
					  document.getElementById("infoID").innerHTML=feature.getProperties().id;
					  document.getElementById("infoNom").innerHTML=feature.getProperties().name;
					  document.getElementById("infoComment").innerHTML=feature.getProperties().comment;
					  document.getElementById("infoX").innerHTML=feature.getProperties().geometry.getCoordinates()[0];
					  document.getElementById("infoY").innerHTML=feature.getProperties().geometry.getCoordinates()[1];
					  document.getElementById("infoDate").innerHTML=feature.getProperties().added;
					  if (feature.getProperties().image != null) {
					  // Même pas besoin de request
					  /* var request = window.superagent;
						  request
							.get('/photos/ouvrages/'+feature.getProperties().image)
							.end(function(err,res) {
								if (err) {
									console.log('Erreur de connexion au serveur, ' + err.message);
								}
								if (res.status !== 200) {
									console.log(res.text);
								}
								// console.log(res);
								// console.log(res.req.url);
							}); */
						  // document.getElementById("infoImage").innerHTML=feature.getProperties().image;
						  var imgwidth; var imgheight;
						  var maxwidth = 280;
						  var imgsrc = "photos/ouvrages/"+feature.getProperties().image;
						  var image = new Image();
						  image.src = imgsrc;
						  image.onload = function () {
							  var sourcewidth = this.width;
							  var sourceheight = this.height;
							  imgheight=sourceheight/(sourcewidth/maxwidth); imgwidth=maxwidth;
							  // Affichge de l'image sur l'infobox
							  document.getElementById("infoImage").innerHTML = "<br /><img id='img_id' src='photos/ouvrages/"+feature.getProperties().image+"' title='"+feature.getProperties().image+"' width='"+imgwidth+"' height='"+imgheight+"'>";
							  // on pourrait mettre un onclick sur l'image pour la voir en grand
						  }
					  } else {document.getElementById("infoImage").innerHTML = "Pas d'image !";}
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
					  if (feature.getProperties().image != null) {
						  var imgwidth2; var imgheight2;
						  var maxwidth2 = 147; var maxheight2 = 55;
						  var image2 = new Image();
						  image2.src = imgsrc;
						  image2.onload = function () {
							  var sourcewidth = this.width;
							  var sourceheight = this.height;
							  if (sourcewidth>maxwidth2) {
								  imgheight2=sourceheight/(sourcewidth/maxwidth2); imgwidth2=maxwidth2;
								  if (imgheight2>maxheight2) {
									  imgwidth2=imgwidth2/(imgheight2/maxheight2); imgheight2=maxheight2;
								  }
							  } else if (sourceheight>maxheight2) {
								  imgwidth2=sourcewidth/(sourceheight/maxheight2); imgheight2=maxheight2;
								  if (imgwidth2>maxwidth2) {
									  imgheighth2=imgheight2/(imgwidth2/maxwidth2); imgwidth2=maxwidth2;
								  }
							  }
							  // Affichge de l'image sur le formulaire
							  document.getElementById("boximage").innerHTML = "<img id='img_id' src='"+imgsrc+"' title='"+feature.getProperties().image+"' width='"+imgwidth2+"' height='"+imgheight2+"'>";
						  }
					  } else {document.getElementById("boximage").innerHTML = "";}
					  editedFeature=feature;
					  // On a déjà notre feature
					  feature_already_selected = true;
					  // on active les boutons edit et del
					  document.getElementById("editButton").style.color="white";
					  document.getElementById("editButton").style.backgroundColor="#4CAF50";
					  document.getElementById("delButton").style.color="white";
					  document.getElementById("delButton").style.backgroundColor="#4CAF50";
					  return;
				  }
			  });
		  }
	  };
	  
	  // Mise à jour de la tempFeature si on modifie les coordonnées à la main
	  document.getElementById("Xinput").onchange=formeditpoint;
	  document.getElementById("Yinput").onchange=formeditpoint;		  
	  function formeditpoint() {
		  // console.log("mise à jour du point");
		  if (document.getElementById("Xinput").value && document.getElementById("Yinput").value) {
			  // console.log(tempFeature);
			  if (tempFeature) {
				  tempFeature.getGeometry().setCoordinates([document.getElementById("Xinput").value, document.getElementById("Yinput").value]);
			  } else {
				  // on ajoute une feature s'il n'y en a pas
				  var tFeature = {
					  '_id': '',
					  'type': 'Feature',
					  'properties':{
						  'id': '',
						  'name': 'name',
						  'comment': 'comment',
						  'added': '',
						  'image': ''
					  },
					  'geometry': {
						  'type': 'Point',
						  'coordinates': [document.getElementById("Xinput").value, document.getElementById("Yinput").value]
					  }
				  };				  
				  var reader = new ol.format.GeoJSON();
				  tempFeature = reader.readFeature(tFeature);
				  obsLayer.getSource().addFeature(tempFeature);
				  tempFeature.setStyle(Point_style);
			  }
		  }
	  }
	  
	  // Ajout des points et lignes des différentes couches
	  
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
					// olFeature.getGeometry().transform('EPSG:3857', myProjectionName)
					Ouvrages_Layer.getSource().addFeature(olFeature);
				}
			});
	  }
	  
	  add_Pistes();
	  function add_Pistes() {
		  var request = window.superagent;
		  request
			.get('/jsonmap/pistesLL')
			.end(function(err,res) {
				if (err) {
					console.log('Erreur de connexion au serveur, ' + err.message);
				}
				if (res.status !== 200) {
					console.log(res.text);
				}
				var data = res.body;
				for (i=0; i<data.length; i++) {
					var geojsonFeature = {
						"type": "Feature",
						"geometry": {
							"type": "LineString",
							"coordinates": data[i].geometry.coordinates
						}
					};
					var reader = new ol.format.GeoJSON();
					var olFeature = reader.readFeature(geojsonFeature);
					olFeature.getGeometry().transform('EPSG:4326', myProjectionName)
					Pistes_Import.getSource().addFeature(olFeature);
				}
		  });
	  }
	  
	  add_Routes();
	  function add_Routes() {
		  var request = window.superagent;
		  request
			.get('/jsonmap/routesLL')
			.end(function(err,res) {
				if (err) {
					console.log('Erreur de connexion au serveur, ' + err.message);
				}
				if (res.status !== 200) {
					console.log(res.text);
				}
				var data = res.body;
				for (i=0; i<data.length; i++) {
					var geojsonFeature = {
						"type": "Feature",
						"geometry": {
							"type": "MultiLineString",
							"coordinates": data[i].geometry.coordinates
						}
					};
					var reader = new ol.format.GeoJSON();
					var olFeature = reader.readFeature(geojsonFeature);
					olFeature.getGeometry().transform('EPSG:4326', myProjectionName)
					Routes_Import.getSource().addFeature(olFeature);
				}
		  });
	  }
	  
	  // Visibilité des couches
	  var first=true; // first car il y avait un bug lorsqu'on prend direct la prama visibility
	  document.getElementById("AffichButton").onclick=couches;
	  function couches() {
		  if (document.getElementById("ListeCouches").style.visibility==="hidden" || first) {
			  document.getElementById("ListeCouches").style.visibility="visible";
			  document.getElementById("AffichButton").innerHTML="Couches <<";
			  first=false;
		  } else {
			  document.getElementById("ListeCouches").style.visibility="hidden";
			  document.getElementById("AffichButton").innerHTML="Couches >>";
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
			  // boutons edit et del grisés tant qu'on pas un point sélectionné
			  document.getElementById("editButton").style.color="black";
			  document.getElementById("editButton").style.backgroundColor="grey";
			  document.getElementById("delButton").style.color="black";
			  document.getElementById("delButton").style.backgroundColor="grey";
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
			  // on clean si la infobox est visible
			  infobox_overlay.setPosition(undefined);
		  }
	  }
	  document.getElementById("carte1").onclick=pays_limits;
	  function pays_limits() {
		  if (document.getElementById("carte1").checked==true) {
			  // on affiche la couche des pays
			  map.addLayer(vectorLayer);
		  } else {
			  // on désaffiche la couche des pays
			  map.removeLayer(vectorLayer);
			  // document.getElementById("carte1").checked==false;
		  }
	  }
	  document.getElementById("carte2").onclick=satellite;
	  function satellite() {
		  if (document.getElementById("carte2").checked==true) {
			  // on affiche la map satellite
			  map.addLayer(bing);
			  map.removeLayer(raster);
		  } else {
			  // on désaffiche la map satellite
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
	  
	  // gestion du curseur de la souris
	  document.onclick=setpointer;
	  function setpointer() {
		  if (document.getElementById("editButton").style.backgroundColor==="grey") {
			  document.getElementById("editButton").style.cursor="default";
		  } else {
			  document.getElementById("editButton").style.cursor="pointer";
		  }
		  if (document.getElementById("addButton").style.backgroundColor==="grey") {
			  document.getElementById("addButton").style.cursor="default";
		  } else {
			  document.getElementById("addButton").style.cursor="pointer";
		  }
		  if (document.getElementById("delButton").style.backgroundColor==="grey") {
			  document.getElementById("delButton").style.cursor="default";
		  } else {
			  document.getElementById("delButton").style.cursor="pointer";
		  }
		  document.getElementById("CancelButton").style.cursor="pointer";
		  document.getElementById("SaveButton").style.cursor="pointer";
		  document.getElementById("DeleteButton").style.cursor="pointer";

		  // change mouse cursor when over marker
		  map.on('pointermove', function(e) {
			  var test_layer=false;
			  map.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
				  if (layer==Ouvrages_Layer && mode!="add") {
					  document.body.style.cursor="pointer"; test_layer=true;}
			  });
			  if (test_layer==false) {document.body.style.cursor="default";}
		  });
	  }
	});