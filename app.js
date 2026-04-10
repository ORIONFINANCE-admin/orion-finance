const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let debts = DB.get("debts") || [];

const debtList = document.getElementById("debtList");

// ➕ ADD DÍVIDA
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

// 💾 SAVE
function save(){
  DB.set("debts",debts);
  renderDebts();
}

// 🔥 RENDER DÍVIDAS
function renderDebts(){

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

// ✔ PAGAR
function pay(i){
  debts[i].paid++;
  save();
}

// 🔙 DESFAZER
function undo(i){
  if(debts[i].paid > 0){
    debts[i].paid--;
    save();
  }
}

// INIT
renderDebts();