window.UIModule = (function(){

  function toggleBalance(){
    let hide = localStorage.getItem("hideBalance") === "true";
    hide = !hide;

    localStorage.setItem("hideBalance", hide);

    renderHome();
  }

  function bind(){

    document.getElementById("eyeBtn")
      ?.addEventListener("click", toggleBalance);

    document.getElementById("settingsBtn")
      ?.addEventListener("click", openSettings);
  }

  return {
    bind
  };

})();
