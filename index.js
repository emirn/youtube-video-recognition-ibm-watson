var WATSON_KEY = "YOUR_IBM_API_KEY"; // you may get the key form IBM Bluemix site, free API key allows 250 requests / day

var express = require('express')
//var req = require("request");
var req = require('sync-request');
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  
    // popular video classes   
    var video_classes = [];    
    
    var youtube_url = request.query.youtube;
  
    if(!youtube_url)
      youtube_url = "https://www.youtube.com/feed/trending";
      
    console.log("youtube parameter = " + youtube_url);
  
    var res = req('GET', youtube_url);
  
      //console.log("Got response: " + body.substring(0, 50));
      //response.send(body.substring(0, 50));
      
      // up to 7 images for now
      var images_url = [];
      
      var body = res.getBody();
    
      
      //var regex = /\/watch\?v=([a-zA-Z0-9\-]+)\"/;
      var match = body.toString().match(/ytimg\.com\/vi\/(([a-zA-Z0-9\-]+))\//gmi);
      
      debugger;

      var counter = 0;
      
          for (var i = 0, len = match.length; i < len; i++) {
              // collect urls
              youtube_id = match[i].replace('ytimg.com/vi/', '').replace('\/','');
              
              img_url = "http://img.youtube.com/vi/" + youtube_id + '/0.jpg';
              // check if exists 
              if (images_url.indexOf(img_url) > -1)
                continue;
                
              // check if image exists
              res3 = req('HEAD', img_url);
              if (res3.statusCode !== 200)
                continue;
                
              images_url.push(img_url);
    
              counter++;
              
              if (counter > 7)
               break;
              console.log('thumbnail ' + counter + "  " + youtube_id);
          }      
        
          
          for (var i = 0, len = counter; i < len; i++) {
            watson_url = "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify?api_key=" + WATSON_KEY + "&version=2016-05-17&url=" + images_url[i];
            console.log(watson_url);
    
            
            res2 = req('GET', watson_url);

            // console.log(body);
            var body = res2.getBody();
            obj = JSON.parse(body.toString());
            
            debugger;
            
            img_classes = obj.images[0].classifiers[0].classes;
            // iterate classes and output each one
            img_classes.forEach(
              function (item) {
                  image_class = item.class;
                    
                  // check if exists 
                  if (video_classes.indexOf(image_class) === -1)
                  {
                    console.log(image_class);
                    video_classes.push(image_class);
                  };
            });
          } // for
  response.send("🔥" + video_classes.join("\n<br/>	🔥"));
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
