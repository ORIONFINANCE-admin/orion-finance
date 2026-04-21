window.TransactionsModule = (function(){

  function bind(){

    const form = document.getElementById("form");
    if(!form) return;

    form.addEventListener("submit", function(e){
      e.preventDefault();
      e.stopPropagation();

      const desc = document.getElementById("desc").value;
      const value = Number(document.getElementById("value").value);
      const type = document.getElementById("type").value;
      const account = document.getElementById("account").value;
      const category = document.getElementById("category").value;
      const installments = Number(document.getElementById("installments")?.value || 1);

      if(!desc || isNaN(value) || value <= 0){
        alert("Preencha os campos corretamente");
        return;
      }

      const useCard = document.getElementById("useCard")?.checked;
      const acc = (window.accounts || []).find(a => a.name === account) || null;

      const isCredit = (
        useCard &&
        acc &&
        acc.card === true &&
        acc.name === "Banco Inter"
      );

      // 🔥 CRÉDITO COM PARCELAMENTO
      if(isCredit){

        const parcelaValor = value / installments;

        for(let i = 0; i < installments; i++){

          const data = new Date();
          data.setMonth(data.getMonth() + i);

          const faturaMes = `${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,"0")}`;

          const parcela = {
            desc: installments > 1 ? `${desc} (${i+1}/${installments})` : desc,
            value: parcelaValor,
            type,
            account,
            category,
            paymentType: "credito",
            isCredit: true,
            date: data.getTime(),
            customDate: data.getTime(),
            faturaMes
          };

          window.transactions.push(parcela);

          // 🔥 soma no limite usado
          acc.used = (acc.used || 0) + parcelaValor;

          // 🔥 cria/atualiza fatura
          let fatura = window.debts.find(d => 
            d.isCard &&
            d.account === acc.name &&
            d.mes === faturaMes
          );

          if(fatura){
            fatura.totalValor += parcelaValor;
          } else {
            window.debts.push({
              name: `Fatura ${faturaMes}`,
              totalValor: parcelaValor,
              pago: 0,
              isCard: true,
              account: acc.name,
              mes: faturaMes
            });
          }
        }

        DB.set("debts", window.debts);
        DB.set("acc", window.accounts);

      } else {

        const newTransaction = {
          desc,
          value,
          type,
          account,
          category,
          paymentType: null,
          isCredit: false,
          date: Date.now(),
          customDate: null
        };

        window.transactions.push(newTransaction);
      }

      DB.set("t", window.transactions);

      if(typeof refreshAll === "function"){
        refreshAll();
      }

      form.reset();
    });
  }

  function render(){

    const list = document.getElementById("list");
    if(!list) return;

    list.innerHTML = "";

    if(!window.transactions || window.transactions.length === 0){
      list.innerHTML = "<li style='opacity:.5'>Nenhuma transação</li>";
      return;
    }

    const sorted = [...window.transactions].sort((a,b)=>{
      return (b.customDate || b.date) - (a.customDate || a.date);
    });

    let currentLabel = "";

    sorted.forEach(t => {

      const label = formatDateLabel(t.customDate || t.date);

      if(label !== currentLabel){
        currentLabel = label;

        const header = document.createElement("li");
        header.innerHTML = `<strong style="opacity:.6;">${label}</strong>`;
        list.appendChild(header);
      }

      const li = document.createElement("li");

      const color = t.type === "entrada" ? "#22c55e" : "#ef4444";

      li.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <div>
            <strong>${t.desc}</strong><br>
            <small style="opacity:.6;">
              ${t.category || "Outros"} • ${t.account}
            </small>
          </div>

          <strong style="color:${color}">
            ${t.type === "saida" ? "-" : "+"} ${money(t.value)}
          </strong>
        </div>
      `;

      list.appendChild(li);
    });
  }

  return {
    bind,
    render
  };

})();