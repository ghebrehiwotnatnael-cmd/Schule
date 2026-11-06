/* More model sets: "coast" (beach [track beach = umbrellas + sunbathers], harbour, ocean with tide, boats, palms, houses, moon), "forest" (night forest with
   animated animals), "rooms" (hospital, airport, telegraph office 1859, kitchen, office, living room with candles),
   "moonspace" (Earth + Moon, laser to the Moon).  Needs sets_common.js, sets_models.js (WI_MODELKIT) and world.js. */
window.COAST_MODELS = ["ships/FBX/Boat.fbx", "ships/FBX/BoatWSail.fbx", "ships/FBX/Lifeboat.fbx", "ships/FBX/CruiseShip.fbx",
  "ultimatenature/FBX/PalmTree_1.fbx", "ultimatenature/FBX/PalmTree_2.fbx", "ultimatenature/FBX/PalmTree_3.fbx", "ultimatenature/FBX/Rock_1.fbx", "ultimatenature/FBX/Rock_3.fbx",
  "simplebuildings/FBX/House.fbx", "simplebuildings/FBX/House2.fbx", "simplebuildings/FBX/House3.fbx", "simplebuildings/FBX/Shop.fbx"];
window.FOREST_MODELS = ["ultimatenature/FBX/PineTree_1.fbx", "ultimatenature/FBX/PineTree_3.fbx", "ultimatenature/FBX/CommonTree_2.fbx", "ultimatenature/FBX/BirchTree_2.fbx",
  "ultimatenature/FBX/Bush_1.fbx", "ultimatenature/FBX/Rock_Moss_2.fbx", "ultimateanimatedanimals/glTF/Fox.gltf", "ultimateanimatedanimals/glTF/Wolf.gltf",
  "ultimateanimatedanimals/glTF/Deer.gltf", "ultimateanimatedanimals/glTF/Stag.gltf"];
