// Sizzle & Serve — order tickets: spawning, patience, scoring.
// An order is a dish plus a patience meter; serving the matching plate scores.
(function () {
  'use strict';

  var SS = window.SS;

  var DISH_KEYS = ['burger', 'cheeseBurger', 'salad', 'doubleStack'];
  var nextId = 1;

  function makeOrder(elapsed, difficulty) {
    var key = DISH_KEYS[Math.floor(Math.random() * DISH_KEYS.length)];
    var dish = SS.DISHES[key];
    var patience = Math.max(28, 50 - difficulty * 4);
    return {
      id: nextId++,
      dishKey: key,
      dishName: dish.name,
      recipe: dish.recipe.slice(),
      price: dish.price,
      patience: patience,
      patienceMax: patience,
      bornAt: elapsed
    };
  }

  function createManager() {
    return {
      active: [],
      served: 0,
      failed: 0,
      score: 0,
      money: 0,
      combo: 0,
      comboTimer: 0,
      bestCombo: 0,
      spawnTimer: 6,
      popups: []
    };
  }

  function spawnInterval(difficulty) {
    return Math.max(7, 14 - difficulty);
  }

  function update(manager, dt, elapsed, difficulty) {
    manager.spawnTimer -= dt;
    if (manager.spawnTimer <= 0 && manager.active.length < 4) {
      manager.active.push(makeOrder(elapsed, difficulty));
      manager.spawnTimer = spawnInterval(difficulty);
      SS.audio.play('order');
    }
    for (var i = manager.active.length - 1; i >= 0; i--) {
      var o = manager.active[i];
      o.patience -= dt;
      if (o.patience <= 0) {
        manager.active.splice(i, 1);
        manager.failed++;
        manager.combo = 0;
        manager.popups.push({ text: 'Order lost!', x: 640, y: 200, life: 1.4, color: SS.COLORS.bad });
        SS.audio.play('error');
      }
    }
    if (manager.comboTimer > 0) {
      manager.comboTimer -= dt;
      if (manager.comboTimer <= 0) manager.combo = 0;
    }
    for (var j = manager.popups.length - 1; j >= 0; j--) {
      manager.popups[j].life -= dt;
      manager.popups[j].y -= 24 * dt;
      if (manager.popups[j].life <= 0) manager.popups.splice(j, 1);
    }
  }

  // Does a plate's items exactly match an order's recipe (order-insensitive)?
  function plateMatchesOrder(plateItems, order) {
    if (plateItems.length !== order.recipe.length) return false;
    var need = order.recipe.slice().sort();
    var have = plateItems.slice().sort();
    for (var i = 0; i < need.length; i++) {
      if (need[i] !== have[i]) return false;
    }
    return true;
  }

  function findMatchingOrder(manager, plateItems) {
    for (var i = 0; i < manager.active.length; i++) {
      if (plateMatchesOrder(plateItems, manager.active[i])) return manager.active[i];
    }
    return null;
  }

  function serveOrder(manager, order) {
    var idx = manager.active.indexOf(order);
    if (idx >= 0) manager.active.splice(idx, 1);
    var patienceRatio = Math.max(0, order.patience / order.patienceMax);
    var gained = Math.round(SS.SCORE_PER_DISH + SS.PATIENCE_BONUS_MAX * patienceRatio);
    if (manager.comboTimer > 0) manager.combo++;
    else manager.combo = 1;
    manager.comboTimer = SS.COMBO_WINDOW_SECONDS;
    if (manager.combo > manager.bestCombo) manager.bestCombo = manager.combo;
    var total = gained * manager.combo;
    manager.score += total;
    manager.money += order.price;
    manager.served++;
    manager.popups.push({
      text: '+' + total + (manager.combo > 1 ? '  x' + manager.combo + ' COMBO!' : ''),
      x: 1130, y: 640, life: 1.6, color: SS.COLORS.good
    });
    SS.audio.play('serve');
    return total;
  }

  function serveWrong(manager) {
    manager.score = Math.max(0, manager.score - SS.WRONG_DISH_PENALTY);
    manager.combo = 0;
    manager.popups.push({ text: 'Wrong dish! -' + SS.WRONG_DISH_PENALTY, x: 1130, y: 640, life: 1.4, color: SS.COLORS.bad });
    SS.audio.play('error');
  }

  // How many active orders are about to run out of patience.
  function urgentCount(manager) {
    var n = 0;
    manager.active.forEach(function (o) {
      if (o.patience / o.patienceMax < 0.3) n++;
    });
    return n;
  }

  SS.orders = {
    createManager: createManager,
    update: update,
    findMatchingOrder: findMatchingOrder,
    serveOrder: serveOrder,
    serveWrong: serveWrong,
    plateMatchesOrder: plateMatchesOrder,
    urgentCount: urgentCount
  };
})();
