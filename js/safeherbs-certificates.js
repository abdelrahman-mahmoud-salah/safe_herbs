'use strict';

/* CURSOR */
const $cur=document.getElementById('cur'),$ring=document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
(function cl(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;$cur.style.transform = `translate3d(${mx}px, ${my}px, 0)`;$ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;requestAnimationFrame(cl);})();
document.querySelectorAll('a,button,.cert-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{$cur.style.width=$cur.style.height='16px';$ring.style.width=$ring.style.height='56px';});
  el.addEventListener('mouseleave',()=>{$cur.style.width=$cur.style.height='8px';$ring.style.width=$ring.style.height='36px';});
});

/* NAV */
window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>60),{passive:true});

/* HAMBURGER */
let menuOpen=false;
function toggleMenu(){menuOpen=!menuOpen;document.getElementById('mobileMenu').classList.toggle('open',menuOpen);const[s0,s1,s2]=document.querySelectorAll('.hamburger span');s0.style.transform=menuOpen?'rotate(45deg) translate(4px,4px)':'';s1.style.opacity=menuOpen?'0':'1';s2.style.transform=menuOpen?'rotate(-45deg) translate(4px,-4px)':'';}
function closeMobile(){menuOpen=false;document.getElementById('mobileMenu').classList.remove('open');document.querySelectorAll('.hamburger span').forEach(s=>{s.style.transform='';s.style.opacity='1';});}

/* REVEAL */
const revIO=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:.08});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.cert-card,.stat-cell,.pillar').forEach(el=>revIO.observe(el));

/* DOWNLOAD TRACKER — visual feedback on click */
function trackDownload(name){
  console.log('Certificate downloaded:', name);
}

/* CANVAS SYNC */
function sync(c){const dpr=window.devicePixelRatio||1,r=c.getBoundingClientRect();const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);if(c.width===cw&&c.height===ch)return;c.width=cw;c.height=ch;c.getContext('2d').scale(dpr,dpr);}

/* HERO CANVAS — organic particles */
(function(){
  const c=document.getElementById('hero-canvas');const ctx=c.getContext('2d');let t=0;
  const COLORS=['rgba(107,140,107,','rgba(200,160,82,','rgba(90,130,70,'];
  const pts=Array.from({length:60},(_,i)=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.00017,vy:-(Math.random()*.00019+.00004),r:Math.random()*4+1.5,al:Math.random()*.28+.06,ph:Math.random()*Math.PI*2,col:COLORS[i%3]}));
  function draw(){t+=.005;sync(c);const W=c.offsetWidth,H=c.offsetHeight;ctx.clearRect(0,0,W,H);
  const bg=ctx.createRadialGradient(W*.5,H*.45,0,W*.5,H*.5,W*.85);bg.addColorStop(0,'#172412');bg.addColorStop(.6,'#0d1a0a');bg.addColorStop(1,'#060c04');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  /* rings */[.18,.32,.48,.62].forEach((r,ri)=>{ctx.beginPath();ctx.arc(W*.5,H*.45,r*Math.min(W,H),0,Math.PI*2);ctx.strokeStyle=`rgba(107,140,107,${.06-.012*ri})`;ctx.lineWidth=.8;ctx.stroke();});
  /* scan */const sy=(H*.1+(Math.sin(t*.4)+1)*.5*H*.65);const sg=ctx.createLinearGradient(0,sy-18,0,sy+18);sg.addColorStop(0,'rgba(200,160,82,0)');sg.addColorStop(.5,'rgba(200,160,82,.12)');sg.addColorStop(1,'rgba(200,160,82,0)');ctx.fillStyle=sg;ctx.fillRect(0,sy-18,W,36);
  pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.y<-.02){p.y=1.02;p.x=Math.random();}if(p.x<-.05||p.x>1.05)p.x=Math.random();ctx.beginPath();ctx.arc(p.x*W,p.y*H,p.r,0,Math.PI*2);ctx.fillStyle=p.col+(p.al*(1+Math.sin(t*2+p.ph)*.18))+')';ctx.fill();});
  const vg=ctx.createLinearGradient(0,H*.75,0,H);vg.addColorStop(0,'rgba(6,12,4,0)');vg.addColorStop(1,'rgba(6,12,4,1)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  requestAnimationFrame(draw);}draw();
})();

/* PHILOSOPHY CANVAS — orbiting cert nodes */
(function(){
  const c=document.getElementById('phil-canvas');if(!c)return;const ctx=c.getContext('2d');let t=0;
  const RINGS=[{r:.26,count:3,spd:.009,off:0},{r:.40,count:4,spd:-.006,off:.4},{r:.54,count:4,spd:.004,off:.9}];
  const COLORS=['#c8a052','#6b8c6b','#8a9a5b'];
  const LABELS=['ISO','EU','NOP','FSSC','FDA','FT','RA','UEBT','Sedex','NFSA','FT'];
  let lIdx=0;
  const nodes=RINGS.flatMap((ring,ri)=>Array.from({length:ring.count},(_,i)=>({ring,ri,phase:(i/ring.count)*Math.PI*2+ring.off,label:LABELS[lIdx++]||'✓',col:COLORS[ri]})));
  function draw(){t+=.007;sync(c);const W=c.offsetWidth,H=c.offsetHeight;ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#2a3d22');bg.addColorStop(1,'#1a2814');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  const cx=W*.5,cy=H*.5;
  RINGS.forEach((ring,ri)=>{ctx.beginPath();ctx.arc(cx,cy,ring.r*Math.min(W,H),0,Math.PI*2);ctx.strokeStyle='rgba(107,140,107,.1)';ctx.lineWidth=.6;ctx.stroke();});
  const pos=nodes.map(n=>({x:cx+Math.cos(n.phase+t*n.ring.spd)*n.ring.r*Math.min(W,H),y:cy+Math.sin(n.phase+t*n.ring.spd)*n.ring.r*Math.min(W,H)*.65,n}));
  pos.forEach((a,i)=>pos.forEach((b,j)=>{if(j<=i)return;const d=Math.hypot(a.x-b.x,a.y-b.y);if(d<Math.min(W,H)*.22){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(200,160,82,${(1-d/(Math.min(W,H)*.22))*.12})`;ctx.lineWidth=.5;ctx.stroke();}}));
  pos.forEach(({x,y,n})=>{const grd=ctx.createRadialGradient(x,y,0,x,y,18);grd.addColorStop(0,n.col+'44');grd.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.strokeStyle=n.col;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='rgba(26,40,20,.85)';ctx.fill();ctx.fillStyle=n.col;ctx.font=`500 8px 'Jost',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.label,x,y);});
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  /* centre */const cr=Math.min(W,H)*.09;const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,cr*1.4);cg.addColorStop(0,'rgba(200,160,82,.2)');cg.addColorStop(1,'rgba(200,160,82,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,cr*1.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx,cy,cr,0,Math.PI*2);ctx.strokeStyle='rgba(200,160,82,.5)';ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle='rgba(26,40,20,.85)';ctx.fill();ctx.fillStyle='#c8a052';ctx.font=`300 ${Math.round(cr*.48)}px 'Cormorant Garamond',serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('11',cx,cy-cr*.1);ctx.font=`400 ${Math.round(cr*.18)}px 'Jost',sans-serif`;ctx.fillStyle='rgba(200,160,82,.6)';ctx.fillText('CERTS',cx,cy+cr*.32);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  requestAnimationFrame(draw);}draw();
})();