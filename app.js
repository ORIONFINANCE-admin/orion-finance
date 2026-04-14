const DB = {
get: (k) => JSON.parse(localStorage.getItem(k)) || [],
set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

let transactions = DB.get("t");
let accounts = DB.get("acc") || [];
let debts = DB.get("debts") || [];
const categories = [
  "Salário",
  "Mercado",
  "Investimentos",
  "Rendimentos",
  "Moradia",
  "Aluguel",
  "Internet",
  "Saúde",
  "Transporte",
  "Lazer",
  "Educação",
  "Outros"
];

// ================= MIGRAÇÃO =================

function migrateData(){

let changed = false;

// ACCOUNTS
accounts = accounts.map(acc => {

  if(acc.initialBalance === undefined){
    acc.initialBalance = acc.balance ?? 0;
    changed = true;
  }

  if(acc.limit === undefined){
    acc.limit = 0;
    changed = true;
  }

  if(acc.used === undefined){
    acc.used = 0;
    changed = true;
  }

  return acc;
});

// TRANSACTIONS
transactions = transactions.map(t => {

  if(t.account === undefined){
    t.account = "Sem conta";
    changed = true;
  }

  if(t.category === undefined){
    t.category = "Outros";
    changed = true;
  }

  if(t.paymentType === undefined){
    t.paymentType = null;
    changed = true;
  }

  if(t.isCredit === undefined){
    t.isCredit = false;
    changed = true;
  }

  // 🔥 NOVO: DATA
  if(t.date === undefined){
    t.date = Date.now();
    changed = true;
  }

  if(t.customDate === undefined){
    t.customDate = null;
    changed = true;
  }

  return t;
});

if(changed){
  DB.set("acc", accounts);
  DB.set("t", transactions);
}

}

migrateData();

// ================= CONTAS FIXAS =================

if(accounts.length === 0){
  accounts = [
  {
    name: "Bradesco",
    initialBalance: 0,
    balance: 0,
    card: false
  },
  {
    name: "Banco Inter",
    initialBalance: 0,
    balance: 0,
    card: false // 👈 começa SEM crédito
  },
  {
    name: "Mercado Pago",
    initialBalance: 0,
    balance: 0,
    card: true,
    type: "fake" // 👈 AQUI
  },
  {
    name: "VR",
    initialBalance: 0,
    balance: 0,
    card: false
  }
];

  DB.set("acc", accounts);
}

// ================= ELEMENTOS =================

const balance = document.getElementById("balance");
const inTotal = document.getElementById("inTotal");
const outTotal = document.getElementById("outTotal");
const accountsDiv = document.getElementById("accounts");

const form = document.getElementById("form");
const desc = document.getElementById("desc");
const value = document.getElementById("value");
const type = document.getElementById("type");
const account = document.getElementById("account");
const category = document.getElementById("category");
const list = document.getElementById("list");

const searchInput = document.getElementById("searchInput");

const debtList = document.getElementById("debtList");

const useCard = document.getElementById("useCard");
const paymentType = document.getElementById("paymentType");

const hasCard = document.getElementById("hasCard");
const cardFields = document.getElementById("cardFields");

function safe(el){
  return el !== null && el !== undefined;
}

const transactionView = document.getElementById("transactionView");
const extractView = document.getElementById("extractView");

// ================= FORMAT =================

function money(v){
return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

// ================= DATA FORMAT =================

function formatDateLabel(timestamp){

const d = new Date(timestamp);
const today = new Date();
const yesterday = new Date();

yesterday.setDate(today.getDate() - 1);

if(d.toDateString() === today.toDateString()){
return "Hoje";
}

if(d.toDateString() === yesterday.toDateString()){
return "Ontem";
}

return d.toLocaleDateString("pt-BR");
}

// ================= MODAL =================

// hasCard.addEventListener("change",()=>{
// cardFields.style.display = hasCard.checked ? "block":"none";
// });

function updateCardUI(){

  if(!useCard.checked){
    paymentType.style.display = "none";
    paymentType.innerHTML = "";
    return;
  }

  const acc = accounts.find(a => a.name === account.value);

  paymentType.style.display = "block";

  // 🔴 Se não tem crédito ativo
  if(!acc || !acc.card || acc.type !== "real"){
    paymentType.innerHTML = `
      <div class="card-alert">
        <span>⚠️ Sem crédito ativo</span>
        <button onclick="setLimit('${account.value}')">
          Ativar crédito
        </button>
      </div>
    `;
    return;
  }

  // 🟢 Se tem crédito
  paymentType.innerHTML = `
    <div class="card-select">
      <label>Forma de pagamento</label>
      <select id="paymentTypeSelect">
        <option value="credito">Cartão de crédito</option>
      </select>

      <small>
        Limite: ${money(acc.limit)} |
        Disponível: ${money(acc.limit - (acc.used || 0))}
      </small>
    </div>
  `;
}

useCard.addEventListener("change", updateCardUI);

// ================= CONTAS =================

function payInvoice(accountName, amount){

  const acc = accounts.find(a => a.name === accountName);
  if(!acc) return;

  const value = Number(amount);

  if(value <= 0) return;

  acc.used = Math.max(0, (acc.used || 0) - value);

  transactions.push({
    desc: "Pagamento de fatura",
    value: value,
    type: "saida",
    account: accountName,
    category: "Cartão de crédito",
    paymentType: null,
    isCredit: false,
    date: Date.now(),
    customDate: null
  });

  DB.set("acc", accounts);
  DB.set("t", transactions);

  renderHome();
  renderTransactions();
}

function setLimit(accountName){

  const acc = accounts.find(a => a.name === accountName);
  if(!acc) return;

  const novoLimite = Number(prompt("Valor do CDB (limite):"));

  if(isNaN(novoLimite) || novoLimite <= 0) return;

  acc.limit = novoLimite;
  acc.used = 0;
  acc.card = true;
  acc.type = "real";

  DB.set("acc", accounts);
  renderHome();
}

function getRealAvailable(){

  let saldo = 0;

  // saldo das contas
  accounts.forEach(a=>{
    saldo += (a.initialBalance ?? a.balance ?? 0);
  });

  // transações
  transactions.forEach(t=>{
    if(t.type === "entrada"){
      saldo += t.value;
    } else {
      if(t.paymentType !== "credito" || !t.paymentType){
        saldo -= t.value;
      }
    }
  });

  // 🔻 desconta faturas (dívidas de cartão)
  debts.forEach(d=>{
    if(d.isCard){
      saldo -= (d.totalValor || 0);
    }
  });

  return saldo;
}

function removeCredit(accountName){

  const acc = accounts.find(a => a.name === accountName);
  if(!acc) return;

  if(!confirm("Remover crédito desta conta?")) return;

  acc.card = false;
  acc.limit = 0;
  acc.used = 0;
  acc.type = null;

  DB.set("acc", accounts);
  renderHome();
}

// ================= HOME =================

function renderHome(){

  accountsDiv.innerHTML = "";

  let total=0, inS=0, outS=0;

  accounts.forEach(a=>{
    total += (a.initialBalance ?? a.balance ?? 0);
  });

  transactions.forEach(t=>{
    if(t.type==="entrada"){
      total+=t.value;
      inS+=t.value;
    } else {
      if(t.paymentType !== "credito" || !t.paymentType){
        total-=t.value;
      }
      outS+=t.value;
    }
  });

  const real = getRealAvailable();

    balance.innerHTML = `
      ${money(total)}
      <div style="font-size:12px; opacity:0.6;">
        Real: ${money(real)}
      </div>
    `;
    
  inTotal.innerText = money(inS);
  outTotal.innerText = money(outS);

  if(accounts.length===0){
    accountsDiv.innerHTML="<p style='opacity:.5'>Nenhuma conta</p>";
    return;
  }

  accounts.forEach(a=>{

    let saldo = a.initialBalance ?? a.balance ?? 0;

    transactions.forEach(t=>{
      if(t.account === a.name){
        if(t.type === "entrada") saldo += t.value;
        else {
          if(t.paymentType !== "credito" || !t.paymentType){
            saldo -= t.value;
          }
        }
      }
    });

    let color="mp";
    if(a.name.includes("Bradesco")) color="bradesco";
    if(a.name.includes("Inter")) color="inter";
    if(a.name.includes("VR")) color="vr";

    accountsDiv.insertAdjacentHTML("beforeend", `
  <div class="card-bank ${color}">
    
    <div class="card-header">
      <strong>${a.name}</strong>
      <span>${money(saldo)}</span>
    </div>

    <div class="card-body">

      ${a.name === "Banco Inter" && !a.card ? `
        <button onclick="setLimit('Banco Inter')" class="btn">
          Ativar crédito
        </button>
      ` : ""}

      ${a.card && a.type === "real" ? `
        <div class="credit-info">
          <span>Limite: ${money(a.limit)}</span>
          <span>Disp: ${money(a.limit - (a.used || 0))}</span>
        </div>

        <div class="card-actions">
          <button onclick="setLimit('${a.name}')" class="btn small">
            Alterar
          </button>
          <button onclick="removeCredit('${a.name}')" class="btn danger small">
            Remover
          </button>
        </div>
      ` : ""}

    </div>

  </div>
`);
  });
}

function renderDashboard(){

  const total = transactions.reduce((acc, t)=>{
    if(t.type === "entrada") return acc + t.value;
    return acc;
  }, 0);

  const out = transactions.reduce((acc, t)=>{
    if(t.type === "saida") return acc + t.value;
    return acc;
  }, 0);

  const real = getRealAvailable();

  const elReal = document.getElementById("dashReal");
  const elTotal = document.getElementById("dashTotal");
  const elOut = document.getElementById("dashOut");

  if(elReal) elReal.innerText = money(real);
  if(elTotal) elTotal.innerText = money(total);
  if(elOut) elOut.innerText = money(out);
}

// ================= TRANSAÇÕES AGRUPADAS =================

function renderTransactions(){

list.innerHTML = "";

if(transactions.length === 0){
list.innerHTML = "<li style='opacity:.5'>Nenhuma transação</li>";
return;
}

// 🔥 ordenar por data (mais recente)
const sorted = [...transactions].sort((a,b)=>{
const da = a.customDate || a.date;
const db = b.customDate || b.date;
return db - da;
});

let currentLabel = "";

sorted.forEach(t => {

const date = t.customDate || t.date;
const label = formatDateLabel(date);

// 🔹 grupo
if(label !== currentLabel){
currentLabel = label;

const header = document.createElement("li");
header.innerHTML = `<strong style="opacity:.6;">${label}</strong>`;
list.appendChild(header);
}

// 🔹 item
const li = document.createElement("li");

const color = t.type === "entrada" ? "#22c55e" : "#ef4444";

li.innerHTML = `
  <div style="display:flex; justify-content:space-between;">
    <span>
      ${t.desc}
      <br>
      <small style="opacity:.6;">
        ${t.category} • ${t.account || "Sem conta"}
      </small>
    </span>
    <strong style="color:${color}">
      ${t.type === "saida" ? "-" : "+"} ${money(t.value)}
    </strong>
  </div>
`;

list.appendChild(li);

});

}

// ================= BUSCA =================

function filterTransactions(query){

const q = query.toLowerCase();

const filtered = transactions.filter(t=>{
return (
(t.desc && t.desc.toLowerCase().includes(q)) ||
(t.account && t.account.toLowerCase().includes(q)) ||
(t.category && t.category.toLowerCase().includes(q))
);
});

renderFilteredTransactions(filtered);
}

function renderFilteredTransactions(data){

list.innerHTML = "";

data.forEach(t => {

const li = document.createElement("li");

li.innerHTML = `
  ${t.desc} - ${money(t.value)}
`;

list.appendChild(li);

});
}

if(searchInput){
searchInput.addEventListener("input", function(){
if(this.value.trim() === ""){
renderTransactions();
}else{
filterTransactions(this.value);
}
});
}

// ================= SUBMIT =================

form.onsubmit = e => {
  e.preventDefault();

  const acc = accounts.find(a => a.name === account.value);

const isRealCredit = (
  useCard.checked &&
  document.getElementById("paymentTypeSelect")?.value === "credito" &&
  acc &&
  acc.card === true &&
  acc.type === "real"
);

  if(isRealCredit){
    const acc = accounts.find(a => a.name === account.value);

    if(acc && acc.limit){
      acc.used = (acc.used || 0) + Number(value.value);

      let fatura = debts.find(d => d.isCard && d.account === acc.name);

      if(fatura){
        fatura.totalValor += Number(value.value);
      } else {
        debts.push({
          name: "Fatura " + acc.name,
          valor: 0,
          totalValor: Number(value.value),
          pago: 0,
          isCard: true,
          account: acc.name
        });
      }

      DB.set("debts", debts);
      DB.set("acc", accounts);
    }
  }

transactions.push({
  desc: desc.value,
  value: Number(value.value),
  type: type.value,
  account: account.value,
  category: category.value,
  paymentType: useCard.checked ? "credito" : null,
  isCredit: useCard.checked,
  date: Date.now(),
  customDate: null
});

  DB.set("t", transactions);
  form.reset();

  useCard.checked = false;
  paymentType.style.display = "none";

  requestAnimationFrame(() => {
    renderHome();
    renderTransactions();
  });
};

// ================= EXTRATO =================

function showExtract(){
if(transactionView && extractView){
transactionView.style.display = "none";
extractView.style.display = "block";
renderTransactions();
}
}

function hideExtract(){
if(transactionView && extractView){
extractView.style.display = "none";
transactionView.style.display = "block";
}
}

// ================= DÍVIDAS =================

function addDebt(){

const name = d_name.value;
const valor = Number(d_valor.value);
const totalValor = Number(d_total.value);
const pago = Number(d_pago.value);

if(!name || !valor || !totalValor){
alert("Preencha os campos corretamente");
return;
}

debts.push({ name, valor, totalValor, pago });

DB.set("debts", debts);
renderDebts();
}

function renderDebts(){

debtList.innerHTML = "";

if(debts.length === 0){
debtList.innerHTML = "<p style='opacity:.5'>Nenhuma dívida</p>";
return;
}

debts.forEach((d, i)=>{

const totalParcelas = d.valor > 0
  ? Math.ceil(d.totalValor / d.valor)
  : 1;
const restante = totalParcelas - d.pago;

debtList.innerHTML += `
  <div class="card">
    <strong>${d.name}</strong><br>
    Parcela: ${money(d.valor)}<br>
    Progresso: ${d.pago}/${totalParcelas}<br>
    Restam: ${restante} parcelas

    <div style="display:flex; gap:6px; margin-top:8px;">
  <button onclick="payDebt(${i})">Pagar fatura</button>
  <button onclick="payInstallment(${i})">+1</button>
  <button onclick="undoInstallment(${i})" style="background:#374151;color:#fff;">Desfazer</button>
</div>

  </div>
`;
});

}

function payInstallment(i){
const totalParcelas = Math.ceil(debts[i].totalValor / debts[i].valor);

if(debts[i].pago < totalParcelas){
debts[i].pago++;
DB.set("debts", debts);
renderDebts();
}
}

function undoInstallment(i){
if(debts[i].pago > 0){
debts[i].pago--;
DB.set("debts", debts);
renderDebts();
}
}

function payDebt(i){

  const d = debts[i];
  if(!d) return;

  const acc = accounts.find(a => a.name === d.account);

  if(acc){
    acc.used = Math.max(0, (acc.used || 0) - d.valor);
  }

  debts.splice(i, 1);

  DB.set("debts", debts);
  DB.set("acc", accounts);

  renderDebts();
  renderHome();
}

// ================= BACKUP =================

function exportData(){
const data = JSON.stringify(localStorage);
const blob = new Blob([data],{type:"application/json"});
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = "orion-backup.json";
a.click();
}

function importData(e){
const file = e.target.files[0];
const reader = new FileReader();

reader.onload = ()=>{
const data = JSON.parse(reader.result);
Object.keys(data).forEach(k=>{
localStorage.setItem(k,data[k]);
});
location.reload();
};

reader.readAsText(file);
}

// ================= RESET =================

function resetAll(){
if(confirm("Apagar tudo?")){
localStorage.clear();
location.reload();
}
}

// ================= TABS =================

function initTabs(){

const tabs = document.querySelectorAll(".tabbar button");
const screens = document.querySelectorAll(".screen");
const title = document.getElementById("title");

if(!tabs || tabs.length === 0){
return;
}

tabs.forEach(btn=>{
btn.addEventListener("click", function(){

tabs.forEach(b=>b.classList.remove("active"));
this.classList.add("active");

screens.forEach(s=>s.classList.remove("active"));

const target = this.dataset.tab;
const el = document.getElementById(target);

if(el) el.classList.add("active");

if(target==="home") title.innerText="Home";
if(target==="transactions") title.innerText="Lançamentos";
if(target==="debts"){
title.innerText="Dívidas";
renderDebts();
}

if(target==="dashboard"){
  title.innerText="Dashboard";
  renderDashboard();
}

});
});
}

if(document.readyState === "loading"){
document.addEventListener("DOMContentLoaded", initTabs);
}else{
initTabs();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('SW registrado'))
    .catch(err => console.log('SW erro', err));
}

function loadCategories(){
  const select = document.getElementById("category");
  if(!select) return;

  select.innerHTML = "";

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

const settingsModal = document.getElementById("settingsModal");

function openSettings(){
  if(settingsModal) settingsModal.classList.add("active");
}

function closeSettings(){
  if(settingsModal) settingsModal.classList.remove("active");
}

if(settingsModal){
  settingsModal.addEventListener("click", (e)=>{
    if(e.target === settingsModal){
      closeSettings();
    }
  });
}
if(settingsModal){
  settingsModal.addEventListener("click", (e)=>{
    if(e.target === settingsModal){
      closeSettings();
    }
  });
}

// INIT
renderHome();
renderTransactions();
renderDebts();
loadCategories();