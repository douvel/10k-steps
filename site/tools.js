(function(){
var fr=document.documentElement.lang==='fr',loc=fr?'fr-FR':'en-US';
var $=function(id){return document.getElementById(id)};
function n(v,d){return (Math.round(v*Math.pow(10,d||0))/Math.pow(10,d||0)).toLocaleString(loc,{minimumFractionDigits:d||0,maximumFractionDigits:d||0}).replace(/[  ]/g,' ')}
function steps(v){return n(Math.round(v))}
function dur(min){min=Math.round(min);var h=Math.floor(min/60),m=min%60;return h?h+' h '+(m<10?'0':'')+m:m+' min'}

// Steps <-> distance
var sd=$('sd');
if(sd){
  var FACT={f:.413,m:.415,x:.414};
  function calc(){
    var hv=parseFloat($('sd-h').value)||0,unit=$('sd-u')?$('sd-u').value:'cm';
    var hcm=unit==='in'?hv*2.54:hv;
    var stride=hcm/100*FACT[$('sd-s').value];
    var st=Math.max(0,parseFloat($('sd-n').value)||0);
    var km=st*stride/1000;
    $('sd-km').textContent=n(km,km<10?2:1)+' km';
    $('sd-mi').textContent=n(km/1.609344,km<16?2:1)+(fr?' miles':' mi');
    $('sd-str').textContent=unit==='in'?n(stride*100/2.54)+' in':n(stride*100)+' cm';
    $('sd-t').textContent=dur(st/100);
    var goal=parseFloat($('sd-d').value)||0,du=$('sd-du')?$('sd-du').value:'km';
    var gkm=du==='mi'?goal*1.609344:goal;
    $('sd-need').textContent=stride>0?steps(gkm*1000/stride):'–';
  }
  sd.addEventListener('input',calc);calc();
}

// Monthly step goal pace
var mp=$('mp');
if(mp){
  var d0=new Date();$('mp-d').value=d0.getFullYear()+'-'+String(d0.getMonth()+1).padStart(2,'0')+'-'+String(d0.getDate()).padStart(2,'0');
  function run(){
    var goal=Math.max(0,parseFloat($('mp-g').value)||0),done=Math.max(0,parseFloat($('mp-t').value)||0);
    var p=($('mp-d').value||'').split('-');if(p.length<3)return;
    var y=+p[0],m=+p[1],day=+p[2],dim=new Date(y,m,0).getDate();
    var excl=$('mp-x').checked,left=dim-day+1-(excl?1:0);
    var target=goal*dim,rest=Math.max(0,target-done);
    $('mp-goal').textContent=steps(target);
    $('mp-rest').textContent=steps(rest);
    $('mp-avg').textContent=rest===0?(fr?'Atteint !':'Done!'):left>0?steps(rest/left):'–';
    $('mp-days').textContent=fr?(left+(left>1?' jours':' jour')+(excl?' (à partir de demain)':' (incluant aujourd\'hui)')):(left+(left===1?' day':' days')+(excl?' (from tomorrow)':' (including today)'));
    var gap=done-goal*(day-1);
    $('mp-gap').textContent=(gap>=0?'+':'')+steps(gap);
    $('mp-gapl').textContent=fr?(gap>=0?'pas d\'avance (fin d\'hier)':'pas de retard (fin d\'hier)'):(gap>=0?'steps ahead (end of yesterday)':'steps behind (end of yesterday)');
    $('mp-x').parentNode.style.display=dim-day+1===1?'none':'';
  }
  mp.addEventListener('input',run);mp.addEventListener('change',run);run();
}
})();
