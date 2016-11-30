var config;
var map1;
var guide1;
var navigator1;
//This class manage everything about user's preferences 
var Pref = function()
{
  var prefs = plugins.appPreferences;
  var locomotion;
  var key;
  var bluetoothAdress;
  var locomotionField;
  var keyField;
  var btMacField;
  this.save = function()
  {
    var e = document.getElementById("pref");
    locomotion = e.options[e.selectedIndex].text;
    prefs.store(this.saveWorked, this.fail, 'locomotion', locomotion);
    key = document.getElementById("key").value;
    prefs.store(this.saveWorked,this.fail,'key',key);
    bluetoothAdress = document.getElementById("btMac").value;
    prefs.store(this.saveWorked,this.fail,'bt',bluetoothAdress);
  },
  this.load = function(locomotionField1,keyField1,btMacField1)
  {
  locomotionField=locomotionField1;
  keyField=keyField1;
  btMacField=btMacField1;
  prefs.fetch(this.ok,this.fail, 'locomotion');
  prefs.fetch(this.ok,this.fail, 'key');
  prefs.fetch(this.ok,this.fail, 'bt');
  },
  this.ok = function(value)
  {
    if((value.length<=10)&&(value.length>0))
    {
        locomotion=value;
        //locomotionField.value=locomotion;
        (locomotionField.options.namedItem(locomotion)).selected=true;
        window.plugins.toast.show(locomotion, 'long', 'bottom');
    }
    else if(value.length>17)
    {
        key=value;
        keyField.value=key;
    }
    else
    {
        bluetoothAdress=value;
        btMacField.value=bluetoothAdress;
    }
    
  },
  this.fail = function(error)
  {
    window.plugins.toast.show("No value founded", 'long', 'bottom');
  },
  this.saveWorked = function(value)
  {
    window.plugins.toast.show("SAVED!", 'long', 'bottom');
  },
  this.getLocomotion=function()
  { 
    return locomotion;
  },
  this.getKey=function()
  {
      return key;
  },
  this.getBluetoothAdress=function()
  {
      return bluetoothAdress;
  }
}
//This class manage everything about the map and the user's position
//It can show the map, draw the route, get user's position
var Map = function()
{
  var polyLine;
  this.loadMapScript = function()
  {
      var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?key="+config.getKey()+"&sensor=false&libraries=geometry";
  document.body.appendChild(script);
  },
  this.drawMap = function(steps)
  {
        var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
      });
      var bounds = new google.maps.LatLngBounds();
      var polylineLatLng = new Array();
      for(i=0;i<steps.length;i++)
      {
          var polylineTmp=google.maps.geometry.encoding.decodePath(steps[i].polyline.points);
          for(j=0;j<polylineTmp.length;j++)
          {
              polylineLatLng.push(polylineTmp[j]);
              bounds.extend(polylineTmp[j]);
          }
      }
      polyLine = new google.maps.Polyline({
        path: polylineLatLng,
        strokeColor: '#00FFFF',
        strokeWeight: 3
      });
      polyLine.setMap(map);
      map.fitBounds(bounds);
      
  },
  this.getMyPosition=function()
  {
    navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError,{enableHighAccuracy: true });
  },
  this.onSuccess=function(pos)
  {
    document.getElementById("start").value=pos.coords.latitude+","+pos.coords.longitude;
  },
  this.onError=function()
  {
    alert("We've got a blem");
  },
  this.getPolyLine=function()
  {
      return polyLine;
  }
  
}
//This class calculate the route 
var Route = function()
{
  var key=config.getKey();
  var pointsLng=[];
  var pointsLat=[];
  var maneuvers=[];
  var destination;
  this.calculate=function(start,end,locomotion)
  {   
      destination=end;
      pointsLng=[];
      pointsLat=[];
      maneuvers=[];
      var xmlhttp = new XMLHttpRequest();
      var url = "https://maps.googleapis.com/maps/api/directions/json?origin="+start+"&destination="+end+"&language=en&mode="+locomotion+"&key="+key+"";
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
        {   
            var instructions = JSON.parse(xmlhttp.responseText);
            
            if(instructions.status=="OK")
            {
              var steps = instructions.routes[0].legs[0].steps;
                map1.drawMap(steps);
              for (var i = 1; i < steps.length; i++)
              {  
                  if(steps[i].maneuver!=undefined)
                  {
                   if((steps[i].maneuver=="roundabout-right")||(steps[i].maneuver=="roundabout-left"))
                   {
                       if(steps[i].html_instructions.indexOf("1st")!=-1)
                       {
                            maneuvers.push("1");        
                       }
                       else if(steps[i].html_instructions.indexOf("2nd")!=-1)
                       {
                           maneuvers.push("2");
                       }
                       else if(steps[i].html_instructions.indexOf("3rd")!=-1)
                       {
                           maneuvers.push("3");
                       }
                       else if(steps[i].html_instructions.indexOf("4th")!=-1)
                       {
                           maneuvers.push("4");
                       }
                       else if(steps[i].html_instructions.indexOf("5th")!=-1)
                       {
                           maneuvers.push("5");
                       }
                       else if(steps[i].html_instructions.indexOf("6th")!=-1)
                       {
                           maneuvers.push("6");
                       }
                       else if(steps[i].html_instructions.indexOf("7th")!=-1)
                       {
                           maneuvers.push("7");
                       }
                   }
                   else
                   {
                     maneuvers.push(steps[i].maneuver);
                   }
                    pointsLat.push(steps[i].start_location.lat);
                    pointsLng.push(steps[i].start_location.lng);
                  }
              }
        
            }
            else
            {
                window.plugins.toast.show("Unable to calculate the route", 'long', 'bottom');
            }
          }
        }
       
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
     
    },
    this.getPointsLng=function(index)
    {
      return pointsLng[index];
    },
    this.getPointsLat=function(index)
    {
      return pointsLat[index];
    },
    this.getManeuvers=function(index)
    {
      return maneuvers[index];
    },
    this.getDestination=function()
    {
        return destination; 
    },
    this.clear = function()
    {
        var pointsLng=[];
        var pointsLat=[];
        var maneuvers=[];  
    }
}
//This class guide the user on the route and send instructions to the bluetooth module
var Navigator = function()
{
  var index=0;
  var test=1;
  var distance=0;
  var speed=1;
  var polyLine=map1.getPolyLine();
  var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 300000,enableHighAccuracy: true });
  function clear()
  {
      
  }
  function worked()
  {
    
  }
  function fail()
  {
    
  }
