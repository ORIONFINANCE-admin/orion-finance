window.TransactionsModule = (function(){

  function add(t){
    const list = DB.get("t");
    list.push(t);
    DB.set("t", list);
  }

  return { add };

})();
