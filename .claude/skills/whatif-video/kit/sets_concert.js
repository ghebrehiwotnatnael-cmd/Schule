/* "concert": one concert that grows from an empty stadium to all of humanity.
   A stadium with a red neon stage, the artist (blocky, red blazer), a crowd of blocky fans on the field, the stands filling up,
   a city around it whose streets fill with people, a huge map landscape, and a crowd disc whose radius follows the audience
   (4 people per m^2: r = sqrt(N / (4 pi))).  Tracks: audience (number of people), artistMode, artistFace, heat (0..1 body-heat
   cloud), rain (0..1), jump (0..1 everyone jumps), beams (0..1 stage lights), skyTop/Horizon via sky(), plus env/light tracks.
   The camera's far plane must be raised with the "camFar" track for the high shots. */
window.CONCERT_MODELS = [];
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];
  B.push(function (WI) {
    const { THREE, R, rr, num, col, val, glowTex, canvasTex } = WI;
    const K = window.WI_COMMON(WI), MK = window.WI_MODELKIT(WI), BL = window.WI_BLOCKY(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene); const env = MK.envs(scene);
    const skyMesh = scene.children.find((o) => o.isMesh && o.geometry.type === "SphereGeometry");
    const std = MK.std, clamp01 = WI.clamp01;
    const SR = 75;                                   // stadium inner radius (m)

    // ---------------------------------------------------------------- textures
    const crowdTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#5a4868"; g.fillRect(0, 0, w, h);
      const cols = ["#ff4d6d", "#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#ffffff", "#8338ec", "#3a86ff", "#fb5607", "#f2c9a5", "#6b4129", "#1b1b1b"];
      for (let gy = 0; gy < 64; gy++) for (let gx = 0; gx < 64; gx++) { const x = gx * 8 + rr(-1, 1), y = gy * 8 + rr(-1, 1); g.fillStyle = cols[Math.floor(R() * cols.length)]; g.fillRect(x + 1, y + 3, 6, 5); g.fillStyle = R() < 0.5 ? "#f2c9a5" : "#8d5a3a"; g.fillRect(x + 2, y, 4, 3); } });
    crowdTex.anisotropy = 8;
    const mapTex = canvasTex(2048, 2048, (g, w, h) => { g.fillStyle = "#8db86a"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { g.fillStyle = ["#7aa85a", "#a3c27a", "#c9c27a", "#6f9a4c", "#b8cf8a"][i % 5]; g.save(); g.translate(R() * w, R() * h); g.rotate(R() * 3); g.fillRect(-rr(20, 70), -rr(15, 50), rr(40, 140), rr(30, 100)); g.restore(); }
      for (let i = 0; i < 60; i++) { g.fillStyle = "#3d7a3a"; g.beginPath(); g.ellipse(R() * w, R() * h, rr(20, 90), rr(15, 60), R() * 3, 0, 7); g.fill(); }
      for (let i = 0; i < 40; i++) { g.fillStyle = "#b9b4ac"; g.beginPath(); g.ellipse(R() * w, R() * h, rr(8, 30), rr(8, 26), 0, 0, 7); g.fill(); }
      g.strokeStyle = "#5aa7d6"; g.lineWidth = 10; g.beginPath(); g.moveTo(0, h * 0.62); for (let x = 0; x <= w; x += 32) g.lineTo(x, h * 0.62 + Math.sin(x * 0.006) * 120 + Math.sin(x * 0.017) * 40); g.stroke();
      g.fillStyle = "#4e9fd0"; g.beginPath(); g.ellipse(w * 0.2, h * 0.25, 160, 90, 0.4, 0, 7); g.fill();
      g.strokeStyle = "#d9d2c4"; g.lineWidth = 4; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(i * 0.45) * w, h / 2 + Math.sin(i * 0.45) * h); g.stroke(); } });
    mapTex.anisotropy = 8;
    const neonTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#0b0306"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) { g.strokeStyle = i % 2 ? "#ff1f3d" : "#ff6b35"; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 30 + i * 26); g.lineTo(w, 30 + i * 26 + Math.sin(i) * 10); g.stroke(); }
      g.fillStyle = "#ff2b4a"; g.font = "bold 70px Arial"; g.textAlign = "center"; g.fillText("LIVE TONIGHT", w / 2, h / 2 + 24); });
    const cloudTex = canvasTex(256, 256, (g) => { for (let i = 0; i < 30; i++) { const x = rr(50, 206), y = rr(70, 190), r = rr(26, 60);
      const gr = g.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(1, "rgba(230,232,240,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });

    // ---------------------------------------------------------------- landscape + crowd disc
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400000, 400000), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 1 }));
    mapTex.repeat.set(6, 6); ground.rotation.x = -Math.PI / 2; ground.position.y = -1.5; ground.receiveShadow = true; ground.userData.noShadow = true; scene.add(ground);
    const near = new THREE.Mesh(new THREE.CircleGeometry(3200, 64), new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 1 })); near.rotation.x = -Math.PI / 2; near.position.y = -0.4; near.userData.noShadow = true; scene.add(near);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 128), new THREE.MeshStandardMaterial({ map: crowdTex, roughness: 1, transparent: true, opacity: 1 }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.3; disc.userData.noShadow = true; scene.add(disc);
    const discEdge = new THREE.Mesh(new THREE.RingGeometry(0.97, 1.03, 128), new THREE.MeshBasicMaterial({ color: 0xffd38a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    discEdge.rotation.x = -Math.PI / 2; discEdge.position.y = 0.8; scene.add(discEdge);
    // city blocks around the stadium (streets stay free for the crowd)
    const blocks = []; { const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0); const n = 2600;
      const mesh = new THREE.InstancedMesh(geo, std(0xffffff, { roughness: 0.8 }), n); const M = new THREE.Matrix4(), c = new THREE.Color(); let k = 0;
      const cols = [0xe8dcc8, 0xc9b79c, 0xd8d2c8, 0xb85c38, 0x8d99ae, 0xf2e9e4, 0x9a8c98, 0xc4a484];
      for (let gx = -40; gx <= 40 && k < n; gx++) for (let gz = -40; gz <= 40 && k < n; gz++) { const x = gx * 42, z = gz * 42; const d = Math.hypot(x, z); if (d < SR + 70 || d > 1700) continue;
        const hgt = rr(8, 30) * (d < 500 ? 1.6 : 1); M.makeScale(rr(22, 30), hgt, rr(22, 30)); M.setPosition(x + rr(-3, 3), 0, z + rr(-3, 3)); mesh.setMatrixAt(k, M);
        mesh.setColorAt(k, c.setHex(cols[k % cols.length])); k++; }
      mesh.count = k; mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); blocks.push(mesh); }
    // ---------------------------------------------------------------- stadium
    const prof = []; for (let i = 0; i <= 12; i++) { const u = i / 12; prof.push(new THREE.Vector2(SR + u * 48, 2 + u * 34)); } prof.push(new THREE.Vector2(SR + 50, 40)); prof.push(new THREE.Vector2(SR + 52, 0));
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), new THREE.MeshStandardMaterial({ color: 0xd9d9de, roughness: 0.9, side: THREE.DoubleSide })); scene.add(bowl);
    const stands = new THREE.Mesh(new THREE.LatheGeometry(prof.slice(0, 13).map((p) => new THREE.Vector2(p.x - 0.3, p.y + 0.4)), 96),
      new THREE.MeshStandardMaterial({ map: crowdTex.clone(), roughness: 1, transparent: true, opacity: 0, side: THREE.DoubleSide })); stands.material.map.needsUpdate = true; stands.material.map.repeat.set(160, 14); scene.add(stands);
    const roofRing = new THREE.Mesh(new THREE.TorusGeometry(SR + 46, 2.2, 8, 96), std(0xf2f2f2, { metalness: 0.4 })); roofRing.rotation.x = Math.PI / 2; roofRing.position.y = 41; scene.add(roofRing);
    const field = new THREE.Mesh(new THREE.CircleGeometry(SR, 64), std(0x3f8f3f)); field.rotation.x = -Math.PI / 2; field.position.y = 0.03; scene.add(field);
    const fieldCrowd = new THREE.Mesh(new THREE.CircleGeometry(SR - 1, 64), new THREE.MeshStandardMaterial({ map: crowdTex.clone(), roughness: 1, transparent: true, opacity: 0 }));
    fieldCrowd.material.map.needsUpdate = true; fieldCrowd.material.map.repeat.set(9, 9); fieldCrowd.rotation.x = -Math.PI / 2; fieldCrowd.position.y = 0.08; scene.add(fieldCrowd);
    // stage
    const stage = new THREE.Group(); stage.position.set(0, 0, -SR + 12); scene.add(stage);
    { const deck = new THREE.Mesh(new THREE.BoxGeometry(30, 2.4, 14), std(0x1c1c22, { roughness: 0.5 })); deck.position.y = 1.2; stage.add(deck);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(34, 16), new THREE.MeshBasicMaterial({ map: neonTex })); wall.position.set(0, 10.4, -6.8); stage.add(wall);
      const runway = new THREE.Mesh(new THREE.BoxGeometry(4, 2.3, 26), std(0x1c1c22)); runway.position.set(0, 1.15, 18); stage.add(runway);
      [-17, 17].forEach((x) => { const tw = new THREE.Mesh(new THREE.BoxGeometry(1.4, 22, 1.4), std(0x2a2a30, { metalness: 0.6 })); tw.position.set(x, 11, -5); stage.add(tw); }); }
    const beams = Array.from({ length: 10 }, (_, i) => { const g = new THREE.ConeGeometry(4, 90, 24, 1, true); g.translate(0, -45, 0);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: i % 3 ? 0xff2b4a : 0xfff1d6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      m.position.set(-15 + (i % 5) * 7.5, 22, -SR + 8 + (i < 5 ? 0 : 3)); m.userData.ph = i; m.userData.noShadow = true; scene.add(m); return m; });
    const stageGlow = new THREE.PointLight(0xff2b4a, 0, 80, 2); stageGlow.position.set(0, 12, -SR + 20); scene.add(stageGlow);
    const keyLight = new THREE.SpotLight(0xffd2b8, 1.1, 40, 0.35, 0.6, 1.5); keyLight.position.set(1.5, 9, -SR + 24); keyLight.target.position.set(0, 4, -SR + 14); scene.add(keyLight); scene.add(keyLight.target);
    // fans on the field, facing the stage
    const fans = []; for (let i = 0; i < 1400; i++) { const a = rr(-1.2, 1.2), d = rr(18, SR - 6); const x = Math.sin(a) * d * 0.95, z = -SR + 26 + d * 0.95 * Math.cos(a) * 0.9;
      if (Math.abs(x) < 3.5 && z < -SR + 46) continue; fans.push({ x, z, y: 0, rot: Math.PI + Math.atan2(x, z + SR - 12) * 0 + rr(-0.25, 0.25) + Math.PI, mode: "cheer", order: R() }); }
    fans.forEach((f) => { f.rot = Math.atan2(0 - f.x, (-SR + 12) - f.z); });
    const fanCrowd = BL.crowd(scene, fans);
    const artist = BL.crowd(scene, [{ name: "artist", male: true, hair: new THREE.Color("#0d0907"), afro: true, mustache: true, glasses: true, tie: true, tieCol: new THREE.Color("#0b0b0d"),
      shirt: new THREE.Color("#e3122b"), longSleeve: true, legs: new THREE.Color("#121214"), skin: WI.BLOCKY_COLORS.SKIN[4], s: 1.1, face: 6 }]);
    // glitter on the red blazer + a mic stand
    const glit = [0, 1, 2].map((k) => { const n = 70, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const side = R() < 0.5 ? -1 : 1;
        a.set([side * rr(0.08, 0.27) * 1.1, 2.4 + rr(0.82, 1.48) * 1.1, -SR + 14 + 0.15 * 1.1], i * 3); }
      const pts = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(a, 3)),
        new THREE.PointsMaterial({ map: glowTex, color: 0xffd0d6, size: 0.07, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      pts.userData.k = k; pts.userData.noShadow = true; scene.add(pts); return pts; });
    const micStand = new THREE.Group(); scene.add(micStand); { const metal = std(0x18181c, { metalness: 0.8, roughness: 0.3 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.05, 16), metal); base.position.set(-0.75, 2.42, -SR + 14.55); micStand.add(base);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.1, 8), metal); pole.position.set(-0.6, 3.45, -SR + 14.5); pole.rotation.z = -0.22; pole.rotation.x = 0.12; micStand.add(pole);
      const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.03, 0.22, 12), metal); mic.position.set(-0.36, 4.42, -SR + 14.62); mic.rotation.z = -1.0; micStand.add(mic);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), std(0x2a2a30, { metalness: 0.6, roughness: 0.5 })); head.position.set(-0.27, 4.47, -SR + 14.64); micStand.add(head); }
    // body-heat cloud + rain
    const heat = Array.from({ length: 40 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0, fog: false }));
      sp.userData = { a: R() * 6.28, d: R(), h: rr(0.8, 1.2), s: rr(0.8, 1.3) }; scene.add(sp); return sp; });

    return { name: "concert", scene, update(t, look, pos) {
      sky(t, num, col); env(t);
      if (skyMesh) { skyMesh.position.set(pos[0], pos[1] * 0.98, pos[2]); const sc = Math.max(1, (pos[1] + 50) / 900); skyMesh.scale.setScalar(sc); }
      scene.fog.far = num("fogFar", t, 3000); scene.fog.near = scene.fog.far * 0.1;
      const alt = pos[1]; L.update(t, num, col, new THREE.Vector3(look[0] * 0.5 + pos[0] * 0.5, 0, look[2] * 0.5 + pos[2] * 0.5), Math.min(400, Math.max(30, alt * 1.2)));
      L.sun.castShadow = alt < 600;
      const N = num("audience", t, 0);
      const stadiumCap = 80000, fill = clamp01(N / stadiumCap);
      fieldCrowd.material.opacity = clamp01(fill * 1.6) * (alt > 40 ? 1 : 0.0) + (alt > 40 ? 0 : 0);
      stands.material.opacity = clamp01((fill - 0.15) * 1.4);
      const outside = Math.max(0, N - stadiumCap); const r = outside > 0 ? Math.sqrt(outside / (4 * Math.PI) + (SR + 52) * (SR + 52)) : 0;
      disc.visible = discEdge.visible = r > SR + 53; if (disc.visible) { disc.scale.setScalar(r); discEdge.scale.setScalar(r); const rep = r / 16; disc.material.map.repeat.set(rep, rep); discEdge.material.opacity = 0.35 + 0.25 * Math.sin(t * 3); }
      blocks.forEach((b) => { b.visible = alt < 9000; });
      // stage show
      const bm = num("beams", t, 1); beams.forEach((b) => { const u = b.userData.ph; b.material.opacity = bm * (0.18 + 0.1 * Math.sin(t * 3 + u)); b.rotation.set(Math.sin(t * 0.7 + u) * 0.5 + Math.PI, 0, Math.cos(t * 0.9 + u * 1.3) * 0.5); });
      stageGlow.intensity = bm * (2.5 + Math.sin(t * 6));
      const jmp = num("jump", t);
      fanCrowd.update(t, (p, tt, i) => { p.hidden = p.order > clamp01(N / 6000) || alt > 900; p.mode = jmp > 0.5 ? "jump" : (i % 3 ? "cheer" : "wave"); p.face = i % 4 ? 7 : 0; });
      glit.forEach((g) => { g.visible = Math.sin(t * 13 + g.userData.k * 2.1) > 0.1; });
      micStand.visible = (val("artistMode", t) || "sing") === "micstand";
      artist.update(t, (p) => { p.x = 0; p.y = 2.4; p.z = -SR + 14; p.rot = 0; p.mode = val("artistMode", t) || "sing"; const f = num("artistFace", t, 6); p.face = Math.round(f) === 6 && Math.sin(t * 9) < 0 ? 0 : Math.round(f); });
      // heat cloud
      const hk = num("heat", t); heat.forEach((h) => { const u = h.userData; h.visible = hk > 0.01; if (!h.visible) return; const rr2 = Math.max(r, 400);
        h.position.set(Math.cos(u.a) * rr2 * 0.5 * u.d, Math.min(2500, rr2 * 0.12) * u.h, Math.sin(u.a) * rr2 * 0.5 * u.d); const s = rr2 * 0.32 * u.s; h.scale.set(s, s * 0.5, 1); h.material.opacity = hk * 0.55; });
      return scene; } };
  });
})();
