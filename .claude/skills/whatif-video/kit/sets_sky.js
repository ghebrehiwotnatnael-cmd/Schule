/* Sky and space add-ons.
   resort (overlay):  ringSky 0..1 (Saturn-like ring arch over the sea), ringShadow 0..1 (Earth's night shadow on the arch),
                      stars 0..1, sunDisc 0..1 (sun disc + glare along sunDir), ringLat (observer latitude, default 8).
   space  (tick):     earthRing 0..1 (ring around the globe in the equatorial plane), ringRocks 0..1 (ice/rock chunks near the ring).
   solar  (new set):  the Sun at the origin, Mercury/Venus/Earth along +x (1 AU = 1000 units, sizes exaggerated);
                      sunOn 0..1, bh 0..1 (black hole + accretion disk), front (radius of the darkness front, units),
                      shell 0..1 (glowing edge of the last sunlight), dust 0..1.  Camera via camPos/camLook as usual. */
window.WI_OVERLAYS = window.WI_OVERLAYS || [];
window.WI_SPACE_TICK = window.WI_SPACE_TICK || [];
(function () {
  // ring band profile (0 = inner edge .. 1 = outer edge): Saturn-like bands with a Cassini-style gap
  function bandTex(WI) {
    return WI.canvasTex(1024, 4, (g, w, h) => { const im = g.createImageData(w, h);
      for (let x = 0; x < w; x++) { const u = x / (w - 1);
        let a = 0.55 + 0.12 * Math.sin(u * 41 + 0.5) + 0.07 * Math.sin(u * 97) + 0.04 * Math.sin(u * 211);
        if (u > 0.18 && u < 0.62) a += 0.3 * Math.min(1, (u - 0.18) / 0.05, (0.62 - u) / 0.05);   // bright B ring
        if (u > 0.64 && u < 0.69) a *= 0.08;                 // the gap
        if (u < 0.14) a *= 0.25 + 0.4 * u / 0.14;            // faint inner C ring
        if (u > 0.93) a *= (1 - u) / 0.07;
        a = Math.max(0, Math.min(1, a));
        const warm = 0.5 + 0.5 * Math.sin(u * 9);
        for (let y = 0; y < h; y++) { const i = (y * w + x) * 4; im.data[i] = 255; im.data[i + 1] = 238 + 12 * warm; im.data[i + 2] = 214 + 30 * (1 - warm); im.data[i + 3] = a * 255; } }
      g.putImageData(im, 0, 0); });
  }

  window.WI_OVERLAYS.push(function (WI, SETS) {
    const { THREE, num, val, glowTex } = WI;
    const tex = bandTex(WI); tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;

    // ======================= resort: ring arch, stars, sun disc
    const RS = SETS.resort;
    if (RS) {
      const sc = RS.scene; const hold = new THREE.Group(); sc.add(hold);
      const R0 = 1000, rIn = 1.2 * R0, rOut = 2.3 * R0;
      const ringU = { band: { value: tex }, k: { value: 0 }, shadow: { value: 0 }, day: { value: 1 } };
      const NA = 360, NR = 6; const pos = [], uv = [], idx = [];
      function buildArch(latDeg) {
        pos.length = uv.length = idx.length = 0; const ph = latDeg * Math.PI / 180;
        for (let i = 0; i <= NA; i++) { const th = -0.15 + (Math.PI + 0.3) * i / NA;
          for (let j = 0; j <= NR; j++) { const u = j / NR, r = rIn + (rOut - rIn) * u;
            pos.push(r * Math.cos(th), -R0 + r * Math.sin(th) * Math.cos(ph), -r * Math.sin(th) * Math.sin(ph)); uv.push(u, Math.cos(th) * r / R0); } }
        for (let i = 0; i < NA; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      }
      buildArch(8);
      const ag = new THREE.BufferGeometry(); ag.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); ag.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); ag.setIndex(idx);
      const arch = new THREE.Mesh(ag, new THREE.ShaderMaterial({ uniforms: ringU, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
        vertexShader: "varying vec2 vUv; varying float vEl; void main(){ vUv = uv; vec3 d = normalize(position); vEl = d.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: `uniform sampler2D band; uniform float k; uniform float shadow; uniform float day; varying vec2 vUv; varying float vEl;
          void main(){ vec4 b = texture2D(band, vec2(vUv.x, 0.5));
            float hz = smoothstep(-0.005, 0.12, vEl);                       // fades into the haze at the horizon
            float sh = 1.0 - shadow * (1.0 - smoothstep(0.75, 1.05, abs(vUv.y)));  // Earth's shadow cuts the middle of the arch at night
            vec3 c = b.rgb * mix(1.25, 1.0, day) * sh;
            float a = b.a * k * hz * mix(0.95, 0.8, day) * (0.25 + 0.75 * sh);
            gl_FragColor = vec4(c, a); }` }));
      arch.renderOrder = -1; arch.userData.noShadow = true; hold.add(arch);
      // stars
      const sp = []; for (let i = 0; i < 2600; i++) { const th = WI.R() * 6.283, p = Math.acos(WI.rr(0.0, 1)); sp.push(1500 * Math.sin(p) * Math.cos(th), 1500 * Math.cos(p), 1500 * Math.sin(p) * Math.sin(th)); }
      const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
      const stars = new THREE.Points(sg, starMat); stars.renderOrder = -2; hold.add(stars);
      // sun disc + glare
      const sun = new THREE.Group(); hold.add(sun);
      const core = new THREE.Mesh(new THREE.CircleGeometry(16, 40), new THREE.MeshBasicMaterial({ color: 0xfffbea, fog: false, transparent: true, depthWrite: false }));
      const glow1 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe9a8, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
      const glow2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb35c, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
      glow1.scale.set(160, 160, 1); glow2.scale.set(520, 520, 1); sun.add(glow2, glow1, core);
      let lastLat = 8;
      const orig = RS.update.bind(RS);
      RS.update = function (t, look, p) { const out = orig(t, look, p);
        hold.position.set(p[0], p[1], p[2]);
        const lat = num("ringLat", t, 8); if (Math.abs(lat - lastLat) > 0.01) { buildArch(lat); ag.attributes.position.array.set(pos); ag.attributes.position.needsUpdate = true; ag.attributes.uv.array.set(uv); ag.attributes.uv.needsUpdate = true; lastLat = lat; }
        const rk = num("ringSky", t); arch.visible = rk > 0.005; ringU.k.value = rk; ringU.shadow.value = num("ringShadow", t); ringU.day.value = 1 - num("stars", t);
        starMat.opacity = num("stars", t); stars.visible = starMat.opacity > 0.005; stars.rotation.y = t * 0.004;
        const sd = num("sunDisc", t); sun.visible = sd > 0.005;
        if (sun.visible) { const d = val("sunDir", t) || [0.3, 0.6, -1]; const v = new THREE.Vector3(d[0], d[1], d[2]).normalize().multiplyScalar(1400); sun.position.copy(v); core.lookAt(hold.position); core.material.opacity = sd; glow1.material.opacity = sd; glow2.material.opacity = sd * 0.75; sun.scale.setScalar(0.4 + 0.6 * sd); }
        return out; };
    }

    // ======================= space: Earth's ring, rocks
    const space = window.WI_SPACE;
    const earth = space && space.children.find((m) => m.geometry && m.geometry.parameters && m.geometry.parameters.radius === 10);
    if (earth) {
      const rIn = 12, rOut = 23;
      const ru = { band: { value: tex }, k: { value: 0 }, sunDir: { value: new THREE.Vector3(-1, 0.2, 0.4).normalize() }, rIn: { value: rIn }, rOut: { value: rOut } };
      const ring = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 256, 8), new THREE.ShaderMaterial({ uniforms: ru, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        vertexShader: "varying vec3 vL; varying vec3 vW; void main(){ vL = position; vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: `uniform sampler2D band; uniform float k; uniform vec3 sunDir; uniform float rIn; uniform float rOut; varying vec3 vL; varying vec3 vW;
          void main(){ float r = length(vL.xy); vec4 b = texture2D(band, vec2((r - rIn) / (rOut - rIn), 0.5));
            float along = dot(vW, sunDir); float perp = length(vW - along * sunDir);
            float shade = along < 0.0 ? smoothstep(9.6, 10.4, perp) : 1.0;            // Earth's shadow on the ring
            vec3 c = b.rgb * (0.12 + 1.05 * shade);
            gl_FragColor = vec4(c, b.a * k * 0.92); }` }));
      ring.rotation.x = -Math.PI / 2; earth.add(ring); ring.visible = false;
      // ice and rock chunks
      const NRK = 4000; const rock = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xd9d4cc, roughness: 0.85, metalness: 0.0 }), NRK);
      const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), E = new THREE.Euler(); const cc = new THREE.Color();
      for (let i = 0; i < NRK; i++) { const a = WI.R() * 6.283, r = WI.rr(rIn + 0.5, rOut - 0.5), s = Math.pow(WI.R(), 3) * 0.24 + 0.015;
        Q.setFromEuler(E.set(WI.R() * 6, WI.R() * 6, WI.R() * 6)); M.compose(V.set(Math.cos(a) * r, Math.sin(a) * r, WI.rr(-0.06, 0.06)), Q, S.set(s, s * WI.rr(0.6, 1), s * WI.rr(0.6, 1)));
        rock.setMatrixAt(i, M); rock.setColorAt(i, cc.setHSL(0.08, WI.rr(0.05, 0.25), WI.rr(0.55, 0.9))); }
      ring.add(rock); rock.visible = false;
      window.WI_SPACE_TICK.push(function (t) { const k = num("earthRing", t); ring.visible = k > 0.005; ru.k.value = k; rock.visible = ring.visible && num("ringRocks", t) > 0.01; ring.rotation.z = t * 0.01; });
    }
  });

  // ======================= solar: Sun -> black hole, the darkness front racing to Mercury, Venus and Earth
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];
  B.push(function (WI) {
    const { THREE, num, glowTex, canvasTex, rr, R } = WI;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x01020a);
    const hold = new THREE.Group(); scene.add(hold);
    // stars + milky band
    const sp = [], sc = []; const cTmp = new THREE.Color();
    for (let i = 0; i < 6000; i++) { const th = R() * 6.283, z = rr(-1, 1), band = i < 2200; const yy = band ? rr(-0.12, 0.12) : z; const rad = Math.sqrt(1 - yy * yy);
      const v = new THREE.Vector3(rad * Math.cos(th), yy, rad * Math.sin(th)).applyAxisAngle(new THREE.Vector3(1, 0, 0), 1.05).multiplyScalar(15000); sp.push(v.x, v.y, v.z);
      cTmp.setHSL(rr(0.55, 0.68), rr(0.1, 0.6), rr(0.55, 1)); if (R() < 0.15) cTmp.setHSL(0.08, 0.6, 0.8); sc.push(cTmp.r, cTmp.g, cTmp.b); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3)); sg.setAttribute("color", new THREE.Float32BufferAttribute(sc, 3));
    hold.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false })));
    const neb = []; ["#3b2a8a", "#8a2a6a", "#1f5c9a"].forEach((c, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      s.position.set([-6000, 5000, 2000][i], [2500, -1500, 4000][i], [-9000, -8000, 9000][i]); s.scale.set(9000, 6000, 1); hold.add(s); neb.push(s); });
    // the Sun
    const SUNR = 60; const sun = new THREE.Group(); scene.add(sun);
    const sunTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#ffb43a"; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${255},${rr(150, 240) | 0},${rr(40, 120) | 0},${rr(0.2, 0.6)})`; g.beginPath(); g.arc(R() * w, R() * h, rr(1, 7), 0, 7); g.fill(); } });
    const sunBall = new THREE.Mesh(new THREE.SphereGeometry(SUNR, 64, 32), new THREE.MeshBasicMaterial({ map: sunTex, color: 0xffffff }));
    const corona = [0xfff0b0, 0xffa040, 0xff6a20].map((c, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.scale.setScalar([200, 420, 900][i]); sun.add(s); return s; });
    sun.add(sunBall);
    const sunLight = new THREE.PointLight(0xfff1d6, 2.2, 0, 0); scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x223355, 0.12));
    // the black hole: event horizon + accretion disk + photon ring
    const bh = new THREE.Group(); scene.add(bh);
    const horizon = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 24), new THREE.MeshBasicMaterial({ color: 0x000000 })); bh.add(horizon);
    const diskU = { t: { value: 0 }, k: { value: 0 } };
    const disk = new THREE.Mesh(new THREE.RingGeometry(12, 48, 192, 8), new THREE.ShaderMaterial({ uniforms: diskU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform float t; uniform float k; varying vec2 vP;
        void main(){ float r = length(vP); float a = atan(vP.y, vP.x); float u = (r - 12.0) / 36.0;
          float swirl = 0.6 + 0.4 * sin(a * 7.0 - t * 5.0 + r * 0.35) * sin(a * 3.0 + t * 2.0 - r * 0.2);
          vec3 hot = vec3(1.0, 0.95, 0.85), warm = vec3(1.0, 0.55, 0.15), cool = vec3(0.6, 0.15, 0.05);
          vec3 c = mix(hot, warm, smoothstep(0.0, 0.35, u)); c = mix(c, cool, smoothstep(0.35, 1.0, u));
          float beam = 1.0 + 0.6 * sin(a);   // doppler beaming
          float al = (1.0 - smoothstep(0.75, 1.0, u)) * smoothstep(0.0, 0.04, u) * swirl * beam;
          gl_FragColor = vec4(c * al * k * 1.6, 1.0); }` }));
    disk.rotation.x = -Math.PI / 2 + 0.22; bh.add(disk);
    const halo = new THREE.Mesh(new THREE.RingGeometry(9.6, 12.5, 128, 1), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    bh.add(halo);
    // lensed upper/lower arcs of the far side of the disk (the "Interstellar" look), always facing the camera
    const arcU = { k: { value: 0 }, t: { value: 0 } };
    const arc = new THREE.Mesh(new THREE.RingGeometry(10.5, 22, 128, 4), new THREE.ShaderMaterial({ uniforms: arcU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform float k; uniform float t; varying vec2 vP; void main(){ float r = length(vP); float u = (r - 10.5) / 11.5; float a = atan(vP.y, vP.x);
        float al = pow(abs(sin(a)), 0.6) * (1.0 - smoothstep(0.3, 1.0, u)) * smoothstep(0.0, 0.05, u) * (0.75 + 0.25 * sin(a * 9.0 + t * 3.0));
        vec3 c = mix(vec3(1.0, 0.9, 0.7), vec3(1.0, 0.45, 0.1), u); gl_FragColor = vec4(c * al * k, 1.0); }` }));
    bh.add(arc);
    const bhGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a3a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); bhGlow.scale.setScalar(160); bh.add(bhGlow);
    // planets: lit only while the darkness front has not reached them
    const planetMat = (map, tint) => new THREE.ShaderMaterial({ uniforms: { map: { value: map }, tint: { value: new THREE.Color(tint) }, lit: { value: 1 }, glow: { value: 0 } },
      vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform sampler2D map; uniform vec3 tint; uniform float lit; uniform float glow; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
        void main(){ vec3 c = texture2D(map, vUv).rgb * tint; float l = clamp(dot(normalize(vN), normalize(-vW)), 0.0, 1.0);
          vec3 col = c * (0.035 + 1.25 * l * lit); float rim = pow(1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW))), 3.0); col += glow * vec3(0.3, 0.55, 1.0) * rim * (0.2 + 0.8 * lit);
          gl_FragColor = vec4(col, 1.0); }` });
    const merTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#9a948c"; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.strokeStyle = `rgba(${R() < 0.5 ? "60,56,52" : "200,196,190"},${rr(0.2, 0.6)})`; g.beginPath(); g.arc(R() * w, R() * h, rr(1, 8), 0, 7); g.stroke(); } });
    const venTex = canvasTex(256, 128, (g, w, h) => { for (let y = 0; y < h; y++) { const k = 0.5 + 0.5 * Math.sin(y * 0.13 + Math.sin(y * 0.05) * 2); g.fillStyle = `rgb(${(232 + 18 * k) | 0},${(190 + 30 * k) | 0},${(120 + 40 * k) | 0})`; g.fillRect(0, y, w, 1); }
      for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,240,200,${rr(0.05, 0.2)})`; g.beginPath(); g.ellipse(R() * w, R() * h, rr(10, 50), rr(2, 6), 0, 0, 7); g.fill(); } });
    const earthTex = WI.loadTex("assets/lib/earth_atmos_2048.jpg"), moonTex = WI.loadTex("assets/lib/moon_1024.jpg");
    const PL = [["mercury", merTex, 0xffffff, 10, [387, -4, 40], 0], ["venus", venTex, 0xffffff, 20, [723, 10, -62], 0], ["earth", earthTex, 0xffffff, 22, [1000, 0, 0], 1], ["moon", moonTex, 0xffffff, 6, [1000, 8, 58], 0]]
      .map(([n, tx, tint, r, p, gl]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), planetMat(tx, tint)); m.position.set(p[0], p[1], p[2]); m.material.uniforms.glow.value = gl; scene.add(m);
        return { n, m, d: Math.hypot(p[0], p[1], p[2]), r }; });
    // the edge of the last sunlight: a huge glowing bubble around the Sun
    const shellU = { k: { value: 0 } };
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48), new THREE.ShaderMaterial({ uniforms: shellU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform float k; varying vec3 vN; varying vec3 vW; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        float a = pow(f, 4.0) * 0.9 + 0.04; gl_FragColor = vec4(vec3(1.0, 0.82, 0.45) * a * k, 1.0); }` }));
    scene.add(shell);
    // dust that streams past the camera (sense of speed), lit only ahead of the front
    const ND = 3000, dpos = new Float32Array(ND * 3); for (let i = 0; i < ND; i++) { dpos[i * 3] = rr(-50, 1150); dpos[i * 3 + 1] = rr(-90, 90); dpos[i * 3 + 2] = rr(-120, 120); }
    const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xfff0d0, size: 0.9, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(dust);
    return { name: "solar", scene, update(t, look, pos) {
      hold.position.set(pos[0], pos[1], pos[2]);
      const so = num("sunOn", t, 1), b = num("bh", t), fr = num("front", t, 0);
      sun.visible = so > 0.005; sun.scale.setScalar(Math.max(0.001, so)); sunBall.rotation.y = t * 0.05; corona.forEach((c, i) => { c.material.opacity = so * (0.85 + 0.15 * Math.sin(t * (2 + i) + i)); });
      sunLight.intensity = 2.2 * so;
      bh.visible = b > 0.005; diskU.t.value = t; diskU.k.value = b; arcU.k.value = b; arcU.t.value = t; halo.material.opacity = b * 0.9; bhGlow.material.opacity = b * 0.45;
      if (bh.visible) { arc.lookAt(WI.cam.position); halo.lookAt(WI.cam.position); }
      PL.forEach((p) => { p.m.material.uniforms.lit.value = fr > 0 ? 1 - WI.smooth((fr - (p.d - p.r * 1.2)) / (p.r * 2.4)) : 1; p.m.rotation.y = t * 0.05; });
      const sk = num("shell", t); shell.visible = sk > 0.005 && fr > 1; shell.scale.setScalar(Math.max(1, fr)); shellU.k.value = sk;
      dust.material.opacity = num("dust", t) * 0.8; dust.visible = dust.material.opacity > 0.01;
      return scene; } };
  });
})();
