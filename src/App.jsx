import { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  initializeFirestore, persistentLocalCache, collection, doc, onSnapshot,
  query, orderBy, limit, writeBatch, increment, deleteDoc, getDocs,
} from "firebase/firestore";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

/* ============ INCOLLA QUI I DATI DEL TUO PROGETTO FIREBASE ============ */
const firebaseConfig = {
  apiKey:<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA48uEzeEdSL71G9Ynv_BzwZzfTm_FGyPQ",
    authDomain: "magazzino-3a6f8.firebaseapp.com",
    projectId: "magazzino-3a6f8",
    storageBucket: "magazzino-3a6f8.firebasestorage.app",
    messagingSenderId: "1068792307356",
    appId: "1:1068792307356:web:fe3411800d018156891759"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script> ,
  authDomain:<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA48uEzeEdSL71G9Ynv_BzwZzfTm_FGyPQ",
    authDomain: "magazzino-3a6f8.firebaseapp.com",
    projectId: "magazzino-3a6f8",
    storageBucket: "magazzino-3a6f8.firebasestorage.app",
    messagingSenderId: "1068792307356",
    appId: "1:1068792307356:web:fe3411800d018156891759"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>,
  projectId:<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA48uEzeEdSL71G9Ynv_BzwZzfTm_FGyPQ",
    authDomain: "magazzino-3a6f8.firebaseapp.com",
    projectId: "magazzino-3a6f8",
    storageBucket: "magazzino-3a6f8.firebasestorage.app",
    messagingSenderId: "1068792307356",
    appId: "1:1068792307356:web:fe3411800d018156891759"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script> ,
  storageBucket:<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA48uEzeEdSL71G9Ynv_BzwZzfTm_FGyPQ",
    authDomain: "magazzino-3a6f8.firebaseapp.com",
    projectId: "magazzino-3a6f8",
    storageBucket: "magazzino-3a6f8.firebasestorage.app",
    messagingSenderId: "1068792307356",
    appId: "1:1068792307356:web:fe3411800d018156891759"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script> ,
  messagingSenderId:<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA48uEzeEdSL71G9Ynv_BzwZzfTm_FGyPQ",
    authDomain: "magazzino-3a6f8.firebaseapp.com",
    projectId: "magazzino-3a6f8",
    storageBucket: "magazzino-3a6f8.firebasestorage.app",
    messagingSenderId: "1068792307356",
    appId: "1:1068792307356:web:fe3411800d018156891759"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script> ,
  appId:<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA48uEzeEdSL71G9Ynv_BzwZzfTm_FGyPQ",
    authDomain: "magazzino-3a6f8.firebaseapp.com",
    projectId: "magazzino-3a6f8",
    storageBucket: "magazzino-3a6f8.firebasestorage.app",
    messagingSenderId: "1068792307356",
    appId: "1:1068792307356:web:fe3411800d018156891759"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script> ,
};
/* ===================================================================== */

const configured = !String(firebaseConfig.apiKey).startsWith("INCOLLA");
let auth = null, db = null;
if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, { localCache: persistentLocalCache() });
}

