let user="";
let a,b,c,correct;
let score=0;
let currentType="basic";

let history = JSON.parse(localStorage.getItem("history")) || [];

let stats={
  basic:{ok:0,total:0},
  normal:{ok:0,total:0},
  advanced:{ok:0,total:0}
};

function login(){
  user=document.getElementById("username").value;
  alert(user+"で開始！");
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

  question.innerText=`y=${a}x²${b>=0?'+':''}${b}x の頂点x`;
  drawGraph();
}

function generate(){
  currentType="normal";
  a=rand(1,3); b=rand(-6,6); c=rand(-5,5);
  correct=-b/(2*a);

  question.innerText=`y=${a}x²${b>=0?'+':''}${b}x${c>=0?'+':''}${c}`;
  drawGraph();
}

function generateAdvanced(){
  currentType="advanced";
  a=-rand(1,3); b=rand(2,8); c=rand(-5,5);
  let f=x=>a*x*x+b*x+c;
  correct=Math.max(f(0),f(5));

  question.innerText=`最大値を求めよ`;
  drawGraph();
}

function smartGenerate(){
  let r=Math.random();
  if(r<0.4) generateBasic();
  else if(r<0.7) generate();
  else generateAdvanced();
}

// ===== 判定 =====
function check(){
  let userAns=Number(answer.value);
  let ok=Math.abs(userAns-correct)<0.5;

  result.innerText=ok?"正解！":"不正解："+correct.toFixed(2);

  if(ok){score+=10;} else {score-=5;}
  document.getElementById("score").innerText="スコア:"+score;

  record(ok);
  saveHistory(ok);
  analyze();
  showHistory();

  smartGenerate();
}

// ===== 記録 =====
function record(ok){
  stats[currentType].total++;
  if(ok) stats[currentType].ok++;
}

// ===== 履歴保存 =====
function saveHistory(ok){
  history.push({
    result: ok,
    date: new Date().toLocaleString(),
    type: currentType
  });

  localStorage.setItem("history", JSON.stringify(history));
}

// ===== 履歴表示 =====
function showHistory(){
  let list=document.getElementById("historyList");
  list.innerHTML="";

  history.slice(-10).reverse().forEach(h=>{
    let li=document.createElement("li");
    li.innerText=`${h.date} : ${h.result?"○":"×"} (${h.type})`;
    list.appendChild(li);
  });
}

// ===== 分析 =====
function analyze(){
  let weak="basic", worst=1;

  for(let k in stats){
    let r=stats[k].ok/(stats[k].total||1);
    if(r<worst){worst=r; weak=k;}
  }

  status.innerText=`弱点:${weak} (${Math.round(worst*100)}%)`;
  drawChart();
}

// ===== グラフ =====
function drawGraph(){
  let ctx=graph.getContext("2d");
  ctx.clearRect(0,0,300,300);

  ctx.beginPath();
  for(let i=-10;i<=10;i+=0.1){
    let y=a*i*i+b*i+c;
    ctx.lineTo(i*20+150,150-y*20);
  }
  ctx.stroke();
}

// ===== 弱点グラフ =====
function drawChart(){
  let ctx=weakChart.getContext("2d");
  ctx.clearRect(0,0,300,200);

  let types=["basic","normal","advanced"];

  types.forEach((t,i)=>{
    let r=stats[t].ok/(stats[t].total||1);
    ctx.fillStyle="#22c55e";
    ctx.fillRect(i*80+30,200-r*150,40,r*150);
    ctx.fillStyle="white";
    ctx.fillText(t,i*80+35,190);
  });
}

// ===== 弱点特訓 =====
function weakMode(){
  let weak="basic", worst=1;

  for(let k in stats){
    let r=stats[k].ok/(stats[k].total||1);
    if(r<worst){worst=r; weak=k;}
  }

  if(weak==="basic") generateBasic();
  if(weak==="normal") generate();
  if(weak==="advanced") generateAdvanced();
}

// ===== バックアップ =====
function downloadBackup(){
  const data = JSON.stringify(history, null, 2);
  const blob = new Blob([data], {type:"application/json"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "study_backup.json";
  a.click();
}

// ===== 復元 =====
function loadBackup(e){
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(){
    history = JSON.parse(reader.result);
    localStorage.setItem("history", JSON.stringify(history));
    alert("復元完了");
    showHistory();
  };

  reader.readAsText(file);
}