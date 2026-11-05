/* What-if cinematic 3D world (three.js r149, UMD). Everything is a pure function of time t.
   Reads window.WI_TRACKS (property tracks compiled by cinema_kit.py) and window.WI_DURATION.
   Sets: "park" (city park + skyline, weather, sun, moon, snow, bunker, volcano) and "space" (Earth). */
(function () {
  const W = 1080, H = 1920;
  const TR = window.WI_TRACKS || {};
  const canvas = document.getElementById("world-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = mulberry32(11);
  const rr = (a, b) => a + (b - a) * R();
  const C = (h) => new THREE.Color(h);
  const smooth = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);

  // ---------------- track evaluation
  function hexToRgb(h) { const c = new THREE.Color(h); return [c.r, c.g, c.b]; }
  function val(name, t) {
    const tr = TR[name]; if (!tr) return undefined;
    let v = tr.init; let seg = null;
    for (const s of tr.segs) { if (s[0] <= t) seg = s; else break; }
    if (!seg) return v;
    const [t0, t1, a, b] = seg;
    if (typeof b === "string" && b[0] !== "#") return b;          // step (set names)
    const k = t1 > t0 ? smooth((t - t0) / (t1 - t0)) : 1;
    if (typeof b === "string") {                                   // colour
      const A = hexToRgb(a), B = hexToRgb(b);
      return new THREE.Color(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k);
    }
    if (Array.isArray(b)) return b.map((x, i) => a[i] + (x - a[i]) * k);
    return a + (b - a) * k;
  }
  const col = (n, t) => { const v = val(n, t); return v instanceof THREE.Color ? v : new THREE.Color(v); };

  // ---------------- canvas textures
  function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
  const winDay = canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#c9d2e0"; g.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 12) for (let x = 5; x < w; x += 12) { g.fillStyle = R() < 0.3 ? "#dfe6f0" : "#9aa6ba"; g.fillRect(x, y, 7, 7); } });
  const winLit = canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 12) for (let x = 5; x < w; x += 12) { if (R() < 0.38) { g.fillStyle = R() < 0.5 ? "#ffd68a" : "#fff1c9"; g.fillRect(x, y, 6, 7); } } });
  const checker = canvasTex(64, 64, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    g.fillStyle = (x + y) % 2 ? "#ffffff" : "#d62f3a"; g.fillRect(x * 8, y * 8, 8, 8); } });
  const glowTex = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,240,200,.65)"); r.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, h); });

  // ================= PARK SET
  const park = new THREE.Scene();
  const skyU = { top: { value: C("#7f8fb3") }, horizon: { value: C("#c9c3cf") }, bottom: { value: C("#3c4a2f") } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h*1.8,0.0,1.0),0.75)) : mix(horizon, bottom, clamp(-h*5.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }"
  }));
  park.add(sky);
  park.fog = new THREE.Fog(0xc9c3cf, 120, 1400);
  const hemi = new THREE.HemisphereLight(0xdfe6ff, 0x3a4a2a, 0.9); park.add(hemi);
  const sunLight = new THREE.DirectionalLight(0xffe2b0, 1.1); park.add(sunLight);
  const coldLight = new THREE.DirectionalLight(0x9fb7ff, 0.0); coldLight.position.set(-50, 80, 40); park.add(coldLight);

  // ground, pond, path
  const grassTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = 110 + Math.floor(R() * 40); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * w, R() * h, 3, 3); } });
  grassTex.repeat.set(220, 220);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x3f7a2c, map: grassTex });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400, 1, 1), groundMat); ground.rotation.x = -Math.PI / 2; park.add(ground);
  const pondMat = new THREE.MeshLambertMaterial({ color: 0x3b6e8f });
  const pond = new THREE.Mesh(new THREE.CircleGeometry(14, 40), pondMat); pond.rotation.x = -Math.PI / 2; pond.position.set(-16, 0.04, -34); park.add(pond);
  const blanket = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), new THREE.MeshLambertMaterial({ map: checker }));
  blanket.rotation.x = -Math.PI / 2; blanket.rotation.z = 0.25; blanket.position.set(1.6, 0.05, -7.5); park.add(blanket);

  // people
  const skinCols = [0xf2c9a0, 0xd9a273, 0x9c6b46, 0x6b4630, 0xf5d7b8];
  const shirtCols = [0xe5e7eb, 0x2f5fb3, 0xe8d24a, 0xc23b3b, 0x3b7a57, 0x8b5cf6, 0xf59e0b, 0x1f2937];
  const people = [];
  const box = (w, h, d, c) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: c }));
  const blob = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
  function person(x, z, sitting, rot) {
    const g = new THREE.Group(); const sc = shirtCols[Math.floor(R() * shirtCols.length)], sk = skinCols[Math.floor(R() * skinCols.length)];
    const pants = R() < 0.5 ? 0x2b3245 : 0x5b4a3a;
    if (sitting) {
      const legs = box(0.42, 0.22, 0.95, pants); legs.position.set(0, 0.12, 0.38); g.add(legs);
      const torso = box(0.55, 0.7, 0.32, sc); torso.position.set(0, 0.55, 0); g.add(torso);
      const head = box(0.34, 0.36, 0.34, sk); head.position.set(0, 1.12, 0); g.add(head);
      const hair = box(0.36, 0.12, 0.36, 0x3b2a1f); hair.position.set(0, 1.33, 0); g.add(hair);
    } else {
      for (const s of [-0.12, 0.12]) { const l = box(0.18, 0.85, 0.2, pants); l.position.set(s, 0.43, 0); g.add(l); }
      const torso = box(0.55, 0.72, 0.3, sc); torso.position.set(0, 1.22, 0); g.add(torso);
      for (const s of [-0.36, 0.36]) { const a = box(0.15, 0.68, 0.17, sc); a.position.set(s, 1.2, 0); g.add(a); }
      const head = box(0.34, 0.36, 0.34, sk); head.position.set(0, 1.8, 0); g.add(head);
      const hair = box(0.36, 0.12, 0.36, R() < 0.3 ? 0xd9b26f : 0x2f2118); hair.position.set(0, 2.01, 0); g.add(hair);
    }
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), blob); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03; g.add(sh);
    g.position.set(x, 0, z); g.rotation.y = rot; park.add(g); people.push(g); return g;
  }
  person(0.6, -7.6, true, 0.4); person(2.4, -8.3, true, -0.6); person(1.9, -6.6, true, 2.6);
  for (let i = 0; i < 46; i++) person(rr(-34, 34), rr(-14, -70), R() < 0.25, rr(0, 6.28));

  // trees
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4b3424 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x2f5a25, flatShading: true });
  const trees = new THREE.Group(); park.add(trees);
  function tree(x, z, s) {
    const g = new THREE.Group();
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 3.2 * s, 6), trunkMat); tr.position.y = 1.6 * s; g.add(tr);
    for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(1.6, 2.4) * s, 0), leafMat);
      c.position.set(rr(-0.9, 0.9) * s, (3.6 + rr(0, 1.4)) * s, rr(-0.9, 0.9) * s); c.rotation.set(R() * 3, R() * 3, R() * 3); g.add(c); }
    g.position.set(x, 0, z); trees.add(g);
  }
  for (let i = 0; i < 160; i++) { const z = rr(-48, -120); tree(rr(-140, 140), z, rr(1.0, 1.6)); }
  for (let i = 0; i < 40; i++) { const side = R() < 0.5 ? -1 : 1; tree(side * rr(22, 70), rr(-12, -48), rr(1.0, 1.5)); }

  // skyline
  const cityMat = new THREE.MeshLambertMaterial({ map: winDay, emissiveMap: winLit, emissive: 0xffffff, emissiveIntensity: 0 });
  function tower(x, z, w, h, d) {
    let y = 0, cw = w, cd = d, ch = h;
    for (let k = 0; k < 3 && ch > 10; k++) {
      const seg = k === 2 ? ch : ch * rr(0.45, 0.7);
      const g = new THREE.BoxGeometry(cw, seg, cd); const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * cw / 7, uv.getY(i) * seg / 7);
      const m = new THREE.Mesh(g, cityMat); m.position.set(x, y + seg / 2, z); park.add(m);
      y += seg; ch -= seg; cw *= rr(0.6, 0.85); cd *= rr(0.6, 0.85);
      if (R() < 0.4) break;
    }
  }
  const city = new THREE.Group(); park.add(city);
  const parkAdd = park.add.bind(park);
  park.add = (o) => city.add(o);                 // towers go into the city group
  for (let i = 0; i < 26; i++) { const x = rr(-420, 420); const z = rr(-330, -560);
    const tall = R() < 0.35; tower(x, z, rr(26, 46), tall ? rr(230, 420) : rr(90, 200), rr(26, 44)); }
  park.add = parkAdd;

  // sun, moon, stars
  const sunGroup = new THREE.Group(); park.add(sunGroup);
  const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff1c4, fog: false }));
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd28a, transparent: true, depthWrite: false, fog: false }));
  sunGlow.scale.set(220, 220, 1); sunGroup.add(sunGlow); sunGroup.add(sunDisc);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xe5e7eb, fog: false });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 16), moonMat); park.add(moon);
  const starGeo = new THREE.BufferGeometry(); const sp = [];
  for (let i = 0; i < 1600; i++) { const th = R() * 6.283, ph = Math.acos(rr(0.05, 1)); sp.push(1300 * Math.sin(ph) * Math.cos(th), 1300 * Math.cos(ph), 1300 * Math.sin(ph) * Math.sin(th)); }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  park.add(new THREE.Points(starGeo, starMat));

  // snow
  const NS = 2600, snowGeo = new THREE.BufferGeometry(), snow0 = new Float32Array(NS * 3), snowPos = new Float32Array(NS * 3);
  for (let i = 0; i < NS; i++) { snow0[i * 3] = rr(-45, 45); snow0[i * 3 + 1] = rr(0, 40); snow0[i * 3 + 2] = rr(-70, 12); }
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 3.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
  park.add(new THREE.Points(snowGeo, snowMat));

  // bunker (month 3)
  const bunker = new THREE.Group(); park.add(bunker); bunker.position.set(5, 0, -15);
  const bBody = box(4.5, 1.6, 3.5, 0x7b7f86); bBody.position.y = 0.8; bunker.add(bBody);
  const doorMat = new THREE.MeshBasicMaterial({ color: 0xffa040 });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.2), doorMat); door.position.set(0, 0.7, 1.76); bunker.add(door);
  const bLight = new THREE.PointLight(0xff9a40, 0, 18); bLight.position.set(0, 1.4, 3); bunker.add(bLight);

  // volcano (far away, twist)
  const volcano = new THREE.Group(); park.add(volcano); volcano.position.set(-260, 0, -700);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(260, 230, 10, 1, true), new THREE.MeshLambertMaterial({ color: 0x5b4a3e, flatShading: true }));
  cone.position.y = 115; volcano.add(cone);
  const crater = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff5a1f, fog: false })); crater.position.y = 225; volcano.add(crater);
  const ash = []; const ashMat = new THREE.MeshLambertMaterial({ color: 0x55504c, transparent: true, opacity: 0.9, flatShading: true });
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(40, 90), 1), ashMat);
    m.userData = { x: rr(-80, 80), y: 240 + i * 22, z: rr(-60, 60), k: i / 26 }; volcano.add(m); ash.push(m); }

  // ================= SPACE SET
  const space = new THREE.Scene();
  const earthTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#1d4f8f"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = R() < 0.6 ? "#3f7a3a" : "#8a7a4f"; g.beginPath();
      g.ellipse(rr(0, w), rr(30, h - 30), rr(10, 60), rr(8, 35), rr(0, 3), 0, 6.283); g.fill(); }
    g.fillStyle = "#f4f8ff"; g.fillRect(0, 0, w, 18); g.fillRect(0, h - 22, w, 22); });
  const earthMat = new THREE.MeshLambertMaterial({ map: earthTex });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(10, 64, 32), earthMat); space.add(earth);
  const iceMat = new THREE.MeshLambertMaterial({ color: 0xeef6ff, transparent: true, opacity: 0 });
  const ice = new THREE.Mesh(new THREE.SphereGeometry(10.05, 64, 32), iceMat); space.add(ice);
  const spaceAmb = new THREE.AmbientLight(0x8fa8ff, 0.2); space.add(spaceAmb);
  const spaceSun = new THREE.DirectionalLight(0xffffff, 0); spaceSun.position.set(-30, 10, 20); space.add(spaceSun);
  const rim = new THREE.DirectionalLight(0x9fc1ff, 0.55); rim.position.set(30, 12, -25); space.add(rim);
  space.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, sizeAttenuation: false })));

  const cam = new THREE.PerspectiveCamera(52, W / H, 0.1, 4000);

  // ================= draw(t)
  function draw(t) {
    const set = val("set", t) || "park";
    if (set === "space") {
      const p = val("spaceCam", t) || [0, 0, 34];
      cam.position.set(p[0], p[1], p[2]); cam.lookAt(0, 0, 0);
      earth.rotation.y = t * 0.05; ice.rotation.y = earth.rotation.y;
      iceMat.opacity = val("earthIce", t) || 0;
      spaceSun.intensity = val("earthSun", t) || 0;
      spaceAmb.intensity = val("earthAmb", t) ?? 0.2;
      renderer.render(space, cam);
      return;
    }
    const p = val("camPos", t) || [0, 1.7, 6], l = val("camLook", t) || [0, 6, -60];
    const sway = 0.05;
    cam.position.set(p[0] + Math.sin(t * 0.37) * sway, p[1] + Math.sin(t * 0.53) * sway * 0.6, p[2]);
    cam.lookAt(l[0], l[1], l[2]);
    cam.fov = val("fov", t) || 52; cam.updateProjectionMatrix();

    skyU.top.value.copy(col("skyTop", t)); skyU.horizon.value.copy(col("skyHorizon", t)); skyU.bottom.value.copy(col("skyBottom", t));
    park.fog.color.copy(col("skyHorizon", t));
    park.fog.far = val("fogFar", t) || 1400; park.fog.near = park.fog.far * 0.09;

    const sunVis = val("sun", t); const sd = val("sunDir", t) || [-0.4, 0.22, -1];
    const v = new THREE.Vector3(sd[0], sd[1], sd[2]).normalize();
    sunGroup.position.copy(v.clone().multiplyScalar(900)); sunGroup.scale.setScalar(Math.max(0.001, sunVis));
    sunGroup.visible = sunVis > 0.005;
    sunLight.position.copy(v.clone().multiplyScalar(100));
    sunLight.intensity = (val("light", t) ?? 1) * 1.1;
    sunLight.color.copy(col("lightColor", t));
    hemi.intensity = val("ambient", t) ?? 0.9;
    hemi.color.copy(col("ambientColor", t));
    coldLight.intensity = val("cold", t) || 0;

    const frost = val("frost", t) || 0;
    groundMat.color.copy(new THREE.Color(0x3f7a2c).lerp(new THREE.Color(0xe9f0f8), frost));
    leafMat.color.copy(new THREE.Color(0x2f5a25).lerp(new THREE.Color(0xd7e2ee), frost * 0.85));
    pondMat.color.copy(new THREE.Color(0x3b6e8f).lerp(new THREE.Color(0xcfe6f7), val("pondIce", t) || 0));
    blanket.visible = (val("people", t) ?? 1) > 0.5;
    cityMat.emissiveIntensity = val("cityLights", t) || 0;
    city.visible = (val("city", t) ?? 1) > 0.5;

    const pv = val("people", t) ?? 1;
    people.forEach((g, i) => { g.visible = (i + 0.5) / people.length < pv; });

    const ml = val("moon", t) || 0; const mp = val("moonPos", t) || [120, 260, -700];
    moon.position.set(mp[0], mp[1], mp[2]); moonMat.color.setRGB(0.06 + 0.86 * ml, 0.07 + 0.86 * ml, 0.09 + 0.86 * ml);
    moon.visible = (val("moonShow", t) || 0) > 0.01;
    starMat.opacity = val("stars", t) || 0;

    const sn = val("snow", t) || 0; snowMat.opacity = sn;
    for (let i = 0; i < NS; i++) {
      const y = snow0[i * 3 + 1] - t * 2.3; snowPos[i * 3 + 1] = ((y % 40) + 40) % 40;
      snowPos[i * 3] = snow0[i * 3] + Math.sin(t * 0.8 + i) * 0.6; snowPos[i * 3 + 2] = snow0[i * 3 + 2];
    }
    snowGeo.attributes.position.needsUpdate = true;

    const bk = val("bunker", t) || 0; bunker.visible = bk > 0.01; bLight.intensity = bk * 2.2;
    doorMat.color.setRGB(1, 0.62 * bk + 0.1, 0.25 * bk);

    const vo = val("volcano", t) || 0; volcano.visible = vo > 0.01;
    const as = val("ash", t) || 0;
    ash.forEach((m) => { const u = m.userData; const k = Math.max(0, Math.min(1, as * 1.4 - u.k * 0.6));
      m.visible = k > 0.01; m.scale.setScalar(Math.max(0.01, k)); m.position.set(u.x * (1 + k), u.y * (0.6 + k * 0.8), u.z); });

    renderer.render(park, cam);
  }
  window.WI_DRAW = draw;
  draw(0);
})();
