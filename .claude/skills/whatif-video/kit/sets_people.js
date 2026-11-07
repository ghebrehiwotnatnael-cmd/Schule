/* Blocky people with faces (eyes, brows, mouth) and emotions, drawn as instanced crowds of up to a few thousand.
   window.WI_BLOCKY(WI) -> { crowd(scene, people, opts) }.  A person is a plain object:
     { x, y, z, rot, mode, phase, s (size), skin, shirt, legs, hair (null = bald), face, ... }
   mode: idle | walk | run | point | panic (hands on head) | wave (arms up) | sit | lie | cry | film | talk | climb
   face: 0 smile, 1 neutral, 2 surprised, 3 scared, 4 screaming, 5 crying, 6 talking (mouth open), 7 laughing
   rot = 0 faces +z.  update(t, fn) calls fn(p, t) for each person to set x,y,z,rot,mode,face before drawing. */
window.WI_BLOCKY = function (WI) {
  const { THREE, R, rr } = WI;
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

  const box = (w, h, d, ty) => { const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, ty, 0); return geo; };
  const G = { leg: box(0.17, 0.78, 0.18, -0.39), torso: box(0.46, 0.6, 0.26, 0.3), arm: box(0.135, 0.6, 0.135, -0.28),
    head: box(0.38, 0.38, 0.36, 0.19), hair: box(0.41, 0.13, 0.39, 0.42) };
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: faceTex, roughness: 0.75 });
  faceMat.onBeforeCompile = (sh) => { sh.vertexShader = "attribute float faceIdx;\n" + sh.vertexShader.replace("#include <uv_vertex>",
    `#include <uv_vertex>\n#ifdef USE_UV\n vUv.x = (vUv.x + faceIdx) / ${FACES}.0;\n#endif`); };
  faceMat.customProgramCacheKey = () => "wi-face";

  const SKIN = ["#f2c9a5", "#e8b48c", "#d39a6e", "#b9784f", "#8d5a3a", "#6b4129", "#f6d6bd"].map((c) => new THREE.Color(c));
  const BRIGHT = ["#ff4d6d", "#ffb703", "#06d6a0", "#118ab2", "#ef476f", "#ffd166", "#8338ec", "#3a86ff", "#fb5607", "#ff006e",
    "#2ec4b6", "#e9ff70", "#ffffff", "#f15bb5", "#00bbf9", "#9b5de5"].map((c) => new THREE.Color(c));
  const HAIR = ["#1b1310", "#2d1d14", "#4a2e1c", "#7b4b2a", "#c8a165", "#e7cf8a", "#a33b20", "#111111"].map((c) => new THREE.Color(c));
  WI.BLOCKY_COLORS = { SKIN, BRIGHT, HAIR };

  function randomLook(p) {
    p.skin = p.skin || SKIN[Math.floor(R() * SKIN.length)];
    p.shirt = p.shirt || (R() < 0.3 ? p.skin : BRIGHT[Math.floor(R() * BRIGHT.length)]);
    p.legs = p.legs || (R() < 0.35 ? p.skin : BRIGHT[Math.floor(R() * BRIGHT.length)]);
    if (p.hair === undefined) p.hair = R() < 0.12 ? null : HAIR[Math.floor(R() * HAIR.length)];
    p.s = p.s || rr(0.9, 1.06); p.phase = p.phase ?? R() * 10; p.speed = p.speed ?? rr(0.85, 1.2);
    if (p.face === undefined) p.face = R() < 0.6 ? 0 : R() < 0.5 ? 7 : 1;
    return p;
  }

  function crowd(scene, people, opts = {}) {
    people.forEach(randomLook);
    const n = people.length;
    const mk = (geo, mat, cast = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.castShadow = cast; m.receiveShadow = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; };
    const headGeo = G.head.clone(); const fi = new Float32Array(n); headGeo.setAttribute("faceIdx", new THREE.InstancedBufferAttribute(fi, 1));
    const M = { torso: mk(G.torso, clothMat), legL: mk(G.leg, clothMat), legR: mk(G.leg, clothMat), armL: mk(G.arm, skinMat), armR: mk(G.arm, skinMat),
      head: mk(headGeo, [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat]), hair: mk(G.hair, clothMat) };
    M.head.userData.noShadow = false;
    people.forEach((p, i) => { M.torso.setColorAt(i, p.shirt); M.legL.setColorAt(i, p.legs); M.legR.setColorAt(i, p.legs); M.armL.setColorAt(i, p.armCol || p.skin);
      M.armR.setColorAt(i, p.armCol || p.skin); M.head.setColorAt(i, p.skin); M.hair.setColorAt(i, p.hair || p.skin); });
    Object.values(M).forEach((m) => { if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    const base = new THREE.Matrix4(), part = new THREE.Matrix4(), out = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(),
      v = new THREE.Vector3(), sc = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
    const put = (mesh, i, x, y, z, rx, ry, rz) => { e.set(rx, ry, rz, "YXZ"); part.makeRotationFromEuler(e); part.setPosition(x, y, z); out.multiplyMatrices(base, part); mesh.setMatrixAt(i, out); };
    const api = { people, meshes: M, visible: true,
      update(t, fn) {
        for (let i = 0; i < n; i++) { const p = people[i]; if (fn) fn(p, t, i);
          if (p.hidden || !api.visible) { for (const k in M) M[k].setMatrixAt(i, ZERO); continue; }
          const ph = p.phase + t * p.speed; let lean = 0, bodyY = 0, pitch = 0;
          let aL = [0.05 * Math.sin(ph * 1.3), 0.08], aR = [0.05 * Math.sin(ph * 1.3 + 1), -0.08], lL = 0, lR = 0, headX = 0, headY = 0;
          const m = p.mode || "idle";
          if (m === "walk") { const w = Math.sin(ph * 6); lL = w * 0.45; lR = -w * 0.45; aL = [-w * 0.4, 0.06]; aR = [w * 0.4, -0.06]; bodyY = Math.abs(Math.cos(ph * 6)) * 0.03; }
          else if (m === "run") { const w = Math.sin(ph * 11); lL = w * 0.95; lR = -w * 0.95; aL = [-w * 1.05, 0.15]; aR = [w * 1.05, -0.15]; lean = 0.22; bodyY = Math.abs(Math.cos(ph * 11)) * 0.09; }
          else if (m === "climb") { const w = Math.sin(ph * 7); lL = -0.5 + w * 0.5; lR = -0.5 - w * 0.5; aL = [-w * 0.6, 0.15]; aR = [w * 0.6, -0.15]; lean = 0.3; }
          else if (m === "point") { aR = [-1.55 + 0.05 * Math.sin(ph * 3), -0.1]; headX = -0.1; }
          else if (m === "film") { aR = [-1.35, 0.35]; aL = [-1.2, -0.35]; headX = -0.05; }
          else if (m === "panic") { const w = Math.sin(ph * 4) * 0.12; aL = [-0.4, 2.45 + w]; aR = [-0.4, -2.45 - w]; headY = Math.sin(ph * 2.3) * 0.35; }
          else if (m === "wave") { const w = Math.sin(ph * 9) * 0.35; aL = [0, 2.75 + w]; aR = [0, -2.75 - w]; }
          else if (m === "cry") { aL = [-2.35, -0.45]; aR = [-2.35, 0.45]; headX = 0.35; lean = 0.15; }
          else if (m === "talk") { aR = [-0.6 + 0.25 * Math.sin(ph * 5), -0.3]; aL = [-0.3 + 0.2 * Math.sin(ph * 4), 0.25]; headY = Math.sin(ph * 1.7) * 0.15; }
          else if (m === "hug") { aL = [-1.4, -0.7]; aR = [-1.4, 0.7]; }
          else if (m === "sit") { lL = -1.45; lR = -1.4; bodyY = -0.62; aL = [0.5, 0.15]; aR = [0.5, -0.15]; }
          else if (m === "lie") { pitch = -Math.PI / 2; bodyY = 0.16; aL = [0, 0.25]; aR = [0, -0.25]; }
          const s = p.s; q.setFromEuler(e.set(pitch, p.rot || 0, 0, "YXZ"));
          const py = (p.y || 0) + (pitch ? bodyY : 0);
          base.compose(v.set(p.x, py, p.z), q, sc.set(s, s, s));
          if (pitch) base.multiply(part.makeTranslation(0, 0, 0.0)).multiply(part.makeTranslation(0, 0, 0));
          const hip = 0.8 + (pitch ? 0 : bodyY);
          // upper body (lean forward when running)
          put(M.legL, i, -0.1, hip, 0, lL, 0, 0); put(M.legR, i, 0.1, hip, 0, lR, 0, 0);
          const cl = Math.cos(lean), sl = Math.sin(lean);
          put(M.torso, i, 0, hip, 0, lean, 0, 0);
          const shY = hip + 0.56 * cl, shZ = 0.56 * sl;
          put(M.armL, i, -0.3, shY, shZ, aL[0] + lean, 0, aL[1]); put(M.armR, i, 0.3, shY, shZ, aR[0] + lean, 0, aR[1]);
          const nkY = hip + 0.61 * cl, nkZ = 0.61 * sl;
          put(M.head, i, 0, nkY, nkZ, headX + lean * 0.4, headY, 0); put(M.hair, i, 0, nkY, nkZ, headX + lean * 0.4, headY, 0);
          if (!p.hair) M.hair.setMatrixAt(i, ZERO);
          fi[i] = p.face || 0; }
        for (const k in M) M[k].instanceMatrix.needsUpdate = true;
        headGeo.attributes.faceIdx.needsUpdate = true;
      } };
    return api;
  }
  return { crowd, faceTex, randomLook };
};
