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
const form = document.getElementById("form");
const list = document.getElementById("list");
const balance = document.getElementById("balance");
const accountsDiv = document.getElementById("accounts");
const accountSelect = document.getElementById("account");
const categorySelect = document.getElementById("category");
const debtList = document.getElementById("debtList");

// SELECTS
function loadSelects(){
  accountSelect.innerHTML = `<option value="" disabled selected>Conta</option>`;
  categorySelect.innerHTML = `<option value="" disabled selected>Categoria</option>`;

  accounts.forEach(a=>{
    accountSelect.innerHTML += `<option>${a.name}</option>`;
  });

  categories.forEach(c=>{
    categorySelect.innerHTML += `<option>${c}</option>`;
  });
}

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
  desc.focus();
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

  // LISTA UX
  list.innerHTML="";

  transactions.forEach((t,i)=>{

    const li = document.createElement("li");

    li.innerHTML = `
      <div>${t.desc}</div>
      <div class="value ${t.type==='entrada'?'in':'out'}">
        ${t.type==='entrada'?'+':'-'} R$ ${t.value.toFixed(2)}
      </div>
      <small>${t.account} • ${t.category}</small>
      <button class="swipe-delete">🗑</button>
    `;

    let startX=0;

    li.addEventListener("touchstart",e=>{
      startX = e.touches[0].clientX;
    });

    li.addEventListener("touchmove",e=>{
      if(startX - e.touches[0].clientX > 50){
        li.classList.add("swiped");
      }
    });

    li.querySelector(".swipe-delete").onclick=()=>{
      transactions.splice(i,1);
      save();
    };

    list.appendChild(li);
  });

  // DÍVIDAS
  debtList.innerHTML="";

  debts.forEach((d,i)=>{
    const remaining = (d.total - d.paid) * d.value;

    debtList.innerHTML += `
      <li>
        ${d.name}<br>
        Restante: R$ ${remaining.toFixed(2)}<br>
        ${d.paid}/${d.total}
        <button onclick="payDebt(${i})">✔</button>
        <button onclick="undoDebt(${i})">↩</button>
      </li>
    `;
  });
}

// DÍVIDAS
function addDebt(){
  debts.push({
    name:d_name.value,
    value:Number(d_value.value),
    total:Number(d_total.value),
    paid:Number(d_paid.value)
  });

  save();
}

function payDebt(i){
  debts[i].paid++;
  save();
}

function undoDebt(i){
  if(debts[i].paid>0){
    debts[i].paid--;
    save();
  }
}

// CONTAS
function addAccount(){
  accounts.push({
    name:a_name.value,
    color:a_color.value,
    card:a_card.value,
    type:a_type.value
  });

  DB.set("accounts",accounts);
  loadSelects();
  render();
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
loadSelects();
render();