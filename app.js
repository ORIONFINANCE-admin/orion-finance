const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let debts = DB.get("debts") || [];

let editIndex = null;

// 🔥 ELEMENTOS (SEGURANÇA)
const list = document.getElementById("list");
const balance = document.getElementById("balance");
const accountsDiv = document.getElementById("accounts");
const inTotal = document.getElementById("inTotal");
const outTotal = document.getElementById("outTotal");
const submitBtn = document.getElementById("submitBtn");
const debtList = document.getElementById("debtList");

// 🎨 CORES
const colors = {
  "Bradesco":"#cc092f",
  "Banco Inter":"#ff7a00",
  "Mercado Pago":"#00b1ea",
  "VR":"#7c3aed"
};

//////////////////////////////////////////////////
// 🔥 TRANSAÇÕES
//////////////////////////////////////////////////

if (document.getElementById("form")) {

  form.onsubmit = e=>{
    e.preventDefault();

    const data = {
      desc:desc.value,
      value:Number(value.value),
      type:type.value,
      account:account.value,
      category:category.value
    };

    if(editIndex !== null){
      transactions[editIndex] = data;
      editIndex = null;
      submitBtn.innerText = "Adicionar";
    } else {
      transactions.unshift(data);
    }

    form.reset();
    save();
  };

}

//////////////////////////////////////////////////
// 💾 SAVE GLOBAL
//////////////////////////////////////////////////

function save(){
  DB.set("t",transactions);
  DB.set("debts",debts);
  render();
}

//////////////////////////////////////////////////
// 🔥 RENDER GERAL
//////////////////////////////////////////////////

function render(){

  renderHome();
  renderTransactions();
  renderDebts();

}

//////////////////////////////////////////////////
// 🏠 HOME
//////////////////////////////////////////////////

function renderHome(){

  if(!balance || !accountsDiv) return;

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

  if(inTotal) inTotal.innerText="R$ "+inSum.toFixed(2);
  if(outTotal) outTotal.innerText="R$ "+outSum.toFixed(2);

  accountsDiv.className = "accounts-scroll";
  accountsDiv.innerHTML = "";

  const uniqueAccounts = [...new Set(transactions.map(t=>t.account))];

  uniqueAccounts.forEach(name=>{

    let sum=0;

    transactions.forEach(t=>{
      if(t.account===name){
        sum += t.type==="entrada"?t.value:-t.value;
      }
    });

    accountsDiv.innerHTML += `
      <div class="account-card" style="background:${colors[name] || '#334155'}">
        <div class="acc-top">
          <div>${name}</div>
          <div>Conta</div>
        </div>

        <div class="acc-balance">
          R$ ${sum.toFixed(2)}
        </div>

        <div class="acc-footer">
          **** ${Math.floor(1000 + Math.random()*9000)}
        </div>
      </div>
    `;
  });

  accountsDiv.innerHTML += `<div class="add-card">+</div>`;
}

//////////////////////////////////////////////////
// 💸 LANÇAMENTOS
//////////////////////////////////////////////////

function renderTransactions(){

  if(!list) return;

  list.innerHTML="";

  transactions.forEach((t,i)=>{
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="item-top">
        <div class="desc">${t.desc}</div>
        <div class="value ${t.type==='entrada'?'in':'out'}">
          ${t.type==='entrada'?'+':'-'} R$ ${t.value.toFixed(2)}
        </div>
      </div>
      <div class="meta">${t.account} • ${t.category}</div>
    `;

    li.onclick=()=>{
      desc.value = t.desc;
      value.value = t.value;
      type.value = t.type;
      account.value = t.account;
      category.value = t.category;

      editIndex = i;
      submitBtn.innerText = "Atualizar";
    };

    list.appendChild(li);
  });

}

//////////////////////////////////////////////////
// 📉 DÍVIDAS
//////////////////////////////////////////////////

function addDebt(){

  debts.push({
    name: d_name.value,
    parcela: Number(d_value.value),
    total: Number(d_total.value),
    paid: Number(d_paid.value) || 0
  });

  d_name.value = "";
  d_value.value = "";
  d_total.value = "";
  d_paid.value = "";

  save();
}

function renderDebts(){

  if(!debtList) return;

  debtList.innerHTML="";

  debts.forEach((d,i)=>{

    const restante = d.total - (d.parcela * d.paid);
    const progresso = (d.parcela * d.paid) / d.total * 100;

    debtList.innerHTML += `
      <div class="debt-item">

        <div class="debt-top">
          <div class="debt-name">${d.name}</div>
          <div>${d.paid}x</div>
        </div>

        <div class="debt-values">
          Parcela: R$ ${d.parcela.toFixed(2)} • Restante: R$ ${restante.toFixed(2)}
        </div>

        <div class="progress">
          <div class="progress-bar" style="width:${progresso}%"></div>
        </div>

        <div class="debt-actions">
          <button class="btn-pay" onclick="pay(${i})">Pagar</button>
          <button class="btn-undo" onclick="undo(${i})">↩</button>
        </div>

      </div>
    `;
  });
}

function pay(i){
  debts[i].paid++;
  save();
}

function undo(i){
  if(debts[i].paid > 0){
    debts[i].paid--;
    save();
  }
}

//////////////////////////////////////////////////
// 🔥 TABS (CORRIGIDO DEFINITIVO)
//////////////////////////////////////////////////

const names = {
  home:"Home",
  transactions:"Lançamentos",
  debts:"Dívidas",
  accountsScreen:"Contas"
};

document.querySelectorAll(".tabbar button").forEach(btn=>{
  btn.addEventListener("click",()=>{

    const tab = btn.dataset.tab;

    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.remove("active");
    });

    document.querySelectorAll(".tabbar button").forEach(b=>{
      b.classList.remove("active");
    });

    const screen = document.getElementById(tab);

    if(screen){
      screen.classList.add("active");
    }

    btn.classList.add("active");

    if(title) title.innerText = names[tab];

  });
});

//////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////

render();