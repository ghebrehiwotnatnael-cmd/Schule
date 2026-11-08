/* Model-based sets (Quaternius CC0 models, HDRI light). Needs world.js model system and MODELS listed in video.py.
   "street": a city street block. Tracks: env ("day"|"dusk"|"night"), envI, skyTop/Horizon/Bottom, sunDir, light, ambient,
   cityLights (0..1, windows go dark in 3 stages), lamps, signals (traffic lights 0/1), headlights, traffic (car speed),
   cars (fraction visible), jam (0/1 cars stop), crowd (fraction of people), panic (people run), stars. */
window.STREET_MODELS = ["simplebuildings/FBX/Flat.fbx", "simplebuildings/FBX/Flat2.fbx", "simplebuildings/FBX/Bank.fbx",
  "simplebuildings/FBX/Shop.fbx", "simplebuildings/FBX/Hospital.fbx", "simplebuildings/FBX/House.fbx",
  "cars/FBX/NormalCar1.fbx", "cars/FBX/NormalCar2.fbx", "cars/FBX/SUV.fbx", "cars/FBX/Taxi.fbx", "cars/FBX/Cop.fbx",
  "publictransport/FBX/Bus.fbx", "publictransport/FBX/Ambulance.fbx",
  "ultimatenature/FBX/CommonTree_1.fbx", "ultimatenature/FBX/CommonTree_3.fbx",
  "animatedmen/FBX/Male_Casual.fbx", "animatedmen/FBX/Male_Suit.fbx", "animatedmen/FBX/Male_Shirt.fbx", "animatedmen/FBX/Male_LongSleeve.fbx",
  "animatedwomen/FBX/Female_Casual.fbx", "animatedwomen/FBX/Female_Dress.fbx", "animatedwomen/FBX/Female_TankTop.fbx", "animatedwomen/FBX/Female_Alternative.fbx"];
