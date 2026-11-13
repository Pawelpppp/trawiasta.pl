/* Krzysztof kontra CTO — gra na /gra (vanilla canvas). */
(function () {
  var ok = false;
  try { ok = sessionStorage.getItem('trawiasta_zalogowany') === '1'; } catch (e) {}
  if (!ok) {
    location.replace('/logowanie/?next=/gra/');
    return;
  }

  var GAME_W = 480;
  var GAME_H = 800;
  var BUDGET_GOAL = 1000;
  var BOSS_HP_MAX = 100;
  var BOSS_HIT = 10;
  var SHOT_COST = 10;
  var SHOT_COOLDOWN = 0.28;
  var COFFEE_TIME = 5;
  var INVULN = 1.15;
  var LIVES_MAX = 3;

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var stageEl = document.getElementById('stage');
  var appEl = document.getElementById('app');
  var hud = document.getElementById('hud');
  var hudLives = document.getElementById('hud-lives');
  var hudBudget = document.getElementById('hud-budget');
  var hudScore = document.getElementById('hud-score');
  var hudStage = document.getElementById('hud-stage');
  var hudCoffee = document.getElementById('hud-coffee');
  var ovStart = document.getElementById('overlay-start');
  var ovPause = document.getElementById('overlay-pause');
  var ovWin = document.getElementById('overlay-win');
  var ovOver = document.getElementById('overlay-over');
  var btnPlay = document.getElementById('btn-play');
  var btnMute = document.getElementById('btn-mute');
  var iconMute = document.getElementById('icon-mute');
  var btnShoot = document.getElementById('btn-shoot');
  var btnLeft = document.getElementById('btn-left');
  var btnRight = document.getElementById('btn-right');

  var ICON_ON = '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/>';
  var ICON_OFF = '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/>';

  var imgK = null;
  var imgCto = null;
  var imgBg = null;
  function loadImg(src, setter) {
    var im = new Image();
    im.onload = function () { setter(im); };
    im.onerror = function () { setter(null); };
    im.src = src;
  }
  loadImg('/gra/krzysztof.png', function (im) { imgK = im; });
  loadImg('/gra/cto.png', function (im) { imgCto = im; });
  loadImg('/gra/tlo.jpg', function (im) { imgBg = im; });

  /* ---------- dźwięk (Web Audio, retro) ---------- */
  var audio = {
    ac: null,
    master: null,
    muted: false,
    alarmNodes: []
  };
  try { audio.muted = localStorage.getItem('trawiasta_gra_mute') === '1'; } catch (e) {}

  function audioEnsure() {
    if (!audio.ac) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio.ac = new AC();
      audio.master = audio.ac.createGain();
      audio.master.gain.value = audio.muted ? 0 : 0.22;
      audio.master.connect(audio.ac.destination);
    }
    if (audio.ac.state === 'suspended') audio.ac.resume();
    return audio.ac;
  }

  function setMuted(m) {
    audio.muted = !!m;
    try { localStorage.setItem('trawiasta_gra_mute', audio.muted ? '1' : '0'); } catch (e) {}
    if (audio.master) audio.master.gain.value = audio.muted ? 0 : 0.22;
    btnMute.setAttribute('aria-pressed', audio.muted ? 'true' : 'false');
    btnMute.setAttribute('aria-label', audio.muted ? 'Włącz dźwięk' : 'Wycisz dźwięk');
    btnMute.title = audio.muted ? 'Dźwięk wyłączony' : 'Dźwięk włączony';
    iconMute.innerHTML = audio.muted ? ICON_OFF : ICON_ON;
  }

  function tone(freq, type, t0, dur, vol, fEnd, a) {
    var c = audioEnsure();
    if (!c) return;
    a = a == null ? 0.012 : a;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (fEnd) o.frequency.exponentialRampToValueAtTime(Math.max(20, fEnd), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(audio.master);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }

  function noise(t0, dur, vol, freq) {
    var c = audioEnsure();
    if (!c) return;
    var n = 1 << 12;
    var buf = c.createBuffer(1, n, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    var f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq || 1800;
    f.Q.value = 0.8;
    var g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(audio.master);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  function play(name) {
    var c = audioEnsure();
    if (!c) return;
    var t = c.currentTime;
    if (name === 'collect') {
      tone(880, 'square', t, 0.08, 0.16);
      tone(1174, 'square', t + 0.07, 0.12, 0.16);
    } else if (name === 'coffee') {
      tone(392, 'triangle', t, 0.1, 0.18);
      tone(523, 'triangle', t + 0.08, 0.1, 0.16);
      tone(784, 'triangle', t + 0.16, 0.16, 0.16);
    } else if (name === 'hit') {
      tone(180, 'sawtooth', t, 0.28, 0.22, 70);
      noise(t, 0.18, 0.12, 400);
    } else if (name === 'shot') {
      tone(620, 'square', t, 0.07, 0.1, 280);
      noise(t, 0.05, 0.06, 2200);
    } else if (name === 'bossHit') {
      tone(240, 'sawtooth', t, 0.12, 0.2, 140);
      tone(520, 'square', t + 0.06, 0.1, 0.14);
    } else if (name === 'victory') {
      [523, 659, 784, 1046].forEach(function (f, i) {
        tone(f, 'square', t + i * 0.12, 0.2, 0.16);
      });
      tone(1318, 'triangle', t + 0.5, 0.4, 0.14);
    } else if (name === 'gameover') {
      tone(392, 'square', t, 0.2, 0.16, 300);
      tone(311, 'square', t + 0.2, 0.22, 0.16, 220);
      tone(196, 'sawtooth', t + 0.42, 0.45, 0.18, 90);
    } else if (name === 'safe') {
      tone(980, 'square', t, 0.06, 0.12);
      tone(1318, 'square', t + 0.05, 0.1, 0.13);
    }
  }

  function playAlarm() {
    stopAlarm();
    var c = audioEnsure();
    if (!c) return;
    var t = c.currentTime;
    for (var i = 0; i < 6; i++) {
      tone(880, 'square', t + i * 0.28, 0.14, 0.14);
      tone(620, 'square', t + i * 0.28 + 0.14, 0.14, 0.14);
    }
  }
  function stopAlarm() { /* tony same się kończą */ }

  setMuted(audio.muted);

  /* ---------- stan gry ---------- */
  var keys = { left: false, right: false, shoot: false };
  var mode = 'start'; /* start | playing | transition | victory | gameover */
  var paused = false;
  var stage = 1;
  var lives = LIVES_MAX;
  var budget = 0;
  var score = 0;
  var time = 0;
  var spawnT = 0;
  var spawnEvery = 0.95;
  var shotT = 0;
  var coffeeUntil = 0;
  var invulnUntil = 0;
  var items = [];
  var arrows = [];
  var floats = [];
  var particles = [];
  var flyers = [];
  var safeInFlight = 0;
  var safeSx = 1, safeSy = 1, safeVx = 0, safeVy = 0, safeFlash = 0;
  var player = null;
  var boss = null;
  var transitionT = 0;
  var transPhase = '';
  var hasBow = false;
  var dance = null;
  var danceSparkT = 0;
  var lastTs = 0;
  var raf = 0;
  var shakeT = 0;
  var coffeeSparkT = 0;
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var MAX_PARTICLES = (typeof window !== 'undefined' && (('ontouchstart' in window) || Math.min(screen.width, screen.height) <= 700)) ? 48 : 96;
  function fontArcade(px) { return px + 'px "Press Start 2P", monospace'; }
  function fontTiny(px) { return px + 'px VT323, monospace'; }

  function fmtMoney(n) { return Math.max(0, Math.floor(n)) + ' $'; }

  function resetGame() {
    stage = 1;
    lives = LIVES_MAX;
    budget = 0;
    score = 0;
    time = 0;
    spawnT = 0.4;
    spawnEvery = 0.95;
    shotT = 0;
    coffeeUntil = 0;
    invulnUntil = 0;
    items = [];
    arrows = [];
    floats = [];
    particles = [];
    flyers = [];
    safeInFlight = 0;
    safeSx = 1; safeSy = 1; safeVx = 0; safeVy = 0; safeFlash = 0;
    boss = null;
    transitionT = 0;
    transPhase = '';
    hasBow = false;
    dance = null;
    danceSparkT = 0;
    shakeT = 0;
    coffeeSparkT = 0;
    player = {
      x: GAME_W / 2,
      y: GAME_H - 28,
      w: 52,
      h: 96,
      facing: 1,
      walk: 0
    };
  }

  function showOverlay(el) {
    ovStart.hidden = el !== ovStart;
    ovPause.hidden = el !== ovPause;
    ovWin.hidden = el !== ovWin;
    ovOver.hidden = el !== ovOver;
  }
  function hideOverlays() {
    ovStart.hidden = true;
    ovPause.hidden = true;
    ovWin.hidden = true;
    ovOver.hidden = true;
  }

  function updateHud() {
    var hearts = '';
    for (var i = 0; i < LIVES_MAX; i++) {
      hearts += i < lives ? '❤' : '<span class="off">❤</span>';
    }
    hudLives.innerHTML = hearts;
    hudLives.setAttribute('aria-label', 'Życia: ' + lives + ' z ' + LIVES_MAX);
    hudBudget.textContent = fmtMoney(budget);
    hudScore.textContent = String(score);
    if (mode === 'transition' && transPhase === 'dance') hudStage.textContent = 'Etap 1 ukończony!';
    else if (stage === 2 || mode === 'transition') hudStage.textContent = 'Etap 2 — Boss CTO';
    else hudStage.textContent = 'Etap 1';
    if (coffeeUntil > time) {
      hudCoffee.hidden = false;
      hudCoffee.textContent = 'Kawa: ' + Math.ceil(coffeeUntil - time) + ' s';
    } else {
      hudCoffee.hidden = true;
    }
    var playing = mode === 'playing' || mode === 'transition';
    hud.hidden = !playing && mode !== 'victory' && mode !== 'gameover';
    appEl.classList.toggle('playing', playing);
    btnShoot.disabled = !(mode === 'playing' && hasBow);
  }

  function addFloat(x, y, text, color) {
    floats.push({ x: x, y: y, text: text, color: color || '#3dff7a', life: 1.05, maxLife: 1.05 });
  }
  function trimParticles() {
    if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
  }
  function burst(x, y, color, n) {
    n = n || 8;
    if (MAX_PARTICLES <= 48) n = Math.ceil(n * 0.6);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = 40 + Math.random() * 140;
      particles.push({
        x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        color: color, life: 0.35 + Math.random() * 0.3, r: 2 + Math.random() * 3,
        pixel: true, grav: 90
      });
    }
    trimParticles();
  }
  function startShake() {
    if (!reduceMotion) shakeT = 0.2;
  }

  function playerSpeed() {
    return coffeeUntil > time ? 470 : 280;
  }

  function playerHitbox() {
    return { x: player.x - 22, y: player.y - 138, w: 44, h: 136 };
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function spawnItem(kind, x, y, labels) {
    var it = {
      kind: kind,
      x: x != null ? x : rand(36, GAME_W - 36),
      y: y != null ? y : -30,
      vy: rand(140, 210),
      rot: rand(-0.3, 0.3),
      vr: rand(-1.2, 1.2),
      label: labels ? pick(labels) : '',
      w: 36, h: 24
    };
    if (kind === 'bill') { it.w = 42; it.h = 22; it.vy = rand(130, 190); }
    if (kind === 'coffee') { it.w = 28; it.h = 32; it.vy = rand(150, 200); }
    if (kind === 'hazard') {
      it.w = it.label.length > 10 ? 86 : 72;
      it.h = it.label.length > 10 ? 36 : 30;
      it.vy = rand(160, 230);
      it.vr *= 0.3;
    }
    items.push(it);
  }

  function spawnStage1() {
    var r = Math.random();
    if (r < 0.46) spawnItem('bill');
    else if (r < 0.62) spawnItem('coffee');
    else spawnItem('hazard', null, null, ['L4', 'Wypowiedzenie', 'Cięcia Kosztów']);
  }

  var DANCE_CLEAR = 2.65;
  var BOSS_INTRO = 1.55;

  function beginBossIntro() {
    transPhase = 'intro';
    hasBow = true;
    dance = null;
    stage = 2;
    boss = {
      x: GAME_W / 2,
      y: -40,
      targetY: 158,
      hp: BOSS_HP_MAX,
      dir: 1,
      t: 0,
      dropT: 1.1,
      tips: []
    };
    updateHud();
  }

  function startTransition(opts) {
    var skipDance = opts && opts.skipDance;
    mode = 'transition';
    stage = 2;
    items = [];
    arrows = [];
    keys.left = keys.right = keys.shoot = false;
    playAlarm();
    if (skipDance) {
      dance = null;
      transPhase = 'intro';
      transitionT = 2.1;
      beginBossIntro();
    } else {
      hasBow = false;
      boss = null;
      transPhase = 'dance';
      dance = { kind: 'clear', t: 0, dur: DANCE_CLEAR, looping: false };
      danceSparkT = 0;
      transitionT = DANCE_CLEAR + BOSS_INTRO;
      burst(player.x, player.y - 70, '#3dff7a', 16);
      burst(player.x, player.y - 70, '#ffd76a', 10);
      updateHud();
    }
  }

  function startStage2Direct() {
    if (mode === 'start' || mode === 'victory' || mode === 'gameover') {
      resetGame();
      hideOverlays();
      mode = 'playing';
    }
    budget = Math.max(budget, BUDGET_GOAL);
    startTransition({ skipDance: true });
  }

  function shoot() {
    if (stage !== 2 || mode !== 'playing') return;
    if (shotT > 0) return;
    shotT = SHOT_COOLDOWN;
    if (budget >= SHOT_COST) budget -= SHOT_COST;
    var x = player.x + player.facing * 18;
    var y = player.y - 86;
    arrows.push({ x: x, y: y, vy: -560, w: 14, h: 28 });
    play('shot');
    updateHud();
  }

  function hurtPlayer() {
    if (time < invulnUntil) return;
    lives -= 1;
    invulnUntil = time + INVULN;
    play('hit');
    startShake();
    addFloat(player.x, player.y - 110, '−1 życie', '#ff6b6b');
    burst(player.x, player.y - 50, '#ff6b6b', 14);
    if (lives <= 0) {
      lives = 0;
      endGame(false);
    }
    updateHud();
  }

  function endGame(won) {
    mode = won ? 'victory' : 'gameover';
    appEl.classList.remove('playing');
    keys.shoot = false;
    if (won) {
      var bonus = lives * 500 + budget;
      score += bonus;
      document.getElementById('win-score').textContent = String(score);
      document.getElementById('win-meta').textContent =
        ' (budżet ' + fmtMoney(budget) + ', życia × 500, budżet jako bonus)';
      hasBow = false;
      boss = null;
      items = [];
      arrows = [];
      dance = { kind: 'victory', t: 0, dur: 3.2, looping: true };
      danceSparkT = 0;
      burst(player.x, player.y - 70, '#3dff7a', 18);
      burst(player.x, player.y - 70, '#ffd76a', 12);
      showOverlay(ovWin);
      play('victory');
    } else {
      document.getElementById('over-score').textContent = String(score);
      document.getElementById('over-meta').textContent = '  ·  budżet ' + fmtMoney(budget);
      showOverlay(ovOver);
      play('gameover');
    }
    updateHud();
  }

  function hitBoss() {
    if (!boss) return;
    boss.hp = Math.max(0, boss.hp - BOSS_HIT);
    play('bossHit');
    startShake();
    boss.flashUntil = time + 0.16;
    addFloat(boss.x, boss.y - 70, '-10 HP', '#b8ff3d');
    burst(boss.x, boss.y, '#c86bff', 12);
    burst(boss.x, boss.y, '#ff3a5a', 12);
    score += 100;
    updateHud();
    if (boss.hp <= 0) endGame(true);
  }

  /* ---------- aktualizacja ---------- */
  function update(dt) {
    time += dt;
    if (shotT > 0) shotT -= dt;
    if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
    updateSafe(dt);

    var canControl = mode === 'playing';
    var spd = playerSpeed();
    var dir = canControl ? ((keys.left ? -1 : 0) + (keys.right ? 1 : 0)) : 0;
    if (dir) {
      player.x += dir * spd * dt;
      player.facing = dir;
      player.walk += dt * (coffeeUntil > time ? 16 : 11);
    } else if (!dance) {
      player.walk *= Math.max(0, 1 - dt * 8);
    }
    var margin = 36;
    player.x = Math.max(margin, Math.min(GAME_W - margin, player.x));
    if (canControl && keys.shoot) shoot();
    updateDance(dt);

    var i, it, hb, box;

    if (mode === 'playing' && stage === 1) {
      spawnEvery = Math.max(0.58, 0.95 - budget / 4000);
      spawnT -= dt;
      if (spawnT <= 0 && items.length < 14) {
        spawnStage1();
        spawnT = spawnEvery * rand(0.75, 1.15);
      }
      if (budget >= BUDGET_GOAL) startTransition();
    }

    if (mode === 'transition') {
      transitionT -= dt;
      if (transPhase === 'dance') {
        if (!dance || dance.t >= dance.dur) beginBossIntro();
      } else if (boss) {
        boss.t += dt;
        boss.y += (boss.targetY - boss.y) * Math.min(1, dt * 3.2);
      }
      if (transPhase === 'intro' && transitionT <= 0) {
        mode = 'playing';
        stage = 2;
        hasBow = true;
        dance = null;
        transPhase = '';
        updateHud();
      }
    }

    if (mode === 'playing' && stage === 2 && boss) {
      boss.t += dt;
      var range = 130;
      boss.x = GAME_W / 2 + Math.sin(boss.t * 0.85) * range;
      boss.y = boss.targetY + Math.sin(boss.t * 1.4) * 6;
      boss.dropT -= dt;
      if (boss.dropT <= 0 && items.length < 12) {
        var tip = boss.tips.length ? pick(boss.tips) : { x: boss.x, y: boss.y + 90 };
        spawnItem('hazard', tip.x, tip.y, ['Nadgodziny', 'dodatkowa robota', 'kupa']);
        items[items.length - 1].vy = rand(180, 250);
        boss.dropT = rand(0.95, 1.55);
      }
    }

    hb = playerHitbox();
    for (i = items.length - 1; i >= 0; i--) {
      it = items[i];
      it.y += it.vy * dt;
      it.rot += it.vr * dt;
      if (it.y > GAME_H + 50) { items.splice(i, 1); continue; }
      box = { x: it.x - it.w / 2, y: it.y - it.h / 2, w: it.w, h: it.h };
      if (!aabb(hb, box)) continue;
      if (it.kind === 'bill') {
        budget += 100;
        score += 100;
        play('collect');
        addFloat(player.x, player.y - 112, '+100$', '#3dff7a');
        burst(it.x, it.y, '#3dff7a', 12);
        burst(it.x, it.y, '#b8ff3d', 6);
        startFlyer(it.x, it.y, 100);
        items.splice(i, 1);
        updateHud();
      } else if (it.kind === 'coffee') {
        score += 50;
        coffeeUntil = time + COFFEE_TIME;
        play('coffee');
        addFloat(player.x, player.y - 112, '+50', '#ffd76a');
        burst(it.x, it.y, '#ffd76a', 14);
        burst(it.x, it.y, '#fff3c0', 8);
        items.splice(i, 1);
        updateHud();
      } else if (it.kind === 'hazard') {
        items.splice(i, 1);
        if (mode === 'playing') hurtPlayer();
      }
    }

    for (i = arrows.length - 1; i >= 0; i--) {
      var ar = arrows[i];
      ar.y += ar.vy * dt;
      if (ar.y < -40) { arrows.splice(i, 1); continue; }
      if (boss && (mode === 'playing' || mode === 'transition') && stage === 2) {
        var bb = bossBox();
        if (aabb({ x: ar.x - 7, y: ar.y - 16, w: 14, h: 28 }, bb)) {
          arrows.splice(i, 1);
          if (mode === 'playing') hitBoss();
        }
      }
    }

    if (coffeeUntil > time) {
      coffeeSparkT -= dt;
      if (coffeeSparkT <= 0 && particles.length < MAX_PARTICLES) {
        coffeeSparkT = 0.07;
        particles.push({
          x: player.x + rand(-22, 22), y: player.y - rand(20, 95),
          vx: rand(-16, 16), vy: rand(-50, -10),
          color: Math.random() < 0.5 ? '#ffd76a' : '#fff3c0',
          life: 0.4 + Math.random() * 0.25, r: 2 + Math.random() * 2,
          pixel: true, grav: -10
        });
      }
    }

    updateFx(dt);
  }

  function updateFx(dt) {
    var i, p;
    for (i = floats.length - 1; i >= 0; i--) {
      floats[i].life -= dt;
      floats[i].y -= 55 * dt;
      if (floats[i].life <= 0) floats.splice(i, 1);
    }
    for (i = particles.length - 1; i >= 0; i--) {
      p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.grav != null ? p.grav : 90) * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function updateVictory(dt) {
    time += dt;
    updateSafe(dt);
    updateDance(dt);
    updateFx(dt);
  }

  function updateDance(dt) {
    if (!dance) return;
    dance.t += dt;
    if (dance.looping && dance.dur > 0 && dance.t >= dance.dur) dance.t -= dance.dur;
    emitDanceFx(dt);
  }

  function emitDanceFx(dt) {
    if (!player) return;
    danceSparkT -= dt;
    if (danceSparkT > 0) return;
    danceSparkT = mode === 'victory' ? 0.055 : 0.07;
    if (particles.length >= MAX_PARTICLES) return;
    var n = MAX_PARTICLES <= 48 ? 2 : 4;
    var colors = ['#3dff7a', '#b8ff3d', '#ffd76a', '#ffffff', '#ff7eb0', '#7ad7ff'];
    var pose = getPlayerPose();
    var cx = player.x + (pose.xOff || 0);
    var i, bit;
    for (i = 0; i < n; i++) {
      bit = Math.random() < 0.22;
      particles.push({
        x: cx + rand(-46, 46),
        y: player.y - rand(10, 140),
        vx: rand(-90, 90),
        vy: rand(-160, -30),
        color: colors[(Math.random() * colors.length) | 0],
        life: 0.55 + Math.random() * 0.45,
        r: bit ? 6 : (2 + Math.random() * 3.5),
        pixel: true,
        grav: 150,
        bill: bit
      });
    }
    trimParticles();
  }

  function getPlayerPose() {
    if (dance && (mode === 'transition' || mode === 'victory' || mode === 'playing')) {
      return dancePose(dance);
    }
    var moving = mode === 'playing' && (keys.left || keys.right);
    var walk = Math.sin(player.walk) * (moving ? 1 : 0.15);
    var bob = (!reduceMotion && moving) ? Math.abs(Math.sin(player.walk * 1.05)) * 5.5 : 0;
    return {
      bob: bob,
      hip: walk * 0.1,
      armL: 0.36 + walk * 0.28,
      armR: hasBow ? -0.22 : (-0.38 - walk * 0.28),
      legL: walk * 6,
      legR: -walk * 6,
      flip: 1,
      spinRot: 0,
      xOff: 0
    };
  }

  function dancePose(d) {
    var t = d.t;
    var cycle = d.looping && d.dur > 0 ? (t % d.dur) : t;
    var pose = { bob: 0, hip: 0, armL: 0.3, armR: -0.3, legL: 0, legR: 0, flip: 1, spinRot: 0, xOff: 0 };
    if (reduceMotion) {
      pose.bob = Math.abs(Math.sin(t * 6)) * 3;
      pose.armL = 0.55 + Math.sin(t * 5) * 0.25;
      pose.armR = -0.55 - Math.sin(t * 5) * 0.25;
      return pose;
    }
    var u, spin;
    /* 0–0.5s: podskok, ręce w górę; 0.5–1.2: crosstep; 1.2–1.85: obrót; 1.85–koniec: machanie */
    if (!d.looping) {
      if (cycle < 0.5) {
        u = cycle / 0.5;
        pose.bob = Math.abs(Math.sin(u * Math.PI * 2)) * 14;
        pose.armL = 2.55;
        pose.armR = -2.55;
        pose.hip = Math.sin(u * Math.PI * 2) * 0.12;
      } else if (cycle < 1.2) {
        u = (cycle - 0.5) / 0.7;
        pose.xOff = Math.sin(u * Math.PI * 2.2) * 22;
        pose.bob = Math.abs(Math.sin(u * Math.PI * 4)) * 8;
        pose.hip = Math.sin(u * Math.PI * 2.2) * 0.28;
        pose.legL = Math.sin(u * Math.PI * 2.2) * 8;
        pose.legR = -Math.sin(u * Math.PI * 2.2) * 8;
        pose.armL = 1.15 + Math.sin(u * Math.PI * 3) * 0.95;
        pose.armR = -1.15 - Math.sin(u * Math.PI * 3) * 0.95;
      } else if (cycle < 1.9) {
        u = (cycle - 1.2) / 0.7;
        spin = u * Math.PI * 2;
        pose.flip = Math.cos(spin);
        pose.bob = 6 + Math.sin(u * Math.PI) * 10;
        pose.armL = 1.7;
        pose.armR = -1.7;
      } else {
        u = (cycle - 1.9) / Math.max(0.2, (d.dur - 1.9));
        pose.bob = Math.abs(Math.sin(u * Math.PI * 4)) * 10;
        pose.hip = Math.sin(u * Math.PI * 3) * 0.2;
        pose.armL = 2.5 + Math.sin(u * Math.PI * 5) * 0.45;
        pose.armR = -2.5 - Math.cos(u * Math.PI * 5) * 0.45;
        pose.legL = Math.sin(u * Math.PI * 4) * 5;
        pose.legR = -Math.sin(u * Math.PI * 4) * 5;
      }
      return pose;
    }
    /* pętla zwycięstwa ~3.2 s */
    if (cycle < 1.0) {
      u = cycle / 1.0;
      pose.xOff = Math.sin(u * Math.PI * 2) * 20;
      pose.bob = Math.abs(Math.sin(u * Math.PI * 4)) * 9;
      pose.hip = Math.sin(u * Math.PI * 2) * 0.26;
      pose.legL = Math.sin(u * Math.PI * 2) * 8;
      pose.legR = -Math.sin(u * Math.PI * 2) * 8;
      pose.armL = 1.25 + Math.sin(u * Math.PI * 4) * 1.0;
      pose.armR = -1.25 - Math.sin(u * Math.PI * 4) * 1.0;
    } else if (cycle < 1.7) {
      u = (cycle - 1.0) / 0.7;
      pose.bob = Math.abs(Math.sin(u * Math.PI * 3)) * 7;
      pose.hip = Math.sin(u * Math.PI * 2) * 0.3;
      pose.armL = 2.55;
      pose.armR = -0.55 - Math.sin(u * Math.PI * 3) * 0.55;
      pose.xOff = Math.sin(u * Math.PI) * 8;
    } else if (cycle < 2.45) {
      u = (cycle - 1.7) / 0.75;
      spin = u * Math.PI * 2;
      pose.flip = Math.cos(spin);
      pose.bob = 8 + Math.sin(u * Math.PI) * 10;
      pose.armL = 1.7;
      pose.armR = -1.7;
    } else {
      u = (cycle - 2.45) / Math.max(0.2, d.dur - 2.45);
      pose.bob = Math.abs(Math.sin(u * Math.PI * 4)) * 12;
      pose.armL = 2.55 + Math.sin(u * Math.PI * 4) * 0.3;
      pose.armR = -2.55 - Math.sin(u * Math.PI * 4) * 0.3;
      pose.hip = Math.sin(u * Math.PI * 2) * 0.15;
    }
    return pose;
  }

  function bossBox() {
    if (!boss) return { x: 0, y: 0, w: 0, h: 0 };
    return { x: boss.x - 70, y: boss.y - 70, w: 140, h: 130 };
  }

  /* ---------- rysowanie ---------- */
  function coverHead(ctx, img, cx, cy, rx, ry) {
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) return false;
    var tw = rx * 2, th = ry * 2;
    var scale = Math.max(tw / iw, th / ih);
    var dw = iw * scale, dh = ih * scale;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    return true;
  }

  function drawFallbackKrzysztof(ctx, cx, cy, r) {
    var rx = r, ry = r * 1.12;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#e6a07a';
    ctx.beginPath();
    ctx.ellipse(0, ry * 0.95, rx * 0.32, ry * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4e2e18';
    ctx.beginPath();
    ctx.ellipse(0, -ry * 0.25, rx * 1.05, ry * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4c7a8';
    ctx.beginPath();
    ctx.ellipse(-rx * 0.98, 0, rx * 0.22, ry * 0.28, 0, 0, Math.PI * 2);
    ctx.ellipse(rx * 0.98, 0, rx * 0.22, ry * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, ry * 0.05, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4e2e18';
    ctx.beginPath();
    ctx.ellipse(0, -ry * 0.55, rx * 1.02, ry * 0.6, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(240,140,140,0.45)';
    ctx.beginPath();
    ctx.ellipse(-rx * 0.52, ry * 0.28, rx * 0.22, ry * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(rx * 0.52, ry * 0.28, rx * 0.22, ry * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    function eye(ex) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ex, -ry * 0.05, rx * 0.22, ry * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a301c';
      ctx.beginPath();
      ctx.ellipse(ex, -ry * 0.02, rx * 0.12, ry * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#140c08';
      ctx.beginPath();
      ctx.ellipse(ex, 0, rx * 0.06, ry * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex + rx * 0.05, -ry * 0.08, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
    eye(-rx * 0.38); eye(rx * 0.38);
    ctx.strokeStyle = '#3c2214';
    ctx.lineWidth = Math.max(1.4, r * 0.08);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-rx * 0.38, -ry * 0.28, rx * 0.22, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rx * 0.38, -ry * 0.28, rx * 0.22, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.strokeStyle = '#c8826e';
    ctx.lineWidth = Math.max(1.2, r * 0.07);
    ctx.beginPath();
    ctx.arc(0, ry * 0.18, rx * 0.16, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.strokeStyle = '#c85a5f';
    ctx.lineWidth = Math.max(1.6, r * 0.1);
    ctx.beginPath();
    ctx.arc(0, ry * 0.38, rx * 0.38, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  }

  function drawFallbackCto(ctx, cx, cy, r) {
    var rx = r, ry = r * 1.12;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#d0a086';
    ctx.beginPath();
    ctx.ellipse(0, ry * 0.95, rx * 0.34, ry * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#202024';
    ctx.beginPath();
    ctx.ellipse(0, -ry * 0.2, rx * 1.05, ry * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8c4a8';
    ctx.beginPath();
    ctx.ellipse(-rx * 0.95, 0.02 * r, rx * 0.2, ry * 0.26, 0, 0, Math.PI * 2);
    ctx.ellipse(rx * 0.95, 0.02 * r, rx * 0.2, ry * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, ry * 0.06, rx * 0.98, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#202024';
    ctx.beginPath();
    ctx.ellipse(0, -ry * 0.55, rx * 1.02, ry * 0.55, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-rx * 0.78, -ry * 0.05, rx * 0.28, ry * 0.5, 0, 0, Math.PI * 2);
    ctx.ellipse(rx * 0.78, -ry * 0.05, rx * 0.28, ry * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c8a090';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -ry * 0.28, rx * 0.4, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -ry * 0.2, rx * 0.32, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    function eye(ex) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ex, ry * 0.04, rx * 0.2, ry * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#32404e';
      ctx.beginPath();
      ctx.ellipse(ex, ry * 0.05, rx * 0.1, ry * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0c0c0e';
      ctx.beginPath();
      ctx.ellipse(ex, ry * 0.06, rx * 0.05, ry * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    eye(-rx * 0.36); eye(rx * 0.36);
    ctx.strokeStyle = '#1a1614';
    ctx.lineWidth = Math.max(2, r * 0.12);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-rx * 0.7, -ry * 0.18);
    ctx.lineTo(-rx * 0.08, -ry * 0.04);
    ctx.moveTo(rx * 0.08, -ry * 0.04);
    ctx.lineTo(rx * 0.7, -ry * 0.18);
    ctx.stroke();
    ctx.strokeStyle = '#19191c';
    ctx.lineWidth = Math.max(1.8, r * 0.1);
    ctx.fillStyle = 'rgba(180,210,230,0.2)';
    function lens(ex) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(ex - rx * 0.32, -ry * 0.12, rx * 0.64, ry * 0.42, r * 0.08);
      else ctx.rect(ex - rx * 0.32, -ry * 0.12, rx * 0.64, ry * 0.42);
      ctx.fill(); ctx.stroke();
    }
    lens(-rx * 0.36); lens(rx * 0.36);
    ctx.beginPath();
    ctx.moveTo(-rx * 0.04, ry * 0.08);
    ctx.lineTo(rx * 0.04, ry * 0.08);
    ctx.stroke();
    ctx.strokeStyle = '#96605a';
    ctx.lineWidth = Math.max(1.6, r * 0.1);
    ctx.beginPath();
    ctx.arc(0, ry * 0.52, rx * 0.28, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.restore();
  }

  function drawHead(ctx, img, cx, cy, r, fallback) {
    var rx = r, ry = r * 1.12;
    if (img && coverHead(ctx, img, cx, cy, rx, ry)) return;
    fallback(ctx, cx, cy, r);
  }

  /* Wycinka Krzysztofa (już z przezroczystym tłem) — bez owalnego przycięcia, ostre piksele. */
  function drawKrzysztofSprite(ctx, img, cx, collarY, fallback) {
    var iw = img && (img.naturalWidth || img.width);
    var ih = img && (img.naturalHeight || img.height);
    if (!iw || !ih) {
      fallback(ctx, cx, collarY - 20, 22);
      return;
    }
    var dh = 78;
    var dw = dh * (iw / ih);
    var dx = Math.round(cx - dw / 2);
    var dy = Math.round(collarY - dh * 0.805);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, dx, dy, Math.round(dw), Math.round(dh));
    ctx.imageSmoothingEnabled = true;
  }

  function drawBill(ctx, x, y, rot, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#1f8a4c';
    rounded(ctx, -21, -11, 42, 22, 3);
    ctx.fill();
    ctx.fillStyle = '#2ec76a';
    rounded(ctx, -18, -8, 36, 16, 2);
    ctx.fill();
    ctx.strokeStyle = '#b8ff3d';
    ctx.lineWidth = 1;
    rounded(ctx, -16, -6, 32, 12, 2);
    ctx.stroke();
    ctx.fillStyle = '#0a3d20';
    ctx.font = fontArcade(8);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 1);
    ctx.restore();
  }

  function drawCoffee(ctx, x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.fillStyle = '#6a3a22';
    rounded(ctx, -11, -4, 22, 18, 3);
    ctx.fill();
    ctx.strokeStyle = '#c4a07a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(12, 4, 6, -0.8, 0.8);
    ctx.stroke();
    ctx.fillStyle = '#f3e4c8';
    ctx.beginPath();
    ctx.ellipse(0, -4, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,230,230,0.7)';
    ctx.lineWidth = 1.2;
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      var sx = -6 + i * 6;
      ctx.moveTo(sx, -10);
      ctx.quadraticCurveTo(sx + 3, -16, sx, -22);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHazard(ctx, it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot * 0.25);
    var w = it.w, h = it.h;
    ctx.fillStyle = stage === 2 ? '#9a2a4a' : '#c62828';
    rounded(ctx, -w / 2, -h / 2, w, h, 7);
    ctx.fill();
    ctx.fillStyle = stage === 2 ? '#c43a62' : '#e53935';
    rounded(ctx, -w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var label = it.label;
    var parts = label.split(' ');
    if (parts.length > 1 && label.length > 8) {
      ctx.font = fontTiny(15);
      ctx.fillText(parts[0], 0, -6);
      ctx.fillText(parts.slice(1).join(' '), 0, 7);
    } else {
      ctx.font = fontTiny(label.length > 8 ? 15 : 17);
      ctx.fillText(label, 0, 1);
    }
    ctx.restore();
  }

  function rounded(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  function safeGeom() {
    var w = 110, h = 94;
    var x = GAME_W - 10 - w;
    var y = GAME_H - 14 - h;
    return { x: x, y: y, w: w, h: h, doorX: x + 34, doorY: y + 50 };
  }
  function safeStackValue() {
    return Math.max(0, budget - safeInFlight);
  }
  function startFlyer(x, y, value) {
    value = value || 100;
    var g = safeGeom();
    flyers.push({
      x: x, y: y,
      x0: x, y0: y,
      x1: g.doorX + rand(-5, 5),
      y1: g.doorY + rand(-4, 4),
      cx: (x + g.doorX) * 0.5 + rand(-24, 24),
      cy: Math.min(y, g.doorY) - rand(70, 125),
      t: 0,
      dur: 0.52 + Math.random() * 0.16,
      rot: rand(-0.5, 0.5),
      vr: rand(-2.4, 2.4),
      value: value
    });
    safeInFlight += value;
  }
  function bumpSafe() {
    safeFlash = 1;
    if (reduceMotion) return;
    safeSx = 1.14;
    safeSy = 0.88;
    safeVx = 0;
    safeVy = 0;
  }
  function updateSafe(dt) {
    var k = 150, dmp = 11;
    safeVx += ((1 - safeSx) * k - safeVx * dmp) * dt;
    safeVy += ((1 - safeSy) * k - safeVy * dmp) * dt;
    safeSx += safeVx * dt;
    safeSy += safeVy * dt;
    if (safeFlash > 0) safeFlash = Math.max(0, safeFlash - dt * 3.4);
    var i, f, e, u, inv;
    for (i = flyers.length - 1; i >= 0; i--) {
      f = flyers[i];
      f.t += dt;
      e = Math.min(1, f.t / f.dur);
      u = e * e * (3 - 2 * e);
      inv = 1 - u;
      f.x = inv * inv * f.x0 + 2 * inv * u * f.cx + u * u * f.x1;
      f.y = inv * inv * f.y0 + 2 * inv * u * f.cy + u * u * f.y1;
      f.rot += f.vr * dt;
      if (f.t >= f.dur) {
        safeInFlight = Math.max(0, safeInFlight - f.value);
        bumpSafe();
        play('safe');
        burst(f.x1, f.y1, '#ffd76a', 10);
        burst(f.x1, f.y1, '#3dff7a', 6);
        flyers.splice(i, 1);
      }
    }
  }
  function pxl(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  }
  function drawSafe(ctx) {
    var g = safeGeom();
    var x = g.x, y = g.y, w = g.w, h = g.h;
    var notes = Math.min(14, Math.floor(safeStackValue() / 100));
    var i;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.42, y + h - 1, w * 0.4, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x + w * 0.42, y + h - 4);
    ctx.scale(safeSx, safeSy);
    ctx.translate(-(x + w * 0.42), -(y + h - 4));

    /* korpus ze stali */
    pxl(ctx, x, y + 8, 74, 78, '#2f3946');
    pxl(ctx, x + 2, y + 10, 70, 74, '#5a6a7c');
    pxl(ctx, x + 2, y + 10, 70, 7, '#8e9eaf');
    pxl(ctx, x + 2, y + 16, 70, 3, '#6d7e90');
    pxl(ctx, x + 2, y + 77, 70, 7, '#2a3340');
    pxl(ctx, x, y + 8, 3, 78, '#7b8b9c');
    pxl(ctx, x + 71, y + 8, 3, 78, '#24303c');
    /* nity */
    [[x + 5, y + 13], [x + 65, y + 13], [x + 5, y + 74], [x + 65, y + 74]].forEach(function (rv) {
      pxl(ctx, rv[0], rv[1], 4, 4, '#1a2028');
      pxl(ctx, rv[0] + 1, rv[1] + 1, 2, 2, '#d0d8e0');
    });
    /* otwór i wnętrze */
    pxl(ctx, x + 10, y + 20, 44, 54, '#1c232c');
    pxl(ctx, x + 12, y + 22, 40, 50, '#0b0908');
    pxl(ctx, x + 13, y + 23, 38, 6, '#16120e');
    /* stos banknotów w środku (rośnie po dolocie) */
    for (i = 0; i < notes; i++) {
      var ny = y + 66 - i * 3;
      var nx = x + 16 + (i % 3) - 1;
      pxl(ctx, nx, ny - 8, 32, 10, '#0f4a24');
      pxl(ctx, nx + 1, ny - 7, 30, 8, '#27c464');
      pxl(ctx, nx + 2, ny - 6, 28, 1, '#b8ff3d');
      pxl(ctx, nx + 12, ny - 4, 8, 3, '#0a3d20');
    }

    /* uchylone drzwi z pokrętłem (zawias po prawej stronie otworu) */
    ctx.save();
    ctx.translate(x + 54, y + 20);
    ctx.rotate(-0.22);
    pxl(ctx, -3, 0, 4, 58, '#232b34');
    pxl(ctx, 0, 0, 30, 58, '#3e4b59');
    pxl(ctx, 2, 2, 26, 54, '#6b7d90');
    pxl(ctx, 2, 2, 26, 5, '#a8b6c4');
    pxl(ctx, 2, 50, 26, 6, '#3a4654');
    /* pokrętło */
    ctx.fillStyle = '#242a32';
    ctx.beginPath(); ctx.arc(15, 27, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cfd6de';
    ctx.beginPath(); ctx.arc(15, 27, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a6570';
    ctx.beginPath(); ctx.arc(15, 27, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a1f26';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(15, 27); ctx.lineTo(15 + 7, 27 - 3); ctx.stroke();
    ctx.strokeStyle = '#2c343c';
    ctx.lineWidth = 1;
    for (i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(15 + Math.cos(a) * 6.5, 27 + Math.sin(a) * 6.5);
      ctx.lineTo(15 + Math.cos(a) * 8.5, 27 + Math.sin(a) * 8.5);
      ctx.stroke();
    }
    ctx.restore();

    if (safeFlash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255, 210, 70, ' + (safeFlash * 0.32) + ')';
      ctx.fillRect(x + 2, y + 10, 70, 74);
      ctx.restore();
    }
    ctx.restore(); /* squash */

    /* neonowa etykieta — nie podlega squash, żeby pozostała czytelna */
    var lx = x + 48;
    var ly = y + 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineJoin = 'round';
    ctx.font = fontArcade(8);
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3;
    ctx.strokeText('BUDŻET', lx, ly - 16);
    ctx.shadowColor = 'rgba(61,255,122,0.95)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#3dff7a';
    ctx.fillText('BUDŻET', lx, ly - 16);
    ctx.shadowBlur = 0;
    ctx.font = fontArcade(10);
    ctx.strokeText(fmtMoney(budget), lx, ly);
    ctx.shadowColor = 'rgba(184,255,61,0.9)';
    ctx.shadowBlur = 7;
    ctx.fillStyle = '#b8ff3d';
    ctx.fillText(fmtMoney(budget), lx, ly);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  function drawFlyers(ctx) {
    flyers.forEach(function (f) { drawBill(ctx, f.x, f.y, f.rot, 0.9); });
  }

  var SUIT = '#1a2230';
  var SUIT_HI = '#2c3a4e';
  var SUIT_DK = '#0e141c';
  var SKIN = '#e0a070';
  var SKIN_DK = '#c48458';
  var SHIRT = '#f4f2ea';
  var TIE = '#1f9a4c';
  var TIE_HI = '#3dff7a';
  var SHOE = '#6b3e22';
  var SHOE_DK = '#2a1810';
  var INK = '#08080a';

  function pix(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  }
  function pixInk(ctx, x, y, w, h, fill) {
    pix(ctx, x - 1, y - 1, w + 2, h + 2, INK);
    pix(ctx, x, y, w, h, fill);
  }

  function drawPixelArm(ctx, ax, ay, angle, handSign) {
    ctx.save();
    ctx.translate(Math.round(ax), Math.round(ay));
    ctx.rotate(angle);
    ctx.imageSmoothingEnabled = false;
    pix(ctx, -6, -2, 12, 40, INK);
    pix(ctx, -4, 0, 8, 28, SUIT);
    pix(ctx, -3, 1, 2, 22, SUIT_HI);
    pix(ctx, -5, 26, 10, 10, INK);
    pix(ctx, -4, 27, 8, 8, SKIN);
    pix(ctx, -3, 28, 3, 3, SKIN_DK);
    ctx.restore();
  }

  function drawPixelKrzysztof(ctx, x, y, pose) {
    ctx.imageSmoothingEnabled = false;
    var hip = pose.hip || 0;
    var tx = x + Math.round(Math.sin(hip) * 3);

    /* nogi + buty */
    var legH = 26;
    var lExt = Math.round(Math.max(0, pose.legL));
    var rExt = Math.round(Math.max(0, -pose.legR) * 0 + Math.max(0, pose.legR > 0 ? 0 : -pose.legR));
    /* lewa noga */
    var lx = tx - 15 + Math.round(pose.legL * 0.35);
    var ly = y - 30 - Math.round(Math.max(0, pose.legL) * 0.15);
    pix(ctx, lx - 1, ly - 1, 14, legH + 2 + lExt, INK);
    pix(ctx, lx, ly, 12, legH + lExt, SUIT_DK);
    pix(ctx, lx + 1, ly + 1, 3, legH - 4, SUIT);
    pixInk(ctx, lx - 3, y - 7, 16, 7, SHOE);
    pix(ctx, lx - 2, y - 6, 13, 2, '#8a5630');
    pix(ctx, lx - 3, y - 1, 16, 2, SHOE_DK);
    /* prawa noga */
    var rx = tx + 3 + Math.round(pose.legR * 0.35);
    var ry = y - 30 - Math.round(Math.max(0, -pose.legR) * 0.15);
    var rGrow = Math.round(Math.max(0, -pose.legR));
    pix(ctx, rx - 1, ry - 1, 14, legH + 2 + rGrow, INK);
    pix(ctx, rx, ry, 12, legH + rGrow, SUIT_DK);
    pix(ctx, rx + 8, ry + 1, 3, legH - 4, SUIT_HI);
    pixInk(ctx, rx - 1, y - 7, 16, 7, SHOE);
    pix(ctx, rx, y - 6, 13, 2, '#8a5630');
    pix(ctx, rx - 1, y - 1, 16, 2, SHOE_DK);

    /* ramię dalej (lewe, za tułowiem) */
    drawPixelArm(ctx, tx - 18, y - 70, pose.armL, -1);

    /* tułów — pudełkowy, chibi, 2px kontur */
    var tw = 40, th = 44;
    var tTop = y - 76;
    pix(ctx, tx - tw / 2 - 2, tTop - 2, tw + 4, th + 4, INK);
    pix(ctx, tx - tw / 2, tTop, tw, th, SUIT);
    pix(ctx, tx - tw / 2 + 1, tTop + 2, 5, th - 6, SUIT_HI);
    pix(ctx, tx + tw / 2 - 6, tTop + 3, 4, th - 8, SUIT_DK);
    /* wycięcie koszuli + kołnierz */
    pix(ctx, tx - 7, tTop, 14, 8, SHIRT);
    pix(ctx, tx - 6, tTop + 7, 12, 3, SHIRT);
    /* klapy kołnierza */
    pix(ctx, tx - 12, tTop, 6, 10, SHIRT);
    pix(ctx, tx + 6, tTop, 6, 10, SHIRT);
    pix(ctx, tx - 12, tTop, 6, 2, '#ffffff');
    pix(ctx, tx + 6, tTop, 6, 2, '#ffffff');
    /* krawat (zielony, dolarowy akcent) */
    pix(ctx, tx - 3, tTop + 7, 6, 4, TIE);
    pix(ctx, tx - 2, tTop + 10, 4, 22, TIE);
    pix(ctx, tx - 3, tTop + 30, 6, 5, TIE);
    pix(ctx, tx - 1, tTop + 11, 1, 18, TIE_HI);
    pix(ctx, tx - 2, tTop + 31, 4, 1, '#0d5a2c');

    /* głowa (szyja wchodzi pod kołnierz) */
    drawKrzysztofSprite(ctx, imgK, tx, y - 76, drawFallbackKrzysztof);

    /* kołnierz i krawat jeszcze raz na szyję */
    pix(ctx, tx - 12, tTop, 6, 9, SHIRT);
    pix(ctx, tx + 6, tTop, 6, 9, SHIRT);
    pix(ctx, tx - 3, tTop + 6, 6, 5, TIE);
    pix(ctx, tx - 2, tTop + 10, 4, 8, TIE);
    pix(ctx, tx - 11, tTop, 5, 2, '#ffffff');
    pix(ctx, tx + 6, tTop, 5, 2, '#ffffff');
    /* cień kołnierza */
    pix(ctx, tx - 12, tTop + 8, 5, 2, '#d4d0c6');
    pix(ctx, tx + 7, tTop + 8, 5, 2, '#d4d0c6');

    /* prawe ramię / łuk */
    drawPixelArm(ctx, tx + 18, y - 70, pose.armR, 1);
    if (hasBow) {
      ctx.save();
      ctx.translate(Math.round(tx + 22), Math.round(y - 60));
      ctx.rotate(-0.08);
      ctx.imageSmoothingEnabled = false;
      drawBow(ctx, keys.shoot && mode === 'playing' && shotT > SHOT_COOLDOWN * 0.3);
      ctx.restore();
    }
    ctx.imageSmoothingEnabled = true;
  }

  function drawPlayer(ctx) {
    var pose = getPlayerPose();
    var xOff = pose.xOff || 0;
    var x = Math.round(Math.max(36, Math.min(GAME_W - 36, player.x + xOff)));
    var groundY = player.y;
    var y = groundY - (pose.bob || 0);
    var flash = mode === 'playing' && time < invulnUntil && Math.floor(time * 16) % 2 === 0;

    if (coffeeUntil > time && mode === 'playing') {
      var pulse = 0.55 + 0.3 * Math.sin(time * 9);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var grd = ctx.createRadialGradient(x, y - 50, 6, x, y - 50, 62);
      grd.addColorStop(0, 'rgba(255, 230, 100, ' + (0.42 * pulse) + ')');
      grd.addColorStop(0.45, 'rgba(255, 200, 40, ' + (0.2 * pulse) + ')');
      grd.addColorStop(1, 'rgba(255, 170, 0, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(x, y - 50, 46, 62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (flash) ctx.globalAlpha = 0.4;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, groundY + 2, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    var cx = x, cy = y - 50;
    ctx.translate(cx, cy);
    var fl = pose.flip == null ? 1 : pose.flip;
    if (fl !== 1) {
      var sign = fl >= 0 ? 1 : -1;
      ctx.scale(sign * Math.max(0.62, Math.abs(fl)), 1);
    }
    if (pose.spinRot) ctx.rotate(pose.spinRot);
    ctx.translate(-cx, -cy);

    drawPixelKrzysztof(ctx, x, y, pose);

    ctx.restore();

    if (coffeeUntil > time && mode === 'playing') {
      ctx.strokeStyle = 'rgba(255, 230, 120, 0.65)';
      ctx.lineWidth = 2;
      for (var i = 0; i < 3; i++) {
        var ly = y - 30 - i * 18;
        ctx.beginPath();
        ctx.moveTo(x - 28 - i * 2, ly);
        ctx.lineTo(x - 38 - i * 3, ly + 6);
        ctx.moveTo(x + 28 + i * 2, ly);
        ctx.lineTo(x + 38 + i * 3, ly + 6);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }

  function drawBow(ctx, drawn) {
    ctx.save();
    ctx.strokeStyle = '#6a3e18';
    ctx.lineWidth = 4.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.quadraticCurveTo(drawn ? 26 : 22, 0, 0, -34);
    ctx.stroke();
    ctx.strokeStyle = '#c9843a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.quadraticCurveTo(drawn ? 26 : 22, 0, 0, -34);
    ctx.stroke();
    ctx.strokeStyle = '#e8f5e9';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(drawn ? 6 : 0, 0);
    ctx.lineTo(0, -32);
    ctx.stroke();
    ctx.restore();
  }

  function drawArrow(ctx, ar) {
    ctx.save();
    ctx.translate(ar.x, ar.y);
    ctx.strokeStyle = '#c9a06a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(0, -6);
    ctx.stroke();
    ctx.strokeStyle = '#e8f5e9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, 16);
    ctx.lineTo(0, 10);
    ctx.lineTo(4, 16);
    ctx.stroke();
    /* grot w kształcie zielonego dolara */
    ctx.fillStyle = '#1f8a4c';
    rounded(ctx, -9, -20, 18, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#2ec76a';
    rounded(ctx, -7, -18, 14, 12, 2);
    ctx.fill();
    ctx.fillStyle = '#0a3d20';
    ctx.font = fontArcade(8);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, -12);
    ctx.restore();
  }

  function drawBoss(ctx) {
    if (!boss) return;
    var x = boss.x, y = boss.y, t = boss.t;
    var flashing = boss.flashUntil && boss.flashUntil > time;
    boss.tips = [];
    /* macki (za ciałem) — rozchodzą się na boki i falują */
    var i, s, k, px, py, pts;
    for (i = 0; i < 8; i++) {
      var spread = (i - 3.5) / 3.5;
      var attachX = x + spread * 36;
      var attachY = y + 36;
      var len = 100 + Math.abs(spread) * 28 + (i % 2) * 14;
      var wave1 = Math.sin(t * 1.85 + i * 0.85);
      var wave2 = Math.sin(t * 2.15 + i * 1.05 + 0.7);
      pts = [];
      ctx.beginPath();
      ctx.moveTo(x + spread * 18, y + 18);
      pts.push({ x: x + spread * 18, y: y + 18 });
      for (s = 1; s <= 8; s++) {
        k = s / 8;
        px = attachX + spread * (30 + k * 46) + wave1 * (10 + k * 28) + wave2 * k * 12;
        py = attachY + k * len - Math.abs(spread) * 6 * (1 - k);
        ctx.lineTo(px, py);
        pts.push({ x: px, y: py });
      }
      ctx.strokeStyle = flashing ? (i % 2 ? '#ff3a55' : '#c01830') : (i % 2 ? '#6b2f9a' : '#4e1f78');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 16 - Math.abs(spread) * 3;
      ctx.stroke();
      ctx.strokeStyle = flashing ? 'rgba(255,120,140,0.45)' : 'rgba(210,160,255,0.28)';
      ctx.lineWidth = 5;
      ctx.stroke();
      boss.tips.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
      ctx.fillStyle = 'rgba(230,180,255,0.55)';
      for (s = 2; s <= 7; s++) {
        ctx.beginPath();
        ctx.arc(pts[s].x, pts[s].y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* płaszcz ośmiornicy */
    ctx.fillStyle = flashing ? '#e03858' : '#6e33a8';
    ctx.beginPath();
    ctx.ellipse(x, y + 28, 78, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = flashing ? '#ff5a72' : '#8a4cc4';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 70, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = flashing ? '#b02038' : '#5a2488';
    ctx.beginPath();
    ctx.ellipse(x, y + 36, 50, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    /* błysk na ciele */
    ctx.fillStyle = flashing ? 'rgba(255,220,220,0.45)' : 'rgba(255,220,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(x - 22, y, 18, 12, -0.4, 0, Math.PI * 2);
    ctx.fill();
    if (flashing) {
      ctx.fillStyle = 'rgba(255, 40, 60, 0.32)';
      ctx.beginPath();
      ctx.ellipse(x, y + 8, 84, 72, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHead(ctx, imgCto, x, y - 28, 36, drawFallbackCto);

    /* pasek życia */
    var bw = 160, bh = 12;
    var bx = x - bw / 2, by = y - 82;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    rounded(ctx, bx - 2, by - 2, bw + 4, bh + 4, 5);
    ctx.fill();
    ctx.fillStyle = '#3a1020';
    rounded(ctx, bx, by, bw, bh, 4);
    ctx.fill();
    var frac = Math.max(0, boss.hp / BOSS_HP_MAX);
    if (frac > 0) {
      ctx.fillStyle = frac > 0.4 ? '#ff5a7a' : '#ff3040';
      rounded(ctx, bx, by, bw * frac, bh, 4);
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.font = fontTiny(16);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('CTO  ' + boss.hp + ' / ' + BOSS_HP_MAX + ' HP', x, by - 4);
  }

  function drawBgFallback(ctx) {
    var g = ctx.createLinearGradient(0, 0, 0, GAME_H);
    g.addColorStop(0, '#101a14');
    g.addColorStop(0.5, '#0c140f');
    g.addColorStop(1, '#0a120c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    ctx.strokeStyle = 'rgba(61,255,122,0.04)';
    ctx.lineWidth = 1;
    var i;
    for (i = 0; i < GAME_W; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, GAME_H); ctx.stroke();
    }
    for (i = 0; i < GAME_H; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(GAME_W, i); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(20, 28, 40, 0.55)';
    rounded(ctx, 24, 40, 70, 90, 6); ctx.fill();
    rounded(ctx, GAME_W - 94, 40, 70, 90, 6); ctx.fill();
    ctx.fillStyle = 'rgba(184, 255, 61, 0.06)';
    rounded(ctx, 30, 46, 28, 36, 2); ctx.fill();
    rounded(ctx, 62, 46, 26, 36, 2); ctx.fill();
    rounded(ctx, 30, 88, 28, 36, 2); ctx.fill();
    rounded(ctx, 62, 88, 26, 36, 2); ctx.fill();
    rounded(ctx, GAME_W - 88, 46, 28, 36, 2); ctx.fill();
    rounded(ctx, GAME_W - 56, 46, 26, 36, 2); ctx.fill();
    rounded(ctx, GAME_W - 88, 88, 28, 36, 2); ctx.fill();
    rounded(ctx, GAME_W - 56, 88, 26, 36, 2); ctx.fill();

    ctx.fillStyle = 'rgba(61,255,122,0.05)';
    ctx.fillRect(0, GAME_H - 36, GAME_W, 36);
    ctx.strokeStyle = 'rgba(61,255,122,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, GAME_H - 36);
    ctx.lineTo(GAME_W, GAME_H - 36);
    ctx.stroke();
  }

  function drawBg(ctx) {
    var iw = imgBg && (imgBg.naturalWidth || imgBg.width);
    var ih = imgBg && (imgBg.naturalHeight || imgBg.height);
    if (!iw || !ih) {
      drawBgFallback(ctx);
      return;
    }
    /* cover: na pionowym płótnie kadrujemy boki, obraz wyśrodkowany */
    var scale = Math.max(GAME_W / iw, GAME_H / ih);
    var sw = GAME_W / scale;
    var sh = GAME_H / scale;
    var sx = (iw - sw) / 2;
    var sy = (ih - sh) / 2;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(imgBg, sx, sy, sw, sh, 0, 0, GAME_W, GAME_H);
    ctx.imageSmoothingEnabled = true;
    /* lekkie przyciemnienie, żeby spadające elementy i etykiety były czytelne */
    ctx.fillStyle = 'rgba(6, 8, 14, 0.32)';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
  }

  function draw() {
    var ox = 0, oy = 0;
    if (shakeT > 0 && !reduceMotion) {
      var mag = 6 * (shakeT / 0.2);
      ox = (Math.random() * 2 - 1) * mag;
      oy = (Math.random() * 2 - 1) * mag;
    }
    ctx.save();
    ctx.translate(ox, oy);

    drawBg(ctx);
    items.forEach(function (it) {
      if (it.kind === 'bill') drawBill(ctx, it.x, it.y, it.rot);
      else if (it.kind === 'coffee') drawCoffee(ctx, it.x, it.y, it.rot * 0.2);
      else drawHazard(ctx, it);
    });
    arrows.forEach(function (ar) { drawArrow(ctx, ar); });
    if (boss) drawBoss(ctx);
    if (player) drawPlayer(ctx);
    drawSafe(ctx);
    drawFlyers(ctx);

    particles.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life * 3);
      if (p.bill) {
        drawBill(ctx, p.x, p.y, p.life * 4, 0.42);
      } else {
        ctx.fillStyle = p.color;
        var s = Math.max(1.5, p.r);
        if (p.pixel !== false) {
          ctx.imageSmoothingEnabled = false;
          ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), Math.round(s), Math.round(s));
          ctx.imageSmoothingEnabled = true;
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    });
    floats.forEach(function (f) {
      var a = Math.max(0, Math.min(1, f.life * 2));
      ctx.globalAlpha = a;
      var ascii = /^[\x20-\x7e+$]+$/.test(f.text);
      ctx.font = ascii ? fontArcade(8) : fontTiny(18);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = ascii ? 3 : 3;
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    });

    if (mode === 'transition') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      if (transPhase === 'dance') {
        var glow = 0.10 + 0.08 * Math.abs(Math.sin(time * 7));
        ctx.fillStyle = 'rgba(20, 80, 40,' + glow + ')';
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 4;
        ctx.font = fontArcade(14);
        ctx.fillStyle = '#b8ff3d';
        ctx.strokeText('1000 $', GAME_W / 2, 210);
        ctx.shadowColor = 'rgba(184,255,61,0.9)';
        ctx.shadowBlur = 10;
        ctx.fillText('1000 $', GAME_W / 2, 210);
        ctx.shadowBlur = 0;
        ctx.font = fontTiny(30);
        ctx.fillStyle = '#3dff7a';
        ctx.strokeText('Budżet zebrany!', GAME_W / 2, 248);
        ctx.fillText('Budżet zebrany!', GAME_W / 2, 248);
      } else {
        var pulse = 0.18 + 0.14 * Math.abs(Math.sin(time * 10));
        ctx.fillStyle = 'rgba(180,0,20,' + pulse + ')';
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        ctx.fillStyle = '#fff';
        ctx.font = fontArcade(16);
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.lineWidth = 4;
        ctx.strokeText('ETAP 2', GAME_W / 2, GAME_H / 2 - 18);
        ctx.fillText('ETAP 2', GAME_W / 2, GAME_H / 2 - 18);
        ctx.font = fontTiny(26);
        ctx.fillStyle = '#b8ff3d';
        ctx.strokeText('Walka z bossem CTO', GAME_W / 2, GAME_H / 2 + 18);
        ctx.fillText('Walka z bossem CTO', GAME_W / 2, GAME_H / 2 + 18);
      }
    }
    ctx.restore();
  }

  /* ---------- pętla / skalowanie ---------- */
  function fit() {
    var rect = stageEl.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var scale = Math.min(rect.width / GAME_W, rect.height / GAME_H);
    if (!isFinite(scale) || scale <= 0) scale = 1;
    var cssW = Math.max(1, Math.floor(GAME_W * scale));
    var cssH = Math.max(1, Math.floor(GAME_H * scale));
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    draw();
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (paused) {
      draw();
      return;
    }
    if (mode === 'playing' || mode === 'transition') update(dt);
    else if (mode === 'victory') updateVictory(dt);
    draw();
  }

  function setPaused(p) {
    paused = !!p;
    if (mode === 'playing' || mode === 'transition') {
      ovPause.hidden = !paused;
      if (paused) {
        ovStart.hidden = true;
        ovWin.hidden = true;
        ovOver.hidden = true;
      }
    } else {
      ovPause.hidden = true;
    }
    if (!paused) lastTs = 0;
  }

  function startPlay() {
    audioEnsure();
    resetGame();
    hideOverlays();
    mode = 'playing';
    lastTs = 0;
    updateHud();
    fit();
  }

  /* ---------- sterowanie ---------- */
  function bindKey(e, down) {
    var k = e.key;
    var code = e.code;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A' || code === 'KeyA') {
      keys.left = down; if (down) e.preventDefault();
    } else if (k === 'ArrowRight' || k === 'd' || k === 'D' || code === 'KeyD') {
      keys.right = down; if (down) e.preventDefault();
    } else if (k === ' ' || k === 'Spacebar' || code === 'Space') {
      keys.shoot = down; if (down) { e.preventDefault(); shoot(); }
    }
  }
  window.addEventListener('keydown', function (e) {
    if (e.repeat && (e.code === 'Space' || e.key === ' ')) {
      e.preventDefault();
      keys.shoot = true;
      return;
    }
    bindKey(e, true);
  });
  window.addEventListener('keyup', function (e) { bindKey(e, false); });
  window.addEventListener('blur', function () { keys.left = keys.right = keys.shoot = false; });

  function hold(btn, setter) {
    function on(e) {
      e.preventDefault();
      setter(true);
      btn.classList.add('is-down');
    }
    function off(e) {
      if (e) e.preventDefault();
      setter(false);
      btn.classList.remove('is-down');
    }
    btn.addEventListener('pointerdown', function (e) {
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      on(e);
    });
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('pointerleave', function (e) {
      if (btn.classList.contains('is-down')) off(e);
    });
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  hold(btnLeft, function (v) { keys.left = v; });
  hold(btnRight, function (v) { keys.right = v; });
  hold(btnShoot, function (v) { keys.shoot = v; if (v) shoot(); });

  btnPlay.addEventListener('click', startPlay);
  document.getElementById('btn-again-win').addEventListener('click', startPlay);
  document.getElementById('btn-again-over').addEventListener('click', startPlay);
  btnMute.addEventListener('click', function () {
    audioEnsure();
    setMuted(!audio.muted);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) setPaused(true);
    else setPaused(false);
  });
  window.addEventListener('resize', fit);

  /* hook do testów / debugowania */
  window.__graDebug = {
    etap2: startStage2Direct,
    wygrana: function () {
      if (mode === 'start' || !player) { resetGame(); hideOverlays(); }
      budget = Math.max(budget, BUDGET_GOAL);
      if (!boss) startTransition({ skipDance: true });
      if (boss) boss.hp = 0;
      stage = 2;
      endGame(true);
    },
    przegrana: function () {
      if (mode === 'start' || !player) { resetGame(); hideOverlays(); mode = 'playing'; }
      lives = 0;
      endGame(false);
    },
    taniec: function () {
      if (mode === 'start' || !player) { resetGame(); hideOverlays(); }
      budget = Math.max(budget, BUDGET_GOAL);
      startTransition();
    },
    budzet: function (n) { budget = n; updateHud(); },
    lot: function () {
      if (!player) { resetGame(); hideOverlays(); mode = 'playing'; }
      budget += 100;
      startFlyer(player.x, player.y - 80, 100);
      updateHud();
    },
    stan: function () {
      return {
        mode: mode, stage: stage, budget: budget, score: score,
        lives: lives, bossHp: boss ? boss.hp : null, paused: paused,
        safeStack: safeStackValue(), flyers: flyers.length,
        transPhase: transPhase, hasBow: hasBow,
        dance: dance ? { kind: dance.kind, t: dance.t, looping: dance.looping } : null
      };
    }
  };

  /* start: czekamy na fonty, potem pierwsza klatka i pętla */
  resetGame();
  updateHud();
  hud.hidden = true;
  appEl.classList.remove('playing');
  showOverlay(ovStart);
  window.addEventListener('load', fit);

  function boot() {
    if (raf) return;
    fit();
    raf = requestAnimationFrame(loop);
  }
  var fontsOk = false;
  function onFonts() { fontsOk = true; boot(); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(onFonts).catch(onFonts);
  } else {
    onFonts();
  }
  setTimeout(function () { if (!fontsOk) boot(); }, 2500);
})();
