window.DashboardModule = (function(){

  function render(){

    const canvas = document.getElementById("dashChart");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const total = STATE.income + STATE.outcome;
    if(total === 0) return;

    const incomeBar = (STATE.income / total) * canvas.height;
    const outcomeBar = (STATE.outcome / total) * canvas.height;

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(20, canvas.height - incomeBar, 40, incomeBar);

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(80, canvas.height - outcomeBar, 40, outcomeBar);
  }

  return { render };

})();