window.ROOMS_MODELS = ["ultimatehomeinterior/FBX/Bed_Single.fbx", "ultimatehomeinterior/FBX/Kitchen_Fridge.fbx", "ultimatehomeinterior/FBX/Kitchen_Sink.fbx",
  "ultimatehomeinterior/FBX/Kitchen_2Drawers.fbx", "ultimatehomeinterior/FBX/Kitchen_Oven.fbx", "ultimatehomeinterior/FBX/Couch_Large1.fbx", "ultimatehomeinterior/FBX/Table_RoundLarge.fbx",
  "ultimatehomeinterior/FBX/Chair_1.fbx", "ultimatehomeinterior/FBX/Houseplant_3.fbx", "ultimatehomeinterior/FBX/Bookshelf.fbx", "ultimatehomeinterior/FBX/Light_Floor1.fbx",
  "ultimatefurniture/FBX/Desk.fbx", "ultimatefurniture/FBX/OfficeChair.fbx", "ultimatefurniture/FBX/Bookcase_Books.fbx", "ultimatefurniture/FBX/Table.fbx", "ultimatefurniture/FBX/Chair.fbx"];
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];

  // ================================================================ COAST
  B.push(function (WI) {
    const { THREE, R, rr, num, col, glowTex, canvasTex } = WI; const K = window.WI_COMMON(WI); const MK = window.WI_MODELKIT(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene); const env = MK.envs(scene);
    const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 9000 }, (_, i) => i % 3 === 1 ? rr(80, 1100) : rr(-1400, 1400)), 3)),
      new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })); scene.add(stars);
    // milky way band
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(2600, 500), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(190,200,255,0.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(255,255,255,${R() * 0.9})`; g.fillRect(R() * w, h / 2 + (R() + R() - 1) * h * 0.35, 1, 1); } }), transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    mw.position.set(0, 600, -1300); mw.rotation.z = 0.5; scene.add(mw);
    // sand, wet sand, ocean (vertex waves, tide moves the waterline)
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(800, 400, 1, 1), MK.std(0xd9c49a)); sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0, 150); scene.add(sand);
    const slope = new THREE.Mesh(new THREE.PlaneGeometry(800, 120), MK.std(0xb9a275, { roughness: 0.6 })); slope.rotation.x = -Math.PI / 2 + 0.03; slope.position.set(0, -1.6, -55); scene.add(slope);
    const waterU = { uTime: { value: 0 } };
    const water = new THREE.Mesh(new THREE.PlaneGeometry(4000, 3000, 160, 120), new THREE.MeshStandardMaterial({ color: 0x1f4f6b, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.94 }));
    water.material.onBeforeCompile = (sh) => { sh.uniforms.uTime = waterU.uTime; sh.vertexShader = "uniform float uTime;\n" + sh.vertexShader.replace("#include <begin_vertex>",
      "#include <begin_vertex>\n transformed.z += sin(position.x*0.05 + uTime*1.3)*0.25 + sin(position.y*0.08 + uTime*0.9)*0.22 + sin((position.x+position.y)*0.21 + uTime*2.2)*0.07;"); };
    water.rotation.x = -Math.PI / 2; water.position.set(0, -0.6, -1500); water.userData.noShadow = true; scene.add(water);
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(800, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })); foam.rotation.x = -Math.PI / 2; scene.add(foam);
    // moon + its reflection path on the water + moonlight
    const moonTex = MK.tex("moon_1024.jpg");
    const moon = new THREE.Mesh(new THREE.SphereGeometry(28, 48, 32), new THREE.MeshBasicMaterial({ map: moonTex, color: 0xf2f2ec, fog: false })); scene.add(moon);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xcfe0ff, transparent: true, depthWrite: false, fog: false })); halo.scale.set(200, 200, 1); scene.add(halo);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(40, 900), new THREE.MeshBasicMaterial({ map: canvasTex(64, 512, (g, w, h) => { for (let i = 0; i < 900; i++) { const y = R() * h; const a = 0.15 + 0.85 * (y / h);
      g.fillStyle = `rgba(230,238,255,${a * R()})`; g.fillRect(w / 2 + (R() - 0.5) * w * (0.3 + 0.7 * (1 - y / h)), y, rr(2, 10), 1.5); } }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    path.rotation.x = -Math.PI / 2; scene.add(path);
    const moonLight = new THREE.DirectionalLight(0xb9c8ff, 0); scene.add(moonLight); scene.add(moonLight.target);
    const aurora = K.aurora(scene, new THREE.Vector3(0, 220, 0), 700);
    // harbour pier + boats, beach props, palms, rocks, houses along the promenade, people
    const pier = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 70), MK.std(0x8a6a48)); pier.position.set(42, 0.6, -40); scene.add(pier);
    for (let z = -5; z > -75; z -= 6) for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 8), MK.std(0x5a4330)); p.position.set(42 + s * 2.3, -1.6, z); scene.add(p); }
    const boats = [["ships/FBX/BoatWSail.fbx", 36, -30, 9], ["ships/FBX/Boat.fbx", 48, -20, 7], ["ships/FBX/Boat.fbx", 49, -48, 7], ["ships/FBX/Lifeboat.fbx", 36, -58, 6], ["ships/FBX/BoatWSail.fbx", 20, -140, 10]].map(([f, x, z, l]) => {
      const b = WI.model(f, { length: l, alongZ: true }); b.userData.bx = [x, z]; scene.add(b); return b; });
    const cruise = WI.model("ships/FBX/CruiseShip.fbx", { length: 160, alongZ: true }); cruise.position.set(-220, 0, -700); cruise.rotation.y = 1.3; scene.add(cruise);
    for (let i = 0; i < 14; i++) { const p = WI.model(`ultimatenature/FBX/PalmTree_${1 + (i % 3)}.fbx`, { height: rr(7, 11) }); p.position.set(rr(-120, 120), 0, rr(25, 45)); p.rotation.y = R() * 6; scene.add(p); }
    for (let i = 0; i < 10; i++) { const r = WI.model(`ultimatenature/FBX/Rock_${i % 2 ? 1 : 3}.fbx`, { size: rr(2, 5) }); r.position.set(rr(-140, -60), -0.8, rr(-40, 10)); r.rotation.y = R() * 6; scene.add(r); }
    const homes = []; const hTypes = ["House", "House2", "House3", "Shop", "House2", "House"];
    for (let i = 0; i < 12; i++) { const h = WI.model(`simplebuildings/FBX/${hTypes[i % hTypes.length]}.fbx`, { height: rr(7, 11), maxFoot: 14, autoUp: true, rotY: Math.PI,
      onLoad: (hh, size) => { const m = new THREE.MeshBasicMaterial({ map: MK.windowTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(size.x * 0.8, size.y * 0.7), m); pl.position.set(0, size.y * 0.45, -size.z / 2 - 0.05); pl.rotation.y = Math.PI; hh.add(pl); homes.push(m); } });
      h.position.set(-110 + i * 20, 0, 70); scene.add(h); }
    const lamps = []; for (let x = -110; x < 130; x += 18) lamps.push(MK.lamp(scene, x, 52, 4.5));
    const people = []; for (let i = 0; i < 22; i++) { const r = R(); people.push(MK.person(scene, window.PEOPLE[i % 8], { x: rr(-60, 60), z: rr(-6, 30), rot: R() * 6.28, mode: r < 0.45 ? "walk" : r < 0.8 ? "stand" : "sit", span: 50 })); }
    // beach day: umbrellas, towels and a crowd of sunbathers (track "beach")
    const beach = new THREE.Group(); scene.add(beach); const beachPeople = [];
    const umbC = [0xe63946, 0x2a9d8f, 0xf4a261, 0x457b9d, 0xe9c46a, 0xff6f91];
    for (let i = 0; i < 14; i++) { const x = rr(-16, 16), z = rr(4, 22), c = umbC[i % umbC.length];
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6), MK.std(0xeeeeee)); pole.position.set(x, 1.15, z); beach.add(pole);
      const top = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.5, 12, 1, true), new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, side: THREE.DoubleSide })); top.position.set(x, 2.3, z); beach.add(top);
      const towel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 1.8), MK.std(umbC[(i + 2) % umbC.length])); towel.position.set(x + 0.9, 0.01, z + 0.4); towel.rotation.y = rr(-0.3, 0.3); beach.add(towel);
      if (i % 2 === 0) beachPeople.push(MK.person(scene, window.PEOPLE[i % 8], { x: x + 0.9, seat: 0.25, z: z + 0.2, rot: Math.PI + rr(-0.5, 0.5), mode: "sit" }));
      else beachPeople.push(MK.person(scene, window.PEOPLE[(i + 3) % 8], { x: x - 0.8, z: z + 0.8, rot: rr(0, 6.28), mode: "stand" })); }
    beach.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const fishers = [[43, -70], [41.5, -64]].map(([x, z]) => MK.person(scene, window.PEOPLE[0], { x, y: 0.8, z, rot: Math.PI, mode: "stand" }));
    return { name: "coast", scene, people, update(t, look, pos) {
      sky(t, num, col); env(t); L.update(t, num, col, new THREE.Vector3(pos[0] * 0.8 + look[0] * 0.2, 0, pos[2] * 0.8 + look[2] * 0.2), num("shadowSize", t, 35));
      waterU.uTime.value = t; const tide = num("tide", t, 0.6);                      // 0 low ... 1 high
      water.position.y = -1.4 + tide * 1.6; const shore = -18 - (1 - tide) * 30; foam.position.set(0, water.position.y + 0.08, shore + Math.sin(t * 0.9) * 1.2);
      foam.material.opacity = 0.35 + 0.15 * Math.sin(t * 1.7);
      boats.forEach((b, i) => { const [x, z] = b.userData.bx; b.position.set(x, water.position.y + 0.1 + Math.sin(t * 1.1 + i) * 0.08, z); b.rotation.z = Math.sin(t * 0.9 + i) * 0.04; });
      const ms = num("moon", t, 1); const mp = WI.val("moonPos", t) || [-60, 140, -900];
      moon.visible = ms > 0.01; moon.scale.setScalar(Math.max(0.01, ms)); moon.position.set(mp[0], mp[1], mp[2]); halo.position.copy(moon.position); halo.material.opacity = ms * 0.55 * num("moonHalo", t, 1);
      path.visible = ms > 0.01; path.material.opacity = ms * num("moonPath", t, 1); path.position.set(mp[0] * 0.25 + pos[0] * 0.75, water.position.y + 0.12, -470); path.rotation.z = Math.atan2(mp[0] - pos[0], 900) * 0.4;
      moonLight.intensity = ms * num("moonLight", t, 0); moonLight.position.copy(moon.position).normalize().multiplyScalar(100); moonLight.target.position.set(pos[0], 0, pos[2]);
      stars.material.opacity = num("stars", t); mw.material.opacity = num("milkyway", t); aurora(num("aurora", t), t);
      const hl = num("cityLights", t); homes.forEach((m, i) => { m.opacity = WI.clamp01(hl * 3 - (i % 3)) * 0.9; });
      lamps.forEach((l, i) => l.set(num("lamps", t), t, i));
      MK.crowd(people, t, { frac: num("crowd", t, 1), panic: num("panic", t), look: num("lookUp", t) > 0.5 });
      const bch = num("beach", t) > 0.5; beach.visible = bch; beachPeople.forEach((p) => p.visible = bch); if (bch) MK.crowd(beachPeople, t, { frac: 1 });
      fishers.forEach((f, i) => WI.play(f, "Idle", t, 1, i * 3));
      return scene; } };
  });

  // ================================================================ FOREST (night, animals)
  B.push(function (WI) {
    const { THREE, R, rr, num, col, glowTex, canvasTex } = WI; const K = window.WI_COMMON(WI); const MK = window.WI_MODELKIT(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene); const env = MK.envs(scene);
    MK.ground(scene, 2000, 0x3c4a2a); WI.grass(scene, [-25, 25, 10, -45], 40000, 0x5a7d3a, 0.22);
    const trees = ["PineTree_1", "PineTree_3", "CommonTree_2", "BirchTree_2"];
    for (let i = 0; i < 140; i++) { let x = rr(-90, 90), z = rr(-160, 20); if (Math.abs(x) < 9 && z > -40) x += 18 * Math.sign(x || 1);
      const tr = WI.model(`ultimatenature/FBX/${trees[i % 4]}.fbx`, { height: rr(9, 16) }); tr.position.set(x, 0, z); tr.rotation.y = R() * 6; scene.add(tr); }
    for (let i = 0; i < 30; i++) { const b = WI.model(i % 3 ? "ultimatenature/FBX/Bush_1.fbx" : "ultimatenature/FBX/Rock_Moss_2.fbx", { size: rr(1.2, 2.6) }); b.position.set(rr(-30, 30), 0, rr(-60, 10)); scene.add(b); }
    const moonTex = MK.tex("moon_1024.jpg");
    const moon = new THREE.Mesh(new THREE.SphereGeometry(30, 48, 32), new THREE.MeshBasicMaterial({ map: moonTex, fog: false })); scene.add(moon);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xcfe0ff, transparent: true, depthWrite: false, fog: false })); halo.scale.set(220, 220, 1); scene.add(halo);
    const moonLight = new THREE.DirectionalLight(0xaebfff, 0); scene.add(moonLight); scene.add(moonLight.target);
    const aurora = K.aurora(scene, new THREE.Vector3(0, 180, 0), 600);
    const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 7500 }, (_, i) => i % 3 === 1 ? rr(150, 1100) : rr(-1400, 1400)), 3)),
      new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })); scene.add(stars);
    const mwF = new THREE.Mesh(new THREE.PlaneGeometry(2600, 520), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(190,200,255,0.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(255,255,255,${R() * 0.9})`; g.fillRect(R() * w, h / 2 + (R() + R() - 1) * h * 0.35, 1, 1); } }), transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    mwF.position.set(0, 650, -1100); mwF.rotation.z = -0.6; scene.add(mwF);
    const animals = [["Fox", -4, -14, 0.9, 1.0], ["Wolf", 6, -26, 1.0, 1.3], ["Deer", -9, -34, 2.6, 1.8], ["Stag", 9, -42, 2.6, 2.0], ["Fox", 3, -10, 1.6, 0.9]].map(([n, x, z, rot, len]) => {
      const a = WI.model(`ultimateanimatedanimals/glTF/${n}.gltf`, { length: len * 1.4, clip: "Idle" }); a.position.set(x, 0, z); a.rotation.y = rot; a.userData.an = { n, x, z, rot, ph: R() * 5 }; scene.add(a); return a; });
    return { name: "forest", scene, update(t, look, pos) {
      sky(t, num, col); env(t); L.update(t, num, col, new THREE.Vector3(pos[0], 0, pos[2] - 12), 28);
      const ms = num("moon", t, 1), mp = WI.val("moonPos", t) || [40, 160, -700];
      moon.visible = ms > 0.01; moon.scale.setScalar(Math.max(0.01, ms)); moon.position.set(mp[0], mp[1], mp[2]); halo.position.copy(moon.position); halo.material.opacity = 0.5 * ms;
      moonLight.intensity = ms * num("moonLight", t, 0); moonLight.position.copy(moon.position).normalize().multiplyScalar(100).add(new THREE.Vector3(pos[0], 0, pos[2])); moonLight.target.position.set(pos[0], 0, pos[2] - 12);
      stars.material.opacity = num("stars", t); aurora(num("aurora", t), t); mwF.material.opacity = num("milkyway", t);
      const beh = WI.val("animals", t) || "graze";    // graze | alert | run
      animals.forEach((a, i) => { const u = a.userData.an;
        if (beh === "run") { const d = ((t * 6 + u.ph * 3) % 60) - 30; a.position.set(u.x + Math.sin(u.rot) * d, 0, u.z + Math.cos(u.rot) * d); WI.play(a, "Gallop", t, 1, u.ph); }
        else { a.position.set(u.x, 0, u.z); WI.play(a, beh === "alert" ? (u.n === "Wolf" ? "Idle_2_HeadLow" : "Idle_2") : (i % 2 ? "Eating" : "Idle"), t, 1, u.ph); } });
      return scene; } };
  });
})();
