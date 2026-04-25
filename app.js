let a=2,b=-3,c=1;
let correct;

const graph=document.getElementById("graph");
const question=document.getElementById("question");

function resizeCanvas(){
  const rect=graph.getBoundingClientRect();
  graph.width=rect.width;
  graph.height=rect.width;
}
window.addEventListener("resize",resizeCanvas);
window.addEventListener("load",resizeCanvas);

function login(){
  generate();
}

function generate(){
  a=2; b=-3; c=1;
  correct=-b/(2*a);

  question.innerText=
`y = ${a}x² ${b<0?b:"+"+b}x ${c>=0?"+":""}${c}
の頂点のx座標を求めよ`;

  drawGraph();
}

function check(){
  generate();
}

function drawGraph(){
  const ctx=graph.getContext("2d");
  const w=graph.width;
  const h=graph.height;

  ctx.clearRect(0,0,w,h);

  let scale=20;
  let cx=w/2, cy=h/2;

  ctx.strokeStyle="rgba(255,255,255,0.2)";
  for(let i=-10;i<=10;i++){
    ctx.beginPath();
    ctx.moveTo(cx+i*scale,0);
    ctx.lineTo(cx+i*scale,h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,cy-i*scale);
    ctx.lineTo(w,cy-i*scale);
    ctx.stroke();
  }

  ctx.strokeStyle="white";
  ctx.beginPath();
  ctx.moveTo(0,cy); ctx.lineTo(w,cy); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx,0); ctx.lineTo(cx,h); ctx.stroke();

  ctx.fillStyle="white";
  ctx.fillText("x",w-20,cy-10);
  ctx.fillText("y",cx+10,20);

  ctx.strokeStyle="#38bdf8";
  ctx.lineWidth=3;
  ctx.beginPath();

  for(let x=-10;x<=10;x+=0.05){
    let y=a*x*x+b*x+c;
    let px=cx+x*scale;
    let py=cy-y*scale;
    if(x===-10) ctx.moveTo(px,py);
    else ctx.lineTo(px,py);
  }
  ctx.stroke();

  let vx=-b/(2*a);
  let vy=a*vx*vx+b*vx+c;

  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(cx+vx*scale,cy-vy*scale,5,0,Math.PI*2);
  ctx.fill();
}