var uploader = (function(){

  var $image, $canvas, $output;

  var init = function(image, overlay, canvas, menu) {
    $image = image;
    $canvas = canvas;

    menu.html("<button id='upload'><img src='accept.png'>upload</button> ");
    menu.append("<button id='cancel'><img src='cancel.png'>cancel</button>");
    menu.append("<div id='output'></div>");
    menu.find("#upload").click(upload);
    menu.find("#cancel").click(cancel);
    $output = menu.find("#output");
  }
  var cancel = function() {
    clipper.setTool(null);
  }

  var detatch = function() {

  }

  var upload = function() {

    var data = $canvas.get(0).toDataURL("image/png").split(',')[1];

    console.log("Upload");
    console.log(data);

    $.ajax({
      type: 'POST',
      url: "https://api.imgur.com/3/image",
      data: {image:data},
      success: onSuccess,
      beforeSend: function(request) {request.setRequestHeader("Authorization", "Client-ID 1d7f2dbcaf960d7"); console.log(request);},
      dataType: "application/json",
      proccessData: false
    });
  }

  var onSuccess = function(data) {
    console.log(data);
    var url = "http://i.imgur.com/"+data.responseText.match("imgur\.com/(.+?\.png)");
    $output.html("<a href=\""+url+"\">"+url+"</a>");
  }

  return {
    init: init,
    detatch: detatch,
  }

})();