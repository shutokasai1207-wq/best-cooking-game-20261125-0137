// Sizzle & Serve — keyboard and mouse input.
// Tracks held keys, fresh presses, and mouse clicks in canvas coordinates.
(function () {
  'use strict';

  var SS = window.SS;
  var keys = {};
  var pressed = {};
  var mouse = { x: 0, y: 0, clicked: false, down: false };

  function keyName(e) {
    var k = e.key;
    if (k === ' ') return 'space';
    return k.length === 1 ? k.toLowerCase() : k.toLowerCase();
  }

  function onKeyDown(e) {
    var k = keyName(e);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0 ||
        k === 'space') {
      e.preventDefault();
    }
    if (!keys[k]) pressed[k] = true;
    keys[k] = true;
  }

  function onKeyUp(e) {
    keys[e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase()] = false;
    if (e.key === ' ') keys.space = false;
  }

  function canvasPos(canvas, clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left) * (SS.W / r.width),
      y: (clientY - r.top) * (SS.H / r.height)
    };
  }

  function attach(canvas) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousemove', function (e) {
      var p = canvasPos(canvas, e.clientX, e.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
    });
    canvas.addEventListener('mousedown', function (e) {
      var p = canvasPos(canvas, e.clientX, e.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.down = true;
      mouse.clicked = true;
    });
    // Touch: tap a station to walk there and use it, same as a mouse click.
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      var t = e.touches[0];
      var p = canvasPos(canvas, t.clientX, t.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.down = true;
      mouse.clicked = true;
    }, { passive: false });
    canvas.addEventListener('touchend', function () { mouse.down = false; });
    window.addEventListener('mouseup', function () { mouse.down = false; });
  }

  // Movement vector from WASD or the arrow keys, normalized.
  function moveVector() {
    var x = 0, y = 0;
    if (keys.a || keys.arrowleft) x -= 1;
    if (keys.d || keys.arrowright) x += 1;
    if (keys.w || keys.arrowup) y -= 1;
    if (keys.s || keys.arrowdown) y += 1;
    if (x !== 0 && y !== 0) {
      var len = Math.sqrt(2);
      x /= len; y /= len;
    }
    return { x: x, y: y };
  }

  function wasPressed(name) {
    return !!pressed[name];
  }

  // Interact is E, Space, or Enter.
  function interactPressed() {
    return pressed.e || pressed.space || pressed.enter;
  }

  function endFrame() {
    pressed = {};
    mouse.clicked = false;
  }

  SS.input = {
    attach: attach,
    moveVector: moveVector,
    wasPressed: wasPressed,
    interactPressed: interactPressed,
    endFrame: endFrame,
    mouse: mouse,
    keys: keys
  };
})();
