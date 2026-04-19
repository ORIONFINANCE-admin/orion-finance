window.DashboardModule = (function(){

  function render(){

    const realEl = document.getElementById("dashReal");
    const totalEl = document.getElementById("dashTotal");
    const outEl = document.getElementById("dashOut");

    let total = 0;
    let income = 0;
    let outcome = 0;

    (window.accounts || []).forEach(a=>{
      total += (a.initialBalance ?? a.balance ?? 0);
    });

    (window.transactions || []).forEach(t=>{
      if(t.type === "entrada"){
        total += t.value;
        income += t.value;
      } else {
        if(t.paymentType !== "credito"){
          total -= t.value;
        }
        outcome += t.value;
      }
    });

    if(realEl) realEl.innerText = money(total - outcome);
    if(totalEl) totalEl.innerText = money(income);
    if(outEl) outEl.innerText = money(outcome);

    drawChart(income, outcome);
  }

  function drawChart(income, outcome){

    const canvas = document.getElementById("dashChart");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const total = income + outcome || 1;

    const incomeH = (income / total) * canvas.height;
    const outcomeH = (outcome / total) * canvas.height;

    // Entrada
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(40, canvas.height - incomeH, 50, incomeH);

    // Saída
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(120, canvas.height - outcomeH, 50, outcomeH);

    // Labels simples
    ctx.fillStyle = "#aaa";
    ctx.font = "12px sans-serif";

    ctx.fillText("Entrada", 40, canvas.height - incomeH - 5);
    ctx.fillText("Saída", 120, canvas.height - outcomeH - 5);
  }

  return {
    render
  };

})();