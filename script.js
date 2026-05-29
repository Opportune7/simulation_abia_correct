/* ============================================================
 * Abia Impact Dashboard 2025–2026 — script.js (full rewrite)
 * ============================================================ */

/* ─── CONSTANTS ─── */
const LGAS=["Aba North","Aba South","Arochukwu","Bende","Ikawuno","Isiala-Ngwa North","Isiala-Ngwa South","Isuikwuato","Obi Ngwa","Ohafia","Osisioma","Umuahia North","Umuahia South","Ukwa East","Ukwa West","Umu Nnochi","Ugwunagbo"];
const CLUSTERS=["Commerce & Industry","Governance","Infrastructure","Social: Health & Edu","Social: Services"];
const MDAS={"Commerce & Industry":["Ministry of Trade & Investment","Ministry of SMEs","Abia Investment Promotion Agency"],"Governance":["Office of the Governor","Ministry of Justice","Bureau of Public Procurement","Ministry of Finance"],"Infrastructure":["Ministry of Works","Ministry of Power","Ministry of Housing","Abia Roads Agency"],"Social: Health & Edu":["Ministry of Health","Ministry of Education","Primary Healthcare Agency","SUBEB"],"Social: Services":["Ministry of Women Affairs","Ministry of Youth & Sports","Ministry of Environment","Ministry of Agriculture"]};
const TEMPLATES={"Commerce & Industry":["SME Capital Grant Scheme","Aba Industrial Park Phase","Leather Cluster Modernisation","Trade Fair Pavilion Upgrade","Export Readiness Programme","Artisan Skills Hub"],"Governance":["Digital Civil Service Rollout","Open Budget Portal","Tax Reform Implementation","E-Procurement Platform","Judiciary Case Management System","Citizens Feedback Hotline"],"Infrastructure":["Township Road Rehabilitation","Rural Bridge Construction","Solar Streetlight Deployment","Drainage & Erosion Control","Public Housing Estate","Water Reticulation Project"],"Social: Health & Edu":["Primary Health Centre Upgrade","Free Maternal Care Programme","School Renovation Initiative","Teacher Training Programme","Scholarship Disbursement","Hospital Equipment Supply"],"Social: Services":["Women Empowerment Grant","Youth Tech Fellowship","Waste Management Expansion","Farm Input Subsidy","Community Sports Complex","Skills Acquisition Centre"]};
const SDG_BY_CLUSTER={"Commerce & Industry":["SDG 8","SDG 9","SDG 12","SDG 1"],"Governance":["SDG 16","SDG 17","SDG 10"],"Infrastructure":["SDG 9","SDG 11","SDG 6","SDG 7"],"Social: Health & Edu":["SDG 3","SDG 4","SDG 5"],"Social: Services":["SDG 5","SDG 1","SDG 2","SDG 13","SDG 15"]};
const SDG_COLORS={"SDG 1":"#E5243B","SDG 2":"#DDA63A","SDG 3":"#4C9F38","SDG 4":"#C5192D","SDG 5":"#FF3A21","SDG 6":"#26BDE2","SDG 7":"#FCC30B","SDG 8":"#A21942","SDG 9":"#FD6925","SDG 10":"#DD1367","SDG 11":"#FD9D24","SDG 12":"#BF8B2E","SDG 13":"#3F7E44","SDG 14":"#0A97D9","SDG 15":"#56C02B","SDG 16":"#00689D","SDG 17":"#19486A"};
const SDG_TITLES={"SDG 1":"No Poverty","SDG 2":"Zero Hunger","SDG 3":"Good Health","SDG 4":"Quality Education","SDG 5":"Gender Equality","SDG 6":"Clean Water","SDG 7":"Affordable Energy","SDG 8":"Decent Work","SDG 9":"Industry & Innovation","SDG 10":"Reduced Inequalities","SDG 11":"Sustainable Cities","SDG 12":"Responsible Consumption","SDG 13":"Climate Action","SDG 14":"Life Below Water","SDG 15":"Life on Land","SDG 16":"Peace & Justice","SDG 17":"Partnerships"};
const SDG_LIST=Object.keys(SDG_TITLES);
const CLUSTER_COLORS={"Commerce & Industry":"#0a2540","Governance":"#5b6b89","Infrastructure":"#008751","Social: Health & Edu":"#e94f37","Social: Services":"#ffc107"};

/* ─── RNG ─── */
function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const rand=mulberry32(42);
const pick=a=>a[Math.floor(rand()*a.length)];
const rng=(lo,hi)=>lo+rand()*(hi-lo);
const irng=(lo,hi)=>Math.floor(rng(lo,hi+1));

