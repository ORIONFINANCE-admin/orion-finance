// ================= APP ORCHESTRATOR =================

document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 Orion Finance iniciando...");

  // ---------------- CORE READY ----------------
  if(!window.DB || !window.STATE){
    console.error("❌ Core não carregado corretamente");
    return;
  }

  // ---------------- MODULES INIT ----------------

  try{

    // CONTAS (base do sistema)
    if(window.AccountsModule){
      AccountsModule.init();
      AccountsModule.updateCache();
    }

    // UI
    if(window.UIModule){
      UIModule.bind();
    }

    console.log("✅ Módulos inicializados");

  }catch(err){
    console.error("🔥 Erro ao iniciar módulos:", err);
  }

  // ---------------- APP ANTIGO (COMPAT) ----------------
  // 🔥 mantém seu sistema atual funcionando

  try{

    if(typeof renderHome === "function") renderHome();
    if(typeof renderTransactions === "function") renderTransactions();
    if(typeof renderDebts === "function") renderDebts();
    if(typeof loadCategories === "function") loadCategories();
    if(typeof initSettings === "function") initSettings();
    if(typeof updateEyeIcon === "function") updateEyeIcon();

    console.log("✅ Sistema legado ativo");

  }catch(err){
    console.error("🔥 Erro no sistema antigo:", err);
  }

  // ---------------- DASHBOARD ----------------

  try{
    if(window.DashboardModule){
      DashboardModule.render();
    }
  }catch(err){
    console.warn("⚠️ Dashboard não carregado ainda");
  }

});