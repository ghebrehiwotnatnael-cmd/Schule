/* "ocean": a boat above the Mariana Trench and the whole 10,935 m water column below it.  World y = -depth in metres.
   The look follows the camera depth: turquoise sunlit water -> deep blue twilight -> indigo midnight with bioluminescence -> the floor.
   Life on the way down (placed along the dive line x ~ 6, z ~ 0): fish school + manta (0-60 m), jellyfish (200-1300 m),
   sperm whale fighting a giant squid (~2,000 m), anglerfish (~6,000 m), snailfish (~8,300 m), amphipods + the plastic bag on the floor.
   Tracks: diverPos (you, seen from outside), diverRot, diverMode, starPos/starRot/starMode/starFace (your friend on the boat),
   torch 0..1 (your head lamp), splashAt (time of the splash), bagLight 0..1 (lamp on the bag), snow 0..1. */
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];
  B.push(function (WI) {
    const { THREE, R, rr, num, col, val, glowTex, canvasTex, smooth, clamp01 } = WI;
    const K = window.WI_COMMON(WI), MK = window.WI_MODELKIT(WI), BL = window.WI_BLOCKY(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene); const env = MK.envs(scene);
    const skyMesh = scene.children.find((o) => o.isMesh && o.geometry.parameters && o.geometry.parameters.radius === 1800);
    const C = (h) => new THREE.Color(h).convertSRGBToLinear();
    const FLOOR = 10935, DX = 6;
    const add = (o) => { scene.add(o); return o; };

    // ------------------------------------------------ the sea surface (seen from above and from below)
    const seaGeo = new THREE.PlaneGeometry(3000, 3000, 160, 160); seaGeo.rotateX(-Math.PI / 2);
    const seaU = { uTime: { value: 0 } };
    const sea = add(new THREE.Mesh(seaGeo, new THREE.MeshStandardMaterial({ color: C("#0b5fa8"), roughness: 0.12, metalness: 0.05, side: THREE.DoubleSide, transparent: true, opacity: 0.96 })));
    sea.material.onBeforeCompile = (sh) => { sh.uniforms.uTime = seaU.uTime; sh.vertexShader = "uniform float uTime;\n" + sh.vertexShader.replace("#include <begin_vertex>",
      "#include <begin_vertex>\n transformed.y += sin(position.x*0.08 + uTime*1.1)*0.28 + sin(position.z*0.11 - uTime*1.4)*0.22 + sin((position.x+position.z)*0.3 + uTime*2.2)*0.06;"); };
    sea.userData.noShadow = true; sea.receiveShadow = true;
    const foamTex = canvasTex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(255,255,255,${rr(0.2, 0.8)})`; g.beginPath(); g.ellipse(R() * w, R() * h, rr(2, 10), rr(1, 3), R() * 3, 0, 7); g.fill(); } });
    foamTex.wrapS = foamTex.wrapT = THREE.RepeatWrapping; foamTex.repeat.set(60, 60);
    const foam = add(new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshBasicMaterial({ map: foamTex, transparent: true, opacity: 0.25, depthWrite: false })));
    foam.rotation.x = -Math.PI / 2; foam.position.y = 0.32;
    // the boat
    const boat = add(new THREE.Group()); { const hullM = MK.std(C("#f4f1ea"), { roughness: 0.5 }), red = MK.std(C("#c62828")), wood = MK.std(C("#b98b5a"), { roughness: 0.8 }), blue = MK.std(C("#1e4f8c"));
      const hull = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.8, 13), hullM); hull.position.y = 0.6; boat.add(hull);
      const stripeB = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.25, 13.05), red); stripeB.position.y = 0.0; boat.add(stripeB);
      const bow = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.4, 4), hullM); bow.rotation.x = Math.PI / 2; bow.rotation.y = Math.PI / 4; bow.scale.set(1, 1, 0.55); bow.position.set(0, 0.6, 8.2); boat.add(bow);
      const deckM = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 12.8), wood); deckM.position.y = 1.52; boat.add(deckM);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 3.6), hullM); cabin.position.set(0, 2.65, -3.4); boat.add(cabin);
      const win = new THREE.Mesh(new THREE.BoxGeometry(3.22, 0.7, 2.6), blue); win.position.set(0, 3.0, -3.3); boat.add(win);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 4.0), blue); roof.position.set(0, 3.82, -3.4); boat.add(roof);
      for (const sx of [-1, 1]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 12.6), MK.std(C("#d0d4da"), { metalness: 0.6, roughness: 0.3 })); rail.position.set(sx * 2.1, 2.5, 0); boat.add(rail);
        for (let z = -6; z <= 6; z += 1.5) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 0.05), rail.material); post.position.set(sx * 2.1, 2.0, z); boat.add(post); } }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.09, 8, 20), MK.std(C("#ff6d00"))); ring.position.set(2.16, 2.0, -1.2); ring.rotation.y = Math.PI / 2; boat.add(ring);
      boat.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
    // the splash
    const splash = Array.from({ length: 40 }, (_, i) => { const s = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: WI.puffTex || glowTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })));
      s.userData = { a: R() * 6.283, v: rr(2, 6), u: rr(3, 8) }; return s; });
    // light rays from the surface (seen from below)
    const rayTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,240,0.55)"); gr.addColorStop(1, "rgba(255,255,240,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const rays = Array.from({ length: 22 }, () => { const m = add(new THREE.Mesh(new THREE.PlaneGeometry(rr(2, 6), 140), new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })));
      m.userData = { x: rr(-40, 40), z: rr(-40, 40), r: R() * 3, tilt: rr(0.1, 0.35) }; return m; });

    // ------------------------------------------------ marine snow / bubbles / living lights, wrapped around the camera
    const NS = 2600, snowSeed = Array.from({ length: NS }, () => [R(), R(), R(), R()]);
    const snowGeo = new THREE.BufferGeometry(); snowGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NS * 6), 3));
    const snow = add(new THREE.LineSegments(snowGeo, new THREE.LineBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.7, depthWrite: false })));
    snow.frustumCulled = false;
    const NB = 900, bioSeed = Array.from({ length: NB }, () => [R(), R(), R(), R()]);
    const bioGeo = new THREE.BufferGeometry(); bioGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NB * 3), 3));
    const bc = new Float32Array(NB * 3); const bcols = ["#29e6ff", "#2f7bff", "#a45cff", "#3dffb0", "#ff4fd8"].map((c) => new THREE.Color(c)); for (let i = 0; i < NB; i++) { const c = bcols[i % 5]; bc.set([c.r, c.g, c.b], i * 3); }
    bioGeo.setAttribute("color", new THREE.BufferAttribute(bc, 3));
    const bio = add(new THREE.Points(bioGeo, new THREE.PointsMaterial({ map: glowTex, size: 0.9, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
    bio.frustumCulled = false;
    const NBu = 300, bubSeed = Array.from({ length: NBu }, () => [R(), R(), R(), R()]);
    const bubGeo = new THREE.BufferGeometry(); bubGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NBu * 3), 3));
    const bubbles = add(new THREE.Points(bubGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xdffbff, size: 0.2, transparent: true, opacity: 0, depthWrite: false })));
    bubbles.frustumCulled = false;

    // ------------------------------------------------ creatures
    const glowMat = (c, o = 0.9) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
    // fish school (instanced): body + tail as one small mesh
    const fishGeo = (() => { const g = new THREE.ConeGeometry(0.09, 0.42, 5); g.rotateX(Math.PI / 2); const t = new THREE.ConeGeometry(0.08, 0.14, 3); t.rotateX(-Math.PI / 2); t.translate(0, 0, -0.25);
      const a = g.toNonIndexed(), b = t.toNonIndexed(); const p = new Float32Array(a.attributes.position.count * 3 + b.attributes.position.count * 3); p.set(a.attributes.position.array); p.set(b.attributes.position.array, a.attributes.position.count * 3);
      const out = new THREE.BufferGeometry(); out.setAttribute("position", new THREE.BufferAttribute(p, 3)); out.computeVertexNormals(); return out; })();
    const NF = 700; const fish = add(new THREE.InstancedMesh(fishGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.6 }), NF));
    const fishSeed = Array.from({ length: NF }, (_, i) => ({ r: rr(2, 7), ph: R() * 6.283, h: rr(-3, 3), sp: rr(0.35, 0.5), y0: rr(14, 30) }));
    { const c = new THREE.Color(); for (let i = 0; i < NF; i++) fish.setColorAt(i, c.set(i % 7 === 0 ? "#ffd23f" : i % 3 ? "#c9e7ff" : "#7fd6ff").convertSRGBToLinear()); }
    fish.frustumCulled = false;
    // manta ray
    const manta = add(new THREE.Group()); { const m = MK.std(C("#1d2a3a"), { roughness: 0.6 }), belly = MK.std(C("#e8eef2"));
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 8), m); body.scale.set(1, 0.25, 1.4); manta.add(body);
      manta.userData.wings = [-1, 1].map((s) => { const w = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 3), m); w.rotation.z = s * Math.PI / 2; w.scale.set(0.35, 1, 0.12); w.position.x = s * 1.6; const pv = new THREE.Group(); pv.add(w); manta.add(pv); return pv; });
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.06, 2.6, 5), m); tail.rotation.x = Math.PI / 2; tail.position.z = -2.2; manta.add(tail);
      [-1, 1].forEach((s) => { const h = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.7), m); h.position.set(s * 0.55, 0, 1.3); manta.add(h); }); }
    manta.scale.setScalar(1.6);
    // sea turtle
    const turtle = add(new THREE.Group()); { const shell = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 6), MK.std(C("#6b5a2e"))); shell.scale.set(1, 0.4, 1.25); turtle.add(shell);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), MK.std(C("#8aa36b"))); head.position.set(0, 0, 0.85); turtle.add(head);
      turtle.userData.fl = [[-1, 0.4], [1, 0.4], [-1, -0.5], [1, -0.5]].map(([s, z]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.25), MK.std(C("#8aa36b"))); f.geometry.translate(s * 0.35, 0, 0); const pv = new THREE.Group(); pv.position.set(s * 0.45, 0, z); pv.add(f); turtle.add(pv); return pv; }); }
    // jellyfish (glowing bells with tentacles)
    const jellies = Array.from({ length: 46 }, (_, i) => { const g = add(new THREE.Group()); const c = ["#ff6ad5", "#6af0ff", "#b38cff", "#ffd36a"][i % 4];
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), glowMat(C(c), 0.55)); g.add(bell);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 6), glowMat(C(c), 0.8)); core.position.y = 0.12; g.add(core);
      const tent = []; for (let k = 0; k < 8; k++) { const pts = []; for (let j = 0; j <= 8; j++) pts.push(new THREE.Vector3(Math.cos(k) * 0.3, -j * 0.28, Math.sin(k) * 0.3));
        const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: C(c), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })); g.add(ln); tent.push(ln); }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: C(c), transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); glow.scale.setScalar(2.4); g.add(glow);
      const d = 200 + Math.pow(R(), 0.8) * 1100, a = R() * 6.283, r = rr(3, 16); g.position.set(DX + Math.cos(a) * r, -d, Math.sin(a) * r); g.userData = { ph: R() * 6, y0: -d, s: rr(0.6, 1.5), bell, tent };
      g.scale.setScalar(g.userData.s); return g; });
    // sperm whale vs giant squid at ~2,000 m
    const WD = 2000; const whale = add(new THREE.Group()); { const skin = MK.std(C("#6f7782"), { roughness: 0.8 }), scar = MK.std(C("#9aa1aa"));
      const head = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 6.5), skin); head.position.z = 3; whale.add(head);
      const prof = [[0.2, -12], [0.9, -10], [1.8, -6], [2.2, -2], [2.0, 0.2]].map(([r, y]) => new THREE.Vector2(r, y)); const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 10), skin); body.rotation.x = -Math.PI / 2; body.rotation.x = Math.PI / 2; body.position.z = 0; whale.add(body);
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 5), MK.std(C("#d9d4cc"))); jaw.position.set(0, -1.9, 3.4); whale.add(jaw); whale.userData.jaw = jaw;
      const fl = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.15, 1.4), skin); fl.position.z = -12.6; whale.add(fl); whale.userData.fluke = fl;
      [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), MK.std(0x050505)); e.position.set(s * 1.62, -0.6, 1.2); whale.add(e);
        const fin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.8), skin); fin.position.set(s * 2.1, -1.2, -0.5); fin.rotation.z = s * 0.4; whale.add(fin); });
      for (let k = 0; k < 10; k++) { const sc = new THREE.Mesh(new THREE.TorusGeometry(rr(0.2, 0.4), 0.04, 4, 12), scar); sc.position.set(rr(-1.6, 1.6) > 0 ? 1.61 : -1.61, rr(-1.2, 1.2), rr(1, 5.5)); sc.rotation.y = Math.PI / 2; whale.add(sc); } }
    whale.position.set(DX + 14, -WD, -8); whale.rotation.y = -2.36;
    const whaleL = new THREE.PointLight(0x9fc8ff, 1.6, 45, 1.5); whaleL.position.set(DX + 4, -WD + 10, 4); scene.add(whaleL);
    const squid = add(new THREE.Group()); { const red = MK.std(C("#c2412f"), { roughness: 0.5 }), pale = MK.std(C("#e98b6c"));
      const mantle = new THREE.Mesh(new THREE.ConeGeometry(0.9, 4.2, 10), red); mantle.rotation.x = -Math.PI / 2; mantle.position.z = -2.2; squid.add(mantle);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), MK.std(0x0a0a0a, { roughness: 0.1, metalness: 0.5 })); eye.position.set(0.75, 0, 0.1); squid.add(eye); const eye2 = eye.clone(); eye2.position.x = -0.75; squid.add(eye2);
      squid.userData.arms = Array.from({ length: 10 }, (_, k) => { const long = k >= 8; const n = long ? 18 : 10; const pts = []; for (let j = 0; j <= n; j++) pts.push(new THREE.Vector3(0, 0, j * (long ? 0.5 : 0.32)));
        const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, long ? 0.07 : 0.11, 5), k % 2 ? pale : red); const pv = new THREE.Group(); pv.add(tube);
        const a = k / 8 * 6.283; pv.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0.4); pv.userData = { a, long, ph: R() * 6 }; squid.add(pv); return pv; }); }
    squid.position.set(DX + 14 - 0.707 * 8.2, -WD + 0.4, -8 - 0.707 * 8.2); squid.rotation.y = -2.36 + Math.PI;
    // anglerfish at ~6,000 m
    const AD = 5995; const angler = add(new THREE.Group()); { const dark = MK.std(C("#2a2230"), { roughness: 0.9 });
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), dark); body.scale.set(1, 0.9, 1.2); angler.add(body);
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.2), dark); jaw.position.set(0, -0.55, 0.75); jaw.rotation.x = 0.35; angler.add(jaw); angler.userData.jaw = jaw;
      for (let k = 0; k < 14; k++) { const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.05, rr(0.2, 0.42), 4), MK.std(C("#f2eee6"))); const a = (k / 13 - 0.5) * 2.4;
        tooth.position.set(Math.sin(a) * 0.7, k % 2 ? -0.35 : -0.05, 1.0 + Math.cos(a) * 0.15); tooth.rotation.x = k % 2 ? 0 : Math.PI; angler.add(tooth); }
      const stalkPts = [new THREE.Vector3(0, 0.8, 0.3), new THREE.Vector3(0, 1.7, 0.9), new THREE.Vector3(0, 1.6, 1.9)];
      angler.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stalkPts), 12, 0.035, 5), dark));
      const lure = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ color: C("#9dfcff") })); lure.position.set(0, 1.55, 1.95); angler.add(lure);
      const lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: C("#5ff6ff"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); lg.scale.setScalar(2.2); lg.position.copy(lure.position); angler.add(lg);
      const ll = new THREE.PointLight(0x7ff9ff, 2.2, 7, 2); ll.position.copy(lure.position); angler.add(ll); angler.userData.lure = [lg, ll];
      [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), MK.std(0xdddddd, { roughness: 0.1 })); e.position.set(s * 0.55, 0.35, 0.85); angler.add(e); });
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.9, 4), dark); tail.rotation.x = Math.PI / 2; tail.position.z = -1.4; tail.scale.set(0.2, 1, 1); angler.add(tail); }
    angler.position.set(DX + 2.6, -AD, 3.5); angler.rotation.y = Math.PI + 0.6;
    // snailfish (pale, translucent) at ~8,300 m
    const snailfish = Array.from({ length: 10 }, (_, i) => { const g = add(new THREE.Group()); const m = new THREE.MeshStandardMaterial({ color: C("#f1c7c4"), transparent: true, opacity: 0.75, roughness: 0.3 });
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), m); b.scale.set(1, 0.9, 1.3); g.add(b); const t = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 6), m); t.rotation.x = -Math.PI / 2; t.position.z = -0.55; g.add(t);
      g.userData = { a: R() * 6.283, r: rr(1.6, 4), y0: -8336 + rr(-3, 3), ph: R() * 6 }; return g; });
    // the floor
    const sedTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#a69a86"; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = rr(0.75, 1.15); g.fillStyle = `rgba(${150 * v | 0},${140 * v | 0},${122 * v | 0},0.6)`; g.fillRect(R() * w, R() * h, rr(1, 4), rr(1, 4)); }
      for (let i = 0; i < 40; i++) { g.strokeStyle = "rgba(70,62,52,0.25)"; g.lineWidth = 2; g.beginPath(); g.moveTo(R() * w, R() * h); g.bezierCurveTo(R() * w, R() * h, R() * w, R() * h, R() * w, R() * h); g.stroke(); } });
    sedTex.wrapS = sedTex.wrapT = THREE.RepeatWrapping; sedTex.repeat.set(40, 40); sedTex.anisotropy = 8;
    const floorGeo = new THREE.PlaneGeometry(400, 400, 80, 80); floorGeo.rotateX(-Math.PI / 2); { const p = floorGeo.attributes.position; for (let i = 0; i < p.count; i++) { const k = Math.min(1, Math.hypot(p.getX(i), p.getZ(i)) / 40); p.setY(i, (Math.sin(p.getX(i) * 0.07) * 0.6 + Math.cos(p.getZ(i) * 0.05) * 0.8) * k + rr(-0.03, 0.03)); } floorGeo.computeVertexNormals(); }
    const floor = add(new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: sedTex, roughness: 1 }))); floor.position.set(DX, -FLOOR, 0); floor.receiveShadow = true;
    for (let i = 0; i < 40; i++) { const r = add(new THREE.Mesh(new THREE.DodecahedronGeometry(rr(0.2, 1.6), 0), MK.std(C("#5c564d"), { roughness: 1 }))); const a = R() * 6.283, d = rr(4, 60); r.position.set(DX + Math.cos(a) * d, -FLOOR + 0.2, Math.sin(a) * d); r.scale.y = rr(0.4, 0.8); }
    // trench walls in the distance
    [-1, 1].forEach((s) => { const w = add(new THREE.Mesh(new THREE.PlaneGeometry(2000, 3000, 30, 30), new THREE.MeshStandardMaterial({ color: C("#3d3a46"), roughness: 1 }))); const p = w.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, rr(-20, 20)); w.geometry.computeVertexNormals();
      w.position.set(DX + s * 160, -FLOOR + 1500, 0); w.rotation.y = -s * Math.PI / 2; });
    // amphipods
    const NA = 120; const amph = add(new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.04, 0.16, 3, 6), MK.std(C("#f3e6c6"), { roughness: 0.4 }), NA)); const amphSeed = Array.from({ length: NA }, () => [rr(-8, 8), rr(-8, 8), R() * 6.283, rr(0.2, 0.6)]); amph.frustumCulled = false;
    // sea cucumbers
    for (let i = 0; i < 8; i++) { const c = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.7, 4, 8), new THREE.MeshStandardMaterial({ color: C("#e7a6b8"), transparent: true, opacity: 0.8, roughness: 0.3 }))); c.rotation.z = Math.PI / 2; c.rotation.y = R() * 6; c.position.set(DX + rr(-7, 7), -FLOOR + 0.25, rr(-7, 7)); }
    // the plastic bag
    const bag = add(new THREE.Group()); { const geo = new THREE.PlaneGeometry(1.0, 1.3, 24, 24); const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, Math.sin(x * 9 + y * 4) * 0.06 + Math.cos(y * 11) * 0.05 + (Math.abs(x) < 0.2 ? 0.1 : 0)); p.setY(i, y * (1 - 0.25 * Math.abs(x))); } geo.computeVertexNormals();
      const tx = canvasTex(256, 320, (g, w, h) => { g.fillStyle = "rgba(245,245,240,0.92)"; g.fillRect(0, 0, w, h); g.fillStyle = "#c62828"; g.font = "bold 34px Arial"; g.textAlign = "center"; g.fillText("THANK YOU", w / 2, h * 0.45); g.font = "bold 24px Arial"; g.fillText("HAVE A NICE DAY", w / 2, h * 0.58); });
      const m = new THREE.MeshStandardMaterial({ map: tx, transparent: true, opacity: 0.88, side: THREE.DoubleSide, roughness: 0.35 });
      const sheet = new THREE.Mesh(geo, m); sheet.rotation.x = -Math.PI / 2 + 0.25; bag.add(sheet);
      [-1, 1].forEach((s) => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 6, 16, Math.PI), m); h.position.set(s * 0.25, 0.02, -0.7); h.rotation.x = -Math.PI / 2 + 0.4; bag.add(h); }); }
    bag.position.set(DX + 1.2, -FLOOR + 0.06, 2.0); bag.rotation.y = 0.5 + Math.PI;
    const bagSpot = new THREE.SpotLight(0xfff4dd, 0, 14, 0.35, 0.6, 1.5); bagSpot.position.set(DX + 1.2, -FLOOR + 6, 4); bagSpot.target = bag; scene.add(bagSpot);
    // sediment puff on landing
    const puffs = Array.from({ length: 30 }, (_, i) => { const s = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: WI.puffTex || glowTex, color: 0xb9ab95, transparent: true, depthWrite: false, opacity: 0 }))); s.userData = { a: i / 30 * 6.283, r: rr(0.6, 1.4) }; return s; });

    // ------------------------------------------------ you (diver) and your friend on the boat
    const diverP = { name: "you", male: true, beard: false, hair: new THREE.Color("#1b1310"), glasses: true, shirt: C("#14202e"), longSleeve: true, legs: C("#14202e"), skin: C("#d39a6e"), s: 1.0, face: 2, x: 0, y: -60, z: 0, mode: "idle" };
    const diver = BL.crowd(scene, [diverP]);
    const stripe = add(new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.28), MK.std(C("#ff8a00")))); stripe.matrixAutoUpdate = false;
    const lampSpot = new THREE.SpotLight(0xf2f8ff, 0, 34, 0.5, 0.55, 1.2); scene.add(lampSpot); scene.add(lampSpot.target);
    const lampGlow = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xeaf6ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false })));
    const camLamp = new THREE.SpotLight(0xf2f8ff, 0, 30, 0.55, 0.6, 1.2); WI.cam.add(camLamp); camLamp.position.set(0.2, 0.1, 0); camLamp.target.position.set(0, -0.2, -5); WI.cam.add(camLamp.target);
    const starP = { name: "star", male: true, beard: false, hair: new THREE.Color("#0d0907"), afro: true, mustache: true, glasses: true, tie: true, tieCol: new THREE.Color("#0b0b0d"),
      shirt: C("#b5121b"), longSleeve: true, skirt: false, legs: new THREE.Color("#121214"), skin: C("#5a3826"), s: 1.08, face: 7, x: 0, y: 1.5, z: 0, mode: "point" };
    const star = BL.crowd(scene, [starP]);
    const starGlit = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(160 * 3), 3)),
      new THREE.PointsMaterial({ map: glowTex, color: 0xffd0c0, size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); starGlit.frustumCulled = false; scene.add(starGlit);
    const glitLoc = Array.from({ length: 160 }, (_, i) => { const nm = i < 100 ? "torso" : i < 130 ? "armL" : "armR"; const w = nm === "torso" ? 0.46 : 0.135, d = nm === "torso" ? 0.26 : 0.135, cy = nm === "torso" ? 0.3 : -0.28;
      const f = i % 3; return [nm, f === 2 ? (R() < 0.5 ? -1 : 1) * (w / 2 + 0.006) : rr(-w / 2, w / 2), cy + rr(-0.3, 0.3), f === 0 ? d / 2 + 0.006 : f === 1 ? -d / 2 - 0.006 : rr(-d / 2, d / 2)]; });
    const starFill = new THREE.PointLight(0xffe2cc, 1.2, 3, 2); scene.add(starFill);

    // ------------------------------------------------ depth-driven look
    const stops = [[0, "#22c3d6", 90], [40, "#118fc4", 75], [200, "#0b56a6", 60], [700, "#0d3486", 50], [1500, "#10266e", 44], [6000, "#131d62", 40], [11000, "#151d58", 38]].map(([d, c, f]) => [d, C(c), f]);
    const fogC = new THREE.Color(); const tmpM = new THREE.Matrix4(), tv = new THREE.Vector3(), tq = new THREE.Quaternion(), ts = new THREE.Vector3();
    const bgAbove = new THREE.Color();
    return { name: "ocean", scene, update(t, look, pos) {
      const depth = -pos[1]; const under = depth > 0.15;
      sky(t, num, col); env(t);
      L.update(t, num, col, new THREE.Vector3(pos[0], Math.min(pos[1], 2), pos[2]), 30);
      seaU.uTime.value = t; foam.material.map.offset.set(t * 0.003, t * 0.002);
      if (under) { let k = 0; while (k < stops.length - 2 && depth > stops[k + 1][0]) k++; const a = stops[k], b = stops[k + 1]; const f = clamp01((depth - a[0]) / (b[0] - a[0]));
        fogC.copy(a[1]).lerp(b[1], f); scene.fog.color.copy(fogC); scene.fog.far = a[2] + (b[2] - a[2]) * f; scene.fog.near = 1.5; scene.background = fogC; if (skyMesh) skyMesh.visible = false;
        const sunK = Math.exp(-depth / 70); L.sun.intensity *= sunK; L.hemi.intensity = num("ambient", t, 0.3) * (0.25 + 0.75 * Math.exp(-depth / 140)) + 0.22; L.hemi.color.copy(fogC).lerp(new THREE.Color(0xffffff), 0.35);
        WI.envIntensity(scene, num("envI", t, 0.5) * (0.2 + 0.8 * Math.exp(-depth / 200))); }
      else { scene.background = null; if (skyMesh) skyMesh.visible = true; }
      sea.visible = depth < 140; foam.visible = !under; sea.material.emissive.copy(under ? new THREE.Color(0x8ff3ff) : new THREE.Color(0x000000)); sea.material.emissiveIntensity = under ? 0.45 * Math.exp(-depth / 25) : 0;
      // rays
      rays.forEach((m, i) => { const u = m.userData; m.visible = under && depth < 160; if (!m.visible) return; m.position.set(pos[0] + u.x, -60, pos[2] + u.z); m.rotation.set(0, u.r + t * 0.02, u.tilt);
        m.material.opacity = 0.22 * Math.exp(-depth / 60) * (0.7 + 0.3 * Math.sin(t * 0.7 + i)); });
      // splash
      const sa = t - num("splashAt", t, -99); splash.forEach((s) => { const u = s.userData; s.visible = sa > 0 && sa < 2.2; if (!s.visible) return; const sp = val("splashPos", t) || [DX, 0, 0];
        s.position.set(sp[0] + Math.cos(u.a) * (0.4 + sa * u.v * 0.4), sa * u.u - sa * sa * 4.9 + 0.2, sp[2] + Math.sin(u.a) * (0.4 + sa * u.v * 0.4)); s.scale.setScalar(0.5 + sa * 0.8); s.material.opacity = 0.9 * (1 - sa / 2.2); });
      // particles around the camera
      { const a = snowGeo.attributes.position.array; const pp = val("camPos", t - 1 / 30) || pos; const vy = (pos[1] - pp[1]) * 30; const len = Math.max(0.05, Math.min(9, Math.abs(vy) / 30 * 1.6));
        for (let i = 0; i < NS; i++) { const s = snowSeed[i]; const x = pos[0] + (s[0] - 0.5) * 24, z = pos[2] + (s[2] - 0.5) * 24; const y0 = s[1] * 24 - t * (0.15 + s[3] * 0.2); const y = y0 + 24 * Math.round((pos[1] - y0) / 24);
          a[i * 6] = x; a[i * 6 + 1] = y; a[i * 6 + 2] = z; a[i * 6 + 3] = x; a[i * 6 + 4] = y + len; a[i * 6 + 5] = z; }
        snowGeo.attributes.position.needsUpdate = true; snow.visible = under; snow.material.opacity = num("snow", t, 0.75) * (depth < 50 ? 0.35 : 0.7) * (len > 1 ? 0.6 : 1); snow.material.color.copy(depth > 800 ? new THREE.Color(0xc8d8ff) : new THREE.Color(0xf0fbff)); }
      { const vis = clamp01((depth - 500) / 400); bio.material.opacity = vis * 0.95; bio.visible = vis > 0.01; if (bio.visible) { const a = bioGeo.attributes.position.array;
        for (let i = 0; i < NB; i++) { const s = bioSeed[i]; const blink = Math.sin(t * (1 + s[3] * 3) + s[3] * 40) > 0.2 ? 1 : 0; a[i * 3] = pos[0] + (s[0] - 0.5) * 40; { const y0 = s[1] * 40 + Math.sin(t * 0.3 + i) * 0.5; a[i * 3 + 1] = blink ? y0 + 40 * Math.round((pos[1] - y0) / 40) : -99999; } a[i * 3 + 2] = pos[2] + (s[2] - 0.5) * 40; }
        bioGeo.attributes.position.needsUpdate = true; } }
      { const ba = t - num("splashAt", t, -99); const vis = under && depth < 60 ? clamp01(1.3 - ba / 6) : 0; bubbles.material.opacity = vis * 0.8; bubbles.visible = vis > 0.01; if (bubbles.visible) { const a = bubGeo.attributes.position.array;
        const dp = val("diverPos", t) || pos; for (let i = 0; i < NBu; i++) { const s = bubSeed[i]; a[i * 3] = dp[0] + (s[0] - 0.5) * 1.5 + Math.sin(t * 3 + i) * 0.1; a[i * 3 + 1] = dp[1] + ((s[1] * 8 + t * (1.2 + s[3])) % 8); a[i * 3 + 2] = dp[2] + (s[2] - 0.5) * 1.5; } bubGeo.attributes.position.needsUpdate = true; } }
      // life
      fish.visible = depth < 80; if (fish.visible) { for (let i = 0; i < NF; i++) { const s = fishSeed[i], a = s.ph + t * s.sp; tv.set(DX + 4 + Math.cos(a) * s.r, -s.y0 + s.h + Math.sin(a * 2) * 0.6, Math.sin(a) * s.r);
          tq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a); ts.set(1, 1, 1); tmpM.compose(tv, tq, ts); fish.setMatrixAt(i, tmpM); } fish.instanceMatrix.needsUpdate = true; }
      manta.visible = depth < 120; if (manta.visible) { manta.position.set(DX - 6 + Math.sin(t * 0.15) * 4, -36 + Math.sin(t * 0.3) * 1.2, -8 + t * 0.6 - 10); manta.rotation.y = 0.1; manta.userData.wings.forEach((w, k) => { w.rotation.z = (k ? 1 : -1) * Math.sin(t * 1.6) * 0.35; }); }
      turtle.visible = depth < 80; if (turtle.visible) { turtle.position.set(DX + 3 - t * 0.3 + 6, -18 + Math.sin(t * 0.5) * 0.4, 5); turtle.rotation.y = -Math.PI / 2; turtle.userData.fl.forEach((f, k) => { f.rotation.z = Math.sin(t * 2 + k) * 0.5; }); }
      jellies.forEach((g) => { const u = g.userData; g.visible = Math.abs(u.y0 + depth) < 140; if (!g.visible) return; const pulse = Math.sin(t * 2 + u.ph);
        u.bell.scale.set(1 + pulse * 0.12, 1 - pulse * 0.15, 1 + pulse * 0.12); g.position.y = u.y0 + Math.sin(t * 0.6 + u.ph) * 0.8 + (t % 1000) * 0.05; g.rotation.y = t * 0.1 + u.ph;
        u.tent.forEach((ln, k) => { ln.rotation.x = Math.sin(t * 1.5 + k + u.ph) * 0.15; }); });
      whale.visible = squid.visible = Math.abs(depth - WD) < 220; if (whale.visible) { whale.userData.jaw.rotation.x = 0.1 + Math.max(0, Math.sin(t * 0.9)) * 0.25; whale.userData.fluke.rotation.x = Math.sin(t * 1.2) * 0.25;
        whale.position.y = -WD + Math.sin(t * 0.5) * 0.4; squid.position.y = -WD + 0.4 + Math.sin(t * 0.5) * 0.4;
        squid.userData.arms.forEach((pv) => { const u = pv.userData; pv.rotation.set(Math.sin(t * 1.7 + u.ph) * 0.5 + Math.sin(u.a) * 0.6, Math.cos(u.a) * 0.6 + Math.sin(t * 1.3 + u.ph) * 0.4, 0); }); }
      angler.visible = Math.abs(depth - AD) < 200; if (angler.visible) { const b = 0.75 + 0.25 * Math.sin(t * 3); angler.userData.lure[0].material.opacity = b; angler.userData.lure[1].intensity = 2.2 * b; angler.userData.jaw.rotation.x = 0.35 + Math.max(0, Math.sin(t * 0.8)) * 0.3; angler.position.y = -AD + Math.sin(t * 0.4) * 0.3; }
      snailfish.forEach((g) => { const u = g.userData; g.visible = Math.abs(u.y0 + depth) < 160; if (!g.visible) return; const a = u.a + t * 0.25; g.position.set(DX + Math.cos(a) * u.r, u.y0 + Math.sin(t + u.ph) * 0.3, Math.sin(a) * u.r); g.rotation.y = -a; g.children[1].rotation.y = Math.sin(t * 4 + u.ph) * 0.3; });
      const nearFloor = depth > FLOOR - 200; floor.visible = nearFloor; amph.visible = nearFloor; bag.visible = nearFloor;
      if (nearFloor) { for (let i = 0; i < NA; i++) { const s = amphSeed[i]; const a = s[2] + t * s[3] * 0.4; tv.set(DX + s[0] + Math.cos(a) * 0.6, -FLOOR + 0.08 + Math.abs(Math.sin(t * 6 + i)) * 0.05, s[1] + Math.sin(a) * 0.6); tq.setFromEuler(new THREE.Euler(Math.PI / 2, -a, 0, "YXZ")); tmpM.compose(tv, tq, ts.set(1, 1, 1)); amph.setMatrixAt(i, tmpM); } amph.instanceMatrix.needsUpdate = true; }
      bagSpot.intensity = num("bagLight", t) * 0.7;
      const la = t - num("landAt", t, -99); puffs.forEach((s) => { const u = s.userData; s.visible = la > 0 && la < 5; if (!s.visible) return; const dp = val("diverPos", t) || [DX, -FLOOR, 0]; const r = (0.4 + la * 0.9) * u.r;
        s.position.set(dp[0] + Math.cos(u.a) * r, -FLOOR + 0.3 + la * 0.15, dp[2] + Math.sin(u.a) * r); s.scale.setScalar(0.6 + la * 0.7); s.material.opacity = 0.7 * (1 - la / 5); });
      // diver
      const dp = val("diverPos", t); const dHide = num("diverHide", t) > 0.5; diver.update(t, (p) => { if (!dp || dp[1] > 50 || dHide) { p.hidden = true; return; } p.hidden = false; p.x = dp[0]; p.y = dp[1]; p.z = dp[2]; p.rot = num("diverRot", t, 0); p.mode = val("diverMode", t) || "idle"; p.face = Math.round(num("diverFace", t, 2)); });
      const tk = num("torch", t); const dvis = dp && dp[1] < 50 && !dHide;
      if (dvis) { diver.meshes.torso.getMatrixAt(0, tmpM); stripe.matrix.copy(tmpM).multiply(new THREE.Matrix4().makeTranslation(0, 0.42, 0)); stripe.visible = true;
        diver.meshes.head.getMatrixAt(0, tmpM); tv.set(0, 0.32, 0.2).applyMatrix4(tmpM); lampSpot.position.copy(tv); lampGlow.position.copy(tv); lampSpot.target.position.copy(new THREE.Vector3(0, -2, 6).applyMatrix4(tmpM)); }
      else stripe.visible = false;
      lampSpot.intensity = dvis ? tk * (depth > 10800 ? 1.8 : 3.2) : 0; lampGlow.visible = dvis && tk > 0.01; lampGlow.material.opacity = tk * 0.9; lampGlow.scale.setScalar(0.6);
      camLamp.intensity = num("camLamp", t) * 3.0;
      // friend on the boat
      const sp = val("starPos", t); star.update(t, (p) => { if (!sp) { p.hidden = true; return; } p.hidden = false; p.x = sp[0]; p.y = sp[1]; p.z = sp[2]; p.rot = num("starRot", t, 0); p.mode = val("starMode", t) || "point"; p.face = Math.round(num("starFace", t, 7)); });
      starGlit.visible = !!sp && Math.sin(t * 13) > -0.3; if (starGlit.visible) { const a = starGlit.geometry.attributes.position.array; let last = null; glitLoc.forEach((l, i) => { if (l[0] !== last) { star.meshes[l[0]].getMatrixAt(0, tmpM); last = l[0]; } tv.set(l[1], l[2], l[3]).applyMatrix4(tmpM); a[i * 3] = tv.x; a[i * 3 + 1] = tv.y; a[i * 3 + 2] = tv.z; }); starGlit.geometry.attributes.position.needsUpdate = true;
        star.meshes.torso.getMatrixAt(0, tmpM); starFill.position.copy(new THREE.Vector3(0, 0.75, 0.9).applyMatrix4(tmpM)); }
      starFill.intensity = sp ? 1.2 : 0;
      return scene; } };
  });
})();
