document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 Orion modular iniciado");

  // ================= DADOS GLOBAIS =================
  window.transactions = DB.get("t") || [];
  window.accounts = DB.get("acc") || [];
  window.debts = DB.get("debts") || [];

  window.ACCOUNT_CACHE = {};

  // ================= INIT =================
  AccountsModule.init();
  AccountsModule.updateCache();

  // 🔥 BIND DO FORM (ESSENCIAL)
  if(window.TransactionsModule?.bind){
    TransactionsModule.bind();
  }

  if(window.TransactionsModule?.bind){
    console.log("🔥 bind do form ativo");
    TransactionsModule.bind();
  }

  // 🔥 DÍVIDAS
  if(window.DebtsModule?.bind){
    DebtsModule.bind();
  }

  // 🔥 UI POR ÚLTIMO
  UIModule.bind();
  UIModule.go("home");

});


// 🔄 ATUALIZAÇÃO GLOBAL
function refreshAll(){

  AccountsModule.updateCache();

  const activeTab =
    document.querySelector(".tabbar .active")?.dataset.tab || "home";

  UIModule.go(activeTab);
}