const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let accounts = DB.get("accounts") || [];

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const accountsDiv = document.getElementById("accounts");

// 🔥 CONFIG PADRÃO DAS CONTAS
const defaultAccounts = {
  "Bradesco": {color:"#cc092f", type:"Débito"},
  "Banco Inter": {color:"#ff7a00", type:"Débito"},
  "Mercado Pago": {color:"#00b1ea", type:"Crédito"},
  "VR": {color:"#22c55e", type:"Benefício"}
};

// 🔥 GARANTE QUE CONTA EXISTA
function ensureAccount(name){

  let exists = accounts.find(a=>a.name===name);

  if(!exists){

    let config = defaultAccounts[name] || {color:"#64748b", type:"Conta"};

    accounts.push({
      name:name,
      color:config.color,
      type:config.type,
      card:"0000"
    });

    DB.set("accounts",accounts);
  }
}

// ADD
form.onsubmit = e=>{
  e.preventDefault();

  const accName = account.value;

  // 🔥 cria conta automaticamente
  ensureAccount(accName);

  transactions.unshift({
    desc:desc.value,
    value:Number(value.value),
    type:type.value,
    account:accName,
    category:category.value
  });

  form.reset();
  save();
};

// SAVE
function save(){
  DB.set("t",transactions);
  DB.set("accounts",accounts);
  render();
}

// RENDER
function render(){

  let total=0;

  transactions.forEach(t=>{
    total += t.type==="entrada"?t.value:-t.value;
  });

  balance.innerText="R$ "+total.toFixed(2);

  // 🔥 CONTAS DINÂMICAS
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
        
        <div class="acc-top">
          <div class="acc-name">${acc.name}</div>
          <div class="acc-type">${acc.type}</div>
        </div>

        <div class="acc-balance">
          R$ ${sum.toFixed(2)}
        </div>

        <div class="acc-footer">
          **** ${acc.card}
        </div>

      </div>
    `;
  });

  // LISTA
  list.innerHTML="";

  transactions.forEach((t,i)=>{

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="desc">${t.desc}</div>
      <div class="value ${t.type==='entrada'?'in':'out'}">
        ${t.type==='entrada'?'+':'-'} R$ ${t.value.toFixed(2)}
      </div>
      <div class="meta">${t.account} • ${t.category}</div>
      <div class="swipe-area">🗑</div>
    `;

    let startX=0;

    li.addEventListener("touchstart",e=>{
      startX = e.touches[0].clientX;
    });

    li.addEventListener("touchmove",e=>{
      if(startX - e.touches[0].clientX > 60){
        li.classList.add("swiped");
      }
    });

    li.querySelector(".swipe-area").onclick=()=>{
      transactions.splice(i,1);
      save();
    };

    list.appendChild(li);
  });

}

// INIT
render();