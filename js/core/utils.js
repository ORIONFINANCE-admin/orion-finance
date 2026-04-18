window.money = function(v){
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

window.formatDateLabel = function(timestamp){

  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if(d.toDateString() === today.toDateString()) return "Hoje";
  if(d.toDateString() === yesterday.toDateString()) return "Ontem";

  return d.toLocaleDateString("pt-BR");
};
