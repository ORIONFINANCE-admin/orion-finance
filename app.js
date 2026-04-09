const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");
let debts = DB.get("d");

const accounts = ["Mercado Pago","Inter","Bradesco","VR"];
const categories = ["Salário","Alimentação","Transporte","Lazer","Outros"];

// SELECTS
accounts.forEach(a=>account.innerHTML+=`<option>${a}</option>`);
categories.forEach(c=>category.innerHTML+=`<option>${c}</option>`);

// ADD
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

// SAVE
function save(){
  DB.set("t",transactions);
  DB.set("d",debts);
  render();
}

// RENDER
function render(){

  let total=0;

  transactions.forEach(t=>{
    total += t.type==="entrada"?t.value:-t.value;
  });

  balance.innerText="R$ "+total.toFixed(2);

  list.innerHTML="";

  transactions.forEach((t,i)=>{

    const li = document.createElement("li");

    li.innerHTML = `
      ${t.desc} (${t.category})<br>
      R$ ${t.value}
      <button class="swipe-delete">🗑</button>
    `;

    // SWIPE
    let startX=0;

    li.addEventListener("touchstart",e=>{
      startX = e.touches[0].clientX;
    });

    li.addEventListener("touchmove",e=>{
      let moveX = e.touches[0].clientX;
      if(startX - moveX > 50){
        li.classList.add("swiped");
      }
    });

    li.querySelector(".swipe-delete").onclick=()=>{
      transactions.splice(i,1);
      save();
    };

    list.appendChild(li);
  });

  renderChart();
}

// CHART
function renderChart(){

  const data = {};

  transactions.forEach(t=>{
    if(t.type==="saida"){
      data[t.category] = (data[t.category]||0)+t.value;
    }
  });

  const labels = Object.keys(data);
  const values = Object.values(data);

  if(window.chart) window.chart.destroy();

  if(values.length===0){
    emptyChart.innerText="Sem dados ainda";
    return;
  } else {
    emptyChart.innerText="";
  }

  window.chart = new Chart(chart,{
    type:"doughnut",
    data:{labels,datasets:[{data:values}]}
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

render();