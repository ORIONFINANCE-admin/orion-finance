const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let accounts = DB.get("accounts") || [];
let debts = DB.get("debts") || [];

let editIndex = null;

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const accountsDiv = document.getElementById("accounts");

const inTotal = document.getElementById("inTotal");
const outTotal = document.getElementById("outTotal");

const submitBtn = document.getElementById("submitBtn");

// 🎨 CORES
const colors = {
  "Bradesco":"#cc092f",
  "Banco Inter":"#ff7a00",
  "Mercado Pago":"#00b1ea",
  "VR":"#7c3aed"
};

// RENDER
function render(){

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

  // 🔥 CONTAS PREMIUM
  accountsDiv.className = "accounts-scroll";
  accountsDiv.innerHTML = "";

  [...new Set(transactions.map(t=>t.account))].forEach(name=>{

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

  // ➕ ADD
  accountsDiv.innerHTML += `
    <div class="add-card">+</div>
  `;

  // LISTA (mantida)
  list.innerHTML="";

  transactions.forEach((t,i)=>{
    const li = document.createElement("li");

    li.innerHTML = `
      ${t.desc}<br>
      R$ ${t.value.toFixed(2)}<br>
      <small>${t.account} • ${t.category}</small>
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

// SAVE
function save(){
  DB.set("t",transactions);
  render();
}

// ADD
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

// TABS
const names = {
  home:"Home",
  transactions:"Lançamentos",
  debts:"Dívidas",
  accountsScreen:"Contas"
};

document.querySelectorAll(".tabbar button").forEach(btn=>{
  btn.addEventListener("click",()=>{

    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelectorAll(".tabbar button").forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    const tab = btn.dataset.tab;
    document.getElementById(tab).classList.add("active");

    title.innerText = names[tab];
  });
});

// INIT
render();