/* ─── DATA ─── */
function genProject(id){
  const cluster=pick(CLUSTERS),mda=pick(MDAS[cluster]),lga=pick(LGAS);
  const year=rand()<.55?2025:2026,priority=rand()<.45?"Priority":"Non-priority";
  const sdg=pick(SDG_BY_CLUSTER[cluster]);
  const name=`${pick(TEMPLATES[cluster])} — ${lga}`;
  const base=cluster==="Infrastructure"?rng(.8e9,5e9):cluster==="Social: Health & Edu"?rng(.3e9,2.5e9):cluster==="Commerce & Industry"?rng(.2e9,1.8e9):rng(.05e9,1.2e9);
  const budget=Math.round(base/1e6)*1e6;
  let progress,status,utilisation;
  const r=rand();
  if(r<.3){status="Completed";progress=irng(95,100);utilisation=irng(85,100)}
  else if(r<.85){status="In progress";progress=irng(15,90);utilisation=irng(20,95)}
  else{status="Not started";progress=0;utilisation=irng(0,10)}
  const spend=Math.round(budget*utilisation/100);
  const mul=cluster==="Social: Health & Edu"?3:cluster==="Infrastructure"?2:1;
  const directPeople=Math.round(irng(200,8000)*mul*(priority==="Priority"?1.5:1));
  const indirectPeople=Math.round(directPeople*rng(1.5,4));
  return{id,name,budget,spend,utilisation,year,cluster,mda,lga,priority,progress,status,sdg,
    directPeople,indirectPeople,totalImpacted:directPeople+indirectPeople,
    jobsCreated:Math.round(irng(10,600)*(cluster==="Commerce & Industry"?1.8:1)),
    womenPct:Math.round(rng(25,60)),youthPct:Math.round(rng(30,70))};
}
const PROJECTS=Array.from({length:150},(_,i)=>genProject(i+1));

