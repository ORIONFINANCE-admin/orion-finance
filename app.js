const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");

// CONTAS (UX PREMIUM)
const accounts = [
  {
    name:"Mercado Pago",
    color:"#00aaff",
    card:"1234",
    type:"Crédito"
  },
  {
    name:"Inter",
    color:"#ff7a00",
    card:"5678",
    type:"Débito"
  },
  {
    name:"VR",
    color:"#00c853",
    card:"---",
    type:"Benefício"
  }
];

// CATEGORIAS
const categories = [
  "Salário",
  "Alimentação",
  "Transporte",
  "Lazer",
  "Outros"
];

// SELECTS
accounts.forEach(a=>{
  account.innerHTML+=`<option>${a.name}</option>`;
});

categories.forEach(c=>{
  category.innerHTML+=`<option>${c}</option>`;
});

// FORM
form.onsubmit = e=>{
  e.preventDefault();

  transactions.push({
    desc:desc.value,
    value:Number(value.value),
    type:type.value,
    account:account.value,
    category:category.value
  });

  save();
};

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
    total+= t.type=="entrada"?t.value:-t.value;
  });

  balance.innerText="R$ "+total.toFixed(2);

  // CARDS
  accountsDiv.innerHTML="";
  accounts.forEach(acc=>{

    let sum=0;

    transactions.forEach(t=>{
      if(t.account==acc.name){
        sum+= t.type=="entrada"?t.value:-t.value;
      }
    });

    accountsDiv.innerHTML+=`
      <div class="account-card" style="background:${acc.color}">
        <div class="account-name">${acc.name}</div>
        <div class="account-balance">R$ ${sum.toFixed(2)}</div>
        <div class="card-number">${acc.type} • **** ${acc.card}</div>
      </div>
    `;
  });

  // LISTA
  list.innerHTML="";
  transactions.forEach(t=>{
    list.innerHTML+=`
      <li>
        ${t.desc} (${t.category})<br>
        ${t.account} - R$ ${t.value}
      </li>
    `;
  });

  // GRÁFICO
  const data = {};

  transactions.forEach(t=>{
    if(t.type=="saida"){
      data[t.category] = (data[t.category]||0)+t.value;
    }
  });

  const labels = Object.keys(data);
  const values = Object.values(data);

  if(window.chart) window.chart.destroy();

  window.chart = new Chart(document.getElementById("chart"),{
    type:"pie",
    data:{
      labels:labels,
      datasets:[{
        data:values
      }]
    }
  });
}

// TABS
document.querySelectorAll(".tabbar button").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    b.classList.add("active");
    document.getElementById(b.dataset.tab).classList.add("active");
  };
});

render();