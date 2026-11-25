// Sizzle & Serve — game loop, screens and screenshot set-ups.
// States: 'title' -> 'playing' -> 'done'. A ?shot= param stages a scene
// for screenshots without changing how the game plays.
(function () {
  'use strict';

  var SS = window.SS;

  var game = {
    state: 'title',
    elapsed: 0,
    difficulty: 0,
    world: null,
    orders: null,
    time: 0,
    flash: 0,
    paused: false,
    tip: ''
  };
  SS.game = game;

  function newShift() {
    game.world = SS.world.createWorld();
    game.orders = SS.orders.createManager();
    game.elapsed = 0;
    game.difficulty = 0;
    game.state = 'playing';
    game.paused = false;
    game.tip = SS.TIPS[Math.floor(Math.random() * SS.TIPS.length)];
    SS.audio.unlock();
    SS.audio.startMusic();
  }

  function difficultyAt(elapsed) {
    return Math.min(5, Math.floor(elapsed / 30));
  }

  function update(dt) {
    game.time += dt;
    if (game.paused) return;
    if (game.state === 'playing') {
      game.elapsed += dt;
      game.difficulty = difficultyAt(game.elapsed);
      SS.orders.update(game.orders, dt, game.elapsed, game.difficulty);
      SS.world.update(game.world, SS.orders, dt);
      if (game.elapsed >= SS.SHIFT_SECONDS) {
        game.state = 'done';
        SS.audio.stopMusic();
        SS.audio.stopSizzle();
        if (game.orders.score >= 900) SS.audio.play('win');
        else SS.audio.play('ding');
      }
    }
  }

  function drawTitle(ctx) {
    SS.render.drawWorld(ctx, {
      world: game.world,
      orders: game.orders,
      elapsed: 0
    }, game.time);
    ctx.save();
    ctx.fillStyle = 'rgba(30,18,8,0.55)';
    ctx.fillRect(0, 0, SS.W, SS.H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText('SIZZLE & SERVE', SS.W / 2, 240);
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#ffca28';
    ctx.fillText('A tiny kitchen, a hungry lunch rush.', SS.W / 2, 292);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Chop it. Grill it. Plate it. Serve it before the ticket runs out!', SS.W / 2, 340);
    ctx.fillText('Move with WASD or arrows — press E or Space at a station to use it.', SS.W / 2, 372);
    ctx.fillText('Burgers, cheese burgers, double stacks and garden salads are on the menu.', SS.W / 2, 404);
    if (game.tip) {
      ctx.fillStyle = '#ffe0b2';
      ctx.font = 'italic 17px sans-serif';
      ctx.fillText('Tip: ' + game.tip, SS.W / 2, 432);
    }
    var pulse = 0.7 + 0.3 * Math.sin(game.time * 4);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.roundRect(SS.W / 2 - 170, 450, 340, 64, 12);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('START SHIFT  (Enter)', SS.W / 2, 491);
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#ffe0b2';
    ctx.fillText('3-minute shift  •  combos multiply your score  •  don\'t burn the patties!', SS.W / 2, 556);
    ctx.restore();
  }

  function drawDone(ctx) {
    ctx.save();
    ctx.fillStyle = '#2b2118';
    ctx.fillRect(0, 0, SS.W, SS.H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText('SHIFT OVER!', SS.W / 2, 200);
    var o = game.orders;
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#ffca28';
    ctx.fillText('Score: ' + o.score + '    •    $' + o.money + ' earned', SS.W / 2, 280);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.fillText('Dishes served: ' + o.served + '    •    Orders lost: ' + o.failed, SS.W / 2, 340);
    ctx.fillText('Best combo: x' + o.bestCombo, SS.W / 2, 384);
    var verdict = o.score >= 1500 ? 'Head chef material!' :
      o.score >= 900 ? 'A solid lunch rush.' : 'The kitchen survived. Barely.';
    ctx.fillStyle = '#a5d6a7';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(verdict, SS.W / 2, 448);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Press Enter to cook another shift.', SS.W / 2, 520);
    ctx.restore();
  }

  function draw(ctx) {
    if (game.state === 'title') {
      drawTitle(ctx);
    } else if (game.state === 'done') {
      drawDone(ctx);
    } else {
      SS.render.drawWorld(ctx, game, game.time);
    }
  }

  function handleClick() {
    var m = SS.input.mouse;
    if (!m.clicked) return;
    if (game.state === 'title') {
      var inButton = m.x > SS.W / 2 - 170 && m.x < SS.W / 2 + 170 && m.y > 450 && m.y < 514;
      if (inButton) newShift();
      return;
    }
    if (game.state === 'done') {
      newShift();
      return;
    }
    // Clicking a station walks the chef next to it and uses it.
    var st = SS.world.stationAt(game.world, m.x, m.y);
    if (st) {
      var d = st.def;
      game.world.player.x = d.x + d.w / 2;
      game.world.player.y = d.y + d.h + SS.PLAYER_RADIUS + 4;
      if (game.world.player.y > SS.FLOOR.y + SS.FLOOR.h - SS.PLAYER_RADIUS) {
        game.world.player.y = d.y - SS.PLAYER_RADIUS - 4;
      }
      SS.world.update(game.world, SS.orders, 0);
      SS.input.interactPressed();
    }
  }

  function frame(now, ctx) {
    var dt = Math.min(0.05, (now - frame.last) / 1000 || 0);
    frame.last = now;
    if (game.state === 'title' && (SS.input.wasPressed('enter') || SS.input.wasPressed('space'))) {
      newShift();
    } else if (game.state === 'done' && SS.input.wasPressed('enter')) {
      newShift();
    }
    if (game.state === 'playing' && SS.input.wasPressed('p')) {
      game.paused = !game.paused;
      if (game.paused) SS.audio.stopSizzle();
    }
    handleClick();
    update(dt);
    draw(ctx);
    if (game.paused) {
      ctx.save();
      ctx.fillStyle = 'rgba(30,18,8,0.6)';
      ctx.fillRect(0, 0, SS.W, SS.H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff3d6';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText('PAUSED', SS.W / 2, SS.H / 2 - 10);
      ctx.font = '20px sans-serif';
      ctx.fillText('Press P to keep cooking. Tip: ' + game.tip, SS.W / 2, SS.H / 2 + 36);
      ctx.restore();
    }
    SS.input.endFrame();
    requestAnimationFrame(function (t) { frame(t, ctx); });
  }
  frame.last = 0;

  // Stage a fixed scene for screenshots. ?shot=title | ?shot=mid | ?shot=serve
  function setupShot(shot) {
    newShift();
    var w = game.world;
    var o = game.orders;
    if (shot === 'title') {
      game.state = 'title';
      game.elapsed = 0;
      return;
    }
    game.elapsed = 62;
    // Three live tickets with different patience.
    o.active = [
      { id: 1, dishKey: 'burger', dishName: 'Classic Burger',
        recipe: ['bun', 'pattyCooked', 'lettuceChopped'], price: 12,
        patience: 34, patienceMax: 46, bornAt: 20 },
      { id: 2, dishKey: 'salad', dishName: 'Garden Salad',
        recipe: ['lettuceChopped', 'tomatoChopped', 'onionChopped'], price: 10,
        patience: 18, patienceMax: 40, bornAt: 30 },
      { id: 3, dishKey: 'cheeseBurger', dishName: 'Cheese Burger',
        recipe: ['bun', 'pattyCooked', 'cheese', 'tomatoChopped'], price: 16,
        patience: 44, patienceMax: 50, bornAt: 45 }
    ];
    o.score = 320;
    o.money = 28;
    o.combo = 2;
    o.comboTimer = 8;
    if (shot === 'mid') {
      // Dish mid-assembly: bun + cooked patty on plate 1, chef chopping tomato.
      w.stations['plate-1'].plateItems = ['bun', 'pattyCooked'];
      w.stations['board-1'].item = 'tomato';
      w.stations['board-1'].progress = 0.55;
      w.stations['stove-1'].item = 'patty';
      w.stations['stove-1'].cookTime = 4.2;
      w.stations['stove-2'].item = 'pattyCooked';
      w.stations['stove-2'].cookTime = 6.5;
      w.player.x = 365;
      w.player.y = 200;
      w.player.hands = 'lettuce';
    } else if (shot === 'serve') {
      // Plate ready to serve: a finished burger on plate 2, chef carrying it.
      w.stations['plate-2'].plateItems = [];
      w.player.hands = 'plate:bun,pattyCooked,lettuceChopped';
      w.player.x = 1130;
      w.player.y = 590;
      w.stations['stove-1'].item = 'patty';
      w.stations['stove-1'].cookTime = 2.0;
      o.popups.push({ text: 'Ready to serve!', x: 1130, y: 560, life: 5, color: SS.COLORS.good });
    }
  }

  function boot() {
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    SS.input.attach(canvas);
    game.world = SS.world.createWorld();
    game.orders = SS.orders.createManager();
    var params = new URLSearchParams(window.location.search);
    var shot = params.get('shot');
    if (shot) {
      setupShot(shot);
    }
    canvas.addEventListener('mousedown', function () { SS.audio.unlock(); });
    requestAnimationFrame(function (t) { frame(t, ctx); });
  }

  window.addEventListener('load', boot);
})();
