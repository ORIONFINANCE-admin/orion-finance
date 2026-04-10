const DB = {
  get: (k) => JSON.parse(localStorage.getItem(k)) || [],
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

let transactions = DB.get("t");
let accounts = DB.get("acc") || [];

// ELEMENTOS
const balance = document.getElementById("balance");
const inTotal = document.getElementById("inTotal");
const outTotal = document.getElementById("outTotal");
const accountsDiv = document.getElementById("accounts");

const modal = document.getElementById("modal");
const hasCard = document.getElementById("hasCard");
const cardFields = document.getElementById("cardFields");

// FORMATAR REAL
function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// =========================
// MODAL
// =========================

function openModal() {
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
}

// MOSTRAR CAMPOS CARTÃO
if (hasCard) {
  hasCard.addEventListener("change", () => {
    cardFields.style.display = hasCard.checked ? "block" : "none";
  });
}

// =========================
// SALVAR CONTA
// =========================

function saveAccount() {
  const name = document.getElementById("acc_name").value;
  const balanceValue = Number(document.getElementById("acc_balance").value);

  if (!balanceValue || balanceValue <= 0) {
    alert("Informe um saldo válido");
    return;
  }

  const account = {
    name,
    balance: balanceValue,
    card: document.getElementById("hasCard").checked,
    final: document.getElementById("card_final").value || "",
    type: document.getElementById("card_type").value || ""
  };

  accounts.push(account);
  DB.set("acc", accounts);

  closeModal();
  renderHome();
}

// =========================
// HOME
// =========================

function renderHome() {

  let total = 0;
  let inS = 0;
  let outS = 0;

  transactions.forEach(t => {
    if (t.type === "entrada") {
      total += t.value;
      inS += t.value;
    } else {
      total -= t.value;
      outS += t.value;
    }
  });

  balance.innerText = money(total);
  inTotal.innerText = money(inS);
  outTotal.innerText = money(outS);

  accountsDiv.innerHTML = "";

  // 🚫 NÃO MOSTRAR contas zeradas
  const validAccounts = accounts.filter(a => a.balance > 0);

  if (validAccounts.length === 0) {
    accountsDiv.innerHTML = `<p style="opacity:0.5">Nenhuma conta ainda</p>`;
    return;
  }

  validAccounts.forEach(a => {

    let color = "mp";

    if (a.name.includes("Bradesco")) color = "bradesco";
    if (a.name.includes("Inter")) color = "inter";
    if (a.name.includes("VR")) color = "vr";

    accountsDiv.innerHTML += `
      <div class="card-bank ${color}">
        <strong>${a.name}</strong><br>
        ${money(a.balance)}<br>
        ${a.card ? `${a.type} • **** ${a.final}` : ""}
      </div>
    `;
  });
}

// =========================
// TRANSAÇÕES
// =========================

const form = document.getElementById("form");

if (form) {
  form.onsubmit = (e) => {
    e.preventDefault();

    const desc = document.getElementById("desc").value;
    const value = Number(document.getElementById("value").value);
    const type = document.getElementById("type").value;

    transactions.push({
      desc,
      value,
      type
    });

    DB.set("t", transactions);
    form.reset();

    renderHome();
  };
}

// =========================
// TABS (CORRIGIDO)
// =========================

const tabs = document.querySelectorAll(".tabbar button");
const screens = document.querySelectorAll(".screen");
const title = document.getElementById("title");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {

    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    screens.forEach(s => s.classList.remove("active"));

    const target = btn.getAttribute("data-tab");
    const screen = document.getElementById(target);

    if (screen) screen.classList.add("active");

    // título
    if (target === "home") title.innerText = "Home";
    if (target === "transactions") title.innerText = "Lançamentos";
    if (target === "debts") title.innerText = "Dívidas";
    if (target === "accountsScreen") title.innerText = "Contas";
  });
});

// =========================
// RESET
// =========================

function resetAll() {
  if (confirm("Deseja apagar tudo?")) {
    localStorage.clear();
    location.reload();
  }
}

// INIT
renderHome();