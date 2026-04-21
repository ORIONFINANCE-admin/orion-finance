window.AccountsModule = (function(){

  function init(){

    if(!window.accounts || window.accounts.length === 0){
      window.accounts = [
        { name: "Bradesco", initialBalance: 0, balance: 0, card: false },
        { 
        name: "Banco Inter",
        initialBalance: 0,
        balance: 0,
        card: false,
        limit: 0,
        used: 0
      },
        { name: "Mercado Pago", initialBalance: 0, balance: 0, card: true, type: "fake" },
        { name: "VR", initialBalance: 0, balance: 0, card: false }
      ];

      DB.set("acc", window.accounts);
    }
  }

  function updateCache(){

    for (const k in ACCOUNT_CACHE) delete ACCOUNT_CACHE[k];

    window.accounts.forEach(a=>{
      ACCOUNT_CACHE[a.name] = a.initialBalance ?? a.balance ?? 0;
    });

    window.transactions.forEach(t=>{
      if(!ACCOUNT_CACHE.hasOwnProperty(t.account)) return;

      if(t.type === "entrada"){
        ACCOUNT_CACHE[t.account] += t.value;
      } else {
        if(t.paymentType !== "credito"){
          ACCOUNT_CACHE[t.account] -= t.value;
        }
      }
    });
  }

  return {
    init,
    updateCache
  };

window.setLimit = function(bankName){

  const acc = window.accounts.find(a => a.name === bankName);
  if(!acc) return;

  const value = prompt("Digite o limite do cartão:");

  if(!value) return;

  const limit = Number(value);

  if(isNaN(limit) || limit <= 0){
    alert("Valor inválido");
    return;
  }

  acc.card = true;
  acc.limit = limit;
  acc.used = 0;

  DB.set("acc", window.accounts);

  refreshAll();
};

})();