/* ─── FORMAT ─── */
const fmtN=n=>n>=1e9?`₦${(n/1e9).toFixed(2)}B`:n>=1e6?`₦${(n/1e6).toFixed(1)}M`:n>=1e3?`₦${(n/1e3).toFixed(1)}K`:`₦${n}`;
const fmtNum=n=>n>=1e6?`${(n/1e6).toFixed(2)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:n.toLocaleString();

/* ─── STATE ─── */
const state={filters:{cluster:"all",lga:"all",mda:"all",year:"all",status:"all",priority:"all",sdg:"all",search:""},page:"overview",sort:{col:"budget",dir:"desc"},portPage:1,portTab:"table"};
const charts={};

function getFiltered(){
  const f=state.filters;
  return PROJECTS.filter(p=>{
    if(f.cluster!=="all"&&p.cluster!==f.cluster)return false;
    if(f.lga!=="all"&&p.lga!==f.lga)return false;
    if(f.mda!=="all"&&p.mda!==f.mda)return false;
    if(f.year!=="all"&&String(p.year)!==f.year)return false;
    if(f.status!=="all"&&p.status!==f.status)return false;
    if(f.priority!=="all"&&p.priority!==f.priority)return false;
    if(f.sdg!=="all"&&p.sdg!==f.sdg)return false;
    if(f.search){const q=f.search.toLowerCase();if(!p.name.toLowerCase().includes(q)&&!p.mda.toLowerCase().includes(q))return false;}
    return true;
  });
}

function groupBy(arr,key){const m={};arr.forEach(x=>{const k=x[key];(m[k]=m[k]||[]).push(x)});return m}
function sum(arr,k){return arr.reduce((a,b)=>a+(b[k]||0),0)}
function destroyChart(id){if(charts[id]){charts[id].destroy();delete charts[id]}}

/* ─── POPULATE FILTERS ─── */
function populateFilters(){
  const fill=(id,arr)=>{const el=document.getElementById(id);if(!el)return;arr.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;el.appendChild(o)})};
  fill("f-cluster",CLUSTERS);
  fill("f-lga",[...LGAS].sort());
  const allMdas=[...new Set(PROJECTS.map(p=>p.mda))].sort();
  fill("f-mda",allMdas);
  fill("f-sdg",SDG_LIST);
}

/* ─── OVERVIEW ─── */
function renderOverview(data){
  const budget=sum(data,"budget"),spend=sum(data,"spend");
  const util=budget?(spend/budget*100):0;
  const done=data.filter(d=>d.status==="Completed").length;
  const people=sum(data,"totalImpacted"),jobs=sum(data,"jobsCreated");
  document.getElementById("kpi-budget").textContent=fmtN(budget);
  document.getElementById("kpi-spend").textContent=fmtN(spend);
  document.getElementById("kpi-util").textContent=util.toFixed(1)+"%";
  document.getElementById("kpi-projects").textContent=data.length.toLocaleString();
  document.getElementById("kpi-completed").textContent=done;
  document.getElementById("kpi-completed-rate").textContent=data.length?`${((done/data.length)*100).toFixed(0)}% rate`:"";
  document.getElementById("kpi-people").textContent=fmtNum(people);
  document.getElementById("kpi-jobs").textContent=fmtNum(jobs);
  document.getElementById("ov-subtitle").textContent=`Real-time view of Abia State's project portfolio · ${data.length} projects in scope`;

  // Cluster bar
  const cData=CLUSTERS.map(c=>({name:c,budget:sum(data.filter(p=>p.cluster===c),"budget"),count:data.filter(p=>p.cluster===c).length}));
  destroyChart("cluster");
  charts.cluster=new Chart(document.getElementById("ch-cluster"),{type:"bar",data:{labels:cData.map(d=>d.name),datasets:[{label:"Budget",data:cData.map(d=>d.budget),backgroundColor:CLUSTERS.map(c=>CLUSTER_COLORS[c]),borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>fmtN(ctx.raw)}}},scales:{y:{ticks:{callback:v=>fmtN(v)}},x:{ticks:{font:{size:11}}}}}});

  // Project mix donut
  destroyChart("mix");
  charts.mix=new Chart(document.getElementById("ch-mix"),{type:"doughnut",data:{labels:cData.map(d=>d.name),datasets:[{data:cData.map(d=>d.count),backgroundColor:CLUSTERS.map(c=>CLUSTER_COLORS[c]),borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:"55%",plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:12}}}}});

  // Priority bars
  document.getElementById("ov-priority-bars").innerHTML=["Priority","Non-priority"].map(pri=>{
    const items=data.filter(p=>p.priority===pri);
    const avg=items.length?Math.round(sum(items,"progress")/items.length):0;
    return `<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:7px"><span style="font-weight:500">${pri}</span><span style="font-weight:700">${avg}% <span style="font-weight:400;font-size:11px;color:var(--muted)">(${items.length} projects)</span></span></div><div style="height:10px;background:var(--border);border-radius:5px;overflow:hidden"><div style="height:100%;width:${avg}%;background:var(--primary);border-radius:5px"></div></div></div>`;
  }).join("");

  // Inline SDG treemap
  const bySdgI=groupBy(data,"sdg");
  const treeI=Object.keys(bySdgI).map(s=>({sdg:s,value:sum(bySdgI[s],"budget"),count:bySdgI[s].length}));
  destroyChart("sdg-inline");
  charts["sdg-inline"]=new Chart(document.getElementById("ch-sdg-inline"),{type:"treemap",data:{datasets:[{tree:treeI,key:"value",backgroundColor:ctx=>ctx.raw?SDG_COLORS[ctx.raw._data.sdg]:"#ccc",borderColor:"#fff",borderWidth:2,spacing:1,labels:{display:true,color:"#fff",font:{weight:"600",size:10},formatter:ctx=>ctx.raw._data?[ctx.raw._data.sdg]:[]}}]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{title:i=>i[0].raw._data.sdg+" — "+SDG_TITLES[i[0].raw._data.sdg],label:i=>`${fmtN(i.raw._data.value)} · ${i.raw._data.count} projects`}}},maintainAspectRatio:false}});

  // LGA heatmap
  const byLga=groupBy(data,"lga");
  const lgaSorted=LGAS.map(l=>({lga:l,val:sum(byLga[l]||[],"totalImpacted")})).sort((a,b)=>b.val-a.val);
  const maxVal=Math.max(1,...lgaSorted.map(x=>x.val));
  document.getElementById("ov-lga-grid").innerHTML=lgaSorted.map(({lga,val})=>{
    const pct=Math.round((val/maxVal)*70);
    const dark=pct>40;
    return `<div class="lga-cell" style="background:color-mix(in srgb,#008751 ${pct}%,#f0f9f4)"><span class="lga-name" style="color:${dark?"#fff":"var(--fg)"}">${lga}</span><span class="lga-val" style="color:${dark?"#fff":"var(--primary)"}">${fmtNum(val)}</span></div>`;
  }).join("");

  // Full SDG treemap
  const bySdg=groupBy(data,"sdg");
  const tree=Object.keys(bySdg).map(s=>({sdg:s,value:sum(bySdg[s],"budget"),count:bySdg[s].length}));
  destroyChart("sdg");
  charts.sdg=new Chart(document.getElementById("ch-sdg-tree"),{type:"treemap",data:{datasets:[{tree,key:"value",backgroundColor:ctx=>ctx.raw?SDG_COLORS[ctx.raw._data.sdg]:"#ccc",borderColor:"#fff",borderWidth:2,spacing:1,labels:{display:true,color:"#fff",font:{weight:"600",size:11},formatter:ctx=>[ctx.raw._data.sdg,SDG_TITLES[ctx.raw._data.sdg],fmtN(ctx.raw._data.value)]}}]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{title:i=>i[0].raw._data.sdg+" — "+SDG_TITLES[i[0].raw._data.sdg],label:i=>`${fmtN(i.raw._data.value)} · ${i.raw._data.count} projects`}}},maintainAspectRatio:false}});
}

