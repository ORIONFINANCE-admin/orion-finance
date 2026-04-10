const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let debts = DB.get("debts");

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const inTotal = document.getElementById("inTotal");
const outTotal = document.getElementById("outTotal");
const accountsDiv = document.getElementById("accounts");
const debtList = document.getElementById("debtList");

// 🔄 RESET TOTAL
function resetAll(){
  localStorage.clear();
  location.reload();
}

// 💾 SAVE
function save(){
  DB.set("t",transactions);
  DB.set("debts",debts);
  render();
}

// 🏠 HOME
function renderHome(){

  let total=0, inSum=0, outSum=0;

  transactions.forEach(t=>{
    if(t.type==="entrada"){
      total+=t.value;
      inSum+=t.value;
    } else {
      total-=t.value;
      outSum+=t.value;
    }
  });

  balance.innerText="R$ "+total.toFixed(2);
  inTotal.innerText="R$ "+inSum.toFixed(2);
  outTotal.innerText="R$ "+outSum.toFixed(2);

  accountsDiv.innerHTML="";

  ["VR","Banco Inter","Bradesco","Mercado Pago"].forEach(name=>{
    accountsDiv.innerHTML += `
      <div class="account-card">${name}</div>
    `;
  });
}

// 💸 LISTA
function renderTransactions(){
  list.innerHTML="";
  transactions.forEach(t=>{
    list.innerHTML += `
      <li>
        ${t.desc} - R$ ${t.value}
      </li>
    `;
  });
}

// 📉 DÍVIDAS
function renderDebts(){
  if(!debts) debts=[];
  debtList.innerHTML="";

  debts.forEach(d=>{
    debtList.innerHTML += `<div class="card">${d.name}</div>`;
  });
}

// ➕ ADD
form.onsubmit = e=>{
  e.preventDefault();

  transactions.push({
    desc:desc.value,
    value:Number(value.value),
    type:type.value,
    account:account.value,
    category:category.value
  });

  form.reset();
  save();
};

// TABS
document.querySelectorAll(".tabbar button").forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelectorAll(".tabbar button").forEach(b=>b.classList.remove("active"));

    document.getElementById(btn.dataset.tab).classList.add("active");
    btn.classList.add("active");
    title.innerText = btn.innerText;
  };
});

function render(){
  renderHome();
  renderTransactions();
  renderDebts();
}

render();