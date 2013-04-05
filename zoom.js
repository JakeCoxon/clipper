var zoom = (function() {
  var $image = null;
  var $canvas = null;
  var $overlay = null
  var $zoomcanvas = null;
  var zoom_ctx = null;
  var canvas_ctx = null;
  var overlay_ctx = null;
  var zoom_size = 4;
  var mouse_x;
  var mouse_y;

  var init = function(image, canvas, overlay, zoomcanvas) {
    $image = image;
    $canvas = canvas;
    $overlay = overlay;
    $zoomcanvas = zoomcanvas;
    zoom_ctx = $zoomcanvas.get(0).getContext("2d");
    canvas_ctx = $canvas.get(0).getContext("2d");
    overlay_ctx = $overlay.get(0).getContext("2d");
    //$(document.body).mousemove(mousemove);
  }

  var mousemove = function(ev) {
    // todo: force this to come AFTER tool mousemove 

    mouse_x = ev.clientX - $image.offset().left;
    mouse_y = ev.clientY - $image.offset().top;
    var w = $zoomcanvas.width();
    var h = $zoomcanvas.height();
    zoom_ctx.clearRect(0, 0, w, h);

    zoom_ctx.fillStyle = "rgba(200,200,200,1)";
    zoom_ctx.fillRect(0,0,w,h);

    var zw = w/zoom_size;
    var zh = h/zoom_size;

    //ctx.drawImage($image.get(0), mouse_x-w/2/zoom_size, mouse_y-w/2/zoom_size, w/zoom_size, h/zoom_size, 0, 0, w, h);
    drawZoom(canvas_ctx, mouse_x-zw/2, mouse_y-zh/2, zw, zh);
    drawZoom(overlay_ctx, mouse_x-zw/2, mouse_y-zh/2, zw, zh);
    zoom_ctx.fillStyle = "rgba(255,0,0,1)";

    //drawInvert(zw/2, zh/2);
    //drawInvert(zw/2, zh/2-2);
    //drawInvert(zw/2, zh/2+2);
    //drawInvert(zw/2-2, zh/2);
    //drawInvert(zw/2+2, zh/2);
  };


  var drawInvert = function(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    var data = canvas_ctx.getImageData(x, y, 1, 1).data;
    var r = 255-data[0];
    var g = 255-data[1];
    var b = 255-data[2];
    zoom_ctx.fillStyle = "rgba("+r+","+g+","+b+",1)";
    zoom_ctx.fillRect((x - mouse_x)*zoom_size, (y - mouse_x)*zoom_size, 1*zoom_size, 1*zoom_size);
  }
  var drawRect = function(x, y, w, h) {
    zoom_ctx.fillRect(Math.floor(x)*zoom_size, Math.floor(y)*zoom_size, w*zoom_size, h*zoom_size);
  }
  var drawZoom = function(context, sx, sy, w, h) {
    var ow = w*zoom_size;
    var oh = h*zoom_size;
    var imgData = context.getImageData(sx, sy, w-1, h-1).data;

    for (var y = 0; y < h; ++y){
      for (var x = 0; x < w; ++x){
        // Find the starting index in the one-dimensional image data
        var i = (y*w + x)*4;
        var r = imgData[i  ];
        var g = imgData[i+1];
        var b = imgData[i+2];
        var a = imgData[i+3];
        zoom_ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
        zoom_ctx.fillRect(x*zoom_size, y*zoom_size, zoom_size, zoom_size);
      }
    }
  }

  return {
    init: init,
    mousemove: mousemove,
    drawInvert: drawInvert
  }
})();