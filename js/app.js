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

  // 🔥 ESSENCIAL (corrige o submit quebrado)
  if(window.TransactionsModule?.bind){
    TransactionsModule.bind();
  }

  // 🔥 UI por último
  UIModule.bind();
  UIModule.go("home");

});