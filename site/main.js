(function(){
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};

// split headline into animated words
$$('[data-split]').forEach(function(el){
  var i=0;
  (function walk(n){
    [].slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===3){
        var f=document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(' '));return}
          var w=document.createElement('span');w.className='w';
          var s=document.createElement('span');s.style.setProperty('--i',i++);s.textContent=p;w.appendChild(s);f.appendChild(w);
        });
        n.replaceChild(f,c);
      }else if(c.nodeType===1)walk(c);
    });
  })(el);
});

// header + scroll progress
var header=$('header'),bar=$$('.progress i');
function onScroll(){
  var y=scrollY,max=document.documentElement.scrollHeight-innerHeight,p=max>0?y/max:0;
  header.classList.toggle('scrolled',y>10);
  bar.forEach(function(b,i){var f=Math.min(1,Math.max(0,p*bar.length-i));b.style.setProperty('--f',f)});
  if(!reduce&&innerWidth>860){$$('.pw').forEach(function(el,i){
    var r=el.getBoundingClientRect(),c=(r.top+r.height/2-innerHeight/2)/innerHeight;
    el.style.setProperty('--py',(c*(i%2?-46:46)).toFixed(1)+'px');
  })}
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

// counters
function count(el){
  var to=+el.dataset.count,dur=1800,t0=null,fmt=function(n){return Math.round(n).toLocaleString(document.documentElement.lang==='fr'?'fr-FR':'en-US').replace(/[  ]/g,' ')};
  if(reduce){el.textContent=fmt(to);return}
  (function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=fmt(to*e);if(k<1)requestAnimationFrame(step)})(performance.now());
}

// pace state demo
function cycle(root){
  var st=JSON.parse(root.dataset.states),segs=$$('.segs i',root),label=$('.state',root),n=0;
  function go(){
    var s=st[n%st.length];n++;
    root.style.setProperty('--c',s.c);
    segs.forEach(function(g,i){g.classList.toggle('on',i<s.f)});
    label.textContent=s.t;
  }
  go();if(!reduce)setInterval(go,2400);
}
$$('[data-states]').forEach(cycle);

// reveal on scroll
var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;
  e.target.classList.add('in');
  $$('[data-count]',e.target).forEach(count);
  if(e.target.matches('[data-count]'))count(e.target);
  io.unobserve(e.target);
})},{threshold:.2});
$$('.rv,.chart,.final,[data-count]').forEach(function(el){io.observe(el)});
$$('.hero [data-count]').forEach(function(el){io.observe(el)});

// phone tilt
var stage=$('.stage'),ph=stage&&$('.phone',stage);
if(stage&&!reduce&&matchMedia('(hover:hover)').matches){
  stage.addEventListener('pointermove',function(e){
    var r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    ph.style.setProperty('--ry',(x*16)+'deg');ph.style.setProperty('--rx',(-y*12)+'deg');
  });
  stage.addEventListener('pointerleave',function(){ph.style.setProperty('--ry','0deg');ph.style.setProperty('--rx','0deg')});
}
})();
