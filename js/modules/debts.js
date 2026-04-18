window.DebtsModule = (function(){

  function getAll(){
    return DB.get("debts");
  }

  return { getAll };

})();
