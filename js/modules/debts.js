window.DebtsModule = (function(){

  function render(){

    const list = document.getElementById("debtList");
    if(!list) return;

    list.innerHTML = "";

    if(!window.debts || window.debts.length === 0){
      list.innerHTML = "<p style='opacity:.5'>Nenhuma dívida</p>";
      return;
    }

    // 🔥 ordenar por mês (faturas primeiro)
    const sorted = [...window.debts].sort((a,b)=>{
      if(a.mes && b.mes) return a.mes.localeCompare(b.mes);
      return 0;
    });

    sorted.forEach((d, i)=>{

      // 💳 FATURA
      if(d.isCard){

        list.innerHTML += `
          <div class="card">
            <strong>${d.name}</strong><br>

            <span style="font-size:18px;">
              ${money(d.totalValor)}
            </span>

            <div style="margin-top:10px;">
              <button onclick="DebtsModule.payDebt(${i})">
                Pagar fatura
              </button>
            </div>
          </div>
        `;

        return;
      }

      // 📄 DÍVIDA NORMAL (mantida)
      list.innerHTML += `
        <div class="card">
          <strong>${d.name}</strong><br>
          <span>${money(d.totalValor || d.valor || 0)}</span>
        </div>
      `;
    });
  }

  // 💳 PAGAMENTO DE FATURA
  function payDebt(i){

    const d = window.debts[i];
    if(!d) return;

    const acc = window.accounts.find(a => a.name === d.account);

    if(!acc){
      alert("Conta não encontrada");
      return;
    }

    const valor = d.totalValor || 0;

    if(valor <= 0){
      alert("Nada para pagar");
      return;
    }

    // 🔥 reduz limite usado
    acc.used = Math.max(0, (acc.used || 0) - valor);

    // 🔥 registra pagamento como saída REAL
    window.transactions.push({
      desc: `Pagamento ${d.name}`,
      value: valor,
      type: "saida",
      account: acc.name,
      category: "Cartão de crédito",
      paymentType: null,
      isCredit: false,
      date: Date.now(),
      customDate: null
    });

    // 🔥 remove a fatura paga
    window.debts.splice(i, 1);

    // 🔥 salvar tudo
    DB.set("debts", window.debts);
    DB.set("acc", window.accounts);
    DB.set("t", window.transactions);

    // 🔄 atualizar sistema
    if(typeof refreshAll === "function"){
      refreshAll();
    } else {
      AccountsModule.updateCache();
    }
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