window.PEOPLE = ["animatedmen/FBX/Male_Casual.fbx", "animatedwomen/FBX/Female_Casual.fbx", "animatedmen/FBX/Male_Suit.fbx",
  "animatedwomen/FBX/Female_Dress.fbx", "animatedmen/FBX/Male_Shirt.fbx", "animatedwomen/FBX/Female_TankTop.fbx",
  "animatedmen/FBX/Male_LongSleeve.fbx", "animatedwomen/FBX/Female_Alternative.fbx"];
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];

  // shared helpers for model sets ---------------------------------------------------------------
  window.WI_MODELKIT = function (WI) {
    const { THREE, R, rr, canvasTex, glowTex } = WI; const MK = {};
    MK.envs = function (scene) { const map = {}; [["day", "kloofendal_48d_partly_cloudy_puresky"], ["dusk", "venice_sunset"], ["night", "dikhololo_night"]].forEach(([k, n]) => {
      WI.hdri(null, n).then((e) => { map[k] = e; }); }); let cur = null;
      return function (t) { const e = map[WI.val("env", t) || "day"] || null; if (e !== cur) { scene.environment = e; cur = e; } WI.envIntensity(scene, WI.num("envI", t, 1)); }; };
    MK.tex = function (file) { const tx = new THREE.Texture(); WI.loads.push(new Promise((res) => new THREE.TextureLoader().load((window.WI_HDRI_BASE || "assets/lib/hdri/").replace("hdri/", "") + file,
      (t) => { tx.image = t.image; tx.needsUpdate = true; res(); }, undefined, () => res()))); return tx; };
    MK.std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.9, metalness: 0 }, o));
    MK.windowTex = function (seed) { return canvasTex(128, 256, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
      for (let y = 10; y < h - 10; y += 22) for (let x = 8; x < w - 8; x += 20) { if (R() < 0.55) { g.fillStyle = R() < 0.6 ? "#ffcf7a" : "#fff0c8"; g.fillRect(x, y, 11, 13); } } }); };
    MK.person = function (scene, file, o) { const h = WI.model(file, { height: o.kid ? 1.15 : rr(1.62, 1.86), clip: o.clip || "Walk" });
      h.position.set(o.x || 0, o.y || 0, o.z || 0); h.rotation.y = o.rot || 0; h.userData.p = Object.assign({ phase: R() * 10, speed: rr(0.9, 1.25) }, o); scene.add(h); return h; };
    // animate a crowd: mode walk/stand/sit/run/clap; walkers loop along their heading over `span` metres
    MK.crowd = function (people, t, o = {}) { const frac = o.frac ?? 1, panic = o.panic || 0;
      if (WI.num("mkPeople", t, 1) < 0.5) { people.forEach((h) => { h.visible = false; }); return; }
      people.forEach((h, i) => { const p = h.userData.p; h.visible = (i + 0.5) / people.length < frac; if (!h.visible) return;
        let mode = p.mode; if (panic > 0.5 && (mode === "walk" || mode === "stand")) mode = "run";
        if (o.look && mode === "stand") mode = "look";
        const sp = mode === "run" ? 3.2 : 1.35 * p.speed;
        if (mode === "walk" || mode === "run") { const span = p.span || 40; const d = ((t * sp + p.phase * 4) % span + span) % span - span / 2;
          h.position.set(p.x + Math.sin(p.rot) * d, p.y || 0, p.z + Math.cos(p.rot) * d); h.rotation.y = p.rot; }
        else if (mode === "sit") { h.position.set(p.x, (p.seat ?? 0.45) - 0.5 * ((p.kid ? 1.15 : 1.74) / 1.74), p.z); h.rotation.y = p.rot; }
        else { h.position.set(p.x, p.y || 0, p.z); h.rotation.y = p.rot; }
        const clip = { walk: "Walk", run: "Run", stand: "Idle", sit: "Sitting", clap: "Clapping", look: "Standing", jump: "Jump" }[mode] || "Idle";
        if (mode === "sit") WI.playAt(h, "Sitting", 0.97); else WI.play(h, clip, t, mode === "run" ? 1.2 : p.speed, p.phase); }); };
    MK.lamp = function (scene, x, z, h = 5) { const g = new THREE.Group(); g.position.set(x, 0, z);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, h, 8), MK.std(0x2a2e35, { metalness: 0.6, roughness: 0.4 })); pole.position.y = h / 2; g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.2), pole.material); arm.position.set(0, h, x > 0 ? -0.0 : 0); arm.rotation.y = Math.PI / 2; g.add(arm);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.25), MK.std(0x30343c)); head.position.set(x > 0 ? -0.55 : 0.55, h - 0.05, 0); g.add(head);
      const bulbM = new THREE.MeshBasicMaterial({ color: 0x555555 }); const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.18), bulbM); bulb.position.set(x > 0 ? -0.55 : 0.55, h - 0.13, 0); g.add(bulb);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd28a, transparent: true, depthWrite: false, opacity: 0 })); glow.scale.set(4, 4, 1); glow.position.copy(bulb.position); g.add(glow);
      const pl = new THREE.PointLight(0xffc77a, 0, 16, 2); pl.position.set(bulb.position.x, h - 0.4, 0); g.add(pl);
      scene.add(g); return { set(k, t, i) { const f = k * (0.92 + 0.08 * Math.sin(t * 13 + i)); glow.material.opacity = f; pl.intensity = f * 1.6; bulbM.color.setRGB(0.33 + 0.67 * k, 0.33 + 0.6 * k, 0.33 + 0.3 * k); } }; };
    MK.ground = function (scene, size, color, rough = 0.95) { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), MK.std(color, { roughness: rough })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; scene.add(m); return m; };
    return MK;
  };

  // ================================================================ STREET
  B.push(function (WI) {
    const { THREE, R, rr, num, col, canvasTex, glowTex } = WI; const K = window.WI_COMMON(WI); const MK = window.WI_MODELKIT(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene); const env = MK.envs(scene);
    const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 4800 }, () => rr(-1, 1)).map((v, i) => i % 3 === 1 ? Math.abs(v) * 900 + 60 : v * 1200), 3)),
      new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false })); scene.add(stars);
    MK.ground(scene, 3000, 0x6b6f63);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(12, 700), MK.std(0x2b2d31, { roughness: 0.85 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, -200); road.receiveShadow = true; scene.add(road);
    const lineTex = canvasTex(32, 256, (g) => { g.fillStyle = "#000"; g.fillRect(0, 0, 32, 256); g.fillStyle = "#e8e2c8"; g.fillRect(12, 0, 8, 128); });
    lineTex.repeat.set(1, 60); const lines = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 700), new THREE.MeshBasicMaterial({ map: lineTex, transparent: true, alphaMap: lineTex }));
    lines.rotation.x = -Math.PI / 2; lines.position.set(0, 0.03, -200); scene.add(lines);
    for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.18, 700), MK.std(0xa7a49b)); sw.position.set(s * 8.25, 0.09, -200); sw.receiveShadow = true; scene.add(sw);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 700), MK.std(0xcfcbc0)); curb.position.set(s * 6.05, 0.1, -200); scene.add(curb); }
    const zebra = new THREE.Group(); for (let i = -5; i <= 5; i++) { const z = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 3.2), new THREE.MeshBasicMaterial({ color: 0xe8e2c8 })); z.rotation.x = -Math.PI / 2; z.position.set(i * 1.05, 0.031, -38); zebra.add(z); } scene.add(zebra);
    // buildings both sides, each with a night window overlay facing the road (3 stages for staged blackouts)
    const winGroups = [[], [], []]; const bTypes = ["Flat", "Flat2", "Bank", "Shop", "Flat", "House", "Flat2", "Hospital", "Shop", "Flat"];
    let z0 = 14;
    for (let k = 0; k < 18; k++) for (const side of [-1, 1]) {
      const type = bTypes[(k * 3 + (side > 0 ? 1 : 0)) % bTypes.length]; const height = { Flat: 20, Flat2: 24, Bank: 13, Shop: 8, House: 9, Hospital: 18 }[type];
      const z = z0 - k * 20; const st = k % 3;
      const hb = WI.model(`simplebuildings/FBX/${type}.fbx`, { height, maxFoot: 17, autoUp: true, rotY: side > 0 ? -Math.PI / 2 : Math.PI / 2,
        onLoad: (h, size) => { h.position.x = side * (10.6 + size.x / 2); const wt = MK.windowTex(); const m = new THREE.MeshBasicMaterial({ map: wt, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(size.z, 18) * 0.85, size.y * 0.8), m); pl.position.set(-side * (size.x / 2 + 0.05), size.y * 0.5, 0); pl.rotation.y = -side * Math.PI / 2; h.add(pl); winGroups[st].push(m); } });
      hb.position.set(side * 16, 0, z); scene.add(hb);
    }
    // distant skyline towers with lit windows
    const towerTex = MK.windowTex(); towerTex.wrapS = towerTex.wrapT = THREE.RepeatWrapping; const towerMats = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: 0x5b6274, roughness: 0.6, emissive: 0xffffff, emissiveMap: towerTex, emissiveIntensity: 0 }));
    for (let i = 0; i < 26; i++) { const w = rr(20, 40), h = rr(60, 200), d = rr(20, 40); const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv; for (let j = 0; j < uv.count; j++) uv.setXY(j, uv.getX(j) * w / 12, uv.getY(j) * h / 20);
      const m = new THREE.Mesh(g, towerMats[i % 3]); m.position.set(rr(-260, 260), h / 2, rr(-420, -620)); scene.add(m); }
    // street lamps, trees, traffic lights
    const lamps = []; for (let z = 10; z > -330; z -= 16) for (const s of [-1, 1]) { if (s > 0 && z + 8 === 2) continue; lamps.push(MK.lamp(scene, s * 6.6, z + (s > 0 ? 8 : 0))); }
    for (let z = 4; z > -330; z -= 12) for (const s of [-1, 1]) { const tr = WI.model(`ultimatenature/FBX/CommonTree_${s > 0 ? 2 : 4}.fbx`, { height: rr(6, 8) }); tr.position.set(s * 9.2, 0.18, z); tr.rotation.y = R() * 6; scene.add(tr); }
    const signals = []; for (const [x, z, r] of [[-6.4, -35, Math.PI], [6.4, -41, 0]]) { const tl = new THREE.Group(); const dk = new THREE.MeshStandardMaterial({ color: 0x23262c, roughness: 0.6, metalness: 0.4 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.4, 10), dk); pole.position.y = 2.2; tl.add(pole);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.25, 0.32), dk); box.position.set(0, 3.75, -0.12); tl.add(box);
      [[4.1, 0x5a1a14], [3.75, 0x4a3a10], [3.4, 0x13401f]].forEach(([y, c]) => { const l = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 })); l.position.set(0, y, -0.285); l.rotation.y = Math.PI; tl.add(l); });
      tl.traverse(o => { if (o.isMesh) o.castShadow = true; }); tl.position.set(x, 0.18, z); tl.rotation.y = r; scene.add(tl);
      const red = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff3020, transparent: true, depthWrite: false })); red.scale.set(1.1, 1.1, 1); red.position.set(x, 4.1, z + (r ? 0.3 : -0.3)); scene.add(red);
      const grn = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x30ff70, transparent: true, depthWrite: false })); grn.scale.set(1.1, 1.1, 1); grn.position.set(x, 3.4, z + (r ? 0.3 : -0.3)); scene.add(grn); signals.push([red, grn]); }
    // traffic
    const carFiles = ["NormalCar1", "NormalCar2", "SUV", "Taxi", "NormalCar1", "Cop", "SUV", "NormalCar2", "Taxi", "NormalCar1"]; const cars = [];
    for (let i = 0; i < 22; i++) { const dir = i % 2 ? 1 : -1; const f = i === 5 ? "publictransport/FBX/Bus.fbx" : i === 12 ? "publictransport/FBX/Ambulance.fbx" : `cars/FBX/${carFiles[i % carFiles.length]}.fbx`;
      const c = WI.model(f, { length: f.includes("Bus") ? 11 : f.includes("Ambulance") ? 6 : 4.4, autoUp: true, alongZ: true, rotY: dir > 0 ? Math.PI : 0, onLoad: f.includes("Bus") ? (h) => h.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (!m.map) { m.color.set(0xc9372c); m.roughness = 0.45; } }); }) : undefined });
      const hl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff1c4, transparent: true, depthWrite: false, opacity: 0 })); hl.scale.set(3.4, 1.8, 1); hl.position.set(0, 0.8, -2.4); c.add(hl);
      const hl2 = new THREE.PointLight(0xfff1d0, 0, 22, 2); hl2.position.set(0, 0.9, -3.2); c.add(hl2);
      c.userData.car = { dir, lane: dir > 0 ? 2.8 : -2.8, z0: rr(-330, 20), speed: rr(8, 12), hl, hl2 }; scene.add(c); cars.push(c); }
    // pedestrians on both sidewalks
    const people = [];
    for (let i = 0; i < 46; i++) { const s = i % 2 ? 1 : -1; const r = R(); const mode = r < 0.65 ? "walk" : "stand";
      people.push(MK.person(scene, window.PEOPLE[i % window.PEOPLE.length], { x: s * rr(7, 9.6), y: 0.18, z: rr(-120, 8), rot: R() < 0.5 ? 0 : Math.PI, mode, span: 60 })); }
    return { name: "street", scene, people, update(t, look, pos) {
      sky(t, num, col); env(t); L.update(t, num, col, new THREE.Vector3(pos[0] * 0.8 + look[0] * 0.2, 0, pos[2] * 0.8 + look[2] * 0.2), num("shadowSize", t, 30));
      stars.material.opacity = num("stars", t);
      const cl = num("cityLights", t); winGroups.forEach((g, k) => { const f = WI.clamp01(cl * 3 - k); g.forEach((m, i) => { m.opacity = f * (0.9 + 0.1 * Math.sin(t * 7 + i)); }); });
      towerMats.forEach((m, k) => { m.emissiveIntensity = WI.clamp01(cl * 3 - k) * 0.9; });
      const lk = num("lamps", t); lamps.forEach((l, i) => l.set(WI.clamp01(lk * 2 - (i % 7) / 7), t, i));
      const sg = num("signals", t); signals.forEach(([r, g], i) => { const red = Math.floor(t / 5 + i) % 2 === 0; r.material.opacity = sg * (red ? 1 : 0.08); g.material.opacity = sg * (red ? 0.08 : 1); });
      const tr = num("traffic", t, 1), hk = num("headlights", t), jam = num("jam", t), cf = num("cars", t, 1);
      cars.forEach((c, i) => { const u = c.userData.car; c.visible = (i + 0.5) / cars.length < cf; const span = 360;
        const z = jam > 0.5 ? u.z0 * 0.4 - 30 : ((u.z0 + u.dir * -1 * u.speed * tr * t) % span + span * 1.5) % span - span + 20;
        c.position.set(u.lane, 0.02, z); u.hl.material.opacity = hk; u.hl2.intensity = hk * 2; });
      MK.crowd(people, t, { frac: num("crowd", t, 1), panic: num("panic", t), look: num("lookUp", t) > 0.5 });
      return scene; } };
  });
})();
