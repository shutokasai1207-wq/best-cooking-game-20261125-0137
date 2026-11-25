// Sizzle & Serve — the kitchen world: player, stations and interactions.
// The player carries one item at a time. Stations hold items while they work.
(function () {
  'use strict';

  var SS = window.SS;

  function createWorld() {
    var stations = {};
    SS.STATIONS.forEach(function (s) {
      stations[s.id] = {
        def: s,
        item: null,        // item resting on the station (or null)
        progress: 0,       // chop / cook progress 0..1
        cookTime: 0,       // seconds the patty has cooked
        burned: false,
        plateItems: []     // for plate stations: items stacked on the plate
      };
    });
    return {
      player: {
        x: SS.PLAYER_START.x,
        y: SS.PLAYER_START.y,
        dir: 1,
        hands: null,
        moving: false,
        chopAnim: 0
      },
      stations: stations,
      particles: [],
      interactHeld: 0
    };
  }

  function stationAt(world, x, y) {
    var best = null;
    var bestD = 1e9;
    Object.keys(world.stations).forEach(function (id) {
      var st = world.stations[id];
      var d = st.def;
      var cx = d.x + d.w / 2;
      var cy = d.y + d.h / 2;
      var dist = Math.hypot(x - cx, y - cy);
      if (dist < bestD) { bestD = dist; best = st; }
    });
    return bestD < 110 ? best : null;
  }

  function rectsOverlap(ax, ay, aw, ah, b) {
    return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
  }

  function collides(x, y) {
    if (x < SS.FLOOR.x + SS.PLAYER_RADIUS || x > SS.FLOOR.x + SS.FLOOR.w - SS.PLAYER_RADIUS) return true;
    if (y < SS.FLOOR.y + SS.PLAYER_RADIUS || y > SS.FLOOR.y + SS.FLOOR.h - SS.PLAYER_RADIUS) return true;
    for (var i = 0; i < SS.STATIONS.length; i++) {
      var d = SS.STATIONS[i];
      if (rectsOverlap(x - SS.PLAYER_RADIUS, y - SS.PLAYER_RADIUS,
          SS.PLAYER_RADIUS * 2, SS.PLAYER_RADIUS * 2, d)) return true;
    }
    return false;
  }

  function movePlayer(world, dt) {
    var p = world.player;
    var v = SS.input.moveVector();
    p.moving = (v.x !== 0 || v.y !== 0);
    if (v.x !== 0) p.dir = v.x > 0 ? 1 : -1;
    var nx = p.x + v.x * SS.PLAYER_SPEED * dt;
    var ny = p.y + v.y * SS.PLAYER_SPEED * dt;
    if (!collides(nx, p.y)) p.x = nx;
    if (!collides(p.x, ny)) p.y = ny;
  }

  function burst(world, x, y, color, n) {
    for (var i = 0; i < n; i++) {
      world.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 140,
        vy: -Math.random() * 120 - 20,
        life: 0.6 + Math.random() * 0.4,
        color: color,
        size: 3 + Math.random() * 4
      });
    }
  }

  // What the player is carrying becomes a finished item name.
  // 'tomato' chopped -> 'tomatoChopped'; 'patty' cooked -> 'pattyCooked'.
  function finishedName(item) {
    return item;
  }

  function interact(world, orders) {
    var p = world.player;
    var st = stationAt(world, p.x, p.y);
    if (!st) return;
    var d = st.def;
    var def = SS.INGREDIENTS;

    if (d.kind === 'crate') {
      if (p.hands) return;
      p.hands = d.item;
      SS.audio.play('pickup');
      return;
    }

    if (d.kind === 'trash') {
      if (p.hands) {
        // Trash takes anything, including a whole plated dish.
        p.hands = null;
        SS.audio.play('drop');
      }
      return;
    }

    if (d.kind === 'board') {
      if (st.item) {
        // Take the finished chopped item back.
        if (!p.hands) {
          p.hands = st.item;
          st.item = null;
          st.progress = 0;
          SS.audio.play('pickup');
        }
        return;
      }
      if (p.hands && def[p.hands] && def[p.hands].chop) {
        st.item = p.hands;
        st.progress = 0;
        p.hands = null;
        SS.audio.play('drop');
      }
      return;
    }

    if (d.kind === 'stove') {
      if (st.item === 'pattyCooked' || st.burned) {
        if (!p.hands) {
          if (st.burned) {
            st.item = null;
            st.burned = false;
            st.cookTime = 0;
            SS.audio.play('drop');
          } else {
            p.hands = st.item;
            st.item = null;
            st.cookTime = 0;
            SS.audio.play('pickup');
          }
        }
        return;
      }
      if (st.item) return; // still cooking
      if (p.hands === 'patty') {
        st.item = 'patty';
        st.cookTime = 0;
        p.hands = null;
        SS.audio.play('sizzleStart');
      }
      return;
    }

    if (d.kind === 'plate') {
      if (p.hands) {
        // Add the carried item to the plate.
        st.plateItems.push(p.hands);
        p.hands = null;
        SS.audio.play('drop');
      } else if (st.plateItems.length > 0) {
        // Pick the whole plate back up.
        p.hands = 'plate:' + st.plateItems.join(',');
        st.plateItems = [];
        SS.audio.play('pickup');
      }
      return;
    }

    if (d.kind === 'serve') {
      if (p.hands && p.hands.indexOf('plate:') === 0) {
        var items = p.hands.slice(6).split(',');
        var order = orders.findMatchingOrder(SS.game.orders, items);
        if (order) {
          var gained = orders.serveOrder(SS.game.orders, order);
          burst(world, d.x + d.w / 2, d.y + d.h / 2, '#ffd54f', 26);
          p.hands = null;
          return gained;
        }
        orders.serveWrong(SS.game.orders);
        p.hands = null;
      }
      return;
    }
  }

  function updateStations(world, dt) {
    Object.keys(world.stations).forEach(function (id) {
      var st = world.stations[id];
      var d = st.def;
      if (d.kind === 'board' && st.item) {
        // Chopping runs on its own once an item is on the board, so the
        // chef can go and grill a patty while the knife works. (Holding
        // the use key to chop would re-trigger interact and snatch the
        // item straight back off the board.)
        st.progress += dt / SS.CHOP_SECONDS;
        if (stationAt(world, world.player.x, world.player.y) === st) {
          world.player.chopAnim = 0.18;
        }
        if (Math.random() < dt * 6) {
          burst(world, d.x + d.w / 2, d.y + d.h / 2, '#ffffff', 2);
          SS.audio.play('chop');
        }
        if (st.progress >= 1) {
          st.item = st.item + 'Chopped';
          st.progress = 0;
          SS.audio.play('ding');
        }
      }
      if (d.kind === 'stove' && st.item === 'patty' && !st.burned) {
        st.cookTime += dt;
        if (Math.random() < dt * 8) {
          burst(world, d.x + d.w / 2, d.y + 10, '#bbbbbb', 1);
        }
        if (st.cookTime >= SS.COOK_SECONDS && st.item !== 'pattyCooked') {
          st.item = 'pattyCooked';
          SS.audio.play('ding');
        }
        if (st.cookTime >= SS.BURN_SECONDS) {
          st.burned = true;
          SS.audio.play('error');
        }
      }
    });
    var anyCooking = false;
    Object.keys(world.stations).forEach(function (id) {
      var st = world.stations[id];
      if (st.def.kind === 'stove' && st.item === 'patty') anyCooking = true;
    });
    if (anyCooking) SS.audio.startSizzle();
    else SS.audio.stopSizzle();
  }

  function updateParticles(world, dt) {
    for (var i = world.particles.length - 1; i >= 0; i--) {
      var pt = world.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 260 * dt;
      if (pt.life <= 0) world.particles.splice(i, 1);
    }
    if (world.player.chopAnim > 0) world.player.chopAnim -= dt;
  }

  function update(world, orders, dt) {
    movePlayer(world, dt);
    // Remember the station the chef is standing at, so the renderer can
    // highlight it and the HUD can name it.
    world.nearStation = stationAt(world, world.player.x, world.player.y);
    if (SS.input.interactPressed()) interact(world, orders);
    updateStations(world, dt);
    updateParticles(world, dt);
  }

  SS.world = {
    createWorld: createWorld,
    update: update,
    stationAt: stationAt,
    finishedName: finishedName
  };
})();
