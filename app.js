const DB = {
  get:k=>JSON.parse(localStorage.getItem(k))||[],
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let debts = DB.get("d");
let accounts = DB.get("acc");

// FORMATAR REAL
function money(v){
  return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

// ELEMENTOS
const balance = document.getElementById("balance");
const inTotal = document.getElementById("inTotal");
const outTotal = document.getElementById("outTotal");
const accountsDiv = document.getElementById("accounts");
const modal = document.getElementById("modal");

// MODAL
function openModal(){ modal.classList.add("active"); }
function closeModal(){ modal.classList.remove("active"); }

// MOSTRAR CAMPOS CARTÃO
hasCard.onchange = ()=>{
  cardFields.style.display = hasCard.checked ? "block":"none";
};

// SALVAR CONTA
function saveAccount(){

  accounts.push({
    name:acc_name.value,
    balance:Number(acc_balance.value),
    card:hasCard.checked,
    final:card_final.value,
    type:card_type.value
  });

  DB.set("acc",accounts);

  closeModal();
  renderHome();
}

// RESET
function resetAll(){
  localStorage.clear();
  location.reload();
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

  balance.innerText = money(total);
  inTotal.innerText = money(inS);
  outTotal.innerText = money(outS);

  accountsDiv.innerHTML="";

  accounts
    .filter(a=>a.balance>0)
    .forEach(a=>{

      let color = "mp";
      if(a.name.includes("Bradesco")) color="bradesco";
      if(a.name.includes("Inter")) color="inter";
      if(a.name.includes("VR")) color="vr";

      accountsDiv.innerHTML += `
        <div class="card-bank ${color}">
          <strong>${a.name}</strong><br>
          ${money(a.balance)}<br>
          ${a.card ? a.type+" • **** "+a.final : ""}
        </div>
      `;
    });

}

// TRANSAÇÕES
form.onsubmit=e=>{
  e.preventDefault();

  transactions.push({
    desc:desc.value,
    value:Number(value.value),
    type:type.value
  });

  form.reset();
  DB.set("t",transactions);
  renderHome();
};

// TABS (mantido)
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

    renderHome();
  };
});

// INIT
renderHome();