/* Shared building blocks for pluggable sets. Loaded before the set files and world.js.
   Each helper receives WI (THREE, R, rr, canvasTex, box, ...) from world.js. */
window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];
window.WI_COMMON = function (WI) {
  const { THREE, R, rr, canvasTex, glowTex } = WI;
  const C = {};
  C.sky = function (scene) {
    const u = { top: { value: new THREE.Color("#7f8fb3") }, horizon: { value: new THREE.Color("#e9c9b0") }, bottom: { value: new THREE.Color("#3c4a2f") } };
    const m = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), new THREE.ShaderMaterial({ uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h*1.8,0.0,1.0),0.75)) : mix(horizon, bottom, clamp(-h*5.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }" }));
    m.userData.noShadow = true; scene.add(m);
    scene.fog = new THREE.Fog(0xe9c9b0, 150, 1600);
    return function (t, num, col) {
      u.top.value.copy(col("skyTop", t)); u.horizon.value.copy(col("skyHorizon", t)); u.bottom.value.copy(col("skyBottom", t));
      scene.fog.color.copy(col("skyHorizon", t)); scene.fog.far = num("fogFar", t, 1400); scene.fog.near = scene.fog.far * 0.09;
    };
  };
  C.lights = function (scene) {
    const hemi = new THREE.HemisphereLight(0xdfe6ff, 0x3a4a2a, 0.85); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe2b0, 1.1); scene.add(sun); scene.add(sun.target);
    return { hemi, sun, update(t, num, col, target, size) {
      const sd = WI.val("sunDir", t) || [0.3, 0.3, -1]; const v = new THREE.Vector3(sd[0], sd[1], sd[2]).normalize();
      sun.position.copy(v.multiplyScalar(100)); sun.intensity = num("light", t, 1) * 1.1; sun.color.copy(col("lightColor", t));
      hemi.intensity = num("ambient", t, 0.9); hemi.color.copy(col("ambientColor", t));
      WI.fitShadow(sun, target, size || 30);
    } };
  };
  C.text = function (w, h, draw) { const t = canvasTex(w, h, draw); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
  C.mat = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o));
  C.room = function (scene, w, h, d, wall, floor, pos) {
    const g = new THREE.Group(); g.position.copy(pos || new THREE.Vector3());
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), C.mat(floor)); fl.rotation.x = -Math.PI / 2; g.add(fl);
    const ce = new THREE.Mesh(new THREE.PlaneGeometry(w, d), C.mat(0xf3efe8)); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce);
    const wm = C.mat(wall);
    [[0, h / 2, -d / 2, 0], [0, h / 2, d / 2, Math.PI], [-w / 2, h / 2, 0, Math.PI / 2], [w / 2, h / 2, 0, -Math.PI / 2]].forEach(([x, y, z, r], i) => {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(i < 2 ? w : d, h), wm); pl.position.set(x, y, z); pl.rotation.y = r; g.add(pl); });
    scene.add(g); return g;
  };
  // ---- insects: bees, butterflies, a mosquito swarm; amount 0..1, they pop out with a little glow
  C.insects = function (scene, o) {
    const items = [];
    const stripe = canvasTex(32, 32, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#1d1a14" : "#f4b81c"; g.fillRect(i * 8, 0, 8, 32); } });
    const beeMat = new THREE.MeshLambertMaterial({ map: stripe }), wingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    const popMat = () => new THREE.SpriteMaterial({ map: glowTex, color: 0xfff6d8, transparent: true, depthWrite: false, opacity: 0 });
    function bee(s) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.08), beeMat); b.scale.setScalar(s); g.add(b);
      const ws = []; for (const k of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.04), wingMat); w.position.set(0, 0.045 * s, 0.04 * k * s); w.scale.setScalar(s); g.add(w); ws.push(w); }
      g.userData.wings = ws; return g; }
    const bcols = ["#f97316", "#38bdf8", "#facc15", "#f472b6", "#a78bfa", "#ffffff"];
    function butterfly(s) { const g = new THREE.Group(); const c = bcols[Math.floor(R() * bcols.length)];
      const tx = canvasTex(64, 64, (x) => { x.fillStyle = c; x.beginPath(); x.ellipse(32, 26, 30, 22, 0, 0, 6.3); x.fill(); x.ellipse(32, 50, 20, 13, 0, 0, 6.3); x.fill();
        x.fillStyle = "rgba(0,0,0,.6)"; x.beginPath(); x.arc(30, 22, 6, 0, 6.3); x.fill(); });
      const m = new THREE.MeshBasicMaterial({ map: tx, transparent: true, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.3 }); const ws = [];
      for (const k of [-1, 1]) { const piv = new THREE.Group(); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.12 * s, 0.12 * s), m); w.position.x = 0.06 * s * k; piv.add(w); piv.userData.k = k; g.add(piv); ws.push(piv); }
      g.userData.wings = ws; return g; }
    const c = o.center, r = o.radius;
    for (let i = 0; i < (o.bees || 0); i++) { const g = bee(o.beeScale || 1); g.userData.kind = "bee"; items.push(g); }
    for (let i = 0; i < (o.butterflies || 0); i++) { const g = butterfly(o.bScale || 1); g.userData.kind = "fly"; items.push(g); }
    items.forEach((g, i) => { Object.assign(g.userData, { ph: R() * 6.28, a: rr(0.25, 0.7), b: rr(0.3, 0.9), rr: rr(0.3, 1) * r, h: rr(0.3, o.height || 1.6), order: R() });
      const p = new THREE.Sprite(popMat()); p.scale.setScalar(0.5); g.userData.pop = p; scene.add(p); scene.add(g); });
    // mosquito swarm
    const NM = o.mosquitos || 0, mg = new THREE.BufferGeometry(), mpos = new Float32Array(NM * 3), m0 = [];
    for (let i = 0; i < NM; i++) m0.push([rr(-1, 1), rr(-1, 1), rr(-1, 1), R() * 6]);
    mg.setAttribute("position", new THREE.BufferAttribute(mpos, 3));
    const mm = new THREE.PointsMaterial({ color: 0x1b1b1b, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.9 });
    const swarm = new THREE.Points(mg, mm); swarm.frustumCulled = false; if (NM) scene.add(swarm);
    return function update(t, amount) {
      items.forEach((g) => { const u = g.userData; const k = Math.max(0, Math.min(1, (amount - u.order * 0.15) / 0.85));
        const x = c.x + Math.sin(t * u.a + u.ph) * u.rr, z = c.z + Math.cos(t * u.b + u.ph * 1.3) * u.rr, y = c.y + u.h + Math.sin(t * 2.1 + u.ph) * 0.15;
        g.position.set(x, y, z); g.rotation.y = -t * u.a + u.ph; g.visible = k > 0.02; g.scale.setScalar(Math.max(0.01, k));
        u.wings.forEach((w, j) => { if (u.kind === "bee") w.rotation.x = Math.sin(t * 90 + j * 3) * 0.8; else w.rotation.z = Math.sin(t * 14 + u.ph) * 1.1 * w.userData.k; });
        u.pop.position.copy(g.position); u.pop.material.opacity = k > 0.02 && k < 0.98 ? Math.sin(k * Math.PI) * 0.9 : 0; });
      const sk = Math.max(0, Math.min(1, amount)); mm.opacity = 0.9 * sk; swarm.visible = sk > 0.02;
      for (let i = 0; i < NM; i++) { const q = m0[i]; mpos[i * 3] = o.swarm.x + Math.sin(t * 3 + q[3]) * 1.2 * q[0];
        mpos[i * 3 + 1] = o.swarm.y + Math.sin(t * 4.3 + q[3] * 2) * 0.6 * q[1]; mpos[i * 3 + 2] = o.swarm.z + Math.cos(t * 3.4 + q[3]) * 1.2 * q[2]; }
      mg.attributes.position.needsUpdate = true;
    };
  };
  // ---- flower bed (instanced): bloom 0..1 scales heads, dry 0..1 browns them
  C.flowers = function (scene, area, n) {
    const stem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.01, 1, 4), C.mat(0x3f7a2c), n);
    const head = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshLambertMaterial({ flatShading: true }), n);
    const cols = [0xf43f5e, 0xfacc15, 0xffffff, 0xa855f7, 0xfb923c, 0x60a5fa, 0xf9a8d4], base = [];
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const x = rr(area[0], area[1]), z = rr(area[2], area[3]), h = rr(0.18, 0.45);
      base.push([x, z, h, new THREE.Color(cols[Math.floor(R() * cols.length)])]);
      M.compose(V.set(x, h / 2, z), Q.identity(), S.set(1, h, 1)); stem.setMatrixAt(i, M); head.setColorAt(i, base[i][3]); }
    scene.add(stem); scene.add(head); const brown = new THREE.Color(0x7a5a3a); const tmp = new THREE.Color();
    let last = -1;
    return function (bloom, dry) { const key = Math.round(bloom * 50) * 100 + Math.round(dry * 50); if (key === last) return; last = key;
      for (let i = 0; i < n; i++) { const [x, z, h, c] = base[i]; const s = Math.max(0.001, bloom * (0.7 + (i % 5) * 0.12));
        M.compose(V.set(x, h, z), Q.identity(), S.set(s, s * 0.8, s)); head.setMatrixAt(i, M); head.setColorAt(i, tmp.copy(c).lerp(brown, dry)); }
      head.instanceMatrix.needsUpdate = true; if (head.instanceColor) head.instanceColor.needsUpdate = true; };
  };
  // ---- one big hero flower for macro shots (pos = base of stem)
  C.heroFlower = function (scene, pos, color) {
    const g = new THREE.Group(); g.position.copy(pos);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.42, 6), C.mat(0x3f7a2c)); st.position.y = 0.21; g.add(st);
    const lf = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), C.mat(0x3f7a2c)); lf.scale.set(1, 0.15, 0.4); lf.position.set(0.03, 0.15, 0); lf.rotation.z = 0.5; g.add(lf);
    const pm = C.mat(color || 0xf6b8d1);
    for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), pm); p.scale.set(1, 0.18, 0.5);
      const a = (i / 8) * Math.PI * 2; p.position.set(Math.cos(a) * 0.032, 0.42, Math.sin(a) * 0.032); p.rotation.y = -a; p.rotation.z = 0.25; g.add(p); }
    const ce = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 8), C.mat(0xf5c542)); ce.scale.y = 0.6; ce.position.y = 0.425; g.add(ce);
    scene.add(g); return g;
  };
  return C;
};
