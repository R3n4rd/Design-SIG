	 
	// Liens intéressants
	// cool : https://gis.stackexchange.com/questions/126909/remove-selected-feature-openlayers-3
	// Draw and Modify Features : https://openlayers.org/en/latest/examples/draw-and-modify-features.html

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
          url: 'countries',
          format: new ol.format.GeoJSON()
        }),
        style: function(feature) {
          style.getText().setText(feature.get('name'));
          return style;
        }
      });
	  
	  // Points pour les capitales d'Argentine
	  var vectorCapitales = new ol.layer.Vector({
	    source: new ol.source.Vector({
		  url: 'capitales_amerique_sud',
		  format: new ol.format.GeoJSON()
        }),
		style: function(feature) {
          style.getText().setText(feature.get('nombre'));
          return style;
        }
      });

      var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: 'https://openlayers.org/en/v4.4.2/examples/data/icon.png'
        }))
      });

      vectorCapitales.setStyle(iconStyle);
	  
	  var osmSource = new ol.source.OSM();

	  // affiche la map
      var map = new ol.Map({
        layers: [vectorLayer,
          new ol.layer.Tile({
            source: osmSource
          }),
          new ol.layer.Tile({
            source: new ol.source.TileDebug({
              projection: 'EPSG:3857',
              tileGrid: osmSource.getTileGrid()
            })
          }),
		  vectorCapitales
		],
        target: 'map',
        controls: ol.control.defaults({
          attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
			})
        }),
        view: new ol.View({
          center: ol.proj.transform(
              [-65.2,-36.1], 'EPSG:4326', 'EPSG:3857'),
          zoom: 4
        })
      });

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

		// déifini la composition du texte affiché
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
	  
	  // suite capitales pour pop-up
      /* var element = document.getElementById('popup');

      var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -50]
      });
      map.addOverlay(popup);

	  // display popup on click
      map.on('click', function(evt) {
        var feature2 = map.forEachFeatureAtPixel(evt.pixel,
            function(feature2) {
              return feature2;
            });
        if (feature2) {
          var coordinates = feature2.getGeometry().getCoordinates();
          popup.setPosition(coordinates);
          $(element).popover({
            'placement': 'top',
            'html': true,
            'content': feature2.get('name')
          });
          $(element).popover('show');
        } else {
          $(element).popover('destroy');
        }
      });

      // change mouse cursor when over marker
      map.on('pointermove', function(e) {
        if (e.dragging) {
          $(element).popover('destroy');
          return;
        }
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        map.getTarget().style.cursor = hit ? 'pointer' : '';
      }); */
	  
	  	  // Test pour afficher des lignes avec coordonnées
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
	  
	  // création de la map ...
	  
	  // map.addInteraction(new ol.interaction.Draw({
        // source: source,
        // type: /** @type {ol.geom.GeometryType} */ ('LineString')
      // }));
	  
	  
	  	  // Pour highlight les pays afficher leur nom
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
	  