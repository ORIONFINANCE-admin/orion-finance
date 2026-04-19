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
        target === "debts" ? "Dívidas" :
        "Orion Finance";
    }

    current = target;

    // 🔥 render seguro (NUNCA QUEBRA)
    try {
      if(target === "home") renderHome();
      if(target === "transactions") window.TransactionsModule?.render?.();
      if(target === "debts") window.DebtsModule?.render?.();
      if(target === "dashboard") window.DashboardModule?.render?.();
    } catch(e){
      console.log("Erro ao renderizar tela:", e);
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

    (window.accounts || []).forEach(a=>{
      total += (a.initialBalance ?? a.balance ?? 0);
    });

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

    balanceEl.innerText = hideBalance ? "R$ •••••" : money(total);
    inEl.innerText = hideBalance ? "R$ •••••" : money(income);
    outEl.innerText = hideBalance ? "R$ •••••" : money(outcome);

    // 🔥 evita crash aqui
    try{
      accountsDiv.innerHTML = "";

      (window.accounts || []).forEach(a=>{
        const saldo = (window.ACCOUNT_CACHE?.[a.name]) ?? 0;

        accountsDiv.innerHTML += `
          <div class="card-bank">

            <div style="display:flex; flex-direction:column;">
              <strong>${formatBankName(a.name)}</strong>
              <span style="font-size:18px; margin-top:4px;">
                ${hideBalance ? "•••••" : money(saldo)}
              </span>
            </div>

            ${renderCreditInfo(a)}

          </div>
        `;
      });
    }catch(e){
      console.log("Erro contas:", e);
    }
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

  return {
    bind,
    go
  };

})();