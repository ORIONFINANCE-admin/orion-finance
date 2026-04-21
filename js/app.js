document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 Orion iniciado (modo seguro)");

  try {

    // 🔥 dados globais seguros
    window.transactions = DB.get("t") || [];
    window.accounts = DB.get("acc") || [];
    window.debts = DB.get("debts") || [];
    window.ACCOUNT_CACHE = {};

    // 🔥 init contas
    if(window.AccountsModule?.init){
      AccountsModule.init();
    }

    if(window.AccountsModule?.updateCache){
      AccountsModule.updateCache();
    }

    // 🔥 bind form
    if(window.TransactionsModule?.bind){
      TransactionsModule.bind();
    }

    // 🔥 bind dívidas
    if(window.DebtsModule?.bind){
      DebtsModule.bind();
    }

    // 🔥 UI (PROTEGIDO)
    if(window.UIModule?.bind){
      UIModule.bind();
    }

    if(window.UIModule?.go){
      UIModule.go("home");
    }

  } catch(e){
    console.log("💥 ERRO CRÍTICO:", e);
    alert("Erro ao iniciar o app");
  }

});


// 🔄 atualização SEM QUEBRAR TELA
function refreshAll(){

  try {

    if(window.AccountsModule?.updateCache){
      AccountsModule.updateCache();
    }

    if(window.UIModule?.renderHome){
      UIModule.renderHome();
    }

    if(window.TransactionsModule?.render){
      TransactionsModule.render();
    }

    if(window.DebtsModule?.render){
      DebtsModule.render();
    }

    if(window.DashboardModule?.render){
      DashboardModule.render();
    }

    if(window.CreditModule?.render){
      CreditModule.render();
    }

  } catch(e){
    console.log("Erro refresh:", e);
  }
}


// 🔥 SERVICE WORKER (CAMINHO CORRETO)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js")
    .then(() => console.log("✅ SW ok"))
    .catch(err => console.log("SW erro:", err));
}