window.DebtsModule = (function(){

  function render(){

    const list = document.getElementById("debtList");
    if(!list) return;

    list.innerHTML = "";

    if(!window.debts || window.debts.length === 0){
      list.innerHTML = "<p style='opacity:.5'>Nenhuma dívida</p>";
      return;
    }

    window.debts.forEach((d, i)=>{

      list.innerHTML += `
        <div class="card">
          <strong>${d.name}</strong><br>
          Total: ${money(d.totalValor)}

          <div style="margin-top:10px;">
            <button onclick="DebtsModule.payDebt(${i})">
              Pagar fatura
            </button>
          </div>
        </div>
      `;
    });
  }

  // 💳 PAGAMENTO REAL (ESTILO BANCO)
  function payDebt(i){

    const d = window.debts[i];
    if(!d) return;

    const acc = window.accounts.find(a => a.name === d.account);

    if(acc){
      acc.used = Math.max(0, (acc.used || 0) - d.totalValor);
    }

    // 🔥 lança saída REAL no saldo
    window.transactions.push({
      desc: "Pagamento fatura Inter",
      value: d.totalValor,
      type: "saida",
      account: d.account,
      category: "Cartão de crédito",
      paymentType: null,
      isCredit: false,
      date: Date.now(),
      customDate: null
    });

    // remove dívida
    window.debts.splice(i, 1);

    // salva tudo
    DB.set("debts", window.debts);
    DB.set("acc", window.accounts);
    DB.set("t", window.transactions);

    // 🔄 atualiza tudo
    AccountsModule.updateCache();

    const activeTab = document.querySelector(".tabbar .active")?.dataset.tab || "debts";
    UIModule.go(activeTab);
  }

  function bind(){

    const btn = document.getElementById("btnAddDebt");

    if(btn){
      btn.addEventListener("click", () => {
        alert("Dívida manual será melhorada na próxima fase");
      });
    }
  }

  return {
    render,
    bind,
    payDebt
  };

})();