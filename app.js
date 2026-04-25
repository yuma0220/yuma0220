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

let explanationData=null;
let history = JSON.parse(localStorage.getItem("history")) || [];

let stats={
  basic:{ok:0,total:0},
  normal:{ok:0,total:0},
  range:{ok:0,total:0},
  hard:{ok:0,total:0},
  advanced:{ok:0,total:0}
};

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
  question.innerText="頂点のx座標";
  drawGraph();
}

function generate(){
  currentType="normal";
  a=rand(1,3); b=rand(-6,6); c=rand(-5,5);
  correct=-b/(2*a);
  question.innerText="頂点のx座標";
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
  drawGraphRange(left,right,candidates);
}

function generateAdvanced(){
  currentType="advanced";
  a=-rand(1,3); b=rand(2,8); c=rand(-5,5);
  let vx=-b/(2*a);
  correct=a*vx*vx+b*vx+c;
  question.innerText="最大値";
  drawGraph();
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

function record(ok){
  stats[currentType].total++;
  if(ok) stats[currentType].ok++;
}

// ===== 解説 =====
function showExplanation(){
  if(!explanationData) return;

  let {left,right,vx,candidates}=explanationData;
  let text="\n---解説---\n";
  text+="頂点 x="+vx.toFixed(2)+"\n";

  text+= (vx>=left&&vx<=right)?"範囲内\n":"範囲外\n";

  candidates.forEach(v=>{
    text+=`x=${v.x.toFixed(2)} → ${v.y.toFixed(2)}\n`;
  });

  text+="答え："+correct.toFixed(2);

  result.innerText+=text;
}

// ===== グラフ =====
function drawGraph(){
  drawBaseGraph();
  drawParabola();
}

function drawGraphRange(left,right,candidates){
  drawGraph();

  let ctx=graph.getContext("2d");

  ctx.strokeStyle="blue";
  [left,right].forEach(x=>{
    ctx.beginPath();
    ctx.moveTo(x*20+150,0);
    ctx.lineTo(x*20+150,300);
    ctx.stroke();
  });

  ctx.fillStyle="red";
  candidates.forEach(v=>{
    ctx.beginPath();
    ctx.arc(v.x*20+150,150-v.y*20,4,0,Math.PI*2);
    ctx.fill();
  });
}

function drawBaseGraph(){
  let ctx=graph.getContext("2d");
  ctx.clearRect(0,0,300,300);

  ctx.fillStyle="white";
  ctx.fillRect(0,0,300,300);

  ctx.strokeStyle="#ddd";
  for(let i=-10;i<=10;i++){
    ctx.beginPath();
    ctx.moveTo(i*20+150,0);
    ctx.lineTo(i*20+150,300);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,150-i*20);
    ctx.lineTo(300,150-i*20);
    ctx.stroke();
  }

  ctx.strokeStyle="black";
  ctx.beginPath();
  ctx.moveTo(0,150);
  ctx.lineTo(300,150);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(150,0);
  ctx.lineTo(150,300);
  ctx.stroke();
}

function drawParabola(){
  let ctx=graph.getContext("2d");
  ctx.strokeStyle="#22c55e";
  ctx.beginPath();

  for(let x=-10;x<=10;x+=0.1){
    let y=a*x*x+b*x+c;
    ctx.lineTo(x*20+150,150-y*20);
  }
  ctx.stroke();
}

// ===== その他 =====
function analyze(){
  let weak="basic", worst=1;
  for(let k in stats){
    let r=stats[k].ok/(stats[k].total||1);
    if(r<worst){worst=r; weak=k;}
  }
  status.innerText=`弱点:${weak}`;
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