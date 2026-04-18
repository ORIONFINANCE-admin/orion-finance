document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 Orion modular iniciado");

  // INIT CORE DATA
  window.transactions = DB.get("t");
  window.accounts = DB.get("acc");
  window.debts = DB.get("debts");

  // INIT MODULES
  AccountsModule.init();
  AccountsModule.updateCache();

  UIModule.bind();

  // RENDER INICIAL
  UIModule.renderHome();
  renderTransactions();
  renderDebts();
  loadCategories();
  initSettings();
  updateEyeIcon();

  DashboardModule.render();

});