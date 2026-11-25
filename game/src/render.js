// Sizzle & Serve — all drawing is done in code on a 2D canvas.
// No images are loaded; every sprite is a small shape recipe.
(function () {
  'use strict';

  var SS = window.SS;
  var C = SS.COLORS;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawIngredient(ctx, item, x, y, size) {
    var s = size || 22;
    var base = item.replace('Chopped', '').replace('Cooked', '');
    var ing = SS.INGREDIENTS[base];
    var color = ing ? ing.color : '#cccccc';
    ctx.save();
    ctx.translate(x, y);
    if (item === 'bun') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 2, s * 0.55, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-s * 0.55, 2, s * 1.1, s * 0.22);
      ctx.fillStyle = '#fff8e1';
      ctx.fillRect(-s * 0.3, -s * 0.28, s * 0.12, s * 0.08);
      ctx.fillRect(0, -s * 0.38, s * 0.12, s * 0.08);
      ctx.fillRect(s * 0.25, -s * 0.26, s * 0.12, s * 0.08);
    } else if (item === 'patty') {
      ctx.fillStyle = color;
      rr(ctx, -s * 0.6, -s * 0.28, s * 1.2, s * 0.56, 6);
      ctx.fill();
    } else if (item === 'pattyCooked') {
      ctx.fillStyle = '#6d4c41';
      rr(ctx, -s * 0.6, -s * 0.28, s * 1.2, s * 0.56, 6);
      ctx.fill();
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(-s * 0.4, -s * 0.12, s * 0.2, s * 0.1);
      ctx.fillRect(s * 0.1, -s * 0.12, s * 0.25, s * 0.1);
    } else if (item === 'cheese') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, s * 0.3);
      ctx.lineTo(s * 0.6, s * 0.3);
      ctx.lineTo(s * 0.6, -s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e65100';
      ctx.beginPath();
      ctx.arc(-s * 0.2, s * 0.05, s * 0.08, 0, Math.PI * 2);
      ctx.arc(s * 0.25, -s * 0.05, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Round produce: tomato, lettuce, onion.
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
      if (item.indexOf('Chopped') >= 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-s * 0.3, -s * 0.1);
        ctx.lineTo(s * 0.3, s * 0.15);
        ctx.moveTo(s * 0.3, -s * 0.15);
        ctx.lineTo(-s * 0.25, s * 0.2);
        ctx.stroke();
      } else if (base === 'tomato') {
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(0, -s * 0.45, s * 0.14, 0, Math.PI * 2);
        ctx.fill();
      } else if (base === 'lettuce') {
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.32, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawPlate(ctx, items, x, y, size) {
    var s = size || 26;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = C.plate;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b0bec5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.72, s * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    var n = items.length;
    for (var i = 0; i < n; i++) {
      drawIngredient(ctx, items[i], (i - (n - 1) / 2) * s * 0.55, -i * 3, s * 0.62);
    }
    ctx.restore();
  }

  function drawStation(ctx, st, time) {
    var d = st.def;
    ctx.save();
    if (d.kind === 'crate') {
      ctx.fillStyle = '#7a5230';
      rr(ctx, d.x, d.y, d.w, d.h, 8);
      ctx.fill();
      ctx.fillStyle = C.counter;
      rr(ctx, d.x + 6, d.y + 6, d.w - 12, d.h - 12, 6);
      ctx.fill();
      drawIngredient(ctx, d.item, d.x + d.w / 2, d.y + d.h / 2 - 6, 26);
      ctx.fillStyle = C.ink;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(SS.INGREDIENTS[d.item].name, d.x + d.w / 2, d.y + d.h - 10);
    } else if (d.kind === 'board') {
      ctx.fillStyle = C.board;
      rr(ctx, d.x, d.y, d.w, d.h, 8);
      ctx.fill();
      ctx.strokeStyle = '#c9a86a';
      ctx.lineWidth = 3;
      rr(ctx, d.x + 4, d.y + 4, d.w - 8, d.h - 8, 6);
      ctx.stroke();
      if (st.item) {
        drawIngredient(ctx, st.item, d.x + d.w / 2, d.y + d.h / 2 - 4, 26);
        if (st.progress > 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.fillRect(d.x + 10, d.y + d.h - 16, d.w - 20, 8);
          ctx.fillStyle = C.good;
          ctx.fillRect(d.x + 10, d.y + d.h - 16, (d.w - 20) * st.progress, 8);
        }
      }
      ctx.fillStyle = C.ink;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CHOP', d.x + d.w / 2, d.y - 6);
    } else if (d.kind === 'stove') {
      ctx.fillStyle = C.stove;
      rr(ctx, d.x, d.y, d.w, d.h, 8);
      ctx.fill();
      var hot = st.item === 'patty' || st.item === 'pattyCooked';
      ctx.fillStyle = hot ? C.stoveHot : '#33333a';
      ctx.beginPath();
      ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 24, 0, Math.PI * 2);
      ctx.stroke();
      if (st.item) {
        drawIngredient(ctx, st.item, d.x + d.w / 2, d.y + d.h / 2, 24);
        var ratio = st.burned ? 1 : Math.min(1, st.cookTime / SS.COOK_SECONDS);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(d.x + 10, d.y + d.h - 14, d.w - 20, 7);
        ctx.fillStyle = st.burned ? C.bad : (ratio >= 1 ? C.warn : '#ffb74d');
        ctx.fillRect(d.x + 10, d.y + d.h - 14, (d.w - 20) * ratio, 7);
        if (st.burned) {
          ctx.fillStyle = C.bad;
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('BURNT!', d.x + d.w / 2, d.y - 6);
        }
      }
      ctx.fillStyle = '#cfd8dc';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STOVE', d.x + d.w / 2, d.y - 6);
    } else if (d.kind === 'plate') {
      ctx.fillStyle = C.counter;
      rr(ctx, d.x, d.y, d.w, d.h, 8);
      ctx.fill();
      ctx.strokeStyle = C.counterEdge;
      ctx.lineWidth = 3;
      rr(ctx, d.x, d.y, d.w, d.h, 8);
      ctx.stroke();
      drawPlate(ctx, st.plateItems, d.x + d.w / 2, d.y + d.h / 2 + 4, 30);
      ctx.fillStyle = C.ink;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PLATE', d.x + d.w / 2, d.y - 6);
    } else if (d.kind === 'serve') {
      ctx.fillStyle = C.serve;
      rr(ctx, d.x, d.y, d.w, d.h, 8);
      ctx.fill();
      ctx.fillStyle = '#0277bd';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SERVE  →', d.x + d.w / 2, d.y + d.h / 2 + 7);
    } else if (d.kind === 'trash') {
      ctx.fillStyle = C.trash;
      rr(ctx, d.x, d.y, d.w, d.h, 8);
      ctx.fill();
      ctx.fillStyle = '#eceff1';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TRASH', d.x + d.w / 2, d.y + d.h / 2 + 5);
    }
    ctx.restore();
  }

  function drawPlayer(ctx, p, time) {
    ctx.save();
    ctx.translate(p.x, p.y);
    var bob = p.moving ? Math.sin(time * 12) * 2 : 0;
    // Shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body (apron).
    ctx.fillStyle = '#f5f5f5';
    rr(ctx, -16, -6 + bob, 32, 26, 10);
    ctx.fill();
    ctx.fillStyle = '#e53935';
    ctx.fillRect(-16, 8 + bob, 32, 6);
    // Head.
    ctx.fillStyle = '#ffcc9e';
    ctx.beginPath();
    ctx.arc(0, -16 + bob, 13, 0, Math.PI * 2);
    ctx.fill();
    // Chef hat.
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-8, -26 + bob, 8, 0, Math.PI * 2);
    ctx.arc(0, -29 + bob, 9, 0, Math.PI * 2);
    ctx.arc(8, -26 + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-13, -28 + bob, 26, 6);
    // Eyes.
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-5 + p.dir * 2, -16 + bob, 1.8, 0, Math.PI * 2);
    ctx.arc(5 + p.dir * 2, -16 + bob, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Carried item above the head.
    if (p.hands) {
      var hy = -46 + bob;
      if (p.hands.indexOf('plate:') === 0) {
        drawPlate(ctx, p.hands.slice(6).split(','), 0, hy, 24);
      } else {
        drawIngredient(ctx, p.hands, 0, hy, 24);
      }
    }
    // Chop animation: a little knife flash.
    if (p.chopAnim > 0) {
      ctx.strokeStyle = '#eceff1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, -30);
      ctx.lineTo(26, -14);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTicket(ctx, order, x, y, w, h) {
    var ratio = Math.max(0, order.patience / order.patienceMax);
    ctx.save();
    ctx.fillStyle = C.ticket;
    rr(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = ratio < 0.3 ? C.bad : C.ticketEdge;
    ctx.lineWidth = ratio < 0.3 ? 3 : 2;
    rr(ctx, x, y, w, h, 8);
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(order.dishName, x + 10, y + 20);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#6d4c41';
    ctx.fillText('$' + order.price, x + 10, y + 38);
    // Recipe icons.
    var ix = x + 10;
    order.recipe.forEach(function (item) {
      drawIngredient(ctx, item, ix + 12, y + h - 18, 15);
      ix += 30;
    });
    // Patience bar.
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 8, y + h - 8, w - 16, 5);
    ctx.fillStyle = ratio < 0.3 ? C.bad : (ratio < 0.6 ? C.warn : C.good);
    ctx.fillRect(x + 8, y + h - 8, (w - 16) * ratio, 5);
    ctx.restore();
  }

  function drawHud(ctx, game) {
    var orders = game.orders;
    ctx.save();
    // Top bar.
    ctx.fillStyle = C.hud;
    ctx.fillRect(0, 0, SS.W, 76);
    ctx.fillStyle = C.wallTop;
    ctx.fillRect(0, 76, SS.W, 6);
    // Order board label + tickets.
    ctx.fillStyle = C.ink;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ORDERS', 16, 22);
    var tx = 110;
    orders.active.forEach(function (o) {
      drawTicket(ctx, o, tx, 6, 190, 64);
      tx += 200;
    });
    if (orders.active.length === 0) {
      ctx.fillStyle = '#8d6e63';
      ctx.font = '13px sans-serif';
      ctx.fillText('No orders yet — customers are on their way!', tx, 42);
    }
    // Timer, score, money, combo (right side).
    var timeLeft = Math.max(0, SS.SHIFT_SECONDS - game.elapsed);
    var mm = Math.floor(timeLeft / 60);
    var ss = Math.floor(timeLeft % 60);
    ctx.textAlign = 'right';
    ctx.fillStyle = timeLeft < 30 ? C.bad : C.ink;
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(mm + ':' + (ss < 10 ? '0' : '') + ss, SS.W - 16, 34);
    ctx.fillStyle = C.ink;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Score ' + orders.score, SS.W - 16, 56);
    ctx.font = '13px sans-serif';
    ctx.fillText('$' + orders.money + ' earned', SS.W - 130, 56);
    if (orders.combo > 1) {
      ctx.fillStyle = '#e65100';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('COMBO x' + orders.combo, SS.W - 250, 56);
    }
    ctx.restore();
  }

  function drawFloor(ctx) {
    var tile = 64;
    for (var y = 0; y < SS.H; y += tile) {
      for (var x = 0; x < SS.W; x += tile) {
        ctx.fillStyle = ((x / tile + y / tile) % 2 === 0) ? C.floorA : C.floorB;
        ctx.fillRect(x, y, tile, tile);
      }
    }
    // Top wall band.
    ctx.fillStyle = C.wall;
    ctx.fillRect(0, 0, SS.W, 76);
    ctx.fillStyle = C.wallTop;
    ctx.fillRect(0, 70, SS.W, 6);
  }

  function drawWorld(ctx, game, time) {
    drawFloor(ctx);
    Object.keys(game.world.stations).forEach(function (id) {
      drawStation(ctx, game.world.stations[id], time);
    });
    // Highlight the station the chef can use right now.
    var near = game.world.nearStation;
    if (near && game.state !== 'title') {
      var d = near.def;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 + 0.35 * Math.sin(time * 5)) + ')';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      rr(ctx, d.x - 6, d.y - 6, d.w + 12, d.h + 12, 12);
      ctx.stroke();
      ctx.restore();
    }
    // Particles.
    game.world.particles.forEach(function (pt) {
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    drawPlayer(ctx, game.world.player, time);
    // Popups.
    game.orders.popups.forEach(function (p) {
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.fillStyle = p.color;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1;
    drawHud(ctx, game);
    // Context hint at the bottom.
    ctx.fillStyle = 'rgba(43,33,24,0.75)';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    var hint = 'Move: WASD / Arrows   •   Use station: E or Space   •   Click a station to use it too   •   P: pause';
    ctx.fillText(hint, 16, SS.H - 12);
  }

  SS.render = {
    drawWorld: drawWorld,
    drawIngredient: drawIngredient,
    drawPlate: drawPlate
  };
})();
