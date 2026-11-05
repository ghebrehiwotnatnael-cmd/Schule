/* Nature sets: "nest" (bird nest close-up) and "farm" (apple orchard, pond with fish, wheat field, cow pasture,
   forest floor, nature-reserve insect trap; china=1 turns the orchard into a Sichuan pear orchard with
   hand-pollinating workers on ladders and terraced hills).  Tracks: insects, blossom, fruitOnTrees, bare, dry,
   fish, dung, litter, china, trap, workers, chicks, mother, farmer. */
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];

  // ================================================================ NEST
  B.push(function (WI) {
    const { THREE, R, rr, num, col } = WI; const K = window.WI_COMMON(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), K.mat(0x3f6f2a)); ground.rotation.x = -Math.PI / 2; ground.position.y = -6; scene.add(ground);
    const bark = K.mat(0x5b4331); const leafM = new THREE.MeshLambertMaterial({ color: 0x4d7c2f, flatShading: true });
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 3, 8), bark); branch.rotation.z = 1.35; branch.position.set(0, 1.0, -1.2); scene.add(branch);
    for (let i = 0; i < 40; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(0.25, 0.6), 0), leafM); l.position.set(rr(-2.5, 2.5), rr(0.6, 2.6), rr(-3, -1.6)); scene.add(l); }
    for (let i = 0; i < 30; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(1.5, 3), 0), leafM); l.position.set(rr(-12, 12), rr(-2, 6), rr(-14, -6)); scene.add(l); }
    const nest = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.06, 8, 18), K.mat(0x8b6b45)); nest.rotation.x = Math.PI / 2; nest.position.set(0.05, 1.1, -1.2); scene.add(nest);
    const nb = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), K.mat(0x6b5235)); nb.rotation.x = -Math.PI / 2; nb.position.set(0.05, 1.08, -1.2); scene.add(nb);
    const chicks = [];
    for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.position.set(0.05 + (i - 1) * 0.07, 1.12, -1.2 + (i % 2) * 0.03); scene.add(g);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), K.mat(0x9ca3af)); g.add(body);
      const head = new THREE.Group(); head.position.y = 0.05; g.add(head);
      const hm = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), K.mat(0xb4b9c2)); head.add(hm);
      const up = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 6), K.mat(0xf59e0b)); up.position.set(0, 0.02, 0.03); up.rotation.x = 1.0; head.add(up);
      const lo = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 6), K.mat(0xfbbf24)); lo.position.set(0, 0.0, 0.03); lo.rotation.x = 2.0; head.add(lo);
      g.userData = { head, up, lo, ph: i * 1.7 }; chicks.push(g); }
    const mother = new THREE.Group(); scene.add(mother);
    const mb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), K.mat(0x7c5c3b)); mb.scale.set(1.4, 1, 1); mother.add(mb);
    const mh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), K.mat(0x7c5c3b)); mh.position.set(0.09, 0.04, 0); mother.add(mh);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.04, 6), K.mat(0x333333)); beak.rotation.z = -Math.PI / 2; beak.position.set(0.14, 0.04, 0); mother.add(beak);
    const wings = [-1, 1].map((k) => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.12), K.mat(0x5e4630)); w.position.z = 0.07 * k; mother.add(w); return w; });
    return { name: "nest", scene, update(t, look, pos) {
      sky(t, num, col); L.update(t, num, col, new THREE.Vector3(0, 1, -1.2), 6);
      const hungry = num("chicks", t, 1);
      chicks.forEach((c) => { const u = c.userData; const o = (0.5 + 0.5 * Math.sin(t * 9 + u.ph)) * hungry;
        u.up.rotation.x = 1.0 - o * 0.5; u.lo.rotation.x = 2.0 + o * 0.5; u.head.rotation.x = -0.4 * hungry + Math.sin(t * 5 + u.ph) * 0.1; u.head.position.y = 0.05 + 0.03 * hungry; });
      const m = num("mother", t); mother.visible = m > 0.01 && m < 0.999;
      const a = m < 0.5 ? m * 2 : 1 - (m - 0.5) * 2; mother.position.set(0.9 - a * 0.82, 1.35 - a * 0.13 + Math.sin(t * 3) * 0.02, -1.32);
      mother.rotation.y = m < 0.5 ? Math.PI : 0; wings.forEach((w, j) => { w.rotation.x = Math.sin(t * (a > 0.9 ? 3 : 30)) * 0.8 * (j ? 1 : -1); });
      return scene; } };
  });

  // ================================================================ FARM
  B.push(function (WI) {
    const { THREE, R, rr, num, col, makePerson, animatePerson, canvasTex } = WI; const K = window.WI_COMMON(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene);
    const grass = K.mat(0x4d7a2e); const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), grass); ground.rotation.x = -Math.PI / 2; scene.add(ground);
    // terraced hills (china) far away
    const hills = new THREE.Group(); scene.add(hills);
    for (let i = 0; i < 9; i++) { const h = new THREE.Mesh(new THREE.ConeGeometry(rr(80, 140), rr(60, 120), 7, 6), new THREE.MeshLambertMaterial({ color: 0x5f8a4a, flatShading: true }));
      h.position.set(rr(-400, 400), 30, rr(-420, -600)); hills.add(h); }
    // orchard: rows of trees; blossoms / fruit / bare via instanced dots on the canopies
    const trunkM = K.mat(0x5b4331), canopyM = new THREE.MeshLambertMaterial({ color: 0x4a7f2e, flatShading: true });
    const spots = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) spots.push([-46 + c * 5.2, -8 - r * 6]);
    const canopies = [];
    spots.forEach(([x, z]) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.8, 6), trunkM); t.position.set(x, 0.9, z); scene.add(t);
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), canopyM); c.position.set(x, 2.6, z); c.scale.set(1, 0.8, 1); scene.add(c); canopies.push(c); });
    const nDots = spots.length * 40, dotGeo = new THREE.IcosahedronGeometry(0.075, 0);
    const blos = new THREE.InstancedMesh(dotGeo, new THREE.MeshLambertMaterial({ color: 0xffe4ef, emissive: 0x553344 }), nDots);
    const apples = new THREE.InstancedMesh(dotGeo, new THREE.MeshLambertMaterial({ color: 0xd62828 }), nDots);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(); const dots = [];
    spots.forEach(([x, z]) => { for (let k = 0; k < 40; k++) { const th = R() * 6.28, ph = Math.acos(rr(-0.4, 1)); dots.push([x + Math.sin(ph) * Math.cos(th) * 1.6, 2.6 + Math.cos(ph) * 1.25, z + Math.sin(ph) * Math.sin(th) * 1.6]); } });
    scene.add(blos); scene.add(apples);
    function setDots(mesh, k, size) { for (let i = 0; i < dots.length; i++) { const v = ((i * 7919) % dots.length) / dots.length < k; const d = dots[i];
      M.compose(V.set(d[0], d[1], d[2]), Q.identity(), S.setScalar(v ? size : 0.0001)); mesh.setMatrixAt(i, M); } mesh.instanceMatrix.needsUpdate = true; }
    let lastB = -1, lastA = -1;
    // workers on ladders (china) + farmer
    const ladders = [], workers = [];
    spots.slice(0, 18).forEach(([x, z], i) => { if (i % 2) return; const lad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.6, 0.08), new THREE.MeshLambertMaterial({ color: 0xc8a165, wireframe: true }));
      lad.position.set(x + 1.2, 1.3, z + 0.3); lad.rotation.z = 0.25; scene.add(lad); ladders.push(lad);
      const w = makePerson("stand", { x: x + 1.35, z: z + 0.35, rot: -Math.PI / 2, shirt: 0x2563eb }); w.position.y = 1.0; scene.add(w); workers.push(w);
      const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5), K.mat(0x8b5a2b)); brush.position.set(-0.36, -0.7, -0.1); w.userData.arms[0].add(brush); });
    const farmer = makePerson("stand", { x: -20.5, z: -9.5, rot: Math.PI * 0.85, shirt: 0x65a30d }); scene.add(farmer);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 12), K.mat(0xd6b46a)); hat.position.y = 0.46; farmer.userData.head.add(hat);
    // pond with fish
    const pond = new THREE.Mesh(new THREE.CircleGeometry(9, 40), new THREE.MeshLambertMaterial({ color: 0x2c5873 })); pond.rotation.x = -Math.PI / 2; pond.position.set(30, 0.04, -20); pond.userData.noShadow = true; scene.add(pond);
    for (let i = 0; i < 26; i++) { const a = R() * 6.28; const rd = new THREE.Mesh(new THREE.BoxGeometry(0.05, rr(0.8, 1.6), 0.05), K.mat(0x4d7c2f)); rd.position.set(30 + Math.cos(a) * 9.2, 0.5, -20 + Math.sin(a) * 9.2); rd.rotation.z = rr(-0.2, 0.2); scene.add(rd); }
    const fishes = []; for (let i = 0; i < 10; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.12), K.mat(0xf97316)); f.userData = { x: 30 + rr(-5, 5), z: -20 + rr(-5, 5), ph: R() * 4 }; scene.add(f); fishes.push(f); }
    const rings = fishes.map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; scene.add(r); return r; });
    // wheat field (instanced stalks, wind sway)
    const field = new THREE.Mesh(new THREE.PlaneGeometry(64, 70), K.mat(0xb8913c)); field.rotation.x = -Math.PI / 2; field.position.set(40, 0.03, -77); scene.add(field);
    const wg = new THREE.BoxGeometry(0.05, 1.0, 0.05); wg.translate(0, 0, 0); const ear = new THREE.BoxGeometry(0.09, 0.22, 0.09); ear.translate(0, 0.56, 0);
    const wheatGeo = (function () { const g = new THREE.BufferGeometry(); const a = wg.toNonIndexed(), b = ear.toNonIndexed();
      const pos = new Float32Array(a.attributes.position.array.length + b.attributes.position.array.length); pos.set(a.attributes.position.array); pos.set(b.attributes.position.array, a.attributes.position.array.length);
      const nor = new Float32Array(pos.length); nor.set(a.attributes.normal.array); nor.set(b.attributes.normal.array, a.attributes.normal.array.length);
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); return g; })();
    const nW = 9000, wheat = new THREE.InstancedMesh(wheatGeo, K.mat(0xe2bd5e), nW); const wB = [];
    for (let i = 0; i < nW; i++) wB.push([rr(10, 70), rr(-45, -110), R() * 6]); scene.add(wheat);
    // pasture: cows + dung piles
    const cows = []; for (let i = 0; i < 7; i++) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.8), K.mat(0xf5f5f4)); b.position.y = 1.1; g.add(b);
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.91, 0.81), K.mat(0x1c1917)); sp.position.set(0.3, 1.1, 0); g.add(sp);
      const hd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.45), K.mat(0xf5f5f4)); hd.position.set(1.1, 1.3, 0); g.add(hd);
      for (const [x, z] of [[-0.6, -0.25], [-0.6, 0.25], [0.6, -0.25], [0.6, 0.25]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), K.mat(0xe7e5e4)); l.position.set(x, 0.35, z); g.add(l); }
      g.position.set(rr(-90, -60), 0, rr(-10, -60)); g.rotation.y = rr(0, 6.28); scene.add(g); cows.push(g); }
    const dungs = []; for (let i = 0; i < 70; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(rr(0.25, 0.45), 8, 6), K.mat(0x4a3423)); d.scale.y = 0.35; d.position.set(rr(-95, -55), 0.05, rr(-5, -65)); d.userData.o = R(); scene.add(d); dungs.push(d); }
    // forest edge + floor litter (leaves, fallen apples)
    const forestM = new THREE.MeshLambertMaterial({ color: 0x35602a, flatShading: true });
    for (let i = 0; i < 70; i++) { const x = rr(-60, 10), z = rr(-120, -150); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 6, 6), trunkM); tr.position.set(x, 3, z); scene.add(tr);
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(2.5, 4), 0), forestM); c.position.set(x, 7.5, z); scene.add(c); }
    const leafCols = [0x9a6b2c, 0xb45309, 0x78350f, 0xa16207]; const litter = [];
    for (let i = 0; i < 900; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), K.mat(leafCols[i % 4], { side: THREE.DoubleSide })); l.rotation.set(-Math.PI / 2 + rr(-0.3, 0.3), 0, R() * 6);
      l.position.set(rr(-30, -10), 0.03 + R() * 0.12, rr(-112, -122)); l.userData.o = R(); scene.add(l); litter.push(l); }
    for (let i = 0; i < 60; i++) { const a = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), K.mat(i % 3 ? 0x7c2d12 : 0xa16207)); a.position.set(rr(-30, -10), 0.06, rr(-112, -122)); a.userData.o = R(); scene.add(a); litter.push(a); }
    // nature reserve: Malaise trap + sign
    const trap = new THREE.Group(); trap.position.set(60, 0, -12); scene.add(trap);
    const white = new THREE.MeshLambertMaterial({ color: 0xf5f5f5, side: THREE.DoubleSide });
    const blackT = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.02), K.mat(0x111111)); blackT.position.y = 0.85; trap.add(blackT);
    for (const k of [-1, 1]) { const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.02, 1.0), white); roof.position.set(0, 1.45, 0.42 * k); roof.rotation.x = 0.75 * k; trap.add(roof);
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.2, 1.0), white); side.position.set(1.1 * k, 0.75, 0); trap.add(side); }
    for (const [x, z] of [[-1.15, -0.5], [-1.15, 0.5], [1.15, -0.5], [1.15, 0.5]]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.9, 6), K.mat(0x333333)); pole.position.set(x, 0.95, z); trap.add(pole); }
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12), new THREE.MeshLambertMaterial({ color: 0xbfdbfe, transparent: true, opacity: 0.75 })); jar.position.set(1.15, 1.95, 0); trap.add(jar);
    const signT = K.text(512, 256, (g) => { g.fillStyle = "#14532d"; g.fillRect(0, 0, 512, 256); g.fillStyle = "#fff"; g.font = "bold 46px Arial"; g.fillText("NATURSCHUTZGEBIET", 18, 110);
      g.font = "28px Arial"; g.fillText("Nature reserve · Germany", 18, 170); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshBasicMaterial({ map: signT })); sign.position.set(-2.4, 1.4, 0.3); trap.add(sign);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.08), trunkM); post.position.set(-2.4, 0.6, 0.25); trap.add(post);
    // insects over the orchard / meadow
    const bugs = K.insects(scene, { center: new THREE.Vector3(-25, 0.5, -15), radius: 14, bees: 50, butterflies: 18, height: 3, mosquitos: 0 });
    const bugs2 = K.insects(scene, { center: new THREE.Vector3(60, 0, -12), radius: 6, bees: 18, butterflies: 14, height: 2, mosquitos: 160, swarm: new THREE.Vector3(61, 1.6, -12) });
    return { name: "farm", scene, update(t, look, pos) {
      sky(t, num, col); L.update(t, num, col, new THREE.Vector3(look[0] * 0.2 + pos[0] * 0.8, 0, look[2] * 0.2 + pos[2] * 0.8), num("shadowSize", t, 30));
      const dry = num("dry", t), china = num("china", t);
      grass.color.setHex(0x4d7a2e).lerp(new THREE.Color(0x8b8456), dry); canopyM.color.setHex(0x4a7f2e).lerp(new THREE.Color(0x6b6b45), dry);
      const bare = num("bare", t); canopies.forEach((c) => { c.visible = bare < 0.5; });
      hills.visible = china > 0.5; ladders.forEach((l) => { l.visible = china > 0.5; }); workers.forEach((w, i) => { w.visible = china > 0.5;
        animatePerson(w, t, { armsX: -2.2 + Math.sin(t * 3 + i) * 0.25, look: 0.5 }); });
      farmer.visible = num("farmer", t, 1) > 0.5 && china < 0.5; animatePerson(farmer, t, { look: 0.3, turn: Math.sin(t * 0.7) * 0.6, armsX: -0.8 });
      const bk = Math.round(num("blossom", t, 1) * 40) / 40; if (bk !== lastB) { setDots(blos, bk, 1); lastB = bk; }
      blos.material.color.setHex(china > 0.5 ? 0xffffff : 0xffe4ef);
      const ak = Math.round(num("fruitOnTrees", t) * 40) / 40; if (ak !== lastA) { setDots(apples, ak, 0.9); lastA = ak; }
      const fk = num("fish", t, 1); fishes.forEach((f, i) => { const u = f.userData; const ph = (t * 1.1 + u.ph) % 2.2; const j = ph < 0.6 ? Math.sin(ph / 0.6 * Math.PI) : 0;
        f.visible = fk > 0.5 && j > 0.02; f.position.set(u.x + ph * 0.6, 0.05 + j * 0.7, u.z); f.rotation.z = (0.3 - ph) * 1.2;
        rings[i].position.set(u.x + 0.3, 0.06, u.z); rings[i].material.opacity = fk > 0.5 && ph > 0.55 && ph < 1.4 ? (1.4 - ph) * 0.8 : 0; rings[i].scale.setScalar(1 + (ph - 0.55) * 2); });
      for (let i = 0; i < nW; i++) { const w = wB[i]; Q.setFromAxisAngle(V.set(1, 0, 0.3).normalize(), Math.sin(t * 1.8 + w[0] * 0.15 + w[2]) * 0.12);
        M.compose(V.set(w[0], 0.55, w[1]), Q, S.set(1, 1, 1)); wheat.setMatrixAt(i, M); } wheat.instanceMatrix.needsUpdate = true;
      cows.forEach((c, i) => { c.rotation.y += 0; c.children[2].rotation.z = Math.sin(t * 0.8 + i) * 0.15 - 0.2; });
      const dg = num("dung", t); dungs.forEach((d) => { const k = Math.max(0, Math.min(1, dg * 1.3 - d.userData.o * 0.3)); d.visible = k > 0.03; d.scale.set(0.4 + k, 0.35 * (0.4 + k * 1.6), 0.4 + k); });
      const lt = num("litter", t); litter.forEach((l) => { l.visible = l.userData.o < lt; });
      trap.visible = num("trap", t) > 0.5;
      const ins = num("insects", t, 1); bugs(t, ins); bugs2(t, ins * num("trapBugs", t, 1));
      return scene; } };
  });
})();
