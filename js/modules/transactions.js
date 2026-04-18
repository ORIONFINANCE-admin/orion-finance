window.TransactionsModule = (function(){

  function render(){

    const list = document.getElementById("list");
    if(!list) return;

    list.innerHTML = "";

    transactions.forEach(t => {

      const li = document.createElement("li");

      li.innerHTML = `
        ${t.desc} - ${money(t.value)}
      `;

      list.appendChild(li);
    });
  }

  return {
    render
  };

})();