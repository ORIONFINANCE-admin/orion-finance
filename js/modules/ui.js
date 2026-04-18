window.UIModule = (function(){

  function renderHome(){

    const balanceEl = document.getElementById("balance");
    const inEl = document.getElementById("inTotal");
    const outEl = document.getElementById("outTotal");
    const accountsDiv = document.getElementById("accounts");

    if(!balanceEl) return;

    let total = 0;
    let income = 0;
    let outcome = 0;

    accounts.forEach(a=>{
      total += (a.initialBalance ?? a.balance ?? 0);
    });

    transactions.forEach(t=>{
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

    balanceEl.innerText = money(total);
    inEl.innerText = money(income);
    outEl.innerText = money(outcome);

    // contas
    accountsDiv.innerHTML = "";

    accounts.forEach(a=>{

      const saldo = ACCOUNT_CACHE[a.name] || 0;

      accountsDiv.innerHTML += `
        <div class="card-bank">
          <strong>${a.name}</strong>
          <span>${money(saldo)}</span>
        </div>
      `;
    });

  }

  function bind(){

    document.getElementById("eyeBtn")
      ?.addEventListener("click", () => {
        alert("toggle depois implementamos");
      });

  }

  return {
    bind,
    renderHome
  };

})();