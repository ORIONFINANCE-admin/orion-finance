window.DebtsModule = (function(){

  function render(){

    const el = document.getElementById("debtList");
    if(!el) return;

    el.innerHTML = "";

    debts.forEach(d=>{
      el.innerHTML += `
        <div class="card">
          ${d.name} - ${money(d.totalValor)}
        </div>
      `;
    });
  }

  return {
    render
  };

})();