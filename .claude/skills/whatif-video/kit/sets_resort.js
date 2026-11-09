/* "resort": a Thai beach resort on a bright day (turquoise sea, white sand, palms, pool terrace, hotel with a
   stair tower and roof, beach bar, longtail boats, tsunami siren) + an underwater volcano that erupts out at sea,
   a tsunami wave, the flood, and a crowd of ~1800 blocky people with faces (sets_people.js).
   Tracks: eruptAt / erupt2At (s, time of each blast), lookAt, panicAt, fleeAt, stairsAt, roofAt (s),
     siren (0/1), waveZ, waveH, waveOn (0/1), floodY, floodZ, ash (0..1), birds (0..1 = time since start in 0..1 ...),
     friendPos/Rot/Mode/Face, womanPos/Rot/Mode/Face, staffPos/Rot/Mode/Face, talk ("friend"|"woman"|"staff"|""),
     plus the usual env/sky/light tracks.  Needs sets_common.js, sets_models.js (WI_MODELKIT), sets_people.js. */
window.RESORT_MODELS = ["ultimatenature/FBX/PalmTree_1.fbx", "ultimatenature/FBX/PalmTree_2.fbx", "ultimatenature/FBX/PalmTree_3.fbx",
  "ships/FBX/Boat.fbx", "ultimatenature/FBX/Bush_1.fbx", "ultimatenature/FBX/Bush_2.fbx"];
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];
  B.push(function (WI) {
    const { THREE, R, rr, num, col, val, glowTex, canvasTex } = WI;
    const K = window.WI_COMMON(WI), MK = window.WI_MODELKIT(WI), BL = window.WI_BLOCKY(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene); const env = MK.envs(scene);
    const std = MK.std, smooth = WI.smooth, clamp01 = WI.clamp01;
    const E = new THREE.Vector3(-160, 0, -1500);                  // the volcano vent
    const TERR = 1.2, ROOF = 16.5;                                 // terrace height, hotel roof height

    // ---------------------------------------------------------------- textures
    const cloudTex = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 26; i++) { const x = rr(50, 206), y = rr(80, 190), r = rr(26, 62);
      const gr = g.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.7, "rgba(245,248,255,0.75)"); gr.addColorStop(1, "rgba(220,228,240,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
    const lumpTex = canvasTex(256, 256, (g) => { for (let i = 0; i < 40; i++) { const a = R() * 6.28, d = rr(0, 70), x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d, r = rr(28, 58);
      const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.6, "rgba(200,200,200,0.9)"); gr.addColorStop(1, "rgba(150,150,150,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
    const foamTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "rgba(255,255,255,0)"; g.clearRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${rr(0.2, 0.9)})`; g.beginPath(); g.ellipse(R() * w, R() * h, rr(2, 14), rr(1, 4), R() * 0.4, 0, 7); g.fill(); } });
    const sandTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = rr(0.86, 1);
      g.fillStyle = `rgb(${255 * v | 0},${250 * v | 0},${238 * v | 0})`; g.fillRect(R() * w, R() * h, 2, 2); } }); sandTex.repeat.set(160, 40);
    const tileTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#2fb7e8"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7fd8f5"; g.lineWidth = 2;
      for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); } }); tileTex.repeat.set(8, 4);
    const causTex = canvasTex(256, 256, (g, w, h) => { g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 2;
      for (let i = 0; i < 60; i++) { g.beginPath(); const x = R() * w, y = R() * h; g.ellipse(x, y, rr(10, 30), rr(6, 18), R() * 3, 0, 7); g.stroke(); } }); causTex.repeat.set(3, 2);
    const hotelTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#fff3e0"; g.fillRect(0, 0, w, h);
      for (let f = 0; f < 5; f++) for (let k = 0; k < 8; k++) { const x = 10 + k * 63, y = 18 + f * 100;
        g.fillStyle = "#7cc6e6"; g.fillRect(x, y, 40, 62); g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(x + 4, y + 4, 10, 54);
        g.fillStyle = "#e9967a"; g.fillRect(x + 44, y + 4, 12, 58); } });
    const signTex = canvasTex(256, 192, (g, w, h) => { g.fillStyle = "#0d47a1"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.fillRect(8, 8, w - 16, h - 16);
      g.fillStyle = "#0d47a1"; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = "#fff"; g.font = "bold 26px Arial"; g.textAlign = "center";
      g.fillText("TSUNAMI", w / 2, 50); g.fillText("HAZARD ZONE", w / 2, 82); g.beginPath(); g.moveTo(40, 160); g.quadraticCurveTo(90, 90, 150, 120); g.quadraticCurveTo(120, 130, 125, 160); g.closePath(); g.fill();
      g.font = "bold 20px Arial"; g.fillText("EVACUATE  ➜", 190, 175); });
    const evacTex = canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#1b5e20"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = "bold 28px Arial"; g.textAlign = "center";
      g.fillText("EVACUATION ROUTE", w / 2, 40); g.fillText("➜  HIGH GROUND", w / 2, 78); });

    // ---------------------------------------------------------------- sky dressing
    const clouds = []; for (let i = 0; i < 26; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: 0xffffff, transparent: true, depthWrite: false, fog: false, opacity: rr(0.7, 1) }));
      const a = rr(-1.4, 1.4), d = rr(2000, 2900); sp.position.set(Math.sin(a) * d, rr(250, 700), -Math.cos(a) * d * (R() < 0.3 ? -1 : 1)); sp.scale.set(rr(600, 1100), rr(300, 500), 1); sp.userData.y = sp.position.y; scene.add(sp); clouds.push(sp); }

    // ---------------------------------------------------------------- sand, sea, foam
    const sandGeo = new THREE.PlaneGeometry(2400, 260, 1, 52); sandGeo.rotateX(-Math.PI / 2);
    { const p = sandGeo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i) + 70; const y = z > 3 ? 0.25 + Math.min(z - 3, 50) * 0.004 : 0.25 + (z - 3) * 0.06; p.setY(i, Math.max(y, -7)); } sandGeo.computeVertexNormals(); }
    const sand = new THREE.Mesh(sandGeo, new THREE.MeshStandardMaterial({ color: 0xf2c47c, map: sandTex, roughness: 0.95 })); sand.position.z = 70; sand.receiveShadow = true; scene.add(sand);
    const wet = new THREE.Mesh(new THREE.PlaneGeometry(2400, 7), new THREE.MeshStandardMaterial({ color: 0xd9b07a, roughness: 0.4, transparent: true, opacity: 0.75 }));
    wet.rotation.x = -Math.PI / 2; wet.position.set(0, 0.07, 1.2); wet.receiveShadow = true; scene.add(wet);
    const seaGeo = new THREE.PlaneGeometry(5000, 3600, 220, 160); seaGeo.rotateX(-Math.PI / 2); seaGeo.translate(0, 0, -1800 + 2);
    { const p = seaGeo.attributes.position, c = new Float32Array(p.count * 3); const shallow = new THREE.Color("#31e0cf"), mid = new THREE.Color("#12a7d4"), deep = new THREE.Color("#0757b0"), tmp = new THREE.Color();
      for (let i = 0; i < p.count; i++) { const d = -p.getZ(i); const k1 = smooth(d / 90), k2 = smooth((d - 90) / 700); tmp.copy(shallow).lerp(mid, k1).lerp(deep, k2); c.set([tmp.r, tmp.g, tmp.b], i * 3); }
      seaGeo.setAttribute("color", new THREE.BufferAttribute(c, 3)); }
    const seaU = { uTime: { value: 0 }, uAmp: { value: 1 } };
    const sea = new THREE.Mesh(seaGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.93 }));
    sea.material.onBeforeCompile = (sh) => { sh.uniforms.uTime = seaU.uTime; sh.uniforms.uAmp = seaU.uAmp; sh.vertexShader = "uniform float uTime; uniform float uAmp;\n" + sh.vertexShader.replace("#include <begin_vertex>",
      "#include <begin_vertex>\n float dd = clamp(-position.z / 40.0, 0.0, 1.0) * uAmp; transformed.y += dd * (sin(position.x*0.045 + uTime*1.2)*0.22 + sin(position.z*0.07 - uTime*1.6)*0.25 + sin((position.x-position.z)*0.19 + uTime*2.3)*0.06);"); };
    sea.userData.noShadow = true; sea.receiveShadow = true; scene.add(sea);
    const foams = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2400, 3.2), new THREE.MeshBasicMaterial({ map: foamTex, transparent: true, depthWrite: false, opacity: 0.8 }));
      m.material.map = foamTex.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set(220, 1); m.rotation.x = -Math.PI / 2; m.userData.noShadow = true; scene.add(m); return m; });
    // sun glitter on the water
    const glit = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 2400 }, (_, i) => i % 3 === 0 ? rr(-400, 400) : i % 3 === 1 ? 0.25 : rr(-900, -30)), 3)),
      new THREE.PointsMaterial({ color: 0xffffff, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    glit.userData.noShadow = true; scene.add(glit); const glitBase = glit.geometry.attributes.position.array.slice();

    // ---------------------------------------------------------------- resort: terrace, pool, hotel, stair tower, bungalows, bar
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(170, TERR, 46), std(0xd8b08a)); terrace.position.set(-5, TERR / 2, 85); scene.add(terrace);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(170, 0.06, 46), new THREE.MeshStandardMaterial({ color: 0xc98d5a, roughness: 0.7, map: canvasTex(64, 256, (g, w, h) => {
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,0.18)"; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 2); }) })); deck.material.map.repeat.set(40, 12);
    deck.position.set(-5, TERR + 0.03, 85); scene.add(deck);
    for (let x = -70; x <= 60; x += 26) { const st = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 1.2), std(0xe8d2b5)); st.position.set(x, 0.4, 61.6); scene.add(st);
      const st2 = st.clone(); st2.position.set(x, 0.8, 62.4); scene.add(st2); }
    const pool = new THREE.Mesh(new THREE.BoxGeometry(34, 0.1, 13), new THREE.MeshStandardMaterial({ color: 0x8ae6ff, map: tileTex, roughness: 0.3 })); pool.position.set(-8, TERR - 0.02, 74); scene.add(pool);
    const poolW = new THREE.Mesh(new THREE.PlaneGeometry(34, 13), new THREE.MeshStandardMaterial({ color: 0x5fd8ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.7, emissive: 0x0b5f86, emissiveIntensity: 0.25, map: causTex }));
    poolW.rotation.x = -Math.PI / 2; poolW.position.set(-8, TERR + 0.08, 74); poolW.userData.noShadow = true; scene.add(poolW);
    [[-8, 67.2, 35, 0.6], [-8, 80.8, 35, 0.6], [-25.8, 74, 0.6, 14], [9.8, 74, 0.6, 14]].forEach(([x, z, w, d]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), std(0xffffff)); b.position.set(x, TERR + 0.12, z); scene.add(b); });
    const hotel = new THREE.Group(); scene.add(hotel);
    const hMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: hotelTex, roughness: 0.85 }); hMat.map.repeat.set(4, 1);
    const hb = new THREE.Mesh(new THREE.BoxGeometry(72, ROOF - TERR, 16), [std(0xfff0dc), std(0xfff0dc), std(0xb98f6e), std(0xf3e2c8), hMat, std(0xfff0dc)]); hb.position.set(-4, TERR + (ROOF - TERR) / 2, 100); hotel.add(hb);
    for (let f = 1; f <= 4; f++) { const y = TERR + f * 3.06; const bal = new THREE.Mesh(new THREE.BoxGeometry(72, 0.18, 1.8), std(0xffffff)); bal.position.set(-4, y, 92.1); hotel.add(bal);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(72, 1.0, 0.05), new THREE.MeshStandardMaterial({ color: 0x9fe3ff, transparent: true, opacity: 0.35, roughness: 0.05 })); glass.position.set(-4, y + 0.6, 91.25); hotel.add(glass); }
    const par = std(0xffffff); [[-4, 92.1, 72, 0.3], [-4, 107.9, 72, 0.3], [-40, 100, 0.3, 16], [32, 100, 0.3, 16]].forEach(([x, z, w, d]) => { const p = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), par); p.position.set(x, ROOF + 0.55, z); hotel.add(p); });
    for (let i = 0; i < 4; i++) { const tk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 16), std(0x3d6ea8, { metalness: 0.3, roughness: 0.5 })); tk.position.set(-30 + i * 6, ROOF + 1.1, 105); hotel.add(tk);
      const ac = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 1.4), std(0xd9dde3)); ac.position.set(10 + i * 4, ROOF + 0.6, 104); hotel.add(ac); }
    // the orange roof sign
    const roofSign = new THREE.Mesh(new THREE.BoxGeometry(22, 2.4, 0.4), std(0xff7a1a, { emissive: 0xff5a00, emissiveIntensity: 0.25 })); roofSign.position.set(-20, ROOF + 2.2, 106.5); hotel.add(roofSign);
    // stair tower (open concrete frame with zig-zag flights) at the right end of the hotel
    const STX = 37, STZ = 92; const tower = new THREE.Group(); tower.position.set(STX, 0, STZ); scene.add(tower);
    const conc = std(0xece6dc); [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([x, z]) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.5, ROOF + 1.5, 0.5), conc); c.position.set(x, (ROOF + 1.5) / 2, z); tower.add(c); });
    for (let f = 0; f <= 5; f++) { const y = f === 0 ? TERR : TERR + f * 3.06; const land = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.25, 2.4), conc); land.position.set(0, Math.min(y, ROOF), f % 2 ? 2 : -2); tower.add(land); }
    const stepMat = std(0xf6f1e8); const flights = [];
    for (let f = 0; f < 5; f++) { const y0 = TERR + f * 3.06, z0 = f % 2 ? 0.8 : -0.8, dir = f % 2 ? -1 : 1;
      for (let s = 0; s < 12; s++) { const st = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.255, 0.3), stepMat); st.position.set(f % 2 ? 1.6 : -1.6, y0 + s * 0.255 + 0.12, z0 + dir * (s * 0.18 - 1)); tower.add(st); }
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 3.4), std(0x2a6fb0)); rail.position.set(f % 2 ? 2.85 : -2.85, y0 + 2.4, z0 + dir * 0.0); rail.rotation.x = -dir * 0.85; tower.add(rail);
      flights.push({ x: f % 2 ? 1.6 : -1.6, y0, z0, dir }); }
    const evac = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.1), new THREE.MeshBasicMaterial({ map: evacTex })); evac.position.set(STX - 3.4, 3.2, STZ - 3.3); scene.add(evac);
    // bungalows with thatched roofs on the left
    const thatch = std(0xc9a24f), wood = std(0x8a5a35); for (let i = 0; i < 9; i++) { const g = new THREE.Group(); const x = -95 + (i % 3) * 14 + rr(-2, 2), z = 64 + Math.floor(i / 3) * 12;
      const body = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 6), std(0xfff5e6)); body.position.y = TERR + 1.5; g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 3.4, 4), thatch); roof.position.y = TERR + 4.6; roof.rotation.y = Math.PI / 4; g.add(roof);
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, 0.1), wood); door.position.set(0, TERR + 1.05, -3.02); g.add(door); g.position.set(x, 0, z); scene.add(g); }
    // beach bar
    const bar = new THREE.Group(); bar.position.set(22, 0, 40); scene.add(bar);
    { const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 3.2, 8), thatch); roof.position.y = 4.4; bar.add(roof);
      [[-4, -4], [4, -4], [-4, 4], [4, 4]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 3.2, 8), wood); p.position.set(x, 1.6, z); bar.add(p); });
      const ctr = new THREE.Mesh(new THREE.BoxGeometry(6, 1.15, 1.2), wood); ctr.position.set(0, 0.57, -3); bar.add(ctr);
      for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), std([0x2ecc71, 0xe67e22, 0x3498db, 0xe74c3c][i % 4], { roughness: 0.2 })); b.position.set(-2.4 + i * 0.6, 1.3, -3); bar.add(b); }
      for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; const bulb = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: [0xffd166, 0xff4d6d, 0x06d6a0, 0x3a86ff][i % 4], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        bulb.scale.setScalar(0.5); bulb.position.set(Math.cos(a) * 6.8, 2.9, Math.sin(a) * 6.8); bar.add(bulb); } }
    // siren tower + hazard sign
    const SIR = new THREE.Vector3(-14, 0, 46); const siren = new THREE.Group(); siren.position.copy(SIR); scene.add(siren);
    { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 10, 10), std(0xd9d9d9, { metalness: 0.5, roughness: 0.4 })); pole.position.y = 5; siren.add(pole);
      for (let i = 0; i < 4; i++) { const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.12, 1.2, 12, 1, true), std(0xf2f2f2, { side: THREE.DoubleSide, metalness: 0.4 })); horn.rotation.z = Math.PI / 2;
        const hg = new THREE.Group(); hg.add(horn); horn.position.x = 0.7; hg.rotation.y = i * Math.PI / 2; hg.position.y = 9.6; siren.add(hg); }
      const plate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 0.1), new THREE.MeshBasicMaterial({ map: signTex })); plate.position.set(0, 3.2, -0.3); plate.rotation.y = Math.PI; siren.add(plate); }
    const sirenLight = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff2a1a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    sirenLight.scale.setScalar(3.5); sirenLight.position.set(SIR.x, 10.4, SIR.z); scene.add(sirenLight);
    const sirenLamp = new THREE.PointLight(0xff2a1a, 0, 30, 2); sirenLamp.position.set(SIR.x, 10.2, SIR.z); scene.add(sirenLamp);
    // palms, bushes
    const palms = [];
    for (let i = 0; i < 70; i++) { const x = rr(-220, 220), z = i < 50 ? rr(46, 60) : rr(66, 95); if (Math.abs(x - 37) < 6 && z > 80) continue; if (z > 64 && x > -45 && x < 34 && z < 82 && Math.abs(x + 8) < 20) continue;
      const p = WI.model(`ultimatenature/FBX/PalmTree_${1 + (i % 3)}.fbx`, { height: rr(8, 13) }); p.position.set(x, z > 62 ? TERR : 0.3, z); p.rotation.y = R() * 6.28; p.rotation.z = rr(-0.08, 0.08); p.userData.rz = p.rotation.z; scene.add(p); palms.push(p); }
    for (let i = 0; i < 40; i++) { const b = WI.model(`ultimatenature/FBX/Bush_${1 + (i % 2)}.fbx`, { size: rr(1.6, 3) }); b.position.set(rr(-200, 200), TERR, rr(63, 70)); scene.add(b); }

    // ---------------------------------------------------------------- beach props (they float away in the flood)
    const props = [];
    const umbC = [0xff4d6d, 0x06d6a0, 0xffb703, 0x3a86ff, 0xfb5607, 0xff006e, 0x8338ec, 0x2ec4b6];
    const umbrellas = []; for (let i = 0; i < 90; i++) { const x = rr(-160, 160), z = rr(8, 42); if (Math.abs(x - 22) < 9 && Math.abs(z - 40) < 9) continue;
      const g = new THREE.Group(); const c = umbC[i % umbC.length];
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6), std(0xffffff)); pole.position.y = 1.2; g.add(pole);
      const top = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.55, 16, 1, true), new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, side: THREE.DoubleSide })); top.position.y = 2.4; g.add(top);
      const stripe = new THREE.Mesh(new THREE.ConeGeometry(1.47, 0.12, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })); stripe.position.y = 2.2; g.add(stripe);
      const towel = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 1.9), std(umbC[(i + 3) % umbC.length])); towel.position.set(0.9, 0.03, 0.4); g.add(towel);
      if (i % 2 === 0) { const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 1.9), std(0xffffff)); lounger.position.set(-0.9, 0.18, 0.2); g.add(lounger); }
      g.position.set(x, 0.25, z); g.rotation.y = rr(-0.3, 0.3); scene.add(g); umbrellas.push({ x, z }); props.push({ obj: g, x, z, y: 0.25, ph: R() * 6 }); }
    const boats = []; for (let i = 0; i < 9; i++) { const b = WI.model("ships/FBX/Boat.fbx", { length: rr(8, 11), alongZ: true }); const x = rr(-140, 140), z = rr(-70, -18);
      b.position.set(x, 0.1, z); b.rotation.y = rr(-0.5, 0.5) + Math.PI / 2 * (R() < 0.5 ? 1 : 0); scene.add(b);
      const rib = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.4), new THREE.MeshBasicMaterial({ color: umbC[i % umbC.length], side: THREE.DoubleSide })); rib.position.y = 1.8; b.add(rib);
      boats.push(b); props.push({ obj: b, x, z, y: 0.1, ph: R() * 6, boat: true }); }
    const volley = new THREE.Mesh(new THREE.BoxGeometry(9, 1, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })); volley.position.set(-60, 2.2, 22); scene.add(volley);

    // ---------------------------------------------------------------- the eruption
    const erupt = new THREE.Group(); erupt.position.copy(E); scene.add(erupt);
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff1d0, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    flash.position.y = 60; erupt.add(flash);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xeafcff, roughness: 0.4, transparent: true, opacity: 0, fog: false }));
    erupt.add(dome);
    const jetGeo = new THREE.CylinderGeometry(0.15, 1, 1, 10, 1, true); jetGeo.translate(0, 0.5, 0);
    const mkJets = (n, colr, seedA) => Array.from({ length: n }, (_, i) => { const m = new THREE.Mesh(jetGeo, new THREE.MeshStandardMaterial({ color: colr, roughness: 0.9, transparent: true, opacity: 0, fog: false, side: THREE.DoubleSide }));
      const az = rr(0, 6.28), el = rr(0.05, 0.75); m.userData = { az, el, len: rr(0.45, 1.0), w: rr(0.018, 0.04), off: rr(0, 0.5) + seedA }; m.rotation.order = "YXZ"; m.rotation.set(0, az, 0); erupt.add(m); return m; });
    const jets = mkJets(18, 0x3a3532, 0), jetsW = mkJets(30, 0xf4f8ff, 0.1);
    // white water fountains at side vents
    const vents = [[180, 240, 0.8], [-150, 300, 1.6], [260, -120, 2.4], [-60, 420, 3.1]].map(([dx, dz, d]) => { const g = new THREE.Group(); g.position.set(dx, 0, dz); erupt.add(g);
      const js = Array.from({ length: 12 }, () => { const m = new THREE.Mesh(jetGeo, new THREE.MeshStandardMaterial({ color: 0xf4fbff, roughness: 0.6, transparent: true, opacity: 0, fog: false, side: THREE.DoubleSide }));
        m.userData = { az: rr(0, 6.28), el: rr(0, 0.45), len: rr(0.6, 1.1), w: rr(0.04, 0.08) }; m.rotation.order = "YXZ"; g.add(m); return m; }); return { g, js, d }; });
    const puffMat = (c) => new THREE.SpriteMaterial({ map: lumpTex, color: c, transparent: true, depthWrite: false, fog: false, opacity: 0 });
    const plume = Array.from({ length: 260 }, (_, i) => { const sp = new THREE.Sprite(puffMat(0x8a8580)); sp.userData = { born: rr(0, 14), h: rr(0.15, 1), r: rr(0, 1), a: rr(0, 6.28), s: rr(0.7, 1.3), rot: R() };
      erupt.add(sp); return sp; });
    const surge = Array.from({ length: 90 }, (_, i) => { const sp = new THREE.Sprite(puffMat(0xf2f4f6)); sp.userData = { a: (i / 90) * 6.28 + rr(-0.05, 0.05), s: rr(0.6, 1.2) }; erupt.add(sp); return sp; });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 128), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.6; erupt.add(ring);
    const bolts = Array.from({ length: 6 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xcfe6ff, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0 }));
      sp.userData = { ph: R() * 50, y: rr(250, 700), x: rr(-150, 150) }; erupt.add(sp); return sp; });

    // ---------------------------------------------------------------- tsunami wave + flood
    const WX = 300, WV = 34; const waveGeo = new THREE.PlaneGeometry(1, 1, WX, WV);
    const wcol = new Float32Array(waveGeo.attributes.position.count * 3); waveGeo.setAttribute("color", new THREE.BufferAttribute(wcol, 3));
    const wave = new THREE.Mesh(waveGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.2, metalness: 0.05, side: THREE.DoubleSide }));
    wave.frustumCulled = false; wave.userData.noShadow = true; scene.add(wave);
    const wDeep = new THREE.Color("#0b6b8f"), wBody = new THREE.Color("#22c4c8"), wFoam = new THREE.Color("#f6fdff"), wc = new THREE.Color();
    const spray = Array.from({ length: 240 }, (_, i) => { const sp = new THREE.Sprite(puffMat(0xffffff)); sp.userData = { x: rr(-1, 1), ph: R(), s: rr(0.6, 1.4) }; scene.add(sp); return sp; });
    const floodTex = foamTex.clone(); floodTex.needsUpdate = true; floodTex.repeat.set(60, 12);
    const flood = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x1f8c95, roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.97 }));
    const floodFoam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: floodTex, transparent: true, depthWrite: false }));
    const floodEdge = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: foamTex, color: 0xffffff, transparent: true, depthWrite: false }));
    floodEdge.material.map = foamTex.clone(); floodEdge.material.map.needsUpdate = true; floodEdge.material.map.repeat.set(200, 1); floodEdge.rotation.x = -Math.PI / 2; floodEdge.userData.noShadow = true; scene.add(floodEdge);
    flood.rotation.x = floodFoam.rotation.x = -Math.PI / 2; flood.userData.noShadow = floodFoam.userData.noShadow = true; scene.add(flood); scene.add(floodFoam);

    // ---------------------------------------------------------------- birds, sun motes, ash
    const birdGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([-0.6, 0, 0.1, 0, 0, -0.15, 0, 0.05, 0.25, 0.6, 0, 0.1, 0, 0, -0.15, 0, 0.05, 0.25], 3));
    const birds = Array.from({ length: 50 }, () => { const m = new THREE.Mesh(birdGeo, new THREE.MeshBasicMaterial({ color: 0x1d1d22, side: THREE.DoubleSide })); m.userData = { x: rr(-120, 80), y: rr(8, 40), z: rr(-80, 20), ph: R() * 6, sp: rr(9, 15) };
      m.scale.setScalar(1.6); m.visible = false; scene.add(m); return m; });
    const moteGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(600 * 3), 3));
    const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xfff3cf, size: 3, sizeAttenuation: false, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    motes.frustumCulled = false; motes.userData.noShadow = true; scene.add(motes); const moteSeed = Array.from({ length: 600 }, () => [R(), R(), R(), R()]);
    const ashGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(900 * 3), 3));
    const ash = new THREE.Points(ashGeo, new THREE.PointsMaterial({ color: 0x5b5754, size: 3.5, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
    ash.frustumCulled = false; ash.userData.noShadow = true; scene.add(ash); const ashSeed = Array.from({ length: 900 }, () => [R(), R(), R(), R()]);

    // ---------------------------------------------------------------- airliner (tracks planeOn, planeX, planeDrop)
    const plane = new THREE.Group(); scene.add(plane); { const white = std(0xf4f6f8, { roughness: 0.4, metalness: 0.2 }), blue = std(0x1d4e89);
      const fus = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 40, 16), white); fus.rotation.z = Math.PI / 2; plane.add(fus);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12), white); nose.position.x = 20; nose.scale.set(1.6, 1, 1); plane.add(nose);
      const tailC = new THREE.Mesh(new THREE.ConeGeometry(2.2, 8, 16), white); tailC.rotation.z = Math.PI / 2; tailC.position.x = -24; plane.add(tailC);
      const wing = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 44), white); wing.position.set(1, -0.8, 0); wing.rotation.y = 0.25; plane.add(wing);
      const fin = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 0.5), blue); fin.position.set(-24, 4.5, 0); plane.add(fin);
      const stab = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 14), white); stab.position.set(-24, 0.5, 0); plane.add(stab);
      [-9, 9].forEach((z) => { const eng = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 5, 12), blue); eng.rotation.z = Math.PI / 2; eng.position.set(3, -2.2, z); plane.add(eng); });
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(2.23, 2.23, 34, 16, 1, true, -0.4, 0.8), blue); stripe.rotation.z = Math.PI / 2; plane.add(stripe); }
    plane.visible = false;

    // ---------------------------------------------------------------- the crowd
    const ppl = [];
    const add = (o) => { ppl.push(Object.assign({ x: 0, z: 0, y: 0, rot: 0, mode: "idle" }, o)); };
    umbrellas.forEach((u, i) => { if (i % 3 === 2) return; add({ kind: "lie", x: u.x + 0.9, z: u.z + 0.4 - 0.9, y: 0.3, rot: Math.PI, mode: "lie", face: 0 });
      if (R() < 0.6) add({ kind: "sit", x: u.x - 0.9, z: u.z + 0.6, y: 0.3, rot: rr(2.6, 3.6), mode: "sit" }); });
    for (let i = 0; i < 160; i++) { const g = { x: rr(-170, 170), z: rr(4, 44) }; for (let k = 0; k < 2 + Math.floor(R() * 3); k++) add({ kind: "stand", x: g.x + rr(-1.4, 1.4), z: g.z + rr(-1.4, 1.4), y: 0.3, rot: R() * 6.28, mode: R() < 0.5 ? "talk" : "idle" }); }
    for (let i = 0; i < 140; i++) add({ kind: "walk", x: rr(-200, 200), z: rr(2, 30), y: 0.3, rot: R() < 0.5 ? Math.PI / 2 : -Math.PI / 2, mode: "walk", span: 120 });
    for (let i = 0; i < 170; i++) { const z = rr(-26, -2); add({ kind: "wade", x: rr(-180, 180), z, y: Math.max(-1.25, z * 0.06 + 0.1), rot: R() * 6.28, mode: R() < 0.3 ? "wave" : "idle", legs: null }); }
    for (let i = 0; i < 8; i++) add({ kind: "play", x: -60 + rr(-4, 4), z: 22 + (i % 2 ? 3 : -3) + rr(-1, 1), y: 0.3, rot: i % 2 ? Math.PI : 0, mode: "wave" });
    for (let i = 0; i < 70; i++) add({ kind: "pool", x: rr(-60, 30), z: R() < 0.5 ? rr(64, 66.5) : rr(82, 88), y: TERR + 0.4, rot: R() * 6.28, mode: R() < 0.6 ? "lie" : "sit" });
    for (let i = 0; i < 14; i++) add({ kind: "bar", x: 22 + rr(-3, 3), z: 40 - 4.4 + rr(-0.6, 0.6), y: 0.3, rot: 0, mode: "talk" });
    for (let i = 0; i < 800; i++) { const side = R() < 0.5 ? -1 : 1; add({ kind: "far", x: side * rr(200, 520), z: rr(-14, 46), y: 0.3, rot: R() * 6.28, mode: R() < 0.4 ? "lie" : R() < 0.5 ? "walk" : "idle", span: 80 }); }
    const roofPeople = []; for (let i = 0; i < 110; i++) { const p = { kind: "roof", x: rr(-38, 30), z: rr(93.5, 106), y: ROOF, rot: Math.PI + rr(-0.5, 0.5), mode: ["cry", "panic", "point", "film", "hug", "idle"][i % 6] }; add(p); roofPeople.push(p); }
    for (let i = 0; i < 48; i++) add({ kind: "stairs", idx: i, x: 0, z: 0, y: 0, mode: "climb" });
    const crowd = BL.crowd(scene, ppl);
    // heroes: friend, woman, staff
    const heroes = BL.crowd(scene, [
      { name: "friend", shirt: new THREE.Color("#ff4d6d"), legs: new THREE.Color("#1d3557"), skin: WI.BLOCKY_COLORS.SKIN[2], hair: WI.BLOCKY_COLORS.HAIR[0], s: 1.04, face: 7 },
      { name: "woman", shirt: new THREE.Color("#ffd166"), legs: new THREE.Color("#ffd166"), skin: WI.BLOCKY_COLORS.SKIN[0], hair: WI.BLOCKY_COLORS.HAIR[5], s: 0.97, face: 0 },
      { name: "staff", shirt: new THREE.Color("#ffffff"), legs: new THREE.Color("#2b2d42"), skin: WI.BLOCKY_COLORS.SKIN[4], hair: WI.BLOCKY_COLORS.HAIR[7], s: 1.0, face: 1 }]);
    const hp = new THREE.Vector3();
    const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

    function crowdFn(p, t, i) {
      const lookAt = num("lookAt", t, 999), panicAt = num("panicAt", t, 999), fleeAt = num("fleeAt", t, 999), roofAt = num("roofAt", t, 999), stairsAt = num("stairsAt", t, 999);
      const h1 = hash(i), h2 = hash(i + 17.3), h3 = hash(i + 41.9);
      p.hidden = false;
      { const vM = num("vanishMen", t, 999), vW = num("vanishWomen", t, 999), v = p.male ? vM : vW; p.vanishT = v < 900 ? v + h2 * 1.2 : undefined;
        p.belly = p.male && h3 < 0.45 && p.kind !== "far" ? num("menBelly", t, 0) : 0; }
      if (p.kind === "roof") { p.hidden = t < roofAt; p.face = h1 < 0.4 ? 5 : h1 < 0.75 ? 4 : 3; return; }
      if (p.kind === "stairs") { const run = t - stairsAt; if (run < 0 || t > roofAt + 6) { p.hidden = true; return; }
        const pos = (p.idx * 0.7 + run * 1.1) % 15.3; const f = Math.min(4, Math.floor(pos / 3.06)), u = (pos - f * 3.06) / 3.06, fl = flights[f];
        p.x = STX + fl.x + (h1 - 0.5) * 1.2; p.y = fl.y0 + u * 3.06; p.z = STZ + fl.z0 + fl.dir * (u * 2.2 - 1); p.rot = fl.dir > 0 ? 0 : Math.PI; p.mode = "climb"; p.face = 4; return; }
      if (p.base === undefined) p.base = { x: p.x, z: p.z, y: p.y, mode: p.mode, rot: p.rot };
      const b = p.base;
      // calm: walkers stroll along the beach
      if (b.mode === "walk") { const span = p.span || 100; const d = (((t * 1.3 * p.speed + p.phase * 9) % span) + span) % span - span / 2; p.x = b.x + Math.sin(b.rot) * d; p.z = b.z; }
      else { p.x = b.x; p.z = b.z; }
      p.y = b.y; p.mode = b.mode; p.rot = b.rot;
      if (p.kind === "far" && t < fleeAt) { if (t >= lookAt + h1 * 2) { p.mode = "idle"; p.rot = Math.PI + (h2 - 0.5) * 0.8; p.y = 0.3; p.face = 2; } return; }
      if (t < lookAt + h1 * 1.6) { if (p.face === undefined || p.face > 2 && p.face !== 7) p.face = h2 < 0.6 ? 0 : 7; if (b.mode === "talk" || b.mode === "idle") p.face = Math.sin(t * 2 + i) > 0.6 ? 7 : p.face; return; }
      const sea = Math.atan2(E.x - p.x, E.z - p.z);
      if (t < fleeAt + h3 * 2.2) {           // looking out to sea, then panic
        p.mode = "idle"; if (p.kind === "lie" || p.kind === "sit") p.y = 0.3; if (p.kind === "pool") p.y = TERR;
        p.rot = sea + (h2 - 0.5) * 0.4; p.face = 2;
        if (t > lookAt + 1.5 + h2) p.mode = h1 < 0.25 ? "point" : h1 < 0.45 ? "film" : "idle";
        if (t > panicAt + h2 * 1.5) { p.face = h3 < 0.5 ? 3 : 4; p.mode = h1 < 0.2 ? "point" : h1 < 0.5 ? "panic" : h1 < 0.6 ? "film" : h1 < 0.7 ? "cry" : "idle";
          if (p.kind === "wade") { const k = Math.min(1, (t - panicAt - h2 * 1.5) / 6); p.z = b.z + k * (8 - b.z); p.y = Math.max(-1.25, p.z * 0.06 + 0.1); p.mode = "run"; p.rot = 0; } }
        return; }
      // flee inland
      const tf = t - fleeAt - h3 * 2.2; const sp = 3.4 + h1 * 2.4;
      const z0 = p.kind === "wade" ? Math.min(8, b.z + 8) : b.z; let z = z0 + tf * sp; const x = p.x + Math.sin((h2 - 0.5) * 0.6) * tf * sp * 0.25;
      p.x = x; p.z = z; p.rot = (h2 - 0.5) * 0.5; p.mode = "run"; p.face = h1 < 0.55 ? 4 : 3; p.y = z > 62 ? TERR : (z > 3 ? 0.3 : Math.max(-1.25, z * 0.06 + 0.1));
      if (z > 91 && Math.abs(x + 4) < 40) p.hidden = true;
      if (z > 130) p.hidden = true;
    }

    return { name: "resort", scene, update(t, look, pos) {
      sky(t, num, col); env(t); L.update(t, num, col, new THREE.Vector3(pos[0] * 0.7 + look[0] * 0.3, pos[1] > 10 ? 10 : 0, pos[2] * 0.7 + look[2] * 0.3), num("shadowSize", t, 45));
      seaU.uTime.value = t;
      foams.forEach((f, i) => { const ph = (t * 0.22 + i / 3) % 1; f.position.set(0, 0.1, -2 + ph * 4.5 - i * 2); f.material.opacity = 0.75 * Math.sin(ph * Math.PI); f.material.map.offset.x = i * 0.3 + t * 0.002; });
      { const a = glit.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 3) { const k = Math.sin(t * 6 + glitBase[i] * 0.7 + glitBase[i + 2] * 0.3); a[i + 1] = k > 0.75 ? 0.3 : -5; } glit.geometry.attributes.position.needsUpdate = true; }
      clouds.forEach((c, i) => { c.position.x += 0; });
      poolW.material.map.offset.set(t * 0.02, t * 0.013);
      // eruptions
      const eA = num("eruptAt", t, 999), eB = num("erupt2At", t, 999);
      const te = t - eA, te2 = t - eB; const on = te > 0;
      erupt.visible = on;
      if (on) {
        const fl = Math.max(te > 0 ? Math.exp(-te * 2.2) : 0, te2 > 0 ? Math.exp(-te2 * 2.2) : 0);
        flash.material.opacity = fl; flash.scale.setScalar(500 + 600 * fl);
        const dr = Math.min(te, 4); dome.scale.set(170 * smooth(dr / 0.9), 120 * smooth(dr / 0.9), 170 * smooth(dr / 0.9)); dome.material.opacity = 0.95 * clamp01(1.4 - te / 2.2);
        const jet = (m, tt, scaleL) => { const u = m.userData; const tl = tt - (u.off || 0); if (tl <= 0) { m.material.opacity = 0; return; }
          const L = scaleL * u.len * (1 - Math.exp(-tl * 1.4)); const w = Math.max(4, L * u.w); m.scale.set(w, Math.max(1, L), w); m.rotation.set(u.el, u.az, 0);
          m.material.opacity = clamp01(tl * 3) * clamp01(1.6 - tl / 7); };
        jets.forEach((m) => jet(m, te, 650)); jetsW.forEach((m) => jet(m, te, 600));
        if (te2 > 0) { jets.forEach((m, k) => { if (k % 2) jet(m, te2, 1100); }); jetsW.forEach((m, k) => { if (k % 2) jet(m, te2, 900); }); }
        vents.forEach((v) => { const tv = te - v.d; v.js.forEach((m) => { jet(m, tv, 220); m.material.opacity *= 0.95; }); });
        plume.forEach((sp, k) => { const u = sp.userData; const age = te - u.born * 0.9; if (age <= 0) { sp.material.opacity = 0; return; }
          const H = 1700 * u.h; const y = H * (1 - Math.exp(-age / 5)) + 40; const top = y / 1700; const rad = 60 + 380 * u.r * (0.3 + top * top * 1.6) * (1 - Math.exp(-age / 6));
          sp.position.set(Math.cos(u.a) * rad + age * 6, y, Math.sin(u.a) * rad); const s = (140 + 420 * top) * u.s * (0.5 + 0.5 * (1 - Math.exp(-age / 2))); sp.scale.set(s, s, 1);
          sp.material.opacity = clamp01(age * 1.5) * 0.92; sp.material.rotation = u.rot * 6;
          sp.material.color.setRGB(0.42 + top * 0.5 + u.r * 0.05, 0.4 + top * 0.5, 0.38 + top * 0.52); });
        surge.forEach((sp) => { const u = sp.userData; const r = 420 * (1 - Math.exp(-te / 2.5)); sp.position.set(Math.cos(u.a) * r, 30 + 20 * u.s, Math.sin(u.a) * r);
          const s = 140 * u.s * (0.4 + clamp01(te / 2)); sp.scale.set(s, s * 0.7, 1); sp.material.opacity = clamp01(te * 2) * 0.9 * clamp01(2 - te / 10); });
        const rr2 = Math.max(te > 0 ? te : 0, te2 > 0 ? te2 : -1); const rad = 340 * (te2 > 0 && te2 < 6 ? te2 : te); ring.scale.setScalar(Math.max(1, rad)); ring.material.opacity = clamp01(1 - rad / 1400) * 0.9;
        bolts.forEach((b) => { const u = b.userData; const f = Math.sin(t * 37 + u.ph) > 0.93 && te > 3 ? 1 : 0; b.material.opacity = f; b.position.set(u.x, u.y, 0); b.scale.setScalar(160); });
      }
      // wave
      const wOn = num("waveOn", t) > 0.5; wave.visible = wOn; spray.forEach((s) => s.visible = wOn);
      if (wOn) { const wz = num("waveZ", t, -900), wh = num("waveH", t, 8); const p = waveGeo.attributes.position;
        for (let iv = 0; iv <= WV; iv++) { const v = iv / WV;   // 0 back ... 1 front base
          let dz, y; if (v < 0.62) { const k = v / 0.62; dz = -140 + 140 * k; y = wh * Math.pow(k, 1.6); }
          else if (v < 0.8) { const k = (v - 0.62) / 0.18; dz = 9 * Math.sin(k * Math.PI * 0.5); y = wh * (1 + 0.08 * Math.sin(k * Math.PI)); }
          else { const k = (v - 0.8) / 0.2; dz = 9 + 7 * k - 4 * k * k; y = wh * (1 - k) * (1 - 0.25 * k); }
          for (let ix = 0; ix <= WX; ix++) { const xx = -1500 + 3000 * ix / WX; const n = 1 + 0.14 * Math.sin(xx * 0.008 + 1.3) + 0.07 * Math.sin(xx * 0.031 + t * 0.6) + 0.04 * Math.sin(xx * 0.09);
            const idx = iv * (WX + 1) + ix; const curl = v >= 0.62 ? 4 * Math.sin(xx * 0.05 + t) * (v - 0.62) : 0;
            p.setXYZ(idx, xx, Math.max(-1, y * n) + (v < 0.05 ? -1 : 0), wz + dz * (0.7 + 0.3 * n) + curl);
            const foamK = v > 0.58 ? clamp01((v - 0.58) / 0.12) * (0.65 + 0.35 * Math.sin(xx * 0.4 + iv)) : 0; wc.copy(wDeep).lerp(wBody, Math.pow(v / 0.62, 0.7) > 1 ? 1 : Math.pow(v / 0.62, 0.7)).lerp(wFoam, clamp01(foamK));
            wcol[idx * 3] = wc.r; wcol[idx * 3 + 1] = wc.g; wcol[idx * 3 + 2] = wc.b; } }
        p.needsUpdate = true; waveGeo.attributes.color.needsUpdate = true; waveGeo.computeVertexNormals();
        spray.forEach((s, k) => { const u = s.userData; const xx = u.x * 700 + pos[0] * 0.5; const ph = (t * 0.8 + u.ph) % 1; s.position.set(xx, wh * (1.05 + ph * 0.6), wz + 4 - ph * 30);
          const sc = (10 + 26 * ph) * u.s * (wh / 10); s.scale.set(sc, sc, 1); s.material.opacity = 0.85 * (1 - ph); }); }
      // flood
      const fz = num("floodZ", t, -999), fy = num("floodY", t, -5); flood.visible = floodFoam.visible = fz > -900;
      if (flood.visible) { const z0 = -120, len = fz - z0; flood.scale.set(1600, len, 1); flood.position.set(0, fy, z0 + len / 2); floodFoam.scale.set(1600, len, 1); floodFoam.position.set(0, fy + 0.05, z0 + len / 2);
        floodTex.offset.set(t * 0.01, -t * 0.45); floodFoam.material.opacity = 0.5;
        floodEdge.visible = true; floodEdge.position.set(0, fy + 0.25, fz - 2); floodEdge.scale.set(1600, 6 + 2 * Math.sin(t * 3), 1); } else floodEdge.visible = false;
      props.forEach((pr) => { const hit = flood.visible && fz > pr.z; if (hit && fy > pr.y - 0.2) { const k = t - (pr.hitT ?? (pr.hitT = t)); pr.obj.position.set(pr.x + Math.sin(pr.ph) * k * 2, fy + (pr.boat ? 0.2 : 0.4), pr.z + k * (pr.boat ? 9 : 12));
          pr.obj.rotation.set(Math.sin(t * 2 + pr.ph) * 0.4, pr.ph + k * 0.6, Math.cos(t * 1.7 + pr.ph) * 0.5); } else { pr.hitT = undefined; pr.obj.position.set(pr.x, pr.y, pr.z); pr.obj.rotation.set(0, pr.obj.rotation.y, pr.boat ? Math.sin(t + pr.ph) * 0.04 : 0); } });
      // siren
      const sir = num("siren", t); const blink = sir > 0.5 ? (0.5 + 0.5 * Math.sin(t * 9)) : 0; sirenLight.material.opacity = blink; sirenLamp.intensity = blink * 3;
      // birds flee inland after the first blast
      const bt = t - eA; birds.forEach((b, k) => { const u = b.userData; b.visible = bt > 0.4 && bt < 30; if (!b.visible) return; const tt = bt - 0.4;
        b.position.set(u.x + Math.sin(u.ph + tt * 0.3) * 6, u.y + tt * 1.5, u.z + tt * u.sp); b.rotation.set(0, 0, 0); b.scale.set(1.6, 1.6 * (0.4 + Math.abs(Math.sin(t * 14 + u.ph))), 1.6); });
      // sun motes around the camera, ash fall
      { const a = moteGeo.attributes.position.array; for (let i = 0; i < 600; i++) { const s = moteSeed[i]; a[i * 3] = pos[0] + (s[0] - 0.5) * 30 + Math.sin(t * 0.3 + s[3] * 9) * 0.6;
        a[i * 3 + 1] = pos[1] - 2 + ((s[1] * 12 + t * 0.15 * (s[3] + 0.2)) % 12); a[i * 3 + 2] = pos[2] + (s[2] - 0.5) * 30; } moteGeo.attributes.position.needsUpdate = true;
        motes.material.opacity = 0.55 * (1 - num("ash", t)); }
      { const ak = num("ash", t); ash.visible = ak > 0.01; ash.material.opacity = ak * 0.85; if (ash.visible) { const a = ashGeo.attributes.position.array; for (let i = 0; i < 900; i++) { const s = ashSeed[i];
        a[i * 3] = pos[0] + (s[0] - 0.5) * 40 + Math.sin(t + s[3] * 9) * 1.5; a[i * 3 + 1] = pos[1] + 14 - (((s[1] * 20 + t * (1.5 + s[3])) % 20)); a[i * 3 + 2] = pos[2] + (s[2] - 0.5) * 40; }
        ashGeo.attributes.position.needsUpdate = true; } }
      // gravity x2 (track gravity 1..2): palms droop, umbrellas tip, waves flatten, clouds sink, boats sit deeper, the plane drops
      const gk = clamp01(num("gravity", t, 1) - 1);
      palms.forEach((p, i) => { p.rotation.z = p.userData.rz + gk * 0.1 * Math.sin(i * 1.7); p.scale.y = p.scale.x * (1 - gk * 0.05); });
      if (gk > 0.001) props.forEach((pr, i) => { if (pr.boat) { pr.obj.position.y = pr.y - gk * 0.35; } else { pr.obj.rotation.z = gk * (0.35 + 0.35 * Math.sin(pr.ph * 3)); pr.obj.position.y = pr.y - gk * 0.08; } });
      seaU.uAmp.value = 1 - 0.65 * gk;
      clouds.forEach((c) => { c.position.y = c.userData.y * (1 - 0.3 * gk); });
      plane.visible = num("planeOn", t) > 0.5; if (plane.visible) { const dr = num("planeDrop", t); plane.position.set(num("planeX", t, -500), 300 - dr * 140, -520); plane.rotation.set(0, 0.25, -dr * 0.22); }
      // people
      const rmood = val("roofMood", t) || "";
      crowd.update(t, (p, tt, i) => { crowdFn(p, tt, i); if (p.hidden) return;
        if (Math.abs(p.x - pos[0]) < 1.0 && Math.abs(p.z - pos[2]) < 1.0 && Math.abs((p.y || 0) - pos[1]) < 3) { p.hidden = true; return; }
        if (p.kind === "roof" && rmood) { p.mode = ["talk", "idle", "talk", "sit", "idle", "talk"][i % 6]; p.face = i % 3 ? 0 : 7; if (p.mode === "sit") p.y = ROOF; }
        if (gk > 0.5) { const h = hash(i + 3.3); if (p.mode !== "lie" && p.mode !== "lieBed") { p.mode = h < 0.45 ? "kneel" : h < 0.75 ? "sit" : "heavy"; } p.face = h < 0.5 ? 3 : h < 0.8 ? 4 : 2; }
        if (rmood === "relief" && gk < 0.5) { const h = hash(i + 5.1); if (p.mode !== "lie") p.mode = h < 0.4 ? "cheer" : h < 0.7 ? "talk" : "idle"; p.face = h < 0.6 ? 7 : 0; } });
      const talk = val("talk", t) || "";
      heroes.update(t, (p) => { const P = val(p.name + "Pos", t); if (!P) { p.hidden = true; return; } p.hidden = false; p.x = P[0]; p.y = P[1]; p.z = P[2];
        p.rot = num(p.name + "Rot", t, 0); p.mode = val(p.name + "Mode", t) || "idle"; const f = num(p.name + "Face", t, 0);
        p.face = talk === p.name && Math.sin(t * 23) > -0.2 ? (f === 4 || f === 3 ? 4 : 6) : Math.round(f); });
      return scene; } };
  });
})();
