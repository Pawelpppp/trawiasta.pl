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
  function loadImg(src, setter) {
    var im = new Image();
    im.onload = function () { setter(im); };
    im.onerror = function () { setter(null); };
    im.src = src;
  }
  loadImg('/gra/krzysztof.png', function (im) { imgK = im; });
  loadImg('/gra/cto.png', function (im) { imgCto = im; });

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
  var player = null;
  var boss = null;
  var transitionT = 0;
  var lastTs = 0;
  var raf = 0;

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
    boss = null;
    transitionT = 0;
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
    hudStage.textContent = stage === 2 || mode === 'transition' ? 'Etap 2 — Boss CTO' : 'Etap 1';
    if (coffeeUntil > time) {
      hudCoffee.hidden = false;
      hudCoffee.textContent = 'Kawa: ' + Math.ceil(coffeeUntil - time) + ' s';
    } else {
      hudCoffee.hidden = true;
    }
    var playing = mode === 'playing' || mode === 'transition';
    hud.hidden = !playing && mode !== 'victory' && mode !== 'gameover';
    appEl.classList.toggle('playing', playing);
    btnShoot.disabled = !(playing && stage === 2 && mode !== 'transition');
  }

  function addFloat(x, y, text, color) {
    floats.push({ x: x, y: y, text: text, color: color || '#3dff7a', life: 0.9 });
  }
  function burst(x, y, color, n) {
    n = n || 8;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = 40 + Math.random() * 120;
      particles.push({
        x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        color: color, life: 0.35 + Math.random() * 0.25, r: 1.5 + Math.random() * 2
      });
    }
  }

  function playerSpeed() {
    return coffeeUntil > time ? 470 : 280;
  }

  function playerHitbox() {
    return { x: player.x - 20, y: player.y - 90, w: 40, h: 88 };
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

  function startTransition() {
    mode = 'transition';
    stage = 2;
    transitionT = 2.1;
    items = [];
    arrows = [];
    playAlarm();
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

  function startStage2Direct() {
    if (mode === 'start' || mode === 'victory' || mode === 'gameover') {
      resetGame();
      hideOverlays();
      mode = 'playing';
    }
    budget = Math.max(budget, BUDGET_GOAL);
    startTransition();
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
    addFloat(player.x, player.y - 110, '−1 życie', '#ff6b6b');
    burst(player.x, player.y - 50, '#ff6b6b', 12);
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
    addFloat(boss.x, boss.y - 70, '−10 HP', '#b8ff3d');
    burst(boss.x, boss.y, '#d4a0ff', 14);
    score += 100;
    updateHud();
    if (boss.hp <= 0) endGame(true);
  }

  /* ---------- aktualizacja ---------- */
  function update(dt) {
    time += dt;
    if (shotT > 0) shotT -= dt;

    var spd = playerSpeed();
    var dir = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    if (dir) {
      player.x += dir * spd * dt;
      player.facing = dir;
      player.walk += dt * (coffeeUntil > time ? 16 : 11);
    } else {
      player.walk *= Math.max(0, 1 - dt * 8);
    }
    var margin = 36;
    player.x = Math.max(margin, Math.min(GAME_W - margin, player.x));
    if (keys.shoot) shoot();

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
      if (boss) {
        boss.t += dt;
        boss.y += (boss.targetY - boss.y) * Math.min(1, dt * 3.2);
      }
      if (transitionT <= 0) {
        mode = 'playing';
        stage = 2;
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
        addFloat(it.x, it.y, '+100 $', '#3dff7a');
        burst(it.x, it.y, '#3dff7a', 8);
        items.splice(i, 1);
        updateHud();
      } else if (it.kind === 'coffee') {
        score += 50;
        coffeeUntil = time + COFFEE_TIME;
        play('coffee');
        addFloat(it.x, it.y, '+50 pkt', '#f3d19a');
        burst(it.x, it.y, '#c48a4a', 8);
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

    for (i = floats.length - 1; i >= 0; i--) {
      floats[i].life -= dt;
      floats[i].y -= 40 * dt;
      if (floats[i].life <= 0) floats.splice(i, 1);
    }
    for (i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
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
    ctx.font = 'bold 12px Outfit, system-ui, sans-serif';
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
      ctx.font = 'bold 9px Outfit, system-ui, sans-serif';
      ctx.fillText(parts[0], 0, -6);
      ctx.fillText(parts.slice(1).join(' '), 0, 7);
    } else {
      var size = label.length > 8 ? 9 : 11;
      ctx.font = 'bold ' + size + 'px Outfit, system-ui, sans-serif';
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

  function drawBudgetStack(ctx) {
    var n = Math.min(12, Math.floor(budget / 100));
    if (n <= 0 && budget <= 0) {
      /* nadal pokaż etykietę pustego stosu */
    }
    var onRight = player.x < GAME_W - 90;
    var sx = onRight ? player.x + 58 : player.x - 58;
    var baseY = player.y - 8;
    for (var i = 0; i < n; i++) {
      var ox = ((i % 3) - 1) * 3;
      drawBill(ctx, sx + ox, baseY - i * 5.2, 0.08 * ((i % 2) ? 1 : -1), 0.85);
    }
    ctx.save();
    ctx.font = 'bold 11px Outfit, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(10,12,10,0.65)';
    ctx.fillText('Budżet', sx + 1, baseY - n * 5.2 - 16);
    ctx.fillStyle = '#b8ff3d';
    ctx.fillText('Budżet', sx, baseY - n * 5.2 - 17);
    ctx.fillStyle = '#3dff7a';
    ctx.font = 'bold 12px Outfit, system-ui, sans-serif';
    ctx.fillText(fmtMoney(budget), sx, baseY - n * 5.2 - 4);
    ctx.restore();
  }

  function drawPlayer(ctx) {
    var x = player.x;
    var y = player.y;
    var walk = Math.sin(player.walk) * (keys.left || keys.right ? 1 : 0.15);
    var flash = time < invulnUntil && Math.floor(time * 16) % 2 === 0;

    /* stos budżetu za postacią, żeby nie zasłaniał łuku */
    drawBudgetStack(ctx);

    if (flash) ctx.globalAlpha = 0.4;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    var legSwing = walk * 7;
    ctx.fillStyle = '#1a1f2a';
    rounded(ctx, x - 14, y - 34, 11, 28 + (legSwing > 0 ? 0 : 2), 3);
    ctx.fill();
    rounded(ctx, x + 3, y - 34, 11, 28 - (legSwing > 0 ? 0 : 2), 3);
    ctx.fill();
    ctx.fillStyle = '#0b0c10';
    rounded(ctx, x - 15, y - 8, 13, 8, 2);
    ctx.fill();
    rounded(ctx, x + 2, y - 8, 13, 8, 2);
    ctx.fill();

    ctx.fillStyle = '#1c2740';
    rounded(ctx, x - 18, y - 78, 36, 48, 8);
    ctx.fill();
    ctx.fillStyle = '#f4f4f0';
    ctx.beginPath();
    ctx.moveTo(x, y - 76);
    ctx.lineTo(x - 7, y - 52);
    ctx.lineTo(x + 7, y - 52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3dff7a';
    ctx.beginPath();
    ctx.moveTo(x, y - 74);
    ctx.lineTo(x - 3.2, y - 42);
    ctx.lineTo(x + 3.2, y - 42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a0c0a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y - 74);
    ctx.lineTo(x, y - 42);
    ctx.stroke();

    /* lewe ramię */
    ctx.save();
    ctx.translate(x - 16, y - 72);
    ctx.rotate(-0.35 + walk * 0.25);
    ctx.fillStyle = '#1c2740';
    rounded(ctx, -7, 0, 10, 30, 4);
    ctx.fill();
    ctx.fillStyle = '#f4c7a8';
    ctx.beginPath();
    ctx.arc(-2, 32, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* prawe ramię / łuk */
    ctx.save();
    ctx.translate(x + 16, y - 72);
    if (stage === 2) {
      ctx.rotate(-0.15);
      ctx.fillStyle = '#1c2740';
      rounded(ctx, -3, 0, 10, 26, 4);
      ctx.fill();
      ctx.fillStyle = '#f4c7a8';
      ctx.beginPath();
      ctx.arc(3, 28, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(6, 10);
      drawBow(ctx, keys.shoot && shotT > SHOT_COOLDOWN * 0.3);
    } else {
      ctx.rotate(0.4 - walk * 0.25);
      ctx.fillStyle = '#1c2740';
      rounded(ctx, -3, 0, 10, 30, 4);
      ctx.fill();
      ctx.fillStyle = '#f4c7a8';
      ctx.beginPath();
      ctx.arc(3, 32, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (coffeeUntil > time) {
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

    drawHead(ctx, imgK, x, y - 96, 22, drawFallbackKrzysztof);
    ctx.restore();
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
    ctx.font = 'bold 10px Outfit, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, -12);
    ctx.restore();
  }

  function drawBoss(ctx) {
    if (!boss) return;
    var x = boss.x, y = boss.y, t = boss.t;
    boss.tips = [];
    /* macki (za ciałem) — rozchodzą się na boki i falują */
    var i, s, k, px, py, pts;
    for (i = 0; i < 8; i++) {
      var spread = (i - 3.5) / 3.5;
      var attachX = x + spread * 36;
      var attachY = y + 36;
      var len = 100 + Math.abs(spread) * 28 + (i % 2) * 14;
      var wave1 = Math.sin(t * 2.15 + i * 0.85);
      var wave2 = Math.sin(t * 2.6 + i * 1.1 + 1);
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
      ctx.strokeStyle = i % 2 ? '#6b2f9a' : '#4e1f78';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 16 - Math.abs(spread) * 3;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(210,160,255,0.28)';
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
    ctx.fillStyle = '#6e33a8';
    ctx.beginPath();
    ctx.ellipse(x, y + 28, 78, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a4cc4';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 70, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a2488';
    ctx.beginPath();
    ctx.ellipse(x, y + 36, 50, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    /* błysk na ciele */
    ctx.fillStyle = 'rgba(255,220,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(x - 22, y, 18, 12, -0.4, 0, Math.PI * 2);
    ctx.fill();

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
    ctx.font = 'bold 11px Outfit, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('CTO  ' + boss.hp + ' / ' + BOSS_HP_MAX + ' HP', x, by - 4);
  }

  function drawBg(ctx) {
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

    /* okna biurowe w tle */
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

  function draw() {
    drawBg(ctx);
    items.forEach(function (it) {
      if (it.kind === 'bill') drawBill(ctx, it.x, it.y, it.rot);
      else if (it.kind === 'coffee') drawCoffee(ctx, it.x, it.y, it.rot * 0.2);
      else drawHazard(ctx, it);
    });
    arrows.forEach(function (ar) { drawArrow(ctx, ar); });
    if (boss) drawBoss(ctx);
    if (player) drawPlayer(ctx);

    particles.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life * 3);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    floats.forEach(function (f) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 2));
      ctx.fillStyle = f.color;
      ctx.font = 'bold 14px Outfit, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    });

    if (mode === 'transition') {
      var pulse = 0.18 + 0.14 * Math.abs(Math.sin(time * 10));
      ctx.fillStyle = 'rgba(180,0,20,' + pulse + ')';
      ctx.fillRect(0, 0, GAME_W, GAME_H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px Outfit, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ETAP 2', GAME_W / 2, GAME_H / 2 - 18);
      ctx.font = 'bold 18px Outfit, system-ui, sans-serif';
      ctx.fillStyle = '#b8ff3d';
      ctx.fillText('Walka z bossem CTO', GAME_W / 2, GAME_H / 2 + 16);
    }
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
    else if (player) {
      /* delikatny bezruch na ekranie startowym — tło i postać */
    }
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
      if (mode === 'start' || !player) { resetGame(); hideOverlays(); mode = 'playing'; }
      budget = Math.max(budget, BUDGET_GOAL);
      if (!boss) startTransition();
      boss.hp = 0;
      mode = 'playing';
      stage = 2;
      endGame(true);
    },
    przegrana: function () {
      if (mode === 'start' || !player) { resetGame(); hideOverlays(); mode = 'playing'; }
      lives = 0;
      endGame(false);
    },
    budzet: function (n) { budget = n; updateHud(); },
    stan: function () {
      return {
        mode: mode, stage: stage, budget: budget, score: score,
        lives: lives, bossHp: boss ? boss.hp : null, paused: paused
      };
    }
  };

  /* start: tło na ekranie startowym z postacią */
  resetGame();
  updateHud();
  hud.hidden = true;
  appEl.classList.remove('playing');
  showOverlay(ovStart);
  fit();
  raf = requestAnimationFrame(loop);
  window.addEventListener('load', fit);
})();
