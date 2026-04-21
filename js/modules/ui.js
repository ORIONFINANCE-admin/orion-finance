window.UIModule = (function(){

  let current = "home";
  let hideBalance = localStorage.getItem("hideBalance") === "true";

  function go(target){

    if(!target) return;

    const screens = document.querySelectorAll(".screen");
    const tabs = document.querySelectorAll(".tabbar button");

    screens.forEach(s => s.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    const screen = document.getElementById(target);
    if(screen) screen.classList.add("active");

    const btn = [...tabs].find(b => b.dataset.tab === target);
    if(btn) btn.classList.add("active");

    const title = document.getElementById("title");
    if(title){
      title.innerText =
        target === "home" ? "Home" :
        target === "transactions" ? "Lançamentos" :
        target === "dashboard" ? "Dashboard" :
        target === "card" ? "Cartão" :
        target === "debts" ? "Dívidas" :
        "Orion Finance";
    }

    current = target;

    try{
      if(target === "home") renderHome();
      if(target === "transactions") window.TransactionsModule?.render?.();
      if(target === "debts") window.DebtsModule?.render?.();
      if(target === "dashboard") window.DashboardModule?.render?.();
      if(target === "card") window.CreditModule?.render?.();
    }catch(e){
      console.log("Erro ao renderizar:", e);
    }
  }

  function renderHome(){

  const balanceEl = document.getElementById("balance");
  const inEl = document.getElementById("inTotal");
  const outEl = document.getElementById("outTotal");
  const accountsDiv = document.getElementById("accounts");

  if(!balanceEl || !accountsDiv) return;

  let total = 0;
  let income = 0;
  let outcome = 0;

  // 🔥 base das contas
  (window.accounts || []).forEach(a=>{
    total += (a.initialBalance ?? a.balance ?? 0);
  });

  // 🔥 transações
  (window.transactions || []).forEach(t=>{
    if(t.type === "entrada"){
      total += t.value;
      income += t.value;
    } else {
      if(t.paymentType !== "credito"){
        total -= t.value;
      }
      outcome += t.value;
    }
  });

  // 🔥 UI PRINCIPAL
  balanceEl.innerText = hideBalance ? "R$ •••••" : money(total);
  inEl.innerText = hideBalance ? "R$ •••••" : money(income);
  outEl.innerText = hideBalance ? "R$ •••••" : money(outcome);

  // 🔥 COR DINÂMICA
  inEl.style.color = "#22c55e";
  outEl.style.color = "#ef4444";

  // 🔥 CONTAS ORDENADAS POR SALDO
  const orderedAccounts = [...(window.accounts || [])].sort((a,b)=>{
    const sa = (window.ACCOUNT_CACHE?.[a.name]) ?? 0;
    const sb = (window.ACCOUNT_CACHE?.[b.name]) ?? 0;
    return sb - sa;
  });

  accountsDiv.innerHTML = "";

  orderedAccounts.forEach(a=>{

    const saldo = (window.ACCOUNT_CACHE?.[a.name]) ?? 0;

    const isNegative = saldo < 0;

    accountsDiv.innerHTML += `
      <div class="card-bank">

        <div style="display:flex; flex-direction:column;">
          <strong>${formatBankName(a.name)}</strong>

          <span style="
            font-size:18px;
            margin-top:4px;
            color:${isNegative ? "#ef4444" : "#fff"};
          ">
            ${hideBalance ? "•••••" : money(saldo)}
          </span>
        </div>

        ${renderCreditInfo(a)}

      </div>
    `;
  });
}

  function toggleBalance(){
    hideBalance = !hideBalance;
    localStorage.setItem("hideBalance", hideBalance);
    renderHome();
  }

  function bind(){

    document.querySelectorAll(".tabbar button")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          go(btn.dataset.tab);
        });
      });

    document.getElementById("eyeBtn")
      ?.addEventListener("click", toggleBalance);
  }

  function formatBankName(name){
    if(name === "Banco Inter") return "Inter";
    return name;
  }

  function renderCreditButton(acc){

    if(acc.name !== "Banco Inter") return "";

    if(!acc.card){
      return `
        <button onclick="setLimit('Banco Inter')" style="margin-top:6px;">
          Ativar crédito
        </button>
      `;
    }

    const limit = acc.limit || 0;
    const used = acc.used || 0;
    const available = limit - used;

    return `
      <div style="margin-top:6px; font-size:12px; opacity:.8;">
        💳 Limite: ${money(limit)} <br>
        Disponível: ${money(available)}
      </div>
    `;
  }

  return {
    bind,
    go
  };

})();