//This function is called each time when the smartphone get the user's location.
//Then it recalcul
  function onSuccess(position) {
    distance= calcCrow(position.coords.latitude,position.coords.longitude,Number(guide1.getPointsLat(index)),Number(guide1.getPointsLng(index)));
    var Gpos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    if(!(google.maps.geometry.poly.isLocationOnEdge(Gpos, polyLine,0.001)))
    {
        window.plugins.toast.show("Recalculate", 'long', 'bottom');
        var desti = guide1.getDestination(); 
        guide1.clear();
        guide1.calculate((position.coords.latitude+","+position.coords.longitude),desti,config.getLocomotion());
        index=0;
        test=1;
        distance=0;
        speed= position.coords.speed/10;
        if(speed<1)
        {
            speed=1;
        }
        polyLine=map1.getPolyLine();
    }
    if((test==1)&&((distance=>(0.05*speed))&&(distance<=(0.1*speed))))
    {
      sendMessageToSerial(guide1.getManeuvers(index),test);
      test=2;
    }
    else if((test==2)&&((distance=>(0.025*speed))&&(distance<=(0.05*speed))))
    {
      sendMessageToSerial(guide1.getManeuvers(index),test);
      test=3;
    }
    else if(((test==3)&&((distance=>0)&&(distance<=(0.025*speed)))))
    {
      sendMessageToSerial(guide1.getManeuvers(index),test);
      index++;
      test=1;
      
    }
  }
  function onError(error) {
      alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
  }
