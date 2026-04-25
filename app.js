let user="";
let a,b,c,correct;
let score=0,combo=0;
let currentType="basic";

const question = document.getElementById("question");
const answer = document.getElementById("answer");
const result = document.getElementById("result");
const graph = document.getElementById("graph");
const weakChart = document.getElementById("weakChart");
const status = document.getElementById("status");

let history = JSON.parse(localStorage.getItem("history")) || [];
let explanationData=null;

let stats={
  basic:{ok:0,total:0},
  normal:{ok:0,total:0},
  range:{ok:0,total:0},
  hard:{ok:0,total:0},
  advanced:{ok:0,total:0}
};

// canvasサイズ
function resizeCanvas(){
  const rect = graph.getBoundingClientRect();
  graph.width = rect.width;
  graph.height = rect.width;
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);

// Enterで回答
answer.addEventListener("keypress",e=>{
  if(e.key==="Enter") check();
});

function login(){
  user=document.getElementById("username").value;
  smartGenerate();
  showHistory();
}

function rand(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

// ===== 問題 =====
function generateBasic(){
  currentType="basic";
  a=rand(1,3); b=rand(-6,6); c=0;
  correct=-b/(2*a);
  setQuestion();
  drawGraph();
}

function generate(){
  currentType="normal";
  a=rand(1,3); b=rand(-6,6); c=rand(-5,5);
  correct=-b/(2*a);
  setQuestion();
  drawGraph();
}

function generateRange(){
  currentType="range";
  a=rand(-3,3)||1;
  b=rand(-6,6); c=rand(-5,5);
  setupRange(0,5);
}

function generateHard(){
  currentType="hard";
  a=rand(-3,3)||1;
  b=rand(-8,8); c=rand(-5,5);
  setupRange(rand(-3,0),rand(2,6));
}

function setupRange(left,right){
  let f=x=>a*x*x+b*x+c;
  let vx=-b/(2*a);

  let candidates=[
    {x:left,y:f(left)},
    {x:right,y:f(right)}
  ];

  if(vx>=left&&vx<=right){
    candidates.push({x:vx,y:f(vx)});
  }

  if(a>0){
    correct=Math.min(...candidates.map(v=>v.y));
    question.innerText=`${left}≦x≦${right} の最小値`;
  }else{
    correct=Math.max(...candidates.map(v=>v.y));
    question.innerText=`${left}≦x≦${right} の最大値`;
  }

  explanationData={left,right,vx,candidates};
  drawGraph();
}

function generateAdvanced(){
  currentType="advanced";
  a=-rand(1,3); b=rand(2,8); c=rand(-5,5);
  let vx=-b/(2*a);
  correct=a*vx*vx+b*vx+c;
  question.innerText="最大値";
  drawGraph();
}

function setQuestion(){
  question.innerText=
`y=${a}x²${b>=0?'+':''}${b}x${c>=0?'+':''}${c}
の頂点のx座標`;
}

function smartGenerate(){
  let r=Math.random();
  if(r<0.2) generateBasic();
  else if(r<0.4) generate();
  else if(r<0.7) generateRange();
  else if(r<0.9) generateHard();
  else generateAdvanced();
}

// ===== 判定 =====
function check(){
  let userAns=Number(answer.value);
  let ok=Math.abs(userAns-correct)<0.5;

  if(ok){combo++; score+=10+combo;}
  else{combo=0; score-=5;}

  score=Math.max(0,score);

  result.innerText=ok?"正解！":"不正解："+correct.toFixed(2);
  result.style.color=ok?"#22c55e":"red";

  document.getElementById("score").innerText="スコア:"+score;

  record(ok);
  saveHistory(ok);
  analyze();
  showHistory();
  showExplanation();

  smartGenerate();
}

// ===== 解説 =====
function showExplanation(){
  if(!explanationData) return;

  let {left,right,vx,candidates}=explanationData;
  let text="\n---解説---\n";
  text+="頂点 x="+vx.toFixed(2)+"\n";
  text+=(vx>=left&&vx<=right)?"範囲内\n":"範囲外\n";

  candidates.forEach(v=>{
    text+=`x=${v.x.toFixed(2)} → ${v.y.toFixed(2)}\n`;
  });

  text+="答え："+correct.toFixed(2);
  result.innerText+=text;
}

// ===== グラフ =====
function drawGraph(){
  const ctx = graph.getContext("2d");
  const w = graph.width;
  const h = graph.height;

  ctx.clearRect(0,0,w,h);

  let maxY=0;
  for(let x=-10;x<=10;x+=0.1){
    let y=a*x*x+b*x+c;
    maxY=Math.max(maxY,Math.abs(y));
  }

  let scaleX=w/20;
  let scaleY=h/(maxY*2+2);
  let cx=w/2, cy=h/2;

  ctx.fillStyle="#0f172a";
  ctx.fillRect(0,0,w,h);

  ctx.strokeStyle="rgba(255,255,255,0.15)";
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
}

// ===== その他 =====
function record(ok){
  stats[currentType].total++;
  if(ok) stats[currentType].ok++;
}

function analyze(){
  let weak="basic",worst=1;
  for(let k in stats){
    let r=stats[k].ok/(stats[k].total||1);
    if(r<worst){worst=r; weak=k;}
  }
  status.innerText="弱点:"+weak;
}

function showHistory(){
  let list=document.getElementById("historyList");
  list.innerHTML="";
  history.slice(-10).reverse().forEach(h=>{
    let li=document.createElement("li");
    li.innerText=`${h.result?"○":"×"} (${h.type})`;
    list.appendChild(li);
  });
}

function saveHistory(ok){
  history.push({result:ok,type:currentType});
  localStorage.setItem("history",JSON.stringify(history));
}

function weakMode(){
  smartGenerate();
}

function downloadBackup(){
  const blob=new Blob([JSON.stringify(history)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="backup.json";
  a.click();
}

function loadBackup(e){
  const reader=new FileReader();
  reader.onload=()=>{
    history=JSON.parse(reader.result);
    localStorage.setItem("history",JSON.stringify(history));
    showHistory();
  };
  reader.readAsText(e.target.files[0]);
}