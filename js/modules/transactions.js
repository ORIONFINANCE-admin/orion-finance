window.TransactionsModule = (function(){

  // ================= ADD =================
  function addTransaction(data){

    window.transactions.push({
      desc: data.desc,
      value: Number(data.value),
      type: data.type,
      account: data.account,
      category: data.category,
      paymentType: null,
      isCredit: false,
      date: Date.now()
    });

    DB.set("t", window.transactions);

    refreshAll();
  }

  // ================= FORMAT DATA =================
  function formatDateLabel(timestamp){

    const d = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if(d.toDateString() === today.toDateString()) return "Hoje";
    if(d.toDateString() === yesterday.toDateString()) return "Ontem";

    return d.toLocaleDateString("pt-BR");
  }

  // ================= RENDER =================
  function render(data = null){

    const list = document.getElementById("list");
    if(!list) return;

    const source = data || window.transactions;

    list.innerHTML = "";

    if(source.length === 0){
      list.innerHTML = "<li style='opacity:.5'>Nenhuma transação</li>";
      return;
    }

    const sorted = [...source].sort((a,b)=>{
      const da = a.customDate || a.date;
      const db = b.customDate || b.date;
      return db - da;
    });

    let currentLabel = "";

    sorted.forEach(t => {

      const date = t.customDate || t.date;
      const label = formatDateLabel(date);

      if(label !== currentLabel){
        currentLabel = label;

        const header = document.createElement("li");
        header.innerHTML = `<strong style="opacity:.6;">${label}</strong>`;
        list.appendChild(header);
      }

      const li = document.createElement("li");

      const isEntrada = t.type === "entrada";

      li.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          
          <div>
            <strong>${t.desc || "Sem descrição"}</strong><br>
            <small style="opacity:.6;">
              ${t.category || "Outros"} • ${t.account || "Sem conta"}
            </small>
          </div>

          <strong style="color:${isEntrada ? "#22c55e" : "#ef4444"}">
            ${isEntrada ? "+" : "-"} ${money(t.value)}
          </strong>

        </div>
      `;

      list.appendChild(li);
    });
  }

  // ================= BUSCA =================
  function filter(query){

    const q = query.toLowerCase();

    const filtered = window.transactions.filter(t => {
      return (
        (t.desc && t.desc.toLowerCase().includes(q)) ||
        (t.account && t.account.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    });

    render(filtered);
  }

  // ================= BIND =================
  function bind(){

    // 🔥 FORM (AGORA NO LUGAR CERTO)
    const form = document.getElementById("form");

    if(form){
      form.addEventListener("submit", function(e){
        e.preventDefault();

        addTransaction({
          desc: document.getElementById("desc").value,
          value: document.getElementById("value").value,
          type: document.getElementById("type").value,
          account: document.getElementById("account").value,
          category: document.getElementById("category").value
        });

        form.reset();
      });
    }

    // 🔍 BUSCA
    const input = document.getElementById("searchInput");

    if(input){
      input.addEventListener("input", function(){

        if(this.value.trim() === ""){
          render();
        } else {
          filter(this.value);
        }

      });
    }
  }

  return {
    render,
    bind
  };

})();