const LS = "magazzino_login";
const idOf = (c) => encodeURIComponent(String(c).trim());
const fmt = (t) => new Date(t).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const css = `
:root{--bg:#f3f4f1;--ink:#1d2733;--mut:#6b7684;--line:#d6d9d3;--card:#fff;--acc:#f2b705;--in:#2e7d4f;--out:#b3382c}
@media(prefers-color-scheme:dark){:root{--bg:#161b22;--ink:#e6e9ee;--mut:#98a2b0;--line:#2c343f;--card:#1f262f}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.4 system-ui,Roboto,Arial,sans-serif}
.app{min-height:100dvh;padding-bottom:40px}
header{background:#1d2733;color:#fff;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 12px;border-bottom:4px solid var(--acc);display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:5}
header .t{flex:1;min-width:0}
header h1{margin:0;font-size:19px}
header small{display:block;color:#b9c2cf;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:#4cc38a}
.dot.w{background:var(--acc)}
.menuBtn{background:none;border:0;color:#fff;font-size:26px;padding:4px 8px}
.menu{position:absolute;right:12px;top:calc(56px + env(safe-area-inset-top,0px));background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.25);min-width:210px;overflow:hidden}
.menu button{display:block;width:100%;text-align:left;padding:13px 16px;border:0;border-bottom:1px solid var(--line);background:none;color:inherit;font:inherit}
.tabs{display:flex;gap:6px;padding:12px 12px 0}
.tabs button{flex:1;padding:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:8px;font:inherit}
.tabs button.on{background:var(--acc);border-color:var(--acc);color:#1d2733;font-weight:700}
.pad{padding:12px}
input,select,textarea{font:inherit;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);width:100%}
.tool{display:grid;gap:8px;margin-bottom:10px}
.chk{display:flex;align-items:center;gap:8px;color:var(--mut)}
.chk input{width:auto}
.cnt{color:var(--mut);font-size:14px;margin:4px 2px 10px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:10px}
.card.low{border-color:var(--out);background:rgba(179,56,44,.07)}
.top{display:flex;justify-content:space-between;gap:10px}
.code{font-family:Consolas,monospace;font-weight:700;font-size:14px;color:var(--mut)}
.nm{font-weight:700;font-size:17px}
.qty{text-align:right}
.qty b{display:block;font-size:26px;line-height:1}
.qty small{color:var(--mut);font-size:12px}
.card.low .qty b{color:var(--out)}
.desc{color:var(--mut);margin-top:6px;font-size:14px}
.meta{margin-top:6px;font-size:14px;color:var(--mut)}
.badge{margin-left:8px;padding:1px 8px;border-radius:10px;background:var(--out);color:#fff;font-size:12px;font-weight:600}
.acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.acts .sm{grid-column:span 1}
.b{font:inherit;padding:11px 14px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
.b.pri{background:var(--acc);border-color:var(--acc);color:#1d2733;font-weight:700}
.b.in{background:var(--in);border-color:var(--in);color:#fff;font-weight:600}
.b.out{background:var(--out);border-color:var(--out);color:#fff;font-weight:600}
.b.big{width:100%;padding:14px;font-size:17px}
.empty{padding:30px 10px;text-align:center;color:var(--mut)}
.fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));box-shadow:0 4px 14px rgba(0,0,0,.35);border-radius:28px;padding:15px 22px;font-size:17px}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;z-index:20}
.md{background:var(--card);width:100%;max-width:520px;max-height:92dvh;overflow:auto;border-radius:16px 16px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px))}
.md h2{margin:0 0 8px;font-size:19px}
label{display:block;margin:12px 0 5px;font-weight:600;font-size:14px}
.row{display:flex;gap:8px;margin-top:16px}
.row .b{flex:1}
.err{color:var(--out);min-height:20px;margin-top:8px;font-size:14px}
.toast{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));background:#1d2733;color:#fff;padding:13px 16px;border-radius:10px;z-index:30;border-left:5px solid var(--acc)}
.center{max-width:420px;margin:0 auto;padding:calc(40px + env(safe-area-inset-top,0px)) 20px 20px}
.hint{color:var(--mut);font-size:14px}
.mv{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-bottom:8px}
.mv .l1{display:flex;justify-content:space-between;gap:8px}
.tin{color:var(--in);font-weight:700}.tout{color:var(--out);font-weight:700}
.mv small{color:var(--mut)}
`;

