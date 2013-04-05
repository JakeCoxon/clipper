var painter = (function() {

  var $image = null;
  var $overlay = null;
  var $canvas = null;
  var $size = null;
  var ctx = null;
  var o_ctx = null;
  var $c_preview = null;
  var pressed = false;
  var color = "#ff0000";
  var size = 1;
  var mouse_x = 0;
  var mouse_y = 0;
  var prev_x = 0;
  var prev_y = 0;
  var original_image;
  var choose_color = false;

  var init = function(image, overlay, canvas, menu) {
    $image = image;
    $overlay = overlay;
    $canvas = canvas;
    ctx = $canvas.get(0).getContext("2d");
    o_ctx = $overlay.get(0).getContext("2d");
    original_image = new Image();
    original_image.src = $image.get(0).src;

    menu.html("<button id='finish'><img src='accept.png'>finish paint</button> ");
    menu.append("<button id='cancel'><img src='cancel.png'>cancel</button> ");
    menu.append("<button id='sizeb'><img src='add.png'>size: <span id='size'></span></button> ");
    menu.append("<button id='color'><div id='cpreview' class='icon' style='background-color: white; display:inline-block'></div>color</button> ");
    menu.find("#finish").click(finish);
    menu.find("#cancel").click(cancel);
    menu.find("#sizeb").click(chooseSize);
    menu.find("#color").click(chooseColor);
    $c_preview = menu.find("#cpreview");
    $size = menu.find("#size");
    updateColorPreview();
    $size.html(size+"");
  };

  var finish = function() {
    clipper.drawCanvasToImage();
    clipper.setTool(null);
  };
  var cancel = function() {
    //$image.attr("src", original_image);
    ctx.clearRect(0, 0, $image.width(), $image.height());
    ctx.drawImage(original_image, 0, 0);
    clipper.setTool(null);
  }
  var chooseSize = function(ev) {
    var m = menu.open(ev.currentTarget);

    var setSize = function(s) {
      size = s;
      $size.html(s+"");
    }
    for (var i = 1; i <= 10; i++) {
      (function(s) {
        var b = menu.append("<button style='width:50%'>"+i+"</button>");
        b.click(function(ev) { setSize(s); });
      })(i);
    }
  }
  var setColor = function(col) {
    color = col;
    updateColorPreview();
  }
  var chooseColor = function(ev) {
    
    var m = menu.open(ev.currentTarget);
    m.css("width", 100);
    var colors = ["ff0000", "00ff00", "0000ff", "ffff00", "00ffff", "ff00ff", "000000", "ffffff"];
    for (var i = 0; i < colors.length; i++) {
      (function(col) {
        var b = menu.append("<button><div class='icon' style='background-color: #"+colors[i]+"'></div></button>");
        b.click(function(ev) { setColor("#"+col); return false; });
      })(colors[i]);
    };
    var b = menu.append("<button><div class='icon' style='float:left'>?</div></button>");
    b.click(function(ev) { 
      setColor("rgb("+Math.floor(Math.random()*255)+", "+Math.floor(Math.random()*255)+", "+Math.floor(Math.random()*255)+")");
    });

  }

  var updateColorPreview = function() {
    $c_preview.css("background-color", color);
  }

  var detatch = function() {
    clipper.drawCanvasToImage();
    //$(document.body).unbind("mousemove", mousemove);
    //$(document.body).unbind("mousedown", mousedown);
    //$(document.body).unbind("mouseup", mouseup);
  };

  var mousemove = function(ev) {
    mouse_x = ev.clientX - $image.offset().left;
    mouse_y = ev.clientY - $image.offset().top;
    if (pressed) return mousedrag(ev);

    var inside = ev.target == $image.get(0);
    $("body").css("cursor", inside ? "crosshair" : "default");
    choose_color = ev.metaKey;

    if (choose_color) {
      var imgData = ctx.getImageData(mouse_x, mouse_y, 1, 1).data;
      color = "rgb("+imgData[0]+","+imgData[1]+","+imgData[2]+")";
      updateColorPreview();
    }

    paintOverlay();
  }
  var mousedrag = function(ev) {
    ctx.fillStyle = color;
    ctx.beginPath();

    var half = Math.floor(size/2);

    line(prev_x-half, prev_y-half, mouse_x-half, mouse_y-half, function(x, y){
      ctx.rect(x, y, size, size);
    });
    ctx.fill();

    paintOverlay();

    prev_x = mouse_x;
    prev_y = mouse_y;
  }
  var mousedown = function(ev) {
    if (ev.button == 2) return;
    pressed = true;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(mouse_x-Math.floor(size/2), mouse_y-Math.floor(size/2), size, size);

    var half = Math.floor(size/2);
    if (ev.shiftKey) {
      line(prev_x-half, prev_y-half, mouse_x-half, mouse_y-half, function(x, y){
        ctx.rect(x, y, size, size);
      });
    }

    ctx.fill();


    prev_x = mouse_x; prev_y = mouse_y;

    ev.preventDefault();
  }
  var mouseup = function(ev) {
    pressed = false;
    //clipper.drawCanvasToImage();
  }
  var paintOverlay = function() {
    var image_width = $image.width();
    var image_height = $image.height();

    o_ctx.clearRect(0, 0, image_width, image_height);

    if (!choose_color) {
      o_ctx.fillStyle = color;
      o_ctx.beginPath();
      o_ctx.rect(mouse_x-Math.floor(size/2), mouse_y-Math.floor(size/2), size, size);
      o_ctx.fill();
    }

    //zoom.drawInvert(mouse_x, mouse_y-2);
    //zoom.drawInvert(mouse_x, mouse_y+2);
    //zoom.drawInvert(mouse_x-2, mouse_y);
    //zoom.drawInvert(mouse_x+2, mouse_y);
  }

  var line = function(x1, y1, x2, y2, f) {
    // Define differences and error check
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    f(x1, y1);
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
      // Set coordinates
      f(x1, y1);
    }
  }

  return {
    init: init,
    detatch: detatch,
    mousemove: mousemove,
    mousedown: mousedown,
    mouseup: mouseup
  }
})();