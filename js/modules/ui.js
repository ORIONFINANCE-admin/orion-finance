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

    if(target === "home") renderHome();
    if(target === "transactions") TransactionsModule.render();
    if(target === "debts") DebtsModule.render();
    if(target === "dashboard") DashboardModule.render();
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

    // 🔥 cálculo correto
    window.accounts.forEach(a=>{
      total += (a.initialBalance ?? a.balance ?? 0);
    });

    window.transactions.forEach(t=>{
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
    inEl.innerText = money(income);
    outEl.innerText = money(outcome);

    // 🔥 render contas
    accountsDiv.innerHTML = "";

    window.accounts.forEach(a=>{
      const saldo = (window.ACCOUNT_CACHE?.[a.name]) ?? 0;

      accountsDiv.innerHTML += `
        <div class="card-bank">
          <strong>${a.name}</strong>
          <span>${hideBalance ? "•••••" : money(saldo)}</span>
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

    // abas
    document.querySelectorAll(".tabbar button")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          go(btn.dataset.tab);
        });
      });

    // olho
    document.getElementById("eyeBtn")
      ?.addEventListener("click", toggleBalance);

    // 🔥 CORREÇÃO CRÍTICA DO FORM
    const form = document.getElementById("form");

    if(form){
      form.addEventListener("submit", function(e){
        e.preventDefault(); // 🔥 impede reload (era seu bug)

        const desc = document.getElementById("desc").value;
        const value = Number(document.getElementById("value").value);
        const type = document.getElementById("type").value;
        const account = document.getElementById("account").value;
        const category = document.getElementById("category").value;

        window.transactions.push({
          desc,
          value,
          type,
          account,
          category,
          date: Date.now()
        });

        DB.set("t", window.transactions);

        this.reset();

        // 🔥 atualiza tudo SEM trocar de tela
        refreshAll();
      });
    }
  }

  return {
    bind,
    go,
    renderHome
  };

})();