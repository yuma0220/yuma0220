let user="";
let a,b,c,correct;
let score=0;

const question = document.getElementById("question");
const answer = document.getElementById("answer");
const result = document.getElementById("result");
const graph = document.getElementById("graph");
const status = document.getElementById("status");

let history = JSON.parse(localStorage.getItem("history")) || [];

function resizeCanvas(){
  const rect = graph.getBoundingClientRect();
  graph.width = rect.width;
  graph.height = rect.width;
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);

function rand(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

function login(){
  user=document.getElementById("username").value;
  generate();
}

function generate(){
  a=rand(1,3);
  b=rand(-6,6);
  c=rand(-5,5);

  correct=-b/(2*a);

  question.innerText=
`y=${a}x²${b>=0?'+':''}${b}x${c>=0?'+':''}${c}
の頂点のx座標を求めよ`;

  drawGraph();
}

function check(){
  let userAns=Number(answer.value);
  let ok=Math.abs(userAns-correct)<0.5;

  result.innerText=ok?"正解！":"不正解："+correct.toFixed(2);
  result.style.color=ok?"#22c55e":"red";

  generate();
}

function drawGraph(){
  const ctx=graph.getContext("2d");
  const w=graph.width;
  const h=graph.height;

  ctx.clearRect(0,0,w,h);

  let maxY=0;
  for(let x=-10;x<=10;x+=0.1){
    let y=a*x*x+b*x+c;
    maxY=Math.max(maxY,Math.abs(y));
  }

  let scaleX=w/20;
  let scaleY=h/(maxY*2+2);
  let cx=w/2, cy=h/2;

  ctx.fillStyle="#020617";
  ctx.fillRect(0,0,w,h);

  ctx.strokeStyle="rgba(255,255,255,0.2)";
  for(let i=-10;i<=10;i++){
    ctx.beginPath();
    ctx.moveTo(cx+i*scaleX,0);
    ctx.lineTo(cx+i*scaleX,h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,cy-i*scaleY);
    ctx.lineTo(w,cy-i*scaleY);
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

  // グラフ
  ctx.strokeStyle="#38bdf8";
  ctx.lineWidth=3;
  ctx.beginPath();

  let first=true;
  for(let x=-10;x<=10;x+=0.05){
    let y=a*x*x+b*x+c;
    let px=cx+x*scaleX;
    let py=cy-y*scaleY;

    if(first){ctx.moveTo(px,py); first=false;}
    else ctx.lineTo(px,py);
  }
  ctx.stroke();

  // 頂点
  let vx=-b/(2*a);
  let vy=a*vx*vx+b*vx+c;

  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(cx+vx*scaleX,cy-vy*scaleY,5,0,Math.PI*2);
  ctx.fill();

  // y切片
  ctx.fillStyle="yellow";
  ctx.beginPath();
  ctx.arc(cx,cy-c*scaleY,5,0,Math.PI*2);
  ctx.fill();

  // x切片
  let D=b*b-4*a*c;
  if(D>=0){
    let x1=(-b+Math.sqrt(D))/(2*a);
    let x2=(-b-Math.sqrt(D))/(2*a);

    ctx.fillStyle="lime";

    [x1,x2].forEach(x=>{
      ctx.beginPath();
      ctx.arc(cx+x*scaleX,cy,5,0,Math.PI*2);
      ctx.fill();
    });
  }
}