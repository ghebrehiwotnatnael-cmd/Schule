/* What-if cinematic 3D world, v2 (three.js r149 UMD). Pure function of time t: draw(t).
   window.WI_TRACKS = compiled property tracks (cinema_kit.py).  Sets: park | bunker | space.
   First-person: camera at eye height with the viewer's own blocky hands (poses via handL/handR tracks). */
(function () {
  const W = 1080, H = 1920;
  const TR = window.WI_TRACKS || {};
  const canvas = document.getElementById("world-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // ---- post: depth of field + motion-blur accumulation
  const rtScene = new THREE.WebGLRenderTarget(W, H, { depthTexture: new THREE.DepthTexture(W, H), depthBuffer: true });
  const rtAcc = new THREE.WebGLRenderTarget(W, H);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const dofMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false,
    uniforms: { tColor: { value: rtScene.texture }, tDepth: { value: rtScene.depthTexture }, focus: { value: 5 }, amount: { value: 0 },
      near: { value: 0.05 }, far: { value: 4000 }, aspect: { value: W / H }, opacity: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `uniform sampler2D tColor; uniform sampler2D tDepth; uniform float focus; uniform float amount; uniform float near; uniform float far; uniform float aspect; uniform float opacity; varying vec2 vUv;
      float lin(float d){ float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
      float coc(vec2 uv){ float z = lin(texture2D(tDepth, uv).x); return clamp(abs(z - focus) / max(z, 0.001) * amount, 0.0, 1.0); }
      void main(){ vec4 base = texture2D(tColor, vUv); if (amount <= 0.0) { gl_FragColor = vec4(base.rgb, opacity); return; }
        float c = coc(vUv); vec3 acc = base.rgb; float wsum = 1.0;
        for (int i = 0; i < 24; i++) { float a = float(i) * 2.399; float r = sqrt(float(i) / 24.0) * c * 0.022;
          vec2 o = vec2(cos(a) / aspect, sin(a)) * r * vec2(aspect, 1.0) * vec2(1.0/aspect, 1.0);
          vec2 uv = vUv + vec2(cos(a), sin(a) * aspect) * r;
          float cw = max(coc(uv), c * 0.5); acc += texture2D(tColor, uv).rgb * cw; wsum += cw; }
        gl_FragColor = vec4(acc / wsum, opacity); }` });
  const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), dofMat); const postScene = new THREE.Scene(); postScene.add(postQuad);
  const copyMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false,
    uniforms: { tDiffuse: { value: rtAcc.texture }, exposure: { value: 1 }, contrast: { value: 1 }, saturation: { value: 1 }, warmth: { value: 0 },
      vignette: { value: 0 }, grain: { value: 0 }, tonemap: { value: 0 }, seed: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `uniform sampler2D tDiffuse; uniform float exposure, contrast, saturation, warmth, vignette, grain, tonemap, seed; varying vec2 vUv;
      vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
      void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb * exposure;
        c = mix(c, aces(c * 1.15), tonemap);
        float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, saturation);
        c = (c - 0.5) * contrast + 0.5; c += vec3(0.04, 0.01, -0.03) * warmth;
        float d = distance(vUv, vec2(0.5)); c *= 1.0 - vignette * smoothstep(0.35, 0.85, d);
        c += (hash(vUv * 1000.0) - 0.5) * grain;
        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0); }` });
  const copyScene = new THREE.Scene(); copyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMat));
  function shadowAll(scene) { scene.traverse((o) => { if (o.isMesh && !o.userData.noShadow && !(o.material && o.material.isShaderMaterial) && !(o.material && o.material.transparent)) { o.castShadow = true; o.receiveShadow = true; } }); }
  function fitShadow(light, target, size = 40) {  // keep the shadow frustum around what the camera looks at
    light.castShadow = true; light.shadow.mapSize.set(2048, 2048); light.shadow.bias = -0.0005; light.shadow.normalBias = 0.02;
    const c = light.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = 500; c.updateProjectionMatrix();
    light.target.position.copy(target); light.target.updateMatrixWorld();
    const d = light.position.clone().sub(light.target.position).normalize().multiplyScalar(150); light.position.copy(target).add(d);
  }

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = mulberry32(11);
  const rr = (a, b) => a + (b - a) * R();
  const C = (h) => new THREE.Color(h);
  const smooth = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  // ---------------- tracks
  function val(name, t) {
    const tr = TR[name]; if (!tr) return undefined;
    let seg = null;
    for (const s of tr.segs) { if (s[0] <= t) seg = s; else break; }
    if (!seg) return tr.init;
    const [t0, t1, a, b] = seg;
    if (typeof b === "string" && b[0] !== "#") return b;
    const k = t1 > t0 ? smooth((t - t0) / (t1 - t0)) : 1;
    if (typeof b === "string") return new THREE.Color(a).lerp(new THREE.Color(b), k);
    if (Array.isArray(b)) return b.map((x, i) => a[i] + (x - a[i]) * k);
    return a + (b - a) * k;
  }
  const num = (n, t, d = 0) => { const v = val(n, t); return v === undefined ? d : v; };
  const col = (n, t) => { const v = val(n, t); return v instanceof THREE.Color ? v : new THREE.Color(v); };

  // ---------------- textures
  function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
  const winDay = canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#c9d2e0"; g.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 12) for (let x = 5; x < w; x += 12) { g.fillStyle = R() < 0.3 ? "#dfe6f0" : "#9aa6ba"; g.fillRect(x, y, 7, 7); } });
  const winLit = [0, 1, 2].map(() => canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 12) for (let x = 5; x < w; x += 12) { if (R() < 0.42) { g.fillStyle = R() < 0.5 ? "#ffd68a" : "#fff1c9"; g.fillRect(x, y, 7, 7); } } }));
  const checker = canvasTex(64, 64, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    g.fillStyle = (x + y) % 2 ? "#ffffff" : "#d62f3a"; g.fillRect(x * 8, y * 8, 8, 8); } });
  const glowTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,240,200,.65)"); r.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const puffTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const frostTex = canvasTex(256, 512, (g, w, h) => { g.clearRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const x = R() * w, y = R() * h; const e = Math.min(x, w - x, y * 0.5, (h - y) * 0.5) / (w * 0.5);
      if (R() > e * 5.0) { g.strokeStyle = `rgba(230,242,255,${0.25 + R() * 0.5})`; g.lineWidth = 1 + R() * 2; g.beginPath(); g.moveTo(x, y);
        g.lineTo(x + rr(-14, 14), y + rr(-14, 14)); g.stroke(); } }
    const r = g.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, h * 0.62); r.addColorStop(0, "rgba(220,235,255,0)"); r.addColorStop(1, "rgba(220,235,255,.75)");
    g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const grassTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = 110 + Math.floor(R() * 40); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * w, R() * h, 3, 3); } });
  grassTex.repeat.set(220, 220);

  const loads = [];
  const loader = new THREE.TextureLoader();
  function loadTex(url) { const tx = new THREE.Texture(); loads.push(new Promise((res) => loader.load(url, (t) => { tx.image = t.image; tx.needsUpdate = true; res(); }, undefined, () => res()))); return tx; }

  const box = (w, h, d, c) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: c }));

  // ================= PARK
  const park = new THREE.Scene();
  const skyU = { top: { value: C("#7f8fb3") }, horizon: { value: C("#c9c3cf") }, bottom: { value: C("#3c4a2f") } };
  park.add(new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h*1.8,0.0,1.0),0.75)) : mix(horizon, bottom, clamp(-h*5.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }"
  })));
  park.fog = new THREE.Fog(0xc9c3cf, 120, 1400);
  const hemi = new THREE.HemisphereLight(0xdfe6ff, 0x3a4a2a, 0.9); park.add(hemi);
  const sunLight = new THREE.DirectionalLight(0xffe2b0, 1.1); park.add(sunLight);
  const coldLight = new THREE.DirectionalLight(0x9fb7ff, 0.0); coldLight.position.set(-50, 80, 40); park.add(coldLight);

  const groundMat = new THREE.MeshLambertMaterial({ color: 0x3f7a2c, map: grassTex });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), groundMat); ground.rotation.x = -Math.PI / 2; park.add(ground);
  const pathMat = new THREE.MeshLambertMaterial({ color: 0xb9ab92 });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 300), pathMat); path.rotation.x = -Math.PI / 2; path.rotation.z = 0.35; path.position.set(-5, 0.02, -40); park.add(path);
  const pondMat = new THREE.MeshLambertMaterial({ color: 0x3b6e8f });
  const pond = new THREE.Mesh(new THREE.CircleGeometry(14, 40), pondMat); pond.rotation.x = -Math.PI / 2; pond.position.set(-16, 0.04, -34); park.add(pond);
  const blanket = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), new THREE.MeshLambertMaterial({ map: checker }));
  blanket.rotation.x = -Math.PI / 2; blanket.rotation.z = 0.25; blanket.position.set(1.6, 0.05, -7.5); park.add(blanket);

  // road with cars at the park edge
  const road = new THREE.Mesh(new THREE.PlaneGeometry(900, 12), new THREE.MeshLambertMaterial({ color: 0x3a3d44 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.03, -128); park.add(road);
  const cars = [];
  const carCols = [0xd62f3a, 0xf2f2f2, 0x2f5fb3, 0xe8c547, 0x1f2937, 0x6b7280];
  const headMat = new THREE.MeshBasicMaterial({ color: 0xfff3c4 }), tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  for (let i = 0; i < 22; i++) {
    const g = new THREE.Group(); const body = box(4.2, 1.2, 1.9, carCols[i % carCols.length]); body.position.y = 0.8; g.add(body);
    const cab = box(2.2, 0.8, 1.7, 0x9fb4c8); cab.position.set(-0.2, 1.75, 0); g.add(cab);
    const dir = i % 2 ? 1 : -1;
    for (const z of [-0.6, 0.6]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.4), headMat); hl.position.set(2.12 * dir, 0.85, z); g.add(hl);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.35), tailMat); tl.position.set(-2.12 * dir, 0.85, z); g.add(tl); }
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff1c4, transparent: true, depthWrite: false, opacity: 0 }));
    glow.scale.set(7, 4, 1); glow.position.set(3 * dir, 0.9, 0); g.add(glow);
    g.userData = { dir, x0: rr(-450, 450), lane: dir > 0 ? -2.6 : 2.6, speed: rr(9, 15), glow };
    park.add(g); cars.push(g);
  }
  // street lamps along the path
  const lamps = [];
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
  for (let i = 0; i < 14; i++) {
    const z = -6 - i * 9, x = -5 + Math.tan(0.35) * (z + 40) * -1 + (i % 2 ? 3.2 : -3.2);
    const g = new THREE.Group(); const pole = box(0.14, 4.2, 0.14, 0x2b2f36); pole.position.y = 2.1; g.add(pole);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), bulbMat); bulb.position.y = 4.3; g.add(bulb);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd98a, transparent: true, depthWrite: false, opacity: 0 }));
    gl.scale.set(5, 5, 1); gl.position.y = 4.3; g.add(gl); g.position.set(x, 0, z); park.add(g); lamps.push(gl);
  }

  // people (walkers, sitters, pointing)
  const skinCols = [0xf2c9a0, 0xd9a273, 0x9c6b46, 0x6b4630, 0xf5d7b8];
  const shirtCols = [0xe5e7eb, 0x2f5fb3, 0xe8d24a, 0xc23b3b, 0x3b7a57, 0x8b5cf6, 0xf59e0b, 0x1f2937, 0xec4899];
  const blob = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
  const people = [];
  function makePerson(mode, opt = {}) {
    const x = opt.x || 0, z = opt.z || 0, rot = opt.rot || 0, kid = opt.kid ? 0.62 : 1;
    const g = new THREE.Group(); const sc = opt.shirt ?? shirtCols[Math.floor(R() * shirtCols.length)], sk = opt.skin ?? skinCols[Math.floor(R() * skinCols.length)];
    const pants = R() < 0.5 ? 0x2b3245 : 0x5b4a3a; const u = { mode, x, z, rot, legs: [], arms: [], head: null, phase: R() * 6, speed: rr(0.9, 1.5) };
    if (mode === "sit") {
      const legs = box(0.42, 0.22, 0.95, pants); legs.position.set(0, 0.12, 0.38); g.add(legs);
      const torso = box(0.55, 0.7, 0.32, sc); torso.position.set(0, 0.55, 0); g.add(torso);
      u.head = new THREE.Group(); u.head.position.set(0, 0.95, 0); g.add(u.head);
      for (const s of [-0.36, 0.36]) { const a = new THREE.Group(); a.position.set(s, 0.85, 0); const m = box(0.15, 0.6, 0.17, sc); m.position.y = -0.28; a.add(m); g.add(a); u.arms.push(a); }
    } else {
      for (const s of [-0.12, 0.12]) { const l = new THREE.Group(); l.position.set(s, 0.86, 0); const m = box(0.18, 0.85, 0.2, pants); m.position.y = -0.43; l.add(m); g.add(l); u.legs.push(l); }
      const torso = box(0.55, 0.72, 0.3, sc); torso.position.set(0, 1.22, 0); g.add(torso);
      for (const s of [-0.36, 0.36]) { const a = new THREE.Group(); a.position.set(s, 1.54, 0); const m = box(0.15, 0.68, 0.17, sc); m.position.y = -0.32; a.add(m); g.add(a); u.arms.push(a); }
      u.head = new THREE.Group(); u.head.position.set(0, 1.62, 0); g.add(u.head);
    }
    const head = box(0.34, 0.36, 0.34, sk); head.position.y = 0.18; u.head.add(head);
    const hair = box(0.36, 0.12, 0.36, R() < 0.3 ? 0xd9b26f : 0x2f2118); hair.position.y = 0.39; u.head.add(hair);
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.16), new THREE.MeshBasicMaterial({ color: 0xdfefff })); // phone screen glow
    ph.position.set(0.1, 1.15, -0.25); ph.visible = false; g.add(ph); u.phone = ph;
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), blob); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03; g.add(sh);
    g.userData = u; g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(kid); return g;
  }
  function person(x, z, mode, rot) { const g = makePerson(mode, { x, z, rot }); park.add(g); people.push(g); return g; }
  function animatePerson(g, t, o = {}) {      // generic pose animation for any set
    const u = g.userData, w = o.walk || 0;
    u.legs.forEach((l, k) => { l.rotation.x = Math.sin(t * 6 * u.speed + k * 3.14) * 0.5 * w; });
    u.arms.forEach((a, k) => { a.rotation.x = Math.sin(t * 6 * u.speed + k * 3.14 + 3.14) * 0.4 * w + (o.armsX || 0); a.rotation.z = 0; });
    if (o.point && u.arms[1]) { u.arms[1].rotation.x = -2.6 * o.point; }
    if (o.hug) { u.arms.forEach((a) => { a.rotation.x = -1.3 * o.hug; a.rotation.z = (a.position.x > 0 ? 0.5 : -0.5) * o.hug; }); }
    if (o.shiver) g.rotation.z = Math.sin(t * 40 + u.phase) * 0.02 * o.shiver;
    u.head.rotation.x = -(o.look || 0) * 0.7 + (o.nod ? Math.sin(t * 2 + u.phase) * 0.1 * o.nod : 0);
    u.head.rotation.y = o.turn || 0;
    u.phone.visible = !!o.phone;
  }
  person(0.6, -7.6, "sit", 0.4); person(2.4, -8.3, "sit", -0.6); person(1.9, -6.6, "sit", 2.6);
  for (let i = 0; i < 70; i++) { const m = R(); person(rr(-34, 34), rr(-12, -75), m < 0.2 ? "sit" : m < 0.6 ? "walk" : "stand", rr(0, 6.28)); }
  people.sort(() => R() - 0.5);

  // trees (instanced)
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4b3424 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x2f5a25, flatShading: true });
  const treeSpots = [];
  for (let i = 0; i < 170; i++) treeSpots.push([rr(-150, 150), rr(-50, -122), rr(1.0, 1.6)]);
  for (let i = 0; i < 46; i++) { const s = R() < 0.5 ? -1 : 1; treeSpots.push([s * rr(20, 70), rr(-10, -50), rr(1.0, 1.5)]); }
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.35, 3.2, 6), trunkMat, treeSpots.length);
  const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), leafMat, treeSpots.length * 3);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3();
  treeSpots.forEach(([x, z, s], i) => {
    M4.compose(V.set(x, 1.6 * s, z), Q.identity(), S.set(s, s, s)); trunks.setMatrixAt(i, M4);
    for (let k = 0; k < 3; k++) { const r = rr(1.6, 2.4) * s; Q.setFromEuler(E.set(R() * 3, R() * 3, R() * 3));
      M4.compose(V.set(x + rr(-0.9, 0.9) * s, (3.6 + rr(0, 1.4)) * s, z + rr(-0.9, 0.9) * s), Q, S.set(r, r, r)); leaves.setMatrixAt(i * 3 + k, M4); }
  });
  park.add(trunks); park.add(leaves);

  // skyline (three window-light groups so lights can fail in steps)
  const city = new THREE.Group(); park.add(city);
  const cityMats = winLit.map((lit) => new THREE.MeshLambertMaterial({ map: winDay, emissiveMap: lit, emissive: 0xffffff, emissiveIntensity: 0 }));
  for (let i = 0; i < 28; i++) {
    const x = rr(-420, 420), z = rr(-330, -560), tall = R() < 0.35, mat = cityMats[i % 3];
    let y = 0, cw = rr(26, 46), cd = rr(26, 44), ch = tall ? rr(230, 420) : rr(90, 200);
    for (let k = 0; k < 3 && ch > 10; k++) {
      const seg = k === 2 ? ch : ch * rr(0.45, 0.7); const g = new THREE.BoxGeometry(cw, seg, cd); const uv = g.attributes.uv;
      for (let j = 0; j < uv.count; j++) uv.setXY(j, uv.getX(j) * cw / 7, uv.getY(j) * seg / 7);
      const m = new THREE.Mesh(g, mat); m.position.set(x, y + seg / 2, z); city.add(m);
      y += seg; ch -= seg; cw *= rr(0.6, 0.85); cd *= rr(0.6, 0.85); if (R() < 0.4) break;
    }
  }
  // 1816 village (cottages)
  const village = new THREE.Group(); park.add(village);
  for (let i = 0; i < 26; i++) {
    const g = new THREE.Group(); const w = rr(6, 10), d = rr(5, 8), h = rr(3.5, 5);
    const walls = box(w, h, d, R() < 0.5 ? 0xe8dcc4 : 0xcfc1a6); walls.position.y = h / 2; g.add(walls);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 3.4, 4), new THREE.MeshLambertMaterial({ color: 0x7a3b2a, flatShading: true }));
    roof.position.y = h + 1.7; roof.rotation.y = Math.PI / 4; g.add(roof);
    g.position.set(rr(-160, 160), 0, rr(-70, -200)); g.rotation.y = rr(0, 3); village.add(g);
  }

  // sky objects
  const sunGroup = new THREE.Group(); park.add(sunGroup);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd28a, transparent: true, depthWrite: false, fog: false }));
  sunGlow.scale.set(260, 260, 1); sunGroup.add(sunGlow);
  sunGroup.add(new THREE.Mesh(new THREE.SphereGeometry(18, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff1c4, fog: false })));
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xe5e7eb, fog: false });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 16), moonMat); park.add(moon);
  const starGeo = new THREE.BufferGeometry(); const sp = [];
  for (let i = 0; i < 1800; i++) { const th = R() * 6.283, ph = Math.acos(rr(0.03, 1)); sp.push(1300 * Math.sin(ph) * Math.cos(th), 1300 * Math.cos(ph), 1300 * Math.sin(ph) * Math.sin(th)); }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  park.add(new THREE.Points(starGeo, starMat));
  // birds
  const birds = []; const birdMat = new THREE.MeshBasicMaterial({ color: 0x1f2328, side: THREE.DoubleSide });
  for (let i = 0; i < 26; i++) { const g = new THREE.Group();
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.3), birdMat); w.position.x = s * 0.45; w.userData.s = s; g.add(w); }
    g.userData = { ox: rr(-30, 30), oy: rr(18, 34), oz: rr(-60, -110), ph: R() * 6 }; park.add(g); birds.push(g); }

  // snow + breath puffs
  const NS = 3200, snowGeo = new THREE.BufferGeometry(), snow0 = new Float32Array(NS * 3), snowPos = new Float32Array(NS * 3);
  for (let i = 0; i < NS; i++) { snow0[i * 3] = rr(-45, 45); snow0[i * 3 + 1] = rr(0, 40); snow0[i * 3 + 2] = rr(-70, 14); }
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 3.4, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
  const snowPts = new THREE.Points(snowGeo, snowMat); snowPts.frustumCulled = false; park.add(snowPts);

  // bunker hatch in the park (outside view)
  const hatch = new THREE.Group(); park.add(hatch); hatch.position.set(5, 0, -15);
  const hb = box(4.5, 1.6, 3.5, 0x7b7f86); hb.position.y = 0.8; hatch.add(hb);
  const doorMat = new THREE.MeshBasicMaterial({ color: 0xffa040 });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.2), doorMat); door.position.set(0, 0.7, 1.76); hatch.add(door);
  const hatchLight = new THREE.PointLight(0xff9a40, 0, 18); hatchLight.position.set(0, 1.4, 3); hatch.add(hatchLight);
  // volcano far away
  const volcano = new THREE.Group(); park.add(volcano); volcano.position.set(-260, 0, -700);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(260, 230, 10, 1, true), new THREE.MeshLambertMaterial({ color: 0x5b4a3e, flatShading: true }));
  cone.position.y = 115; volcano.add(cone);
  const crater = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff5a1f, fog: false })); crater.position.y = 225; volcano.add(crater);
  const ash = []; const ashMat = new THREE.MeshLambertMaterial({ color: 0x55504c, transparent: true, opacity: 0.92, flatShading: true });
  for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(40, 95), 1), ashMat);
    m.userData = { x: rr(-90, 90), y: 240 + i * 22, z: rr(-60, 60), k: i / 30 }; volcano.add(m); ash.push(m); }

  // ================= BUNKER (interior)
  const bunker = new THREE.Scene(); bunker.fog = new THREE.Fog(0x120c08, 6, 30);
  bunker.add(new THREE.HemisphereLight(0x6b5a4a, 0x1a120c, 0.35));
  const room = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 18), new THREE.MeshLambertMaterial({ color: 0x6f6a63, side: THREE.BackSide }));
  room.position.set(0, 2, -6); bunker.add(room);
  for (let i = 0; i < 4; i++) { const bed = box(2, 0.5, 0.9, 0x4b5563); bed.position.set(-5.5, 0.5 + (i % 2) * 1.4, -4 - Math.floor(i / 2) * 3); bunker.add(bed); }
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.0, 14), new THREE.MeshLambertMaterial({ color: 0x5b3a26 })); barrel.position.set(0.5, 0.5, -5); bunker.add(barrel);
  const flames = []; for (let i = 0; i < 7; i++) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i % 2 ? 0xff7a1a : 0xffc04a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    f.userData = { ph: R() * 6, x: rr(-0.2, 0.2) }; bunker.add(f); flames.push(f); }
  const fireLight = new THREE.PointLight(0xff8a30, 2.5, 16); fireLight.position.set(0.5, 1.6, -5); bunker.add(fireLight);
  const bPeople = [];
  [[-1.4, -4.2, 1.2], [2.3, -4.6, -1.3], [0.6, -6.6, 3.1], [-0.6, -6.4, 2.4]].forEach(([x, z, r]) => {
    const g = new THREE.Group(); const sc = shirtCols[Math.floor(R() * shirtCols.length)];
    const legs = box(0.42, 0.22, 0.95, 0x2b3245); legs.position.set(0, 0.12, 0.38); g.add(legs);
    const torso = box(0.6, 0.72, 0.36, sc); torso.position.set(0, 0.55, 0); g.add(torso);
    const head = box(0.34, 0.36, 0.34, skinCols[Math.floor(R() * 5)]); head.position.set(0, 1.12, 0); g.add(head);
    const beanie = box(0.37, 0.16, 0.37, 0x9b2c2c); beanie.position.set(0, 1.34, 0); g.add(beanie);
    g.position.set(x, 0, z); g.rotation.y = r; bunker.add(g); bPeople.push(g); });

  // ================= SPACE
  const space = new THREE.Scene();
  const earthDay = loadTex("assets/lib/earth_atmos_2048.jpg"), earthNight = loadTex("assets/lib/earth_lights_2048.png"), earthCloud = loadTex("assets/lib/earth_clouds_1024.png");
  const earthU = { day: { value: earthDay }, night: { value: earthNight }, sunDir: { value: new THREE.Vector3(-1, 0.2, 0.4).normalize() },
    sun: { value: 1 }, lights: { value: 1 }, ice: { value: 0 } };
  const earth = new THREE.Mesh(new THREE.SphereGeometry(10, 96, 48), new THREE.ShaderMaterial({ uniforms: earthU,
    vertexShader: "varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform sampler2D day; uniform sampler2D night; uniform vec3 sunDir; uniform float sun; uniform float lights; uniform float ice;
      varying vec2 vUv; varying vec3 vN;
      void main(){ vec3 d = texture2D(day, vUv).rgb; vec3 n = texture2D(night, vUv).rgb;
        float lum = dot(d, vec3(.3,.59,.11)); float water = smoothstep(.0, .12, d.b - d.r);
        vec3 icy = mix(d, vec3(.86,.92,1.0), ice * (0.55 + 0.45 * (1.0 - water * (1.0 - ice))));
        float l = clamp(dot(normalize(vN), sunDir), 0.0, 1.0) * sun;
        vec3 c = icy * (0.04 + 1.1 * l) + n * lights * 1.6 * (1.0 - l);
        float rim = pow(1.0 - abs(normalize(vN).z), 3.0); c += vec3(.25,.45,1.0) * rim * (0.15 + 0.5 * sun);
        gl_FragColor = vec4(c, 1.0); }` }));
  space.add(earth);
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(10.08, 64, 32), new THREE.MeshLambertMaterial({ map: earthCloud, transparent: true, opacity: 0.5, depthWrite: false }));
  const moonSp = new THREE.Mesh(new THREE.SphereGeometry(2.7, 64, 32), new THREE.MeshLambertMaterial({ map: loadTex("assets/lib/moon_1024.jpg") })); moonSp.position.set(-28, 6, -30); space.add(moonSp);
  const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), new THREE.MeshBasicMaterial({ color: 0x4dff7a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })); space.add(laser);
  space.add(clouds); const spaceLight = new THREE.DirectionalLight(0xffffff, 1); spaceLight.position.set(-30, 6, 12); space.add(spaceLight);
  space.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, sizeAttenuation: false })));

  // ================= CAMERA + first-person hands
  const cam = new THREE.PerspectiveCamera(52, W / H, 0.05, 4000);
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xe8b88f, emissive: 0x3a2618 }), sleeveMat = new THREE.MeshLambertMaterial({ color: 0x2b3a67, emissive: 0x0b1224 });
  function makeHand(side) {
    const g = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.7), sleeveMat); sleeve.position.set(0, 0, 0.38); g.add(sleeve);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, 0.11), skinMat); palm.position.set(0, 0, -0.01); g.add(palm);
    for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.03, 0.075), skinMat); f.position.set(-0.039 + k * 0.026, 0, -0.1); g.add(f); }
    const th = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.06), skinMat); th.position.set(0.07 * side, 0, -0.03); th.rotation.y = -0.6 * side; g.add(th);
    g.scale.setScalar(0.5); cam.add(g); return g;
  }
  const handR = makeHand(1), handL = makeHand(-1);
  // held items (in the right hand)
  const phone = new THREE.Group(); handR.add(phone); phone.position.set(0, 0.03, -0.07);
  phone.add(new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.15), new THREE.MeshLambertMaterial({ color: 0x111111 })));
  const phoneCan = document.createElement("canvas"); phoneCan.width = 264; phoneCan.height = 540; const phoneTex = new THREE.CanvasTexture(phoneCan);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.135), new THREE.MeshBasicMaterial({ map: phoneTex })); screen.rotation.x = -Math.PI / 2; screen.position.y = 0.007; phone.add(screen);
  function drawPhone(mode, t) { const g = phoneCan.getContext("2d"), w = 264, h = 540; g.fillStyle = "#0b0b10"; g.fillRect(0, 0, w, h);
    const bar = (txt, c) => { g.fillStyle = c || "#fff"; g.font = "bold 18px Arial"; g.fillText(txt, 16, 26); };
    if (mode === "feed") { bar("9:41      ▮▮▮  LTE"); const off = (t * 120) % 180; for (let i = -1; i < 4; i++) { const y = 50 + i * 180 - off;
        g.fillStyle = ["#f97316", "#38bdf8", "#a78bfa", "#34d399"][(i + 8) % 4]; g.fillRect(12, y, w - 24, 130); g.fillStyle = "#9ca3af"; g.fillRect(12, y + 138, 160, 10); g.fillRect(12, y + 154, 110, 8); } }
    else if (mode === "nosignal" || mode === "offline") { bar(mode === "offline" ? "9:41      ✕  No connection" : "9:41      No Service", "#f87171"); g.fillStyle = "#e5e7eb"; g.font = "bold 30px Arial";
      g.fillText(mode === "offline" ? "No internet" : "No signal", 40, 260); g.font = "18px Arial"; g.fillStyle = "#9ca3af"; g.fillText(mode === "offline" ? "Check your connection." : "Emergency calls only", 40, 296); }
    else if (mode === "battery") { bar("9:41      No Service", "#f87171"); g.strokeStyle = "#e5e7eb"; g.lineWidth = 5; g.strokeRect(62, 220, 120, 60); g.fillStyle = "#ef4444"; g.fillRect(68, 226, 6, 48); g.fillRect(182, 238, 8, 24);
      g.fillStyle = "#ef4444"; g.font = "bold 36px Arial"; g.fillText("2%", 98, 340); }
    else if (mode === "declined") { g.fillStyle = "#111827"; g.fillRect(0, 0, w, h); g.fillStyle = "#ef4444"; g.font = "bold 28px Arial"; g.fillText("CARD", 70, 230); g.fillText("DECLINED", 50, 270);
      g.fillStyle = "#9ca3af"; g.font = "18px Arial"; g.fillText("Terminal offline", 60, 310); }
    else if (mode === "notifs") { bar("9:41      ▮▮▮  5G"); for (let i = 0; i < 6; i++) { const y = 60 + i * 76 + ((t * 300) % 76); g.fillStyle = "#1f2937"; g.fillRect(12, y, w - 24, 64);
        g.fillStyle = "#e5e7eb"; g.font = "bold 16px Arial"; g.fillText(["Messages", "News", "Bank", "Mum", "Weather", "Work"][i], 24, y + 26); g.fillStyle = "#9ca3af"; g.font = "14px Arial"; g.fillText("(" + (999 - i * 37) + ") new", 24, y + 48); } }
    else if (mode === "map") { g.fillStyle = "#e8e2d0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 14; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(0, 80 + i * 110); g.lineTo(w, 40 + i * 120); g.stroke(); }
      g.fillStyle = "#9ca3af"; g.font = "bold 20px Arial"; g.fillText("Map unavailable", 50, 270); }
    phoneTex.needsUpdate = true; }
  let lastPhone = "";
  const torch = new THREE.SpotLight(0xffffff, 0, 60, 0.42, 0.6, 1.2); torch.position.set(0, 0, -0.1); handR.add(torch); handR.add(torch.target); torch.target.position.set(0, -0.2, -5);
  const cone2 = new THREE.Group(); handR.add(cone2); cone2.position.set(0, 0.04, -0.06);
  const waffle = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 10), new THREE.MeshLambertMaterial({ color: 0xc98a3c })); waffle.rotation.x = Math.PI; waffle.position.y = 0.02; cone2.add(waffle);
  const scoop = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), new THREE.MeshLambertMaterial({ color: 0xffc2d6 })); scoop.position.y = 0.09; cone2.add(scoop);
  cone2.rotation.x = -1.2;
  // lens overlays (frost, flash, puffs) in front of the camera
  const frostLens = new THREE.Mesh(new THREE.PlaneGeometry(0.1152, 0.2048), new THREE.MeshBasicMaterial({ map: frostTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
  frostLens.position.z = -0.21; frostLens.renderOrder = 999; cam.add(frostLens);
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
  flash.position.z = -0.1; flash.renderOrder = 1000; cam.add(flash);
  const puffs = []; for (let i = 0; i < 3; i++) { const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 })); cam.add(p); puffs.push(p); }

  // ---- pluggable sets (kit/sets_*.js push builders into window.WI_SET_BUILDERS)
  shadowAll(park); shadowAll(bunker);
  // ---- real 3D models (FBX / glTF), normalised, cloned, animated deterministically from t
  const modelCache = {};
  const MODEL_BASE = window.WI_MODEL_BASE || "assets/models/";
  function toStandard(obj, rough = 0.85) {
    obj.traverse((o) => { if (!o.isMesh) return; const mats = Array.isArray(o.material) ? o.material : [o.material];
      const conv = mats.map((m) => { if (!m || m.isMeshStandardMaterial) return m;
        const n = new THREE.MeshStandardMaterial({ color: m.color ? m.color.clone().convertLinearToSRGB() : 0xffffff, map: m.map || null, roughness: rough, metalness: 0.0,
          transparent: m.transparent, opacity: m.opacity, side: m.side, vertexColors: m.vertexColors });
        if (n.map) n.map.encoding = THREE.LinearEncoding; return n; });
      o.material = Array.isArray(o.material) ? conv : conv[0]; o.castShadow = true; o.receiveShadow = true; });
  }
  function loadModel(file) {
    if (!modelCache[file]) {
      modelCache[file] = new Promise((res) => {
        const ld = file.toLowerCase().endsWith(".fbx") ? new THREE.FBXLoader() : new THREE.GLTFLoader();
        ld.load(MODEL_BASE + file, (o) => { const root = o.scene || o; root.userData.clips = o.animations || []; toStandard(root); res(root); }, undefined,
          (e) => { console.warn("model failed", file, e && e.message); res(null); });
      });
      loads.push(modelCache[file]);
    }
    return modelCache[file];
  }
  /* model(file, {height|length|size, rotX, rotY, flip, clip, speed, offset, shadow}) -> Group placed in the world now,
     filled when the file has loaded. height = target height in m (people), length = longest horizontal side (vehicles). */
  function model(file, o = {}) {
    const holder = new THREE.Group(); holder.userData.o = o;
    loadModel(file).then((src) => { if (!src) return;
      const inst = (src.userData.clips.length && THREE.SkeletonUtils) ? THREE.SkeletonUtils.clone(src) : src.clone(true);
      if (o.rotX) inst.rotation.x = o.rotX;
      const piv = new THREE.Group(); piv.add(inst); piv.updateMatrixWorld(true);
      let b = new THREE.Box3().setFromObject(piv), sz = b.getSize(new THREE.Vector3());
      if (o.autoUp && sz.y > sz.z * 1.6 && sz.y > sz.x) { inst.rotation.x = -Math.PI / 2; piv.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(piv); sz = b.getSize(new THREE.Vector3()); }
      if (o.alongZ && sz.x > sz.z) { inst.rotation.y += Math.PI / 2; inst.updateMatrix(); piv.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(piv); sz = b.getSize(new THREE.Vector3()); }
      let k = 1; if (o.height) k = o.height / sz.y; else if (o.length) k = o.length / Math.max(sz.x, sz.z); else if (o.size) k = o.size / Math.max(sz.x, sz.y, sz.z);
      if (o.maxFoot) k = Math.min(k, o.maxFoot / Math.max(sz.x, sz.z));
      piv.scale.setScalar(k); const c = b.getCenter(new THREE.Vector3());
      inst.position.x -= c.x; inst.position.z -= c.z; inst.position.y -= b.min.y;
      if (o.rotY) piv.rotation.y = o.rotY;
      holder.add(piv);
      if (o.onLoad) { piv.updateMatrixWorld(true); o.onLoad(holder, new THREE.Box3().setFromObject(piv).getSize(new THREE.Vector3())); }
      if (src.userData.clips.length) { const mixer = new THREE.AnimationMixer(inst); holder.userData.mixer = mixer; holder.userData.clips = src.userData.clips; holder.userData.actions = {};
        play(holder, o.clip || src.userData.clips[0].name, 0); }
    });
    return holder;
  }
  function findClip(h, name) { const cl = h.userData.clips || []; return cl.find((c) => c.name === name) || cl.find((c) => c.name.toLowerCase().includes(name.toLowerCase())); }
  /* play(holder, clipName, t, speed=1, offset=0): pose the rig at time t (pure function of t) */
  function playAt(h, name, frac) { const clip = findClip(h, name); if (!clip) return; play(h, name, 0, 0, clip.duration * Math.min(0.999, frac)); }
  function play(h, name, t, speed = 1, offset = 0) {
    const mx = h.userData.mixer; if (!mx) return; const clip = findClip(h, name); if (!clip) return;
    let a = h.userData.actions[clip.name]; if (!a) { a = mx.clipAction(clip); h.userData.actions[clip.name] = a; }
    Object.values(h.userData.actions).forEach((x) => { if (x !== a) { x.stop(); } });
    a.play(); a.setEffectiveWeight(1); a.time = ((t * speed + offset) % clip.duration + clip.duration) % clip.duration; mx.update(0);
  }
  // ---- HDRI image-based lighting
  const pmrem = new THREE.PMREMGenerator(renderer); const hdriCache = {};
  function hdri(scene, name, intensity = 1) {
    if (!THREE.RGBELoader) return;
    if (!hdriCache[name]) { hdriCache[name] = new Promise((res) => new THREE.RGBELoader().load((window.WI_HDRI_BASE || "assets/lib/hdri/") + name + ".hdr",
      (tx) => { const env = pmrem.fromEquirectangular(tx).texture; tx.dispose(); res(env); }, undefined, () => res(null))); loads.push(hdriCache[name]); }
    if (scene) hdriCache[name].then((env) => { if (env) scene.environment = env; });
    return hdriCache[name];
  }
  function envIntensity(scene, k) { if (!scene.userData.stdMats) { const l = []; scene.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m && m.isMeshStandardMaterial) l.push(m); }); }); scene.userData.stdMats = l; scene.userData.stdCount = l.length; }
    scene.userData.stdMats.forEach((m) => { m.envMapIntensity = k; }); }
  function refreshMats(scene) { scene.userData.stdMats = null; }
  // ---- dense grass: instanced blade clusters with wind in the vertex shader
  const windU = { value: 0 };
  function grass(scene, area, n, color = 0x4f8a2e, height = 0.35) {
    const g = new THREE.BufferGeometry(); const P = [], N = [];
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI, w = 0.025, h = height; const dx = Math.cos(a) * w, dz = Math.sin(a) * w;
      P.push(-dx, 0, -dz, dx, 0, dz, 0, h, 0); N.push(0, 1, 0, 0, 1, 0, 0, 1, 0); }
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide });
    m.onBeforeCompile = (sh) => { sh.uniforms.uWind = windU;
      sh.vertexShader = "uniform float uWind;\n" + sh.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\n float hgt = position.y; vec4 wp = instanceMatrix * vec4(0.0,0.0,0.0,1.0); transformed.x += sin(uWind * 1.7 + wp.x * 0.6 + wp.z * 0.4) * 0.06 * hgt * 3.0; transformed.z += cos(uWind * 1.3 + wp.z * 0.5) * 0.03 * hgt * 3.0;"); };
    const mesh = new THREE.InstancedMesh(g, m, n); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(); const base = new THREE.Color(color), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const s = rr(0.6, 1.4); Q.setFromAxisAngle(V.set(0, 1, 0), R() * 6.28); M.compose(V.set(rr(area[0], area[1]), 0, rr(area[2], area[3])), Q, S.set(s, s * rr(0.7, 1.3), s));
      mesh.setMatrixAt(i, M); mesh.setColorAt(i, c.copy(base).offsetHSL(rr(-0.03, 0.03), rr(-0.1, 0.1), rr(-0.08, 0.06))); }
    mesh.receiveShadow = true; mesh.userData.noShadow = true; scene.add(mesh); return mesh;
  }
  const WI = { THREE, R, rr, C, smooth, clamp01, val, num, col, canvasTex, glowTex, puffTex, box, makePerson, animatePerson, model, play, playAt, hdri, grass, windU, toStandard, loads, envIntensity, refreshMats,
    skinCols, shirtCols, fitShadow, loadTex, cam, W, H };
  const SETS = {};
  (window.WI_SET_BUILDERS || []).forEach((b) => { const st = b(WI); SETS[st.name] = st; shadowAll(st.scene); });
  function setPose(g, p, side) { g.position.set(p[0] * side, p[1], p[2]); g.rotation.set(p[3], p[4] * side, p[5] * side); }

  // ================= draw(t)
  function update(t) {
    const set = val("set", t) || "park";
    // camera
    const shake = num("shake", t), bob = num("bob", t);
    const sh = (f, a) => Math.sin(t * f) * a;
    const hx = sh(31, shake * 0.03) + sh(17, shake * 0.02), hy = sh(27, shake * 0.03) + Math.abs(Math.sin(t * 5.2)) * bob * 0.06;
    const pose = (n, d) => { const v = val(n, t); return v || d; };
    // hands
    setPose(handR, pose("handR", [0.3, -0.9, -0.4, 0, 0, 0]), 1);
    setPose(handL, pose("handL", [0.3, -0.9, -0.4, 0, 0, 0]), -1);
    const shiver = num("shiver", t);
    if (shiver) { handR.position.x += sh(40, 0.006 * shiver); handL.position.x += sh(43, 0.006 * shiver); }
    const item = val("item", t) || "none";
    phone.visible = item === "phone"; cone2.visible = item === "cone";
    if (phone.visible) { const pm = val("phoneUI", t) || "feed"; if (pm !== lastPhone || pm === "feed" || pm === "notifs") { drawPhone(pm, t); lastPhone = pm; } }
    torch.intensity = num("torch", t) * 3.0;
    frostLens.material.opacity = num("frostLens", t);
    flash.material.opacity = num("flash", t);
    const br = num("breath", t);
    puffs.forEach((p, i) => { const ph = ((t * 0.55 + i / 3) % 1); p.position.set(0.02 + ph * 0.05, -0.08 + ph * 0.05, -0.35 - ph * 0.25);
      p.scale.setScalar(0.08 + ph * 0.35); p.material.opacity = br * Math.sin(ph * Math.PI) * 0.6; });

    if (set === "space") {
      const p = val("spaceCam", t) || [0, 0, 34];
      cam.position.set(p[0], p[1], p[2]); cam.lookAt(0, 0, 0); cam.fov = num("spaceFov", t, 40); cam.updateProjectionMatrix();
      earth.rotation.y = 2.2 + t * 0.04; clouds.rotation.y = earth.rotation.y + t * 0.01;
      earthU.sun.value = num("earthSun", t, 1); earthU.lights.value = num("earthLights", t, 1); earthU.ice.value = num("earthIce", t);
      clouds.material.opacity = 0.5 * num("earthSun", t, 1) + 0.08; spaceLight.intensity = num("earthSun", t, 1);
      const mv = num("spaceMoon", t); moonSp.visible = mv > 0.01; moonSp.scale.setScalar(Math.max(0.01, mv)); const mpos = val("spaceMoonPos", t) || [-28, 6, -30]; moonSp.position.set(mpos[0], mpos[1], mpos[2]); moonSp.rotation.y = t * 0.02;
      const lz = num("laser", t); laser.visible = lz > 0.01; if (laser.visible) { const a = new THREE.Vector3(mpos[0], mpos[1], mpos[2]).normalize().multiplyScalar(10.05), b2 = moonSp.position;
        const mid = a.clone().add(b2).multiplyScalar(0.5); laser.position.copy(mid); laser.scale.set(1, a.distanceTo(b2), 1); laser.lookAt(b2); laser.rotateX(Math.PI / 2); laser.material.opacity = lz * (0.6 + 0.4 * Math.sin(t * 20)); }
      space.add(cam); return space;
    }
    const p = val("camPos", t) || [0, 1.65, 6], l = val("camLook", t) || [0, 6, -60];
    cam.position.set(p[0] + hx, p[1] + hy, p[2]);
    cam.lookAt(l[0] + hx * 4, l[1] + hy * 4, l[2]);
    cam.rotateZ(num("roll", t));
    cam.fov = num("fov", t, 52); cam.updateProjectionMatrix();

    if (SETS[set]) { const sc = SETS[set].update(t, l, p); sc.add(cam); return sc; }
    if (set === "bunker") {
      flames.forEach((f, i) => { const u = f.userData; const k = (t * 1.6 + i / 7) % 1;
        f.position.set(0.5 + u.x + Math.sin(t * 7 + u.ph) * 0.06, 1.05 + k * 0.7, -5); f.scale.setScalar(0.9 * (1 - k) + 0.2); f.material.opacity = 1 - k; });
      fireLight.intensity = 2.2 + Math.sin(t * 13) * 0.3 + Math.sin(t * 7.3) * 0.3;
      bPeople.forEach((g, i) => { g.rotation.z = Math.sin(t * 1.3 + i) * 0.03; });
      bunker.add(cam); return bunker;
    }

    skyU.top.value.copy(col("skyTop", t)); skyU.horizon.value.copy(col("skyHorizon", t)); skyU.bottom.value.copy(col("skyBottom", t));
    park.fog.color.copy(col("skyHorizon", t)); park.fog.far = num("fogFar", t, 1400); park.fog.near = park.fog.far * 0.09;
    const sunVis = num("sun", t, 1); const sd = val("sunDir", t) || [0.3, 0.3, -1];
    const v = new THREE.Vector3(sd[0], sd[1], sd[2]).normalize();
    sunGroup.position.copy(v.clone().multiplyScalar(900)); sunGroup.scale.setScalar(Math.max(0.001, sunVis)); sunGroup.visible = sunVis > 0.005;
    sunLight.position.copy(v.clone().multiplyScalar(100)); sunLight.intensity = num("light", t, 1) * 1.1; sunLight.color.copy(col("lightColor", t));
    hemi.intensity = num("ambient", t, 0.9); hemi.color.copy(col("ambientColor", t)); coldLight.intensity = num("cold", t);

    const frost = num("frost", t);
    groundMat.color.copy(new THREE.Color(0x3f7a2c).lerp(new THREE.Color(0xe9f0f8), frost));
    pathMat.color.copy(new THREE.Color(0xb9ab92).lerp(new THREE.Color(0xeef3fa), frost));
    leafMat.color.copy(new THREE.Color(0x2f5a25).lerp(new THREE.Color(0xd7e2ee), frost * 0.85));
    pondMat.color.copy(new THREE.Color(0x3b6e8f).lerp(new THREE.Color(0xcfe6f7), num("pondIce", t)));
    const cl = num("cityLights", t);
    cityMats.forEach((m, k) => { const f = clamp01(cl * 3 - k); m.emissiveIntensity = f * (0.85 + 0.15 * Math.sin(t * 9 + k * 2)); });
    city.visible = num("city", t, 1) > 0.5; village.visible = num("village", t) > 0.5;
    const lampOn = num("lamps", t); lamps.forEach((g, i) => { g.material.opacity = clamp01(lampOn * 14 - i) * 0.9; });
    bulbMat.color.setRGB(0.33 + 0.67 * lampOn, 0.33 + 0.6 * lampOn, 0.33 + 0.3 * lampOn);

    // people
    const pv = num("people", t, 1), walk = num("walk", t, 1), look = num("lookUp", t), point = num("point", t), flee = num("flee", t), phones = num("phones", t);
    blanket.visible = pv > 0.6;
    people.forEach((g, i) => { const u = g.userData; g.visible = (i + 0.5) / people.length < pv; if (!g.visible) return;
      let x = u.x, z = u.z, ry = u.rot;
      if (u.mode === "walk") { const d = (t * u.speed * walk + u.phase * 3) % 40 - 20; x = u.x + Math.sin(u.rot) * d; z = u.z + Math.cos(u.rot) * d;
        u.legs.forEach((l, k) => { l.rotation.x = Math.sin(t * 6 * u.speed * walk + k * 3.14) * 0.5 * walk; });
        u.arms.forEach((a, k) => { a.rotation.x = Math.sin(t * 6 * u.speed * walk + k * 3.14 + 3.14) * 0.4 * walk; }); }
      if (flee > 0) { const away = Math.sign(u.x || 1); x += away * flee * (8 + (i % 5) * 4); ry = away > 0 ? Math.PI / 2 : -Math.PI / 2;
        u.legs.forEach((l, k) => { l.rotation.x = Math.sin(t * 10 + k * 3.14) * 0.7 * Math.min(1, flee * 4); }); }
      g.position.set(x, 0, z); g.rotation.y = ry;
      u.head.rotation.x = -look * 0.7;
      if (i % 3 === 0 && point > 0) { u.arms[1].rotation.x = -2.6 * point; u.arms[1].rotation.z = 0.2 * point; }
      u.phone.visible = phones > 0.5 && i % 2 === 0 && u.mode !== "sit"; });

    // cars
    const traffic = num("traffic", t, 1), heads = num("headlights", t);
    cars.forEach((g, i) => { const u = g.userData; const span = 900; const x = ((u.x0 + u.dir * u.speed * traffic * t) % span + span * 1.5) % span - span / 2;
      g.position.set(x, 0, -128 + u.lane); g.rotation.y = u.dir > 0 ? 0 : Math.PI; g.visible = i / cars.length < num("cars", t, 1);
      u.glow.material.opacity = heads * 0.9; });
    headMat.color.setRGB(0.6 + 0.4 * heads, 0.6 + 0.35 * heads, 0.5 + 0.2 * heads);

    // sky things
    const ml = num("moon", t); const mp = val("moonPos", t) || [120, 260, -700];
    moon.position.set(mp[0], mp[1], mp[2]); moonMat.color.setRGB(0.05 + 0.87 * ml, 0.06 + 0.86 * ml, 0.08 + 0.86 * ml); moon.visible = num("moonShow", t) > 0.01;
    starMat.opacity = num("stars", t);
    const bv = num("birds", t), scat = num("scatter", t);
    birds.forEach((g, i) => { const u = g.userData; g.visible = bv > 0.01;
      g.position.set(u.ox + Math.sin(t * 0.3 + u.ph) * 6 + scat * (u.ox * 2.5), u.oy + scat * (20 + i), u.oz + t * 1.5 - scat * 40);
      g.children.forEach((w) => { w.rotation.z = Math.sin(t * 12 + u.ph) * 0.7 * w.userData.s; }); });

    const sn = num("snow", t); snowMat.opacity = sn; const fall = 2.4 + num("wind", t) * 6;
    for (let i = 0; i < NS; i++) { const y = snow0[i * 3 + 1] - t * fall; snowPos[i * 3 + 1] = ((y % 40) + 40) % 40;
      snowPos[i * 3] = snow0[i * 3] + Math.sin(t * 0.8 + i) * 0.6 + num("wind", t) * ((t * 9 + i) % 30 - 15); snowPos[i * 3 + 2] = snow0[i * 3 + 2]; }
    snowGeo.attributes.position.needsUpdate = true;
    const hk = num("hatch", t); hatch.visible = hk > 0.01; hatchLight.intensity = hk * 2.2; doorMat.color.setRGB(1, 0.62 * hk + 0.1, 0.25 * hk);
    const vo = num("volcano", t); volcano.visible = vo > 0.01; const as = num("ash", t);
    ash.forEach((m) => { const u = m.userData; const k = clamp01(as * 1.4 - u.k * 0.6); m.visible = k > 0.01; m.scale.setScalar(Math.max(0.01, k));
      m.position.set(u.x * (1 + k), u.y * (0.6 + k * 0.8), u.z); });
    fitShadow(sunLight, new THREE.Vector3(l[0] * 0.15 + p[0] * 0.85, 0, l[2] * 0.15 + p[2] * 0.85), 45);
    park.add(cam); return park;
  }
  function draw(t) {
    const mb = num("mblur", t), n = mb > 0 ? 4 : 1, shutter = (1 / 30) * mb; windU.value = t * (1 + num("wind", t) * 3);
    dofMat.uniforms.amount.value = num("dof", t); dofMat.uniforms.focus.value = num("focus", t, 5);
    for (let i = 0; i < n; i++) {
      const sc = update(t - (shutter * i) / n);
      renderer.setRenderTarget(rtScene); renderer.render(sc, cam);
      dofMat.uniforms.opacity.value = 1 / (i + 1);
      renderer.setRenderTarget(rtAcc); renderer.autoClear = i === 0; renderer.render(postScene, postCam); renderer.autoClear = true;
    }
    const cu = copyMat.uniforms; cu.exposure.value = num("exposure", t, 1); cu.contrast.value = num("contrast", t, 1); cu.saturation.value = num("saturation", t, 1);
    cu.warmth.value = num("warmth", t); cu.vignette.value = num("vignette", t); cu.grain.value = num("grain", t); cu.tonemap.value = num("tonemap", t); cu.seed.value = (Math.floor(t * 30) % 97) * 0.37;
    renderer.setRenderTarget(null); renderer.render(copyScene, postCam);
  }
  window.WI_DRAW = draw;
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady["world"] = Promise.all(loads).then(() => draw(0));
  draw(0);
})();
