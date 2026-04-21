window.CreditModule = (function(){

  function render(){

    const acc = (window.accounts || []).find(a => a.name === "Banco Inter");
    if(!acc) return;

    const limitEl = document.getElementById("cardLimit");
    const availableEl = document.getElementById("cardAvailable");
    const usedEl = document.getElementById("cardUsed");
    const invoicesDiv = document.getElementById("cardInvoices");

    if(!limitEl || !invoicesDiv) return;

    const limit = acc.limit || 0;
    const used = acc.used || 0;
    const available = limit - used;

    limitEl.innerText = money(limit);
    availableEl.innerText = money(available);
    usedEl.innerText = money(used);

    // 🔥 FATURAS POR MÊS
    const faturas = (window.debts || []).filter(d => d.isCard);

    invoicesDiv.innerHTML = "";

    if(faturas.length === 0){
      invoicesDiv.innerHTML = "<p style='opacity:.5'>Nenhuma fatura</p>";
      return;
    }

    // ordenar por mês
    faturas.sort((a,b)=> a.mes.localeCompare(b.mes));

    faturas.forEach((f, i)=>{

      invoicesDiv.innerHTML += `
        <div class="card" style="margin-top:10px;">
          <strong>${formatMes(f.mes)}</strong><br>

          <span style="font-size:18px;">
            ${money(f.totalValor)}
          </span>

          <div style="margin-top:10px;">
            <button onclick="CreditModule.payInvoice('${f.mes}')">
              Pagar
            </button>
          </div>
        </div>
      `;
    });
  }

  function payInvoice(mes){

    const faturaIndex = window.debts.findIndex(d => d.mes === mes && d.isCard);
    if(faturaIndex === -1) return;

    const f = window.debts[faturaIndex];

    const acc = window.accounts.find(a => a.name === f.account);
    if(!acc) return;

    const valor = f.totalValor;

    // 🔥 reduz limite
    acc.used = Math.max(0, (acc.used || 0) - valor);

    // 🔥 cria saída real
    window.transactions.push({
      desc: `Pagamento fatura ${formatMes(mes)}`,
      value: valor,
      type: "saida",
      account: acc.name,
      category: "Cartão",
      date: Date.now()
    });

    // remove fatura
    window.debts.splice(faturaIndex, 1);

    DB.set("debts", window.debts);
    DB.set("acc", window.accounts);
    DB.set("t", window.transactions);

    if(typeof refreshAll === "function"){
      refreshAll();
    }
  }

  function formatMes(m){
    const [y, mm] = m.split("-");
    return `${mm}/${y}`;
  }

  return {
    render,
    payInvoice
  };

})();