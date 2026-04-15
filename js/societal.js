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
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.counter-cell,.milestone-card,.impact-item').forEach(el=>revIO.observe(el));
function sync(c){const dpr=window.devicePixelRatio||1,r=c.getBoundingClientRect();const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);if(c.width===cw&&c.height===ch)return;c.width=cw;c.height=ch;c.getContext('2d').scale(dpr,dpr);}

/* ASSOC CANVAS — network of farmers growing */
(function(){
  const c=document.getElementById('assoc-canvas');if(!c)return;const ctx=c.getContext('2d');let t=0;
  /* 196 nodes = community members, clustered in groups */
  const NODES=Array.from({length:60},(_,i)=>({x:(.1+Math.random()*.8),y:(.1+Math.random()*.8),r:Math.random()*5+2.5,phase:Math.random()*Math.PI*2,speed:(Math.random()-.5)*.0003,vx:(Math.random()-.5)*.0002,vy:(Math.random()-.5)*.0002,col:['#c8a052','#6b8c6b','#8ab870','#d4b870'][i%4]}));
  function draw(){t+=.007;sync(c);const W=c.offsetWidth,H=c.offsetHeight;ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#2a3d22');bg.addColorStop(1,'#1a2814');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  /* subtle grid */ctx.strokeStyle='rgba(107,140,107,.05)';ctx.lineWidth=.5;for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  NODES.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<.02||n.x>.98)n.vx*=-1;if(n.y<.02||n.y>.98)n.vy*=-1;});
  /* connections */
  for(let i=0;i<NODES.length;i++)for(let j=i+1;j<NODES.length;j++){const a=NODES[i],b=NODES[j];const d=Math.hypot((a.x-b.x)*W,(a.y-b.y)*H);if(d<W*.18){ctx.beginPath();ctx.moveTo(a.x*W,a.y*H);ctx.lineTo(b.x*W,b.y*H);ctx.strokeStyle=`rgba(200,160,82,${(1-d/(W*.18))*.1})`;ctx.lineWidth=.5;ctx.stroke();}}
  NODES.forEach(n=>{const pulse=1+Math.sin(t+n.phase)*.15;ctx.beginPath();ctx.arc(n.x*W,n.y*H,n.r*pulse,0,Math.PI*2);ctx.fillStyle=n.col;ctx.globalAlpha=.7;ctx.fill();ctx.globalAlpha=1;});
  /* central big node = company */
  const cx=W*.5,cy=H*.5;const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,40);cg.addColorStop(0,'rgba(200,160,82,.3)');cg.addColorStop(1,'rgba(200,160,82,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,40,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,16,0,Math.PI*2);ctx.fillStyle='#c8a052';ctx.fill();
  ctx.fillStyle='rgba(30,35,24,.9)';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('SHS',cx,cy);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  /* bottom fade */const fade=ctx.createLinearGradient(0,H*.76,0,H);fade.addColorStop(0,'rgba(26,40,20,0)');fade.addColorStop(1,'rgba(26,40,20,.85)');ctx.fillStyle=fade;ctx.fillRect(0,0,W,H);
  requestAnimationFrame(draw);}draw();
})();

/* IMPACT CANVAS — fairtrade scales / rising chart */
(function(){
  const c=document.getElementById('impact-canvas');if(!c)return;const ctx=c.getContext('2d');let t=0;
  const BARS=[{v:.35,col:'rgba(107,140,107,.5)',lbl:'2006'},{v:.55,col:'rgba(107,140,107,.62)',lbl:'2008'},{v:.7,col:'rgba(107,140,107,.72)',lbl:'2010'},{v:.8,col:'rgba(200,160,82,.7)',lbl:'2012'},{v:.88,col:'rgba(200,160,82,.8)',lbl:'2015'},{v:.94,col:'rgba(200,160,82,.9)',lbl:'2020'},{v:.99,col:'#c8a052',lbl:'Today'}];
  function draw(){t+=.005;sync(c);const W=c.offsetWidth,H=c.offsetHeight;ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#ede5d0');bg.addColorStop(1,'#e0d4bc');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(107,140,107,.1)';ctx.lineWidth=.5;for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  const bw=W/(BARS.length*1.6);const gap=bw*.6;const totalW=BARS.length*(bw+gap)-gap;const startX=(W-totalW)/2;
  BARS.forEach((b,i)=>{
    const x=startX+i*(bw+gap);
    const animV=b.v*(1-Math.max(0,Math.sin(t+i*.3)*.02));
    const bH=animV*(H*.72);const by=H*.88-bH;
    /* bar */
    const grad=ctx.createLinearGradient(x,by,x,H*.88);grad.addColorStop(0,b.col);grad.addColorStop(1,b.col.replace(/[\d.]+\)$/,'0.2)'));
    ctx.fillStyle=grad;ctx.fillRect(x,by,bw,bH);
    /* top glow */
    ctx.fillStyle=b.col.replace(/[\d.]+\)$/,'0.4)');ctx.fillRect(x,by,bw,3);
    /* year label */
    ctx.fillStyle='rgba(30,35,24,.5)';ctx.font='400 9px sans-serif';ctx.textAlign='center';ctx.fillText(b.lbl,x+bw/2,H*.93);
    /* value */
    ctx.fillStyle=i===6?'#c8a052':'rgba(30,35,24,.6)';ctx.font=`${i===6?'500':'400'} 10px sans-serif`;ctx.fillText(Math.round(animV*196)+' mbrs',x+bw/2,by-8);
    ctx.textAlign='left';
  });
  /* axis line */ctx.strokeStyle='rgba(107,140,107,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(startX-10,H*.88);ctx.lineTo(startX+totalW+10,H*.88);ctx.stroke();
  /* title */ctx.fillStyle='rgba(30,35,24,.4)';ctx.font='300 10px sans-serif';ctx.textAlign='center';ctx.fillText('Association member growth',W/2,H*.04+14);ctx.textAlign='left';
  requestAnimationFrame(draw);}draw();
})();