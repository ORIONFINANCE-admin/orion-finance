const STORAGE_KEY = "orion_v1";

const Data = {
  get() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  },
  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

let transactions = Data.get();

const list = document.getElementById("list");
const form = document.getElementById("form");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const totalCountEl = document.getElementById("totalCount");

function calculate() {
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.type === "entrada") income += Number(t.value);
    else expense += Number(t.value);
  });

  const balance = income - expense;

  balanceEl.innerText = `R$ ${balance.toFixed(2)}`;
  incomeEl.innerText = `R$ ${income.toFixed(2)}`;
  expenseEl.innerText = `R$ ${expense.toFixed(2)}`;
  totalCountEl.innerText = transactions.length;
}

function renderList() {
  list.innerHTML = "";

  transactions.forEach((t, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${t.desc}</span>
      <strong class="${t.type}">
        ${t.type === "saida" ? "-" : "+"} R$ ${Number(t.value).toFixed(2)}
      </strong>
    `;

    li.onclick = () => {
      transactions.splice(index, 1);
      update();
    };

    list.appendChild(li);
  });
}

function update() {
  Data.save(transactions);
  renderList();
  calculate();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = document.getElementById("desc").value;
  const value = document.getElementById("value").value;
  const type = document.getElementById("type").value;

  transactions.push({ desc, value, type });

  form.reset();
  update();
});

function exportData() {
  const dataStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "orion-backup.json";
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    const imported = JSON.parse(e.target.result);
    transactions = imported;
    update();
    alert("Importado!");
  };

  reader.readAsText(file);
}

// tabs
const tabs = document.querySelectorAll(".tabbar button");
const screens = document.querySelectorAll(".screen");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    screens.forEach(s => s.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

update();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
