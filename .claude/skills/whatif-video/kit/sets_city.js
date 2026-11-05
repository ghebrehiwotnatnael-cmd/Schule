/* City sets: "paris" (Champ de Mars + Eiffel Tower), "home" (Paris flat: living room with TV/dinner + kid's room),
   "supermarket".  Track names used: skyTop/skyHorizon/skyBottom, sunDir, light, ambient, ambientColor, lightColor,
   insects, bloom, dry, people, walk, lookUp, news, dinner, fruitBowl, book, fruit, price, soldout, queue, panic. */
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];

  // ================================================================ PARIS
  B.push(function (WI) {
    const { THREE, R, rr, box, canvasTex, num, col, makePerson, animatePerson } = WI; const K = window.WI_COMMON(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene);
    const grass = K.mat(0x4f8a2e), gravel = K.mat(0xcdbb98);
    const g0 = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), gravel); g0.rotation.x = -Math.PI / 2; scene.add(g0);
    const lawns = [];
    for (const [x, w] of [[-22, 36], [22, 36]]) for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 70), grass); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, 30 - k * 80); scene.add(m); lawns.push(m); }
    const mid = new THREE.Mesh(new THREE.PlaneGeometry(8, 330), grass); mid.rotation.x = -Math.PI / 2; mid.position.set(0, 0.02, -90); scene.add(mid);
    // Eiffel Tower (lattice via alpha texture on square frustums)
    const lat = canvasTex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 7;
      g.strokeRect(3, 3, w - 6, h - 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); });
    const steel = new THREE.MeshLambertMaterial({ color: 0x6e5b48, alphaMap: lat, alphaTest: 0.5, side: THREE.DoubleSide });
    const tower = new THREE.Group(); tower.position.set(0, 0, -420); scene.add(tower);
    function frustum(r0, r1, h, y, rep) { const g = new THREE.CylinderGeometry(r1, r0, h, 4, 1, true); const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4 * rep, uv.getY(i) * rep * h / (r0 + r1)); const m = new THREE.Mesh(g, steel);
      m.rotation.y = Math.PI / 4; m.position.y = y + h / 2; tower.add(m); return m; }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { // four legs
      const g = new THREE.CylinderGeometry(4.5, 8, 62, 4, 1, true); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 10);
      const m = new THREE.Mesh(g, steel); m.position.set(sx * 38, 29, sz * 38); m.rotation.order = "YXZ"; m.rotation.z = sx * 0.36; m.rotation.x = -sz * 0.36; tower.add(m); }
    const plat = K.mat(0x5d4b3b); const p1 = new THREE.Mesh(new THREE.BoxGeometry(62, 5, 62), plat); p1.position.y = 58; tower.add(p1);
    frustum(26, 14, 58, 60, 3); const p2 = new THREE.Mesh(new THREE.BoxGeometry(32, 4, 32), plat); p2.position.y = 118; tower.add(p2);
    frustum(13, 4, 150, 120, 6); const p3 = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), plat); p3.position.y = 272; tower.add(p3);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, 28, 6), plat); ant.position.y = 289; tower.add(ant);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(30, 2, 6, 20, Math.PI), steel); arch.position.set(0, 10, 34); tower.add(arch);
    const arch2 = arch.clone(); arch2.position.z = -34; tower.add(arch2);
    // Haussmann blocks along both sides + plane-tree rows
    const facade = canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#e8dcc4"; g.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 16) for (let x = 6; x < w; x += 14) {
      g.fillStyle = "#4b5563"; g.fillRect(x, y, 7, 10); g.fillStyle = "#2b2b2b"; g.fillRect(x - 1, y + 10, 9, 2); } });
    const fm = new THREE.MeshLambertMaterial({ map: facade }), roof = K.mat(0x5f6b7a);
    for (const side of [-1, 1]) for (let z = 40; z > -360; z -= 34) {
      const w = rr(26, 32), h = rr(20, 24), x = side * rr(78, 84); const g = new THREE.BoxGeometry(14, h, w); const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 8, uv.getY(i) * h / 8);
      const m = new THREE.Mesh(g, fm); m.position.set(x, h / 2, z); scene.add(m);
      const r = new THREE.Mesh(new THREE.CylinderGeometry(4, 8, 6, 4, 1), roof); r.scale.set(1, 1, w / 11); r.rotation.y = Math.PI / 4; r.position.set(x, h + 3, z); scene.add(r); }
    const trunk = K.mat(0x6b5a46), leaf = new THREE.MeshLambertMaterial({ color: 0x3f6f2a, flatShading: true }); const leaves = [];
    for (const x of [-46, -52, 46, 52]) for (let z = 30; z > -330; z -= 11) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 5, 6), trunk); t.position.set(x, 2.5, z); scene.add(t);
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(3.2, 4), 0), leaf); c.position.set(x, 7, z); c.rotation.set(R(), R(), R()); scene.add(c); leaves.push(c); }
    // flowers, hero flower, insects
    const bed = K.flowers(scene, [-14, 14, 4, -30], 2600);
    const hero = K.heroFlower(scene, new THREE.Vector3(0, 0, -1.0));
    const heroBee = new THREE.Group(); scene.add(heroBee);
    { const stripe = canvasTex(32, 32, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#1d1a14" : "#f4b81c"; g.fillRect(i * 8, 0, 8, 32); } });
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), new THREE.MeshLambertMaterial({ map: stripe })); b.scale.set(1.5, 1, 1); heroBee.add(b); heroBee.scale.setScalar(0.6);
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), K.mat(0x1d1a14)); hd.position.x = 0.018; heroBee.add(hd);
      const wm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
      heroBee.userData.w = [-1, 1].map((k) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.012), wm); w.position.set(-0.002, 0.012, 0.01 * k); heroBee.add(w); return w; }); }
    const heroPop = new THREE.Sprite(new THREE.SpriteMaterial({ map: WI.glowTex, color: 0xfff3c4, transparent: true, depthWrite: false, opacity: 0 })); heroPop.scale.setScalar(0.08); scene.add(heroPop);
    const bugs = K.insects(scene, { center: new THREE.Vector3(0, 0, -8), radius: 9, bees: 40, butterflies: 26, height: 1.5, mosquitos: 260, swarm: new THREE.Vector3(3, 2.4, -11) });
    // picnickers, walkers, kids, blankets
    const ppl = [];
    const blanketTex = canvasTex(32, 32, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? "#ffffff" : "#2563eb"; g.fillRect(x * 8, y * 8, 8, 8); } });
    for (let i = 0; i < 9; i++) { const x = rr(-30, 30), z = rr(-12, -70); const bl = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.4), new THREE.MeshLambertMaterial({ map: blanketTex }));
      bl.rotation.x = -Math.PI / 2; bl.rotation.z = rr(0, 3); bl.position.set(x, 0.05, z); scene.add(bl);
      for (let k = 0; k < 2; k++) { const p = makePerson("sit", { x: x + rr(-0.8, 0.8), z: z + rr(-0.6, 0.6), rot: rr(0, 6.28) }); scene.add(p); ppl.push(p); } }
    for (let i = 0; i < 44; i++) { const m = R(); const p = makePerson(m < 0.55 ? "walk" : "stand", { x: rr(-34, 34), z: rr(-14, -110), rot: rr(0, 6.28), kid: R() < 0.15 }); scene.add(p); ppl.push(p); }
    ppl.sort(() => R() - 0.5);
    return { name: "paris", scene, update(t, look, pos) {
      sky(t, num, col); L.update(t, num, col, new THREE.Vector3(look[0] * 0.1 + pos[0] * 0.9, 0, look[2] * 0.1 + pos[2] * 0.9), num("shadowSize", t, 25));
      const dry = num("dry", t); grass.color.setHex(0x4f8a2e).lerp(new THREE.Color(0x9a8a55), dry); leaf.color.setHex(0x3f6f2a).lerp(new THREE.Color(0x7d6b3a), dry * 0.7);
      bed(num("bloom", t, 1), dry);
      const ins = num("insects", t, 1); bugs(t, ins);
      const hb = Math.max(0, Math.min(1, num("heroBee", t, ins))); heroBee.visible = hb > 0.02; heroBee.scale.setScalar(Math.max(0.01, hb) * 0.6);
      heroBee.position.set(0.005 + Math.sin(t * 1.3) * 0.004, 0.437, -1.0 + Math.cos(t * 1.1) * 0.004); heroBee.rotation.y = 0.6 + Math.sin(t * 0.7) * 0.3;
      heroBee.userData.w.forEach((w, j) => { w.rotation.x = Math.sin(t * 80 + j * 3) * 0.9; });
      heroPop.position.copy(heroBee.position); heroPop.material.opacity = hb > 0.02 && hb < 0.98 ? Math.sin(hb * Math.PI) : 0;
      hero.rotation.z = Math.sin(t * 1.4) * 0.03;
      const pv = num("people", t, 1), walk = num("walk", t, 1), lk = num("lookUp", t);
      ppl.forEach((p, i) => { const u = p.userData; p.visible = (i + 0.5) / ppl.length < pv; if (!p.visible) return;
        if (u.mode === "walk") { const d = (t * u.speed * walk + u.phase * 3) % 40 - 20; p.position.set(u.x + Math.sin(u.rot) * d, 0, u.z + Math.cos(u.rot) * d); }
        animatePerson(p, t, { walk: u.mode === "walk" ? walk : 0, look: lk * (i % 2), point: i % 4 === 0 ? num("point", t) : 0, phone: num("phones", t) > 0.5 && i % 3 === 0 }); });
      return scene; } };
  });

  // ================================================================ HOME (living room at origin, kid's room at x = 40)
  B.push(function (WI) {
    const { THREE, R, rr, canvasTex, num, col, makePerson, animatePerson } = WI; const K = window.WI_COMMON(WI);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1714);
    const amb = new THREE.HemisphereLight(0xfff1dc, 0x3a2f25, 0.55); scene.add(amb);
    const lamp = new THREE.PointLight(0xffd6a0, 1.3, 14); lamp.position.set(0, 2.5, -1); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); scene.add(lamp);
    K.room(scene, 7, 2.9, 7, 0xd9cdb8, 0x8a6a4a);
    // window with Paris view
    const view = K.text(512, 640, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2a3a6b"); gr.addColorStop(0.7, "#f2a66a"); gr.addColorStop(1, "#3a2a2a");
      g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2226"; g.beginPath(); g.moveTo(w * 0.55, h * 0.08); g.lineTo(w * 0.47, h * 0.75); g.lineTo(w * 0.63, h * 0.75); g.fill();
      for (let i = 0; i < 9; i++) { g.fillStyle = "#3a3036"; g.fillRect(i * 60 - 10, h * 0.72 + (i % 3) * 18, 64, h); g.fillStyle = "#ffcf7a"; g.fillRect(i * 60 + 10, h * 0.78 + (i % 3) * 18, 8, 10); } });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), new THREE.MeshBasicMaterial({ map: view })); win.position.set(-1.6, 1.5, -3.49); scene.add(win);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.15, 0.06), K.mat(0xf2ede4)); frame.position.set(-1.6, 1.5, -3.53); scene.add(frame);
    // TV with live news ticker
    let lastNews = -1; const tvCan = document.createElement("canvas"); tvCan.width = 512; tvCan.height = 288; const tvTex = new THREE.CanvasTexture(tvCan);
    function drawTV(k, scroll) { const g = tvCan.getContext("2d"); g.fillStyle = "#0b1e3d"; g.fillRect(0, 0, 512, 288);
      g.fillStyle = "#c81e1e"; g.fillRect(0, 200, 512, 50); g.fillStyle = "#fff"; g.font = "bold 30px Arial"; g.fillText("BREAKING NEWS", 16, 236);
      g.fillStyle = "#fff"; g.font = "bold 34px Arial"; const lines = ["INSECTS VANISH", "WORLDWIDE", "SCIENTISTS BAFFLED"];
      lines.forEach((s, i) => g.fillText(s, 24, 60 + i * 42));
      g.fillStyle = "#111"; g.fillRect(0, 250, 512, 38); g.fillStyle = "#ffd34d"; g.font = "bold 22px Arial";
      g.fillText("BEES · BUTTERFLIES · MOSQUITOES · ALL GONE · FARMERS WORRY ABOUT HARVEST · ", 520 - scroll, 277); tvTex.needsUpdate = true; }
    const tv = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.88, 0.07), K.mat(0x111111)); tv.position.set(1.4, 1.35, -3.4); scene.add(tv);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.8), new THREE.MeshBasicMaterial({ map: tvTex })); scr.position.set(1.4, 1.35, -3.36); scene.add(scr);
    const tvGlow = new THREE.PointLight(0x7aa2ff, 0.6, 5); tvGlow.position.set(1.4, 1.3, -2.8); scene.add(tvGlow);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.45), K.mat(0x5a4636)); stand.position.set(1.4, 0.25, -3.2); scene.add(stand);
    // sofa + family watching
    const sofa = new THREE.Group(); scene.add(sofa); sofa.position.set(1.4, 0, -0.6);
    [[0, 0.25, 0, 2.4, 0.5, 0.9], [0, 0.65, 0.38, 2.4, 0.8, 0.2], [-1.15, 0.45, 0, 0.2, 0.6, 0.9], [1.15, 0.45, 0, 0.2, 0.6, 0.9]].forEach(([x, y, z, w, h, d]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), K.mat(0x3d5a80)); m.position.set(x, y, z); sofa.add(m); });
    const fam = [-0.7, 0.05, 0.75].map((x, i) => { const p = makePerson("sit", { x: 1.4 + x, z: -0.75, rot: Math.PI, kid: i === 1 }); p.position.y = 0.42; scene.add(p); return p; });
    // dinner table
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 1.0), K.mat(0x7a5a3a)); table.position.set(-1.6, 0.76, -0.5); scene.add(table);
    for (const [x, z] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.74, 0.06), K.mat(0x5a4030)); l.position.set(-1.6 + x, 0.37, -0.5 + z); scene.add(l); }
    const plates = [], foodA = [], foodB = [];
    for (const [x, z] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) {
      const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.02, 20), K.mat(0xffffff)); pl.position.set(-1.6 + x, 0.8, -0.5 + z); scene.add(pl); plates.push(pl);
      const a = new THREE.Group(); a.position.copy(pl.position); scene.add(a); foodA.push(a);   // colourful: salad, berries, tomato
      [[0x4ade80, 0.05, -0.04, 0], [0xef4444, 0.03, 0.05, 0.02], [0xf97316, 0.03, -0.03, 0.05], [0x7c3aed, 0.02, 0.06, -0.05]].forEach(([c, r, dx, dz]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), K.mat(c)); m.position.set(dx, 0.03, dz); a.add(m); });
      const b = new THREE.Group(); b.position.copy(pl.position); scene.add(b); foodB.push(b);   // beige: bread, rice, potato
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.08), K.mat(0xd6a65a)); br.position.set(-0.04, 0.045, 0); b.add(br); const po = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), K.mat(0xe0b35a)); po.position.set(0.02, 0.03, -0.07); b.add(po);
      const ri = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6), K.mat(0xf3eee2)); ri.scale.y = 0.5; ri.position.set(0.05, 0.025, 0.02); b.add(ri); }
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.08, 16), K.mat(0xe7e5e4)); bowl.position.set(-1.6, 0.83, -0.5); scene.add(bowl);
    const fruits = []; [0xef4444, 0xf97316, 0xfacc15, 0x84cc16, 0xef4444, 0xa855f7].forEach((c, i) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), K.mat(c));
      f.position.set(-1.6 + Math.cos(i) * 0.07, 0.88 + (i > 3 ? 0.05 : 0), -0.5 + Math.sin(i) * 0.07); scene.add(f); fruits.push(f); });
    // kid's room at x = 40
    K.room(scene, 4.5, 2.6, 4.5, 0xbfdbfe, 0xc2a37a, new THREE.Vector3(40, 0, 0));
    const klamp = new THREE.PointLight(0xffe2b0, 1.1, 8); klamp.position.set(40, 2.2, 0); scene.add(klamp);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.45, 2.0), K.mat(0xf9a8d4)); bed.position.set(41.5, 0.22, -1.0); scene.add(bed);
    const kid = makePerson("sit", { x: 40, z: -0.2, rot: Math.PI, kid: true, shirt: 0xfacc15 }); scene.add(kid);
    const page = K.text(512, 360, (g, w, h) => { g.fillStyle = "#fffaf0"; g.fillRect(0, 0, w, h); g.fillStyle = "#f97316";
      for (const [x, s] of [[150, 1], [362, -1]]) { g.beginPath(); g.ellipse(x - s * 0 , 150, 70, 52, s * 0.4, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(x, 230, 46, 34, -s * 0.3, 0, 6.3); g.fill(); }
      g.fillStyle = "#1f2937"; g.fillRect(250, 110, 12, 150); g.font = "italic 36px Georgia"; g.fillText("B is for Butterfly", 120, 330); });
    const book = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshLambertMaterial({ map: page, side: THREE.DoubleSide })); book.rotation.x = -1.2; book.position.set(40, 0.55, -0.62); scene.add(book);
    return { name: "home", scene, update(t) {
      const nk = num("news", t); if (nk > 0.5) drawTV(nk, (t * 120) % 1400); else if (lastNews !== 0) { const g = tvCan.getContext("2d"); g.fillStyle = "#16233a"; g.fillRect(0, 0, 512, 288); tvTex.needsUpdate = true; }
      lastNews = nk > 0.5 ? 1 : 0; tvGlow.intensity = 0.4 + Math.sin(t * 9) * 0.08;
      fam.forEach((p, i) => animatePerson(p, t, { look: -0.1, turn: i === 1 ? Math.sin(t * 0.8) * 0.3 : 0, hug: i === 1 ? num("hug", t) : 0 }));
      const d = num("dinner", t); foodA.forEach((f) => { f.visible = d < 0.5; }); foodB.forEach((f) => { f.visible = d >= 0.5; });
      const fb = num("fruitBowl", t, 1); fruits.forEach((f, i) => { f.visible = (i + 0.5) / fruits.length < fb; });
      animatePerson(kid, t, { look: 0.4, armsX: -0.9 });
      return scene; } };
  });

  // ================================================================ SUPERMARKET
  B.push(function (WI) {
    const { THREE, R, rr, canvasTex, num, col, makePerson, animatePerson } = WI; const K = window.WI_COMMON(WI);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe8eef2);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2a8, 0.85));
    const top = new THREE.DirectionalLight(0xffffff, 0.5); top.position.set(4, 20, 6); scene.add(top); scene.add(top.target);
    const tiles = canvasTex(64, 64, (g) => { g.fillStyle = "#e7e3dc"; g.fillRect(0, 0, 64, 64); g.strokeStyle = "#cfc9bf"; g.lineWidth = 2; g.strokeRect(0, 0, 64, 64); }); tiles.repeat.set(30, 40);
    K.room(scene, 30, 4.5, 40, 0xf1f1ee, 0xffffff, new THREE.Vector3(0, 0, -15));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 40), new THREE.MeshLambertMaterial({ map: tiles })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.01, -15); scene.add(fl);
    for (let x = -12; x <= 12; x += 6) for (let z = -32; z <= 2; z += 6) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      p.rotation.x = Math.PI / 2; p.position.set(x, 4.45, z); scene.add(p); }
    // shelving aisles with products (instanced)
    const cols = [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981, 0xec4899, 0x8b5cf6, 0xf97316, 0x14b8a6, 0xffffff];
    const nP = 2600, prod = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.3, 0.18), new THREE.MeshLambertMaterial(), nP);
    const M = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1); let ip = 0;
    for (const x of [-9, -4.5, 4.5, 9]) { for (const s of [-1, 1]) { const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 22), K.mat(0xd1d5db)); sh.position.set(x + s * 0.55, 1.0, -16); scene.add(sh); }
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.0, 22), K.mat(0xd1d5db)); back.position.set(x, 1.0, -16); scene.add(back);
      for (let lv = 0; lv < 4; lv++) { const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 22), K.mat(0x9ca3af)); board.position.set(x, 0.2 + lv * 0.5, -16); scene.add(board);
        for (let z = -26.5; z < -5.5 && ip < nP; z += 0.26) for (const s of [-1, 1]) { if (ip >= nP) break; M.compose(V.set(x + s * 0.32, 0.37 + lv * 0.5, z), Q.identity(), S); prod.setMatrixAt(ip, M);
          prod.setColorAt(ip, new THREE.Color(cols[Math.floor(R() * cols.length)])); ip++; } } }
    prod.count = ip; scene.add(prod);
    // produce section: crates of fruit near the camera start (z 0..-4), fruit amount = "fruit"
    const fruitCols = [0xdc2626, 0xf97316, 0xfacc15, 0x65a30d, 0x7c3aed, 0xef4444]; const crates = [];
    const nF = 900, fr = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshLambertMaterial(), nF); const fBase = [];
    for (let c = 0; c < 6; c++) { const cx = -3 + (c % 3) * 1.4, cz = -1.2 - Math.floor(c / 3) * 1.2; const cr = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.0), K.mat(0xa16207)); cr.position.set(cx, 0.6, cz); cr.rotation.x = -0.15; scene.add(cr); crates.push(cr);
      for (let i = 0; i < nF / 6; i++) { fBase.push([cx + rr(-0.5, 0.5), 0.92 + rr(0, 0.16), cz + rr(-0.42, 0.42), fruitCols[c]]); } }
    fBase.forEach((f, i) => { fr.setColorAt(i, new THREE.Color(f[3])); }); scene.add(fr);
    const priceTex = []; const signs = [];
    for (let c = 0; c < 6; c++) { const can = document.createElement("canvas"); can.width = 256; can.height = 128; const tx = new THREE.CanvasTexture(can); priceTex.push([can, tx]);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ map: tx })); sg.position.set(-3 + (c % 3) * 1.4, 1.25, -0.7 - Math.floor(c / 3) * 1.2); sg.rotation.x = -0.2; scene.add(sg); signs.push(sg); }
    const names = ["APPLES", "ORANGES", "LEMONS", "PEARS", "PLUMS", "CHERRIES"], base = [1.99, 2.49, 1.79, 2.29, 2.99, 4.99]; let lastPrice = -1;
    function drawPrices(k) { priceTex.forEach(([can, tx], i) => { const g = can.getContext("2d"); g.fillStyle = k > 0.3 ? "#fde047" : "#ffffff"; g.fillRect(0, 0, 256, 128);
      g.fillStyle = "#111"; g.font = "bold 30px Arial"; g.fillText(names[i], 12, 40); g.fillStyle = k > 0.3 ? "#dc2626" : "#111"; g.font = "bold 56px Arial";
      g.fillText("€" + (base[i] * (1 + k * 3.2)).toFixed(2), 12, 104); tx.needsUpdate = true; }); }
    // almonds / chocolate shelf with SOLD OUT
    const so = K.text(512, 160, (g) => { g.fillStyle = "#dc2626"; g.fillRect(0, 0, 512, 160); g.fillStyle = "#fff"; g.font = "bold 70px Arial"; g.fillText("SOLD OUT", 60, 108); });
    const soldSign = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.34), new THREE.MeshBasicMaterial({ map: so })); soldSign.position.set(-4.5 + 0.62, 1.55, -7); soldSign.rotation.y = Math.PI / 2; scene.add(soldSign);
    const lab = K.text(512, 120, (g) => { g.fillStyle = "#1f2937"; g.fillRect(0, 0, 512, 120); g.fillStyle = "#fff"; g.font = "bold 46px Arial"; g.fillText("ALMONDS · CHOCOLATE", 18, 76); });
    const labSign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.33), new THREE.MeshBasicMaterial({ map: lab })); labSign.position.set(-4.5 + 0.62, 2.15, -7); labSign.rotation.y = Math.PI / 2; scene.add(labSign);
    // checkout + queue + shoppers with carts
    for (const x of [6, 9, 12]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 3), K.mat(0x374151)); c.position.set(x, 0.45, 1.5); scene.add(c); }
    const queue = []; for (let i = 0; i < 12; i++) { const p = makePerson("stand", { x: 7.5, z: 0.5 - i * 0.9, rot: Math.PI }); scene.add(p); queue.push(p);
      const cart = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.8), new THREE.MeshLambertMaterial({ color: 0xc0c4cc, wireframe: true })); cart.position.set(7.5, 0.6, -0.55 - i * 0.9); scene.add(cart); p.userData.cart = cart; }
    const shoppers = []; for (let i = 0; i < 18; i++) { const p = makePerson("walk", { x: [-6.7, -2.2, 2.2, 6.7][i % 4], z: rr(-26, -6), rot: R() < 0.5 ? 0 : Math.PI }); scene.add(p); shoppers.push(p); }
    return { name: "supermarket", scene, update(t, look, pos) {
      WI.fitShadow(top, new THREE.Vector3(pos[0], 0, pos[2] - 4), 12);
      const fk = num("fruit", t, 1), D = new THREE.Matrix4();
      for (let i = 0; i < fBase.length; i++) { const f = fBase[i]; const vis = ((i * 7919) % fBase.length) / fBase.length < fk; D.compose(V.set(f[0], f[1], f[2]), Q.identity(), S.setScalar(vis ? 1 : 0.0001)); fr.setMatrixAt(i, D); }
      fr.instanceMatrix.needsUpdate = true; S.set(1, 1, 1);
      const pk = Math.round(num("price", t) * 20) / 20; if (pk !== lastPrice) { drawPrices(pk); lastPrice = pk; }
      soldSign.visible = num("soldout", t) > 0.5;
      const q = num("queue", t), pan = num("panic", t);
      queue.forEach((p, i) => { p.visible = (i + 0.5) / queue.length < q; p.userData.cart.visible = p.visible; animatePerson(p, t, { look: -0.1, turn: Math.sin(t + i) * 0.3 }); });
      shoppers.forEach((p, i) => { const u = p.userData; const d = ((t * (1.2 + pan * 1.8) * u.speed + u.phase * 4) % 20) - 10;
        p.position.z = u.z + d * Math.cos(u.rot); animatePerson(p, t, { walk: 1 + pan }); });
      return scene; } };
  });
})();
