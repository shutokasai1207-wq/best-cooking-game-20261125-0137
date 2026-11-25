// Sizzle & Serve — all sound is synthesized with the Web Audio API.
// No audio files are loaded; every effect is a small oscillator/noise recipe.
(function () {
  'use strict';

  var SS = window.SS;
  var ctx = null;
  var master = null;
  var musicOn = false;
  var musicTimer = null;
  var sizzleNodes = [];

  function ensure() {
    if (ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch (e) {
      return false;
    }
    return true;
  }

  function unlock() {
    if (ensure() && ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (!ensure()) return;
    var t0 = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, filterFreq) {
    if (!ensure()) return;
    var t0 = ctx.currentTime;
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filterFreq || 1200;
    var g = ctx.createGain();
    g.gain.value = vol || 0.2;
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t0);
  }

  // Named effects used by the game.
  var sfx = {
    pickup: function () { tone(520, 0.08, 'triangle', 0.18, 700); },
    drop: function () { tone(300, 0.08, 'triangle', 0.15, 220); },
    chop: function () { noise(0.09, 0.25, 900); tone(180, 0.07, 'square', 0.10, 120); },
    sizzleStart: function () { noise(0.25, 0.12, 4000); },
    ding: function () { tone(880, 0.25, 'sine', 0.22); tone(1320, 0.35, 'sine', 0.15); },
    serve: function () {
      tone(660, 0.12, 'triangle', 0.2);
      setTimeout(function () { tone(880, 0.12, 'triangle', 0.2); }, 90);
      setTimeout(function () { tone(1100, 0.2, 'triangle', 0.2); }, 180);
    },
    error: function () { tone(160, 0.25, 'sawtooth', 0.15, 110); },
    order: function () { tone(440, 0.1, 'sine', 0.15, 660); },
    tick: function () { tone(1000, 0.05, 'square', 0.08); }
  };

  // A short fanfare when a shift ends with a good score.
  sfx.win = function () {
    [523, 659, 784, 1047].forEach(function (f, i) {
      setTimeout(function () { tone(f, 0.22, 'triangle', 0.2); }, i * 110);
    });
  };

  function play(name) {
    if (sfx[name]) sfx[name]();
  }

  // A quiet looping bassline + hats for the kitchen, built from a step pattern.
  var bassNotes = [110, 110, 130.8, 98, 110, 110, 146.8, 164.8];
  var step = 0;

  function musicStep() {
    if (!musicOn || !ctx) return;
    var n = bassNotes[step % bassNotes.length];
    tone(n, 0.22, 'triangle', 0.10);
    if (step % 2 === 0) noise(0.03, 0.04, 6000);
    step++;
  }

  function startMusic() {
    if (!ensure()) return;
    if (musicOn) return;
    musicOn = true;
    musicTimer = setInterval(musicStep, 240);
  }

  function stopMusic() {
    musicOn = false;
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  // A short looping sizzle bed while something cooks on a stove.
  function startSizzle() {
    if (!ensure()) return;
    if (sizzleNodes.length) return;
    var len = ctx.sampleRate;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    var f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 4500;
    f.Q.value = 0.6;
    var g = ctx.createGain();
    g.gain.value = 0.05;
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start();
    sizzleNodes.push({ src: src, gain: g });
  }

  function stopSizzle() {
    sizzleNodes.forEach(function (n) {
      try { n.src.stop(); } catch (e) {}
    });
    sizzleNodes = [];
  }

  SS.audio = {
    unlock: unlock,
    play: play,
    startMusic: startMusic,
    stopMusic: stopMusic,
    startSizzle: startSizzle,
    stopSizzle: stopSizzle
  };
})();
