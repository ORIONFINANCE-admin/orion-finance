document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 Orion modular iniciado");

  // ================= DADOS GLOBAIS =================
  window.transactions = DB.get("t") || [];
  window.accounts = DB.get("acc") || [];
  window.debts = DB.get("debts") || [];

  window.ACCOUNT_CACHE = {};

  // ================= INIT =================
  AccountsModule.init();
  refreshAll();

  UIModule.bind();
  TransactionsModule.bind();

  UIModule.go("home");

});

// 🔥 FUNÇÃO GLOBAL DE ATUALIZAÇÃO
function refreshAll(){

  AccountsModule.updateCache();

  // re-render tela atual
  UIModule.go(document.querySelector(".tabbar .active")?.dataset.tab || "home");
}