/* ─── PORTFOLIO ─── */
const PORT_PER_PAGE=12;

function renderPortfolio(data){
  const{col,dir}=state.sort;
  const sorted=[...data].sort((a,b)=>{const va=a[col],vb=b[col];if(va<vb)return dir==="asc"?-1:1;if(va>vb)return dir==="asc"?1:-1;return 0});
  const pages=Math.max(1,Math.ceil(sorted.length/PORT_PER_PAGE));
  const pg=Math.min(state.portPage,pages);
  const rows=sorted.slice((pg-1)*PORT_PER_PAGE,pg*PORT_PER_PAGE);

  // Table
  document.getElementById("port-tbody").innerHTML=rows.map(p=>{
    const sCls=p.status==="Completed"?"completed":p.status==="In progress"?"progress":"notstarted";
    return `<tr style="cursor:pointer" onclick="openModal(${p.id})">
      <td><div class="cell-name"><strong>${p.name}</strong><small>${p.mda}</small></div></td>
      <td><span class="cluster-pill">${p.cluster}</span></td>
      <td>${p.lga}</td>
      <td style="font-weight:600">${fmtN(p.budget)}</td>
      <td>${fmtN(p.spend)}</td>
      <td><div class="prog-bar-wrap"><div class="prog-bar"><div class="prog-bar-fill" style="width:${p.progress}%"></div></div><span style="font-size:11px">${p.progress}%</span></div></td>
      <td><span class="status-pill ${sCls}">${p.status}</span></td>
      <td><span class="sdg-dot" style="background:${SDG_COLORS[p.sdg]}">${p.sdg.replace("SDG ","")}</span></td>
    </tr>`;
  }).join("");

  document.getElementById("port-page-info").textContent=`Showing ${(pg-1)*PORT_PER_PAGE+1}–${Math.min(pg*PORT_PER_PAGE,sorted.length)} of ${sorted.length}`;
  document.getElementById("port-page-label").textContent=`Page ${pg} of ${pages}`;
  document.getElementById("port-prev").disabled=pg===1;
  document.getElementById("port-next").disabled=pg===pages;

  // Cards
  document.getElementById("port-cards-grid").innerHTML=rows.map(p=>{
    const sCls=p.status==="Completed"?"completed":p.status==="In progress"?"progress":"notstarted";
    return `<div class="proj-card" onclick="openModal(${p.id})">
      <div class="proj-card-top">
        <span class="sdg-dot" style="background:${SDG_COLORS[p.sdg]};padding:3px 7px;width:auto;border-radius:5px;font-size:11px">${p.sdg}</span>
        <span class="status-pill ${sCls}" style="font-size:10px">${p.status}</span>
      </div>
      <div class="proj-card-name">${p.name}</div>
      <div class="proj-card-meta">&#128188; ${p.mda}</div>
      <div class="proj-card-meta">&#128205; ${p.lga}</div>
      <hr class="proj-card-divider"/>
      <div class="proj-card-stat"><span>Budget</span><span>${fmtN(p.budget)}</span></div>
      <div class="proj-card-stat"><span>Impact</span><span>${fmtNum(p.totalImpacted)} people</span></div>
      <div class="proj-card-progress"><div class="proj-card-progress-fill" style="width:${p.progress}%"></div></div>
    </div>`;
  }).join("");

  document.getElementById("portc-page-label").textContent=`Page ${pg} of ${pages}`;
  document.getElementById("portc-prev").disabled=pg===1;
  document.getElementById("portc-next").disabled=pg===pages;
}

