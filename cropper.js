var cropper = (function() {
  var $image = null;
  var $overlay = null;
  var $canvas = null;
  var ctx = null;
  var o_ctx = null;
  var x = 10;
  var y = 10;
  var width = 200;
  var height = 100;
  var pressed = false;
  var offset_x = 0;
  var offset_y = 0;
  var center_move = false;

  var OFFSET = 5;

  var hoz = 0;
  var vert = 0;

    // 00 default
    // 01 ew
    // 02 ew
    // 10 ns
    // 11 nwse
    // 12 nesw
    // 20 ns
    // 21 nesw
    // 22 nwse
  var cursors = ["default", "ew-resize", "ew-resize", "ns-resize", "nwse-resize",
     "nesw-resize", "ns-resize", "nesw-resize", "nwse-resize"];

  var init = function(image, overlay, canvas, menu) {
    $image = image;
    $overlay = overlay;
    $canvas = canvas;
    //$(document.body).mousemove(mousemove);
    //$(document.body).mousedown(mousedown);
    //$(document.body).mouseup(mouseup);
    x = y = 10;
    width = 200; height = 100;

    if (width > $image.width()) {
      x = 0; width = $image.width();
    }
    if (height > $image.height()) {
      y = 0; height = $image.height();
    }

    menu.html("<button id='finish_crop'><img src='accept.png'>finish crop</button> ");
    menu.append("<button id='cancel'><img src='cancel.png'>cancel</button>")
    menu.find("#finish_crop").click(finishCrop);
    menu.find("#cancel").click(cancelCrop);

    o_ctx = $overlay.get(0).getContext("2d");
    paintOverlay();
  };

  var finishCrop = function() {
    clipper.crop(x, y, width, height);
    clipper.setTool(null);
  };
  var cancelCrop = function() {
    clipper.setTool(null);
  };

  var paintOverlay = function() {
    var image_width = $image.width();
    var image_height = $image.height();

    o_ctx.clearRect(0, 0, image_width, image_height);
    o_ctx.fillStyle = "rgba(0,0,0, 0.5);";

    o_ctx.beginPath();
    o_ctx.rect(0, 0, x, image_height);
    o_ctx.rect(x+width, 0, image_width-x-width, image_height);
    o_ctx.rect(x, 0, width, y);
    o_ctx.rect(x, y+height, width, image_height-y-height);
    o_ctx.fill();

    o_ctx.strokeStyle = "rgba(255,0,0,0.5);";

    var vert_line = function(x) {
      o_ctx.beginPath();
      o_ctx.moveTo(x+0.5, 0);
      o_ctx.lineTo(x+0.5, image_height);
      o_ctx.stroke();
    };

    var hoz_line = function(y) {
      o_ctx.beginPath();
      o_ctx.moveTo(0, y+0.5);
      o_ctx.lineTo(image_width, y+0.5);
      o_ctx.stroke();
    };
    vert_line(x); vert_line(x+width-1);
    hoz_line(y); hoz_line(y+height-1);
  };

  var mousedown = function(ev) {
    var mouse_x = ev.clientX - $image.offset().left;
    var mouse_y = ev.clientY - $image.offset().top;
    if (center_move || hoz != 0 || vert != 0) {
      offset_x = x - mouse_x;
      offset_y = y - mouse_y;
      pressed = true;
      ev.preventDefault();
    }
  };
  var mouseup = function(ev) {
    pressed = false;
  };
  var mousemove = function(ev) {
    var mouse_x = ev.clientX - $image.offset().left;
    var mouse_y = ev.clientY - $image.offset().top;

    if (pressed) {
      if (center_move) {
        x = clamp(mouse_x + offset_x, 0, $image.width()-width);
        y = clamp(mouse_y + offset_y, 0, $image.height()-height);
      }
      else {
        var right = width+x;
        var bottom = height+y;

        if (hoz == 1) 
          x = clamp(mouse_x, 0, right-1);
        else if (hoz == 2) 
          right = clamp(mouse_x+1, x+1, $image.width());
        if (vert == 1) 
          y = clamp(mouse_y, 0, bottom-1);
        else if (vert == 2) 
          bottom = clamp(mouse_y+1, y+1, $image.height()  );
        width = right-x;
        height = bottom-y;
      }
      paintOverlay();
    }
    else {
      hoz = (mouse_x > x - OFFSET && mouse_x < x + OFFSET)                 ? 1 :
            (mouse_x > x + width - OFFSET && mouse_x < x + width + OFFSET) ? 2 : 0;

      vert = (mouse_y > y - OFFSET && mouse_y < y + OFFSET)                   ? 1 :
             (mouse_y > y + height - OFFSET && mouse_y < y + height + OFFSET) ? 2 : 0;

      center_move = (mouse_x >= x + OFFSET && mouse_x <= x + width - OFFSET) &&
                    (mouse_y >= y + OFFSET && mouse_y <= y + height - OFFSET);

      var cid = hoz + 3 * vert;

      $("body").css("cursor", center_move ? "move" : cursors[cid]);
    }
  };

  var detatch = function() {
    //$(document.body).unbind("mousemove", mousemove);
    //$(document.body).unbind("mousedown", mousedown);
    //$(document.body).unbind("mouseup", mouseup);
    $("body").css("cursor", "default");
    o_ctx.clearRect(0, 0, $image.width(), $image.height());
  };

  return {
    init: init,
    detatch: detatch,
    mousemove: mousemove,
    mousedown: mousedown,
    mouseup: mouseup
  }
})();