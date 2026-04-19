window.TransactionsModule = (function(){

  let currentList = [];

  // ================= FORMAT DATA =================
  function formatDateLabel(timestamp){

    const d = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if(d.toDateString() === today.toDateString()){
      return "Hoje";
    }

    if(d.toDateString() === yesterday.toDateString()){
      return "Ontem";
    }

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

    // 🔥 ordena por data
    const sorted = [...source].sort((a,b)=>{
      const da = a.customDate || a.date;
      const db = b.customDate || b.date;
      return db - da;
    });

    let currentLabel = "";

    sorted.forEach(t => {

      const date = t.customDate || t.date;
      const label = formatDateLabel(date);

      // 🔹 grupo
      if(label !== currentLabel){
        currentLabel = label;

        const header = document.createElement("li");
        header.innerHTML = `
          <strong style="opacity:.6;">${label}</strong>
        `;
        list.appendChild(header);
      }

      // 🔹 item
      const li = document.createElement("li");

      const isEntrada = t.type === "entrada";

      li.innerHTML = `
        <div style="display:flex; justify-content:space-between; gap:10px;">
          
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

    currentList = sorted;
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
    bind,
    filter
  };

})();