window.TransactionsModule = (function(){

  function render(){

    const list = document.getElementById("list");
    if(!list) return;

    list.innerHTML = "";

    transactions.forEach(t => {

      const li = document.createElement("li");

      li.innerHTML = `
        <span>${t.desc}</span>
        <strong style="color:${t.type === "entrada" ? "#22c55e" : "#ef4444"}">
            ${t.type === "saida" ? "-" : "+"} ${money(t.value)}
        </strong>
      `;

      list.appendChild(li);
    });
  }

  return {
    render
  };

})();