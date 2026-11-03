const API = location.pathname.startsWith("/app") ? "" : "http://127.0.0.1:8000";
const $ = (id) => document.getElementById(id);
const FIELDS = ["id", "name", "city", "age", "gender", "height", "weight"];
let patients = [];
let editingId = null;

async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(API + path, { headers: { "Content-Type": "application/json" }, ...options });
  } catch {
    throw new Error("Cannot reach the backend. Start the server and check it is running on port 8000.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = body.detail;
    throw new Error(Array.isArray(d) ? d.map((e) => `${e.loc.slice(1).join(".")}: ${e.msg}`).join("; ") : d || "Request failed");
  }
  return body;
}

let toastTimer;
function toast(msg, isError = false) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "show" + (isError ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = ""), 3500);
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function load() {
  try {
    patients = await api(`/sort?sort_by=${$("sortBy").value}&order=${$("order").value}`);
    render();
    if (!editingId) $("id").value = nextId();
  } catch (e) {
    toast(e.message, true);
  }
}

function nextId() {
  const nums = patients.map((p) => /^P(\d+)$/.exec(p.id)).filter(Boolean).map((m) => +m[1]);
  return "P" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
}

function render() {
  const q = $("search").value.trim().toLowerCase();
  const shown = patients.filter((p) => [p.id, p.name, p.city].some((v) => v.toLowerCase().includes(q)));
  $("empty").hidden = shown.length > 0;
  $("rows").innerHTML = shown.map((p) => {
    const pos = Math.min(100, Math.max(0, ((p.bmi - 15) / 25) * 100));
    return `<tr>
      <td>${esc(p.id)}</td><td>${esc(p.name)}</td><td>${esc(p.city)}</td>
      <td class="num">${p.age}</td><td>${esc(p.gender)}</td>
      <td class="num">${p.height} m</td><td class="num">${p.weight} kg</td>
      <td><div class="bmi">${p.bmi}<span class="gauge"><i style="left:${pos}%"></i></span><span class="tag">${p.verdict}</span></div></td>
      <td class="act"><button class="small" data-edit="${esc(p.id)}">Edit</button><button class="small del" data-del="${esc(p.id)}">Delete</button></td>
    </tr>`;
  }).join("");
  const avg = patients.length ? (patients.reduce((s, p) => s + p.bmi, 0) / patients.length).toFixed(1) : "–";
  $("summary").textContent = `${patients.length} patient${patients.length === 1 ? "" : "s"} · average BMI ${avg}`;
}

function resetForm() {
  editingId = null;
  $("form").reset();
  $("id").disabled = false;
  $("formTitle").textContent = "Add patient";
  $("save").textContent = "Add patient";
  $("cancel").hidden = true;
  $("id").value = nextId();
}

function startEdit(id) {
  const p = patients.find((x) => x.id === id);
  if (!p) return;
  editingId = id;
  FIELDS.forEach((f) => ($(f).value = p[f]));
  $("id").disabled = true;
  $("formTitle").textContent = "Edit patient";
  $("save").textContent = "Save changes";
  $("cancel").hidden = false;
  $("name").focus();
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    id: $("id").value.trim(), name: $("name").value.trim(), city: $("city").value.trim(),
    age: Number($("age").value), gender: $("gender").value,
    height: Number($("height").value), weight: Number($("weight").value),
  };
  try {
    if (editingId) {
      delete data.id;
      await api(`/patient/${encodeURIComponent(editingId)}`, { method: "PUT", body: JSON.stringify(data) });
      toast("Changes saved");
    } else {
      await api("/patients", { method: "POST", body: JSON.stringify(data) });
      toast("Patient added");
    }
    resetForm();
    await load();
  } catch (err) {
    toast(err.message, true);
  }
});

$("rows").addEventListener("click", async (e) => {
  const edit = e.target.dataset.edit, del = e.target.dataset.del;
  if (edit) return startEdit(edit);
  if (del && confirm(`Delete patient ${del}? This cannot be undone.`)) {
    try {
      await api(`/patient/${encodeURIComponent(del)}`, { method: "DELETE" });
      toast("Patient deleted");
      if (editingId === del) resetForm();
      await load();
    } catch (err) {
      toast(err.message, true);
    }
  }
});

$("cancel").addEventListener("click", resetForm);
$("search").addEventListener("input", render);
$("sortBy").addEventListener("change", load);
$("order").addEventListener("change", load);
load();
