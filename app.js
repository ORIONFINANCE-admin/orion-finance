const DB = {
  get: (k) => JSON.parse(localStorage.getItem(k)) || [],
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

let transactions = DB.get("t");
let accounts = DB.get("acc") || [];

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

// MODAL
const modal = document.getElementById("modal");
const hasCard = document.getElementById("hasCard");
const cardFields = document.getElementById("cardFields");
const fab = document.querySelector(".fab");

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
    balance:balanceValue,
    card:hasCard.checked,
    final:card_final.value,
    type:card_type.value
  });

  DB.set("acc",accounts);

  closeModal();
  renderHome();
}

// ================= HOME =================

function renderHome(){

  let total=0, inS=0, outS=0;

  transactions.forEach(t=>{
    if(t.type==="entrada"){
      total+=t.value;
      inS+=t.value;
    }else{
      total-=t.value;
      outS+=t.value;
    }
  });

  balance.innerText = money(total);
  inTotal.innerText = money(inS);
  outTotal.innerText = money(outS);

  accountsDiv.innerHTML="";

  const valid = accounts.filter(a=>a.balance>0);

  if(valid.length===0){
    accountsDiv.innerHTML="<p style='opacity:.5'>Nenhuma conta</p>";
    return;
  }

  valid.forEach(a=>{

    let color="mp";
    if(a.name.includes("Bradesco")) color="bradesco";
    if(a.name.includes("Inter")) color="inter";
    if(a.name.includes("VR")) color="vr";

    accountsDiv.innerHTML+=`
      <div class="card-bank ${color}">
        <strong>${a.name}</strong><br>
        ${money(a.balance)}<br>
        ${a.card ? a.type+" • **** "+a.final : ""}
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
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>${t.desc}</span>
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
    type: type.value
  });

  DB.set("t", transactions);
  form.reset();

  renderHome();
  renderTransactions();
};

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

const tabs = document.querySelectorAll(".tabbar button");
const screens = document.querySelectorAll(".screen");
const title = document.getElementById("title");

tabs.forEach(btn=>{
  btn.onclick=()=>{

    tabs.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    screens.forEach(s=>s.classList.remove("active"));

    const target = btn.dataset.tab;
    document.getElementById(target).classList.add("active");

    if(target==="home") title.innerText="Home";
    if(target==="transactions") title.innerText="Lançamentos";
    if(target==="debts") title.innerText="Dívidas";
    if(target==="accountsScreen") title.innerText="Contas";

    fab.style.display = target==="transactions" ? "block":"none";
  };
});

// INIT
renderHome();
renderTransactions();