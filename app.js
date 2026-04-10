const DB = {
  get:k=>JSON.parse(localStorage.getItem(k))||[],
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("transactions");
let debts = DB.get("debts");

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
  DB.set("transactions",transactions);
  DB.set("debts",debts);
  renderAll();
}

// HOME
function renderHome(){

  let total=0,inSum=0,outSum=0;

  transactions.forEach(t=>{
    if(t.type==="entrada"){
      total+=t.value;
      inSum+=t.value;
    }else{
      total-=t.value;
      outSum+=t.value;
    }
  });

  balance.innerText="R$ "+total.toFixed(2);
  inTotal.innerText="R$ "+inSum.toFixed(2);
  outTotal.innerText="R$ "+outSum.toFixed(2);

  accountsDiv.innerHTML="";

  const banks=[
    {name:"Bradesco",class:"bradesco"},
    {name:"Banco Inter",class:"inter"},
    {name:"Mercado Pago",class:"mp"},
    {name:"VR",class:"vr"}
  ];

  banks.forEach(b=>{
    accountsDiv.innerHTML+=`
      <div class="card-bank ${b.class}">
        <strong>${b.name}</strong><br>
        R$ 0.00
      </div>
    `;
  });
}

// TRANSAÇÕES
function renderTransactions(){
  list.innerHTML="";

  transactions.forEach(t=>{
    list.innerHTML+=`
      <li>
        ${t.desc}<br>
        R$ ${t.value}
      </li>
    `;
  });
}

// FORM
document.getElementById("form").onsubmit=e=>{
  e.preventDefault();

  const desc=document.getElementById("desc").value;
  const value=Number(document.getElementById("value").value);
  const type=document.getElementById("type").value;
  const account=document.getElementById("account").value;
  const category=document.getElementById("category").value;

  transactions.push({desc,value,type,account,category});

  e.target.reset();
  save();
};

// DÍVIDAS
function addDebt(){
  debts.push({
    name:d_name.value,
    parcela:Number(d_parcela.value),
    total:Number(d_total.value),
    qtd:Number(d_qtd.value),
    pago:Number(d_pago.value)
  });
  save();
}

function renderDebts(){
  debtList.innerHTML="";

  debts.forEach(d=>{
    let restante = d.total - (d.parcela * d.pago);

    debtList.innerHTML+=`
      <div class="card">
        ${d.name}<br>
        Restante: R$ ${restante.toFixed(2)}
      </div>
    `;
  });
}

// TABS (NÃO QUEBRA MAIS)
document.querySelectorAll(".tabbar button").forEach(btn=>{
  btn.onclick=()=>{

    document.querySelectorAll(".tabbar button")
      .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    document.querySelectorAll(".screen")
      .forEach(s=>s.classList.remove("active"));

    document.getElementById(btn.dataset.tab)
      .classList.add("active");

    document.getElementById("title").innerText =
      btn.innerText;
  };
});

// INIT
function renderAll(){
  renderHome();
  renderTransactions();
  renderDebts();
}

renderAll();