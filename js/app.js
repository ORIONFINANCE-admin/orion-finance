document.addEventListener("DOMContentLoaded", () => {

  // inicializa módulos novos
  if(window.AccountsModule){
    AccountsModule.init();
  }

  if(window.UIModule){
    UIModule.bind();
  }

});
