const DB = {
  get:k=>JSON.parse(localStorage.getItem(k))||[],
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let debts = DB.get("d");

// ELEMENTOS
const balance = document.getElementById("balance");
const inTotal = document.getElementById("inTotal");
const outTotal = document.getElementById("outTotal");
const list = document.getElementById("list");
const accountsDiv = document.getElementById("accounts");
const debtList = document.getElementById("debtList");

// RESET
function resetAll(){
  localStorage.clear();
  location.reload();
}

// SAVE
function save(){
  DB.set("t",transactions);
  DB.set("d",debts);
  renderActive();
}

// HOME
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

  balance.innerText="R$ "+total.toFixed(2);
  inTotal.innerText=inS.toFixed(2);
  outTotal.innerText=outS.toFixed(2);

  accountsDiv.innerHTML="";

  [
    {n:"Bradesco",c:"bradesco"},
    {n:"Inter",c:"inter"},
    {n:"Mercado Pago",c:"mp"},
    {n:"VR",c:"vr"}
  ].forEach(b=>{
    accountsDiv.innerHTML+=`
      <div class="card-bank ${b.c}">
        ${b.n}<br>R$ 0.00
      </div>
    `;
  });
}

// TRANSAÇÕES
function renderTransactions(){
  list.innerHTML="";
  transactions.forEach(t=>{
    list.innerHTML+=`<li>${t.desc} - R$ ${t.value}</li>`;
  });
}

// DÍVIDAS
function addDebt(){
  debts.push({
    name:d_name.value
  });
  save();
}

function renderDebts(){
  debtList.innerHTML="";
  debts.forEach(d=>{
    debtList.innerHTML+=`<div class="card">${d.name}</div>`;
  });
}

// 🔥 RENDER POR ABA (ESSENCIAL)
function renderActive(){

  const active = document.querySelector(".screen.active").id;

  if(active==="home") renderHome();
  if(active==="transactions") renderTransactions();
  if(active==="debts") renderDebts();

}

// FORM
form.onsubmit=e=>{
  e.preventDefault();

  transactions.push({
    desc:desc.value,
    value:Number(value.value),
    type:type.value
  });

  form.reset();
  save();
};

// TABS
document.querySelectorAll(".tabbar button").forEach(btn=>{
  btn.onclick=()=>{

    document.querySelectorAll(".tabbar button")
      .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    document.querySelectorAll(".screen")
      .forEach(s=>s.classList.remove("active"));

    document.getElementById(btn.dataset.tab)
      .classList.add("active");

    title.innerText = btn.innerText;

    renderActive(); // 🔥 CHAVE DO SUCESSO
  };
});

// INIT
renderActive();