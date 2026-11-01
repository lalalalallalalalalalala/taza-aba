/* Таза Аба · премиальная карточка AQI — вариант A «атмосфера» (v62).
 * Только оформление поверх карточки .hero: цифры берутся из тех же данных (air, hAqi), подпись о модели остаётся. */
(function(){"use strict";
var V="A";document.documentElement.dataset.aqiv=V;
var TX={ru:{wind:"Ветер",temp:"Воздух",upd:"обновлено",ms:"м/с",ug:"мкг/м³",scale:"Шкала US AQI"},
        ky:{wind:"Шамал",temp:"Аба",upd:"жаңыланды",ms:"м/с",ug:"мкг/м³",scale:"US AQI шкаласы"},
        en:{wind:"Wind",temp:"Air temp",upd:"updated",ms:"m/s",ug:"µg/m³",scale:"US AQI scale"}};
function T(k){var l=(typeof LANG!=="undefined"&&TX[LANG])?LANG:"ru";return TX[l][k]||TX.ru[k]}
var BR=[0,50,100,150,200,300,500];
/* позиция на шкале: 6 равных сегментов по категориям US AQI */
function pos(v){v=Math.max(0,Math.min(500,v||0));for(var i=1;i<BR.length;i++)if(v<=BR[i])return((i-1)+(v-BR[i-1])/(BR[i]-BR[i-1]))/6;return 1}
var COL=["#2fbf71","#e3b505","#ff8a3d","#e5484d","#8e44ad","#7a1f2b"];
function nf(v,d){if(v==null||isNaN(v))return"—";try{return Number(v).toLocaleString(typeof LANG!=="undefined"&&LANG==="en"?"en-US":"ru-RU",{minimumFractionDigits:d,maximumFractionDigits:d})}catch(e){return(+v).toFixed(d)}}
function el(h){var t=document.createElement("template");t.innerHTML=h.trim();return t.content.firstChild}
function apEsc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var PIN='<svg class="aq-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
function stats(a,w){
  var c=[["PM2.5",nf(a.pm25,1),T("ug")]];
  if(a.pm10!=null)c.push(["PM10",nf(a.pm10,0),T("ug")]);
  if(w){c.push([T("wind"),nf(w.wind_speed_10m,1),T("ms")]);c.push([T("temp"),nf(w.temperature_2m,0),"°C"])}
  return '<div class="aq-stats">'+c.map(function(x){return '<div><span>'+x[0]+'</span><b>'+x[1]+'<small>'+x[2]+'</small></b></div>'}).join("")+'</div>';
}
function scale(v,lv){
  var p=(pos(v)*100).toFixed(2);
  return '<div class="aq-scale" role="img" aria-label="'+T("scale")+': '+v+'"><div class="aq-bar">'+COL.map(function(c){return '<i style="background:'+c+'"></i>'}).join("")+'</div><i class="aq-mk" style="left:'+p+'%"></i>'+
    '<div class="aq-tk">'+BR.map(function(b,i){return '<span style="left:'+(i/6*100).toFixed(2)+'%">'+b+'</span>'}).join("")+'</div></div>';
}
function enhance(){
  var h=document.querySelector("#view.v-home .hero");if(!h||h.querySelector(".aq-head"))return;
  var d,a,w;try{d=byId(state.district);a=air.byDistrict[d.id];w=air.weather}catch(e){return}
  if(!a||a.aqi==null)return;
  var m=/lv(\d)/.exec(h.className),li=m?+m[1]:0,v=Math.round(a.aqi);
  var lvTxt=(h.querySelector(".level")||{}).textContent||"",title=(h.querySelector(".hero-title")||{}).textContent||"",
      dist=((h.querySelector(".district")||{}).textContent||"").trim(),time=(a.currentTime||"").slice(11,16);
  h.classList.add("aq-p","aq-"+V);h.style.setProperty("--lvc",COL[Math.min(li,5)]);
  var head='<div class="aq-head"><div class="aq-sky" aria-hidden="true"><i></i><i></i></div>'+
      '<div class="aq-loc">'+PIN+'<span>'+apEsc(dist)+'</span><em>'+T("upd")+' '+time+'</em></div>'+
      '<div class="aq-main"><div class="aq-num" aria-label="US AQI '+v+'">'+v+'</div><div class="aq-lvl"><span class="aq-u">US AQI</span><b>'+apEsc(lvTxt)+'</b><span>'+apEsc(title)+'</span></div></div>'+
      scale(v,li)+stats(a,w)+'</div>';
  var top=h.querySelector(".hero-top");h.insertBefore(el(head),top||h.firstChild);
}
function apStart(){var vw=document.getElementById("view");if(!vw)return;enhance();new MutationObserver(enhance).observe(vw,{childList:true,subtree:true})}
if(document.readyState!=="loading")apStart();else document.addEventListener("DOMContentLoaded",apStart);
})();
