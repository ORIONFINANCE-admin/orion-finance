document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 Orion modular iniciado");

  // ================= DADOS =================
  window.transactions = DB.get("t") || [];
  window.accounts = DB.get("acc") || [];
  window.debts = DB.get("debts") || [];

  // ================= MÓDULOS =================
  AccountsModule.init();
  AccountsModule.updateCache();

  TransactionsModule.init?.();
  DebtsModule.init?.();
  DashboardModule.init?.();

  UIModule.bind();

  // ================= RENDER INICIAL =================
  AccountsModule.render?.();
  TransactionsModule.render?.();
  DebtsModule.render?.();
  DashboardModule.render?.();

  // ================= START =================
  UIModule.go("home");

});