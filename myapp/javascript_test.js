var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
      });

      var source = new ol.source.Vector();

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
      });

      var map = new ol.Map({
        layers: [raster, vector],
        target: 'map',
        view: new ol.View({
          center: [-11000000, 4600000],
          zoom: 4
        })
      });

      map.addInteraction(new ol.interaction.Draw({
        source: source,
        type: /** @type {ol.geom.GeometryType} */ ('LineString')
      }));
	  
	  // gestion du fonctionnement des boutons add et modify
	  var mode = "none";
	  function setMode() {
		  if (this.id == "addButton") {
			  document.getElementById("editButton").style.color="black";
			  if(mode=="add") {
				  mode="none";
				  this.style.color="black";
			  }
			  else {
				  mode="edit";
				  this.style.color="red";
			  }
		  }
		  else if (this.id == "editButton") {
			  document.getElementById("addButton").style.color="black";
			  if(mode=="edit") {
				  mode="none";
				  this.style.color="black";
			  }
			  else {
				  mode="edit";
				  this.style.color="red";
			  }
		  }
	  };
	  
	  document.getElementById("addButton").onclick=setMode;
	  document.getElementById("editButton").onclick=setMode;
	  
	  // ajout de la couche "observations"
	  obsLayer = new ol.layer.Vector({
		  style: Point_style,
		  source: new ol.source.Vector({
			  format: new ol.format.GeoJSON(),
			  projection: 'EPSG:4326'
		  })
	  });
	  map.addLayer(obsLayer);
	  
	  document.getElementById("addButton").onclick=setMode;
	  document.getElementById("editButton").onclick=setMode;
	  map.on('click', mapClick);
	  
	  function mapClick(e) {
		  if(mode==="add") {
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
					  'coordinates': e.coordinae
				  }
			  };
			  var reader = new ol.format.GeoJSON();
			  tempFeature = reader.readFeature(tFeature);
			  obsLayer.getSource().addFeature(tempFeature);
			  
			  document.getElementById("nameinput").value = tFeature.propeties.name;
			  document.getElementById("commentinput").value = tFeature.propeties.comment;
			  document.getElementById("dateinput").value = tFeature.propeties.added;
			  document.getElementById("Xinput").value = tFeature.geometry.coordinates[0];
			  document.getElementById("Yinput").value = tFeature.geometry.coordinates[1];
			  document.getElementById("form").style.visibility = "visible";
		  }
	  };




	  

	  
	  
	  