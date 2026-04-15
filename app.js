// ======================================================
// 🔒 GLOBAL ERROR CATCH
// ======================================================
window.onerror = function(msg, url, line, col, error){
  console.error("🔥 Erro global:", { msg, url, line, col, error });
};

// ======================================================
// 🧠 DB LAYER
// ======================================================
const DB = {
  get: (k) => JSON.parse(localStorage.getItem(k)) || [],
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

let hideBalance = localStorage.getItem("hideBalance") === "true";

// ======================================================
// 📦 STATE
// ======================================================
let transactions = DB.get("t");
let accounts = DB.get("acc") || [];
let debts = DB.get("debts") || [];

const STATE = {
  balance: 0,
  income: 0,
  outcome: 0,
  realBalance: 0
};

const ACCOUNT_CACHE = {};

// ======================================================
// 📚 CATEGORIES
// ======================================================
const categories = [
  "Salário","Mercado","Investimentos","Rendimentos","Moradia",
  "Aluguel","Internet","Saúde","Transporte","Lazer","Educação","Outros"
];

// ======================================================
// 🧾 MIGRATION
// ======================================================
function migrateData(){
  let changed = false;

  accounts = accounts.map(a => {
    if(a.initialBalance === undefined){ a.initialBalance = a.balance ?? 0; changed = true; }
    if(a.limit === undefined){ a.limit = 0; changed = true; }
    if(a.used === undefined){ a.used = 0; changed = true; }
    return a;
  });

  transactions = transactions.map(t => {
    if(t.account === undefined){ t.account = "Sem conta"; changed = true; }
    if(t.category === undefined){ t.category = "Outros"; changed = true; }
    if(t.paymentType === undefined){ t.paymentType = null; changed = true; }
    if(t.date === undefined){ t.date = Date.now(); changed = true; }
    if(t.customDate === undefined){ t.customDate = null; changed = true; }
    return t;
  });

  if(changed){
    DB.set("acc", accounts);
    DB.set("t", transactions);
  }
}
migrateData();

// ======================================================
// 🏦 CONTAS FIXAS
// ======================================================
if(accounts.length === 0){
  accounts = [
    { name:"Bradesco", initialBalance:0, balance:0, card:false },
    { name:"Banco Inter", initialBalance:0, balance:0, card:false },
    { name:"Mercado Pago", initialBalance:0, balance:0, card:true, type:"fake" },
    { name:"VR", initialBalance:0, balance:0, card:false }
  ];
  DB.set("acc", accounts);
}

// ======================================================
// 🔢 HELPERS
// ======================================================
function money(v){
  return Number(v || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

function formatDateLabel(ts){
  const d = new Date(ts);
  const t = new Date();
  const y = new Date();
  y.setDate(t.getDate()-1);

  if(d.toDateString() === t.toDateString()) return "Hoje";
  if(d.toDateString() === y.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR");
}

// ======================================================
// 📊 STATE CALC
// ======================================================
function computeState(){
  let total=0, inc=0, out=0;

  accounts.forEach(a=>{
    total += (a.initialBalance ?? 0);
  });

  transactions.forEach(t=>{
    if(t.type === "entrada"){
      total += t.value;
      inc += t.value;
    } else {
      if(t.paymentType !== "credito") total -= t.value;
      out += t.value;
    }
  });

  STATE.balance = total;
  STATE.income = inc;
  STATE.outcome = out;
  STATE.realBalance = getRealAvailable();
}

function getRealAvailable(){
  let s = 0;

  accounts.forEach(a=>{
    s += (a.initialBalance ?? 0);
  });

  transactions.forEach(t=>{
    if(t.type === "entrada") s += t.value;
    else if(t.paymentType !== "credito") s -= t.value;
  });

  debts.forEach(d=>{
    if(d.isCard) s -= (d.totalValor || 0);
  });

  return s;
}

// ======================================================
// 🧠 CREDIT LOGIC
// ======================================================
function setLimit(name){
  const acc = accounts.find(a=>a.name===name);
  if(!acc) return;

  const modal = document.createElement("div");
  modal.className = "cdb-modal";

  modal.innerHTML = `
    <div class="cdb-box">
      <h3>Ativar CDB + Limite</h3>
      <input id="cdbValue" type="number" placeholder="Limite" />
      <button id="ok">OK</button>
      <button id="cancel">Cancelar</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#cancel").onclick = () => modal.remove();

  modal.querySelector("#ok").onclick = () => {
    const v = Number(document.getElementById("cdbValue").value);
    if(!v || v<=0) return;

    acc.limit = v;
    acc.used = 0;
    acc.card = true;
    acc.type = "real";

    DB.set("acc", accounts);
    modal.remove();

    renderHome();
    renderTransactions();
  };
}

// ======================================================
// 🏠 HOME
// ======================================================
function updateAccountCache(){
  for(const k in ACCOUNT_CACHE) delete ACCOUNT_CACHE[k];

  accounts.forEach(a=>{
    ACCOUNT_CACHE[a.name] = a.initialBalance ?? 0;
  });

  transactions.forEach(t=>{
    if(!ACCOUNT_CACHE[t.account]) return;
    if(t.type==="entrada") ACCOUNT_CACHE[t.account]+=t.value;
    else if(t.paymentType!=="credito") ACCOUNT_CACHE[t.account]-=t.value;
  });
}

function renderHome(){
  computeState();
  updateAccountCache();

  const balance = document.getElementById("balance");
  const inT = document.getElementById("inTotal");
  const outT = document.getElementById("outTotal");
  const accountsDiv = document.getElementById("accounts");

  if(!accountsDiv) return;

  accountsDiv.innerHTML = "";

  inT.innerText = money(STATE.income);
  outT.innerText = money(STATE.outcome);

  if(hideBalance){
    balance.innerHTML = "R$ •••••";
  } else {
    balance.innerHTML = `${money(STATE.balance)}<br><small>${money(STATE.realBalance)}</small>`;
  }

  accounts.forEach(a=>{
    const saldo = ACCOUNT_CACHE[a.name] || 0;

    accountsDiv.insertAdjacentHTML("beforeend", `
      <div class="card-bank">
        <strong>${a.name}</strong>
        <div>${money(saldo)}</div>

        ${a.name==="Banco Inter" && !a.card ? `
          <button onclick="setLimit('Banco Inter')">Ativar crédito</button>
        ` : ""}

        ${a.card && a.type==="real" ? `
          <small>Limite ${money(a.limit)}</small>
        ` : ""}
      </div>
    `);
  });
}

// ======================================================
// 📊 DASHBOARD
// ======================================================
function renderDashboard(){
  computeState();

  const r = document.getElementById("dashReal");
  const i = document.getElementById("dashTotal");
  const o = document.getElementById("dashOut");

  if(r) r.innerText = money(STATE.realBalance);
  if(i) i.innerText = money(STATE.income);
  if(o) o.innerText = money(STATE.outcome);
}

// ======================================================
// 📜 TRANSACTIONS
// ======================================================
function renderTransactions(){
  const list = document.getElementById("list");
  if(!list) return;

  list.innerHTML = "";

  const sorted = [...transactions].sort((a,b)=>
    (b.customDate||b.date)-(a.customDate||a.date)
  );

  let last="";

  sorted.forEach(t=>{
    const label = formatDateLabel(t.date);

    if(label!==last){
      last=label;
      list.innerHTML += `<li><strong>${label}</strong></li>`;
    }

    list.innerHTML += `
      <li>
        ${t.desc} - ${money(t.value)}
      </li>
    `;
  });
}

// ======================================================
// 🧾 INIT
// ======================================================
function init(){
  renderHome();
  renderTransactions();
  renderDashboard();

  const form = document.getElementById("form");

  if(form){
    form.onsubmit = (e)=>{
      e.preventDefault();

      transactions.push({
        desc: form.desc.value,
        value: Number(form.value.value),
        type: form.type.value,
        account: form.account.value,
        category: form.category.value,
        paymentType: null,
        date: Date.now()
      });

      DB.set("t", transactions);

      form.reset();

      renderHome();
      renderTransactions();
    };
  }
}

document.addEventListener("DOMContentLoaded", init);

// ======================================================
// ⌨️ ESC GLOBAL (ÚNICO)
// ======================================================
document.addEventListener("keydown",(e)=>{
  if(e.key==="Escape"){
    document.querySelector(".cdb-modal")?.remove();
  }
});