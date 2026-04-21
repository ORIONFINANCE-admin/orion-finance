window.AccountsModule = (function(){

  function init(){

    let saved = DB.get("acc");

    // 🔥 AUTOCURA TOTAL
    if(!Array.isArray(saved) || saved.length === 0){

      saved = [
        { name: "Bradesco", initialBalance: 0, balance: 0, card: false },
        { name: "Banco Inter", initialBalance: 0, balance: 0, card: false, limit: 0, used: 0 },
        { name: "Mercado Pago", initialBalance: 0, balance: 0, card: true },
        { name: "VR", initialBalance: 0, balance: 0, card: false }
      ];

      DB.set("acc", saved);

      console.log("🔥 CONTAS RECRIADAS");
    }

    window.accounts = saved;
  }

  function updateCache(){

    if(!window.ACCOUNT_CACHE){
      window.ACCOUNT_CACHE = {};
    }

    // limpa cache
    for(const k in window.ACCOUNT_CACHE){
      delete window.ACCOUNT_CACHE[k];
    }

    // saldo inicial
    (window.accounts || []).forEach(a=>{
      window.ACCOUNT_CACHE[a.name] = a.initialBalance ?? a.balance ?? 0;
    });

    // aplica transações
    (window.transactions || []).forEach(t=>{
      if(!window.ACCOUNT_CACHE.hasOwnProperty(t.account)) return;

      if(t.type === "entrada"){
        window.ACCOUNT_CACHE[t.account] += t.value;
      } else {
        if(t.paymentType !== "credito"){
          window.ACCOUNT_CACHE[t.account] -= t.value;
        }
      }
    });
  }

  return {
    init,
    updateCache
  };

})();