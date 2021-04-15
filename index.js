//import { Deck } from '@deck.gl/core';
//import { MapboxLayer } from '@deck.gl/mapbox';
//import { ScatterplotLayer } from '@deck.gl/layers';
//import mapboxgl from 'mapbox-gl';
//const { MapboxLayer, Deck} = deck;
//new MapboxLayer(props);
const { MapboxLayer, ScatterplotLayer, GeoJsonLayer } = deck;
var bdItem 
var baItem

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFycnltMDEiLCJhIjoiY2tqdjB1MGlhMncxeDJycW52MzI4dWo1diJ9.yw_RD5ej1XYhyKoqtwgqKw';
const map = new mapboxgl.Map({
  style: 'mapbox://styles/harrym01/cknhckwbf0gaz17plvxuju29m',
  center: [-122.4, 37.79],
  zoom: 5, 
  container: 'map',
  antialias: true
});
map.addControl(new mapboxgl.NavigationControl())

// Holds visible airport features for filtering
var properties = [];
 
// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
closeButton: false
});
 
var filterEl = document.getElementById('feature-filter');
var listingEl = document.getElementById('feature-listing');
var rentPrices = [];

 
function renderListings(features) {

  var empty = document.createElement('p');
  var clearFilter = document.createElement('BUTTON');
  clearFilter.id = "clear";
  // Clear any existing listings
  listingEl.innerHTML = '';
  if (features.length) {
      features.forEach(function (feature) {
          var prop = feature.properties;
          rentPrices.push(prop.target_rent);
          var item = document.createElement('a');
          item.href = prop.wikipedia;
          item.target = '_blank';
          item.textContent = "price $" + prop.target_rent + ' (' + prop.status + ')';
          item.addEventListener('mouseover', function () {
              // Highlight corresponding feature on the map
              popup
                  .setLngLat(feature.geometry.coordinates)
                  .setText(
                      feature.properties.status +
                          ' (' +
                          feature.properties.target_rent +
                          ')'
                  )
                  .addTo(map);
          });
          listingEl.appendChild(item);
      });
      showAverageRent(rentPrices);
      showMedianRent(rentPrices);
      document.getElementById("numOfResults").innerHTML = features.length + " results";
      rentPrices.length = 0;
      // Show the filter input
      filterEl.parentNode.style.display = 'block';
  } else if ((features.length === 0 && filterEl.value !== '') || (bdItem != null || baItem != null && features.length == false)) {
      empty.textContent = 'No results found';
      clearFilter.innerHTML = "clear filter";
      listingEl.appendChild(empty);
      listingEl.appendChild(clearFilter);

      clearF = document.getElementById('clear');
clearF.addEventListener("click", function() {
  bdItem = null;
  bdName = null;

    var features = map.queryRenderedFeatures({ layers: ['unclustered-point'] });
    //var clustered_features = map.queryRenderedFeatures({ layers: ['clusters'] });
    console.log(features);
    if (features) {
    // Populate features for the listing overlay.
    renderListings(features);
     
    // Clear the input container
    filterEl.value = '';
     
    // Store the current features in sn `properties` variable to
    // later use for filtering on `keyup`.
    properties = features;
    }

})

  } else {
      empty.textContent = 'Drag the map to populate results';
      listingEl.appendChild(empty);

      // Hide the filter input
      filterEl.parentNode.style.display = 'none';

      // remove features filter
      map.setFilter('unclustered-point', ['has', 'property_external_key']);
  }

}



function showAverageRent(results){
  var total = 0;
  for(var i = 0; i < results.length; i++) {
    if(results[i] != 'null'){
      total += results[i];
    }

  }
  var avg = total / results.length;

  document.getElementById("averagePrice").innerHTML = "Mean: " + avg;
}

