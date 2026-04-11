const DB = {
get: (k) => JSON.parse(localStorage.getItem(k)) || [],
set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

let transactions = DB.get("t");
let accounts = DB.get("acc") || [];
let debts = DB.get("debts") || [];

// ================= ELEMENTOS =================

// HOME
const balance = document.getElementById("balance");
const inTotal = document.getElementById("inTotal");
const outTotal = document.getElementById("outTotal");
const accountsDiv = document.getElementById("accounts");

// FORM
const form = document.getElementById("form");
const desc = document.getElementById("desc");
const value = document.getElementById("value");
const type = document.getElementById("type");
const account = document.getElementById("account");
const category = document.getElementById("category");
const list = document.getElementById("list");

// DÍVIDAS
const debtList = document.getElementById("debtList");

// MODAL
const modal = document.getElementById("modal");
const hasCard = document.getElementById("hasCard");
const cardFields = document.getElementById("cardFields");
const fab = document.querySelector(".fab");
const useCard = document.getElementById("useCard");
const paymentType = document.getElementById("paymentType");

// ================= FORMAT =================

function money(v){
return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
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
if(useCard.checked){
paymentType.style.display = "block";
}else{
paymentType.style.display = "none";
}
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
limit: 0,
used: 0,
});

DB.set("acc",accounts);

// 🔥 LIMPAR MODAL
acc_balance.value = "";
card_final.value = "";
hasCard.checked = false;
cardFields.style.display = "none";

closeModal();
renderHome();
}

// ================= HOME =================

function renderHome(){

let total=0, inS=0, outS=0;

// 🔥 SOMAR SALDO INICIAL
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

accountsDiv.innerHTML="";

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

let creditUsed = 0;

transactions.forEach(t=>{
if(t.account === a.name && t.isCredit){
creditUsed += t.value;
}
});

let color="mp";
if(a.name.includes("Bradesco")) color="bradesco";
if(a.name.includes("Inter")) color="inter";
if(a.name.includes("VR")) color="vr";

accountsDiv.innerHTML+=`

  <div class="card-bank ${color}">
    <strong>${a.name}</strong><br>
    ${money(saldo)}<br>
    ${a.card ? a.type+" • **** "+a.final : ""}
    ${creditUsed > 0 ? "<br>Fatura: " + money(creditUsed) : ""}
  </div>
`;

});
}

// ================= TRANSAÇÕES =================

function renderTransactions(){
list.innerHTML = "";

if(transactions.length === 0){
list.innerHTML = "<li style='opacity:.5'>Nenhuma transação</li>";
return;
}

transactions.forEach(t => {

const li = document.createElement("li");

const color = t.type === "entrada" ? "#22c55e" : "#ef4444";

li.innerHTML = `
  <div style="display:flex; justify-content:space-between;">
    <span>${t.desc} <small style="opacity:.6">(${t.account || "Sem conta"})</small></span>
    <strong style="color:${color}">
      ${t.type === "saida" ? "-" : "+"} ${money(t.value)}
    </strong>
  </div>
`;

list.appendChild(li);

});
}

form.onsubmit = e => {
e.preventDefault();

transactions.push({
desc: desc.value,
value: Number(value.value),
type: type.value,
account: account.value,
category: category.value,
paymentType: useCard.checked ? paymentType.value : null,
isCredit: useCard.checked && paymentType.value === "credito"
});

DB.set("t", transactions);
form.reset();

useCard.checked = false;
paymentType.style.display = "none";

renderHome();
renderTransactions();
};

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
    console.log("Tabs não encontradas");
    return;
  }

  tabs.forEach(btn=>{
    btn.addEventListener("click", function(){

      tabs.forEach(b=>b.classList.remove("active"));
      this.classList.add("active");

      screens.forEach(s=>s.classList.remove("active"));

      const target = this.dataset.tab;
      const el = document.getElementById(target);

      if(!el){
        console.log("Tela não encontrada:", target);
        return;
      }

      el.classList.add("active");

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

window.addEventListener("error", function(e){
  console.log("ERRO DETECTADO:", e.message);
});

// INIT
renderHome();
renderTransactions();
renderDebts();