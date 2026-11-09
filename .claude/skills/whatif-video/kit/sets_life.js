/* Everyday-life add-ons (load after sets_rooms.js / sets_models.js / sets_resort.js / sets_people.js):
   blocky people with faces for the "rooms" and "street" sets, extra rooms (lab x 360, classroom x 420,
   nursery x 480, aquarium x 540), an ultrasound monitor in the hospital, crashed cars on the street, and a hero cast.
   Tracks:
     vanishMen / vanishWomen (s: everybody of that sex disappears with a burst of light, staggered over ~1.2 s)
     menBelly (0..1: pregnant men's bellies), dadBabies (0/1: dads hold crying babies), mkPeople (0 hides the old models)
     crashAt (s: driverless cars crash on the street), streetMood ("normal"|"shock"|"organize"|"calm"),
     mice, biobag, ultra, seahorseBirth (0..1), nurseryBabies (0/1), teacher (0/1)
     hero cast: her, him, wife, doc, docF, boy, meF, meM  ->  <name>Pos [x,y,z], <name>Rot, <name>Mode, <name>Face,
       <name>Belly, <name>Baby (0/1), <name>Vanish (s); talk = name of the hero whose mouth moves. */
window.WI_OVERLAYS = window.WI_OVERLAYS || [];
window.WI_OVERLAYS.push(function (WI, SETS) {
  const { THREE, R, rr, num, val, glowTex, canvasTex } = WI;
  if (!window.WI_BLOCKY) return;
  const BL = window.WI_BLOCKY(WI); const MK = window.WI_MODELKIT(WI); const K = window.WI_COMMON(WI); const std = MK.std;
  const C = (h) => new THREE.Color(h); const BC = WI.BLOCKY_COLORS;
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const lumpTex = canvasTex(128, 128, (g) => { for (let i = 0; i < 22; i++) { const a = R() * 6.28, d = rr(0, 34), x = 64 + Math.cos(a) * d, y = 64 + Math.sin(a) * d, r = rr(14, 30);
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.6, "rgba(200,200,200,0.85)"); gr.addColorStop(1, "rgba(150,150,150,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });

  // ------------------------------------------------------------------ shared crowd logic
  function commonFn(p, t, i) {
    const vM = num("vanishMen", t, 999), vW = num("vanishWomen", t, 999);
    const v = p.male ? vM : vW; p.vanishT = v < 900 ? v + p.vd : undefined;
    p.belly = p.male && p.preg ? num("menBelly", t, 0) : 0;
    p.baby = !!(p.dad && num("dadBabies", t, 0) > 0.5); if (p.baby) p.babyFace = Math.sin(t * 3 + i) > -0.3 ? 5 : 4;
  }
  function makeCast(scene) {
    const H = BC.HAIR, S = BC.SKIN;
    const cast = [
      { name: "her", male: false, longHair: true, hair: H[2], shirt: C("#ffd166"), legs: C("#3a5a8c"), skin: S[1], skirt: false, s: 0.95 },
      { name: "him", male: true, beard: true, hair: H[0], shirt: C("#3a86ff"), legs: C("#2b2d42"), skin: S[3], s: 1.03 },
      { name: "wife", male: false, longHair: true, hair: H[5], shirt: C("#ef476f"), legs: C("#ef476f"), skin: S[0], skirt: true, s: 0.95 },
      { name: "doc", male: true, beard: false, hair: H[1], shirt: C("#ffffff"), longSleeve: true, legs: C("#8ecae6"), skin: S[2], s: 1.02 },
      { name: "docF", male: false, longHair: true, hair: H[7], shirt: C("#ffffff"), longSleeve: true, legs: C("#8ecae6"), skin: S[4], s: 0.95 },
      { name: "boy", male: true, beard: false, hair: H[3], shirt: C("#06d6a0"), legs: C("#1d3557"), skin: S[0], s: 0.62 },
      { name: "meF", male: false, longHair: true, hair: H[1], shirt: C("#06d6a0"), legs: C("#22223b"), skin: S[1], skirt: false, s: 0.95 },
      { name: "meM", male: true, beard: true, hair: H[2], shirt: C("#118ab2"), legs: C("#2b2d42"), skin: S[2], s: 1.03 },
      { name: "kai", male: true, beard: false, hair: H[0], hat: true, hatCol: C("#ffd23f"), glasses: true, shirt: C("#ff6b35"), legs: C("#1b998b"), skin: S[3], s: 1.03 },
      { name: "poolGirl", male: false, longHair: true, hair: H[6], shirt: C("#f15bb5"), legs: C("#f15bb5"), skin: S[1], s: 0.95 }];
    const api = BL.crowd(scene, cast);
    api.tick = (t) => { const talk = val("talk", t) || ""; api.update(t, (p) => { const P = val(p.name + "Pos", t); if (!P || P[1] < -20) { p.hidden = true; return; }
      p.hidden = false; p.x = P[0]; p.y = P[1]; p.z = P[2]; p.rot = num(p.name + "Rot", t, 0); p.mode = val(p.name + "Mode", t) || "idle";
      const f = num(p.name + "Face", t, 0); p.belly = num(p.name + "Belly", t, 0); p.baby = num(p.name + "Baby", t, 0) > 0.5; p.babyFace = Math.sin(t * 4) > -0.4 ? 5 : 4;
      const vt = num(p.name + "Vanish", t, 999); p.vanishT = vt < 900 ? vt : undefined;
      p.face = talk === p.name && Math.sin(t * 23) > -0.2 ? (f === 4 || f === 3 || f === 5 ? 4 : 6) : Math.round(f); }); };
    return api;
  }
  const pplLook = (o) => Object.assign({ vd: hash(o._i || 0) * 1.2, preg: hash((o._i || 0) + 5.5) < 0.45, dad: hash((o._i || 0) + 9.1) < 0.5 }, o);

  // ================================================================== ROOMS
  const RM = SETS.rooms;
  if (RM) {
    const scene = RM.scene; const ppl = []; let idx = 0;
    const add = (o) => { o._i = idx++; ppl.push(pplLook(Object.assign({ y: 0, rot: 0, mode: "idle" }, o))); };
    const lightAt = (x, y, z, c = 0xfff4e0, i = 1.3, d = 16) => { const l = new THREE.PointLight(c, i, d, 2); l.position.set(x, y, z); scene.add(l); return l; };
    const board = (w, h, draw) => { const tx = canvasTex(Math.round(w * 200), Math.round(h * 200), draw); tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping; tx.encoding = THREE.sRGBEncoding;
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx })); };
    // hospital staff + patient
    add({ male: false, x: 0.7, z: -1.0, rot: -1.6, mode: "idle", shirt: C("#7fd1c7"), longSleeve: false, legs: C("#7fd1c7"), face: 0 });
    add({ male: true, x: 1.6, z: 0.8, rot: -2.4, mode: "talk", shirt: C("#ffffff"), longSleeve: true, legs: C("#8ecae6"), face: 1 });
    add({ male: false, x: -2.2, z: 1.6, rot: 0.7, mode: "idle", shirt: C("#7fd1c7"), legs: C("#7fd1c7"), face: 0 });
    add({ male: false, x: -1.2, y: 0.66, z: -0.55, rot: 0, mode: "lieBed", shirt: C("#bcd4e6"), legs: C("#bcd4e6"), face: 1, kind: "patient" });
    // airport travellers
    for (let i = 0; i < 70; i++) { const r = R(); add({ x: rr(45, 75), z: rr(-15, 5), rot: R() < 0.7 ? Math.PI + rr(-0.4, 0.4) : rr(0, 6.28), mode: r < 0.25 ? "walk" : r < 0.4 ? "phone" : "idle", kind: "air", span: 16 }); }
    // office workers at the desks (desks: x 234..244.8 step 3.6, z -1, -4.2, -7.4; chairs at z + 0.85 facing -z)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) add({ x: 234 + c * 3.6, y: 0.12, z: -1 - r * 3.2 + 0.78, rot: Math.PI, mode: "sitwork", kind: "office" });
    for (let i = 0; i < 5; i++) add({ x: rr(233, 247), z: rr(-9, 2.5), rot: R() * 6.28, mode: R() < 0.5 ? "talk" : "phone", kind: "office" });
    // living room family (sits on the couch at z -2.2)
    [[-0.8, false], [0.8, true], [0, true]].forEach(([dx, m], k) => add({ x: 300 + dx, y: 0.05, z: -2.0, rot: 0, mode: "sit", male: m, kind: "living", dad: m }));
    // ------------------------------------------------ lab (x 360)
    K.room(scene, 9, 3.2, 7, 0x7fc8d0, 0x4f6d7a, new THREE.Vector3(360, 0, 0)); lightAt(360, 2.9, 0, 0xffffff, 0.9, 14); lightAt(358, 2.9, -2, 0xeaf6ff, 0.5, 10);
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.92, 1.0), std(0xf4f6f8)); bench1.position.set(359, 0.46, -2.6); scene.add(bench1);
    const bench2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.92, 1.0), std(0xf4f6f8)); bench2.position.set(362.8, 0.46, -2.6); scene.add(bench2);
    const cage = new THREE.Group(); cage.position.set(358.6, 0.92, -2.6); scene.add(cage);
    { const glass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.42, 0.62), new THREE.MeshStandardMaterial({ color: 0xcfefff, transparent: true, opacity: 0.25, roughness: 0.05 })); glass.position.y = 0.21; cage.add(glass);
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.04, 0.6), std(0xe9d29a)); bed.position.y = 0.02; cage.add(bed);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.03, 0.64), std(0x8a9aa8, { metalness: 0.6 })); lid.position.y = 0.43; cage.add(lid);
      const card = board(0.5, 0.18, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#c2185b"; g.font = `bold ${h * 0.32}px Arial`; g.fillText("2 MOTHERS", w * 0.06, h * 0.45); g.fillStyle = "#333"; g.font = `${h * 0.24}px Arial`; g.fillText("NO FATHER · 2018", w * 0.06, h * 0.82); });
      card.position.set(0, 0.25, 0.32); cage.add(card); }
    const mice = Array.from({ length: 4 }, (_, k) => { const m = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.13), std(0xffffff)); body.position.y = 0.05; m.add(body);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), std(0xffffff)); head.position.set(0, 0.06, 0.08); m.add(head);
      [-1, 1].forEach((s) => { const ear = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.006), std(0xff9fb5)); ear.position.set(s * 0.025, 0.095, 0.075); m.add(ear); });
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.008, 0.008), std(0x111111)); eye.position.set(0, 0.07, 0.106); m.add(eye);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.12), std(0xff9fb5)); tail.position.set(0, 0.04, -0.12); m.add(tail); m.userData.k = k; cage.add(m); return m; });
    const bag = new THREE.Group(); bag.position.set(362.6, 0.92, -2.6); scene.add(bag);
    { const shell = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), new THREE.MeshStandardMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.32, roughness: 0.02, metalness: 0.1 })); shell.scale.set(1.3, 0.8, 0.9); shell.position.y = 0.34; bag.add(shell);
      const fluid = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffd9b0, transparent: true, opacity: 0.18 })); fluid.scale.set(1.25, 0.75, 0.85); fluid.position.y = 0.34; bag.add(fluid);
      const lamb = new THREE.Group(); lamb.position.y = 0.3; bag.add(lamb); const wool = std(0xf6f1e7);
      const lb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.2), wool); lamb.add(lb); const lh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.12), std(0xf0d9c4)); lh.position.set(0.21, 0.04, 0); lamb.add(lh);
      [[-0.1, 0.06], [0.1, 0.06], [-0.1, -0.06], [0.1, -0.06]].forEach(([x, z]) => { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.16), wool); lg.position.set(x, -0.1, z); lg.rotation.y = 1.4; lamb.add(lg); });
      lamb.rotation.z = 0.15; bag.userData.lamb = lamb;
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0xff5a5a, transparent: true, opacity: 0.8 })); tube.rotation.z = 1.2; tube.position.set(0.75, 0.55, 0); bag.add(tube);
      const machine = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.4), std(0xd9dee3)); machine.position.set(1.15, 0.35, 0); bag.add(machine); }
    const bagScreen = board(0.42, 0.26, (g, w, h) => { g.fillStyle = "#04140c"; g.fillRect(0, 0, w, h); g.strokeStyle = "#3dff8b"; g.lineWidth = 3; g.beginPath();
      for (let x = 0; x < w; x++) { const k = (x % 60); const y = h * 0.55 - (k > 20 && k < 26 ? (k - 20) * 9 : k >= 26 && k < 32 ? (32 - k) * 9 : 0); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      g.fillStyle = "#3dff8b"; g.font = `bold ${h * 0.16}px monospace`; g.fillText("LAMB 4 WEEKS", 6, h * 0.2); });
    bagScreen.position.set(363.75, 1.55, -2.39); scene.add(bagScreen);
    const microscope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.45, 12), std(0x2b2d42, { metalness: 0.5 })); microscope.position.set(360.3, 1.15, -2.6); scene.add(microscope);
    const labSign = board(2.6, 0.5, (g, w, h) => { g.fillStyle = "#123b6b"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = `bold ${h * 0.5}px Arial`; g.fillText("REPRODUCTION LAB", w * 0.05, h * 0.68); });
    labSign.position.set(360, 2.6, -3.48); scene.add(labSign);
    add({ male: false, x: 361.2, z: -1.6, rot: Math.PI, mode: "talk", shirt: C("#ffffff"), longSleeve: true, legs: C("#264653"), kind: "lab" });
    // ------------------------------------------------ classroom (x 420)
    K.room(scene, 12, 3.2, 9, 0xffd6a5, 0xb08968, new THREE.Vector3(420, 0, 0)); lightAt(418, 2.9, 0, 0xfff4e0, 0.9, 14); lightAt(422, 2.9, 0, 0xfff4e0, 0.9, 14);
    const chalk = board(4.2, 1.6, (g, w, h) => { g.fillStyle = "#2f5d50"; g.fillRect(0, 0, w, h); g.strokeStyle = "#8d6e4f"; g.lineWidth = 14; g.strokeRect(0, 0, w, h);
      g.fillStyle = "#f4f1de"; g.font = `bold ${h * 0.22}px Arial`; g.fillText("A  B  C", w * 0.08, h * 0.35); g.fillText("2 + 2 = 4", w * 0.08, h * 0.72); g.font = `${h * 0.16}px Arial`; g.fillText("Monday", w * 0.68, h * 0.25); });
    chalk.position.set(420, 1.7, -4.45); scene.add(chalk);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = 416.2 + c * 2.5, z = -1.8 + r * 1.6;
      const d = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.6), std([0xffb703, 0x8ecae6, 0xff6b6b, 0x80ed99][(r + c) % 4])); d.position.set(x, 0.62, z); scene.add(d);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), std(0x6c757d)); leg.position.set(x, 0.3, z); scene.add(leg);
      add({ x, y: 0.0, z: z + 0.55, rot: Math.PI, mode: "sitwork", s: rr(0.58, 0.66), kind: "class", kid0: true }); }
    add({ male: false, x: 418.5, z: -3.6, rot: 0, mode: "talk", kind: "teacher", shirt: C("#9b5de5"), skirt: true, longHair: true });
    // ------------------------------------------------ nursery (x 480)
    K.room(scene, 10, 3.0, 7, 0xff9fb8, 0xbde0fe, new THREE.Vector3(480, 0, 0)); lightAt(478, 2.7, 0, 0xfff0f5, 0.8, 12); lightAt(482, 2.7, 0, 0xfff0f5, 0.8, 12);
    const cribs = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const x = 476.4 + c * 1.8, z = -2.0 + r * 2.2; const cr = new THREE.Group(); cr.position.set(x, 0, z); scene.add(cr);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.5), std(0xffffff)); base.position.y = 0.72; cr.add(base);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.32, 0.52), new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.15 })); glass.position.y = 0.9; cr.add(glass);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), std(0xc0c7cf, { metalness: 0.6 })); stand.position.y = 0.35; cr.add(stand);
      cribs.push(cr); add({ x: x - 0.32, y: 0.64, z, rot: Math.PI / 2, mode: "lieBed", s: 0.42, kind: "baby", face: (r + c) % 3 ? 0 : 5, male: (r * 5 + c) % 2 === 0 }); }
    const nurSign = board(2.2, 0.45, (g, w, h) => { g.fillStyle = "#ff8fab"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = `bold ${h * 0.55}px Arial`; g.fillText("MATERNITY", w * 0.08, h * 0.72); });
    nurSign.position.set(480, 2.4, -3.48); scene.add(nurSign);
    add({ male: false, x: 478.0, z: 1.3, rot: Math.PI, mode: "idle", kind: "nurse2", shirt: C("#ffafcc"), legs: C("#ffafcc") });
    // ------------------------------------------------ aquarium (x 540)
    K.room(scene, 12, 4, 9, 0x13315c, 0x0b2545, new THREE.Vector3(540, 0, 0)); lightAt(540, 3.6, 1, 0x9fd8ff, 1.4, 16); const tankLight = lightAt(540, 2.2, -2.6, 0x4cc9f0, 2.2, 10);
    const tank = new THREE.Group(); tank.position.set(540, 0, -3.4); scene.add(tank);
    { const water = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 1.3), new THREE.MeshStandardMaterial({ color: 0x3fc1ff, transparent: true, opacity: 0.35, roughness: 0.05, emissive: 0x0a5f8a, emissiveIntensity: 0.4 }));
      water.position.y = 1.9; tank.add(water); const sandB = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 1.3), std(0xf2d49b)); sandB.position.y = 0.45; tank.add(sandB);
      for (let i = 0; i < 14; i++) { const pl = new THREE.Mesh(new THREE.ConeGeometry(0.08, rr(0.6, 1.6), 5), std([0x2a9d8f, 0x52b788, 0xe76f51][i % 3])); pl.position.set(rr(-3.8, 3.8), 0.9, rr(-0.5, 0.5)); tank.add(pl); } }
    const horseMat = [0xffb703, 0xfb8500, 0xffd166, 0xf4845f, 0xff9f1c];
    const seahorses = horseMat.map((c, k) => { const g = new THREE.Group(); const m = std(c, { roughness: 0.5 });
      const seg = [[0, 0.42, 0.11, 0], [0, 0.3, 0.13, 0.15], [0.02, 0.16, 0.15, 0.25], [0.03, 0.02, 0.13, 0.1], [0.0, -0.1, 0.1, -0.2], [-0.04, -0.2, 0.08, -0.5], [-0.08, -0.27, 0.06, -1.2], [-0.12, -0.26, 0.05, -2.2]];
      seg.forEach(([x, y, w, r]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, w * 1.1, w * 0.9), m); b.position.set(x, y, 0); b.rotation.z = r; g.add(b); });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.1), m); head.position.set(0.05, 0.52, 0); g.add(head);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), m); snout.position.set(0.17, 0.5, 0); g.add(snout);
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.105), std(0x111111)); eye.position.set(0.07, 0.54, 0); g.add(eye);
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.1), std(0xfff3b0, { transparent: true, opacity: 0.8 })); fin.position.set(-0.08, 0.22, 0); g.add(fin);
      if (k === 0) { const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.13, 0.12), m); pouch.position.set(0.09, 0.05, 0); g.add(pouch); g.userData.dad = true; }
      g.scale.setScalar(k === 0 ? 1.6 : rr(0.9, 1.2)); g.userData = Object.assign(g.userData, { x: -3 + k * 1.5, y: rr(1.3, 2.6), ph: R() * 6 }); tank.add(g); return g; });
    const fry = Array.from({ length: 140 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.02), std(0xffc857)); m.userData = { a: rr(-1.3, 1.3), sp: rr(0.4, 1.4), y: rr(-0.4, 0.6), ph: R() * 6 }; tank.add(m); return m; });
    const fish = Array.from({ length: 10 }, (_, k) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.05), std([0x4361ee, 0xf72585, 0x4cc9f0, 0xffbe0b][k % 4])); m.userData = { y: rr(1, 3), sp: rr(0.3, 0.7), ph: R() * 6 }; tank.add(m); return m; });
    const aqSign = board(3.2, 0.55, (g, w, h) => { g.fillStyle = "#0b2545"; g.fillRect(0, 0, w, h); g.fillStyle = "#ffd166"; g.font = `bold ${h * 0.5}px Arial`; g.fillText("SEAHORSE DADS", w * 0.06, h * 0.7); });
    aqSign.position.set(540, 3.55, -3.0); scene.add(aqSign);
    for (let i = 0; i < 6; i++) add({ x: 537 + i * 1.3, z: rr(-1.4, 0.2), rot: Math.PI + rr(-0.3, 0.3), mode: i % 3 === 0 ? "point" : "idle", kind: "aqua", s: i % 2 ? 0.62 : 1.0, kid0: i % 2 === 1 });
    // ------------------------------------------------ ultrasound monitor in the hospital
    const ultra = new THREE.Group(); ultra.position.set(0.2, 0, -2.4); scene.add(ultra);
    { const pole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 0.08), std(0xd9dee3)); pole.position.y = 0.65; ultra.add(pole); }
    const ultraScreen = board(0.7, 0.5, (g, w, h) => { g.fillStyle = "#050505"; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, 0, 10, w / 2, 0, h * 1.1); gr.addColorStop(0, "#9a9a9a"); gr.addColorStop(1, "#202020");
      g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.arc(w / 2, 0, h * 0.95, 0.35 * Math.PI, 0.65 * Math.PI); g.closePath(); g.fill();
      g.fillStyle = "#e8e8e8"; g.beginPath(); g.ellipse(w * 0.42, h * 0.55, w * 0.1, h * 0.12, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(w * 0.58, h * 0.62, w * 0.14, h * 0.09, 0.3, 0, 7); g.fill();
      g.fillStyle = "#fff"; g.font = `bold ${h * 0.08}px Arial`; g.fillText("WEEK 24  ♥ 148 BPM", w * 0.05, h * 0.95); });
    ultraScreen.position.set(0.2, 1.55, -2.35); scene.add(ultraScreen); ultraScreen.rotation.y = 0.5;
    // crowd + cast
    const crowd = BL.crowd(scene, ppl); const cast = makeCast(scene);
    const origR = RM.update.bind(RM);
    RM.update = function (t, look, pos) { const sc = origR(t, look, pos);
      cage.visible = num("mice", t, 1) > 0.5; bag.visible = bagScreen.visible = num("biobag", t, 1) > 0.5; ultra.visible = ultraScreen.visible = num("ultra", t, 0) > 0.5;
      mice.forEach((m) => { const k = m.userData.k, a = t * (0.6 + k * 0.2) + k * 1.7; m.position.set(Math.sin(a) * 0.35, 0.02, Math.cos(a * 1.3) * 0.18); m.rotation.y = a + Math.PI / 2; });
      bag.userData.lamb.rotation.y = Math.sin(t * 0.7) * 0.15; bag.userData.lamb.position.y = 0.3 + Math.sin(t * 1.3) * 0.01;
      const birth = num("seahorseBirth", t, 0);
      seahorses.forEach((h) => { const u = h.userData; h.position.set(u.x + Math.sin(t * 0.3 + u.ph) * 0.4, u.y + Math.sin(t * 0.9 + u.ph) * 0.08, Math.sin(u.ph) * 0.3); h.rotation.z = Math.sin(t * 0.8 + u.ph) * 0.1; });
      const dad = seahorses[0];
      fry.forEach((f, k) => { const u = f.userData; const age = birth * 6 - k / 140 * 2.5; f.visible = age > 0;
        if (f.visible) { const d = age * u.sp * 0.5; f.position.set(dad.position.x + 0.15 + Math.cos(u.a) * d, dad.position.y + 0.1 + Math.sin(u.a) * d * 0.6 + u.y * d * 0.3, dad.position.z + Math.sin(u.ph) * d * 0.3); f.rotation.z = t * 3 + u.ph; } });
      fish.forEach((f) => { const u = f.userData; const x = ((t * u.sp + u.ph) % 2) / 2; f.position.set(-3.8 + 7.6 * x, u.y + Math.sin(t + u.ph) * 0.1, -0.4); });
      tankLight.intensity = 2 + Math.sin(t * 1.3) * 0.3;
      const teacherOn = num("teacher", t, 1) > 0.5, babiesOn = num("nurseryBabies", t, 1) > 0.5;
      crowd.update(t, (p, tt, i) => { commonFn(p, tt, i); p.hidden = (Math.abs(p.x - pos[0]) < 0.9 && Math.abs(p.z - pos[2]) < 0.9) || (p.kind === "teacher" && !teacherOn) || (p.kind === "baby" && !babiesOn) || (p.kind === "patient" && num("patient", tt, 1) < 0.5) || (p.kind === "living" && num("family", tt, 1) < 0.5);
        if (p.kind === "air" && p.mode === "walk") { const d = ((tt * 1.2 + p.phase * 4) % 16) - 8; if (p.bx === undefined) { p.bx = p.x; p.bz = p.z; } p.x = p.bx + Math.sin(p.rot) * d; p.z = p.bz + Math.cos(p.rot) * d; }
        const vM = num("vanishMen", tt, 999), vW = num("vanishWomen", tt, 999), vv = Math.min(vM, vW);
        if (vv < 900 && tt > vv + 1.5 && p.kind !== "baby" && p.kind !== "patient") { if (p.kind === "office" || p.kind === "class") { p.face = 3; if (p.mode === "sitwork") p.mode = "sitwork"; }
          else { p.mode = hash(i) < 0.3 ? "panic" : hash(i) < 0.5 ? "phone" : hash(i) < 0.6 ? "cry" : "idle"; p.face = hash(i + 3) < 0.5 ? 3 : 2; } }
        if (p.kind === "baby") p.face = Math.sin(tt * 2 + i) > 0.2 ? 5 : 0; });
      cast.tick(t);
      return sc; };
  }

  // ================================================================== STREET
  const ST = SETS.street;
  if (ST) {
    const scene = ST.scene; const ppl = [];
    for (let i = 0; i < 300; i++) { const side = i % 2 ? 1 : -1; const r = R(); ppl.push(pplLook({ _i: i, x: side * rr(7.3, 10.0), z: rr(-170, 25), rot: R() < 0.5 ? 0 : Math.PI,
      mode: r < 0.62 ? "walk" : r < 0.75 ? "phone" : r < 0.9 ? "talk" : "idle", span: 60, y: 0.18 })); }
    for (let i = 0; i < 40; i++) ppl.push(pplLook({ _i: 300 + i, x: rr(-5, 5), z: rr(-46, -38), rot: R() < 0.5 ? Math.PI / 2 : -Math.PI / 2, mode: "idle", kind: "cross", y: 0.02 }));
    const crowd = BL.crowd(scene, ppl); const cast = makeCast(scene);
    // crashed cars with smoke
    const crashes = [[-2.4, -14, 0.5, "NormalCar1"], [2.2, -17.5, -2.7, "SUV"], [-3.6, -33, 1.3, "Taxi"], [1.5, -56, 0.3, "NormalCar2"], [-1.5, -59, -2.9, "NormalCar1"], [3.4, -80, -1.1, "SUV"], [-2.8, -101, 2.4, "Taxi"]];
    const wrecks = crashes.map(([x, z, r, f], k) => { const c = WI.model(`cars/FBX/${f}.fbx`, { length: 4.4, alongZ: true, autoUp: true }); c.position.set(x, 0.18, z); c.rotation.set(0, r, k % 2 ? 0.04 : -0.03); scene.add(c);
      const smoke = Array.from({ length: 10 }, (_, j) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lumpTex, color: 0x6b6b6b, transparent: true, depthWrite: false, opacity: 0 })); sp.userData = { ph: j / 10 }; scene.add(sp); return sp; });
      const haz = [0, 1].map(() => { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa500, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); h.scale.setScalar(0.9); scene.add(h); return h; });
      return { c, smoke, haz, x, z, r, k }; });
    const roller = WI.model("cars/FBX/NormalCar2.fbx", { length: 4.4, alongZ: true, autoUp: true }); scene.add(roller);
    const origS = ST.update.bind(ST);
    ST.update = function (t, look, pos) { const sc = origS(t, look, pos);
      const cA = num("crashAt", t, 999), on = t >= cA;
      wrecks.forEach((w) => { w.c.visible = on; w.smoke.forEach((sp) => { const u = sp.userData; const ph = ((t - cA) * 0.25 + u.ph) % 1; sp.visible = on;
          sp.position.set(w.x + Math.sin(u.ph * 9) * 0.3 + ph * 1.2, 0.9 + ph * 6, w.z + ph * 0.8); const s = 0.8 + ph * 3.5; sp.scale.set(s, s, 1); sp.material.opacity = on ? 0.75 * (1 - ph) * Math.min(1, (t - cA) * 2) : 0; });
        w.haz.forEach((h, j) => { h.visible = on; h.material.opacity = Math.sin(t * 6 + w.k) > 0 ? 0.9 : 0; h.position.set(w.x + Math.cos(w.r) * (j ? 0.8 : -0.8), 0.9, w.z - Math.sin(w.r) * (j ? 0.8 : -0.8)); }); });
      // one car rolls on without a driver and hits the first wreck
      const rr0 = cA - 2.2, k = Math.max(0, Math.min(1, (t - rr0) / 2.2)); roller.visible = cA < 900 && t > rr0 - 4;
      if (roller.visible) { const z = 10 - 22 * (1 - Math.pow(1 - k, 1.5)); roller.position.set(-2.6, 0.18, Math.max(z, -10.6)); roller.rotation.set(0, Math.PI + (k >= 1 ? 0.35 : 0), k >= 1 ? 0.05 : 0); }
      const mood = val("streetMood", t) || "normal"; const vM = num("vanishMen", t, 999), vW = num("vanishWomen", t, 999), vv = Math.min(vM, vW);
      crowd.update(t, (p, tt, i) => { commonFn(p, tt, i);
        if (p.base === undefined) p.base = { x: p.x, z: p.z, mode: p.mode, rot: p.rot };
        const b = p.base; let moving = b.mode === "walk" && mood === "normal" && !(vv < 900 && tt > vv + 0.5);
        if (b.mode === "walk") { const span = 60; const tw = moving ? tt : (vv < 900 ? Math.min(tt, vv + 0.5) : tt); const d = (((tw * 1.3 * p.speed + p.phase * 9) % span) + span) % span - span / 2; p.x = b.x; p.z = b.z + Math.cos(b.rot) * d; }
        p.mode = moving ? "walk" : b.mode === "walk" ? "idle" : b.mode; p.rot = b.rot;
        if (vv < 900 && tt > vv + 1.0 && mood !== "organize" && mood !== "calm") { const h = hash(i); p.mode = h < 0.25 ? "panic" : h < 0.45 ? "phone" : h < 0.55 ? "cry" : h < 0.7 ? "point" : "idle"; p.face = hash(i + 2) < 0.5 ? 3 : 2;
          p.rot = b.rot + (hash(i + 7) - 0.5) * 2; }
        if (mood === "organize") { const h = hash(i); p.mode = h < 0.3 ? "wave" : h < 0.5 ? "carry" : h < 0.7 ? "talk" : "walk"; p.face = h < 0.5 ? 1 : 0; }
        if (mood === "calm") { p.face = hash(i) < 0.6 ? 0 : 7; }
        if (mood === "normal" && !(vv < 900 && tt > vv)) p.face = p.face > 2 && p.face !== 7 ? 0 : p.face;
        p.hidden = Math.abs(p.x - pos[0]) < 1.6 && Math.abs(p.z - pos[2]) < 1.6 && pos[1] < 4; });
      cast.tick(t);
      return sc; };
  }

  // ================================================================== RESORT: heroes from the cast too
  const RS = SETS.resort;
  if (RS) { const cast = makeCast(RS.scene); const origRS = RS.update.bind(RS); RS.update = function (t, look, pos) { const sc = origRS(t, look, pos); cast.tick(t); return sc; }; }
});
