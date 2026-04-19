window.TransactionsModule = (function(){

  function init(){
    bindForm();
  }

  function bindForm(){

    const form = document.getElementById("form");
    if(!form) return;

    form.addEventListener("submit", (e)=>{
      e.preventDefault();

      const desc = document.getElementById("desc").value;
      const value = Number(document.getElementById("value").value);
      const type = document.getElementById("type").value;
      const account = document.getElementById("account").value;
      const category = document.getElementById("category").value;
      const useCard = document.getElementById("useCard").checked;

      if(!desc || !value) return;

      transactions.push({
        desc,
        value,
        type,
        account,
        category,
        paymentType: useCard ? "credito" : null,
        date: Date.now()
      });

      DB.set("t", transactions);

      form.reset();

      // 🔥 atualiza tudo
      UIModule.renderHome();
      render();

      if(typeof AccountsModule.updateCache === "function"){
        AccountsModule.updateCache();
      }
    });
  }

  function render(){

    const list = document.getElementById("list");
    if(!list) return;

    list.innerHTML = "";

    // ordena por data (mais recente)
    const sorted = [...transactions].sort((a,b)=>{
      return (b.date || 0) - (a.date || 0);
    });

    sorted.forEach(t => {

      const li = document.createElement("li");

      li.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <span>
            ${t.desc}
            <br>
            <small style="opacity:.6;">
              ${t.category} • ${t.account}
            </small>
          </span>

          <strong style="color:${t.type === "entrada" ? "#22c55e" : "#ef4444"}">
            ${t.type === "saida" ? "-" : "+"} ${money(t.value)}
          </strong>
        </div>
      `;

      list.appendChild(li);
    });
  }

  return {
    init,
    render
  };

})();