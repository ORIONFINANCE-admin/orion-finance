const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let debts = DB.get("debts");
let accounts = DB.get("accounts");

if(!accounts) accounts = [];

const categories = ["Salário","Alimentação","Transporte","Lazer","Outros"];

// ELEMENTOS
const balance = document.getElementById("balance");
const accountsDiv = document.getElementById("accounts");

// RENDER
function render(){

  let total=0;

  transactions.forEach(t=>{
    total += t.type==="entrada"?t.value:-t.value;
  });

  balance.innerText="R$ "+total.toFixed(2);

  // CONTAS UX
  accountsDiv.innerHTML="";

  accounts.forEach(acc=>{
    let sum=0;

    transactions.forEach(t=>{
      if(t.account===acc.name){
        sum += t.type==="entrada"?t.value:-t.value;
      }
    });

    accountsDiv.innerHTML += `
      <div class="account-card" style="background:${acc.color}">
        <div class="account-name">${acc.name}</div>
        <div class="account-balance">R$ ${sum.toFixed(2)}</div>
        <div class="account-meta">${acc.type} • **** ${acc.card}</div>
      </div>
    `;
  });

}

// TABS
document.querySelectorAll(".tabbar button").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelectorAll(".tabbar button").forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

// INIT
render();