'use strict';
const $cur=document.getElementById('cur'),$ring=document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
(function cl(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;$cur.style.transform = `translate3d(${mx}px, ${my}px, 0)`;$ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;requestAnimationFrame(cl);})();
document.querySelectorAll('a,button').forEach(el=>{el.addEventListener('mouseenter',()=>{$cur.style.width=$cur.style.height='16px';$ring.style.width=$ring.style.height='56px';});el.addEventListener('mouseleave',()=>{$cur.style.width=$cur.style.height='8px';$ring.style.width=$ring.style.height='36px';});});
window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>60),{passive:true});
let menuOpen=false;
function toggleMenu(){menuOpen=!menuOpen;document.getElementById('mobileMenu').classList.toggle('open',menuOpen);const[s0,s1,s2]=document.querySelectorAll('.hamburger span');s0.style.transform=menuOpen?'rotate(45deg) translate(4px,4px)':'';s1.style.opacity=menuOpen?'0':'1';s2.style.transform=menuOpen?'rotate(-45deg) translate(4px,-4px)':'';}
function closeMobile(){menuOpen=false;document.getElementById('mobileMenu').classList.remove('open');document.querySelectorAll('.hamburger span').forEach(s=>{s.style.transform='';s.style.opacity='1';});}
const revIO=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:.1});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.tl-item,.mv-card,.value-item,.stat-c').forEach(el=>revIO.observe(el));
function sync(c){const dpr=window.devicePixelRatio||1,r=c.getBoundingClientRect();const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);if(c.width===cw&&c.height===ch)return;c.width=cw;c.height=ch;c.getContext('2d').scale(dpr,dpr);}

/* HERO canvas — floating golden dust over green */
(function(){
  const c=document.getElementById('hero-canvas');const ctx=c.getContext('2d');let t=0;
  const pts=Array.from({length:50},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0002,vy:-(Math.random()*.00015+.00003),r:Math.random()*4+1.5,al:Math.random()*.3+.05,col:['#c8a052','#8ab870','#6b8c6b'][Math.floor(Math.random()*3)]}));
  function draw(){t+=.004;sync(c);const W=c.offsetWidth,H=c.offsetHeight;ctx.clearRect(0,0,W,H);
  pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.y<-.02){p.y=1.02;p.x=Math.random();}if(p.x<-.05||p.x>1.05)p.x=Math.random();
  ctx.beginPath();ctx.arc(p.x*W,p.y*H,p.r,0,Math.PI*2);ctx.fillStyle=p.col;ctx.globalAlpha=p.al*(1+Math.sin(t*2+p.x*5)*.2);ctx.fill();});ctx.globalAlpha=1;requestAnimationFrame(draw);}draw();
})();

/* STORY canvas — three generation tree */
(function(){
  const c=document.getElementById('story-canvas');if(!c)return;const ctx=c.getContext('2d');let t=0;
  function draw(){t+=.007;sync(c);const W=c.offsetWidth,H=c.offsetHeight;ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#2a3d22');bg.addColorStop(1,'#1a2814');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(107,140,107,.05)';ctx.lineWidth=.5;for(let y=0;y<H;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  /* tree trunk */
  const cx=W*.5,baseY=H*.92,trunkH=H*.5;
  ctx.strokeStyle='#6a5030';ctx.lineWidth=6;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(cx,baseY);ctx.bezierCurveTo(cx+Math.sin(t*.3)*8,baseY-trunkH*.3,cx-Math.sin(t*.25)*6,baseY-trunkH*.7,cx,baseY-trunkH);ctx.stroke();
  /* roots */
  ctx.strokeStyle='rgba(106,80,48,.4)';ctx.lineWidth=2;
  [-.4,-.2,.2,.4].forEach(rx=>{ctx.beginPath();ctx.moveTo(cx,baseY);ctx.bezierCurveTo(cx+rx*50,baseY+10,cx+rx*80,baseY+20,cx+rx*90,baseY+30);ctx.stroke();});
  /* branches + leaves — 3 layers (generations) */
  const gens=[{y:baseY-trunkH*.4,spread:70,leaves:8,col:'rgba(60,100,40,.55)',sz:22},{y:baseY-trunkH*.65,spread:55,leaves:10,col:'rgba(75,130,50,.65)',sz:18},{y:baseY-trunkH*.88,spread:40,leaves:12,col:'rgba(100,170,65,.7)',sz:14}];
  gens.forEach((g,gi)=>{
    const sw=Math.sin(t*.4+gi)*.015;
    for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;const bx=cx+Math.cos(a)*g.spread;const by=g.y+Math.sin(a)*g.spread*.4;
    ctx.strokeStyle='rgba(90,130,60,.45)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx,g.y);ctx.lineTo(bx+sw*20,by);ctx.stroke();
    ctx.save();ctx.translate(bx+sw*20,by);ctx.rotate(a+sw*2);ctx.fillStyle=g.col;ctx.beginPath();ctx.moveTo(0,-g.sz);ctx.bezierCurveTo(g.sz*.5,-g.sz*.4,g.sz*.5,g.sz*.4,0,g.sz);ctx.bezierCurveTo(-g.sz*.5,g.sz*.4,-g.sz*.5,-g.sz*.4,0,-g.sz);ctx.fill();ctx.restore();}
  });
  /* golden glow around top */
  const gg=ctx.createRadialGradient(cx,baseY-trunkH,0,cx,baseY-trunkH,60);gg.addColorStop(0,'rgba(200,160,82,.2)');gg.addColorStop(1,'rgba(200,160,82,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(cx,baseY-trunkH,60,0,Math.PI*2);ctx.fill();
  /* bottom fade */
  const fade=ctx.createLinearGradient(0,H*.78,0,H);fade.addColorStop(0,'rgba(26,40,20,0)');fade.addColorStop(1,'rgba(26,40,20,.85)');ctx.fillStyle=fade;ctx.fillRect(0,0,W,H);
  requestAnimationFrame(draw);}draw();
})();