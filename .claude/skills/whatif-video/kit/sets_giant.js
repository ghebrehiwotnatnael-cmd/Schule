/* "toronto": downtown at golden hour for a GIANT.  A square with a small street stage (origin), a dense grid of streets and
   towers (procedural facades with windows, one instanced mesh), the CN Tower + dome by the lake, Lake Ontario to the south (+z),
   a near crowd of full blocky people + tens of thousands of GPU-animated 3D people filling the square and the streets.
   The star (The Weeknd look) can grow: tracks starScale (1..100+), starPos, starRot, starMode, starFace, starFill.
   Crowd tracks: crowdCheer, crowdJump, crowdFilm (0..1 share), crowdRun (metres people have run away), nearMood (calm|cheer|panic|film).
   FX: stepAt (time of a footstep: dust ring at his feet), windowsLit 0..1, screens 0..1. */
(function () {
  const B = window.WI_SET_BUILDERS = window.WI_SET_BUILDERS || [];
  B.push(function (WI) {
    const { THREE, R, rr, num, col, val, glowTex, canvasTex, smooth, clamp01 } = WI;
    const K = window.WI_COMMON(WI), MK = window.WI_MODELKIT(WI), BL = window.WI_BLOCKY(WI);
    const scene = new THREE.Scene(); const sky = K.sky(scene); const L = K.lights(scene); const env = MK.envs(scene);
    const C = (h) => new THREE.Color(h).convertSRGBToLinear();
    const TILE = 112, ST = 22;                                          // block grid: 90 m blocks + 22 m streets
    const SQ = 70;                                                      // half size of the open square around the stage
    const LAKE = 980;                                                   // lake shore (z)
    const inSquare = (x, z) => Math.abs(x) < SQ && Math.abs(z) < SQ;

    // ------------------------------------------------ ground: one tiled texture = block + half streets
    const gTex = canvasTex(512, 512, (g, w, h) => { const k = w / TILE, s = ST / 2 * k;
      g.fillStyle = "#3a3b41"; g.fillRect(0, 0, w, h);                                     // asphalt
      g.fillStyle = "#9c968c"; g.fillRect(s - 3.5 * k, s - 3.5 * k, w - 2 * s + 7 * k, h - 2 * s + 7 * k);   // sidewalks
      g.fillStyle = "#c9c2b4"; g.fillRect(s - 3.6 * k, s - 3.6 * k, w - 2 * s + 7.2 * k, 0.5 * k);
      g.fillStyle = "#6d6a66"; g.fillRect(s, s, w - 2 * s, h - 2 * s);                     // block base
      g.fillStyle = "#f2e6b8"; for (let i = 0; i < w; i += 6 * k) { g.fillRect(i, h - 0.25 * k - 1, 3 * k, 2); g.fillRect(w - 1.5, i, 2, 3 * k); }   // lane dashes on the street centre lines (tile edges)
      g.fillStyle = "#e9e5da"; for (let i = 0; i < 7; i++) { g.fillRect(s + i * 1.6 * k, s - 9 * k, 0.8 * k, 4.5 * k); g.fillRect(s - 9 * k, s + i * 1.6 * k, 4.5 * k, 0.8 * k); }   // zebras
      for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "0,0,0" : "255,255,255"},${rr(0.02, 0.06)})`; g.fillRect(R() * w, R() * h, rr(1, 3), rr(1, 3)); } });
    gTex.wrapS = gTex.wrapT = THREE.RepeatWrapping; gTex.anisotropy = 8; const GS = 9000; gTex.repeat.set(GS / TILE, GS / TILE); gTex.offset.set(0.5 - ST / 2 / TILE, 0.5 - ST / 2 / TILE);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(GS, GS), new THREE.MeshStandardMaterial({ map: gTex, roughness: 0.92 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    // the square: warm stone paving
    const pave = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#b7a58e"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(60,45,35,0.35)"; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } });
    pave.wrapS = pave.wrapT = THREE.RepeatWrapping; pave.repeat.set(36, 36); pave.anisotropy = 8;
    const square = new THREE.Mesh(new THREE.PlaneGeometry(SQ * 2, SQ * 2), new THREE.MeshStandardMaterial({ map: pave, roughness: 0.8 })); square.rotation.x = -Math.PI / 2; square.position.y = 0.03; square.receiveShadow = true; scene.add(square);
    // lake
    const lake = new THREE.Mesh(new THREE.PlaneGeometry(12000, 6000), new THREE.MeshStandardMaterial({ color: C("#2f7fb8"), roughness: 0.18, metalness: 0.1 }));
    lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.2, LAKE + 3000); lake.receiveShadow = true; scene.add(lake);
    const shore = new THREE.Mesh(new THREE.PlaneGeometry(12000, 40), MK.std(C("#8f9a6a"))); shore.rotation.x = -Math.PI / 2; shore.position.set(0, 0.12, LAKE - 10); scene.add(shore);

    // ------------------------------------------------ towers: one instanced box mesh with procedural facades
    const towers = [];
    const core = new THREE.Vector2(-150, -380);                          // the financial district: tallest towers
    for (let bx = -26; bx <= 26; bx++) for (let bz = -30; bz <= 8; bz++) {
      const cx = bx * TILE, cz = bz * TILE; if (cz > LAKE - 120) continue;
      const lots = R() < 0.35 ? 1 : R() < 0.6 ? 2 : 4; const inner = TILE - ST - 6;
      for (let k = 0; k < lots; k++) {
        const w = lots === 1 ? inner : lots === 2 ? inner / 2 - 2 : inner / 2 - 2, d = lots === 4 ? inner / 2 - 2 : inner;
        const ox = lots === 1 ? 0 : (k % 2 ? 1 : -1) * (inner / 4 + 1), oz = lots === 4 ? (k < 2 ? -1 : 1) * (inner / 4 + 1) : 0;
        const x = cx + ox, z = cz + oz; if (Math.abs(x) < SQ + w / 2 + 4 && Math.abs(z) < SQ + d / 2 + 4) continue;
        const dc = Math.hypot(x - core.x, z - core.y); const dd = Math.hypot(x, z);
        let hgt = rr(14, 40) + (dc < 700 ? Math.pow(R(), 1.6) * 260 * (1 - dc / 700) : 0) + (dd < 300 ? rr(10, 60) : 0);
        if (dd > 2200) hgt *= 0.6; if (R() < 0.04 && dc < 500) hgt = rr(220, 300);
        if (x > -60 && x < 330 && z > -560 && z < -40) hgt = Math.min(hgt, rr(18, 55));   // keep the drone corridor (north-east of the square) low
        const type = hgt > 90 ? (R() < 0.55 ? 0 : 1) : (R() < 0.5 ? 2 : 3);   // 0 blue glass, 1 dark glass/steel, 2 brick, 3 stone
        towers.push({ x, z, w: w * rr(0.82, 0.98), d: d * rr(0.82, 0.98), h: hgt, type });
        if (hgt > 110 && R() < 0.6) towers.push({ x, z, w: w * 0.62, d: d * 0.62, h: hgt * rr(1.08, 1.2), type, top: true });   // setback crown
      }
    }
    const facadeCols = [["#6fa8dc", "#9fc5e8", "#4f86c6"], ["#3d4b5c", "#56657a", "#2f3a48"], ["#a0563c", "#b86b4b", "#8c4a34"], ["#d8cbb5", "#c9b99c", "#e6dccb"]];
    const towerGeo = new THREE.BoxGeometry(1, 1, 1); towerGeo.translate(0, 0.5, 0);
    const towerU = { uLit: { value: 0 }, uTime: { value: 0 }, uSkyT: { value: new THREE.Color() }, uSkyH: { value: new THREE.Color() } };
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.1 });
    towerMat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, towerU);
      sh.vertexShader = "attribute float aType; varying vec3 vWP; varying vec3 vWN; varying float vType; varying float vH;\n" + sh.vertexShader.replace("#include <worldpos_vertex>",
        "#include <worldpos_vertex>\n vec4 wpp = modelMatrix * instanceMatrix * vec4(transformed, 1.0); vWP = wpp.xyz; vWN = normalize(mat3(modelMatrix * instanceMatrix) * objectNormal); vType = aType; vH = instanceMatrix[1][1];");
      sh.fragmentShader = "uniform float uLit; uniform float uTime; uniform vec3 uSkyT; uniform vec3 uSkyH; varying vec3 vWP; varying vec3 vWN; varying float vType; varying float vH;\n float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n" +
        sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
          float roof = step(0.7, vWN.y);
          float fh = vType < 1.5 ? 3.6 : 3.2; float cw = vType < 1.5 ? 2.2 : 3.4;
          float u = abs(vWN.x) > 0.5 ? vWP.z : vWP.x; float fl = floor(vWP.y / fh); float cl = floor(u / cw);
          vec2 f = vec2(fract(u / cw), fract(vWP.y / fh));
          float win = step(0.12, f.x) * step(f.x, vType < 1.5 ? 0.97 : 0.78) * step(0.18, f.y) * step(f.y, 0.86);
          if (vType < 1.5) win = step(f.y, 0.9) * step(0.06, f.y) * step(0.04, f.x);     // curtain wall
          float shop = 1.0 - step(5.5, vWP.y);
          vec3 glass = vType < 0.5 ? mix(vec3(0.18, 0.34, 0.55), vec3(0.85, 0.62, 0.45), clamp(vWP.y / max(vH, 1.0), 0.0, 1.0) * 0.55) : vec3(0.2, 0.25, 0.32);
          float lit = step(1.0 - uLit * 0.75, h21(vec2(fl, cl) + floor(vWP.xz / 40.0)));
          vec3 facade = diffuseColor.rgb;
          vec3 c = mix(facade, glass, win * (1.0 - roof));
          c = mix(c, vec3(0.08, 0.07, 0.07), shop * (1.0 - roof) * 0.6);
          c = mix(c, vec3(0.42, 0.42, 0.44), roof);
          diffuseColor.rgb = c;
          float winLit = win * (1.0 - roof) * lit;`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          totalEmissiveRadiance += win * (1.0 - roof) * (1.0 - winLit) * mix(uSkyH, uSkyT, clamp(vWP.y / 400.0, 0.0, 1.0)) * (vType < 1.5 ? 0.32 : 0.14) + winLit * vec3(1.0, 0.72, 0.4) * 0.9 * uLit + shop * (1.0 - roof) * vec3(1.0, 0.6, 0.35) * 0.35 * uLit;`)
          .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.12, win * (vType < 1.5 ? 1.0 : 0.6));"); };
    towerMat.customProgramCacheKey = () => "wi-tower";
    const tw = new THREE.InstancedMesh(towerGeo, towerMat, towers.length); const tType = new Float32Array(towers.length);
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), c = new THREE.Color();
      towers.forEach((b, i) => { M4.compose(V.set(b.x, 0, b.z), Q, S.set(b.w, b.h, b.d)); tw.setMatrixAt(i, M4); const cs = facadeCols[b.type]; tw.setColorAt(i, c.set(cs[i % 3]).convertSRGBToLinear()); tType[i] = b.type; }); }
    towerGeo.setAttribute("aType", new THREE.InstancedBufferAttribute(tType, 1));
    tw.castShadow = true; tw.receiveShadow = true; scene.add(tw);
    // rooftop details (AC units, water tanks) + aviation lights on the tall ones
    const roofBits = []; towers.forEach((b) => { if (b.top === undefined && b.h > 30 && R() < 0.7) for (let k = 0; k < 3; k++) roofBits.push([b.x + rr(-b.w / 3, b.w / 3), b.h, b.z + rr(-b.d / 3, b.d / 3), rr(2, 5)]); });
    const rb = new THREE.InstancedMesh(towerGeo, MK.std(C("#8d9096"), { roughness: 0.7 }), roofBits.length);
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(); roofBits.forEach((r, i) => { M4.compose(V.set(r[0], r[1], r[2]), Q, S.set(r[3], r[3] * 0.6, r[3])); rb.setMatrixAt(i, M4); }); }
    scene.add(rb);
    const redL = []; towers.forEach((b) => { if (b.h > 150 && (b.top || R() < 0.4)) redL.push(b.x, b.h + 1.5, b.z); });
    const redPts = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(redL, 3)),
      new THREE.PointsMaterial({ map: glowTex, color: 0xff3b2a, size: 9, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(redPts);

    // ------------------------------------------------ CN Tower (553 m) + dome stadium, by the lake
    const CN = new THREE.Vector3(-430, 0, 760);
    const cn = new THREE.Group(); cn.position.copy(CN); scene.add(cn);
    { const conc = MK.std(C("#d8d2c8"), { roughness: 0.75 }), dark = MK.std(C("#3b3f46"), { roughness: 0.5, metalness: 0.3 }), glassM = MK.std(C("#2b4f75"), { roughness: 0.15, metalness: 0.4 });
      const prof = [[13, 0], [11, 40], [9.2, 120], [7.8, 220], [6.6, 330], [6.0, 350]].map(([r, y]) => new THREE.Vector2(r, y));
      const shaft = new THREE.Mesh(new THREE.LatheGeometry(prof, 6), conc); shaft.castShadow = true; cn.add(shaft);
      for (let k = 0; k < 3; k++) { const leg = new THREE.Mesh(new THREE.BoxGeometry(6, 300, 16), conc); leg.geometry.translate(0, 150, 9); leg.rotation.y = k * Math.PI * 2 / 3; cn.add(leg); }
      const pod1 = new THREE.Mesh(new THREE.CylinderGeometry(22, 18, 14, 32), conc); pod1.position.y = 342; cn.add(pod1);
      const podG = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 7, 32, 1, true), glassM); podG.position.y = 351; cn.add(podG);
      const pod2 = new THREE.Mesh(new THREE.CylinderGeometry(19, 24, 8, 32), conc); pod2.position.y = 358.5; cn.add(pod2);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.6, 85, 6), conc); upper.position.y = 405; cn.add(upper);
      const sky2 = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 9, 16), dark); sky2.position.y = 447; cn.add(sky2);
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.6, 102, 8), MK.std(C("#c7c2ba"))); ant.position.y = 502; cn.add(ant);
      const tip = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff3b2a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); tip.position.y = 554; tip.scale.setScalar(14); cn.add(tip);
      cn.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
    const dome = new THREE.Mesh(new THREE.SphereGeometry(105, 48, 16, 0, Math.PI * 2, 0, Math.PI * 0.32), MK.std(C("#e5e3df"), { roughness: 0.5, metalness: 0.2 }));
    dome.scale.set(1, 0.62, 1); dome.position.set(-250, -28, 820); dome.castShadow = true; scene.add(dome);
    const domeRing = new THREE.Mesh(new THREE.CylinderGeometry(112, 116, 30, 48), MK.std(C("#b9b4aa"))); domeRing.position.set(-250, 15, 820); scene.add(domeRing);

    // ------------------------------------------------ the square: street stage, LED screens, the TORONTO sign
    const stage = new THREE.Group(); scene.add(stage);
    { const deck = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 8), MK.std(C("#5a5866"))); deck.position.set(0, 0.15, 6); stage.add(deck);
      const truss = MK.std(C("#c0c3c9"), { metalness: 0.15, roughness: 0.45 });
      [[-6, 9.6], [6, 9.6], [-6, 2.4], [6, 2.4]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), truss); p.position.set(x, 4, z); stage.add(p); });
      [-6, 6].forEach((x) => { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 7.6), truss); bar.position.set(x, 8, 6); stage.add(bar); }); }
    const screenTex = (txt, c1, c2) => canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(255,255,255,0.08)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); g.fillStyle = "#fff"; g.font = "bold 74px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2); });
    const screens = [], boards = [];
    [["TORONTO", "#ff8a00", "#e91e63", [-SQ - 4, 38, -10], Math.PI / 2, [46, 23]], ["FREE SHOW", "#00c6ff", "#7c4dff", [SQ + 4, 44, -20], -Math.PI / 2, [50, 25]],
     ["8 PM", "#ff4d5e", "#ffb000", [10, 40, -SQ - 4], 0, [40, 20]], ["LIVE TONIGHT", "#ff1f4b", "#7b1fa2", [0, 36, SQ + 4], Math.PI, [64, 32]]].forEach(([t, a, b2, p, ry, sz]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(sz[0], sz[1]), new THREE.MeshBasicMaterial({ map: screenTex(t, a, b2), toneMapped: false })); m.position.set(p[0], p[1], p[2]); m.rotation.y = ry; scene.add(m); screens.push(m); boards.push(m);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(sz[0] + 2, sz[1] + 2, 0.8), MK.std(C("#4a4a55"), { roughness: 0.6, metalness: 0.2 })); fr.position.set(p[0], p[1], p[2]); fr.rotation.y = ry; fr.translateZ(-0.5); scene.add(fr); boards.push(fr);
      [-0.35, 0.35].forEach((k) => { const pole = new THREE.Mesh(new THREE.BoxGeometry(1.6, p[1] - sz[1] / 2, 1.6), MK.std(C("#5b5b66"), { metalness: 0.3, roughness: 0.5 })); pole.geometry.translate(0, (p[1] - sz[1] / 2) / 2, 0);
        pole.position.set(p[0], 0, p[2]); pole.rotation.y = ry; pole.translateX(k * sz[0]); pole.translateZ(-1.2); scene.add(pole); boards.push(pole); }); });
    // TORONTO letters (colourful, 3 m tall)
    const sign = new THREE.Group(); scene.add(sign); { const cols = ["#ff1744", "#ff9100", "#ffea00", "#00e676", "#00b0ff", "#d500f9", "#ff4081"];
      const tx = (ch, c) => canvasTex(128, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = c; g.font = "bold 150px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, w / 2, h / 2 + 6); });
      "TORONTO".split("").forEach((ch, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3, 0.6), [MK.std(C(cols[i])), MK.std(C(cols[i])), MK.std(C(cols[i])), MK.std(C(cols[i])), new THREE.MeshStandardMaterial({ map: tx(ch, "#ffffff"), color: C(cols[i]), transparent: false }), MK.std(C(cols[i]))]);
        m.position.set(-8.4 + i * 2.8, 1.5, 0); sign.add(m); }); }
    sign.position.set(-26, 0, -8); sign.rotation.y = Math.PI - 0.6;
    // street lamps + trees along the square
    for (let i = -3; i <= 3; i++) for (const [x, z, r] of [[i * 18, -SQ + 4, 0], [i * 18, SQ - 4, 0], [-SQ + 4, i * 18, 1], [SQ - 4, i * 18, 1]]) { if (Math.abs(i) === 0 && z > 0) continue;
      const tr = WI.model("ultimatenature/FBX/CommonTree_1.fbx", { height: rr(7, 9) }); tr.position.set(x, 0, z); tr.rotation.y = R() * 6; scene.add(tr); }

    // ------------------------------------------------ the star (grows)
    const starP = { name: "star", male: true, beard: false, hair: new THREE.Color("#0d0907"), afro: true, mustache: true, glasses: true, tie: true, tieCol: new THREE.Color("#0b0b0d"),
      shirt: C("#b5121b"), longSleeve: true, skirt: false, legs: new THREE.Color("#121214"), skin: C("#5a3826"), s: 1.08, x: 0, y: 0.33, z: 6, rot: Math.PI, face: 7, mode: "sing" };
    const star = BL.crowd(scene, [starP]);
    const gm = new THREE.Matrix4(), gv = new THREE.Vector3(), gq = new THREE.Quaternion(), gs = new THREE.Vector3();
    const gparts = [["torso", 0.46, 0.6, 0.26, 0.3], ["armL", 0.135, 0.6, 0.135, -0.28], ["armR", 0.135, 0.6, 0.135, -0.28]];
    const glit = [0, 1, 2].map((k) => { const loc = [];
      gparts.forEach(([name, w, h, d, cy]) => { const nn = name === "torso" ? 110 : 50; for (let i = 0; i < nn; i++) { const face = Math.floor(R() * 4);
          let x = rr(-w / 2, w / 2), y = cy + rr(-h / 2, h / 2), z = rr(-d / 2, d / 2);
          if (face === 0) z = d / 2 + 0.006; else if (face === 1) z = -d / 2 - 0.006; else if (face === 2) x = w / 2 + 0.006; else x = -w / 2 - 0.006;
          if (name === "torso" && face === 0 && Math.abs(x) < 0.08) x = Math.sign(x || 1) * rr(0.09, w / 2);
          loc.push([name, x, y, z]); } });
      const pts = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(loc.length * 3), 3)),
        new THREE.PointsMaterial({ map: glowTex, color: k === 1 ? 0xfff1c4 : 0xff7a66, size: 0.055, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      pts.frustumCulled = false; pts.userData = { k, loc, noShadow: true }; scene.add(pts); return pts; });
    const lapMat = new THREE.MeshStandardMaterial({ color: C("#8e0a1e"), roughness: 0.4, metalness: 0.2 });
    const lapels = [-1, 1].map((sd) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.42, 0.02), lapMat); m.position.set(sd * 0.115, 0.36, 0.142); m.rotation.z = sd * 0.32; m.castShadow = true; g.add(m); g.matrixAutoUpdate = false; scene.add(g); return g; });
    const fill = new THREE.PointLight(0xffe2cc, 0, 3.2, 2); scene.add(fill);
    const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.03, 0.22, 12), MK.std(C("#18181c"), { metalness: 0.8, roughness: 0.3 })); mic.matrixAutoUpdate = false; scene.add(mic);
    // footstep dust ring
    const dustTex = canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(220,200,170,0)"); gr.addColorStop(0.7, "rgba(220,200,170,0.85)"); gr.addColorStop(1, "rgba(220,200,170,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const dust = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: dustTex, transparent: true, depthWrite: false, opacity: 0 })); dust.rotation.x = -Math.PI / 2; dust.position.y = 0.3; scene.add(dust);
    const puffs = Array.from({ length: 24 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: WI.puffTex || glowTex, color: 0xd9c7a8, transparent: true, depthWrite: false, opacity: 0 })); s.userData = { a: i / 24 * 6.283 + rr(-0.1, 0.1), r: rr(0.8, 1.2) }; scene.add(s); return s; });

    // ------------------------------------------------ crowds: near full people around the stage + a mass in the square and streets
    const nearList = []; for (let i = 0; i < 420; i++) { const a = rr(-Math.PI * 0.85, Math.PI * 0.85), d = 4.5 + Math.pow(R(), 0.8) * 27; const x = Math.sin(a) * d, z = 6 - Math.cos(a) * d; if (z > 3) continue;
      nearList.push({ x, y: 0.03, z, rot: Math.atan2(0 - x, 6 - z) + rr(-0.3, 0.3), mode: "cheer", face: R() < 0.5 ? 7 : 0, phase: R() * 10 }); }
    const near = BL.crowd(scene, nearList);
    const massList = [];
    const tryAdd = (x, z, faceTo) => { const dn = Math.hypot(x, z - 6); if (dn < 34) return; massList.push({ x, z, y: 0.03, rot: Math.atan2(-x, 6 - z) + rr(-0.35, 0.35), mode: R() < 0.55 ? 1 : R() < 0.5 ? 2 : 0 }); };
    for (let i = 0; i < 9000; i++) tryAdd(rr(-SQ + 2, SQ - 2), rr(-SQ + 2, SQ - 2));
    // streets (centre lines on tile edges at x,z = k*TILE + TILE/2 ... the street band is |coord - edge| < ST/2)
    for (let i = 0; i < 52000; i++) { const along = rr(-1400, 1400), k = Math.round(rr(-12, 12)); const off = rr(-ST / 2 + 0.5, ST / 2 - 0.5); const edge = k * TILE + TILE / 2;
      const dd = Math.hypot(along, edge); if (R() > Math.exp(-dd / 700) + 0.04) continue;
      if (R() < 0.5) { if (along > LAKE - 40) continue; tryAdd(edge + off, along); } else { if (edge > LAKE - 40) continue; tryAdd(along, edge + off); } }
    const mass = BL.mass(scene, massList, {}); mass.u.uHide.value.set(0, 6, 0);
    // stopped cars in the streets beyond the crowd
    const carList = []; for (let i = 0; i < 900; i++) { const along = rr(-2600, 2600), k = Math.round(rr(-22, 22)); const edge = k * TILE + TILE / 2; const lane = (R() < 0.5 ? -1 : 1) * rr(2, 6);
      const ax = R() < 0.5; const x = ax ? along : edge + lane, z = ax ? edge + lane : along; if (z > LAKE - 40 || Math.hypot(x, z) < 500) continue; carList.push([x, z, ax ? Math.PI / 2 : 0]); }
    const carGeo = new THREE.BoxGeometry(1.9, 1.3, 4.4); carGeo.translate(0, 0.75, 0);
    const cars = new THREE.InstancedMesh(carGeo, MK.std(0xffffff, { roughness: 0.35, metalness: 0.4 }), carList.length);
    { const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0), c = new THREE.Color(); const cc = ["#e63946", "#f1faee", "#1d3557", "#ffb703", "#222222", "#8ecae6", "#bfbfbf", "#2a9d8f"];
      carList.forEach((cr, i) => { Q.setFromAxisAngle(Y, cr[2]); M4.compose(V.set(cr[0], 0, cr[1]), Q, S); cars.setMatrixAt(i, M4); cars.setColorAt(i, c.set(cc[i % cc.length]).convertSRGBToLinear()); }); }
    cars.castShadow = true; scene.add(cars);
    // birds scattering
    const birds = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 900 }, (_, i) => i % 3 === 1 ? rr(60, 160) : rr(-300, 300)), 3)),
      new THREE.PointsMaterial({ color: 0x1a1a1a, size: 1.4, transparent: true, opacity: 0 })); scene.add(birds); const birdBase = birds.geometry.attributes.position.array.slice();

    let lastShadow = 0;
    return { name: "toronto", scene, update(t, look, pos) {
      sky(t, num, col); env(t);
      const sScale = num("starScale", t, 1); const sp = val("starPos", t) || [0, 0.33, 6];
      const tgtY = Math.min(pos[1], 40), shadowSize = num("shadowSize", t, Math.max(60, sScale * 4));
      L.update(t, num, col, new THREE.Vector3(pos[0] * 0.6 + sp[0] * 0.4, 0, pos[2] * 0.6 + sp[2] * 0.4), shadowSize);
      towerU.uLit.value = num("windowsLit", t, 0.35); towerU.uTime.value = t; towerU.uSkyT.value.copy(col("skyTop", t)); towerU.uSkyH.value.copy(col("skyHorizon", t));
      screens.forEach((m, i) => { m.material.color.setScalar(num("screens", t, 1) * (0.9 + 0.1 * Math.sin(t * 3 + i))); });
      // star
      star.update(t, (p) => { p.x = sp[0]; p.y = sScale > 1.6 ? 0.03 : sp[1]; p.z = sp[2]; p.s = 1.08 * sScale; p.rot = num("starRot", t, Math.PI); p.mode = val("starMode", t) || "sing"; const f = num("starFace", t, 7);
        p.face = val("starTalk", t) === "on" && Math.sin(t * 9) < 0 ? 6 : Math.round(f); });
      star.meshes.torso.getMatrixAt(0, gm); gm.decompose(gv, gq, gs); const on = gs.x > 0.05;
      lapels.forEach((l) => { l.visible = on; if (on) l.matrix.copy(gm); });
      fill.intensity = on ? 1.4 * num("starFill", t, 1) : 0; fill.distance = 3.2 * sScale; if (on) fill.position.copy(new THREE.Vector3(0, 0.75, 0.9).applyMatrix4(gm));
      star.meshes.armR.getMatrixAt(0, gm); mic.matrix.copy(gm).multiply(new THREE.Matrix4().makeTranslation(0, -0.62, 0.06)); mic.visible = (val("starMode", t) || "sing") === "sing";
      glit.forEach((g) => { g.material.size = 0.055 * Math.max(1, sScale * 0.9); g.visible = on && Math.sin(t * 13 + g.userData.k * 2.1) > -0.2; if (!g.visible) return; const arr = g.geometry.attributes.position.array; let last = null;
        g.userData.loc.forEach((l, i) => { if (l[0] !== last) { star.meshes[l[0]].getMatrixAt(0, gm); last = l[0]; } gv.set(l[1], l[2], l[3]).applyMatrix4(gm); arr[i * 3] = gv.x; arr[i * 3 + 1] = gv.y; arr[i * 3 + 2] = gv.z; });
        g.geometry.attributes.position.needsUpdate = true; });
      // footstep fx
      const st = t - num("stepAt", t, -99); const fs = sScale;
      dust.visible = st > 0 && st < 3; if (dust.visible) { dust.position.set(sp[0], 0.3, sp[2]); const r = fs * (0.6 + st * 1.6); dust.scale.set(r, r, 1); dust.material.opacity = 0.75 * (1 - st / 3); }
      puffs.forEach((pf) => { pf.visible = dust.visible; if (!pf.visible) return; const u = pf.userData, r = fs * (0.4 + st * 0.9) * u.r; pf.position.set(sp[0] + Math.cos(u.a) * r, fs * 0.15 * (0.4 + st * 0.5), sp[2] + Math.sin(u.a) * r);
        pf.scale.setScalar(fs * (0.35 + st * 0.35)); pf.material.opacity = 0.7 * (1 - st / 3); });
      // crowds
      const nm = val("nearMood", t) || "cheer";
      near.update(t, (p, tt, i) => { const h = (i * 0.618) % 1;
        if (Math.abs(p.x - pos[0]) < 1.5 && Math.abs(p.z - pos[2]) < 1.5 && pos[1] < 3) { p.hidden = true; return; } p.hidden = false;
        if (nm === "cheer") { p.mode = h < 0.6 ? "cheer" : h < 0.85 ? "film" : "jump"; p.face = h < 0.5 ? 7 : 0; }
        else if (nm === "film") { p.mode = h < 0.7 ? "film" : "point"; p.face = 2; }
        else if (nm === "panic") { p.mode = h < 0.5 ? "panic" : h < 0.8 ? "point" : "film"; p.face = h < 0.5 ? 4 : 3; }
        else if (nm === "run") { p.mode = "run"; p.face = 4; if (p.bx === undefined) { p.bx = p.x; p.bz = p.z; } p.rot = Math.atan2(p.bx, p.bz - 6); const k = num("crowdRun", t);
          const d = Math.hypot(p.bx, p.bz - 6) || 1; p.x = p.bx + p.bx / d * k * (0.8 + h * 0.4); p.z = p.bz + (p.bz - 6) / d * k * (0.8 + h * 0.4); }
        else if (nm === "awe") { p.mode = h < 0.5 ? "film" : h < 0.8 ? "point" : "idle"; p.face = 2; } });
      mass.u.uTime.value = t; mass.u.uCheer.value = num("crowdCheer", t, 0.55); mass.u.uJump.value = num("crowdJump", t, 0.1); mass.u.uFilm.value = num("crowdFilm", t, 0.25); mass.u.uRun.value = num("crowdRun", t, 0);
      // birds scatter on footsteps
      const bk = clamp01(st / 4); birds.material.opacity = st > 0 && st < 6 ? 0.9 * (1 - st / 6) : 0; if (birds.material.opacity > 0) { const a = birds.geometry.attributes.position.array;
        for (let i = 0; i < a.length; i += 3) { a[i] = sp[0] + birdBase[i] * (1 + bk); a[i + 1] = birdBase[i + 1] * 0.4 + st * 12; a[i + 2] = sp[2] + birdBase[i + 2] * (1 + bk); } birds.geometry.attributes.position.needsUpdate = true; }
      stage.visible = sScale < 3; { const bv = num("boards", t, 1) > 0.5; boards.forEach((b) => { b.visible = bv; }); }
      return scene; } };
  });
})();