function showMedianRent(results){
  var median = 0
  var numsLen = results.length;
  var sortedPrice = results.sort();
  
    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        median = (sortedPrice[numsLen / 2 - 1] + sortedPrice[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = sortedPrice[(numsLen - 1) / 2];
    }

    document.getElementById("medianPrice").innerHTML = "Median: " + median;
}




function normalize(string) {
  console.log(string);
  //return string;
  }

  function normalize2(string) {

    return string;
    }



map.on('load', function () {

   //3d building code
   const firstLabelLayerId = map.getStyle().layers.find(layer => layer.type === 'symbol').id;

   map.addLayer({
     'id': '3d-buildings',
     'source': 'composite',
     'source-layer': 'building',
     'filter': ['==', 'extrude', 'true'],
     'type': 'fill-extrusion',
     'minzoom': 15,
     'paint': {
       'fill-extrusion-color': '#aaa',
 
       // use an 'interpolate' expression to add a smooth transition effect to the
       // buildings as the user zooms in
       'fill-extrusion-height': [
         "interpolate", ["linear"], ["zoom"],
         15, 0,
         15.05, ["get", "height"]
       ],
       'fill-extrusion-base': [
         "interpolate", ["linear"], ["zoom"],
         15, 0,
         15.05, ["get", "min_height"]
       ],
       'fill-extrusion-opacity': .6
     }
   }, firstLabelLayerId);
 
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  map.addSource('houses', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/Harry-01/comp-report/main/properties_scrambled_ready.json'
    }
 ); 
  


    if (document.querySelector('button[name="bedrooms"]')) {
      document.querySelectorAll('button[name="bedrooms"]').forEach((elem) => {
        elem.addEventListener("click", function(event) {
          bdItem = event.target.value;
          if (baItem == null) {
            var filtered = properties.filter(function (feature) {
              var name = feature.properties.number_of_bedroom;
              return name == bdItem;
              });
              console.log(filtered);
              // Populate the sidebar with filtered results
              renderListings(filtered);
               
              // Set the filter to populate features into the layer.
              if (filtered.length) {
              map.setFilter('unclustered-point', [
              'match',
              ['get', 'property_external_key'],
              filtered.map(function (feature) {
              return feature.properties.property_external_key;
              }),
              true,
              false
              ]);
              }
          } else {
            var totalFiltered = properties.filter(function (feature) {
              var bdName = feature.properties.number_of_bedroom;
              var baName = feature.properties.number_of_bathroom;
              return bdName == bdItem && baName == baItem;
              });


            renderListings(totalFiltered);
         
            // Set the filter to populate features into the layer.
            if (totalFiltered.length) {
            map.setFilter('unclustered-point', [
            'match',
            ['get', 'property_external_key'],
            totalFiltered.map(function (feature) {
            return feature.properties.property_external_key;
            }),
            true,
            false
            ]);
            }
          }
        });
      });
    }
  

    if (document.querySelector('button[name="bathrooms"]')) {
      document.querySelectorAll('button[name="bathrooms"]').forEach((elem) => {
        elem.addEventListener("click", function (event) {
          baItem = event.target.value;
          
          if (bdItem == null) {
            var baFiltered = properties.filter(function (feature) {
              var baName = feature.properties.number_of_bathroom;
              return baName == baItem;
              });
              //console.log(filtered);
              // Populate the sidebar with filtered results
              renderListings(baFiltered);
               
              // Set the filter to populate features into the layer.
              if (baFiltered.length) {
              map.setFilter('unclustered-point', [
              'match',
              ['get', 'property_external_key'],
              baFiltered.map(function (feature) {
              return feature.properties.property_external_key;
              }),
              true,
              false
              ]);
              }
          } else {

              var totalFiltered = properties.filter(function (feature) {
                var bdName = feature.properties.number_of_bedroom;
                var baName = feature.properties.number_of_bathroom;
                return bdName == bdItem && baName == baItem;
                });

              renderListings(totalFiltered);
           
              // Set the filter to populate features into the layer.
              if (totalFiltered.length) {
              map.setFilter('unclustered-point', [
              'match',
              ['get', 'property_external_key'],
              totalFiltered.map(function (feature) {
              return feature.properties.property_external_key;
              }),
              true,
              false
              ]);
              }
          }
        });
      });
    }
  




/*
  if (document.querySelector('button[name="bedrooms"]')) {
    document.querySelectorAll('button[name="bedrooms"]').forEach((elem) => {
      elem.addEventListener("click", function(event) {
        var item = event.target.value;
        console.log(item);
        if(item == '1'){
          button1 = true;
          button2 = false;
          button3 = false;
          console.log(button1,button2,button3);
        } else if(item == '2'){
          button2 = true;
          button1 = false;
          button3 = false;
          console.log(button1,button2,button3);
        }
        else if(item == '3'){
          button3 = true;
          button1 = false;
          button2 = false;
          console.log(button1,button2,button3);
        }

        if(button4 == false && button5 == false && button6 == false) {
          var filtered = properties.filter(function (feature) {
            var name = feature.properties.number_of_bedroom;
            return name == item;
            });
            console.log(filtered);
            // Populate the sidebar with filtered results
            renderListings(filtered);
             
            // Set the filter to populate features into the layer.
            if (filtered.length) {
            map.setFilter('unclustered-point', [
            'match',
            ['get', 'property_external_key'],
            filtered.map(function (feature) {
            return feature.properties.property_external_key;
            }),
            true,
            false
            ]);
            }
        } else {
          var filteredBedroom = properties.filter(function (feature) {
            var name = feature.properties.number_of_bedroom;
            return name == item;
            });

          var fliteredBathroom = properties.filter(function (feature) {
            var name = feature.properties.number_of_bathroom;
            return name == bathroomItem;
            });
        }
      });
    });
  }

  if (document.querySelector('button[name="bathrooms"]')) {
    document.querySelectorAll('button[name="bathrooms"]').forEach((elem) => {
      elem.addEventListener("click", function(event) {
        var bathroomItem = event.target.value;
        console.log(bathroomItem);
        if(bathroomItem == '1'){
          button4 = true;
          button5 = false;
          button6 = false;
          console.log(button4,button5,button6);
        } else if(bathroomItem == '2'){
          button5 = true;
          button4 = false;
          button6 = false;
          console.log(button4,button5,button6);
        }
        else if(bathroomItem == '3'){
          button6 = true;
          button4 = false;
          button5 = false;
          console.log(button4,button5,button6);
        }

        var filtered = properties.filter(function (feature) {
          var name = feature.properties.number_of_bathroom;
          return name == bathroomItem;
          });
          console.log(filtered);
          // Populate the sidebar with filtered results
          renderListings(filtered);
           
          // Set the filter to populate features into the layer.
          if (filtered.length) {
          map.setFilter('unclustered-point', [
          'match',
          ['get', 'property_external_key'],
          filtered.map(function (feature) {
          return feature.properties.property_external_key;
          }),
          true,
          false
          ]);
          }
      });
    });
  }

*/
  
  

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'houses',
    paint: {
      'circle-radius': 4,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
      'circle-color': [
      'match',
      ['get', 'status'],
      'Leased',
      '#fbb03b',
      'Active',
      '#223b53',
      '#ccc'
      ]
    }
  });


  var submitPropertyType = document.getElementById("submitPropertyType");
  submitPropertyType.addEventListener('click', function () {
  var result = document.getElementById('propertyType').value;

  var filtered = properties.filter(function (feature) {
    var name = feature.properties.type;
    return name == result;
    });

    // Populate the sidebar with filtered results
    renderListings(filtered);
      
    // Set the filter to populate features into the layer.
    if (filtered.length) {
    map.setFilter('unclustered-point', [
    'match',
    ['get', 'property_external_key'],
    filtered.map(function (feature) {
    return feature.properties.property_external_key;
    }),
    true,
    false
    ]);
    }
    });


  var submit = document.getElementById("submit");
  submit.addEventListener('click', function () {
    var max = document.getElementById("maxPrice").value;
    var min = document.getElementById("minPrice").value;


    var filtered = properties.filter(function (feature) {
      var name = normalize2(feature.properties.target_rent);
      return name > min && name < max;
      });
      console.log(filtered);

      // Populate the sidebar with filtered results
      renderListings(filtered);
       
      // Set the filter to populate features into the layer.
      if (filtered.length) {
        map.setFilter('unclustered-point', [
        'match',
        ['get', 'property_external_key'],
        filtered.map(function (feature) {
        return feature.properties.property_external_key;
        }),
        true,
        false
        ]);
        }
  });


  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.

  map.on('click', 'unclustered-point', function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var rent = e.features[0].properties.target_rent;
    var bedrooms = e.features[0].properties.number_of_bedroom;
    var bathrooms = e.features[0].properties.number_of_bathroom;


    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        'Rent price $' + rent + '<br>bathroom: ' + bathrooms + '<br>bedroom: ' + bedrooms
      )
      .addTo(map);
  });



  map.on('moveend', function () {
    var features = map.queryRenderedFeatures({ layers: ['unclustered-point'] });
    //var clustered_features = map.queryRenderedFeatures({ layers: ['clusters'] });
    console.log(features);
    if (features) {
    // Populate features for the listing overlay.
    renderListings(features);
     
    // Clear the input container
    filterEl.value = '';
     
    // Store the current features in sn `properties` variable to
    // later use for filtering on `keyup`.
    properties = features;
    }
    });

    map.on('mousemove', 'unclustered-point', function (e) {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
       
      // Populate the popup and set its coordinates based on the feature.
      var feature = e.features[0];
      popup
      .setLngLat(feature.geometry.coordinates)
      .setText(
      feature.properties.property_external_key +
      ' (' +
      feature.properties.target_rent +
      ')'
      )
      .addTo(map);
      });

    filterEl.addEventListener('keyup', function (e) {
      var value = normalize(e.target.value);
       
      // Filter visible features that don't match the input value.
      var filtered = properties.filter(function (feature) {
      var name = normalize(feature.properties.property_external_key);
      return name.indexOf(value) > -1;
      });

      // Populate the sidebar with filtered results
      renderListings(filtered);
       
      // Set the filter to populate features into the layer.
      if (filtered.length) {
      map.setFilter('unclustered-point', [
      'match',
      ['get', 'property_external_key'],
      filtered.map(function (feature) {
      return feature.properties.property_external_key;
      }),
      true,
      false
      ]);
      }
      });
       
      // Call this function on initialization
      // passing an empty array to render an empty state
      renderListings([]);
  
});
