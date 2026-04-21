window.DebtsModule = (function(){

  function render(){

    const list = document.getElementById("debtList");
    if(!list) return;

    list.innerHTML = "";

    if(!window.debts || window.debts.length === 0){
      list.innerHTML = "<p style='opacity:.5'>Nenhuma dívida</p>";
      return;
    }

    // 🔥 ordenar por mês (mais recente primeiro)
    const sorted = [...window.debts].sort((a,b)=>{
      if(a.mes && b.mes) return b.mes.localeCompare(a.mes);
      return 0;
    });

    sorted.forEach((d, i)=>{

      // =========================
      // 💳 FATURA DE CARTÃO
      // =========================
      if(d.isCard){

        // 🔥 pega transações da fatura
        const compras = (window.transactions || []).filter(t =>
          t.isCredit &&
          t.account === d.account &&
          t.faturaMes === d.mes
        );

        const totalCompras = compras.length;

        let comprasHTML = "";

        compras.forEach(c => {

          comprasHTML += `
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-top:6px;">

              <div>
                ${c.desc}
              </div>

              <div>
                ${money(c.value)}
              </div>

            </div>
          `;
        });

        list.innerHTML += `
          <div class="card">

            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>${formatMes(d.mes)}</strong>
              <span style="font-size:12px; opacity:.6;">
                ${totalCompras} compra(s)
              </span>
            </div>

            <div style="font-size:22px; margin-top:6px;">
              ${money(d.totalValor)}
            </div>

            <div style="margin-top:10px; border-top:1px solid #333; padding-top:10px;">
              ${comprasHTML || "<span style='opacity:.5;'>Sem compras</span>"}
            </div>

            <div style="margin-top:12px;">
              <button onclick="DebtsModule.payDebt(${i})">
                Pagar fatura
              </button>
            </div>

          </div>
        `;

        return;
      }

      // =========================
      // 📄 DÍVIDA NORMAL
      // =========================
      list.innerHTML += `
        <div class="card">
          <strong>${d.name}</strong><br>
          <span>${money(d.totalValor || d.valor || 0)}</span>
        </div>
      `;
    });
  }

  // =========================
  // 💳 PAGAMENTO DE FATURA
  // =========================
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

    // 🔥 registra pagamento REAL
    window.transactions.push({
      desc: `Pagamento ${formatMes(d.mes)}`,
      value: valor,
      type: "saida",
      account: acc.name,
      category: "Cartão de crédito",
      paymentType: null,
      isCredit: false,
      date: Date.now(),
      customDate: null
    });

    // 🔥 remove fatura
    window.debts.splice(i, 1);

    // 💾 salvar
    DB.set("debts", window.debts);
    DB.set("acc", window.accounts);
    DB.set("t", window.transactions);

    // 🔄 atualizar
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

  // =========================
  // 📅 FORMATADOR DE MÊS
  // =========================
  function formatMes(mes){

    if(!mes) return "Fatura";

    const [ano, mesNum] = mes.split("-");
    const nomes = [
      "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
      "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    return `${nomes[Number(mesNum)-1]} ${ano}`;
  }

  return {
    render,
    bind,
    payDebt
  };

})();