/* "slip": extension of the nyc set for "What if friction disappeared for 5 seconds?".  A busy street corner north-west of the
   tower block (corner of the avenue x ~ -100 and the street z ~ -30): a hot-dog cart with an umbrella, a violinist, a traffic
   light (with a landing spot for the pigeon), a PIZZA sign on the facade, a street crowd that walks, then slips and glides.
   Deterministic: every motion is a function of the tracks (no state), so chunks can be rendered in any order.
   Tracks:
     walkT  - seconds of walking (people move along their walk velocity; hold it when friction goes)
     slipT  - seconds of gliding since friction vanished (key it slower for slow motion; hold it when friction returns)
     slipOn 0/1 friction gone, stopOn 0/1 friction is back (everybody tumbles and stays down)
     dogPos [x,y,z] / dogSpin: the sausage that shot out of the bun (in the star's right hand until dogOut > 0.5)
     glassPos [x,y,z] / glassRot [x,y,z]: the star's sunglasses when they fall off (starGlassHide 1)
     umbrellaDrop 0..1, signDrop 0..1, cartGlide (metres the cart slid), copSpin (radians), violinGlide (metres) */
(function () {
  const E = window.WI_NYC_EXT = window.WI_NYC_EXT || [];
  E.push(function (A) {
    const { WI, scene, MK, BL, C, add, trunk, crown, pole, lampHead, treeList, lampList, star, canvasTex } = A;
    const { THREE, R, rr, num, val } = WI;
    const ZERO = new THREE.Matrix4().makeScale(0, 0, 0), M4 = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), EU = new THREE.Euler();
    // ---- clear trees and lamps around the hero corner (they would block every shot)
    const clear = (x, z) => x > -114 && x < -78 && z > -50 && z < -25;
    treeList.forEach((tr, i) => { if (clear(tr[0], tr[1])) { trunk.setMatrixAt(i, ZERO); crown.setMatrixAt(i, ZERO); } });
    lampList.forEach((l, i) => { if (clear(l[0], l[1])) { pole.setMatrixAt(i, ZERO); lampHead.setMatrixAt(i, ZERO); } });
    [trunk, crown, pole, lampHead].forEach((m) => { m.instanceMatrix.needsUpdate = true; });

    // ---- hot-dog cart (slides when friction vanishes) with a striped umbrella (slides down its pole)
    const cart = add(new THREE.Group()); const CART = [-96.6, 0, -34.7];
    { const steel = MK.std(C("#c9ced4"), { metalness: 0.75, roughness: 0.25 }), red = MK.std(C("#d62828"), { roughness: 0.5 }), blk = MK.std(C("#1b1b1b"));
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.95, 0.95), steel); body.position.y = 0.72; cart.add(body);
      const band = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.28, 0.97), red); band.position.y = 0.9; cart.add(band);
      const signTex = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#d62828"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff6d0"; g.font = "bold 78px Arial"; g.textAlign = "center"; g.fillText("HOT DOGS", w / 2, 92); });
      signTex.encoding = THREE.sRGBEncoding;
      for (const sd of [-1, 1]) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.26), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6 })); sg.position.set(0, 0.9, sd * 0.49); if (sd < 0) sg.rotation.y = Math.PI; cart.add(sg); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.05), steel); top.position.y = 1.22; cart.add(top);
      for (let k = 0; k < 6; k++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), MK.std(C("#9b3b1f"), { roughness: 0.45 })); d.rotation.z = Math.PI / 2; d.position.set(-0.6 + k * 0.24, 1.29, 0.1); cart.add(d); }
      for (const [x, z] of [[-0.85, 0.42], [0.85, 0.42], [-0.85, -0.42], [0.85, -0.42]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 14), blk); w.rotation.x = Math.PI / 2; w.position.set(x, 0.2, z); cart.add(w); }
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.9), steel); handle.position.set(1.25, 1.0, 0); cart.add(handle);
      cart.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
    const umbPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8), MK.std(C("#d9d9d9"), { metalness: 0.6, roughness: 0.3 })); umbPole.position.set(0, 2.35, 0); cart.add(umbPole);
    const umbTex = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffd23f" : "#e63946"; g.fillRect(i * w / 8, 0, w / 8, h); } }); umbTex.encoding = THREE.sRGBEncoding;
    const umb = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.55, 16, 1, true), new THREE.MeshStandardMaterial({ map: umbTex, side: THREE.DoubleSide, roughness: 0.7 })); umb.position.set(0, 3.35, 0); umb.castShadow = true; cart.add(umb);
    cart.position.set(CART[0], CART[1], CART[2]);

    // ---- traffic light at the corner (the pigeon tries to land on its arm)
    { const ironM = MK.std(C("#2b2f33"), { metalness: 0.5, roughness: 0.5 }); const tlp = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 4.8, 10), ironM); tlp.position.set(-104.0, 2.4, -30.5); add(tlp);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.1), ironM); arm.position.set(-105.5, 4.75, -30.5); add(arm);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.95, 0.3), MK.std(C("#2f3a24"))); head.position.set(-106.9, 4.2, -30.5); add(head);
      [["#3a0d0d", 0.3], ["#3a330d", 0], ["#29ff6a", -0.3]].forEach(([c, y], k) => { const l = new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), k === 2 ? new THREE.MeshBasicMaterial({ color: C(c) }) : MK.std(C(c))); l.position.set(-106.9, 4.2 + y, -30.66); l.rotation.y = Math.PI; add(l); });
      const walkSign = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.2), MK.std(C("#222"))); walkSign.position.set(-104.0, 2.6, -30.3); add(walkSign);
      [tlp, arm, head].forEach((m) => { m.castShadow = true; }); }

    // ---- PIZZA sign on the facade behind the corner (its screws spin out, it slides down the wall)
    const sign = add(new THREE.Group()); const SIGN = [-91.5, 3.9, -30.12];
    { const tex = canvasTex(512, 160, (g, w, h) => { g.fillStyle = "#1d3557"; g.fillRect(0, 0, w, h); g.strokeStyle = "#ffd166"; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
        g.fillStyle = "#ffd166"; g.font = "bold 104px Arial"; g.textAlign = "center"; g.fillText("PIZZA", w / 2, 118); }); tex.encoding = THREE.sRGBEncoding;
      const board = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.88, 0.1), [MK.std(C("#14243c")), MK.std(C("#14243c")), MK.std(C("#14243c")), MK.std(C("#14243c")), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: C("#ffd166"), emissiveIntensity: 0.0 }), MK.std(C("#14243c"))]);
      board.rotation.y = Math.PI; sign.add(board); board.castShadow = true; }
    const screws = [[-1.25, 0.32], [1.25, 0.32], [-1.25, -0.32], [1.25, -0.32]].map(([x, y]) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 8), MK.std(C("#c0c4c8"), { metalness: 0.9, roughness: 0.2 })); s.rotation.x = Math.PI / 2; s.userData.xy = [x, y]; add(s); return s; });

    // ---- the star's hot dog (bun + sausage in his right hand) and his free-falling sunglasses
    const bunMat = MK.std(C("#d9a35a"), { roughness: 0.8 }), sausMat = MK.std(C("#a8401f"), { roughness: 0.4 });
    const bun = add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.08), bunMat)); const saus = add(new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.28, 10), sausMat));
    const mustard = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.012, 0.012), MK.std(C("#ffcc00"))));
    const freeGlasses = add(new THREE.Group()); { const gm = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.08, metalness: 0.7 });
      [-0.1, 0.1].forEach((x) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.02), gm); l.position.x = x; freeGlasses.add(l); });
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.02), gm); br.position.y = 0.04; freeGlasses.add(br);
      [-1, 1].forEach((sd) => { const a = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.22), gm); a.position.set(sd * 0.2, 0.03, -0.11); freeGlasses.add(a); }); }
    const tm = new THREE.Matrix4();

    // ---- the street crowd around the corner: walk, slip, glide, tumble
    const ppl = [];
    const P = (x, z, wv, gv, kind, stopKind, extra = {}) => ppl.push(Object.assign({ x0: x, z0: z, wv, gv, kind, stopKind, tSlip: rr(0.5, 1.6), spin: 0, rot0: wv[0] || wv[1] ? Math.atan2(wv[0], wv[1]) : rr(-3, 3), mode0: "walk", face: R() < 0.5 ? 0 : 7 }, extra));
    const KINDS = ["glide", "glide", "flail", "split", "slip", "flail", "glide"], STOPK = ["faceplant", "faceplant", "lie", "split", "kneel", "faceplant", "lie"];
    // south sidewalk of the street (z -34 .. -30.6), walking along x; they glide along the street or out into it, never into the wall
    for (let k = 0; k < 16; k++) { const dir = R() < 0.5 ? 1 : -1, x = rr(-99, -70), z = rr(-33.6, -31.0); const kk = Math.floor(R() * KINDS.length);
      if (x > -99 && x < -94 && z < -33.4) continue;
      P(x, z, [dir * rr(1.1, 1.5), 0], [dir * rr(0.4, 1.4), -rr(0.05, 0.6)], KINDS[kk], STOPK[kk]); }
    // the avenue sidewalk (x -104.5 .. -100.6), walking along z
    for (let k = 0; k < 10; k++) { const dir = R() < 0.5 ? 1 : -1, x = rr(-104.2, -101.2), z = rr(-28, -2); const kk = Math.floor(R() * KINDS.length);
      P(x, z, [0, dir * rr(1.1, 1.5)], [-rr(0.1, 0.8), dir * rr(0.4, 1.4)], KINDS[kk], STOPK[kk]); }
    // the far corner + people crossing the avenue on the crosswalk
    for (let k = 0; k < 12; k++) { const x = rr(-127, -106), z = rr(-36.5, -33.5); const dir = R() < 0.5 ? 1 : -1; const kk = Math.floor(R() * KINDS.length);
      P(x, z, [dir * rr(1.0, 1.4), 0], [dir * rr(0.6, 1.8), rr(-0.5, 0.5)], KINDS[kk], STOPK[kk]); }
    for (let k = 0; k < 8; k++) { const x = rr(-129, -126), z = rr(-28, -8); const dir = R() < 0.5 ? 1 : -1; const kk = Math.floor(R() * KINDS.length);
      P(x, z, [0, dir * rr(1.1, 1.4)], [rr(0.1, 0.9), dir * rr(0.4, 1.2)], KINDS[kk], STOPK[kk]); }
    // the traffic cop in the middle of the intersection (pirouettes), the hot-dog vendor, the violinist
    const COP = ppl.length; P(-115.5, -39.5, [0, 0], [0.18, -0.12], "glide", "split", { mode0: "point", rot0: Math.PI / 2, hat: true, hatCol: C("#13213d"), shirt: C("#1f3a68"), legs: C("#13213d"), male: true, face: 2 });
    const VEND = ppl.length; P(-96.6, -33.55, [0, 0], [0.55, 0.0], "slip", "kneel", { mode0: "talk", rot0: Math.PI, male: true, beard: true, shirt: C("#f1f1f1"), hat: true, hatCol: C("#d62828"), face: 7 });
    const VIOL = ppl.length; P(-99.2, -30.9, [0, 0], [-0.3, -0.25], "violin", "sit", { mode0: "violin", rot0: Math.PI, male: false, shirt: C("#e0457b"), legs: C("#1c1c22"), face: 7 });
    // a few standing people near the hero spot (phones, eating, talking)
    [[-93.5, -32.2, "phone"], [-94.6, -31.4, "talk"], [-90.8, -33.2, "text"], [-88.2, -31.8, "phone"]].forEach(([x, z, m]) => { const kk = Math.floor(R() * KINDS.length); P(x, z, [0, 0], [rr(-0.6, 0.6), -rr(0.1, 0.5)], KINDS[kk], STOPK[kk], { mode0: m, rot0: rr(2.4, 3.9) }); });
    ppl.forEach((p) => { if (p.spin === 0 && R() < 0.3) p.spin = rr(-2.5, 2.5); });
    const crowd = BL.crowd(scene, ppl.map((p) => Object.assign({ x: p.x0, y: 0.15, z: p.z0, rot: p.rot0, mode: p.mode0 }, p)));

    // violin + bow (on the violinist's arms)
    const violin = add(new THREE.Group()); { const wood = MK.std(C("#8a3b12"), { roughness: 0.35 }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.38), wood); violin.add(b);
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.26), MK.std(C("#1b1b1b"))); neck.position.z = 0.3; violin.add(neck); }
    const bow = add(new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.7), MK.std(C("#3a2a1a"))));

    return { update(t, look, pos) {
      const walkT = num("walkT", t, t), sT = num("slipT", t, 0), on = num("slipOn", t, 0) > 0.5, stop = num("stopOn", t, 0) > 0.5;
      // cart + umbrella
      const cg = num("cartGlide", t, 0); cart.position.set(CART[0] + cg, 0, CART[2] - cg * 0.08); cart.rotation.y = cg * 0.05;
      const ud = num("umbrellaDrop", t, 0); umb.position.y = 3.35 - ud * 2.05; umb.rotation.z = ud * 0.25; umbPole.visible = true;
      // sign + screws
      const sd = num("signDrop", t, 0), sOut = Math.min(1, sd * 4);
      sign.position.set(SIGN[0], Math.max(0.46, SIGN[1] - Math.max(0, sd - 0.25) / 0.75 * 3.6), SIGN[2] - (sd > 0.85 ? (sd - 0.85) / 0.15 * 0.4 : 0)); sign.rotation.x = sd > 0.85 ? -(sd - 0.85) / 0.15 * 1.35 : 0;
      screws.forEach((s, k) => { const [x, y] = s.userData.xy; s.position.set(SIGN[0] - x, SIGN[1] + y - Math.max(0, sOut - 0.6) * 2.5 * (1 + k * 0.3), SIGN[2] - 0.08 - sOut * 0.25); s.rotation.y = sOut * 40; s.visible = sOut < 0.999; });
      // hot dog in the star's hand
      const sp = val("starPos", t);
      if (sp && star.meshes) { star.meshes.armR.getMatrixAt(0, tm); const hand = (dx, dy, dz) => V.set(dx, dy, dz).applyMatrix4(tm);
        const hasDog = num("starDog", t, 0) > 0.5; bun.visible = hasDog; mustard.visible = hasDog;
        if (hasDog) { tm.decompose(V, Q, S); const base = new THREE.Matrix4().compose(V.clone(), Q.clone(), new THREE.Vector3(1, 1, 1)); const off = new THREE.Matrix4().makeTranslation(0, -0.66, 0.06);
          bun.matrixAutoUpdate = false; bun.matrix.multiplyMatrices(base, off); bun.matrix.multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)); bun.matrixWorldNeedsUpdate = true;
          mustard.matrixAutoUpdate = false; mustard.matrix.copy(bun.matrix).multiply(new THREE.Matrix4().makeTranslation(0, 0.065, 0)); mustard.matrixWorldNeedsUpdate = true;
          if (num("dogOut", t, 0) < 0.5) { saus.matrixAutoUpdate = false; saus.matrix.copy(bun.matrix).multiply(new THREE.Matrix4().makeTranslation(0, 0.04, 0)).multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2)); saus.matrixWorldNeedsUpdate = true; saus.visible = true; } }
        if (!hasDog) saus.visible = false; }
      const dp = val("dogPos", t); if (num("dogOut", t, 0) >= 0.5 && dp) { saus.visible = true; saus.matrixAutoUpdate = true; saus.position.set(dp[0], dp[1], dp[2]); saus.rotation.set(0, num("dogSpin", t, 0), Math.PI / 2); saus.updateMatrix(); }
      // free sunglasses
      const gh = num("starGlassHide", t, 0) > 0.5, gp = val("glassPos", t); freeGlasses.visible = gh && !!gp;
      if (freeGlasses.visible) { const gr = val("glassRot", t) || [0, 0, 0]; freeGlasses.position.set(gp[0], gp[1], gp[2]); freeGlasses.rotation.set(gr[0], gr[1], gr[2]); }
      // crowd
      const copSpin = num("copSpin", t, 0), vg = num("violinGlide", t, 0);
      crowd.update(t, (p, tt, i) => {
        let x = p.x0 + p.wv[0] * walkT, z = p.z0 + p.wv[1] * walkT; let rot = p.rot0, mode = p.mode0;
        if (on || stop) { x += p.gv[0] * sT; z += p.gv[1] * sT; rot += p.spin * sT; mode = stop ? p.stopKind : (sT < p.tSlip ? "slip" : p.kind); p.face = stop ? 3 : (i % 3 ? 4 : 7); }
        else p.face = p.face0 !== undefined ? p.face0 : (p.face0 = p.face);
        if (i === COP && (on || stop)) { rot = Math.PI / 2 + copSpin; mode = stop ? "split" : "glide"; }
        if (i === VIOL) { mode = stop ? "sit" : "violin"; p.face = stop ? 3 : (on ? 2 : 7); x = p.x0 + vg; z = p.z0 - vg * 0.5; rot = Math.PI + vg * 0.4; }
        if (i === VEND && (on || stop)) { x = p.x0 + cg; mode = stop ? "kneel" : "slip"; }
        p.x = x; p.z = z; p.rot = rot; p.mode = mode; p.y = 0.15;
        p.hidden = i !== VIOL && i !== VEND && i !== COP && pos[1] < 3.5 && Math.hypot(x - pos[0], z - pos[2]) < 6.0; });
      A.walkers.u.uHide.value.set(pos[0], pos[2], pos[1] < 3.5 ? 6.0 : -1);
      // no traffic car may drive through a low camera: hide cars within 7 m of it
      if (pos[1] < 6) { const [body] = A.carParts; let dirty = false;
        for (let i = 0; i < body.count; i++) { body.getMatrixAt(i, M4); V.setFromMatrixPosition(M4);
          if (Math.abs(V.x - pos[0]) < 7 && Math.abs(V.z - pos[2]) < 7) { A.carParts.forEach((m) => m.setMatrixAt(i, ZERO)); for (let k = 0; k < 4; k++) A.cabEdge.setMatrixAt(i * 4 + k, ZERO); dirty = true; } }
        if (dirty) { A.carParts.forEach((m) => { m.instanceMatrix.needsUpdate = true; }); A.cabEdge.instanceMatrix.needsUpdate = true; } }
      // violin + bow follow the violinist's hands
      if (crowd.meshes) { crowd.meshes.head.getMatrixAt(VIOL, tm); violin.matrixAutoUpdate = false; violin.matrix.copy(tm).multiply(new THREE.Matrix4().makeTranslation(0.2, -0.04, 0.24)).multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.15, 0.75, -0.35))); violin.matrixWorldNeedsUpdate = true;
        crowd.meshes.armR.getMatrixAt(VIOL, tm); bow.matrixAutoUpdate = false; bow.matrix.copy(tm).multiply(new THREE.Matrix4().makeTranslation(0, -0.62, 0.1)).multiply(new THREE.Matrix4().makeRotationY(1.2)); bow.matrixWorldNeedsUpdate = true; }
    } };
  });
})();
