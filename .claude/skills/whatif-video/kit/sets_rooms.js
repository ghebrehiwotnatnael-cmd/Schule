/* "rooms": several interiors side by side (camera picks one by position):
   hospital x=0, airport x=60, telegraph office 1859 x=120, kitchen x=180, office x=240, living room x=300.
   Tracks: tv (living-room news), boardgame, power (0 = blackout), backup (hospital emergency light), board (0 normal / 1 cancelled), offline (office screens),
   sparks (telegraph), aurora (window), candles, fridge (0 closed-dark / 1 light), crowd. */
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];
  B.push(function (WI) {
    const { THREE, R, rr, num, col, glowTex, canvasTex } = WI; const K = window.WI_COMMON(WI); const MK = window.WI_MODELKIT(WI);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0b0e); const env = MK.envs(scene);
    const hemi = new THREE.HemisphereLight(0xfff3e0, 0x30281f, 0.6); scene.add(hemi);
    const sunIn = new THREE.DirectionalLight(0xfff1dc, 0); sunIn.position.set(40, 30, 60); scene.add(sunIn);   // daylight through windows
    const ceil = []; function ceilingLight(x, y, z, c = 0xfff4e0, i = 1.2, d = 14) { const l = new THREE.PointLight(c, i, d, 2); l.position.set(x, y, z); scene.add(l);
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.4), new THREE.MeshBasicMaterial({ color: 0xffffff })); p.position.set(x, y + 0.25, z); scene.add(p); ceil.push([l, p, i]); return l; }
    const people = [];
    const place = (file, o, x, y, z, r = 0) => { const m = WI.model(file, o); m.position.set(x, y, z); m.rotation.y = r; scene.add(m); return m; };
    const screen = (w, h, draw) => { const c = document.createElement("canvas"); c.width = Math.round(w * 400); c.height = Math.round(h * 400); const tx = new THREE.CanvasTexture(c);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx })); m.userData.draw = (k, t) => { draw(c.getContext("2d"), c.width, c.height, k, t); tx.needsUpdate = true; }; return m; };
    // ---------------- hospital (x 0)
    K.room(scene, 6, 3, 7, 0xe8eef0, 0xb9c4c9, new THREE.Vector3(0, 0, 0));
    place("ultimatehomeinterior/FBX/Bed_Single.fbx", { height: 0.7, maxFoot: 2.1, alongZ: true }, -1.2, 0, -1.5);
    const patient = MK.person(scene, window.PEOPLE[2], { x: -1.2, seat: 0.62, z: -1.9, rot: 0, mode: "sit" }); people.push(patient);
    const nurse = MK.person(scene, window.PEOPLE[3], { x: 0.6, y: 0, z: -1.2, rot: -1.2, mode: "stand" }); people.push(nurse);
    const mon = screen(0.6, 0.4, (g, w, h, k, t) => { g.fillStyle = "#04120a"; g.fillRect(0, 0, w, h); if (k < 0.05) return; g.strokeStyle = "#34ff7a"; g.lineWidth = 4; g.beginPath();
      for (let x = 0; x < w; x += 3) { const ph = (x / w * 3 + t * 1.2) % 1; const y = h * 0.55 - (ph > 0.42 && ph < 0.46 ? h * 0.35 : ph > 0.46 && ph < 0.5 ? -h * 0.12 : Math.sin(ph * 20) * 3); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      g.fillStyle = "#34ff7a"; g.font = `bold ${h * 0.18}px Arial`; g.fillText("HR 78", w * 0.62, h * 0.25); });
    mon.position.set(-2.6, 1.6, -1.4); mon.rotation.y = Math.PI / 2; scene.add(mon);
    const iv = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.9, 6), MK.std(0xb0b0b0, { metalness: 0.7, roughness: 0.3 })); iv.position.set(-0.2, 0.95, -2.4); scene.add(iv);
    const hospL = ceilingLight(0, 2.7, -1, 0xf2fbff, 1.4, 12); const emerg = new THREE.PointLight(0xff8a40, 0, 9, 2); emerg.position.set(1.8, 2.6, -3.0); scene.add(emerg);
    const emergBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: 0x552200 })); emergBox.position.set(1.8, 2.75, -3.45); scene.add(emergBox);
    // ---------------- airport hall (x 60)
    K.room(scene, 40, 9, 30, 0xdfe3e8, 0x9ea4ab, new THREE.Vector3(60, 0, -6));
    const flights = [["08:15", "LONDON", "LH 2481"], ["08:30", "NEW YORK", "UA 961"], ["08:45", "DUBAI", "EK 46"], ["09:05", "TOKYO", "NH 204"], ["09:20", "ROME", "AZ 403"],
      ["09:35", "MADRID", "IB 3101"], ["09:50", "ISTANBUL", "TK 1590"], ["10:10", "BERLIN", "EW 9041"]];
    const board = screen(9, 4.2, (g, w, h, k) => { g.fillStyle = "#0b0f1a"; g.fillRect(0, 0, w, h); g.fillStyle = "#ffd34d"; g.font = `bold ${h * 0.08}px Arial`; g.fillText("DEPARTURES", w * 0.03, h * 0.1);
      flights.forEach((f, i) => { const y = h * (0.22 + i * 0.1); g.fillStyle = "#e5e7eb"; g.font = `${h * 0.065}px monospace`; g.fillText(f[0] + "   " + f[2].padEnd(8) + f[1], w * 0.03, y);
        const st = k > 0.5 ? (i % 3 === 1 ? "DELAYED" : "CANCELLED") : (i < 2 ? "BOARDING" : "ON TIME"); g.fillStyle = k > 0.5 ? "#ff4d4d" : "#4dff88"; g.fillText(st, w * 0.72, y); }); });
    board.position.set(60, 5.5, -20.9); scene.add(board);
    for (let i = 0; i < 4; i++) ceilingLight(48 + i * 8, 8.5, -8, 0xffffff, 1.6, 26);
    for (let i = 0; i < 26; i++) { const r = R(); people.push(MK.person(scene, window.PEOPLE[i % 8], { x: rr(46, 74), z: rr(-16, 4), rot: R() < 0.7 ? Math.PI + rr(-0.4, 0.4) : rr(0, 6), mode: r < 0.3 ? "walk" : r < 0.85 ? "stand" : "sit", span: 18 })); }
    for (let i = 0; i < 5; i++) { const bench = new THREE.Mesh(new THREE.BoxGeometry(4, 0.45, 0.8), MK.std(0x3b4252)); bench.position.set(50 + i * 5, 0.22, 2); scene.add(bench); }
    // ---------------- telegraph office 1859 (x 120)
    K.room(scene, 6, 3.2, 6, 0x8b6b4a, 0x5a4330, new THREE.Vector3(120, 0, 0));
    place("ultimatefurniture/FBX/Table.fbx", { height: 0.8, maxFoot: 1.8 }, 120, 0, -1.8);
    place("ultimatefurniture/FBX/Chair.fbx", { height: 1.0 }, 120, 0, -0.9, Math.PI);
    place("ultimatefurniture/FBX/Bookcase_Books.fbx", { height: 2.2 }, 122.4, 0, -2.6);
    const op = MK.person(scene, window.PEOPLE[2], { x: 120, seat: 0.47, z: -1.05, rot: Math.PI, mode: "sit" }); people.push(op);
    const key = new THREE.Group(); key.position.set(120.2, 0.8, -1.7); scene.add(key);
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.12), MK.std(0x4a3626)); key.add(kb);
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.025), MK.std(0xb08d57, { metalness: 0.8, roughness: 0.3 })); lever.position.y = 0.05; key.add(lever);
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12), MK.std(0x8b4513, { metalness: 0.5 })); coil.position.set(-0.35, 0.86, -1.8); coil.position.x += 120 - 0.15; scene.add(coil);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 3, 6), MK.std(0x222222)); wire.position.set(119.6, 2.2, -2.9); wire.rotation.z = Math.PI / 2; scene.add(wire);
    const oilLamp = new THREE.PointLight(0xffa64a, 1.2, 8, 2); oilLamp.position.set(119.4, 1.2, -1.8); scene.add(oilLamp);
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb04a, transparent: true, depthWrite: false })); flame.scale.setScalar(0.35); flame.position.copy(oilLamp.position); scene.add(flame);
    const sparks = []; for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xbfe6ff, transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); s.userData.ph = R() * 10; scene.add(s); sparks.push(s); }
    const aurTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#03060f"; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const x = R() * w; const gr = g.createLinearGradient(0, h * 0.1, 0, h * 0.8);
      gr.addColorStop(0, "rgba(255,60,120,0)"); gr.addColorStop(0.4, "rgba(80,255,160,0.35)"); gr.addColorStop(1, "rgba(20,120,80,0)"); g.fillStyle = gr; g.fillRect(x, 0, rr(6, 30), h); }
      g.fillStyle = "#0d0d10"; g.fillRect(0, h * 0.82, w, h); });
    const winA = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshBasicMaterial({ map: aurTex, transparent: true })); winA.position.set(122.99, 1.7, -0.5); winA.rotation.y = -Math.PI / 2; scene.add(winA);
    // ---------------- kitchen (x 180)
    K.room(scene, 5, 2.8, 5, 0xe9e2d4, 0x9c8466, new THREE.Vector3(180, 0, 0));
    place("ultimatehomeinterior/FBX/Kitchen_2Drawers.fbx", { height: 0.92, maxFoot: 1.6 }, 179.2, 0, -2.15);
    place("ultimatehomeinterior/FBX/Kitchen_Sink.fbx", { height: 0.92, maxFoot: 1.2 }, 180.6, 0, -2.15);
    const fridge = place("ultimatehomeinterior/FBX/Kitchen_Fridge.fbx", { height: 1.9 }, 182.0, 0, -2.0);
    place("ultimatehomeinterior/FBX/Kitchen_Oven.fbx", { height: 0.92, maxFoot: 0.9 }, 178.0, 0, -2.15);
    const fridgeLight = new THREE.PointLight(0xdff2ff, 0, 4, 2); fridgeLight.position.set(182, 1.1, -1.3); scene.add(fridgeLight);
    const kLight = ceilingLight(180, 2.55, -0.5, 0xfff1d6, 1.0, 9);
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshStandardMaterial({ color: 0xbfe0ff, roughness: 0.1 })); scene.add(drip);
    // ---------------- office (x 240)
    const officePanels = []; K.room(scene, 16, 3.2, 14, 0xe5e7eb, 0x6b7280, new THREE.Vector3(240, 0, -3));
    { const ceil = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), new THREE.MeshStandardMaterial({ color: 0xd9dce1, roughness: 0.9, emissive: 0x4a4d52, side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.set(240, 3.2, -3); scene.add(ceil);
      for (let i = 0; i < 6; i++) { const pnl = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), new THREE.MeshStandardMaterial({ color: 0xf2f4f7, emissive: 0xffffff, emissiveIntensity: 0 })); pnl.position.set(234 + (i % 3) * 6, 3.17, -6 + Math.floor(i / 3) * 6); scene.add(pnl); officePanels.push(pnl); } }
    const screens = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 234 + c * 3.6, z = -1 - r * 3.2;
      place("ultimatefurniture/FBX/Desk.fbx", { height: 0.78, maxFoot: 1.6 }, x, 0, z);
      place("ultimatefurniture/FBX/OfficeChair.fbx", { height: 1.1 }, x, 0, z + 0.85, Math.PI);
      const sc = screen(0.6, 0.36, (g, w, h, k) => { if (k < 0) { g.fillStyle = "#07080a"; g.fillRect(0, 0, w, h); return; } g.fillStyle = k > 0.5 ? "#f3f4f6" : "#1e3a8a"; g.fillRect(0, 0, w, h);
        if (k > 0.5) { g.fillStyle = "#6b7280"; g.font = `bold ${h * 0.12}px Arial`; g.fillText("No internet", w * 0.12, h * 0.45); g.font = `${h * 0.08}px Arial`; g.fillText("ERR_INTERNET_DISCONNECTED", w * 0.12, h * 0.62); }
        else { for (let i = 0; i < 6; i++) { g.fillStyle = ["#60a5fa", "#a78bfa", "#34d399"][i % 3]; g.fillRect(w * 0.08, h * (0.15 + i * 0.12), w * rr(0.3, 0.8), h * 0.06); } } });
      sc.position.set(x, 1.12, z - 0.25); scene.add(sc); screens.push(sc);
      people.push(MK.person(scene, window.PEOPLE[(r * 4 + c) % 8], { x, seat: 0.5, z: z + 0.8, rot: Math.PI, mode: "sit" })); }
    for (let i = 0; i < 3; i++) ceilingLight(234 + i * 6, 3.0, -4, 0xffffff, 1.4, 16);
    // ---------------- living room by candlelight (x 300)
    K.room(scene, 6, 2.8, 6, 0xd8ccb8, 0x7a5a3a, new THREE.Vector3(300, 0, 0));
    place("ultimatehomeinterior/FBX/Couch_Large1.fbx", { height: 0.9, maxFoot: 2.6 }, 300, 0, -2.2);
    place("ultimatehomeinterior/FBX/Table_RoundLarge.fbx", { height: 0.75, maxFoot: 1.4 }, 300, 0, -0.6);
    place("ultimatehomeinterior/FBX/Bookshelf.fbx", { height: 2.0 }, 302.5, 0, -2.4, -Math.PI / 2);
    place("ultimatehomeinterior/FBX/Houseplant_3.fbx", { height: 1.2 }, 297.6, 0, -2.4);
    const fam = [[-0.8, -2.0, 0], [0.8, -2.0, 0], [0.0, 0.5, Math.PI]].map(([x, z, r], i) => MK.person(scene, window.PEOPLE[i + 4], { x: 300 + x, seat: i < 2 ? 0.45 : 0.42, z, rot: r, mode: "sit", kid: i === 2 }));
    fam.forEach((p) => people.push(p));
    // TV on the front wall (news broadcast) + board game on the table
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.06), MK.std(0x111215)); tvFrame.position.set(300, 1.45, 2.94); scene.add(tvFrame);
    const tv = screen(1.4, 0.8, (g, w, h, k, t) => { if (k < 0.5) { g.fillStyle = "#050607"; g.fillRect(0, 0, w, h); return; }
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#0b2a5b"); gr.addColorStop(1, "#071631"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "#d61f26"; g.fillRect(w * 0.05, h * 0.08, w * 0.16, h * 0.13); g.fillStyle = "#fff"; g.font = `bold ${h * 0.09}px Arial`; g.fillText("LIVE", w * 0.075, h * 0.18);
      g.fillStyle = "#1e3a8a"; g.fillRect(w * 0.6, h * 0.25, w * 0.32, h * 0.42); if (WI.val("tvAnchor", t) === "f") { g.fillStyle = "#5a3520"; g.fillRect(w * 0.76 - h * 0.11, h * 0.36, h * 0.22, h * 0.2); g.beginPath(); g.arc(w * 0.76, h * 0.4, h * 0.11, 0, 7); g.fill(); } g.fillStyle = "#e8b88f"; g.beginPath(); g.arc(w * 0.76, h * 0.42, h * 0.09, 0, 7); g.fill(); g.fillStyle = "#273449"; g.fillRect(w * 0.68, h * 0.52, w * 0.16, h * 0.15);
      g.fillStyle = "#ffffff"; g.fillRect(0, h * 0.7, w, h * 0.17); g.fillStyle = "#0b1b3a"; g.font = `bold ${h * 0.085}px Arial`; g.fillText(WI.val("tvHeadline", t) || "GLOBAL INTERNET OUTAGE", w * 0.04, h * 0.81);
      g.fillStyle = "#d61f26"; g.fillRect(0, h * 0.87, w, h * 0.13); g.fillStyle = "#fff"; g.font = `${h * 0.07}px Arial`;
      const msg = WI.val("tvTicker", t) || "BANKS CLOSED · FLIGHTS GROUNDED · TV AND RADIO STILL ON AIR · STAY TUNED · "; const x0 = w - ((t * 140) % (w * 3)); g.fillText(msg + msg, x0, h * 0.96); });
    tv.rotation.y = Math.PI; tv.position.set(300, 1.45, 2.905); scene.add(tv);
    const tvGlow = new THREE.PointLight(0x7fa8ff, 0, 5, 2); tvGlow.position.set(300, 1.4, 2.3); scene.add(tvGlow);
    const game = new THREE.Group(); game.position.set(300, 0.765, -0.6); scene.add(game);
    { const bc = document.createElement("canvas"); bc.width = bc.height = 256; const bg = bc.getContext("2d"); bg.fillStyle = "#f4ead2"; bg.fillRect(0, 0, 256, 256);
      const cols = ["#e63946", "#2a9d8f", "#e9c46a", "#457b9d"]; for (let i = 0; i < 4; i++) { bg.fillStyle = cols[i]; bg.fillRect(i % 2 ? 160 : 0, i < 2 ? 0 : 160, 96, 96); }
      bg.fillStyle = "#ffffff"; bg.fillRect(96, 0, 64, 256); bg.fillRect(0, 96, 256, 64); bg.strokeStyle = "#333"; for (let i = 0; i <= 11; i++) { bg.strokeRect(96, i * 23, 64, 23); bg.strokeRect(i * 23, 96, 23, 64); }
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.5), [MK.std(0x7a5a3a), MK.std(0x7a5a3a), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(bc), roughness: 0.7 }), MK.std(0x7a5a3a), MK.std(0x7a5a3a), MK.std(0x7a5a3a)]); game.add(board);
      [[0xe63946, -0.15, -0.15], [0x2a9d8f, 0.15, -0.15], [0xe9c46a, -0.15, 0.15], [0x457b9d, 0.12, 0.17], [0xe63946, 0.0, -0.05]].forEach(([c, x, z]) => { const pc = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 12), MK.std(c)); pc.position.set(x, 0.03, z); pc.castShadow = true; game.add(pc); });
      const die = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), MK.std(0xffffff)); die.position.set(0.08, 0.02, 0.05); die.rotation.y = 0.5; game.add(die); }
    const candles = [], candleSticks = []; for (const [x, z] of [[299.7, -0.6], [300.3, -0.5], [300.0, -0.8], [302.4, -1.9]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10), MK.std(0xfff8e7)); c.position.set(x, x > 302 ? 1.25 : 0.86, z); scene.add(c); candleSticks.push(c);
      const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb347, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); f.scale.setScalar(0.18); f.position.set(x, c.position.y + 0.14, z); scene.add(f);
      const l = new THREE.PointLight(0xff9a40, 0, 5, 2); l.position.copy(f.position); scene.add(l); candles.push([f, l]); }
    const liv = ceilingLight(300, 2.55, -1, 0xfff1d6, 1.0, 9);
    return { name: "rooms", scene, people, update(t, look, pos) {
      env(t); sunIn.intensity = num("daylight", t, 0); const pw = num("power", t, 1); hemi.intensity = 0.06 + 0.54 * pw; WI.envIntensity(scene, num("envI", t, 1) * (0.15 + 0.85 * pw));
      ceil.forEach(([l, p, i]) => { l.intensity = i * pw; p.material.color.setScalar(0.15 + 0.85 * pw); });
      // hospital
      const bk = num("backup", t); hospL.intensity = 1.4 * Math.max(pw, bk * 0.5); emerg.intensity = bk * (1.2 + 0.4 * Math.sin(t * 6)); emergBox.material.color.setHex(bk > 0.5 ? 0xff7a1a : 0x552200);
      mon.userData.draw(Math.max(pw, bk), t);
      // airport
      board.userData.draw(num("board", t), t);
      // telegraph
      const sp = num("sparks", t); sparks.forEach((s, i) => { const u = s.userData.ph; const on = Math.sin(t * 23 + u * 7) > 0.6 ? 1 : 0; s.material.opacity = sp * on;
        s.position.set(119.7 + Math.sin(u * 3) * 0.6, 0.95 + Math.abs(Math.sin(t * 5 + u)) * 0.5, -1.75 + Math.cos(u * 5) * 0.2); s.scale.setScalar(0.06 + 0.08 * Math.abs(Math.sin(t * 31 + u))); });
      lever.rotation.z = Math.sin(t * 18) > 0.3 ? -0.12 : 0; flame.scale.setScalar(0.32 + Math.sin(t * 15) * 0.03); oilLamp.intensity = 1.1 + Math.sin(t * 13) * 0.1;
      winA.material.opacity = 0.3 + 0.7 * num("aurora", t);
      // kitchen
      const fr = num("fridge", t); fridgeLight.intensity = fr * 1.2 * pw; drip.visible = num("tapDrip", t) > 0.5; drip.position.set(180.6, 1.05 - ((t * 1.4) % 1) * 0.15, -2.05);
      // office
      const off = num("offline", t); officePanels.forEach(p => p.material.emissiveIntensity = 0.9 * pw); screens.forEach((s, i) => s.userData.draw(pw < 0.5 ? -1 : off > 0.5 ? 1 : 0, t));
      // candles
      const tvk = num("tv", t); tv.userData.draw(tvk, t); tvGlow.intensity = tvk * (0.7 + 0.1 * Math.sin(t * 9)); game.visible = num("boardgame", t) > 0.5;
      const cn = num("candles", t); candleSticks.forEach((c) => c.visible = cn > 0.5 || num("boardgame", t) < 0.5); candles.forEach(([f, l], i) => { f.visible = cn > 0.5; l.intensity = cn * (0.9 + 0.15 * Math.sin(t * 11 + i * 2)); f.scale.setScalar(0.17 + 0.02 * Math.sin(t * 17 + i)); });
      MK.crowd(people, t, { frac: 1, panic: num("panic", t), look: num("lookUp", t) > 0.5 });
      return scene; } };
  });
})();
