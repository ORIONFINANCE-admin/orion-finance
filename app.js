const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let debts = DB.get("debts");
let accounts = DB.get("accounts");

if(!accounts) accounts = [];

const title = document.getElementById("title");
const balance = document.getElementById("balance");
const accountsDiv = document.getElementById("accounts");
const list = document.getElementById("list");

// ADD TRANSACTION
form.onsubmit = e=>{
  e.preventDefault();

  transactions.unshift({
    desc:desc.value,
    value:Number(value.value),
    type:type.value,
    account:account.value,
    category:category.value
  });

  form.reset();
  save();
};

// SAVE
function save(){
  DB.set("t",transactions);
  DB.set("debts",debts);
  render();
}

// RENDER
function render(){

  let total=0;

  transactions.forEach(t=>{
    total += t.type==="entrada"?t.value:-t.value;
  });

  balance.innerText="R$ "+total.toFixed(2);

  // CONTAS
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
        ${acc.name}<br>
        R$ ${sum.toFixed(2)}
      </div>
    `;
  });

  // LISTA
  list.innerHTML="";

  transactions.forEach(t=>{
    list.innerHTML += `
      <li>
        ${t.desc}<br>
        R$ ${t.value.toFixed(2)}<br>
        <small>${t.account} • ${t.category}</small>
      </li>
    `;
  });

}

// TABS
const names = {
  home:"Home",
  transactions:"Lançamentos",
  debts:"Dívidas",
  accountsScreen:"Contas"
};

document.querySelectorAll(".tabbar button").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelectorAll(".tabbar button").forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    const tab = btn.dataset.tab;
    document.getElementById(tab).classList.add("active");

    title.innerText = names[tab];
  };
});

// INIT
render();