window.AccountsModule = (function(){

  let accounts = DB.get("acc");
  let transactions = DB.get("t");

  function init(){

    if(accounts.length === 0){
      accounts = [
        { name: "Bradesco", initialBalance: 0, balance: 0, card: false },
        { name: "Banco Inter", initialBalance: 0, balance: 0, card: false },
        { name: "Mercado Pago", initialBalance: 0, balance: 0, card: true, type: "fake" },
        { name: "VR", initialBalance: 0, balance: 0, card: false }
      ];

      DB.set("acc", accounts);
    }

    window.accounts = accounts;
  }

  function updateCache(){

    for (const k in ACCOUNT_CACHE) delete ACCOUNT_CACHE[k];

    accounts.forEach(a=>{
      ACCOUNT_CACHE[a.name] = a.initialBalance ?? a.balance ?? 0;
    });

    transactions.forEach(t=>{
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

})();