function LoginScreen({ onOk }) {
  const [c, setC] = useState("");
  const [n, setN] = useState("");
  const [e, setE] = useState("");
  const go = () => {
    if (c.trim().length < 6) return setE("Il codice magazzino deve avere almeno 6 caratteri.");
    if (!n.trim()) return setE("Scrivi il tuo nome.");
    onOk({ code: c.trim(), name: n.trim() });
  };
  return (
    <div className="center">
      <h1>Magazzino</h1>
      <label>Codice magazzino (uguale per tutti)</label>
      <input value={c} onChange={(ev) => setC(ev.target.value)} autoCapitalize="none" autoCorrect="off" />
      <label>Il tuo nome</label>
      <input value={n} onChange={(ev) => setN(ev.target.value)} />
      <div className="err">{e}</div>
      <button className="b pri big" onClick={go}>Entra</button>
      <p className="hint">Scegli un codice lungo e difficile da indovinare: chi lo conosce può vedere e modificare il magazzino.</p>
    </div>
  );
}

function ItemModal({ item, items, sections, onClose, onSave }) {
  const isNew = !item;
  const [f, setF] = useState({
    code: item?.code || "", name: item?.name || "", desc: item?.desc || "",
    section: item?.section || "", qty: 0, min: item?.min || 0,
  });
  const [e, setE] = useState("");
  const set = (k) => (ev) => setF({ ...f, [k]: ev.target.value });
  const submit = () => {
    const code = f.code.trim(), name = f.name.trim();
    if (!code || !name) return setE("Inserisci almeno codice e nome.");
    if (isNew && items.some((i) => i.code.toLowerCase() === code.toLowerCase()))
      return setE("Esiste già un articolo con questo codice.");
    onSave({
      code, name, desc: f.desc.trim(), section: f.section.trim(),
      qty: Math.max(0, parseInt(f.qty) || 0), min: Math.max(0, parseInt(f.min) || 0),
    }, isNew);
  };
  return (
    <div className="ov" onClick={onClose}>
      <div className="md" onClick={(ev) => ev.stopPropagation()}>
        <h2>{isNew ? "Nuovo articolo" : "Modifica articolo"}</h2>
        <label>Codice</label>
        <input value={f.code} onChange={set("code")} disabled={!isNew} />
        <label>Nome</label>
        <input value={f.name} onChange={set("name")} />
        <label>Descrizione</label>
        <textarea rows={3} value={f.desc} onChange={set("desc")} />
        <label>Sezione</label>
        <input value={f.section} onChange={set("section")} list="secs" placeholder="Es. Scaffale A3" />
        <datalist id="secs">{sections.map((s) => <option key={s} value={s} />)}</datalist>
        {isNew && (<><label>Quantità iniziale</label>
          <input type="number" inputMode="numeric" min="0" value={f.qty} onChange={set("qty")} /></>)}
        <label>Scorta minima (avviso quando scende a questo valore)</label>
        <input type="number" inputMode="numeric" min="0" value={f.min} onChange={set("min")} />
        <div className="err">{e}</div>
        <div className="row">
          <button className="b" onClick={onClose}>Annulla</button>
          <button className="b pri" onClick={submit}>Salva</button>
        </div>
      </div>
    </div>
  );
}

