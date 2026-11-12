/* Blocky people with faces (eyes, brows, mouth) and emotions, drawn as instanced crowds of up to a few thousand.
   window.WI_BLOCKY(WI) -> { crowd(scene, people, opts), randomLook, faceTex }.  A person is a plain object:
     { x, y, z, rot, mode, phase, s (size; kids ~0.6), skin, shirt, legs, hair (null = bald), face, hidden,
       male (bool), longHair, beard, skirt, belly (0..1 pregnancy), baby (holds a baby), babyFace, phone, vanishT }
   mode: idle | walk | run | point | panic | wave | sit | lie | cry | film | phone | talk | climb | hug | cradle | carry
   face: 0 smile, 1 neutral, 2 surprised, 3 scared, 4 screaming, 5 crying, 6 talking (mouth open), 7 laughing
   rot = 0 faces +z.  update(t, fn) calls fn(p, t, i) for each person first.
   vanishT: from that time on the person is gone; a burst of light marks the spot for 0.8 s. */
window.WI_BLOCKY = function (WI) {
  const { THREE, R, rr, glowTex } = WI;
  const FACES = 8;
  const faceTex = (function () {
    const c = document.createElement("canvas"); c.width = 128 * FACES; c.height = 128; const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
    const eye = (x, y, rx, ry, pupil = true) => { g.fillStyle = "#15110f"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill();
      if (pupil) { g.fillStyle = "#fff"; g.beginPath(); g.arc(x - rx * 0.3, y - ry * 0.35, Math.max(1.5, rx * 0.32), 0, 7); g.fill(); } };
    const brow = (x, y, a, w = 14) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = "#2a1a12"; g.fillRect(-w / 2, -2.5, w, 5); g.restore(); };
    const mouth = (f) => { g.fillStyle = "#4a1212"; g.strokeStyle = "#4a1212"; g.lineWidth = 5; g.lineCap = "round"; f(); };
    for (let i = 0; i < FACES; i++) { g.save(); g.translate(i * 128, 0);
      const L = 44, Rr = 84, ey = 58;
      if (i === 0) { eye(L, ey, 6, 8); eye(Rr, ey, 6, 8); brow(L, 40, -0.1); brow(Rr, 40, 0.1); mouth(() => { g.beginPath(); g.arc(64, 82, 16, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }); }
      if (i === 1) { eye(L, ey, 6, 8); eye(Rr, ey, 6, 8); brow(L, 42, 0); brow(Rr, 42, 0); mouth(() => { g.beginPath(); g.moveTo(52, 92); g.lineTo(76, 92); g.stroke(); }); }
      if (i === 2) { eye(L, ey, 8, 11); eye(Rr, ey, 8, 11); brow(L, 34, -0.2); brow(Rr, 34, 0.2); mouth(() => { g.beginPath(); g.ellipse(64, 94, 8, 11, 0, 0, 7); g.fill(); }); }
      if (i === 3) { eye(L, ey, 9, 12); eye(Rr, ey, 9, 12); brow(L, 36, 0.35); brow(Rr, 36, -0.35); mouth(() => { g.beginPath(); g.ellipse(64, 96, 14, 9, 0, 0, 7); g.fill(); g.fillStyle = "#fff"; g.fillRect(54, 89, 20, 4); }); }
      if (i === 4) { g.strokeStyle = "#15110f"; g.lineWidth = 5; g.beginPath(); g.moveTo(34, 52); g.lineTo(52, 60); g.moveTo(94, 52); g.lineTo(76, 60); g.stroke();
        brow(L, 40, 0.45); brow(Rr, 40, -0.45); mouth(() => { g.beginPath(); g.ellipse(64, 95, 17, 20, 0, 0, 7); g.fill(); g.fillStyle = "#c2414a"; g.beginPath(); g.ellipse(64, 104, 9, 7, 0, 0, 7); g.fill(); }); }
      if (i === 5) { eye(L, ey + 2, 6, 6); eye(Rr, ey + 2, 6, 6); brow(L, 40, 0.4); brow(Rr, 40, -0.4);
        g.fillStyle = "#7fd0ff"; g.fillRect(L - 3, ey + 8, 6, 30); g.fillRect(Rr - 3, ey + 8, 6, 34);
        mouth(() => { g.beginPath(); g.arc(64, 104, 14, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }); }
      if (i === 6) { eye(L, ey, 6, 8); eye(Rr, ey, 6, 8); brow(L, 40, 0); brow(Rr, 40, 0); mouth(() => { g.beginPath(); g.ellipse(64, 92, 11, 9, 0, 0, 7); g.fill(); }); }
      if (i === 7) { g.strokeStyle = "#15110f"; g.lineWidth = 5; g.beginPath(); g.arc(L, ey + 4, 8, 1.1 * Math.PI, 1.9 * Math.PI); g.arc(Rr, ey + 4, 8, 1.1 * Math.PI, 1.9 * Math.PI); g.stroke();
        brow(L, 38, -0.15); brow(Rr, 38, 0.15); mouth(() => { g.beginPath(); g.arc(64, 82, 18, 0, Math.PI); g.fill(); g.fillStyle = "#fff"; g.fillRect(50, 82, 28, 5); }); }
      g.restore(); }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; })();

  const box = (w, h, d, tx, ty, tz) => { const geo = new THREE.BoxGeometry(w, h, d); geo.translate(tx || 0, ty || 0, tz || 0); return geo; };
  const G = { leg: box(0.17, 0.78, 0.18, 0, -0.39), torso: box(0.46, 0.6, 0.26, 0, 0.3), arm: box(0.135, 0.6, 0.135, 0, -0.28),
    head: box(0.38, 0.38, 0.36, 0, 0.19), hair: box(0.41, 0.13, 0.39, 0, 0.42), hairBack: box(0.46, 0.52, 0.24, 0, 0.13, -0.08),
    beard: box(0.3, 0.13, 0.04, 0, 0.065, 0.185), skirt: box(0.54, 0.38, 0.34, 0, -0.17, 0), belly: box(0.4, 0.36, 0.22, 0, 0.21, 0.13),
    blanket: box(0.4, 0.22, 0.24, 0, 0, 0), hatTop: box(0.42, 0.15, 0.4, 0, 0.45, 0), hatBrim: box(0.6, 0.035, 0.58, 0, 0.385, 0), glasses: box(0.4, 0.1, 0.03, 0, 0.225, 0.19), afro: box(0.62, 0.34, 0.5, 0, 0.5, -0.08), mustache: box(0.2, 0.035, 0.02, 0, 0.115, 0.185), tie: box(0.15, 0.5, 0.02, 0, 0.3, 0.135), babyHead: box(0.17, 0.17, 0.16, 0, 0, 0), phone: box(0.08, 0.15, 0.015, 0, 0, 0) };
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.3, metalness: 0.3, emissive: 0x16304a, emissiveIntensity: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.15, metalness: 0.6 });
  const mkFaceMat = () => { const m = new THREE.MeshStandardMaterial({ color: 0xffffff, map: faceTex, roughness: 0.75 });
    m.onBeforeCompile = (sh) => { sh.vertexShader = "attribute float faceIdx;\n" + sh.vertexShader.replace("#include <uv_vertex>",
      `#include <uv_vertex>\n#ifdef USE_UV\n vUv.x = (vUv.x + faceIdx) / ${FACES}.0;\n#endif`); };
    m.customProgramCacheKey = () => "wi-face"; return m; };
  const faceMat = mkFaceMat();

  const SKIN = ["#f2c9a5", "#e8b48c", "#d39a6e", "#b9784f", "#8d5a3a", "#6b4129", "#f6d6bd"].map((c) => new THREE.Color(c));
  const BRIGHT = ["#ff4d6d", "#ffb703", "#06d6a0", "#118ab2", "#ef476f", "#ffd166", "#8338ec", "#3a86ff", "#fb5607", "#ff006e",
    "#2ec4b6", "#e9ff70", "#ffffff", "#f15bb5", "#00bbf9", "#9b5de5"].map((c) => new THREE.Color(c));
  const DARKC = ["#1d3557", "#2b2d42", "#3d405b", "#264653", "#4a4e69", "#22223b", "#6b705c", "#3c3c3c"].map((c) => new THREE.Color(c));
  const HAIR = ["#1b1310", "#2d1d14", "#4a2e1c", "#7b4b2a", "#c8a165", "#e7cf8a", "#a33b20", "#111111"].map((c) => new THREE.Color(c));
  WI.BLOCKY_COLORS = { SKIN, BRIGHT, HAIR, DARKC };
  const pick = (a) => a[Math.floor(R() * a.length)];
  const C0 = new THREE.Color(0xffffff);

  function randomLook(p) {
    if (p.male === undefined) p.male = R() < 0.5;
    p.skin = p.skin || pick(SKIN);
    p.shirt = p.shirt || pick(BRIGHT);
    p.legs = p.legs || (R() < 0.6 ? pick(DARKC) : pick(BRIGHT));
    if (p.hair === undefined) p.hair = p.male && R() < 0.12 ? null : pick(HAIR);
    if (p.longHair === undefined) p.longHair = !p.male && R() < 0.8;
    if (p.beard === undefined) p.beard = p.male && R() < 0.35;
    if (p.skirt === undefined) p.skirt = !p.male && R() < 0.45;
    p.s = p.s || (p.male ? rr(0.98, 1.08) : rr(0.9, 0.99)); p.phase = p.phase ?? R() * 10; p.speed = p.speed ?? rr(0.85, 1.2);
    if (p.face === undefined) p.face = R() < 0.6 ? 0 : R() < 0.5 ? 7 : 1;
    return p;
  }

  function crowd(scene, people, opts = {}) {
    people.forEach(randomLook);
    const n = people.length;
    const mk = (geo, mat, cast = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.castShadow = cast; m.receiveShadow = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; };
    const headGeo = G.head.clone(); const fi = new Float32Array(n); headGeo.setAttribute("faceIdx", new THREE.InstancedBufferAttribute(fi, 1));
    const bhGeo = G.babyHead.clone(); const bfi = new Float32Array(n); bhGeo.setAttribute("faceIdx", new THREE.InstancedBufferAttribute(bfi, 1));
    const M = { torso: mk(G.torso, clothMat), legL: mk(G.leg, clothMat), legR: mk(G.leg, clothMat), armL: mk(G.arm, skinMat), armR: mk(G.arm, skinMat),
      head: mk(headGeo, [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat]), hair: mk(G.hair, clothMat), hairBack: mk(G.hairBack, clothMat),
      beard: mk(G.beard, clothMat), skirt: mk(G.skirt, clothMat), belly: mk(G.belly, clothMat), blanket: mk(G.blanket, clothMat),
      babyHead: mk(bhGeo, [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat]), phone: mk(G.phone, darkMat, false),
      hatTop: mk(G.hatTop, clothMat), hatBrim: mk(G.hatBrim, clothMat), glasses: mk(G.glasses, glassMat, false),
      mustache: mk(G.mustache, clothMat, false), tie: mk(G.tie, clothMat, false), afro: mk(G.afro, clothMat) };
    const blanketCols = ["#ffd6e8", "#cfe8ff", "#fff3c4", "#d9f7d6"].map((c) => new THREE.Color(c));
    people.forEach((p, i) => { M.torso.setColorAt(i, p.shirt); M.legL.setColorAt(i, p.legs); M.legR.setColorAt(i, p.legs);
      const arm = p.armCol || (p.longSleeve ? p.shirt : p.skin); M.armL.setColorAt(i, arm); M.armR.setColorAt(i, arm); M.head.setColorAt(i, p.skin);
      const hc = p.hair || p.skin; M.hair.setColorAt(i, hc); M.hairBack.setColorAt(i, hc); M.beard.setColorAt(i, p.hair || HAIR[0]);
      M.skirt.setColorAt(i, p.skirtCol || p.shirt); M.belly.setColorAt(i, p.shirt); M.blanket.setColorAt(i, blanketCols[i % 4]); M.babyHead.setColorAt(i, SKIN[(i * 3) % 7]);
      M.phone.setColorAt(i, new THREE.Color(0xffffff)); const hc2 = p.hatCol || C0; M.hatTop.setColorAt(i, hc2); M.hatBrim.setColorAt(i, hc2); M.glasses.setColorAt(i, new THREE.Color(0xffffff)); M.mustache.setColorAt(i, p.hair || HAIR[0]); M.tie.setColorAt(i, p.tieCol || HAIR[7]); M.afro.setColorAt(i, p.hair || HAIR[0]); });
    Object.values(M).forEach((m) => { if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    // light bursts where people vanish
    const PP = 8; const poofPos = new Float32Array(n * PP * 3).fill(-9999);
    const poofs = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(poofPos, 3)),
      new THREE.PointsMaterial({ map: glowTex, color: 0xfff2c8, size: 0.55, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    poofs.frustumCulled = false; poofs.userData.noShadow = true; scene.add(poofs);
    const poofSeed = Array.from({ length: n * PP }, () => [R() - 0.5, R(), R() - 0.5]);
    const base = new THREE.Matrix4(), part = new THREE.Matrix4(), out = new THREE.Matrix4(), tmp = new THREE.Matrix4(), scl = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(),
      v = new THREE.Vector3(), sc = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
    const local = (x, y, z, rx, ry, rz) => { e.set(rx, ry, rz, "YXZ"); part.makeRotationFromEuler(e); part.setPosition(x, y, z); return out.multiplyMatrices(base, part); };
    const put = (mesh, i, x, y, z, rx, ry, rz) => { mesh.setMatrixAt(i, local(x, y, z, rx, ry, rz)); };
    const hideAll = (i) => { for (const k in M) M[k].setMatrixAt(i, ZERO); };
    const api = { people, meshes: M, visible: true,
      update(t, fn) {
        let poofDirty = false;
        for (let i = 0; i < n; i++) { const p = people[i]; if (fn) fn(p, t, i);
          // vanish burst
          const vt = p.vanishT !== undefined ? t - p.vanishT : -1;
          if (vt >= 0 && vt < 0.8) { const lx = p.x, ly = (p.y || 0) + 1.0 * p.s, lz = p.z;
            for (let k = 0; k < PP; k++) { const s = poofSeed[i * PP + k], j = (i * PP + k) * 3, r = 0.15 + vt * 1.1;
              poofPos[j] = lx + s[0] * r; poofPos[j + 1] = ly + (s[1] - 0.3) * 1.2 + vt * 0.9; poofPos[j + 2] = lz + s[2] * r; } poofDirty = true; }
          else if (poofPos[i * PP * 3] !== -9999) { for (let k = 0; k < PP * 3; k++) poofPos[i * PP * 3 + k] = -9999; poofDirty = true; }
          if (p.hidden || !api.visible || vt >= 0) { hideAll(i); continue; }
          const ph = p.phase + t * p.speed; let lean = 0, bodyY = 0, pitch = 0;
          let aL = [0.05 * Math.sin(ph * 1.3), 0.08], aR = [0.05 * Math.sin(ph * 1.3 + 1), -0.08], lL = 0, lR = 0, headX = 0, headY = 0;
          let m = p.mode || "idle"; if (p.baby && (m === "idle" || m === "talk")) m = "cradle";
          if (m === "walk") { const w = Math.sin(ph * 6); lL = w * 0.45; lR = -w * 0.45; aL = [-w * 0.4, 0.06]; aR = [w * 0.4, -0.06]; bodyY = Math.abs(Math.cos(ph * 6)) * 0.03;
            if (p.baby) { aL = [-1.2, -0.5]; aR = [-1.2, 0.5]; } }
          else if (m === "run") { const w = Math.sin(ph * 11); lL = w * 0.95; lR = -w * 0.95; aL = [-w * 1.05, 0.15]; aR = [w * 1.05, -0.15]; lean = 0.22; bodyY = Math.abs(Math.cos(ph * 11)) * 0.09; }
          else if (m === "climb") { const w = Math.sin(ph * 7); lL = -0.5 + w * 0.5; lR = -0.5 - w * 0.5; aL = [-w * 0.6, 0.15]; aR = [w * 0.6, -0.15]; lean = 0.3; }
          else if (m === "point") { aR = [-1.55 + 0.05 * Math.sin(ph * 3), -0.1]; headX = -0.1; }
          else if (m === "film") { aR = [-1.35, 0.35]; aL = [-1.2, -0.35]; headX = -0.05; }
          else if (m === "phone") { aR = [-2.6, -0.55]; headY = 0.15; }
          else if (m === "text") { aR = [-1.0, 0.25]; aL = [-0.9, -0.25]; headX = 0.35; }
          else if (m === "panic") { const w = Math.sin(ph * 4) * 0.12; aL = [-0.4, 2.45 + w]; aR = [-0.4, -2.45 - w]; headY = Math.sin(ph * 2.3) * 0.35; }
          else if (m === "wave") { const w = Math.sin(ph * 9) * 0.35; aL = [0, 2.75 + w]; aR = [0, -2.75 - w]; }
          else if (m === "cheer") { const w = Math.sin(ph * 7) * 0.2; aL = [0, 2.6 + w]; aR = [0, -2.6 - w]; bodyY = Math.max(0, Math.sin(ph * 7)) * 0.12; }
          else if (m === "cry") { aL = [-2.35, -0.45]; aR = [-2.35, 0.45]; headX = 0.35; lean = 0.15; }
          else if (m === "talk") { aR = [-0.6 + 0.25 * Math.sin(ph * 5), -0.3]; aL = [-0.3 + 0.2 * Math.sin(ph * 4), 0.25]; headY = Math.sin(ph * 1.7) * 0.15; }
          else if (m === "hug") { aL = [-1.4, -0.7]; aR = [-1.4, 0.7]; }
          else if (m === "cradle") { aL = [-1.15, -0.55]; aR = [-1.15, 0.55]; headX = 0.3; }
          else if (m === "carry") { aL = [-0.9, -0.2]; aR = [-0.9, 0.2]; }
          else if (m === "sick") { aL = [-0.9, 0.2]; aR = [-1.9, -0.2]; headX = 0.5; lean = 0.55; }
          else if (m === "belly") { aL = [-0.75, -0.75]; aR = [-0.75, 0.75]; lean = -0.12; headX = 0.15; }
          else if (m === "sit") { lL = -1.45; lR = -1.4; bodyY = -0.62; aL = [0.5, 0.15]; aR = [0.5, -0.15]; if (p.baby) { aL = [-1.15, -0.55]; aR = [-1.15, 0.55]; } }
          else if (m === "sitwork") { lL = -1.45; lR = -1.4; bodyY = -0.38; aL = [-1.1, 0.1]; aR = [-1.1 + 0.1 * Math.sin(ph * 9), -0.1]; }
          else if (m === "lie") { pitch = -Math.PI / 2; bodyY = 0.16; aL = [0, 0.25]; aR = [0, -0.25]; }
          else if (m === "sing") { aR = [-1.75, -0.6]; aL = [-0.5 + 0.25 * Math.sin(ph * 2), 0.9 + 0.2 * Math.sin(ph * 1.5)]; headX = -0.15 + 0.05 * Math.sin(ph * 3); headY = Math.sin(ph * 1.2) * 0.2; }
          else if (m === "micstand") { aL = [-1.85, -0.35]; aR = [-0.25 + 0.1 * Math.sin(ph * 2), -0.25]; headY = 0.35 + Math.sin(ph * 1.3) * 0.1; headX = -0.12; lean = -0.04; }
          else if (m === "belt") { aR = [-2.3, -0.4]; aL = [-1.2, 1.6]; headX = -0.4; lean = -0.1; }
          else if (m === "jump") { const w = Math.max(0, Math.sin(ph * 6)); bodyY = w * 0.35; aL = [0, 2.6]; aR = [0, -2.6]; lL = -w * 0.3; lR = -w * 0.3; }
          else if (m === "tip") { const w = Math.sin(ph * 9); lean = 0.55 + 0.06 * Math.sin(ph * 3); aL = [-2.2 + 0.6 * w, 0.7]; aR = [-2.2 - 0.6 * w, -0.7]; headX = -0.35; lL = -0.15; }
          else if (m === "selfie") { aR = [-2.55, -0.35]; aL = [0.05 * Math.sin(ph * 1.3), 0.12]; headY = 0.25; headX = -0.15; }
          else if (m === "kneel") { lL = 1.35; lR = 1.3; bodyY = -0.5; aL = [-0.7, 0.12]; aR = [-0.7, -0.12]; lean = 0.25; headX = 0.25; }
          else if (m === "heavy") { bodyY = -0.08; lL = -0.25; lR = -0.2; aL = [0.15, 0.05]; aR = [0.15, -0.05]; lean = 0.38; headX = 0.35; }
          else if (m === "lieBed") { pitch = -Math.PI / 2; bodyY = 0.16; aL = [-0.3, 0.2]; aR = [-0.3, -0.2]; }
          // ---- no-friction set: slipping, gliding, falling (friction video)
          else if (m === "slip") { const w = Math.sin(ph * 7); lL = 0.25 + 0.85 * w; lR = 0.25 - 0.85 * w; aL = [-1.0 + 1.3 * Math.sin(ph * 5), 1.1 + 0.7 * Math.sin(ph * 4)]; aR = [-1.0 + 1.3 * Math.sin(ph * 5 + 2.1), -1.1 - 0.7 * Math.sin(ph * 4 + 1)];
            lean = -0.28 + 0.22 * Math.sin(ph * 3); headX = -0.25; headY = 0.3 * Math.sin(ph * 2.3); bodyY = -0.04; }
          else if (m === "glide") { const w = Math.sin(ph * 2.2); lL = 0.32; lR = -0.22; aL = [0.1 * w, 1.45 + 0.25 * w]; aR = [-0.1 * w, -1.45 + 0.25 * w]; lean = 0.08 * Math.sin(ph * 1.7); headY = 0.2 * w; bodyY = -0.06; }
          else if (m === "split") { lL = -1.52; lR = 1.5; bodyY = -0.6; aL = [0.2, 2.3 + 0.15 * Math.sin(ph * 6)]; aR = [0.2, -2.3 - 0.15 * Math.sin(ph * 6)]; headX = -0.25; }
          else if (m === "flail") { pitch = -Math.PI / 2; bodyY = 0.16; aL = [-2.6 + 0.9 * Math.sin(ph * 9), 0.7]; aR = [-2.6 + 0.9 * Math.sin(ph * 9 + 1.7), -0.7]; lL = -0.7 + 0.6 * Math.sin(ph * 8); lR = -0.7 - 0.6 * Math.sin(ph * 8); headX = -0.3; }
          else if (m === "faceplant") { pitch = Math.PI / 2 - 0.06; bodyY = 0.16; aL = [-3.0, 0.35]; aR = [-3.0, -0.35]; lL = 0.15 * Math.sin(ph * 3); lR = 0; headX = 0.2; }
          else if (m === "violin") { aL = [-1.55, 0.95]; aR = [-1.25 + 0.28 * Math.sin(ph * 4), -0.55]; headX = 0.25; headY = 0.35; }
          else if (m === "eat") { aR = [-2.15, -0.4]; aL = [0.05 * Math.sin(ph * 1.3), 0.1]; headX = -0.05; }
          else if (m === "grabYou") { aL = [-1.5, 0.5]; aR = [-1.7, -0.9]; lean = -0.15; lL = 0.4 + 0.3 * Math.sin(ph * 7); lR = -0.3 - 0.3 * Math.sin(ph * 7); headX = -0.15; headY = 0.5; }
          const s = p.s; q.setFromEuler(e.set(pitch + (p.tilt || 0), p.rot || 0, p.roll || 0, "YXZ"));
          const py = (p.y || 0) + (pitch ? bodyY : 0);
          base.compose(v.set(p.x, py, p.z), q, sc.set(s, s, s));
          const hip = 0.8 + (pitch ? 0 : bodyY);
          put(M.legL, i, -0.1, hip, 0, lL, 0, 0); put(M.legR, i, 0.1, hip, 0, lR, 0, 0);
          const cl = Math.cos(lean), sl = Math.sin(lean);
          put(M.torso, i, 0, hip, 0, lean, 0, 0);
          if (p.skirt) put(M.skirt, i, 0, hip + 0.02, 0, lean * 0.3, 0, 0); else M.skirt.setMatrixAt(i, ZERO);
          const bl = p.belly || 0;
          if (bl > 0.03) { local(0, hip, 0, lean, 0, 0); scl.makeScale(1 + bl * 0.15, 0.8 + bl * 0.35, 0.2 + bl * 1.9); tmp.multiplyMatrices(out, scl); M.belly.setMatrixAt(i, tmp); } else M.belly.setMatrixAt(i, ZERO);
          const shY = hip + 0.56 * cl, shZ = 0.56 * sl;
          put(M.armL, i, -0.3, shY, shZ, aL[0] + lean, 0, aL[1]);
          local(0.3, shY, shZ, aR[0] + lean, 0, aR[1]); M.armR.setMatrixAt(i, out);
          if (p.phone || m === "phone" || m === "text" || m === "film" || m === "sing" || m === "belt" || m === "selfie") { tmp.copy(out).multiply(part.makeTranslation(0, -0.6, 0.08)); M.phone.setMatrixAt(i, tmp); } else M.phone.setMatrixAt(i, ZERO);
          const nkY = hip + 0.61 * cl, nkZ = 0.61 * sl;
          put(M.head, i, 0, nkY, nkZ, headX + lean * 0.4, headY, 0); put(M.hair, i, 0, nkY, nkZ, headX + lean * 0.4, headY, 0);
          if (p.longHair && p.hair) put(M.hairBack, i, 0, nkY, nkZ, headX * 0.5 + lean * 0.4, headY, 0); else M.hairBack.setMatrixAt(i, ZERO);
          if (p.beard) put(M.beard, i, 0, nkY, nkZ, headX + lean * 0.4, headY, 0); else M.beard.setMatrixAt(i, ZERO);
          if (!p.hair || p.hat || p.afro) M.hair.setMatrixAt(i, ZERO);
          if (p.afro) put(M.afro, i, 0, nkY, nkZ, headX + lean * 0.4, headY, 0); else M.afro.setMatrixAt(i, ZERO);
          if (p.hat) { put(M.hatTop, i, 0, nkY, nkZ, headX + lean * 0.4, headY, 0); put(M.hatBrim, i, 0, nkY, nkZ, headX + lean * 0.4 - 0.08, headY, 0); } else { M.hatTop.setMatrixAt(i, ZERO); M.hatBrim.setMatrixAt(i, ZERO); }
          if (p.glasses && !p.noGlasses) { local(0, nkY, nkZ, headX + lean * 0.4, headY, 0); const go = p.glassOff || [0, 0]; tmp.copy(out).multiply(part.makeTranslation(0, -go[0], go[1])); M.glasses.setMatrixAt(i, tmp); } else M.glasses.setMatrixAt(i, ZERO);
          if (p.mustache) put(M.mustache, i, 0, nkY, nkZ, headX + lean * 0.4, headY, 0); else M.mustache.setMatrixAt(i, ZERO);
          if (p.tie) put(M.tie, i, 0, hip, 0, lean, 0, 0); else M.tie.setMatrixAt(i, ZERO);
          if (p.baby) { const by = shY - 0.42, bz = 0.3 + shZ; put(M.blanket, i, 0, by, bz, 0.1, 0, 0.15); put(M.babyHead, i, 0.2, by + 0.08, bz + 0.02, -0.4, 0.3, 0.15); bfi[i] = p.babyFace || 0; }
          else { M.blanket.setMatrixAt(i, ZERO); M.babyHead.setMatrixAt(i, ZERO); }
          fi[i] = p.face || 0; }
        for (const k in M) M[k].instanceMatrix.needsUpdate = true;
        headGeo.attributes.faceIdx.needsUpdate = true; bhGeo.attributes.faceIdx.needsUpdate = true;
        if (poofDirty) poofs.geometry.attributes.position.needsUpdate = true;
      } };
    return api;
  }
  // ---- mass(scene, list, opts): tens of thousands of real 3D people in ONE instanced mesh, animated on the GPU.
  //   list items: { x, y, z, rot, s, mode (0 idle, 1 cheer, 2 film/phone, 3 jump, 4 walk) }.  Colours are picked like randomLook.
  //   api.u: uTime, uCheer / uJump / uFilm (0..1 share of people switched to that mode), uRun (metres run along their facing), uHide (centre xz + radius)
  function mass(scene, list, opts = {}) {
    const n = list.length; const parts = [];
    const add = (geo, part) => { const g = geo.clone().toNonIndexed(); const c = g.attributes.position.count; g.setAttribute("part", new THREE.Float32BufferAttribute(new Float32Array(c).fill(part), 1)); parts.push(g); };
    const gL = G.leg.clone(); gL.translate(-0.1, 0.8, 0); add(gL, 0); const gR = G.leg.clone(); gR.translate(0.1, 0.8, 0); add(gR, 0.5);
    const gT = G.torso.clone(); gT.translate(0, 0.8, 0); add(gT, 1);
    const gH = G.head.clone(); gH.translate(0, 1.41, 0); add(gH, 2); const gHr = G.hair.clone(); gHr.translate(0, 1.41, 0); add(gHr, 4);
    const gAL = G.arm.clone(); gAL.translate(-0.3, 1.36, 0); add(gAL, 3); const gAR = G.arm.clone(); gAR.translate(0.3, 1.36, 0); add(gAR, 3.5);
    // merge
    let total = 0; parts.forEach((g) => total += g.attributes.position.count);
    const P = new Float32Array(total * 3), N = new Float32Array(total * 3), PT = new Float32Array(total); let o = 0;
    parts.forEach((g) => { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); PT.set(g.attributes.part.array, o); o += g.attributes.position.count; });
    const geo = new THREE.InstancedBufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(P, 3)); geo.setAttribute("normal", new THREE.BufferAttribute(N, 3)); geo.setAttribute("part", new THREE.BufferAttribute(PT, 1));
    const cS = new Float32Array(n * 3), cL = new Float32Array(n * 3), cK = new Float32Array(n * 3), cH = new Float32Array(n * 3), aM = new Float32Array(n * 4);
    const mesh = new THREE.InstancedMesh(geo, null, n);
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
    const conv = (c) => opts.linear ? c.clone().convertSRGBToLinear() : c;
    list.forEach((p, i) => { const sh = conv(p.shirt || pick(BRIGHT)), lg = conv(p.legs || (R() < 0.6 ? pick(DARKC) : pick(BRIGHT))), sk = conv(p.skin || pick(SKIN)), hr = conv(p.hair || pick(HAIR));
      cS.set([sh.r, sh.g, sh.b], i * 3); cL.set([lg.r, lg.g, lg.b], i * 3); cK.set([sk.r, sk.g, sk.b], i * 3); cH.set([hr.r, hr.g, hr.b], i * 3);
      aM.set([p.mode || 0, R() * 50, rr(0.8, 1.3), R()], i * 4);
      const s = p.s || rr(0.9, 1.08); Q.setFromAxisAngle(Y, p.rot || 0); M4.compose(V.set(p.x, p.y || 0, p.z), Q, S.set(s, s, s)); mesh.setMatrixAt(i, M4); });
    geo.setAttribute("cShirt", new THREE.InstancedBufferAttribute(cS, 3)); geo.setAttribute("cLegs", new THREE.InstancedBufferAttribute(cL, 3));
    geo.setAttribute("cSkin", new THREE.InstancedBufferAttribute(cK, 3)); geo.setAttribute("cHair", new THREE.InstancedBufferAttribute(cH, 3)); geo.setAttribute("aMode", new THREE.InstancedBufferAttribute(aM, 4));
    const u = { uTime: { value: 0 }, uCheer: { value: 0 }, uJump: { value: 0 }, uFilm: { value: 0 }, uRun: { value: 0 }, uSlip: { value: 0 }, uSlipD: { value: 0 }, uStop: { value: 0 }, uHide: { value: new THREE.Vector3(0, 0, -1) }, uScale: { value: 1 } };
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, u);
      sh.vertexShader = `attribute float part; attribute vec3 cShirt; attribute vec3 cLegs; attribute vec3 cSkin; attribute vec3 cHair; attribute vec4 aMode;
        uniform float uTime; uniform float uCheer; uniform float uJump; uniform float uFilm; uniform float uRun; uniform float uSlip; uniform float uSlipD; uniform float uStop; uniform vec3 uHide; varying vec3 vMC;
        vec3 rotX(vec3 p, vec3 pv, float a){ p -= pv; float c = cos(a), s = sin(a); return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c) + pv; }
        vec3 rotZ(vec3 p, vec3 pv, float a){ p -= pv; float c = cos(a), s = sin(a); return vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z) + pv; }
        ` + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        float md = aMode.x; float r = aMode.w; float ph = aMode.y + uTime * aMode.z;
        if (r < uFilm) md = 2.0; if (r < uCheer) md = 1.0; if (r < uJump) md = 3.0; if (uRun > 0.0) md = 5.0;
        if (uSlip > 0.0) md = 6.0;
        float side = fract(part) > 0.25 ? 1.0 : -1.0; float pk = floor(part);
        float bodyY = 0.0;
        if (pk == 3.0) { vec3 sp = vec3(0.3 * side, 1.36, 0.0);
          if (md == 1.0) transformed = rotZ(transformed, sp, side * (2.6 + 0.25 * sin(ph * 7.0)));
          else if (md == 2.0) { if (side > 0.0) transformed = rotX(transformed, sp, -1.4); else transformed = rotX(transformed, sp, 0.05 * sin(ph)); }
          else if (md == 3.0) transformed = rotZ(transformed, sp, side * 2.7);
          else if (md == 4.0 || md == 5.0) transformed = rotX(transformed, sp, sin(ph * (md == 5.0 ? 11.0 : 6.0)) * side * (md == 5.0 ? 1.0 : 0.4));
          else transformed = rotX(transformed, sp, 0.06 * sin(ph * 1.3 + side)); }
        if (pk == 0.0 && (md == 4.0 || md == 5.0)) transformed = rotX(transformed, vec3(0.0, 0.8, 0.0), sin(ph * (md == 5.0 ? 11.0 : 6.0)) * side * (md == 5.0 ? 0.9 : 0.45));
        if (md == 1.0) bodyY = max(0.0, sin(ph * 7.0)) * 0.1;
        if (md == 3.0) bodyY = max(0.0, sin(ph * 6.0)) * 0.45;
        if (md == 5.0) { bodyY = abs(cos(ph * 11.0)) * 0.08; transformed.x = -transformed.x; transformed.z = -transformed.z - uRun * aMode.z; }
        if (md == 6.0) { float fall = clamp((uSlipD * aMode.z - r * 4.0) * 0.9, 0.0, 1.0) * step(0.35, r); float fallS = max(fall, uStop * step(r, 0.35) * 0.95);
          if (pk == 3.0) { vec3 sp = vec3(0.3 * side, 1.36, 0.0); transformed = rotZ(transformed, sp, side * (1.3 + 0.9 * sin(ph * 5.0 + side * 1.7)) * (1.0 - fallS * 0.4)); }
          if (pk == 0.0) transformed = rotX(transformed, vec3(0.0, 0.8, 0.0), sin(ph * 7.0) * side * 0.85 * (1.0 - uStop));
          transformed = rotX(transformed, vec3(0.0, 0.0, 0.0), -1.5 * fall * (r > 0.7 ? -1.0 : 1.0) + (1.0 - fall) * (-0.25 + 0.2 * sin(ph * 3.0)) * uSlip * (1.0 - uStop));
          transformed = rotX(transformed, vec3(0.0, 0.0, 0.0), 1.5 * uStop * step(r, 0.35));
          transformed.y += 0.15 * max(fall, uStop * step(r, 0.35));
          transformed.z += uSlipD * (0.6 + aMode.z * 0.6); transformed.x += uSlipD * (r - 0.5) * 0.6; }
        transformed.y += bodyY;
        vec4 wc = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0); if (uHide.z > 0.0 && distance(wc.xz, uHide.xy) < uHide.z) transformed *= 0.0;
        vMC = pk == 0.0 ? cLegs : pk == 1.0 ? cShirt : pk == 4.0 ? cHair : cSkin;`);
      sh.fragmentShader = "varying vec3 vMC;\n" + sh.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );", "vec4 diffuseColor = vec4( diffuse * vMC, opacity );"); };
    mat.customProgramCacheKey = () => "wi-mass";
    mesh.material = mat; mesh.frustumCulled = false; mesh.castShadow = !!opts.shadow; mesh.receiveShadow = true; mesh.userData.noShadow = !opts.shadow; scene.add(mesh);
    return { mesh, u, n };
  }
  return { crowd, faceTex, randomLook, mass };
};
