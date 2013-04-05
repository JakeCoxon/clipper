
var clamp = function(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

var clipper = (function() {
  var $image = null;
  var $overlay = null;
  var $canvas = null;
  var $submenu = null;
  var $zoomcanvas = null;
  var original_image = null;
  var ctx = null;
  var tool = null;

  var init = function() {
    $image = $("#image");
    $overlay = $("#overlay");
    $canvas = $("#canvas");
    $submenu = $("#submenu");
    $zoomcanvas = $("#zoomcanvas");
    ctx = $canvas.get(0).getContext("2d");

    $image.load(function(ev) {
      drawImageToCanvas();
      onresize();
    });

    $(document.body).mousemove(mousemove);
    $(document.body).mousedown(mousedown);
    $(document.body).mouseup(mouseup);
    $(window).resize(onresize);

    onresize();
    zoom.init($image, $canvas, $overlay, $zoomcanvas);

  };

  var mousemove = function(ev) {
    if (tool && tool.mousemove)
      tool.mousemove(ev);
    zoom.mousemove(ev);
  };
  var mousedown = function(ev) {
    if (tool && tool.mousedown)
      tool.mousedown(ev);
  };
  var mouseup = function(ev) {
    if (tool && tool.mouseup)
      tool.mouseup(ev);
  };

  var drawImageToCanvas = function() {
    if ($canvas.width() != $image.width() || $canvas.height() != $image.height()) {
      $canvas.attr("width", $image.width());
      $canvas.attr("height", $image.height());
    }
    if ($overlay.width() != $image.width() || $overlay.height() != $image.height()) {
      $overlay.attr("width", $image.width());
      $overlay.attr("height", $image.height());
    }
    ctx.drawImage($image.get(0), 0, 0);
  }
  var drawCanvasToImage = function() {
    console.log("????");
    var data = canvas.toDataURL("image/png");
    $image.attr("src", data);
  }

  var onresize = function() {
    var right = $("#canvas").offset().left + $("#canvas").get(0).clientWidth;
    var max = document.body.clientWidth-120;
    $("#sidebar").get(0).style.left = Math.min(right + 20, max) + "px";
    //console.log($("#sidebar").get(0).style);
  }

  var crop = function(x, y, w, h) {
    $canvas.attr("width", w);
    $canvas.attr("height", h);
    // todo: crop overlay

    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

    drawCanvasToImage();
  }

  var loadFile = function(file) {

    if (!file.type.match("image\.*")) { console.log("Invalid file"); return; }

    setTool(null);

    var reader = new FileReader();

    reader.onload = function(ev) {
      //console.log(ev);
      $image.attr("src", ev.target.result);
      original_image = ev.target.result;
    };
    reader.readAsDataURL(file);

  };

  var revert = function() {
    $image.attr("src", original_image);
    drawImageToCanvas();
  }

  var setTool = function(_tool) {
    if (tool != null) tool.detatch();
    $submenu.html("");
    tool = _tool;
    if (tool != null) tool.init($image, $overlay, $canvas, $submenu);
  }


  return {
    init: init,
    loadFile: loadFile,
    setTool: setTool,
    drawCanvasToImage: drawCanvasToImage,
    drawImageToCanvas: drawImageToCanvas,
    crop: crop,
    revert: revert
  }
})();


var menu = (function() {
  var menu = null;
  var isopen = false;

  var documentClick = function(ev) {
    close();
    ev.preventDefault();
    return false;
  }

  var open = function(el) {
    if (isopen) close();
    isopen = true;

    el = $(el);
    if (menu == null) {
      menu = $("<div id='menu'>");
      $(document.body).append(menu);
    }

    var left = el.offset().left;
    var top = el.offset().top + el.prop("offsetHeight") -1;
    var width = el.prop("clientWidth");
    menu.css({width: width, position: "absolute", left: left, top: top, display: "block"});
    menu.html("");

    setTimeout(function() {
      $(document.body).on('click', documentClick);
    }, 100);
    return menu;
  }

  var append = function(html) {
    var el = $(html);
    menu.append(el);
    return el;
  }

  var close = function() {
    menu.css("display", "none");
    menu.html("");
    isopen = false;
    $(document.body).off("click", documentClick);
  }

  return {
    open: open,
    close: close,
    append: append
  }
})();





var revert = (function() {
  var init = function() {
    clipper.revert();
    clipper.setTool(null);
  }
  return {
    init: init,
    detatch: function() {}
  }
})();