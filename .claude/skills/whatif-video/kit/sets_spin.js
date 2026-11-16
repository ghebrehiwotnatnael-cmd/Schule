/* "spin": extension of the nyc set for "What if the Earth stopped spinning for 5 seconds?".
   A helipad on the tower deck (no railing: track railsOn 0), tourists who fly east in formation with you, a helicopter, pigeons,
   a street with a hot-dog cart and a bench that slide east, an inlet of the East River to land in (splashes), and a far-away
   North Pole (z = 7000: ice, igloo, sign, a polar bear who notices nothing).
   Deterministic (no state): everything is a function of the tracks.
     flyOff [dx, dy, dz]  - offset of the whole flying formation from its place on the helipad
     flyTum                - seconds since the stop (drift between the flyers, tumbling)
     flyMode               - "pad" | "fly" | "fall" | "swim"
     heliPos [x,y,z], heliRot (yaw), heliTilt
     streetEast            - metres the street props have slid east (same clock as crowdEast / carEast)
     splashT, splashV      - video time when the formation origin hits the water, its speed (m per video second)
     bearBlink 0..1, bearLook (head yaw) */
(function () {
  const E = window.WI_NYC_EXT = window.WI_NYC_EXT || [];
  E.push(function (A) {
    const { WI, scene, MK, BL, C, add, canvasTex, blds, facades, deckY, glowTex } = A;
    const { THREE, R, rr, num, val, clamp01 } = WI;
    const M4 = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
    const PAD = [21, deckY, -7], VX = 352.6, G = 4.905;
    // ---- clear the flight corridor east of the tower: nothing may be taller than the flyers minus a margin
    blds.forEach((b, i) => { if (b.x < 29.5 || Math.abs(b.z) > 31) return; const T = Math.max(0, b.x - b.w / 2 - PAD[0]) / VX, lim = deckY - G * Math.min(T, 5) * Math.min(T, 5) - 24;
      if (b.base > 0) { if (b.base + b.h > lim) facades.setMatrixAt(i, ZERO); return; }
      if (b.h > lim) { M4.compose(V.set(b.x, 0, b.z), Q.identity(), S.set(b.w, lim, b.d)); facades.setMatrixAt(i, M4); } });
    facades.instanceMatrix.needsUpdate = true; S.set(1, 1, 1);
    // ---- helipad marking
    { const tex = canvasTex(512, 512, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#3d4046"; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill(); g.strokeStyle = "#f2c200"; g.lineWidth = 22; g.beginPath(); g.arc(256, 256, 222, 0, 7); g.stroke();
        g.fillStyle = "#f4f4f0"; g.fillRect(150, 130, 46, 252); g.fillRect(316, 130, 46, 252); g.fillRect(150, 233, 212, 46); }); tex.encoding = THREE.sRGBEncoding;
      const pad = add(new THREE.Mesh(new THREE.CircleGeometry(6.6, 48), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4 }))); pad.rotation.x = -Math.PI / 2; pad.rotation.z = Math.PI / 2; pad.position.set(PAD[0], deckY + 0.02, PAD[2]); pad.receiveShadow = true; }
    // ---- the East River inlet where everybody lands
    { const w = add(new THREE.Mesh(new THREE.PlaneGeometry(96, 1400), MK.std(C("#486e86"), { roughness: 0.12, metalness: 0.1 }))); w.rotation.x = -Math.PI / 2; w.position.set(1757, 0.1, 0); }
    // ---- flyers: tourists on the helipad
    const FL = []; const kinds = ["flail", "faceplant", "film", "cheer", "panic", "flail", "selfie", "faceplant", "wave", "flail"];
    for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 2.2 + (i % 5) * 0.95; let ox = Math.cos(a) * r, oz = Math.sin(a) * r; if (Math.abs(ox) < 4.2 && oz > -2.4) oz = -2.6 - Math.abs(oz) * 0.7;   // nobody between the heroes and the cameras (south side)
      FL.push({ off: [ox, 0, oz], drift: [rr(-1.6, 1.6), rr(-1.0, 1.4), rr(-1.8, 0.2)], kind: kinds[i % kinds.length], tr: rr(-0.5, 0.5), rl: rr(-0.45, 0.45), yr: rr(-0.3, 0.3), pad: i % 3 === 0 ? "film" : i % 3 === 1 ? "point" : "talk", rot0: Math.PI / 2 + rr(-0.7, 0.7) }); }
    const flyers = BL.crowd(scene, FL.map((f) => ({ x: PAD[0] + f.off[0], y: deckY, z: PAD[2] + f.off[2], rot: f.rot0, mode: f.pad, face: 7 })));
    // ---- pigeons that fly along (the air keeps moving too: they do not even notice)
    const pgGeo = new THREE.SphereGeometry(0.15, 10, 8); pgGeo.scale(0.95, 0.9, 1.45); const pgBody = add(new THREE.InstancedMesh(pgGeo, MK.std(C("#9aa1aa"), { roughness: 0.8 }), 9)); const pgHead = add(new THREE.InstancedMesh(new THREE.SphereGeometry(0.085, 10, 8), MK.std(C("#4f8a73"), { roughness: 0.4, metalness: 0.3 }), 9));
    const wgGeo = new THREE.BoxGeometry(0.42, 0.02, 0.2); wgGeo.translate(0.21, 0, 0); const pgWing = add(new THREE.InstancedMesh(wgGeo, MK.std(C("#6c7684"), { roughness: 0.8 }), 18));
    [pgBody, pgHead, pgWing].forEach((m) => { m.frustumCulled = false; m.castShadow = true; });
    const PG = Array.from({ length: 9 }, (_, i) => ({ off: [rr(-6, 9), rr(1.5, 5.5), rr(-9, 7)], ph: R() * 6, sp: rr(9, 13) })); PG[0].off = [3.2, 2.3, 2.6]; PG[1].off = [5.4, 2.9, 1.2]; PG[2].off = [1.2, 3.1, 4.0]; PG.slice(3).forEach((g) => { if (g.off[2] > -2) g.off[2] = -3 - Math.abs(g.off[2]); });
    // ---- helicopter
    const heli = add(new THREE.Group()); const rotor = new THREE.Group(), tailRotor = new THREE.Group();
    { const red = MK.std(C("#d62828"), { roughness: 0.35, metalness: 0.3 }), wht = MK.std(C("#f1f1ee"), { roughness: 0.4 }), dark = MK.std(C("#1b1d22"), { roughness: 0.3, metalness: 0.5 }), glass = new THREE.MeshStandardMaterial({ color: 0x16222e, roughness: 0.05, metalness: 0.8 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.0, 4.2), red); body.position.y = 0.2; heli.add(body); const nose = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.3, 1.2), glass); nose.position.set(0, 0.25, 2.5); heli.add(nose);
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.8, 2.0), glass); win.position.set(0, 0.55, 0.7); heli.add(win); const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.28, 4.22), wht); stripe.position.set(0, -0.35, 0); heli.add(stripe);
      const boom = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 4.6), red); boom.position.set(0, 0.55, -4.2); heli.add(boom); const fin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.5, 0.9), wht); fin.position.set(0, 1.2, -6.2); heli.add(fin);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8), dark); mast.position.y = 1.5; heli.add(mast);
      [0, Math.PI / 2].forEach((a) => { const bl = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.05, 0.36), dark); bl.rotation.y = a; rotor.add(bl); }); rotor.position.y = 1.85; heli.add(rotor);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(5.25, 40), new THREE.MeshBasicMaterial({ color: 0x20242a, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.y = 1.86; heli.add(disc);
      [0, Math.PI / 2].forEach((a) => { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.16), dark); bl.rotation.x = a; tailRotor.add(bl); }); tailRotor.position.set(0.32, 1.1, -6.3); heli.add(tailRotor);
      [-0.95, 0.95].forEach((x) => { const sk = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.6), dark); sk.position.set(x, -1.35, 0.2); heli.add(sk); [-0.9, 1.2].forEach((z) => { const st = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.08), dark); st.position.set(x, -1.05, z); heli.add(st); }); });
      heli.traverse((o) => { if (o.isMesh && o !== disc) o.castShadow = true; }); }
    // ---- street props that slide east: hot-dog cart with the vendor surfing behind it, a bench with a man who keeps texting
    const SZ = -39, cart = add(new THREE.Group()), bench = add(new THREE.Group());
    { const steel = MK.std(C("#c9ced4"), { metalness: 0.75, roughness: 0.25 }), red = MK.std(C("#d62828")), blk = MK.std(C("#1b1b1b"));
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.95, 0.95), steel); b.position.y = 0.72; cart.add(b); const band = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.28, 0.97), red); band.position.y = 0.9; cart.add(band);
      const tex = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#d62828"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff6d0"; g.font = "bold 78px Arial"; g.textAlign = "center"; g.fillText("HOT DOGS", w / 2, 92); }); tex.encoding = THREE.sRGBEncoding;
      for (const sd of [-1, 1]) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.26), new THREE.MeshStandardMaterial({ map: tex })); sg.position.set(0, 0.9, sd * 0.49); if (sd < 0) sg.rotation.y = Math.PI; cart.add(sg); }
      for (const [x, z] of [[-0.85, 0.42], [0.85, 0.42], [-0.85, -0.42], [0.85, -0.42]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 14), blk); w.rotation.x = Math.PI / 2; w.position.set(x, 0.2, z); cart.add(w); }
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8), steel); pole.position.y = 2.35; cart.add(pole);
      const ut = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffd23f" : "#e63946"; g.fillRect(i * w / 8, 0, w / 8, h); } }); ut.encoding = THREE.sRGBEncoding;
      const umb = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.55, 16, 1, true), new THREE.MeshStandardMaterial({ map: ut, side: THREE.DoubleSide })); umb.position.y = 3.35; cart.add(umb);
      const wood = MK.std(C("#7a5236")); const seat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.55), wood); seat.position.y = 0.5; bench.add(seat); const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 0.08), wood); back.position.set(0, 0.85, -0.27); bench.add(back);
      [-0.8, 0.8].forEach((x) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.5), blk); l.position.set(x, 0.25, 0); bench.add(l); });
      [cart, bench].forEach((g2) => g2.traverse((o) => { if (o.isMesh) o.castShadow = true; })); }
    const XT = Array.from({ length: 12 }, (_, i) => ({ x: -610 - i * 21 - rr(0, 9), z: SZ + (i % 2 ? 1 : -1) * rr(1.5, 6.5), sp: rr(-1.4, 1.4), r0: R() * 6 }));
    const xtBody = add(new THREE.InstancedMesh(new THREE.BoxGeometry(1.85, 0.75, 4.5), MK.std(C("#f2c200"), { roughness: 0.35, metalness: 0.3 }), XT.length)), xtCab = add(new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), MK.std(C("#1b2633"), { roughness: 0.1, metalness: 0.6 }), XT.length));
    xtBody.castShadow = true; xtBody.frustumCulled = false; xtCab.frustumCulled = false;
    const streetPpl = BL.crowd(scene, [{ x: 0, y: 0.15, z: SZ, rot: Math.PI / 2, mode: "glide", male: true, beard: true, shirt: C("#f1f1f1"), hat: true, hatCol: C("#d62828"), face: 4 },
      { x: 0, y: 0.15, z: SZ, rot: Math.PI, mode: "sit", phone: true, male: true, shirt: C("#3b6ea8"), legs: C("#2b2d42"), face: 1 }]);
    // ---- splashes (one per flyer + the two heroes)
    const SPL = FL.map((f) => f).concat([{ off: [0, 0, 0], drift: [0, 0, 0] }, { off: [-1.3, 0, 0.5], drift: [0, 0, 0] }]);
    const drops = SPL.map(() => Array.from({ length: 7 }, () => { const s = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xe6f6ff, transparent: true, depthWrite: false, opacity: 0 }))); s.userData = { a: R() * 6.283, v: rr(1.5, 5), u: rr(6, 13) }; s.visible = false; return s; }));
    const rings = SPL.map(() => { const m = add(new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 28), new THREE.MeshBasicMaterial({ color: 0xdff2fb, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }))); m.rotation.x = -Math.PI / 2; m.visible = false; return m; });
    // ---- the North Pole, far away from the city (camera looks away from Manhattan)
    const NP = [0, 0, 7000]; const bear = add(new THREE.Group()); let bearHead, bearLids = [];
    { const ice = add(new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), MK.std(C("#cfe0ec"), { roughness: 0.95 }))); ice.rotation.x = -Math.PI / 2; ice.position.set(NP[0], 0.4, NP[2] + 600); ice.receiveShadow = true;
      const iceM = MK.std(C("#b4d3e8"), { roughness: 0.5 }); for (let i = 0; i < 40; i++) { const s = rr(1.5, 9); const b = add(new THREE.Mesh(new THREE.BoxGeometry(s * rr(1, 2), s * rr(0.4, 1.2), s), iceM)); b.position.set(NP[0] + rr(-90, 90), 0.4, NP[2] + rr(25, 260)); b.rotation.set(rr(-0.15, 0.15), R() * 3, rr(-0.15, 0.15)); b.castShadow = true; }
      const igloo = add(new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 12, 0, 6.283, 0, Math.PI / 2), MK.std(C("#f6fafc"), { roughness: 0.8 }))); igloo.position.set(NP[0] + 5.2, 0.4, NP[2] + 19); igloo.castShadow = true;
      const door = add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.9), MK.std(C("#27323b")))); door.position.set(NP[0] + 5.2, 1.0, NP[2] + 16.6);
      const poleT = canvasTex(64, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#d62828"; g.fillRect(0, i * h / 8, w, h / 8); } }); poleT.encoding = THREE.sRGBEncoding;
      const pl = add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.4, 10), new THREE.MeshStandardMaterial({ map: poleT }))); pl.position.set(NP[0] - 2.7, 2.1, NP[2] + 10.5); pl.castShadow = true;
      const sgT = canvasTex(512, 160, (g, w, h) => { g.fillStyle = "#f4f4f0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#d62828"; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = "#1d3557"; g.font = "bold 74px Arial"; g.textAlign = "center"; g.fillText("NORTH POLE", w / 2, 106); }); sgT.encoding = THREE.sRGBEncoding;
      const sg = add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.72, 0.06), [iceM, iceM, iceM, iceM, iceM, new THREE.MeshStandardMaterial({ map: sgT })])); sg.position.set(NP[0] - 2.7, 3.5, NP[2] + 10.36); sg.castShadow = true;
      const fur = MK.std(C("#eadfc4"), { roughness: 0.95 }), blk = MK.std(C("#141414"), { roughness: 0.4 });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.3), fur); torso.position.set(0, 1.0, 0); torso.rotation.x = -0.25; bear.add(torso);
      const belly = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.5), MK.std(C("#fbf9f2"))); belly.position.set(0, 0.95, -0.62); bear.add(belly);
      [-0.55, 0.55].forEach((x) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 1.1), fur); leg.position.set(x, 0.25, -0.75); bear.add(leg); const paw = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.08), blk); paw.position.set(x, 0.27, -1.31); bear.add(paw);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.45), fur); arm.position.set(x * 1.45, 1.05, -0.35); arm.rotation.x = 0.35; bear.add(arm); });
      bearHead = new THREE.Group(); bearHead.position.set(0, 2.05, -0.35); bear.add(bearHead);
      const hd = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 0.9), fur); bearHead.add(hd); const sn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.38, 0.4), MK.std(C("#fbf9f2"))); sn.position.set(0, -0.14, -0.6); bearHead.add(sn);
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.08), blk); nose.position.set(0, -0.02, -0.82); bearHead.add(nose);
      [-0.27, 0.27].forEach((x) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.13, 0.04), blk); e.position.set(x, 0.14, -0.46); bearHead.add(e); const lid = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.05), fur); lid.position.set(x, 0.3, -0.47); bearHead.add(lid); bearLids.push(lid);
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.14), fur); ear.position.set(x * 1.55, 0.5, 0.1); bearHead.add(ear); });
      bear.traverse((o) => { if (o.isMesh) o.castShadow = true; }); bear.position.set(NP[0], 0.4, NP[2] + 12); bear.scale.setScalar(1.25); }

    const EU = new THREE.Euler();
    return { update(t, look, pos) {
      const fo = val("flyOff", t) || [0, 0, 0], tum = num("flyTum", t, 0), mode = val("flyMode", t) || "pad";
      flyers.update(t, (p, tt, i) => { const f = FL[i]; const k = mode === "pad" ? 0 : tum;
        p.x = PAD[0] + f.off[0] + fo[0] + f.drift[0] * k; p.y = PAD[1] + fo[1] + f.drift[1] * k; p.z = PAD[2] + f.off[2] + fo[2] + f.drift[2] * k;
        if (mode === "pad") { p.mode = f.pad; p.rot = f.rot0; p.tilt = 0; p.roll = 0; p.face = 7; }
        else if (p.y < -1.1) { p.y = -1.18 + 0.06 * Math.sin(t * 2.2 + i); p.mode = i % 3 ? "wave" : "cheer"; p.tilt = 0; p.roll = 0; p.rot = -Math.PI / 2 + f.yr; p.face = i % 2 ? 7 : 2; }
        else { p.mode = f.kind; p.rot = Math.PI / 2 + f.yr * k; p.tilt = f.tr * k + (f.kind === "film" || f.kind === "selfie" || f.kind === "cheer" || f.kind === "wave" || f.kind === "panic" ? 0.5 : 0); p.roll = f.rl * k; p.face = f.kind === "film" || f.kind === "selfie" || f.kind === "cheer" || f.kind === "wave" ? 7 : 4; }
        p.hidden = Math.hypot(p.x - pos[0], p.y + 1 - pos[1], p.z - pos[2]) < 1.6; });
      // pigeons
      PG.forEach((g, i) => { const fl = Math.sin(t * g.sp + g.ph) * 0.8; const po = val("pgOff", t) || fo; const bx = PAD[0] + g.off[0] + po[0] + Math.sin(t * 0.7 + g.ph) * 0.35, by = PAD[1] + g.off[1] + po[1] + Math.sin(t * 1.3 + g.ph) * 0.2, bz = PAD[2] + g.off[2] + po[2];
        Q.setFromEuler(EU.set(0, Math.PI / 2, 0)); M4.compose(V.set(bx, by, bz), Q, S); pgBody.setMatrixAt(i, M4); M4.compose(V.set(bx + 0.22, by + 0.14, bz), Q, S); pgHead.setMatrixAt(i, M4);
        for (const sd of [0, 1]) { Q.setFromEuler(EU.set(sd ? -fl : fl, sd ? Math.PI / 2 : -Math.PI / 2, 0, "YXZ")); M4.compose(V.set(bx, by + 0.06, bz + (sd ? -0.07 : 0.07)), Q, S); pgWing.setMatrixAt(i * 2 + sd, M4); } });
      [pgBody, pgHead, pgWing].forEach((m) => { m.instanceMatrix.needsUpdate = true; });
      // helicopter
      const hp = val("heliPos", t); heli.visible = !!hp; if (hp) { heli.position.set(hp[0], hp[1], hp[2]); heli.rotation.set(num("heliTilt", t, 0), num("heliRot", t, 0), 0, "YXZ"); rotor.rotation.y = t * 21; tailRotor.rotation.x = t * 30; }
      // street props
      const se = num("streetEast", t, 0); cart.position.set(-625 + se, 0.02, SZ + 2.5); cart.rotation.y = se * 0.004; bench.position.set(-672 + se, 0.02, SZ - 3.2); bench.rotation.y = Math.PI + 0.25 + se * 0.003;
      streetPpl.update(t, (p, tt, i) => { if (i === 0) { p.x = cart.position.x - 1.9; p.z = cart.position.z + 0.1; p.mode = se > 0 ? "glide" : "talk"; p.rot = Math.PI / 2; } else { p.x = bench.position.x; p.z = bench.position.z - 0.05; p.y = 0.02 + 0.62 + 0.17; p.rot = bench.rotation.y; } });
      XT.forEach((c, i) => { Q.setFromEuler(EU.set(0, c.r0 + se * 0.004 * c.sp, 0)); M4.compose(V.set(c.x + se, 0.55, c.z), Q, S); xtBody.setMatrixAt(i, M4); M4.compose(V.set(c.x + se, 1.22, c.z), Q, S); xtCab.setMatrixAt(i, M4); });
      xtBody.instanceMatrix.needsUpdate = true; xtCab.instanceMatrix.needsUpdate = true;
      // splashes
      const st = t - num("splashT", t, 9999), sv = num("splashV", t, 40);
      SPL.forEach((f, i) => { const k = tum; const x = PAD[0] + f.off[0] + fo[0] + f.drift[0] * k, z = PAD[2] + f.off[2] + fo[2] + f.drift[2] * k; const ts = st - (f.drift[1] * k) / sv; const on = ts >= 0 && ts < 1.6;
        rings[i].visible = on; if (on) { rings[i].position.set(x, 0.14, z); rings[i].scale.setScalar(0.6 + ts * 3.2); rings[i].material.opacity = 0.75 * (1 - ts / 1.6); }
        drops[i].forEach((d) => { d.visible = on; if (!on) return; const u = d.userData; d.position.set(x + Math.cos(u.a) * u.v * ts, 0.3 + u.u * ts - 9 * ts * ts, z + Math.sin(u.a) * u.v * ts); d.scale.setScalar(0.5 + ts * 0.9); d.material.opacity = d.position.y > 0.1 ? 0.85 * (1 - ts / 1.6) : 0; }); });
      // polar bear
      const bl = num("bearBlink", t, 0); bearLids.forEach((l) => { l.position.y = 0.3 - 0.16 * bl; }); bearHead.rotation.y = num("bearLook", t, 0); bearHead.rotation.z = Math.sin(t * 0.8) * 0.03;
    } };
  });
})();
