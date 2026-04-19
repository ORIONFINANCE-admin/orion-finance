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

  // 🔥 CORRIGE SUBMIT / FORM
  if(window.TransactionsModule?.bind){
    TransactionsModule.bind();
  }

  // 🔥 ATIVA DÍVIDAS (IMPORTANTE PRO CRÉDITO)
  if(window.DebtsModule?.bind){
    DebtsModule.bind();
  }

  // 🔥 UI POR ÚLTIMO (sempre)
  UIModule.bind();
  UIModule.go("home");

});


// 🔄 ATUALIZAÇÃO GLOBAL SEGURA
function refreshAll(){

  AccountsModule.updateCache();

  const activeTab =
    document.querySelector(".tabbar .active")?.dataset.tab || "home";

  UIModule.go(activeTab);
}