document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 Orion modular iniciado");

  // ================= DADOS =================
  window.transactions = DB.get("t");
  window.accounts = DB.get("acc");
  window.debts = DB.get("debts");

  // ================= MÓDULOS =================
  AccountsModule.init();
  AccountsModule.updateCache();

  UIModule.bind();

  // ================= INÍCIO =================
  UIModule.go("home");

});