function MoveModal({ it, type, onClose, onOk }) {
  const [n, setN] = useState(1);
  const [note, setNote] = useState("");
  const [e, setE] = useState("");
  const go = () => {
    const q = parseInt(n);
    if (!q || q < 1) return setE("Inserisci una quantità maggiore di zero.");
    if (type === "out" && q > it.qty) return setE(`Giacenza insufficiente: disponibili ${it.qty}.`);
    onOk(q, note.trim());
  };
  return (
    <div className="ov" onClick={onClose}>
      <div className="md" onClick={(ev) => ev.stopPropagation()}>
        <h2>{type === "in" ? "Carico merce" : "Scarico merce"}</h2>
        <div className="hint">{it.code} · {it.name} · giacenza attuale: {it.qty}</div>
        <label>Quantità</label>
        <input type="number" inputMode="numeric" min="1" value={n} onChange={(ev) => setN(ev.target.value)} autoFocus />
        <label>Nota (facoltativa)</label>
        <input value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Es. DDT 123, cliente Rossi" />
        <div className="err">{e}</div>
        <div className="row">
          <button className="b" onClick={onClose}>Annulla</button>
          <button className={"b " + type} onClick={go}>Conferma</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [login, setLogin] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; }
  });
  const [ready, setReady] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [items, setItems] = useState([]);
  const [moves, setMoves] = useState([]);
  const [pending, setPending] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [tab, setTab] = useState("art");
  const [q, setQ] = useState("");
  const [sec, setSec] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [menu, setMenu] = useState(false);
  const [itemForm, setItemForm] = useState(null);
  const [mv, setMv] = useState(null);
  const [msg, setMsg] = useState("");

  const wid = login ? encodeURIComponent(login.code.trim().toLowerCase()) : "";
  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3800); };
  const ref = (...p) => doc(db, `magazzini/${wid}`, ...p);
  const col = (n) => collection(db, `magazzini/${wid}`, n);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    if (!configured) return;
    return onAuthStateChanged(auth, (u) => {
      if (u) { setReady(true); setAuthErr(""); }
      else signInAnonymously(auth).catch((e) => setAuthErr("Serve internet al primo avvio"));
    });
  }, []);

  useEffect(() => {
    if (!configured || !ready || !login) return;
    const u1 = onSnapshot(col("articoli"), { includeMetadataChanges: true },
      (s) => { setItems(s.docs.map((d) => d.data())); setPending(s.metadata.hasPendingWrites); },
      (e) => toast("Errore di accesso ai dati: controlla le regole Firestore"));
    const u2 = onSnapshot(query(col("movimenti"), orderBy("t", "desc"), limit(300)),
      (s) => setMoves(s.docs.map((d) => d.data())), () => {});
    return () => { u1(); u2(); };
  }, [ready, login]);

  const sections = useMemo(
    () => [...new Set(items.map((i) => i.section).filter(Boolean))].sort((a, b) => a.localeCompare(b, "it")),
    [items]
  );
  const isLow = (i) => (i.min || 0) > 0 && i.qty <= i.min;
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items
      .filter((i) => (!sec || i.section === sec) && (!lowOnly || isLow(i)) &&
        (!s || [i.code, i.name, i.desc].join(" ").toLowerCase().includes(s)))
      .sort((a, b) => a.code.localeCompare(b.code, "it", { numeric: true }));
  }, [items, q, sec, lowOnly]);

  const doLogin = (l) => { localStorage.setItem(LS, JSON.stringify(l)); setLogin(l); };
  const logout = () => {
    if (!window.confirm("Uscire dal magazzino? Dovrai reinserire il codice.")) return;
    localStorage.removeItem(LS); setLogin(null); setItems([]); setMoves([]); setMenu(false);
  };

  const saveItem = (d, isNew) => {
    const b = writeBatch(db);
    const r = ref("articoli", idOf(d.code));
    if (isNew) {
      b.set(r, { code: d.code, name: d.name, desc: d.desc, section: d.section, qty: d.qty, min: d.min });
      if (d.qty > 0) {
        const id = newId();
        b.set(ref("movimenti", id), { id, t: Date.now(), code: d.code, name: d.name, type: "init", qty: d.qty, after: d.qty, note: "Giacenza iniziale", by: login.name });
      }
    } else {
      b.update(r, { name: d.name, desc: d.desc, section: d.section, min: d.min });
    }
    b.commit().catch(() => toast("Salvataggio non riuscito"));
    setItemForm(null);
  };

  const delItem = (i) => {
    if (window.confirm(`Eliminare l'articolo ${i.code}? Lo storico dei movimenti resta salvato.`))
      deleteDoc(ref("articoli", idOf(i.code))).catch(() => toast("Eliminazione non riuscita"));
  };

  const doMove = (it, type, n, note) => {
    const d = type === "in" ? n : -n;
    const id = newId();
    const b = writeBatch(db);
    b.update(ref("articoli", idOf(it.code)), { qty: increment(d) });
    b.set(ref("movimenti", id), { id, t: Date.now(), code: it.code, name: it.name, type, qty: n, after: it.qty + d, note, by: login.name });
    b.commit().catch(() => toast("Movimento non riuscito"));
    setMv(null);
    if (type === "out" && (it.min || 0) > 0 && it.qty + d <= it.min)
      toast(`Attenzione: ${it.code} è sotto scorta (${it.qty + d} disponibili, minimo ${it.min}).`);
  };

  async function shareFile(name, text) {
    try {
      if (Capacitor.isNativePlatform()) {
        const r = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
        await Share.share({ title: name, url: r.uri, dialogTitle: "Condividi file" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([text]));
        a.download = name; document.body.appendChild(a); a.click(); a.remove();
      }
    } catch (e) { toast("Esportazione non riuscita"); }
  }

  const exportCsv = () => {
    setMenu(false);
    const c = (s) => '"' + String(s ?? "").replace(/"/g, '""') + '"';
    const rows = [["Codice", "Nome", "Descrizione", "Sezione", "Quantità", "Scorta minima"],
      ...[...items].sort((a, b) => a.code.localeCompare(b.code, "it", { numeric: true }))
        .map((i) => [i.code, i.name, i.desc, i.section, i.qty, i.min || 0])];
    shareFile("magazzino.csv", "\uFEFF" + rows.map((r) => r.map(c).join(";")).join("\r\n"));
  };

  const exportBackup = async () => {
    setMenu(false);
    try {
      const s = await getDocs(col("movimenti"));
      const data = { items, moves: s.docs.map((d) => d.data()) };
      shareFile("magazzino-backup-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(data));
    } catch (e) { toast("Backup non riuscito"); }
  };

  const restore = async (file) => {
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!Array.isArray(d.items) || !Array.isArray(d.moves)) throw 0;
      if (!window.confirm(`Importare ${d.items.length} articoli e ${d.moves.length} movimenti? Gli articoli con lo stesso codice vengono sovrascritti.`)) return;
      const ops = [];
      d.items.forEach((i) => ops.push((b) => b.set(ref("articoli", idOf(i.code)),
        { code: i.code, name: i.name || "", desc: i.desc || "", section: i.section || "", qty: Number(i.qty) || 0, min: Number(i.min) || 0 })));
      d.moves.forEach((m) => { const id = m.id || `${m.t}_${idOf(m.code)}`; ops.push((b) => b.set(ref("movimenti", id), { ...m, id })); });
      toast("Importazione in corso…");
      for (let k = 0; k < ops.length; k += 400) {
        const b = writeBatch(db);
        ops.slice(k, k + 400).forEach((f) => f(b));
        await b.commit();
      }
      toast("Backup importato");
    } catch (e) { toast("File di backup non valido"); }
  };

  const status = !ready ? (authErr || "Connessione…") : pending ? "Invio in corso…" : !online ? "Offline: salvo sul telefono" : "Sincronizzato";

  return (
    <>
      <style>{css}</style>
      {!configured && (
        <div className="center">
          <h2>Manca la configurazione</h2>
          <p>Apri <b>src/App.jsx</b> e incolla i dati del tuo progetto Firebase nella costante <b>firebaseConfig</b>.</p>
        </div>
      )}
      {configured && !login && <LoginScreen onOk={doLogin} />}
      {configured && login && (
        <div className="app">
          <header>
            <div className="t">
              <h1>Magazzino</h1>
              <small><span className={"dot" + (ready && !pending && online ? "" : " w")} />{status} · {login.name}</small>
            </div>
            <button className="menuBtn" onClick={() => setMenu(!menu)}>⋮</button>
          </header>
          {menu && (
            <div className="menu">
              <button onClick={exportCsv}>Esporta CSV</button>
              <button onClick={exportBackup}>Salva backup</button>
              <button onClick={() => document.getElementById("rs").click()}>Ripristina backup</button>
              <button onClick={logout}>Esci dal magazzino</button>
            </div>
          )}
          <input id="rs" type="file" accept=".json,application/json" style={{ display: "none" }}
            onChange={(e) => { setMenu(false); restore(e.target.files[0]); e.target.value = ""; }} />

          <div className="tabs">
            <button className={tab === "art" ? "on" : ""} onClick={() => setTab("art")}>Articoli</button>
            <button className={tab === "sto" ? "on" : ""} onClick={() => setTab("sto")}>Storico</button>
          </div>

          {tab === "art" && (
            <div className="pad">
              <div className="tool">
                <input type="search" placeholder="Cerca codice, nome o descrizione" value={q} onChange={(e) => setQ(e.target.value)} />
                <select value={sec} onChange={(e) => setSec(e.target.value)}>
                  <option value="">Tutte le sezioni</option>
                  {sections.map((s) => <option key={s}>{s}</option>)}
                </select>
                <label className="chk" style={{ margin: 0, fontWeight: 400 }}>
                  <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Solo sotto scorta
                </label>
              </div>
              <div className="cnt">{list.length} articoli · {list.reduce((s, i) => s + i.qty, 0)} pezzi · {items.filter(isLow).length} sotto scorta</div>
              {list.length === 0 && (
                <div className="empty">{items.length ? "Nessun articolo corrisponde alla ricerca." : "Il magazzino è vuoto. Premi «+ Nuovo» per iniziare."}</div>
              )}
              {list.map((i) => (
                <div key={i.code} className={"card" + (isLow(i) ? " low" : "")}>
                  <div className="top">
                    <div><div className="code">{i.code}</div><div className="nm">{i.name}</div></div>
                    <div className="qty"><b>{i.qty}</b><small>min {i.min || 0}</small></div>
                  </div>
                  {i.desc && <div className="desc">{i.desc}</div>}
                  <div className="meta">{i.section || "Senza sezione"}{isLow(i) && <span className="badge">sotto scorta</span>}</div>
                  <div className="acts">
                    <button className="b in" onClick={() => setMv({ it: i, type: "in" })}>Carico</button>
                    <button className="b out" onClick={() => setMv({ it: i, type: "out" })}>Scarico</button>
                    <button className="b" onClick={() => setItemForm({ item: i })}>Modifica</button>
                    <button className="b" onClick={() => delItem(i)}>Elimina</button>
                  </div>
                </div>
              ))}
              <div style={{ height: 70 }} />
            </div>
          )}

          {tab === "sto" && (
            <div className="pad">
              {moves.length === 0 && <div className="empty">Nessun movimento registrato.</div>}
              {moves.map((m, k) => (
                <div className="mv" key={m.id || k}>
                  <div className="l1">
                    <span className="code">{m.code} · {m.name}</span>
                    <span className={m.type === "out" ? "tout" : "tin"}>{m.type === "out" ? "-" : "+"}{m.qty}</span>
                  </div>
                  <small>{m.type === "in" ? "Carico" : m.type === "out" ? "Scarico" : "Giacenza iniziale"} · giacenza dopo: {m.after} · {fmt(m.t)}{m.by ? " · " + m.by : ""}</small>
                  {m.note && m.type !== "init" && <div><small>{m.note}</small></div>}
                </div>
              ))}
            </div>
          )}

          {tab === "art" && <button className="b pri fab" onClick={() => setItemForm({ item: null })}>+ Nuovo</button>}
          {itemForm && <ItemModal item={itemForm.item} items={items} sections={sections} onClose={() => setItemForm(null)} onSave={saveItem} />}
          {mv && <MoveModal it={mv.it} type={mv.type} onClose={() => setMv(null)} onOk={(n, note) => doMove(mv.it, mv.type, n, note)} />}
        </div>
      )}
      {msg && <div className="toast">{msg}</div>}
    </>
  );
}
