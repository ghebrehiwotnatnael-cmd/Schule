/* "nyc": Midtown Manhattan in reference quality.  Manhattan grid (avenues along z every 230 m, streets along x every 78 m),
   buildings with detailed facades (brick / limestone / glass curtain wall / concrete grid / dark glass), window frames + sashes,
   storefronts, cornices, water towers, offices behind every window (interior mapping), aerial haze, Central Park to the north,
   rivers east and west.  A 330 m observation tower at the origin with a frameless glass railing (the deck).
   Track glass 0..1: every pane of glass in the city (windows, railing, car windows, shop windows, the aquarium) - 0 = gone.
   Other tracks: paper 0..1 (office paper blown out of the open windows), starPos/Rot/Mode/Face (your friend), tourists 0..1,
   aquaBurst (time the aquarium wall vanished), pigeonOn, windowsLit, carsMove 0..1.  Camera via camPos/camLook. */
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];
  B.push(function (WI) {
    const { THREE, R, rr, num, col, val, glowTex, canvasTex, smooth, clamp01 } = WI;
    const K = window.WI_COMMON(WI), MK = window.WI_MODELKIT(WI), BL = window.WI_BLOCKY(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene); const env = MK.envs(scene);
    const C = (h) => new THREE.Color(h).convertSRGBToLinear();
    const add = (o) => { scene.add(o); return o; };
    const AVE = 30, STR = 18, BX = 200, BZ = 60, TX = BX + AVE, TZ = BZ + STR;      // block footprint + street widths, tile size
    const TOWER_H = 250, TW = 56;                                                     // the observation tower at the origin
    const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

    // ================================================================ textures
    const brickTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#c9c0b2"; g.fillRect(0, 0, w, h); const bw = 32, bh = 12;
      for (let y = 0; y < h; y += bh) for (let x = -(y / bh % 2) * bw / 2; x < w; x += bw) { const v = rr(0.82, 1.08), r2 = R();
        g.fillStyle = r2 < 0.08 ? `rgb(${120 * v | 0},${62 * v | 0},${48 * v | 0})` : `rgb(${150 * v | 0},${74 * v | 0},${56 * v | 0})`; g.fillRect(x + 1, y + 1, bw - 2, bh - 2); }
      for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(0,0,0,${rr(0.02, 0.08)})`; g.fillRect(R() * w, R() * h, 2, 2); } });
    const stoneTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#d8ccb4"; g.fillRect(0, 0, w, h); const bh = 40;
      for (let y = 0; y < h; y += bh) { g.fillStyle = "rgba(90,75,55,0.35)"; g.fillRect(0, y, w, 2); for (let x = (y / bh % 2) * 60; x < w; x += 120) g.fillRect(x, y, 2, bh); }
      for (let i = 0; i < 6000; i++) { const v = rr(0.85, 1.1); g.fillStyle = `rgba(${200 * v | 0},${188 * v | 0},${165 * v | 0},0.25)`; g.fillRect(R() * w, R() * h, rr(1, 3), rr(1, 3)); } });
    const concTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#c6c4bf"; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = rr(0.85, 1.12); g.fillStyle = `rgba(${190 * v | 0},${188 * v | 0},${183 * v | 0},0.3)`; g.fillRect(R() * w, R() * h, rr(1, 3), rr(1, 3)); }
      for (let i = 0; i < 30; i++) { g.fillStyle = "rgba(60,58,55,0.06)"; g.fillRect(R() * w, 0, rr(2, 8), h); } });
    const panelTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#59636f"; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(255,255,255,${rr(0, 0.05)})`; g.fillRect(R() * w, R() * h, 2, 2); } });
    [brickTex, stoneTex, concTex, panelTex].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.encoding = THREE.sRGBEncoding; });

    // ================================================================ facade material (shared by every building box)
    const fU = { tBrick: { value: brickTex }, tStone: { value: stoneTex }, tConc: { value: concTex }, tPanel: { value: panelTex },
      uGlass: { value: 1 }, uLit: { value: 0.3 }, uSkyT: { value: new THREE.Color() }, uSkyH: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, uDay: { value: 1 } };
    const facadeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0 });
    facadeMat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, fU);
      sh.vertexShader = "attribute vec4 aB; varying vec3 vWP; varying vec3 vWN; varying vec4 vB; varying vec3 vSz;\n" + sh.vertexShader.replace("#include <worldpos_vertex>",
        `#include <worldpos_vertex>
         vec4 wq = modelMatrix * instanceMatrix * vec4(transformed, 1.0); vWP = wq.xyz; vWN = normalize(mat3(modelMatrix * instanceMatrix) * objectNormal); vB = aB;
         vSz = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));`);
      sh.fragmentShader = `uniform sampler2D tBrick; uniform sampler2D tStone; uniform sampler2D tConc; uniform sampler2D tPanel; uniform float uGlass; uniform float uLit; uniform vec3 uSkyT; uniform vec3 uSkyH; uniform vec3 uSun; uniform float uDay;
        varying vec3 vWP; varying vec3 vWN; varying vec4 vB; varying vec3 vSz;
        float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        vec3 skyRefl(vec3 d){ vec3 c = mix(uSkyH, uSkyT, smoothstep(-0.05, 0.6, d.y)); c = mix(c * 0.55, c, smoothstep(-0.25, 0.02, d.y)); c += vec3(1.0, 0.92, 0.75) * pow(max(dot(d, normalize(uSun)), 0.0), 220.0) * 6.0; return c; }
        ` + sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
        vec3 N = normalize(vWN); float roof = step(0.7, N.y); float bottom = step(0.7, -N.y);
        bool xF = abs(N.x) > 0.5; vec3 Rt = xF ? vec3(0.0, 0.0, -sign(N.x)) : vec3(sign(N.z), 0.0, 0.0);
        float u = dot(vWP, Rt) + 1000.0; float vv = vWP.y;
        float T = vB.x; float seed = vB.y; float base = vB.z;   // facade type, random seed, height of the base of this box
        // per type layout: floor height, cell width, window rect (x0,x1,y0,y1 in cell units), frame thickness
        float fh = 3.4, cw = 2.6; vec4 wr = vec4(0.32, 0.68, 0.24, 0.78); float ft = 0.06; vec3 frameC = vec3(0.92, 0.91, 0.87);
        if (T > 0.5 && T < 1.5) { fh = 3.8; cw = 3.1; wr = vec4(0.3, 0.7, 0.2, 0.76); frameC = vec3(0.16, 0.15, 0.14); }
        if (T > 1.5 && T < 2.5) { fh = 3.9; cw = 1.55; wr = vec4(0.03, 0.97, 0.2, 0.97); ft = 0.025; frameC = vec3(0.62, 0.66, 0.7); }
        if (T > 2.5 && T < 3.5) { fh = 3.6; cw = 2.1; wr = vec4(0.12, 0.88, 0.22, 0.86); ft = 0.035; frameC = vec3(0.22, 0.23, 0.25); }
        if (T > 3.5) { fh = 4.0; cw = 1.5; wr = vec4(0.02, 0.98, 0.12, 0.98); ft = 0.02; frameC = vec3(0.12, 0.13, 0.15); }
        float gfh = 5.0; bool ground = vv - base < gfh && base < 1.0;
        float cu = u / cw, cv = ground ? (vv - base) / gfh : (vv - base - (base < 1.0 ? gfh : 0.0)) / fh;
        if (ground) { cu = u / 4.4; wr = vec4(0.08, 0.92, 0.04, 0.7); }
        vec2 cell = vec2(floor(cu), floor(cv)); vec2 f = vec2(fract(cu), fract(cv));
        float topBand = step(vSz.y + base - 1.2, vv);                    // parapet band at the top
        float inWin = step(wr.x, f.x) * step(f.x, wr.y) * step(wr.z, f.y) * step(f.y, wr.w) * (1.0 - roof) * (1.0 - bottom) * (1.0 - topBand);
        float ftu = ft / (ground ? 4.4 : cw), ftv = ft / (ground ? gfh : fh);
        float inPane = step(wr.x + ftu, f.x) * step(f.x, wr.y - ftu) * step(wr.z + ftv, f.y) * step(f.y, wr.w - ftv) * inWin;
        // sash bar (prewar), mullion grid (curtain walls)
        if (T < 0.5 && !ground) inPane *= 1.0 - step(abs(f.y - (wr.z + wr.w) * 0.5), ftv * 0.7);
        if (T > 1.5 && T < 2.5 && !ground) inPane *= 1.0 - step(abs(f.y - 0.62), ftv * 0.8);
        if (ground) inPane *= 1.0 - step(abs(f.x - 0.5), ftu * 0.8);
        // wall albedo
        vec2 wuv = vec2(u, vv) / (T < 0.5 ? 4.0 : T < 1.5 ? 5.0 : 6.0);
        vec3 wall = T < 0.5 ? texture2D(tBrick, wuv).rgb : T < 1.5 ? texture2D(tStone, wuv).rgb : T < 3.5 && T > 2.5 ? texture2D(tConc, wuv).rgb : texture2D(tPanel, wuv * 2.0).rgb;
        wall *= 0.86 + 0.28 * hh(vec2(seed, 3.0));
        float tv = hh(vec2(seed, 11.0));
        if (T > 0.5 && T < 1.5) wall *= mix(vec3(1.05, 0.98, 0.9), vec3(0.92, 0.9, 0.88), tv);
        if (T > 2.5 && T < 3.5) wall *= mix(vec3(1.08, 1.06, 1.0), vec3(0.95, 0.88, 0.8), tv);
        if (T < 0.5) wall *= mix(vec3(1.0), vec3(0.75, 0.6, 0.5), step(0.7, tv));
        if (T < 0.5) wall *= mix(vec3(1.0), vec3(0.85, 0.95, 1.05), step(0.6, hh(vec2(seed, 7.0))));
        if (T > 1.5 && T < 2.5) wall = mix(vec3(0.36, 0.42, 0.5), vec3(0.62, 0.6, 0.56), hh(vec2(seed, 9.0)));
        if (ground) wall = T < 1.5 ? wall * 0.75 : vec3(0.18, 0.18, 0.2);
        // window sills / lintels for masonry
        float sill = (T < 1.5 && !ground) ? step(wr.x - 0.03, f.x) * step(f.x, wr.y + 0.03) * (step(abs(f.y - wr.z + 0.02), 0.025) + step(abs(f.y - wr.w - 0.025), 0.03)) : 0.0;
        // storey line + cornice band shading
        float band = (T < 1.5 && !ground) ? step(fract(cv), 0.04) * 0.25 : 0.0;
        vec3 c = wall * (1.0 - band);
        c = mix(c, vec3(0.9, 0.88, 0.83), clamp(sill, 0.0, 1.0));
        c = mix(c, frameC, inWin * (1.0 - inPane));
        c = mix(c, vec3(0.38, 0.37, 0.36) + 0.06 * hh(floor(vWP.xz * 1.3)), roof);
        diffuseColor.rgb = c;
        // ---------------- the pane: interior mapping + glass reflection
        vec3 paneCol = vec3(0.0);
        if (inPane > 0.5) {
          vec3 V = normalize(vWP - cameraPosition);
          vec3 d = vec3(dot(V, Rt), V.y, dot(V, -N));
          float W = (ground ? 4.4 : cw) * (T > 1.5 ? 2.0 : 1.0), Hh = ground ? gfh : fh, D = ground ? 6.0 : 5.0;
          float px = (ground ? fract(u / W) : fract(u / W)) * W, py = f.y * Hh;
          vec2 room = vec2(floor(u / W), cell.y) + seed;
          float tx = d.x > 0.0 ? (W - px) / d.x : -px / min(d.x, -1e-4);
          float ty = d.y > 0.0 ? (Hh - py) / d.y : -py / min(d.y, -1e-4);
          float tz = D / max(d.z, 1e-4);
          float tt = min(tx, min(ty, tz)); vec3 hp = vec3(px, py, 0.0) + d * tt;
          float on = step(1.0 - uLit, hh(room)) ;
          vec3 wallI = mix(vec3(0.82, 0.78, 0.7), vec3(0.72, 0.8, 0.86), hh(room + 2.0));
          vec3 ic;
          if (tt == ty && d.y < 0.0) ic = mix(vec3(0.34, 0.31, 0.28), vec3(0.27, 0.31, 0.37), hh(room + 5.0));
          else if (tt == ty) { float lp = step(0.35, fract(hp.x / 2.4)) * step(0.45, fract(hp.z / 2.4)) * step(fract(hp.z / 2.4), 0.8); ic = vec3(0.86) + lp * vec3(1.2, 1.15, 1.0) * (0.4 + on); }
          else if (tt == tz) { ic = wallI * 1.05; float desk = step(0.7, hp.y) * step(hp.y, 0.78) + step(hp.y, 0.72) * step(0.3, fract(hp.x / 1.6)) * step(fract(hp.x / 1.6), 0.36);
            ic = mix(ic, vec3(0.2, 0.2, 0.22), clamp(desk, 0.0, 1.0)); float mon = step(0.82, hp.y) * step(hp.y, 1.15) * step(0.5, fract(hp.x / 1.6 + 0.1)) * step(fract(hp.x / 1.6 + 0.1), 0.72);
            ic = mix(ic, vec3(0.08, 0.1, 0.12) + on * vec3(0.25, 0.4, 0.55), mon); }
          else ic = wallI * 0.85;
          if (ground) ic = mix(ic, mix(vec3(0.9, 0.55, 0.3), vec3(0.4, 0.7, 0.9), hh(room + 9.0)), 0.35);
          ic *= mix(0.32, 0.62, on) * (1.0 - 0.45 * clamp(tt / 9.0, 0.0, 1.0)) * mix(1.0, 1.6, 1.0 - uDay);
          vec3 Rf = reflect(V, N); float fr = 0.04 + 0.96 * pow(1.0 - max(dot(-V, N), 0.0), 5.0);
          float refl = (T > 1.5 && !ground ? 0.5 + 0.45 * fr : 0.12 + 0.75 * fr) * uGlass;
          float gt = hh(vec2(seed, 21.0)); vec3 gTint = gt < 0.3 ? vec3(0.55, 0.72, 0.88) : gt < 0.5 ? vec3(0.5, 0.78, 0.74) : gt < 0.7 ? vec3(0.82, 0.68, 0.5) : gt < 0.85 ? vec3(0.78, 0.82, 0.86) : vec3(0.42, 0.5, 0.62);
          vec3 tint = T > 1.5 && T < 2.5 || T > 3.5 ? gTint : vec3(0.85, 0.9, 0.92);
          vec3 rc = skyRefl(Rf) * tint * (0.9 + 0.2 * hh(cell + seed));
          paneCol = mix(ic * mix(1.0, 0.75, uGlass), rc, refl);
          diffuseColor.rgb = vec3(0.0);
        }`).replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n totalEmissiveRadiance += paneCol;")
          .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.6, roof);"); };
    facadeMat.customProgramCacheKey = () => "wi-nyc-facade";

    // ================================================================ city layout
    const boxGeo = new THREE.BoxGeometry(1, 1, 1); boxGeo.translate(0, 0.5, 0);
    const blds = []; const lotTops = [];
    const zoneH = (x, z) => { const d = Math.hypot(x * 0.8, z); let h = 40 + 230 * Math.exp(-d / 700); if (d < 260) h += 40; return h; };
    for (let ix = -8; ix <= 8; ix++) for (let iz = -22; iz <= 14; iz++) {
      const cx = ix * TX, cz = iz * TZ; if (cz < -900 && Math.abs(cx) < 420) continue;         // Central Park
      if (Math.abs(cx) > 1700) continue;                                                       // the rivers
      if (ix === 0 && iz === 0) continue;                                                      // the observation tower block
      for (const side of [-1, 1]) { let x = cx - BX / 2;
        while (x < cx + BX / 2 - 6) { const w = Math.min(rr(14, 38), cx + BX / 2 - x); const d = BZ / 2 - 0.5; const bx = x + w / 2, bz = cz + side * (BZ / 4);
          const zh = zoneH(bx, bz); const dC = Math.hypot(bx, bz); const tall = R() < (dC < 700 ? 0.5 : Math.min(0.25, zh / 650)); let h = tall ? rr(zh * 0.6, zh * 1.25) : rr(16, Math.min(70, zh * 0.6));
          if (ix === 1 && iz === 0) h = Math.min(h, 60); if (ix === -1 && iz === 0) h = Math.min(h, 60);
          const T = h > 110 ? (R() < 0.5 ? 2 : R() < 0.6 ? 4 : 3) : (R() < 0.5 ? 0 : R() < 0.55 ? 1 : 3);
          blds.push({ x: bx, z: bz, w: w - 0.4, d, h, T, base: 0 });
          if (h > 90 && R() < 0.75) { const k = rr(0.55, 0.8); blds.push({ x: bx, z: bz - side * d * (1 - k) / 2, w: (w - 0.4) * k, d: d * k, h: h * rr(0.12, 0.3), T, base: h }); }
          if (T < 1.5 && h < 90) lotTops.push([bx, h, bz, w, d]);
          x += w; } } }
    // a ring of supertall neighbours that frame the view from the deck
    [[-250, -150, 300, 2], [180, -260, 340, 4], [-120, -420, 380, 2], [330, 60, 290, 3], [-360, 90, 270, 4], [90, 330, 310, 2], [420, -470, 360, 4]].forEach(([x, z, h, T], k) => {
      const ix = Math.round(x / TX), iz = Math.round(z / TZ); const bx = ix * TX + (k % 2 ? 40 : -40), bz = iz * TZ + 14.5; for (let i = blds.length - 1; i >= 0; i--) { const b = blds[i]; if (Math.abs(b.x - bx) < 40 && Math.abs(b.z - bz) < 20) blds.splice(i, 1); }
      blds.push({ x: bx, z: bz, w: 44, d: 29, h, T, base: 0 }); blds.push({ x: bx, z: bz, w: 30, d: 20, h: h * 0.12, T, base: h }); });
    blds.push({ x: -68, z: -15.5, w: 48, d: 28, h: 19, T: 0, base: 0 }); blds.push({ x: 68, z: -15.5, w: 46, d: 28, h: 24, T: 1, base: 0 });
    lotTops.push([-68, 19, -15.5, 48, 28]);
    // the observation tower (dark glass) with a slimmer crown, deck at TOWER_H
    blds.push({ x: 0, z: 0, w: TW, d: TW, h: TOWER_H - 0.4, T: 4, base: 0 });
    const facades = new THREE.InstancedMesh(boxGeo, facadeMat, blds.length); const aB = new Float32Array(blds.length * 4);
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
      blds.forEach((b, i) => { M4.compose(V.set(b.x, b.base, b.z), Q, S.set(b.w, b.h, b.d)); facades.setMatrixAt(i, M4); aB.set([b.T, i * 0.37 % 97, b.base, 0], i * 4); }); }
    boxGeo.setAttribute("aB", new THREE.InstancedBufferAttribute(aB, 4));
    facades.castShadow = true; facades.receiveShadow = true; facades.frustumCulled = false; add(facades);
    // cornices (masonry buildings) + parapets
    const corn = blds.filter((b) => b.T < 1.5 && b.base === 0);
    const cornMesh = add(new THREE.InstancedMesh(boxGeo, MK.std(C("#d9d2c4"), { roughness: 0.8 }), corn.length * 2));
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
      corn.forEach((b, i) => { M4.compose(V.set(b.x, b.h - 0.9, b.z), Q, S.set(b.w + 0.9, 0.9, b.d + 0.9)); cornMesh.setMatrixAt(i * 2, M4); M4.compose(V.set(b.x, 4.9, b.z), Q, S.set(b.w + 0.5, 0.45, b.d + 0.5)); cornMesh.setMatrixAt(i * 2 + 1, M4); }); }
    cornMesh.castShadow = true; cornMesh.receiveShadow = true;
    // awnings over storefronts (coloured, facing the streets)
    const awn = []; blds.forEach((b) => { if (b.base === 0 && R() < 0.55) { const side = b.z > Math.round(b.z / TZ) * TZ ? 1 : -1; awn.push([b.x, b.z + side * (b.d / 2 + 0.7), b.w * rr(0.5, 0.9), side]); } });
    const awnMesh = add(new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.12, 1.5), MK.std(0xffffff, { roughness: 0.9 }), awn.length));
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), cc = ["#7a1f2b", "#1f4e3d", "#21325e", "#b5651d", "#3c3c3c", "#8c2f39"].map(C);
      awn.forEach((a, i) => { Q.setFromEuler(new THREE.Euler(a[3] * 0.32, 0, 0)); M4.compose(V.set(a[0], 4.4, a[1]), Q, S.set(a[2], 1, 1)); awnMesh.setMatrixAt(i, M4); awnMesh.setColorAt(i, cc[i % cc.length]); }); }
    awnMesh.castShadow = true;
    // fire escapes on brick buildings (dark iron zig-zags on the street side)
    const fe = []; blds.forEach((b) => { if (b.T < 0.5 && b.base === 0 && b.h < 70 && R() < 0.6) { const side = b.z > Math.round(b.z / TZ) * TZ ? 1 : -1; for (let y = 8.4; y < b.h - 2; y += 3.4) fe.push([b.x, y, b.z + side * (b.d / 2 + 0.55), Math.min(6, b.w * 0.5)]); } });
    const iron = MK.std(C("#2a2a2c"), { roughness: 0.6, metalness: 0.5 });
    const feMesh = add(new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.08, 1.1), iron, fe.length)); const feRail = add(new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.9, 0.04), iron, fe.length));
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
      fe.forEach((a, i) => { M4.compose(V.set(a[0], a[1], a[2]), Q, S.set(a[3], 1, 1)); feMesh.setMatrixAt(i, M4); M4.compose(V.set(a[0], a[1] + 0.45, a[2] + Math.sign(a[2] - Math.round(a[2] / TZ) * TZ) * 0.53), Q, S.set(a[3], 1, 1)); feRail.setMatrixAt(i, M4); }); }
    feMesh.castShadow = true;
    // water towers on brick/stone roofs
    const wt = lotTops.filter(() => R() < 0.35); const wood = MK.std(C("#7b5a3c"), { roughness: 0.95 });
    const wtTank = add(new THREE.InstancedMesh(new THREE.CylinderGeometry(1.6, 1.6, 3.2, 12), wood, wt.length)), wtRoof = add(new THREE.InstancedMesh(new THREE.ConeGeometry(1.75, 1.3, 12), MK.std(C("#3b3b3b")), wt.length));
    const wtLeg = add(new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 2.6, 0.18), iron, wt.length * 4));
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1);
      wt.forEach((a, i) => { const x = a[0] + rr(-a[3] / 4, a[3] / 4), z = a[2] + rr(-a[4] / 5, a[4] / 5), y = a[1];
        M4.compose(V.set(x, y + 4.2, z), Q, S); wtTank.setMatrixAt(i, M4); M4.compose(V.set(x, y + 6.45, z), Q, S); wtRoof.setMatrixAt(i, M4);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], k) => { M4.compose(V.set(x + sx * 1.1, y + 1.3, z + sz * 1.1), Q, S); wtLeg.setMatrixAt(i * 4 + k, M4); }); }); }
    [wtTank, wtRoof, wtLeg].forEach((m) => { m.castShadow = true; });
    // rooftop boxes on everything else
    const rbs = []; blds.forEach((b) => { if (R() < 0.6) for (let k = 0; k < 2; k++) rbs.push([b.x + rr(-b.w / 3, b.w / 3), b.base + b.h, b.z + rr(-b.d / 3, b.d / 3), rr(1.5, 4)]); });
    const rbMesh = add(new THREE.InstancedMesh(boxGeo, MK.std(C("#9a9ca1"), { roughness: 0.7 }), rbs.length));
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(); rbs.forEach((r, i) => { M4.compose(V.set(r[0], r[1], r[2]), Q, S.set(r[3], r[3] * 0.6, r[3] * 0.8)); rbMesh.setMatrixAt(i, M4); }); }

    // ================================================================ ground: streets, sidewalks, crosswalks, park, rivers
    const streetTex = canvasTex(1024, 348, (g, w, h) => { const kx = w / TX, kz = h / TZ; const ax = AVE / 2 * kx, sz2 = STR / 2 * kz;
      g.fillStyle = "#4a4c51"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#a7a39b"; g.fillRect(ax - 4.5 * kx, sz2 - 4 * kz, w - 2 * ax + 9 * kx, h - 2 * sz2 + 8 * kz);
      g.fillStyle = "#77746e"; g.fillRect(ax, sz2, w - 2 * ax, h - 2 * sz2);
      g.fillStyle = "#cfcabe"; for (let i = 0; i < 9; i++) { g.fillRect(ax + 2 * kx + i * 1.4 * kx, 0, 0.7 * kx, sz2 - 5 * kz); g.fillRect(ax + 2 * kx + i * 1.4 * kx, h - sz2 + 5 * kz, 0.7 * kx, sz2 - 5 * kz); }
      g.fillStyle = "#e8c547"; g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
      g.fillStyle = "#e9e5da"; for (let y = 0; y < h; y += 14) { g.fillRect(w / 2 * 0 + 0, y, 0, 0); }
      for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "0,0,0" : "255,255,255"},${rr(0.02, 0.05)})`; g.fillRect(R() * w, R() * h, 2, 2); } });
    streetTex.wrapS = streetTex.wrapT = THREE.RepeatWrapping; streetTex.anisotropy = 16; streetTex.encoding = THREE.sRGBEncoding; const GS = 9000; streetTex.repeat.set(GS / TX, GS / TZ); streetTex.offset.set(0.5 - (GS / 2 % TX) / TX + 0.5, 0.5 - (GS / 2 % TZ) / TZ + 0.5);
    const ground = add(new THREE.Mesh(new THREE.PlaneGeometry(GS, GS), new THREE.MeshStandardMaterial({ map: streetTex, roughness: 0.92 }))); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
    { const fr = (x) => x - Math.floor(x); streetTex.offset.set(0.5 - fr(GS / 2 / TX), 0.5 - fr(GS / 2 / TZ)); }
    const park = add(new THREE.Mesh(new THREE.PlaneGeometry(840, 4200), MK.std(C("#4f7d3a"), { roughness: 1 }))); park.rotation.x = -Math.PI / 2; park.position.set(0, 0.05, -900 - 2100);
    const lake = add(new THREE.Mesh(new THREE.CircleGeometry(160, 32), MK.std(C("#4f7fa3"), { roughness: 0.15 }))); lake.rotation.x = -Math.PI / 2; lake.position.set(60, 0.08, -2200); lake.scale.set(1, 1.6, 1);
    const parkTrees = add(new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), MK.std(C("#3f6b2c"), { roughness: 1 }), 2600));
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), c = new THREE.Color();
      for (let i = 0; i < 2600; i++) { const x = rr(-410, 410), z = rr(-5050, -930), s = rr(4, 8); M4.compose(V.set(x, s * 0.9, z), Q, S.set(s, s * rr(0.8, 1.1), s)); parkTrees.setMatrixAt(i, M4); parkTrees.setColorAt(i, c.setHSL(rr(0.24, 0.32), rr(0.35, 0.5), rr(0.22, 0.34))); } }
    parkTrees.castShadow = true;
    for (const sx of [-1, 1]) { const river = add(new THREE.Mesh(new THREE.PlaneGeometry(1400, 9000), MK.std(C("#486e86"), { roughness: 0.12, metalness: 0.1 }))); river.rotation.x = -Math.PI / 2; river.position.set(sx * 2500, 0.1, 0);
      const shore = add(new THREE.InstancedMesh(boxGeo, MK.std(C("#9a948a")), 260)); const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
      for (let i = 0; i < 260; i++) { M4.compose(V.set(sx * rr(3250, 4200), 0, rr(-4400, 4400)), Q, S.set(rr(20, 60), rr(8, 45), rr(20, 60))); shore.setMatrixAt(i, M4); } }

    // ================================================================ street life: trees, lamps, traffic lights, cars, people
    const treeList = [], lampList = [];
    for (let ix = -8; ix <= 8; ix++) for (let iz = -11; iz <= 14; iz++) { const cx = ix * TX, cz = iz * TZ; if (Math.abs(cx) > 1700) continue;
      for (const side of [-1, 1]) for (let x = cx - BX / 2 + 8; x < cx + BX / 2 - 4; x += 12) { const z = cz + side * (BZ / 2 + 2.2); if (R() < 0.75) treeList.push([x + rr(-1, 1), z]); if ((x - cx) % 36 < 12) lampList.push([x + 6, cz + side * (BZ / 2 + 3.4)]); } }
    const trunk = add(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 3, 6), MK.std(C("#4a3a2c")), treeList.length));
    const crown = add(new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.6, 1), MK.std(0xffffff, { roughness: 1 }), treeList.length));
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), c = new THREE.Color();
      treeList.forEach((tr, i) => { const s = rr(0.8, 1.2); M4.compose(V.set(tr[0], 1.5, tr[1]), Q, S.set(1, s, 1)); trunk.setMatrixAt(i, M4); M4.compose(V.set(tr[0], 3.2 + s * 1.3, tr[1]), Q, S.set(s, s * 1.1, s)); crown.setMatrixAt(i, M4); crown.setColorAt(i, c.setHSL(rr(0.22, 0.3), 0.45, rr(0.25, 0.35))); }); }
    crown.castShadow = true;
    const pole = add(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.09, 7, 6), iron, lampList.length)); const lampHead = add(new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.18, 0.9), iron, lampList.length));
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1); lampList.forEach((l, i) => { M4.compose(V.set(l[0], 3.5, l[1]), Q, S); pole.setMatrixAt(i, M4); M4.compose(V.set(l[0], 7, l[1] - Math.sign(l[1] - Math.round(l[1] / TZ) * TZ) * 0.6), Q, S); lampHead.setMatrixAt(i, M4); }); }
    // cars: body + glass cabin (glass vanishes -> open cabin with seats)
    const carList = [];
    for (let ix = -5; ix <= 5; ix++) for (let iz = -10; iz <= 8; iz++) { const cx = ix * TX + TX / 2, cz = iz * TZ + TZ / 2; if (Math.abs(cx) > 1700) continue;
      for (let k = 0; k < 7; k++) { const lane = rr(-1, 1) > 0 ? rr(3, 11) : -rr(3, 11); carList.push([cx + lane, rr(-TZ / 2, TZ / 2) + iz * TZ, 0, R()]); }
      for (let k = 0; k < 3; k++) { const lane = (R() < 0.5 ? -1 : 1) * rr(2, 6); carList.push([ix * TX + rr(-BX / 2, BX / 2), cz + lane, Math.PI / 2, R()]); } }
    for (let i = carList.length - 1; i >= 0; i--) { const c = carList[i]; if (c[0] > -95 && c[0] < 30 && c[1] > -50 && c[1] < -30) carList.splice(i, 1); }
    // the hero taxi (parked at the kerb on the street north of the tower, the camera passes right by it)
    const taxi = add(new THREE.Group()); { const yel = MK.std(C("#f2c200"), { roughness: 0.35, metalness: 0.3 }), blk = MK.std(C("#1b1b1b")), seat = MK.std(C("#3a2a22"));
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.78, 4.7), yel); body.position.y = 0.62; taxi.add(body);
      const hood = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 1.3), yel); hood.position.set(0, 1.05, 1.6); hood.rotation.x = 0.08; taxi.add(hood);
      const roofT = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.08, 2.0), yel); roofT.position.set(0, 1.66, -0.2); taxi.add(roofT);
      const sign = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.28), MK.std(C("#fff6d0"), { emissive: C("#ffe9a0"), emissiveIntensity: 0.4 })); sign.position.set(0, 1.81, -0.2); taxi.add(sign);
      [[-0.8, 0.85], [0.8, 0.85], [-0.8, -1.25], [0.8, -1.25]].forEach(([x, z]) => { const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.66, 0.07), blk); p2.position.set(x, 1.33, z); taxi.add(p2); });
      [[0, 1.2, -1.25]].forEach(([x, y, z]) => { const st = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 0.5), seat); st.position.set(x, y, z); taxi.add(st); });
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 14), blk); wheel.position.set(-0.4, 1.35, 0.55); wheel.rotation.x = -0.5; taxi.add(wheel);
      [[-0.95, 1.5], [0.95, 1.5], [-0.95, -1.5], [0.95, -1.5]].forEach(([x, z]) => { const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 14), blk); w2.rotation.z = Math.PI / 2; w2.position.set(x, 0.34, z); taxi.add(w2); });
      taxi.traverse((o) => { if (o.isMesh) o.castShadow = true; }); }
    const taxiGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.32, 0.62, 4, 1), new THREE.MeshStandardMaterial({ color: 0x1b2633, roughness: 0.05, metalness: 0.7, transparent: true, opacity: 0.8 }));
    taxiGlass.geometry.rotateY(Math.PI / 4); taxiGlass.geometry.scale(0.6, 1, 1.15); taxiGlass.position.set(0, 1.33, -0.2); taxi.add(taxiGlass);
    taxi.position.set(-24, 0.02, -43.2); taxi.rotation.y = -Math.PI / 2;
    const driver = BL.crowd(scene, [{ x: 0, y: 0, z: 0, male: true, beard: true, hair: new THREE.Color("#2d1d14"), shirt: C("#5c6b7a"), legs: C("#2b2d42"), skin: C("#b9784f"), s: 0.95, mode: "sit", face: 2 }]);
    const carBody = add(new THREE.InstancedMesh(new THREE.BoxGeometry(1.85, 0.75, 4.5), MK.std(0xffffff, { roughness: 0.35, metalness: 0.35 }), carList.length));
    const cabGeo = new THREE.CylinderGeometry(1.0, 1.32, 0.62, 4, 1); cabGeo.rotateY(Math.PI / 4); cabGeo.scale(1.25 / 1.32 * 0.72, 1, 1.25 / 1.32 * 1.25);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1b2633, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.85 });
    const cab = add(new THREE.InstancedMesh(cabGeo, cabMat, carList.length));
    const roofs = add(new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 0.08, 2.0), MK.std(0xffffff, { roughness: 0.4, metalness: 0.3 }), carList.length));
    const seats = add(new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.5, 1.8), MK.std(C("#2a2a2a")), carList.length));
    const carC = ["#f2c200", "#f2c200", "#f2c200", "#e8e8e8", "#1d1d1f", "#9a9fa6", "#7a1c1c", "#24427a"].map(C);
    const carM = []; { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
      carList.forEach((c, i) => { Q.setFromAxisAngle(Y, c[2]); const col2 = carC[Math.floor(c[3] * carC.length)]; carBody.setColorAt(i, col2); roofs.setColorAt(i, col2); carM.push({ x: c[0], z: c[1], r: c[2], v: rr(4, 9) * (R() < 0.5 ? 1 : -1), sp: rr(0.4, 1.6) * (R() < 0.5 ? 1 : -1) }); }); }
    carBody.castShadow = true; cab.castShadow = true;
    const cabEdge = add(new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.62, 0.08), MK.std(C("#1b1b1b")), carList.length * 4));
    // people on the sidewalks (GPU mass) + a few near crowds
    const sw = []; for (let ix = -3; ix <= 3; ix++) for (let iz = -7; iz <= 5; iz++) { const cx = ix * TX, cz = iz * TZ; for (const side of [-1, 1]) for (let k = 0; k < 22; k++) {
      const x = cx + rr(-BX / 2, BX / 2), z = cz + side * (BZ / 2 + rr(0.6, 4)); sw.push({ x, z, y: 0.15, rot: R() < 0.5 ? Math.PI / 2 : -Math.PI / 2, mode: R() < 0.7 ? 4 : R() < 0.5 ? 2 : 0 }); } }
    const walkers = BL.mass(scene, sw, {});

    // ================================================================ the deck on top of the tower
    const deckY = TOWER_H; const deck = add(new THREE.Group());
    { const floorTex = canvasTex(512, 512, (g, w, h) => { for (let i = 0; i < 16; i++) { const v = rr(0.85, 1.1); g.fillStyle = `rgb(${128 * v | 0},${108 * v | 0},${88 * v | 0})`; g.fillRect(0, i * 32, w, 31); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, i * 32 + 31, w, 1); for (let k = 0; k < 4; k++) g.fillRect(R() * w, i * 32, 1, 31); } });
      floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(10, 10); floorTex.encoding = THREE.sRGBEncoding;
      const fl = new THREE.Mesh(new THREE.BoxGeometry(TW + 2, 0.4, TW + 2), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.7 })); fl.position.y = deckY - 0.2; fl.receiveShadow = true; deck.add(fl);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(TW + 2.4, 0.3, TW + 2.4), MK.std(C("#cfd3d6"), { metalness: 0.5, roughness: 0.3 })); edge.position.y = deckY - 0.45; deck.add(edge);
      for (let k = 0; k < 10; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 0.6), MK.std(C("#6b4f3a"))); b.position.set(rr(-18, 18), deckY + 0.22, rr(-18, 18)); b.rotation.y = R() < 0.5 ? 0 : Math.PI / 2; deck.add(b); }
      const core = new THREE.Mesh(new THREE.BoxGeometry(12, 4.2, 9), MK.std(C("#cfd3d8"), { roughness: 0.4, metalness: 0.2 })); core.position.set(0, deckY + 2.1, 6); deck.add(core);
      const coreTop = new THREE.Mesh(new THREE.BoxGeometry(13, 0.3, 10), MK.std(C("#30343a"))); coreTop.position.set(0, deckY + 4.3, 6); deck.add(coreTop);
      for (let k = 0; k < 8; k++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.4), MK.std(C("#3b3f45"))); const a = k / 8 * 6.283; pl.position.set(Math.cos(a) * 17, deckY + 0.4, Math.sin(a) * 17); deck.add(pl);
        const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), MK.std(C("#4c7a34"))); bush.position.set(pl.position.x, deckY + 1.3, pl.position.z); deck.add(bush); } }
    const railMat = new THREE.MeshPhysicalMaterial({ color: 0xcfeeff, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.1, side: THREE.DoubleSide, envMapIntensity: 0.8, depthWrite: false });
    const rails = []; const RH = 1.25;
    for (let k = 0; k < 4; k++) for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(4.02, RH, 0.04), railMat); const a = k * Math.PI / 2; const o = -TW / 2 - 1 + 2 + i * 4.0;
      p.position.set(Math.cos(a) * (TW / 2 + 0.9) - Math.sin(a) * o, deckY + RH / 2, Math.sin(a) * (TW / 2 + 0.9) + Math.cos(a) * o); p.rotation.y = -a + Math.PI / 2; deck.add(p); rails.push(p);
      const edgeL = new THREE.Mesh(new THREE.BoxGeometry(4.02, 0.035, 0.05), new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.6 })); edgeL.position.copy(p.position); edgeL.position.y = deckY + RH; edgeL.rotation.y = p.rotation.y; deck.add(edgeL); rails.push(edgeL); }
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(TW + 2.2, 0.12, 0.25), MK.std(C("#a9adb2"), { metalness: 0.6, roughness: 0.3 }));
    for (let k = 0; k < 4; k++) { const s = shoe.clone(); const a = k * Math.PI / 2; s.position.set(Math.cos(a) * (TW / 2 + 0.9), deckY + 0.06, Math.sin(a) * (TW / 2 + 0.9)); s.rotation.y = -a + Math.PI / 2; deck.add(s); }
    // tourists on the deck + your friend
    const tourists = []; for (let i = 0; i < 44; i++) { const a = R() * 6.283, r = rr(8, TW / 2 - 1); tourists.push({ x: Math.cos(a) * r, y: deckY, z: Math.sin(a) * r, rot: Math.atan2(Math.cos(a), Math.sin(a)), mode: R() < 0.5 ? "film" : R() < 0.5 ? "point" : "idle", face: R() < 0.5 ? 0 : 7 }); }
    const tour = BL.crowd(scene, tourists);
    const starP = { name: "star", male: true, beard: false, hair: new THREE.Color(0.075, 0.05, 0.036), afro: true, mustache: true, glasses: true, tie: true, tieCol: new THREE.Color("#0b0b0d"),
      shirt: C("#b5121b"), longSleeve: true, skirt: false, legs: new THREE.Color("#121214"), skin: C("#5a3826"), s: 1.08, face: 7, x: 0, y: deckY, z: 0, mode: "selfie" };
    const youP = { name: "you", male: true, beard: false, hair: new THREE.Color("#2d1d14"), shirt: C("#2f6db5"), longSleeve: true, legs: C("#2b2d42"), skin: C("#d39a6e"), s: 1.0, face: 0, x: 0, y: deckY, z: 0, mode: "idle" };
    const star = BL.crowd(scene, [starP, youP]);
    const tm = new THREE.Matrix4(), tv = new THREE.Vector3();
    const glitLoc = Array.from({ length: 200 }, (_, i) => { const nm = i < 120 ? "torso" : i < 160 ? "armL" : "armR"; const w = nm === "torso" ? 0.46 : 0.135, d = nm === "torso" ? 0.26 : 0.135, cy = nm === "torso" ? 0.3 : -0.28;
      const f = i % 3; return [nm, f === 2 ? (R() < 0.5 ? -1 : 1) * (w / 2 + 0.006) : rr(-w / 2, w / 2), cy + rr(-0.3, 0.3), f === 0 ? d / 2 + 0.006 : f === 1 ? -d / 2 - 0.006 : rr(-d / 2, d / 2)]; });
    const starGlit = add(new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(200 * 3), 3)).setAttribute("color", new THREE.BufferAttribute(new Float32Array(200 * 3), 3)),
      new THREE.PointsMaterial({ map: glowTex, color: 0xffd6c8, vertexColors: true, size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); starGlit.frustumCulled = false;
    const glitPh = glitLoc.map(() => [rr(0, 6.283), rr(5, 11)]);   // each sequin twinkles on its own phase/speed (no global blink)
    const lapMat = new THREE.MeshStandardMaterial({ color: C("#8e0a1e"), roughness: 0.4, metalness: 0.2 });
    const lapels = [-1, 1].map((sd) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.42, 0.02), lapMat); m.position.set(sd * 0.115, 0.36, 0.142); m.rotation.z = sd * 0.32; g.add(m); g.matrixAutoUpdate = false; scene.add(g); return g; });
    const starFill = new THREE.PointLight(0xffe2cc, 1.1, 3.2, 2); add(starFill);
    const starBack = new THREE.PointLight(0xdfe8ff, 1.0, 3.0, 2); add(starBack);   // soft rim from behind so his head/afro never turn into a black block when seen from the back

    // ================================================================ paper storm out of the open windows
    const NP = 4400; const nearB = blds.filter((b) => Math.hypot(b.x + 60, b.z + 160) < 300 && b.h > 40 && !(b.x === 0 && b.z === 0)); const paperGeo = new THREE.PlaneGeometry(0.8, 1.1); const paper = add(new THREE.InstancedMesh(paperGeo, new THREE.MeshStandardMaterial({ color: 0xf6f4ee, side: THREE.DoubleSide, roughness: 0.8 }), NP));
    paper.frustumCulled = false; const paperSeed = Array.from({ length: NP }, () => { const b = nearB[Math.floor(R() * nearB.length)]; const face = Math.floor(R() * 4);
      return { b, face, u: rr(-0.45, 0.45), y: b.base + rr(6, b.h - 2), sp: rr(6, 16), up: rr(-1, 2), ph: R() * 6.28, rs: rr(1, 5) }; });
    paperSeed.slice(2600).forEach((p) => { p.air = [rr(-160, 60), rr(4, 255), rr(-230, -36)]; p.sp = rr(2, 5); });
    const towerB = blds.find((b) => b.x === 0 && b.z === 0 && b.w === TW); const nearPaper = paperSeed.slice(0, 1100); nearPaper.forEach((p, i) => { p.b = towerB; p.face = i % 5 === 0 ? 0 : 3; p.y = rr(4, deckY - 3); p.sp = rr(4, 11); });

    // ================================================================ street level: restaurant with a big aquarium window, a pigeon
    const SX = 0, SZ = TZ / 2 - 30 + 0;       // street-level hero spot: south side of the tower block, on the sidewalk at z ~ 34
    const aqua = add(new THREE.Group()); aqua.position.set(-68, 0.15, -31.0); aqua.rotation.y = Math.PI; const AQD = -1;
    const aquaWater = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, 1.6), new THREE.MeshStandardMaterial({ color: C("#3fb6d9"), transparent: true, opacity: 0.55, roughness: 0.05 })); aquaWater.position.set(0, 1.6, 0.9); aqua.add(aquaWater);
    const aquaGlass = new THREE.Mesh(new THREE.BoxGeometry(6.1, 2.5, 0.04), new THREE.MeshPhysicalMaterial({ color: 0xe8f8ff, roughness: 0.02, transparent: true, opacity: 0.25 })); aquaGlass.position.set(0, 1.6, 1.72); aqua.add(aquaGlass);
    const aquaBase = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.4, 1.8), MK.std(C("#2b2b2e"))); aquaBase.position.set(0, 0.2, 0.9); aqua.add(aquaBase);
    const aquaFish = Array.from({ length: 16 }, (_, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 5), MK.std(C(["#ff7b00", "#ffd000", "#3ec1ff", "#ff4fa3"][i % 4]), { roughness: 0.4 })); m.rotation.z = Math.PI / 2; aqua.add(m); m.userData = { ph: R() * 6, y: rr(0.8, 2.4), z: rr(0.3, 1.5) }; return m; });
    const flood = add(new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ color: C("#2a6f8a"), transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.2 }))); flood.rotation.x = -Math.PI / 2; flood.visible = false;
    const splashes = Array.from({ length: 30 }, () => { const s = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: WI.puffTex || glowTex, color: 0xd8f4ff, transparent: true, depthWrite: false, opacity: 0 }))); s.userData = { a: rr(-0.9, 0.9), v: rr(2, 5), u: rr(1, 4) }; return s; });
    const pigeon = add(new THREE.Group()); { const gm = MK.std(C("#9aa1aa"), { roughness: 0.8 }), dk = MK.std(C("#4f5660"), { roughness: 0.8 }), irid = MK.std(C("#4f8a73"), { roughness: 0.35, metalness: 0.4 });
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), gm); b.scale.set(0.95, 0.9, 1.45); pigeon.add(b);
      const neck = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), irid); neck.position.set(0, 0.1, 0.15); neck.scale.set(1, 1.15, 1); pigeon.add(neck);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), MK.std(C("#6c7684"))); h.position.set(0, 0.2, 0.2); pigeon.add(h);
      const bk = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.07, 6), MK.std(C("#e8b26a"))); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.19, 0.29); pigeon.add(bk);
      for (const sx of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), MK.std(C("#ff7a1a"), { emissive: C("#ff5a00"), emissiveIntensity: 0.3 })); eye.position.set(sx * 0.06, 0.22, 0.24); pigeon.add(eye);
        const pu = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 4), MK.std(C("#050505"))); pu.position.set(sx * 0.071, 0.222, 0.25); pigeon.add(pu);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.11, 5), MK.std(C("#e0707a"))); leg.position.set(sx * 0.05, -0.16, 0.02); pigeon.add(leg); }
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.025, 0.2), dk); tail.position.set(0, 0.0, -0.27); tail.rotation.x = 0.25; pigeon.add(tail);
      pigeon.userData.wings = [-1, 1].map((s) => { const w = new THREE.Group(); const wp = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.2), gm); wp.position.x = s * 0.18; w.add(wp);
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.022, 0.2), dk); tip.position.x = s * 0.31; w.add(tip);
        for (const zz of [-0.03, 0.04]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.024, 0.025), dk); bar.position.set(s * 0.14, 0, zz); w.add(bar); }
        w.position.set(s * 0.07, 0.06, 0); pigeon.add(w); return w; });
      pigeon.traverse((o) => { if (o.isMesh) o.castShadow = true; }); }

    // ================================================================ extensions (video-specific props, e.g. sets_slip.js)
    const exts = (window.WI_NYC_EXT || []).map((f) => f({ WI, scene, K, MK, BL, C, add, TX, TZ, BX, BZ, AVE, STR, taxi, star, walkers, pigeon, glowTex, canvasTex, trunk, crown, pole, lampHead, treeList, lampList, iron }));

    // ================================================================ update
    const cTop = new THREE.Color(), cHor = new THREE.Color();
    return { name: "nyc", scene, update(t, look, pos) {
      sky(t, num, col); env(t);
      L.update(t, num, col, new THREE.Vector3(pos[0] * 0.7 + look[0] * 0.3, pos[1] > 200 ? deckY : 0, pos[2] * 0.7 + look[2] * 0.3), num("shadowSize", t, pos[1] > 200 ? 70 : 60));
      const gl = num("glass", t, 1); fU.uGlass.value = gl; fU.uLit.value = num("windowsLit", t, 0.35); fU.uSkyT.value.copy(col("skyTop", t)); fU.uSkyH.value.copy(col("skyHorizon", t));
      const sd = val("sunDir", t) || [0.3, 0.5, 0.4]; fU.uSun.value.set(sd[0], sd[1], sd[2]); fU.uDay.value = 1;
      rails.forEach((r) => { r.visible = gl > 0.5; }); taxiGlass.visible = gl > 0.5;
      driver.update(t, (p) => { const wpos = new THREE.Vector3(-0.42, 0.62, 0.15).applyAxisAngle(new THREE.Vector3(0, 1, 0), taxi.rotation.y).add(taxi.position); p.x = wpos.x; p.y = wpos.y; p.z = wpos.z; p.rot = taxi.rotation.y; p.mode = gl > 0.5 ? "sit" : "sit"; p.face = gl > 0.5 ? 1 : 3; }); cabMat.opacity = 0.85 * gl; cab.visible = gl > 0.02; aquaGlass.visible = gl > 0.5;
      // cars
      const mv = num("carsMove", t, 1); const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
      const cT = val("carT", t), spin = num("carSpin", t, 0);
      carM.forEach((c, i) => { const along = c.v * (cT === undefined ? mv * t : cT); let x = c.x, z = c.z; if (c.r === 0) z = c.z + ((along % TZ) + TZ) % TZ - TZ / 2 * 0; else x = c.x + along % 60;
        Q.setFromAxisAngle(Y, c.r + (c.v < 0 ? Math.PI : 0) + spin * c.sp); M4.compose(V.set(x, 0.55, z), Q, S); carBody.setMatrixAt(i, M4);
        M4.compose(V.set(x, 1.24, z), Q, S); cab.setMatrixAt(i, M4); M4.compose(V.set(x, 1.58, z), Q, S); roofs.setMatrixAt(i, M4); M4.compose(V.set(x, 1.0, z), Q, S); seats.setMatrixAt(i, M4);
        for (let k = 0; k < 4; k++) { const ox = (k % 2 ? 0.8 : -0.8), oz = (k < 2 ? 1.1 : -1.1); V.set(ox, 0, oz).applyQuaternion(Q); M4.compose(V.set(x + V.x, 1.24, z + V.z), Q, S); cabEdge.setMatrixAt(i * 4 + k, M4); } });
      [carBody, cab, roofs, seats, cabEdge].forEach((m) => { m.instanceMatrix.needsUpdate = true; });
      walkers.u.uTime.value = t; walkers.u.uFilm.value = num("crowdFilm", t, 0.1); walkers.u.uCheer.value = num("crowdCheer", t, 0); walkers.u.uJump.value = 0;
      walkers.u.uSlip.value = num("crowdSlip", t, 0); walkers.u.uSlipD.value = num("crowdSlipD", t, 0); walkers.u.uStop.value = num("crowdStop", t, 0);
      { const tp = val("taxiPos", t); if (tp) taxi.position.set(tp[0], tp[1], tp[2]); taxi.rotation.y = num("taxiRot", t, -Math.PI / 2); }
      // tourists + friend
      const tv2 = num("tourists", t, 1); const tmode = val("tourMood", t) || "calm";
      tour.update(t, (p, tt, i) => { p.hidden = tv2 < 0.5 || (Math.abs(p.x - pos[0]) < 2.6 && Math.abs(p.z - pos[2]) < 2.6 && Math.abs(pos[1] - deckY) < 4); if (tmode === "panic") { const h = (i * 0.618) % 1; p.mode = h < 0.4 ? "panic" : h < 0.7 ? "kneel" : "point"; p.face = h < 0.5 ? 4 : 3; } else if (tmode === "relief") { p.mode = (i % 3) ? "cheer" : "hug"; p.face = 7; } });
      const sp = val("starPos", t);
      const yp = val("youPos", t);
      star.update(t, (p, tt, i) => { if (i === 1) { if (!yp) { p.hidden = true; return; } p.hidden = false; p.x = yp[0]; p.y = yp[1]; p.z = yp[2]; p.rot = num("youRot", t, 0); p.mode = val("youMode", t) || "idle"; p.face = Math.round(num("youFace", t, 0)); p.roll = num("youRoll", t, 0); p.tilt = num("youTilt", t, 0); return; }
        if (!sp) { p.hidden = true; return; } p.hidden = false; p.x = sp[0]; p.y = sp[1]; p.z = sp[2]; p.rot = num("starRot", t, 0); p.mode = val("starMode", t) || "selfie"; p.face = Math.round(num("starFace", t, 7)); p.roll = num("starRoll", t, 0); p.tilt = num("starTilt", t, 0); p.glassOff = val("starGlassOff", t) || [0, 0]; p.noGlasses = num("starGlassHide", t, 0) > 0.5; });
      starGlit.visible = !!sp; if (sp) { const a = starGlit.geometry.attributes.position.array; let last = null; const ca = starGlit.geometry.attributes.color.array;
        glitPh.forEach(([ph, sp2], i) => { const b = 0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(t * sp2 + ph)), 3); ca[i * 3] = ca[i * 3 + 1] = ca[i * 3 + 2] = b; }); starGlit.geometry.attributes.color.needsUpdate = true;
        glitLoc.forEach((l, i) => { if (l[0] !== last) { star.meshes[l[0]].getMatrixAt(0, tm); last = l[0]; } tv.set(l[1], l[2], l[3]).applyMatrix4(tm); a[i * 3] = tv.x; a[i * 3 + 1] = tv.y; a[i * 3 + 2] = tv.z; }); starGlit.geometry.attributes.position.needsUpdate = true;
        star.meshes.torso.getMatrixAt(0, tm); lapels.forEach((l) => { l.visible = true; l.matrix.copy(tm); }); starFill.position.copy(new THREE.Vector3(0, 0.75, 0.9).applyMatrix4(tm)); star.meshes.head.getMatrixAt(0, tm); starBack.position.copy(new THREE.Vector3(0, 0.45, -1.1).applyMatrix4(tm)); } else lapels.forEach((l) => { l.visible = false; });
      starFill.intensity = sp ? 1.1 : 0; starBack.intensity = sp ? 1.0 : 0;
      // paper storm
      const pk = num("paper", t); paper.visible = pk > 0.01; if (paper.visible) { const pt = num("paperT", t, 0); const E = new THREE.Euler();
        paperSeed.forEach((p, i) => { if (p.air) { const k = pt; V.set(p.air[0] + k * p.sp * 1.6 + Math.sin(p.ph + k * 1.3) * 1.5, p.air[1] + Math.sin(p.ph * 2 + k) * 1.2 - k * 0.4, p.air[2] + Math.cos(p.ph + k * 0.9) * 1.5);
            E.set(p.ph + k * p.rs, p.ph * 2 + k * p.rs * 0.7, k * p.rs * 0.5); Q.setFromEuler(E); const sc = pk * clamp01(k * 2); M4.compose(V, Q, S.set(sc, sc, sc)); paper.setMatrixAt(i, M4); return; }
          const b = p.b; const nx = [1, -1, 0, 0][p.face], nz = [0, 0, 1, -1][p.face]; const fx = b.x + nx * (b.w / 2) + (nz ? p.u * b.w : 0), fz = b.z + nz * (b.d / 2) + (nx ? p.u * b.d : 0);
          const k = Math.max(0, pt - (i % 30) * 0.05); const dist = k * p.sp; V.set(fx + nx * dist + Math.sin(p.ph + k * 2) * 0.6 + k * 1.2, p.y + k * p.up - k * k * 0.15, fz + nz * dist + Math.cos(p.ph + k) * 0.6);
          E.set(p.ph + k * p.rs, p.ph * 2 + k * p.rs * 0.7, k * p.rs * 0.5); Q.setFromEuler(E); const sc = k > 0 ? Math.min(1, pk * 1.5) : 0; M4.compose(V, Q, S.set(sc, sc, sc)); paper.setMatrixAt(i, M4); }); paper.instanceMatrix.needsUpdate = true; }
      // aquarium
      const ab = t - num("aquaBurst", t, 999); aquaFish.forEach((f, i) => { const u = f.userData; if (ab < 0) { f.position.set(Math.sin(t * 0.5 + u.ph) * 2.6, u.y + Math.sin(t + u.ph) * 0.1, u.z); f.rotation.y = Math.cos(t * 0.5 + u.ph) > 0 ? 0 : Math.PI; }
        else { const k = Math.min(ab, 2.5); f.position.set(Math.sin(u.ph) * 2.6 + Math.sin(u.ph * 3) * k * 0.6, Math.max(0.0, u.y - k * k * 2.2), u.z + k * 2.6); f.rotation.x = Math.sin(t * 20 + i) * 0.5; } });
      if (ab >= 0) { const k = clamp01(ab / 1.6); aquaWater.scale.set(1 + k * 0.3, Math.max(0.02, 1 - k), 1 + k * 1.5); aquaWater.position.set(0, 0.4 + 1.2 * (1 - k), 0.9 + k * 1.4);
        flood.visible = true; flood.position.set(aqua.position.x, 0.17, aqua.position.z + AQD * (1.5 + k * 3)); const r = 0.5 + Math.min(ab, 4) * 2.2; flood.scale.set(r * 1.6, r, 1);
        splashes.forEach((s) => { const u = s.userData; s.visible = ab < 2.2; if (!s.visible) return; s.position.set(aqua.position.x + u.a * 3.2, 0.3 + ab * u.u - ab * ab * 4.9 * 0.5, aqua.position.z + AQD * (1.8 + ab * u.v)); s.scale.setScalar(0.4 + ab * 0.7); s.material.opacity = 0.8 * (1 - ab / 2.2); }); }
      else { aquaWater.scale.set(1, 1, 1); aquaWater.position.set(0, 1.6, 0.9); flood.visible = false; splashes.forEach((s) => { s.visible = false; }); }
      const pg = val("pigeonPos", t); pigeon.visible = !!pg; if (pg) { pigeon.position.set(pg[0], pg[1], pg[2]); pigeon.rotation.y = num("pigeonRot", t, 0); const fl = num("pigeonFlap", t, 1); pigeon.userData.wings.forEach((w, k) => { w.rotation.z = (k ? -1 : 1) * Math.sin(t * 22) * 0.9 * fl; }); }
      exts.forEach((e) => e.update(t, look, pos));
      return scene; } };
  });
})();
