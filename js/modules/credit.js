window.CreditModule = (function(){

  function setLimit(accountName){

    const acc = accounts.find(a => a.name === accountName);
    if(!acc) return;

    const value = Number(prompt("Valor do limite (CDB):"));

    if(isNaN(value) || value <= 0) return;

    acc.limit = value;
    acc.used = 0;
    acc.card = true;
    acc.type = "real";

    DB.set("acc", accounts);

    renderHome();
  }

  function removeCredit(accountName){

    const acc = accounts.find(a => a.name === accountName);
    if(!acc) return;

    acc.card = false;
    acc.limit = 0;
    acc.used = 0;
    acc.type = null;

    DB.set("acc", accounts);

    renderHome();
  }

  return {
    setLimit,
    removeCredit
  };

})();
