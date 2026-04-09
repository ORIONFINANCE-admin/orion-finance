const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");

// CONTAS
const accounts = [
  {name:"Mercado Pago", color:"#00aaff", card:"1234", type:"Crédito"},
  {name:"Inter", color:"#ff7a00", card:"5678", type:"Débito"},
  {name:"VR", color:"#00c853", card:"----", type:"Benefício"}
];

// CATEGORIAS
const categories = [
  "Salário","Alimentação","Transporte","Lazer","Outros"
];

// ELEMENTOS
const form = document.getElementById("form");
const list = document.getElementById("list");
const balance = document.getElementById("balance");
const accountsDiv = document.getElementById("accounts");

const accountSelect = document.getElementById("account");
const categorySelect = document.getElementById("category");

// POPULAR SELECTS
accounts.forEach(a=>{
  accountSelect.innerHTML += `<option>${a.name}</option>`;
});

categories.forEach(c=>{
  categorySelect.innerHTML += `<option>${c}</option>`;
});

// FORM
form.addEventListener("submit", e=>{
  e.preventDefault();

  const newTransaction = {
    desc: document.getElementById("desc").value,
    value: Number(document.getElementById("value").value),
    type: document.getElementById("type").value,
    account: accountSelect.value,
    category: categorySelect.value
  };

  transactions.push(newTransaction);

  form.reset(); // 🔥 CORREÇÃO AQUI
  save();

  // feedback visual
  form.style.opacity = "0.6";
  setTimeout(()=> form.style.opacity = "1", 150);
});

// SAVE
function save(){
  DB.set("t",transactions);
  render();
}

// RENDER
function render(){

  // SALDO
  let total=0;
  transactions.forEach(t=>{
    total += t.type==="entrada" ? t.value : -t.value;
  });

  balance.innerText = "R$ " + total.toFixed(2);

  // CONTAS VISUAIS
  accountsDiv.innerHTML = "";

  accounts.forEach(acc=>{
    let sum = 0;

    transactions.forEach(t=>{
      if(t.account === acc.name){
        sum += t.type==="entrada" ? t.value : -t.value;
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
  list.innerHTML = "";

  transactions.forEach(t=>{
    list.innerHTML += `
      <li>
        ${t.desc} (${t.category})<br>
        ${t.account} - R$ ${t.value}
      </li>
    `;
  });

  renderChart();
}

// GRÁFICO
function renderChart(){

  const data = {};

  transactions.forEach(t=>{
    if(t.type==="saida"){
      data[t.category] = (data[t.category]||0) + t.value;
    }
  });

  const labels = Object.keys(data);
  const values = Object.values(data);

  if(window.chart) window.chart.destroy();

  window.chart = new Chart(document.getElementById("chart"),{
    type:"doughnut",
    data:{
      labels:labels,
      datasets:[{ data:values }]
    },
    options:{
      plugins:{ legend:{ display:true } }
    }
  });
}

// 🔥 TABS CORRIGIDAS
const tabButtons = document.querySelectorAll(".tabbar button");
const screens = document.querySelectorAll(".screen");

tabButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{

    // remove active de tudo
    tabButtons.forEach(b=>b.classList.remove("active"));
    screens.forEach(s=>s.classList.remove("active"));

    // ativa atual
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

  });
});

// INIT
render();

// 🔥 UPDATE AUTOMÁTICO
if ("serviceWorker" in navigator) {

  navigator.serviceWorker.register("service-worker.js").then(reg => {

    reg.onupdatefound = () => {

      const newWorker = reg.installing;

      newWorker.onstatechange = () => {

        if (newWorker.state === "installed") {

          if (navigator.serviceWorker.controller) {

            // NOVA VERSÃO DISPONÍVEL
            const update = confirm("Nova versão disponível. Atualizar?");

            if (update) {
              window.location.reload();
            }
          }
        }
      };
    };
  });
}