var util = require('util');
var http = require('http');
var request = require('request');
var fs = require('fs');
var xml2js = require('xml2js');
var async = require("async");
var buildingData = JSON.parse(fs.readFileSync('./buildings_example_results.json'));

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();
var osms = [];
var addOSM = function(osm) {
  osms.push(osm);
}
async.forEachOf(buildingData, function(building, key, callback) {
  var osm = "";
  if (building.osm_building !== null) {
    var buildingURL = building.osm_building.url.toString();
    request(buildingURL, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        xml2js.parseString(body, function(err, results) {
          osms.push(results);
          callback();
        });
      }
    });
  }
  else {
    callback();
  }
}, function(err) {
    // Should be async!
    osms.forEach(function(osm) {
      var xml = builder.buildObject(osm);
      console.log(util.inspect(osm, false, null))
      var user = osm.osm.$.user;
      var timestamp = osm.osm.node[0].$.timestamp.replace(/:/g, '-');
      fs.writeFile("osm-" + user + "-" + timestamp + ".xml", xml);
    })

});