/* ─── CITIZEN IMPACT ─── */
function renderImpact(data){
  const direct=sum(data,"directPeople"),indirect=sum(data,"indirectPeople"),total=direct+indirect;
  const jobs=sum(data,"jobsCreated");
  const avgW=data.length?Math.round(data.reduce((a,b)=>a+b.womenPct,0)/data.length):0;
  const avgY=data.length?Math.round(data.reduce((a,b)=>a+b.youthPct,0)/data.length):0;
  document.getElementById("im-total").textContent=fmtNum(total);
  document.getElementById("im-direct").textContent=fmtNum(direct);
  document.getElementById("im-indirect").textContent=fmtNum(indirect);
  document.getElementById("im-jobs").textContent=fmtNum(jobs);
  document.getElementById("im-women").textContent=avgW+"%";
  document.getElementById("im-youth").textContent=avgY+"%";
  document.getElementById("im-women-pct").textContent=avgW+"%";
  document.getElementById("im-youth-pct").textContent=avgY+"%";

  // People reached donut
  destroyChart("reach");
  charts.reach=new Chart(document.getElementById("ch-reach"),{type:"doughnut",data:{labels:["Direct","Indirect"],datasets:[{data:[direct,indirect],backgroundColor:["#008751","#ffc107"],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:"55%",plugins:{legend:{position:"bottom",labels:{font:{size:11},boxWidth:12}},tooltip:{callbacks:{label:c=>fmtNum(c.parsed)}}}}});

  // Jobs by cluster (horizontal bar)
  const jobsData=CLUSTERS.map(c=>({name:c,jobs:sum(data.filter(p=>p.cluster===c),"jobsCreated")})).sort((a,b)=>b.jobs-a.jobs);
  destroyChart("jobs-cluster");
  charts["jobs-cluster"]=new Chart(document.getElementById("ch-jobs-cluster"),{type:"bar",data:{labels:jobsData.map(d=>d.name),datasets:[{label:"Jobs",data:jobsData.map(d=>d.jobs),backgroundColor:CLUSTERS.map(c=>CLUSTER_COLORS[c]),borderRadius:6}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{callback:v=>fmtNum(v)}}}}});

  // Women gauge donut
  destroyChart("women-donut");
  charts["women-donut"]=new Chart(document.getElementById("ch-women-donut"),{type:"doughnut",data:{datasets:[{data:[avgW,100-avgW],backgroundColor:["#e94f37","#e5e7eb"],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{display:false},tooltip:{enabled:false}}}});

  // Youth gauge donut
  destroyChart("youth-donut");
  charts["youth-donut"]=new Chart(document.getElementById("ch-youth-donut"),{type:"doughnut",data:{datasets:[{data:[avgY,100-avgY],backgroundColor:["#ffc107","#e5e7eb"],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{display:false},tooltip:{enabled:false}}}});

  // Top 5 projects
  const top5=[...data].sort((a,b)=>b.totalImpacted-a.totalImpacted).slice(0,5);
  document.getElementById("im-top5").innerHTML=top5.map((p,i)=>`
    <div class="top5-item" onclick="openModal(${p.id})">
      <div class="top5-rank">${i+1}</div>
      <div class="top5-info">
        <strong>${p.name}</strong>
        <div class="meta">${p.mda} &middot; ${p.lga} &middot; ${p.cluster}</div>
        <div class="story">Delivering ${fmtNum(p.totalImpacted)} impacted citizens and ${p.jobsCreated} jobs &mdash; advancing ${p.sdg}.</div>
      </div>
      <div class="top5-stat"><div class="val">${fmtNum(p.totalImpacted)}</div><div class="lbl">people</div></div>
      <span class="sdg-dot" style="background:${SDG_COLORS[p.sdg]};margin-left:6px;align-self:center">${p.sdg.replace("SDG ","")}</span>
    </div>`).join("");
}

/* ─── SDG ─── */
function renderSDG(data){
  const totalBudget=sum(data,"budget")||1;
  const sdgStats=SDG_LIST.map(s=>{
    const items=data.filter(p=>p.sdg===s);
    const budget=sum(items,"budget"),impact=sum(items,"totalImpacted");
    return{s,title:SDG_TITLES[s],count:items.length,budget,impact,pct:(budget/totalBudget)*100};
  });

  // SDG tiles
  document.getElementById("sdg-tiles").innerHTML=sdgStats.map(({s,title,count,budget,pct})=>`
    <div class="sdg-tile" onclick="document.getElementById('f-sdg').value='${s}';state.filters.sdg='${s}';renderAll()">
      <div class="sdg-tile-header" style="background:${SDG_COLORS[s]}">
        <div class="sdg-tile-n">${s}</div>
        <div class="sdg-tile-name">${title}</div>
      </div>
      <div class="sdg-tile-body">
        <div class="sdg-tile-pct">${pct.toFixed(1)}%</div>
        <div class="sdg-tile-of">of total budget</div>
        <div class="sdg-tile-detail">${count} projects &middot; ${fmtN(budget)}</div>
      </div>
    </div>`).join("");

  // Clusters x SDGs stacked bar
  const stackData=CLUSTERS.map(c=>{
    const row={name:c};
    SDG_LIST.forEach(s=>{row[s]=sum(data.filter(p=>p.cluster===c&&p.sdg===s),"budget")});
    return row;
  });
  destroyChart("sdg-stack");
  charts["sdg-stack"]=new Chart(document.getElementById("ch-sdg-stack"),{type:"bar",data:{labels:CLUSTERS,datasets:SDG_LIST.map(s=>({label:s,data:stackData.map(r=>r[s]),backgroundColor:SDG_COLORS[s],stack:"a"}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fmtN(c.parsed.y)}`}}},scales:{x:{ticks:{font:{size:10}}},y:{ticks:{callback:v=>fmtN(v)}}}}});

  // Radar: budget + impact
  const maxB=Math.max(1,...sdgStats.map(x=>x.budget));
  const maxI=Math.max(1,...sdgStats.map(x=>x.impact));
  destroyChart("radar");
  charts.radar=new Chart(document.getElementById("ch-radar"),{type:"radar",data:{labels:SDG_LIST.map(s=>s.replace("SDG ","")),datasets:[{label:"Budget",data:sdgStats.map(x=>(x.budget/maxB)*100),borderColor:"#008751",backgroundColor:"rgba(0,135,81,.2)",borderWidth:2,pointRadius:3},{label:"People Impact",data:sdgStats.map(x=>(x.impact/maxI)*100),borderColor:"#ffc107",backgroundColor:"rgba(255,193,7,.15)",borderWidth:2,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:11}}}},scales:{r:{ticks:{display:false},pointLabels:{font:{size:10}}}}}});
}

/* ─── FINANCIAL ─── */
function renderFinancial(data){
  const budget=sum(data,"budget"),spend=sum(data,"spend");
  const variance=budget-spend,util=budget?(spend/budget*100):0;
  const peoplePerM=spend?sum(data,"totalImpacted")/spend*1e6:0;
  document.getElementById("fin-budget").textContent=fmtN(budget);
  document.getElementById("fin-spend").textContent=fmtN(spend);
  document.getElementById("fin-unspent").textContent=fmtN(variance);
  document.getElementById("fin-remaining").textContent=`${(100-util).toFixed(1)}% remaining`;
  document.getElementById("fin-util").textContent=util.toFixed(1)+"%";
  document.getElementById("fin-insight").innerHTML=`For every <strong>₦1 million</strong> spent, Abia State projects reach approximately <strong>${peoplePerM.toFixed(0)} citizens</strong> — a strong indicator of efficient public investment.`;

  // Budget vs Spend + Utilisation line
  const byC=CLUSTERS.map(c=>{const items=data.filter(p=>p.cluster===c);return{name:c,budget:sum(items,"budget"),spend:sum(items,"spend"),util:sum(items,"budget")?(sum(items,"spend")/sum(items,"budget")*100):0}});
  destroyChart("bvs");
  charts.bvs=new Chart(document.getElementById("ch-bvs"),{type:"bar",data:{labels:byC.map(d=>d.name),datasets:[{label:"Budget",data:byC.map(d=>d.budget),backgroundColor:"#0a2540",borderRadius:6,yAxisID:"y"},{label:"Spend",data:byC.map(d=>d.spend),backgroundColor:"#008751",borderRadius:6,yAxisID:"y"},{label:"Utilisation %",data:byC.map(d=>Math.round(d.util)),type:"line",borderColor:"#ffc107",backgroundColor:"transparent",borderWidth:2,pointRadius:5,pointBackgroundColor:"#ffc107",yAxisID:"y2"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:11}}},tooltip:{callbacks:{label:c=>c.dataset.label==="Utilisation %"?c.parsed.y.toFixed(1)+"%":fmtN(c.parsed.y)}}},scales:{y:{ticks:{callback:v=>fmtN(v)}},y2:{position:"right",min:0,max:100,ticks:{callback:v=>v+"%"},grid:{display:false}}}}});

  // Year utilisation line
  const byY=[2025,2026].map(y=>{const items=data.filter(p=>p.year===y);const b=sum(items,"budget");return{year:String(y),util:b?Math.round(sum(items,"spend")/b*100):0}});
  destroyChart("year");
  charts.year=new Chart(document.getElementById("ch-year"),{type:"line",data:{labels:byY.map(d=>d.year),datasets:[{label:"Utilisation %",data:byY.map(d=>d.util),borderColor:"#008751",backgroundColor:"rgba(0,135,81,.1)",borderWidth:3,pointRadius:7,pointBackgroundColor:"#008751",fill:true}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{min:0,max:100,ticks:{callback:v=>v+"%"}}},plugins:{legend:{display:false}}}});

  // VFM scatter
  destroyChart("vfm");
  charts.vfm=new Chart(document.getElementById("ch-vfm"),{type:"scatter",data:{datasets:CLUSTERS.map(c=>({label:c,data:data.filter(p=>p.cluster===c).map(p=>({x:p.spend/1e6,y:p.totalImpacted,name:p.name})),backgroundColor:CLUSTER_COLORS[c]}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:10}}},tooltip:{callbacks:{label:c=>`${c.raw.name}: ${fmtNum(c.raw.y)} people, ₦${c.raw.x.toFixed(0)}M spend`}}},scales:{x:{title:{display:true,text:"Spend (₦M)",font:{size:11}}},y:{title:{display:true,text:"People Impacted",font:{size:11}},ticks:{callback:v=>fmtNum(v)}}}}});
}

/* ─── MODAL ─── */
function openModal(id){
  const p=PROJECTS.find(x=>x.id===id);if(!p)return;
  const sCls=p.status==="Completed"?"status-completed":p.status==="In progress"?"status-progress":"status-notstarted";
  document.getElementById("modal-body").innerHTML=`
    <div class="modal-header">
      <div class="modal-sdg-badge" style="background:${SDG_COLORS[p.sdg]}">${p.sdg.replace("SDG ","")}</div>
      <div class="modal-header-info">
        <div class="modal-title">${p.name}</div>
        <div class="modal-subtitle">${SDG_TITLES[p.sdg]} &middot; ${p.cluster}</div>
      </div>
    </div>
    <div class="modal-badges">
      <span class="modal-badge ${sCls}">${p.status}</span>
      <span class="modal-badge">${p.priority}</span>
      <span class="modal-badge">FY ${p.year}</span>
    </div>
    <div class="modal-info-grid">
      <div class="modal-info-item"><div class="modal-info-lbl">MDA</div><div class="modal-info-val">${p.mda}</div></div>
      <div class="modal-info-item"><div class="modal-info-lbl">LGA</div><div class="modal-info-val">${p.lga}</div></div>
      <div class="modal-info-item"><div class="modal-info-lbl">Fiscal Year</div><div class="modal-info-val">${p.year}</div></div>
      <div class="modal-info-item"><div class="modal-info-lbl">Primary SDG</div><div class="modal-info-val">${p.sdg} — ${SDG_TITLES[p.sdg]}</div></div>
    </div>
    <div class="modal-progress-box">
      <div class="modal-progress-header"><strong>${p.progress}% complete</strong><span style="color:var(--muted)">${p.utilisation}% utilised</span></div>
      <div class="modal-progress-bar"><div class="modal-progress-fill" style="width:${p.progress}%"></div></div>
    </div>
    <div class="modal-stats-grid">
      <div class="modal-stat"><div class="modal-stat-lbl">Budget</div><div class="modal-stat-val">${fmtN(p.budget)}</div></div>
      <div class="modal-stat"><div class="modal-stat-lbl">Spend</div><div class="modal-stat-val">${fmtN(p.spend)}</div></div>
      <div class="modal-stat"><div class="modal-stat-lbl">Direct People</div><div class="modal-stat-val">${fmtNum(p.directPeople)}</div></div>
      <div class="modal-stat"><div class="modal-stat-lbl">Indirect People</div><div class="modal-stat-val">${fmtNum(p.indirectPeople)}</div></div>
      <div class="modal-stat hi"><div class="modal-stat-lbl">Total Impacted</div><div class="modal-stat-val">${fmtNum(p.totalImpacted)}</div></div>
      <div class="modal-stat hi"><div class="modal-stat-lbl">Jobs Created</div><div class="modal-stat-val">${p.jobsCreated.toLocaleString()}</div></div>
      <div class="modal-stat"><div class="modal-stat-lbl">Women Benefit</div><div class="modal-stat-val">${p.womenPct}%</div></div>
      <div class="modal-stat"><div class="modal-stat-lbl">Youth Benefit</div><div class="modal-stat-val">${p.youthPct}%</div></div>
    </div>
    <div class="modal-story">
      <div class="modal-story-title">Impact Story</div>
      <p class="modal-story-text">This ${p.cluster.toLowerCase()} initiative in <strong>${p.lga}</strong> is delivering measurable change for <strong>${fmtNum(p.totalImpacted)}</strong> citizens, advancing the State's commitment to <strong>${SDG_TITLES[p.sdg]}</strong>. Implementation is led by ${p.mda}.</p>
    </div>`;
  document.getElementById("modal-bd").hidden=false;
  document.body.style.overflow="hidden";
}
document.getElementById("modal-close").onclick=()=>{document.getElementById("modal-bd").hidden=true;document.body.style.overflow=""};
document.getElementById("modal-bd").onclick=e=>{if(e.target.id==="modal-bd"){document.getElementById("modal-bd").hidden=true;document.body.style.overflow=""}};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){document.getElementById("modal-bd").hidden=true;document.body.style.overflow=""}});

/* ─── MASTER RENDER ─── */
function renderAll(){
  const data=getFiltered();
  if(state.page==="overview")renderOverview(data);
  if(state.page==="portfolio")renderPortfolio(data);
  if(state.page==="impact")renderImpact(data);
  if(state.page==="sdg")renderSDG(data);
  if(state.page==="financial")renderFinancial(data);
}

/* ─── NAV ─── */
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".nav-link").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("page-"+b.dataset.page).classList.add("active");
  state.page=b.dataset.page;state.portPage=1;
  document.getElementById("sidebar").classList.remove("open");
  renderAll();
}));
document.getElementById("menu-toggle").onclick=()=>document.getElementById("sidebar").classList.toggle("open");

/* ─── FILTERS ─── */
["cluster","lga","mda","year","status","priority","sdg"].forEach(k=>{
  const el=document.getElementById("f-"+k);
  if(el)el.addEventListener("change",e=>{state.filters[k]=e.target.value;state.portPage=1;renderAll()});
});
document.getElementById("f-search").addEventListener("input",e=>{state.filters.search=e.target.value;state.portPage=1;renderAll()});
document.getElementById("f-reset").onclick=()=>{
  state.filters={cluster:"all",lga:"all",mda:"all",year:"all",status:"all",priority:"all",sdg:"all",search:""};
  document.querySelectorAll(".filters select").forEach(s=>s.value="all");
  document.getElementById("f-search").value="";
  state.portPage=1;renderAll();
};

/* ─── PORTFOLIO TABS ─── */
document.querySelectorAll(".port-tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".port-tab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  state.portTab=btn.dataset.tab;
  document.querySelectorAll(".port-panel").forEach(p=>p.classList.remove("active"));
  document.getElementById("port-panel-"+state.portTab).classList.add("active");
}));

/* ─── PORTFOLIO SORT ─── */
document.querySelectorAll("#port-table th[data-sort]").forEach(th=>th.addEventListener("click",()=>{
  const col=th.dataset.sort;
  if(state.sort.col===col)state.sort.dir=state.sort.dir==="asc"?"desc":"asc";
  else{state.sort.col=col;state.sort.dir="desc"}
  state.portPage=1;renderPortfolio(getFiltered());
}));

/* ─── PAGINATION ─── */
document.getElementById("port-prev").onclick=()=>{if(state.portPage>1){state.portPage--;renderPortfolio(getFiltered())}};
document.getElementById("port-next").onclick=()=>{state.portPage++;renderPortfolio(getFiltered())};
document.getElementById("portc-prev").onclick=()=>{if(state.portPage>1){state.portPage--;renderPortfolio(getFiltered())}};
document.getElementById("portc-next").onclick=()=>{state.portPage++;renderPortfolio(getFiltered())};

/* ─── THEME ─── */
document.getElementById("theme-toggle").onclick=()=>{
  document.documentElement.dataset.theme=document.documentElement.dataset.theme==="dark"?"":"dark";
  renderAll();
};

/* ─── EXPORTS ─── */
function download(blob,name){const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
document.getElementById("export-csv").onclick=()=>{
  const data=getFiltered(),headers=Object.keys(data[0]||PROJECTS[0]);
  download(new Blob([[headers.join(","),...data.map(p=>headers.map(h=>JSON.stringify(p[h]??"")))].join("\n")],{type:"text/csv"}),"abia-projects.csv");
};
document.getElementById("export-xlsx").onclick=()=>{
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(getFiltered()),"Projects");
  XLSX.writeFile(wb,"abia-projects.xlsx");
};
document.getElementById("export-img").onclick=async()=>{
  const el=document.querySelector(".page.active");
  const canvas=await html2canvas(el,{backgroundColor:getComputedStyle(document.body).backgroundColor,scale:2});
  canvas.toBlob(b=>download(b,`abia-${state.page}.png`));
};
document.getElementById("export-pdf").onclick=async()=>{
  const el=document.querySelector(".page.active");
  const canvas=await html2canvas(el,{backgroundColor:"#fff",scale:2});
  const img=canvas.toDataURL("image/png");
  const{jsPDF}=window.jspdf;
  const pdf=new jsPDF({orientation:"landscape",unit:"pt",format:"a4"});
  const w=pdf.internal.pageSize.getWidth(),h=canvas.height*w/canvas.width;
  pdf.addImage(img,"PNG",0,0,w,h);
  pdf.save(`abia-${state.page}.pdf`);
};

/* ─── BOOT ─── */
populateFilters();
renderAll();