//This function calculate the distance between two points
  function calcCrow(lat1, lon1, lat2, lon2) 
  {
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
  }
  function toRad(Value) 
  {
      return Value * Math.PI / 180;
  }
//This function send instructions to the bluetooth module
  function sendMessageToSerial(instruction,distance)
  {
    switch(instruction)
    {
      case "straight":
         bluetoothSerial.write('x'+distance);
      break;
      case "merge":
        bluetoothSerial.write('x'+distance);
      break;
      case "turn-left":
        bluetoothSerial.write('l'+distance);
      break;
      case "turn-sharp-left":
        bluetoothSerial.write('l'+distance);
      break;
      case "turn-sharp-left":
        bluetoothSerial.write('l'+distance);
      break;
      case "turn-right":
        bluetoothSerial.write('r'+distance);
      break;
      case "turn-sharp-right":
        bluetoothSerial.write('r'+distance);
      break;
      case "turn-slight-left":
        bluetoothSerial.write('s'+distance);
      break;
      case "fork-left":
        bluetoothSerial.write('s'+distance);
      break;
      case "ramp-left":
        bluetoothSerial.write('s'+distance);
      break;
      case "turn-slight-right":
        bluetoothSerial.write('z'+distance);
      break;
      case "fork-right":
        bluetoothSerial.write('z'+distance);
      break;
      case "ramp-right":
        bluetoothSerial.write('z'+distance);
      break;
      case "uturn-right":
        bluetoothSerial.write('b'+distance);
      break;
      case "uturn-left":
        bluetoothSerial.write('b'+distance);
      break;
      case "1":
        if(test==1)
        {
          bluetoothSerial.write('1'+4);
        }
      break;
      case "2":
        if(test==1)
        {
          bluetoothSerial.write('2'+4);
        }
      break;
      case "3":
        if(test==1)
        {
          bluetoothSerial.write('3'+4);
        }
      break;
      case "4":
        if(test==1)
        {
          bluetoothSerial.write('4'+4);
        }
      break;
      case "5":
        if(test==1)
        {
          bluetoothSerial.write('5'+4);
        }
      break;
      case "6":
        if(test==1)
        {
           bluetoothSerial.write('6'+4);
        }
      break;
      case "7":
        if(test==1)
        {
          bluetoothSerial.write('7'+4);
        }
      break;

    }
    function success()
    {
    }
    function failure(event)
    {
    }
  }
}
//This function show the option panel
function showOption()
{
  document.getElementById('index_panel').style.display = 'none';
  document.getElementById('option_panel').style.display = 'block';
  document.getElementById('previous').style.display = 'block';
  document.getElementById('GO_panel').style.display = 'none';
}
//This function show the main panel
function showIndex()
{
  guide1 = new Route();
  //navigator1=new Navigator();
  document.getElementById('index_panel').style.display = 'block';
  document.getElementById('option_panel').style.display = 'none';
  document.getElementById('previous').style.display = 'none';
  document.getElementById('GO_panel').style.display = 'none';
}
//This function show the map panel
function showGO()
{
  document.getElementById('index_panel').style.display = 'none';
  document.getElementById('option_panel').style.display = 'none';
  document.getElementById('previous').style.display = 'block';
  document.getElementById('GO_panel').style.display = 'block';
}
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady()
{
  config = new Pref();
  config.load(document.getElementById("pref"),document.getElementById("key"),document.getElementById("btMac"));
  setTimeout(function(){ map1= new Map();guide1 = new Route();map1.loadMapScript();document.getElementById("myposition").disabled=false; }, 3000);
  guide1 = new Route();
  
}