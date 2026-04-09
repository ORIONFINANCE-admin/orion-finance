const DB = {
  get: k => JSON.parse(localStorage.getItem(k)) || [],
  set: (k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

let transactions = DB.get("t");

const list = document.getElementById("list");
const balance = document.getElementById("balance");

// ADD
form.onsubmit = e=>{
  e.preventDefault();

  transactions.unshift({
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