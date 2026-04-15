'use strict';
const $cur=document.getElementById('cur'),$ring=document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
(function cl(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;$cur.style.transform = `translate3d(${mx}px, ${my}px, 0)`;$ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;requestAnimationFrame(cl);})();
document.querySelectorAll('a,button,input,select,textarea').forEach(el=>{el.addEventListener('mouseenter',()=>{$cur.style.width=$cur.style.height='16px';$ring.style.width=$ring.style.height='56px';});el.addEventListener('mouseleave',()=>{$cur.style.width=$cur.style.height='8px';$ring.style.width=$ring.style.height='36px';});});
window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>60),{passive:true});
let menuOpen=false;
function toggleMenu(){menuOpen=!menuOpen;document.getElementById('mobileMenu').classList.toggle('open',menuOpen);const[s0,s1,s2]=document.querySelectorAll('.hamburger span');s0.style.transform=menuOpen?'rotate(45deg) translate(4px,4px)':'';s1.style.opacity=menuOpen?'0':'1';s2.style.transform=menuOpen?'rotate(-45deg) translate(4px,-4px)':'';}
function closeMobile(){menuOpen=false;document.getElementById('mobileMenu').classList.remove('open');document.querySelectorAll('.hamburger span').forEach(s=>{s.style.transform='';s.style.opacity='1';});}
const revIO=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:.1});
document.querySelectorAll('.reveal,.person-card').forEach(el=>revIO.observe(el));
function sync(c){const dpr=window.devicePixelRatio||1,r=c.getBoundingClientRect();const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);if(c.width===cw&&c.height===ch)return;c.width=cw;c.height=ch;c.getContext('2d').scale(dpr,dpr);}

/* FORM SUBMIT */
function handleSubmit(e){
  e.preventDefault();
  const btn=document.getElementById('submitBtn');
  btn.textContent='Message Sent ✓';btn.style.background='var(--sage)';btn.style.color='#fff';
  btn.disabled=true;
  setTimeout(()=>{btn.textContent='Send Message ✦';btn.style.background='';btn.style.color='';btn.disabled=false;},4000);
}

/* HERO CANVAS — golden particles floating over dark */
(function(){
  const c=document.getElementById('hero-canvas');const ctx=c.getContext('2d');let t=0;
  const pts=Array.from({length:55},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0002,vy:-(Math.random()*.00015+.00004),r:Math.random()*3+1,al:Math.random()*.25+.06,col:['#c8a052','#e2c07a','#8ab870'][Math.floor(Math.random()*3)]}));
  function draw(){t+=.004;sync(c);const W=c.offsetWidth,H=c.offsetHeight;ctx.clearRect(0,0,W,H);
  pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.y<-.02){p.y=1.02;p.x=Math.random();}if(p.x<-.05||p.x>1.05)p.x=Math.random();
  ctx.beginPath();ctx.arc(p.x*W,p.y*H,p.r,0,Math.PI*2);ctx.fillStyle=p.col;ctx.globalAlpha=p.al;ctx.fill();});ctx.globalAlpha=1;requestAnimationFrame(draw);}draw();
})();

/* MAP CANVAS — Egypt map with Fayoum pin + export lines */
(function(){
  const c=document.getElementById('map-canvas');if(!c)return;const ctx=c.getContext('2d');let t=0;
  /* world export endpoints (approximate relative positions for Europe, USA, Asia, Gulf) */
  const EXPORTS=[{tx:.15,ty:.35,lbl:'Europe'},{tx:.82,ty:.28,lbl:'Asia'},{tx:.88,ty:.55,lbl:'Gulf'},{tx:.05,ty:.45,lbl:'Americas'}];
  const FAYOUM={x:.45,y:.56};
  function draw(){t+=.006;sync(c);const W=c.offsetWidth,H=c.offsetHeight;ctx.clearRect(0,0,W,H);
  /* dark map bg */
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0e1a0c');bg.addColorStop(1,'#080e08');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  /* grid */ctx.strokeStyle='rgba(107,140,107,.06)';ctx.lineWidth=.4;for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  /* export arc lines */
  const fx=FAYOUM.x*W,fy=FAYOUM.y*H;
  EXPORTS.forEach((ex,i)=>{
    const tx=ex.tx*W,ty=ex.ty*H;
    const progress=(t*.4+i*.4)%1;
    const grad=ctx.createLinearGradient(fx,fy,tx,ty);grad.addColorStop(0,'rgba(200,160,82,0)');grad.addColorStop(.5,'rgba(200,160,82,.35)');grad.addColorStop(1,'rgba(200,160,82,0)');
    ctx.strokeStyle=grad;ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.lineDashOffset=-t*20;
    ctx.beginPath();const cpx=(fx+tx)/2,cpy=Math.min(fy,ty)-80;ctx.moveTo(fx,fy);ctx.quadraticCurveTo(cpx,cpy,tx,ty);ctx.stroke();ctx.setLineDash([]);
    /* travelling dot */
    const dt=((t*.3+i*.25)%1);const bx=(1-dt)*(1-dt)*fx+2*(1-dt)*dt*cpx+dt*dt*tx;const by=(1-dt)*(1-dt)*fy+2*(1-dt)*dt*cpy+dt*dt*ty;
    ctx.beginPath();ctx.arc(bx,by,3,0,Math.PI*2);ctx.fillStyle='rgba(200,160,82,.9)';ctx.fill();
    /* destination label */
    ctx.fillStyle='rgba(245,240,232,.4)';ctx.font='300 10px sans-serif';ctx.textAlign=ex.tx<.5?'right':'left';ctx.fillText(ex.lbl,tx+(ex.tx<.5?-8:8),ty+4);ctx.textAlign='left';
    /* dest dot */ctx.beginPath();ctx.arc(tx,ty,3.5,0,Math.PI*2);ctx.fillStyle='rgba(200,160,82,.5)';ctx.fill();
  });
  /* Fayoum main pin */
  const pulse=1+Math.sin(t*2)*.3;
  ctx.beginPath();ctx.arc(fx,fy,18*pulse,0,Math.PI*2);ctx.fillStyle='rgba(200,160,82,.1)';ctx.fill();
  ctx.beginPath();ctx.arc(fx,fy,9,0,Math.PI*2);ctx.fillStyle='rgba(200,160,82,.25)';ctx.fill();
  ctx.beginPath();ctx.arc(fx,fy,5,0,Math.PI*2);ctx.fillStyle='#c8a052';ctx.fill();
  /* pin label */
  ctx.fillStyle='rgba(245,240,232,.7)';ctx.font='500 11px sans-serif';ctx.textAlign='center';ctx.fillText('FAYOUM',fx,fy-22);
  ctx.font='300 9px sans-serif';ctx.fillStyle='rgba(245,240,232,.4)';ctx.fillText('Egypt',fx,fy-10);ctx.textAlign='left';
  requestAnimationFrame(draw);}draw();
})();