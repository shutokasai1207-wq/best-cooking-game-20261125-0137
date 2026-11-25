// Sizzle & Serve — shared constants, recipes and kitchen layout.
// Every file in this game attaches its part to the window.SS namespace.
window.SS = window.SS || {};
(function () {
  'use strict';

  var SS = window.SS;

  // Canvas size (the game is drawn at this fixed resolution and scaled by CSS).
  SS.W = 1280;
  SS.H = 720;

  // The shift (one round) lasts 180 seconds.
  SS.SHIFT_SECONDS = 180;

  // Player movement speed in pixels per second.
  SS.PLAYER_SPEED = 250;
  SS.PLAYER_RADIUS = 20;

  // How long each kitchen job takes.
  SS.CHOP_SECONDS = 2.2;
  SS.COOK_SECONDS = 6.0;
  SS.BURN_SECONDS = 14.0;

  // Scoring.
  SS.SCORE_PER_DISH = 100;
  SS.PATIENCE_BONUS_MAX = 80;
  SS.WRONG_DISH_PENALTY = 25;
  SS.COMBO_WINDOW_SECONDS = 12;

  // Colors used across the kitchen.
  SS.COLORS = {
    floorA: '#c98f5f',
    floorB: '#bd8252',
    wall: '#8a5a33',
    wallTop: '#a06a3c',
    counter: '#e8dcc8',
    counterEdge: '#b09a7a',
    board: '#f5ead2',
    stove: '#4a4a52',
    stoveHot: '#e2574c',
    plate: '#ffffff',
    ink: '#2b2118',
    hud: '#fff6e3',
    ticket: '#fff8e7',
    ticketEdge: '#d9b96a',
    good: '#4caf50',
    bad: '#e53935',
    warn: '#ff9800',
    serve: '#7ec8e3',
    trash: '#5d6d7e'
  };

  // Ingredients. chop: needs the chopping board. cook: needs the stove.
  // icon: a one-letter draw code used by the renderer.
  SS.INGREDIENTS = {
    bun:     { name: 'Bun',     color: '#e8b96a', chop: false, cook: false, icon: 'B' },
    patty:   { name: 'Patty',   color: '#8d5a3b', chop: false, cook: true,  icon: 'P' },
    tomato:  { name: 'Tomato',  color: '#e53935', chop: true,  cook: false, icon: 'T' },
    lettuce: { name: 'Lettuce', color: '#66bb6a', chop: true,  cook: false, icon: 'L' },
    cheese:  { name: 'Cheese',  color: '#ffca28', chop: false, cook: false, icon: 'C' },
    onion:   { name: 'Onion',   color: '#ce93d8', chop: true,  cook: false, icon: 'O' }
  };

  // Dishes on the menu. Each recipe lists the finished items a plate must hold.
  // A cooked patty is 'pattyCooked'; a chopped item is '<id>Chopped'.
  SS.DISHES = {
    burger: {
      name: 'Classic Burger',
      recipe: ['bun', 'pattyCooked', 'lettuceChopped'],
      price: 12
    },
    cheeseBurger: {
      name: 'Cheese Burger',
      recipe: ['bun', 'pattyCooked', 'cheese', 'tomatoChopped'],
      price: 16
    },
    salad: {
      name: 'Garden Salad',
      recipe: ['lettuceChopped', 'tomatoChopped', 'onionChopped'],
      price: 10
    },
    doubleStack: {
      name: 'Double Stack',
      recipe: ['bun', 'pattyCooked', 'pattyCooked', 'cheese'],
      price: 20
    }
  };

  // Short tips shown on the title screen, one picked at random.
  SS.TIPS = [
    'Chop while a patty grills — never stand still.',
    'A burnt patty goes in the trash. Watch the stove bar!',
    'Serve fast: a full patience bar pays a bigger bonus.',
    'Chain serves within 12 seconds to build a combo.'
  ];

  // Kitchen layout. Stations are rectangles the player walks up to and uses.
  // kind: crate | board | stove | plate | serve | trash
  SS.STATIONS = [
    // Ingredient crates along the left wall.
    { id: 'crate-bun',     kind: 'crate', item: 'bun',     x: 16,  y: 150, w: 92, h: 76 },
    { id: 'crate-patty',   kind: 'crate', item: 'patty',   x: 16,  y: 240, w: 92, h: 76 },
    { id: 'crate-tomato',  kind: 'crate', item: 'tomato',  x: 16,  y: 330, w: 92, h: 76 },
    { id: 'crate-lettuce', kind: 'crate', item: 'lettuce', x: 16,  y: 420, w: 92, h: 76 },
    { id: 'crate-cheese',  kind: 'crate', item: 'cheese',  x: 16,  y: 510, w: 92, h: 76 },
    { id: 'crate-onion',   kind: 'crate', item: 'onion',   x: 16,  y: 600, w: 92, h: 76 },
    // Chopping boards along the top wall.
    { id: 'board-1', kind: 'board', x: 300, y: 84, w: 130, h: 70 },
    { id: 'board-2', kind: 'board', x: 460, y: 84, w: 130, h: 70 },
    // Stoves along the top wall, right side.
    { id: 'stove-1', kind: 'stove', x: 700, y: 84, w: 130, h: 70 },
    { id: 'stove-2', kind: 'stove', x: 860, y: 84, w: 130, h: 70 },
    // Plating counters along the bottom.
    { id: 'plate-1', kind: 'plate', x: 300, y: 620, w: 130, h: 70 },
    { id: 'plate-2', kind: 'plate', x: 460, y: 620, w: 130, h: 70 },
    // Serving window, bottom right. Trash, bottom left.
    { id: 'serve', kind: 'serve', x: 1020, y: 620, w: 220, h: 70 },
    { id: 'trash', kind: 'trash', x: 140, y: 620, w: 110, h: 70 }
  ];

  // Where the chef starts each shift.
  SS.PLAYER_START = { x: 640, y: 400 };

  // The walkable area of the kitchen floor.
  SS.FLOOR = { x: 8, y: 76, w: 1264, h: 636 };
})();
