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

      if(!desc || !value){
        alert("Preencha os campos corretamente");
        return;
      }

      // 🔥 cria transação
      const useCard = document.getElementById("useCard")?.checked;

      const acc = window.accounts.find(a => a.name === account);

      const isCredit = (
        useCard &&
        acc &&
        acc.card === true &&
        acc.name === "Banco Inter"
      );

      const newTransaction = {
          desc,
          value,
          type,
          account,
          category,
          paymentType: isCredit ? "credito" : null,
          isCredit: isCredit,
          date: Date.now(),
          customDate: null
        };
        
        if(isCredit){

        acc.used = (acc.used || 0) + value;

        let fatura = window.debts.find(d => d.isCard && d.account === acc.name);

        if(fatura){
          fatura.totalValor += value;
        } else {
          window.debts.push({
            name: "Fatura Inter",
            valor: 0,
            totalValor: value,
            pago: 0,
            isCard: true,
            account: acc.name
          });
        }

        DB.set("debts", window.debts);
        DB.set("acc", window.accounts);
      }

      // 🔥 salva no estado GLOBAL
      window.transactions.push(newTransaction);

      // 🔥 salva no banco
      DB.set("t", window.transactions);

      // 🔥 atualiza contas
      AccountsModule.updateCache();

      // 🔥 limpa form
      document.getElementById("form").reset();

       // 🔥 atualiza tudo SEM navegar
          if(typeof refreshAll === "function"){
           refreshAll();
         } else {
        AccountsModule.updateCache();
}

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

  // 🔥 ordenar por data (mais recente primeiro)
  const sorted = [...window.transactions].sort((a,b)=>{
    const da = a.customDate || a.date;
    const db = b.customDate || b.date;
    return db - da;
  });

  let currentLabel = "";

  sorted.forEach(t => {

    const date = t.customDate || t.date;
    const label = formatDateLabel(date);

    // 🔹 cria separador por dia
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
            ${t.category || "Outros"} • ${t.account || "Conta"}
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