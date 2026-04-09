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

// ADD ACCOUNT
function addAccount(){

  accounts.push({
    name:a_name.value,
    color:a_color.value,
    card:a_card.value,
    type:a_type.value
  });

  DB.set("accounts", accounts);
  loadSelects();
  render();
}

// ADD DEBT
function addDebt(){
  debts.push({
    name:d_name.value,
    value:Number(d_value.value),
    total:Number(d_total.value),
    paid:Number(d_paid.value)
  });

  save();
}

// PAGAR
function payDebt(i){
  debts[i].paid++;
  save();
}

// DESFAZER
function undoDebt(i){
  if(debts[i].paid > 0){
    debts[i].paid--;
    save();
  }
}

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
        <div>${acc.name}</div>
        <div>R$ ${sum.toFixed(2)}</div>
        <div>${acc.type} • **** ${acc.card}</div>
      </div>
    `;
  });

  // LISTA
  list.innerHTML="";
  transactions.forEach(t=>{
    list.innerHTML += `
      <li>
        ${t.desc} (${t.category})<br>
        ${t.account} - R$ ${t.value}
      </li>
    `;
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
        <button class="small-btn" onclick="payDebt(${i})">✔</button>
        <button class="small-btn" onclick="undoDebt(${i})">↩</button>
      </li>
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
loadSelects();
render();