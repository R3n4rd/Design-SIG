	  var tempFeature;
	  var obsLayer;
	  var dc="none"; // pour les points éviter double clic
	  var dcsave;


	  var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
      });

	  var Point_style = new ol.style.Style({
		  image: new ol.style.Circle({
			  radius: 5,
			  fill: new ol.style.Fill({color: 'red'}),
			  stroke: new ol.style.Stroke({color: 'black', width: 0})
		  })
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
	$(document).ready(function(){
		  
      var map = new ol.Map({
        layers: [raster],
        target: 'map',
        view: new ol.View({
          center: [-11000000, 4600000],
          zoom: 4
        })
      });

      // map.addInteraction(new ol.interaction.Draw({
        // source: source,
        // type: /** @type {ol.geom.GeometryType} */ ('LineString')
      // }));
	  
	  // gestion du fonctionnement des boutons add et modify
	  var mode = "none";
	  function setMode() {
		  if (this.id == "addButton" && mode!="edit") {
			  if(mode=="add") {
				  mode="none";
				  this.style.color="white";
				  this.style.backgroundColor="#4CAF50";
				  // pour s'amuser
				  // map.addLayer(vectorLayer);
				  map.removeLayer(obsLayer);
				  document.getElementById("formulaireAjouter").style.visibility="hidden";
				  document.getElementById("editButton").style.color="white";
				  document.getElementById("editButton").style.backgroundColor="#4CAF50";
			  }
			  else {
				  mode="add";
				  this.style.color="red";
				  this.style.backgroundColor="yellow";
				  // pour s'amuser
				  // map.removeLayer(vectorLayer);
				  map.addLayer(obsLayer);
				  document.getElementById("formulaireAjouter").style.visibility="visible";
				  document.getElementById("editButton").style.color="black";
				  document.getElementById("editButton").style.backgroundColor="grey";
			  }
		  }
		  else if (this.id == "editButton" && mode!="add") {
			  if(mode=="edit") {
				  mode="none";
				  this.style.color="white";
				  this.style.backgroundColor="#4CAF50";
				  document.getElementById("addButton").style.color="white";
				  document.getElementById("addButton").style.backgroundColor="#4CAF50";
				  // incroyable : https://openlayers.org/en/latest/examples/draw-and-modify-features.html
			  }
			  else {
				  mode="edit";
				  this.style.color="red";
				  this.style.backgroundColor="yellow";
				  document.getElementById("addButton").style.color="black";
				  document.getElementById("addButton").style.backgroundColor="grey";
			  }
		  }
	  };
	  // en attendant de s'occuper de ce cas on grise
	  document.getElementById("delButton").style.color="black";
	  document.getElementById("delButton").style.backgroundColor="grey";
	  
	  // Ajout de la couche "observations"
	  obsLayer = new ol.layer.Vector({
		  style: Point_style,
		  source: new ol.source.Vector({
			  format: new ol.format.GeoJSON(),
			  projection: 'EPSG:4326'
		  })
	  });
	  
	  document.getElementById("addButton").onclick=setMode;
	  document.getElementById("editButton").onclick=setMode;
	  
	  map.on('click', mapClick);
	  
	  // Arrêter un ajout
	  document.getElementById("CancelButton").onclick=cancelform;
	  function cancelform() {
		  mode="none";
		  document.getElementById("addButton").style.color="black";
			  document.getElementById("Nominput").value = '';
			  document.getElementById("Commentinput").value = '';
			  document.getElementById("Dateinput").value = '';
			  document.getElementById("Xinput").value = '';
			  document.getElementById("Yinput").value = '';
		  document.getElementById("formulaireAjouter").style.visibility="hidden";
		  obsLayer.getSource().removeFeature(tempFeature);
		  dc="none";
		  map.removeLayer(obsLayer);
		  // cool : https://gis.stackexchange.com/questions/126909/remove-selected-feature-openlayers-3
	  }
	  
	  // document.getElementById("SaveButton").onclick=function() {saveform(onsaved)};
	  
	  // ce qui est fait lorsqu'une observation a été stockée sur BD Mongo
	  /*function onsaved(arg, msg) {
		  if(arg==null){
			  console.log(msg);
		  }
		  else {
			  if(mode=='add') { tempFeature._id = rg._id; }
		  }
		  document.getElementById("addButton").style.color="black";
		  document.getElementById("editButton").style.color="black";
		  document.getElementById("form").style.visibility="collapse";
	  }
	  
	  // ce qui est fait lorsque le bouton "sauver" est cliqué
	  function saveform(callbak) {
		savedata(callback);
	  }
	  
	  */
	  
	  // ce qui est fait lorsque le bouton "sauver" est cliqué
	  /*function savedata(callback) {
		var request = window.superagent; // superagent attention
		var observation = { id:document.getElementById("IDinput").value,
							name:document.getElementById("nameinput").value,
							comment:document.getElementById("commentinput").value,
							added:document.getElementById("dateinput").value,
							image:null,
							geometry; {type:"point", coordinates: [
								document.getElementById("Xinput").value,
							document.getElementById("Yinput").value]},
						  };
		if(mode==='add') 
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
					var jsonResp = JSON.parse(res.text);
					callback(jsonResp);
				});
	  } */
	  
	  function mapClick(e) {
		  if(mode==="add") {
			  if(dc==="addone") {
				  obsLayer.getSource().removeFeature(dcsave);
			  }
			  var tFeature = {
				  'type': 'Feature',
				  'properties':{
					  'name': 'new name',
					  'comment': 'no comment',
					  'added': '',
					  'image': ''
				  },
				  'geometry': {
					  'type': 'Point',
					  'coordinates': e.coordinate
				  }
			  };
			  var reader = new ol.format.GeoJSON();
			  tempFeature = reader.readFeature(tFeature);
			  obsLayer.getSource().addFeature(tempFeature);
			  
			  document.getElementById("Nominput").value = tFeature.properties.name;
			  document.getElementById("Commentinput").value = tFeature.properties.comment;
			  document.getElementById("Dateinput").value = tFeature.properties.added;
			  document.getElementById("Xinput").value = tFeature.geometry.coordinates[0];
			  document.getElementById("Yinput").value = tFeature.geometry.coordinates[1];
			  document.getElementById("formulaireAjouter").style.visibility = "visible";
			  dc="addone";
			  dcsave=tempFeature;
		  }
	  };
	  
	  // Affichage des pays pour tester...............
	  var style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({
          color: '#319FD3',
          width: 1
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
      var highlightStyle = new ol.style.Style({
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

		// définit la composition du texte affiché
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
      }); 

	  // cache et affiche le formulaire
	  /*document.getElementById("addButton").onclick=cheval;
	  function cheval() {
			  document.getElementById("formulaire").style.visibility="hidden";
	  }
	  document.getElementById("editButton").onclick=piano;
	  function piano() {
			  document.getElementById("formulaire").style.visibility="visible";
	  } */
	  
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
			  map.addLayer(vectorLayer);
		  } else {
			  // on désaffiche la couche routes
			  map.removeLayer(vectorLayer);
		  }
	  }
	  document.getElementById("box_pistes").onclick=pistes_details;
	  function pistes_details() {
		  if (document.getElementById("box_pistes").checked==true) {
			  // on affiche la couche routes
		  } else {
			  // on désaffiche la couche routes
		  }
	  }
	  document.getElementById("box_ouvrages").onclick=ouvrages_details;
	  function ouvrages_details() {
		  if (document.getElementById("box_ouvrages").checked==true) {
			  // on affiche la couche routes
		  } else {
			  // on désaffiche la couche routes
		  }
	  }
	  
	});

	  
	  
	  