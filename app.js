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

const modal = document.getElementById("modal");
const hasCard = document.getElementById("hasCard");
const cardFields = document.getElementById("cardFields");
const fab = document.querySelector(".fab");
const useCard = document.getElementById("useCard");
const paymentType = document.getElementById("paymentType");
const card_limit = document.getElementById("card_limit");

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

function openModal(){
modal.classList.add("active");
}

function closeModal(){
modal.classList.remove("active");
}

modal.addEventListener("click",(e)=>{
if(e.target === modal) closeModal();
});

hasCard.addEventListener("change",()=>{
cardFields.style.display = hasCard.checked ? "block":"none";
});

function updateCardUI(){
paymentType.style.display = useCard.checked ? "block" : "none";
}

useCard.addEventListener("change", updateCardUI);

// ================= CONTAS =================

function saveAccount(){

const name = acc_name.value;
const balanceValue = Number(acc_balance.value);

if(!balanceValue || balanceValue <= 0){
alert("Saldo inválido");
return;
}

accounts.push({
name,
initialBalance: balanceValue,
balance: balanceValue,
card:hasCard.checked,
final:card_final.value,
type:card_type.value,
limit: Number(card_limit.value) || 0,
used: 0,
});

DB.set("acc",accounts);

// LIMPAR
acc_balance.value = "";
card_final.value = "";
card_limit.value = "";
hasCard.checked = false;
cardFields.style.display = "none";

closeModal();
renderHome();
}

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
}else{
if(t.paymentType !== "credito" || !t.paymentType){
total-=t.value;
}
outS+=t.value;
}
});

balance.innerText = money(total);
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
else{
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
    <strong>${a.name}</strong><br>
    ${money(saldo)}<br>
    ${a.card ? a.type+" • **** "+a.final : ""}
    ${a.limit > 0 ? `
  <br>Limite: ${money(a.limit)}
  <br>Disponível: ${money(a.limit - (a.used || 0))}
` : ""}
  </div>
`;
});

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

const isCredit = useCard.checked && paymentType.value === "credito";

transactions.push({
  desc: desc.value,
  value: Number(value.value),
  type: type.value,
  account: account.value,
  category: category.value,
  paymentType: useCard.checked ? paymentType.value : null,
  isCredit,
  date: Date.now(),
  customDate: null
});

// 💳 ATUALIZA LIMITE DO CARTÃO
if(isCredit){
  const acc = accounts.find(a => a.name === account.value);

  if(acc && acc.limit){
    acc.used = (acc.used || 0) + Number(value.value);

    // 💳 CRIA "DÍVIDA DE CARTÃO"
    debts.push({
      name: "Fatura " + acc.name,
      valor: Number(value.value),
      totalValor: Number(value.value),
      pago: 0,
      isCard: true,
      account: acc.name
    });

    DB.set("debts", debts);
    DB.set("acc", accounts);
  }
}

DB.set("t", transactions);
form.reset();

useCard.checked = false;
paymentType.style.display = "none";

renderHome();
renderTransactions();
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

const totalParcelas = Math.ceil(d.totalValor / d.valor);
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
if(target==="accountsScreen") title.innerText="Contas";

fab.style.display = target==="transactions" ? "block":"none";

});
});
}

if(document.readyState === "loading"){
document.addEventListener("DOMContentLoaded", initTabs);
}else{
initTabs();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
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

// INIT
renderHome();
renderTransactions();
renderDebts();
loadCategories();