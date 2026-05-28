/* ============================================================
 * Abia Impact Dashboard 2025-2026 — script.js
 * Ported from Lovable/React source (data.ts, all route files)
 * ============================================================ */

// ─── DATA ────────────────────────────────────────────────────
const LGAS = ["Aba North","Aba South","Arochukwu","Bende","Ikawuno","Isiala-Ngwa North","Isiala-Ngwa South","Isuikwuato","Obi Ngwa","Ohafia","Osisioma","Umuahia North","Umuahia South","Ukwa East","Ukwa West","Umu Nnochi","Ugwunagbo"];
const CLUSTERS = ["Commerce & Industry","Governance","Infrastructure","Social: Health & Edu","Social: Services"];
const MDAS_BY_CLUSTER = {
  "Commerce & Industry":["Ministry of Trade & Investment","Ministry of SMEs","Abia Investment Promotion Agency"],
  "Governance":["Office of the Governor","Ministry of Justice","Bureau of Public Procurement","Ministry of Finance"],
  "Infrastructure":["Ministry of Works","Ministry of Power","Ministry of Housing","Abia Roads Agency"],
  "Social: Health & Edu":["Ministry of Health","Ministry of Education","Primary Healthcare Agency","SUBEB"],
  "Social: Services":["Ministry of Women Affairs","Ministry of Youth & Sports","Ministry of Environment","Ministry of Agriculture"],
};
const PROJECT_TEMPLATES = {
  "Commerce & Industry":["SME Capital Grant Scheme","Aba Industrial Park Phase","Leather Cluster Modernisation","Trade Fair Pavilion Upgrade","Export Readiness Programme","Artisan Skills Hub"],
  "Governance":["Digital Civil Service Rollout","Open Budget Portal","Tax Reform Implementation","E-Procurement Platform","Judiciary Case Management System","Citizens Feedback Hotline"],
  "Infrastructure":["Township Road Rehabilitation","Rural Bridge Construction","Solar Streetlight Deployment","Drainage & Erosion Control","Public Housing Estate","Water Reticulation Project"],
  "Social: Health & Edu":["Primary Health Centre Upgrade","Free Maternal Care Programme","School Renovation Initiative","Teacher Training Programme","Scholarship Disbursement","Hospital Equipment Supply"],
  "Social: Services":["Women Empowerment Grant","Youth Tech Fellowship","Waste Management Expansion","Farm Input Subsidy","Community Sports Complex","Skills Acquisition Centre"],
};
const SDG_BY_CLUSTER = {
  "Commerce & Industry":["SDG 8","SDG 9","SDG 12","SDG 1"],
  "Governance":["SDG 16","SDG 17","SDG 10"],
  "Infrastructure":["SDG 9","SDG 11","SDG 6","SDG 7"],
  "Social: Health & Edu":["SDG 3","SDG 4","SDG 5"],
  "Social: Services":["SDG 5","SDG 1","SDG 2","SDG 13","SDG 15"],
};
const SDG_LIST = Array.from({length:17},(_,i)=>`SDG ${i+1}`);
const SDG_TITLES = {"SDG 1":"No Poverty","SDG 2":"Zero Hunger","SDG 3":"Good Health","SDG 4":"Quality Education","SDG 5":"Gender Equality","SDG 6":"Clean Water","SDG 7":"Affordable Energy","SDG 8":"Decent Work","SDG 9":"Industry & Innovation","SDG 10":"Reduced Inequalities","SDG 11":"Sustainable Cities","SDG 12":"Responsible Consumption","SDG 13":"Climate Action","SDG 14":"Life Below Water","SDG 15":"Life on Land","SDG 16":"Peace & Justice","SDG 17":"Partnerships"};
const SDG_COLORS = {"SDG 1":"#E5243B","SDG 2":"#DDA63A","SDG 3":"#4C9F38","SDG 4":"#C5192D","SDG 5":"#FF3A21","SDG 6":"#26BDE2","SDG 7":"#FCC30B","SDG 8":"#A21942","SDG 9":"#FD6925","SDG 10":"#DD1367","SDG 11":"#FD9D24","SDG 12":"#BF8B2E","SDG 13":"#3F7E44","SDG 14":"#0A97D9","SDG 15":"#56C02B","SDG 16":"#00689D","SDG 17":"#19486A"};
const CLUSTER_COLORS = {"Commerce & Industry":"#0a2540","Governance":"#5b6b89","Infrastructure":"#008751","Social: Health & Edu":"#e94f37","Social: Services":"#ffc107"};

// Seeded RNG
function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const rand=mulberry32(42);
const pick=arr=>arr[Math.floor(rand()*arr.length)];
const rng=(min,max)=>min+rand()*(max-min);
const irng=(min,max)=>Math.floor(rng(min,max+1));

function genProject(id){
  const cluster=pick(CLUSTERS);
  const mda=pick(MDAS_BY_CLUSTER[cluster]);
  const lga=pick(LGAS);
  const year=rand()<0.55?2025:2026;
  const priority=rand()<0.45?"Priority":"Non-priority";
  const sdg=pick(SDG_BY_CLUSTER[cluster]);
  const template=pick(PROJECT_TEMPLATES[cluster]);
  const name=`${template} — ${lga}`;
  const base=cluster==="Infrastructure"?rng(0.8e9,5e9):cluster==="Social: Health & Edu"?rng(0.3e9,2.5e9):cluster==="Commerce & Industry"?rng(0.2e9,1.8e9):rng(0.05e9,1.2e9);
  const budget=Math.round(base/1e6)*1e6;
  let progress,status,utilisation;
  const r=rand();
  if(r<0.3){status="Completed";progress=irng(95,100);utilisation=irng(85,100);}
  else if(r<0.85){status="In progress";progress=irng(15,90);utilisation=irng(20,95);}
  else{status="Not started";progress=0;utilisation=irng(0,10);}
  const spend=Math.round(budget*(utilisation/100));
  const peopleMul=cluster==="Social: Health & Edu"?3:cluster==="Infrastructure"?2:1;
  const directPeople=Math.round(irng(200,8000)*peopleMul*(priority==="Priority"?1.5:1));
  const indirectPeople=Math.round(directPeople*rng(1.5,4));
  const totalImpacted=directPeople+indirectPeople;
  const jobsCreated=Math.round(irng(10,600)*(cluster==="Commerce & Industry"?1.8:1));
  const womenPct=Math.round(rng(25,60));
  const youthPct=Math.round(rng(30,70));
  return {id,name,budget,spend,utilisation,year,cluster,mda,lga,priority,progress,status,sdg,directPeople,indirectPeople,totalImpacted,jobsCreated,womenPct,youthPct};
}
const PROJECTS=Array.from({length:150},(_,i)=>genProject(i+1));

// ─── FORMATTERS ──────────────────────────────────────────────
const fmtN=n=>n>=1e9?`₦${(n/1e9).toFixed(2)}B`:n>=1e6?`₦${(n/1e6).toFixed(1)}M`:n>=1e3?`₦${(n/1e3).toFixed(1)}K`:`₦${n}`;
const fmtNum=n=>n>=1e6?`${(n/1e6).toFixed(2)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:n.toLocaleString();

// ─── FILTERS ─────────────────────────────────────────────────
const F={year:"all",cluster:"all",lga:"all",mda:"all",status:"all",priority:"all",sdg:"all",search:""};
function filtered(){
  return PROJECTS.filter(p=>{
    if(F.year!=="all"&&String(p.year)!==F.year)return false;
    if(F.cluster!=="all"&&p.cluster!==F.cluster)return false;
    if(F.lga!=="all"&&p.lga!==F.lga)return false;
    if(F.mda!=="all"&&p.mda!==F.mda)return false;
    if(F.status!=="all"&&p.status!==F.status)return false;
    if(F.priority!=="all"&&p.priority!==F.priority)return false;
    if(F.sdg!=="all"&&p.sdg!==F.sdg)return false;
    if(F.search&&!p.name.toLowerCase().includes(F.search.toLowerCase())&&!p.mda.toLowerCase().includes(F.search.toLowerCase()))return false;
    return true;
  });
}

// ─── POPULATE SELECTS ────────────────────────────────────────
function addOpts(id,vals){const s=document.getElementById(id);vals.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;s.appendChild(o)});}
addOpts("f-cluster",CLUSTERS);
addOpts("f-lga",LGAS);
const ALL_MDAS=[...new Set(PROJECTS.map(p=>p.mda))].sort();
addOpts("f-mda",ALL_MDAS);
SDG_LIST.forEach(s=>{const o=document.createElement("option");o.value=s;o.textContent=s;document.getElementById("f-sdg").appendChild(o);});

document.querySelectorAll(".filter-bar select, #f-search").forEach(el=>{
  el.addEventListener("input",e=>{
    const key=e.target.id.replace("f-","");
    F[key]=e.target.value||"all";
    if(key==="search")F.search=e.target.value;
    portPage=1;renderAll();
  });
});
document.getElementById("f-reset").onclick=()=>{
  Object.keys(F).forEach(k=>F[k]="all");F.search="";
  document.querySelectorAll(".filter-bar select").forEach(el=>el.value="all");
  document.getElementById("f-search").value="";
  portPage=1;renderAll();
};

// ─── NAVIGATION ──────────────────────────────────────────────
let currentPage="overview";
document.querySelectorAll(".nav-link").forEach(a=>{
  a.onclick=()=>{
    document.querySelectorAll(".nav-link").forEach(n=>n.classList.remove("active"));
    a.classList.add("active");
    currentPage=a.dataset.page;
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById("page-"+currentPage).classList.add("active");
    // close mobile sidebar
    document.getElementById("sidebar").classList.remove("open");
    renderAll();
  };
});

// ─── SIDEBAR TOGGLE ──────────────────────────────────────────
const sidebar=document.getElementById("sidebar");
document.getElementById("sidebar-toggle").onclick=()=>{
  sidebar.classList.toggle("collapsed");
  document.getElementById("sidebar-toggle").textContent=sidebar.classList.contains("collapsed")?"›":"‹";
};
document.getElementById("menu-toggle").onclick=()=>sidebar.classList.toggle("open");

// ─── THEME ───────────────────────────────────────────────────
document.getElementById("theme-toggle").onclick=()=>{
  const isDark=document.documentElement.getAttribute("data-theme")==="dark";
  document.documentElement.setAttribute("data-theme",isDark?"":"dark");
  renderAll();
};

// ─── EXPORT CSV ──────────────────────────────────────────────
document.getElementById("btn-csv").onclick=()=>{
  const data=filtered();
  const headers=Object.keys(data[0]);
  const csv=[headers.join(","),...data.map(p=>headers.map(h=>JSON.stringify(p[h]??"")).join(","))].join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download="abia-projects.csv";a.click();
};
document.getElementById("btn-print").onclick=()=>window.print();

// ─── CHART HELPERS ───────────────────────────────────────────
const charts={};
function mkChart(id,config){
  if(charts[id]){charts[id].destroy();delete charts[id];}
  const ctx=document.getElementById(id);
  if(!ctx)return;
  const dark=document.documentElement.getAttribute("data-theme")==="dark";
  Chart.defaults.color=dark?"#8b949e":"#64748b";
  Chart.defaults.borderColor=dark?"#21262d":"#e8eeea";
  charts[id]=new Chart(ctx,config);
}

// ─── PORTFOLIO STATE ─────────────────────────────────────────
let portPage=1;
const PORT_SIZE=12;
let portSortKey="budget",portSortDir="desc";
let portTab="table";

// ─── MODAL ───────────────────────────────────────────────────
function openModal(p){
  const statusCls=p.status==="Completed"?"badge-completed":p.status==="In progress"?"badge-progress":"badge-notstarted";
  document.getElementById("modal-body").innerHTML=`
    <div class="modal-header">
      <div class="modal-sdg-icon" style="background:${SDG_COLORS[p.sdg]}">${p.sdg.replace("SDG ","")}</div>
      <div>
        <div class="modal-title">${p.name}</div>
        <div class="modal-subtitle">${SDG_TITLES[p.sdg]} &middot; ${p.cluster}</div>
      </div>
    </div>
    <div class="modal-badges">
      <span class="badge ${statusCls}">${p.status}</span>
      <span class="badge ${p.priority==="Priority"?"badge-priority":""}" style="${p.priority!=="Priority"?"border:1px solid var(--border)":""}">${p.priority}</span>
      <span class="badge" style="border:1px solid var(--border)">FY ${p.year}</span>
    </div>
    <div class="modal-info-grid">
      <div class="modal-info-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg><div><div class="modal-info-label">MDA</div><div class="modal-info-val">${p.mda}</div></div></div>
      <div class="modal-info-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><div><div class="modal-info-label">LGA</div><div class="modal-info-val">${p.lga}</div></div></div>
      <div class="modal-info-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><div><div class="modal-info-label">Fiscal Year</div><div class="modal-info-val">${p.year}</div></div></div>
      <div class="modal-info-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg><div><div class="modal-info-label">Primary SDG</div><div class="modal-info-val">${p.sdg} — ${SDG_TITLES[p.sdg]}</div></div></div>
    </div>
    <div class="modal-progress-box">
      <div class="header"><strong>${p.progress}% complete</strong><span style="color:var(--muted-fg)">${p.utilisation}% utilised</span></div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${p.progress}%"></div></div>
    </div>
    <div class="modal-stats">
      <div class="modal-stat"><div class="modal-stat-label">Budget</div><div class="modal-stat-val">${fmtN(p.budget)}</div></div>
      <div class="modal-stat"><div class="modal-stat-label">Spend</div><div class="modal-stat-val">${fmtN(p.spend)}</div></div>
      <div class="modal-stat"><div class="modal-stat-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> Direct People</div><div class="modal-stat-val">${fmtNum(p.directPeople)}</div></div>
      <div class="modal-stat"><div class="modal-stat-label">Indirect People</div><div class="modal-stat-val">${fmtNum(p.indirectPeople)}</div></div>
      <div class="modal-stat highlight"><div class="modal-stat-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg> Total Impacted</div><div class="modal-stat-val">${fmtNum(p.totalImpacted)}</div></div>
      <div class="modal-stat highlight"><div class="modal-stat-label">Jobs Created</div><div class="modal-stat-val">${fmtNum(p.jobsCreated)}</div></div>
      <div class="modal-stat"><div class="modal-stat-label">Women Benefit</div><div class="modal-stat-val">${p.womenPct}%</div></div>
      <div class="modal-stat"><div class="modal-stat-label">Youth Benefit</div><div class="modal-stat-val">${p.youthPct}%</div></div>
    </div>
    <div class="modal-story">
      <h4>Impact Story</h4>
      <p>This ${p.cluster.toLowerCase()} initiative in <strong>${p.lga}</strong> is delivering measurable change for <strong>${fmtNum(p.totalImpacted)}</strong> citizens, advancing the State's commitment to <strong>${SDG_TITLES[p.sdg]}</strong>. Implementation is led by ${p.mda}.</p>
    </div>`;
  document.getElementById("modal-bd").hidden=false;
  document.body.style.overflow="hidden";
}
document.getElementById("modal-close").onclick=closeModal;
document.getElementById("modal-bd").onclick=e=>{if(e.target===e.currentTarget)closeModal();};
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
function closeModal(){document.getElementById("modal-bd").hidden=true;document.body.style.overflow="";}

// ─── RENDER: OVERVIEW ────────────────────────────────────────
function renderOverview(data){
  const budget=data.reduce((s,p)=>s+p.budget,0);
  const spend=data.reduce((s,p)=>s+p.spend,0);
  const util=budget?(spend/budget)*100:0;
  const completed=data.filter(p=>p.status==="Completed").length;
  const people=data.reduce((s,p)=>s+p.totalImpacted,0);
  const jobs=data.reduce((s,p)=>s+p.jobsCreated,0);
  document.getElementById("kpi-budget").textContent=fmtN(budget);
  document.getElementById("kpi-spend").textContent=fmtN(spend);
  document.getElementById("kpi-util").textContent=util.toFixed(1)+"%";
  document.getElementById("kpi-projects").textContent=data.length;
  document.getElementById("kpi-completed").textContent=completed;
  document.getElementById("kpi-completed-rate").textContent=`${data.length?((completed/data.length)*100).toFixed(0):0}% rate`;
  document.getElementById("kpi-people").textContent=fmtNum(people);
  document.getElementById("kpi-jobs").textContent=fmtNum(jobs);
  document.getElementById("ov-subtitle").textContent=`Real-time view of Abia State's project portfolio · ${data.length} projects in scope`;

  // cluster bar
  const byCluster=CLUSTERS.map(c=>({name:c,budget:data.filter(p=>p.cluster===c).reduce((s,p)=>s+p.budget,0),projects:data.filter(p=>p.cluster===c).length}));
  mkChart("ch-cluster",{type:"bar",data:{labels:byCluster.map(d=>d.name),datasets:[{label:"Budget",data:byCluster.map(d=>d.budget),backgroundColor:CLUSTERS.map(c=>CLUSTER_COLORS[c]),borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmtN(c.parsed.y)}}},scales:{x:{ticks:{font:{size:11}}},y:{ticks:{callback:v=>`₦${(v/1e9).toFixed(1)}B`}}}}});

  // mix donut
  mkChart("ch-mix",{type:"doughnut",data:{labels:byCluster.map(d=>d.name),datasets:[{data:byCluster.map(d=>d.projects),backgroundColor:CLUSTERS.map(c=>CLUSTER_COLORS[c]),borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:"55%",plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:12}}}}});

  // priority progress
  const priorities=["Priority","Non-priority"];
  const priHtml=priorities.map(pri=>{
    const items=data.filter(p=>p.priority===pri);
    const avg=items.length?Math.round(items.reduce((s,p)=>s+p.progress,0)/items.length):0;
    return `<div class="priority-row"><div class="priority-row-header"><span>${pri}</span><span>${avg}% <span style="font-weight:400;font-size:11px;color:var(--muted-fg)">(${items.length} projects)</span></span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:${avg}%"></div></div></div>`;
  }).join("");
  document.getElementById("ov-priority").innerHTML=priHtml;

  // SDG treemap
  const sdgMap=new Map();
  data.forEach(p=>sdgMap.set(p.sdg,(sdgMap.get(p.sdg)||0)+p.budget));
  const treeData=Array.from(sdgMap.entries()).map(([sdg,val])=>({key:sdg,data:val,backgroundColor:SDG_COLORS[sdg]})).sort((a,b)=>b.data-a.data);
  mkChart("ch-sdg-tree",{type:"treemap",data:{datasets:[{label:"SDG Budget",tree:treeData.map(d=>d.data),key:"data",groups:["key"],backgroundColor(ctx){const d=ctx.raw;return d&&d._data&&treeData.find(t=>t.data===d._data.data)?.backgroundColor||"#008751";},labels:{display:true,formatter(ctx){const d=ctx.raw;return d&&d._data?[d._data.key||"",SDG_TITLES[d._data.key]||""]:[]}},borderWidth:2,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.raw._data?.key}: ${fmtN(ctx.raw.v)}`}}}}});

  // LGA heatmap
  const lgaMap=new Map();
  data.forEach(p=>lgaMap.set(p.lga,(lgaMap.get(p.lga)||0)+p.totalImpacted));
  const lgaSorted=[...lgaMap.entries()].sort((a,b)=>b[1]-a[1]);
  const maxLga=Math.max(1,...lgaSorted.map(x=>x[1]));
  document.getElementById("ov-lga-grid").innerHTML=lgaSorted.map(([lga,val])=>{
    const intensity=val/maxLga;
    const pct=(intensity*70).toFixed(0);
    const textColor=intensity>0.5?"white":"var(--navy)";
    return `<div class="lga-cell" style="background:color-mix(in srgb,#008751 ${pct}%,white)"><span class="lga-name" style="color:${textColor}">${lga}</span><span class="lga-val" style="color:${textColor}">${fmtNum(val)}</span></div>`;
  }).join("");
}

// ─── RENDER: PORTFOLIO ───────────────────────────────────────
function sortedProjects(data){
  const arr=[...data];
  arr.sort((a,b)=>{
    const av=a[portSortKey],bv=b[portSortKey];
    if(typeof av==="number")return portSortDir==="asc"?av-bv:bv-av;
    return portSortDir==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
  });
  return arr;
}

function renderPortfolio(data){
  const sorted=sortedProjects(data);
  const pages=Math.max(1,Math.ceil(sorted.length/PORT_SIZE));
  const safePage=Math.min(portPage,pages);
  const rows=sorted.slice((safePage-1)*PORT_SIZE,safePage*PORT_SIZE);

  document.getElementById("port-subtitle").textContent=`${data.length} projects · click any project for full details`;

  // table
  document.getElementById("port-tbody").innerHTML=rows.map(p=>{
    const statusCls=p.status==="Completed"?"badge-completed":p.status==="In progress"?"badge-progress":"badge-notstarted";
    return `<tr onclick="openModal(PROJECTS.find(x=>x.id===${p.id}))">
      <td><div class="cell-project"><strong>${p.name}</strong><small>${p.mda}</small></div></td>
      <td><span class="badge-cluster">${p.cluster}</span></td>
      <td>${p.lga}</td>
      <td style="text-align:right;font-weight:600">${fmtN(p.budget)}</td>
      <td style="text-align:right">${fmtN(p.spend)}</td>
      <td><div class="progress-cell"><div class="progress-mini"><div class="progress-mini-fill" style="width:${p.progress}%"></div></div><span>${p.progress}%</span></div></td>
      <td><span class="badge ${statusCls}">${p.status}</span></td>
      <td><span class="badge-sdg" style="background:${SDG_COLORS[p.sdg]}">${p.sdg.replace("SDG ","")}</span></td>
    </tr>`;
  }).join("");

  document.getElementById("port-page-info").textContent=`Showing ${(safePage-1)*PORT_SIZE+1}–${Math.min(safePage*PORT_SIZE,sorted.length)} of ${sorted.length}`;
  document.getElementById("port-page-label").textContent=`Page ${safePage} of ${pages}`;
  document.getElementById("port-prev").disabled=safePage===1;
  document.getElementById("port-next").disabled=safePage===pages;

  // cards
  document.getElementById("port-cards").innerHTML=rows.map(p=>{
    const statusCls=p.status==="Completed"?"badge-completed":p.status==="In progress"?"badge-progress":"badge-notstarted";
    return `<div class="project-card" onclick="openModal(PROJECTS.find(x=>x.id===${p.id}))">
      <div class="project-card-top">
        <span class="badge-sdg" style="background:${SDG_COLORS[p.sdg]};font-size:11px;padding:3px 7px">${p.sdg}</span>
        <span class="badge ${statusCls}">${p.status}</span>
      </div>
      <div class="project-card-name">${p.name}</div>
      <div class="project-card-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>${p.mda}</div>
      <div class="project-card-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${p.lga}</div>
      <div class="project-card-divider"></div>
      <div class="project-card-stat"><span>Budget</span><span>${fmtN(p.budget)}</span></div>
      <div class="project-card-stat"><span>Impact</span><span>${fmtNum(p.totalImpacted)} people</span></div>
      <div class="progress-mini" style="margin-top:8px"><div class="progress-mini-fill" style="width:${p.progress}%"></div></div>
    </div>`;
  }).join("");

  document.getElementById("portc-page-label").textContent=`Page ${safePage} of ${pages}`;
  document.getElementById("portc-prev").disabled=safePage===1;
  document.getElementById("portc-next").disabled=safePage===pages;

  // sort header highlight
  document.querySelectorAll("#port-table th").forEach(th=>{
    th.classList.remove("active");
    if(th.dataset.sort===portSortKey)th.classList.add("active");
  });
}

// table sort
document.querySelectorAll("#port-table th[data-sort]").forEach(th=>{
  th.onclick=()=>{
    if(portSortKey===th.dataset.sort)portSortDir=portSortDir==="asc"?"desc":"asc";
    else{portSortKey=th.dataset.sort;portSortDir="desc";}
    portPage=1;renderPortfolio(filtered());
  };
});
// pagination
document.getElementById("port-prev").onclick=()=>{portPage=Math.max(1,portPage-1);renderPortfolio(filtered());};
document.getElementById("port-next").onclick=()=>{portPage++;renderPortfolio(filtered());};
document.getElementById("portc-prev").onclick=()=>{portPage=Math.max(1,portPage-1);renderPortfolio(filtered());};
document.getElementById("portc-next").onclick=()=>{portPage++;renderPortfolio(filtered());};
// tabs
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    portTab=btn.dataset.tab;
    document.querySelectorAll(".tab-content").forEach(tc=>tc.classList.remove("active"));
    document.getElementById("tab-"+portTab).classList.add("active");
  };
});

// ─── RENDER: IMPACT ──────────────────────────────────────────
function renderImpact(data){
  const direct=data.reduce((s,p)=>s+p.directPeople,0);
  const indirect=data.reduce((s,p)=>s+p.indirectPeople,0);
  const total=direct+indirect;
  const jobs=data.reduce((s,p)=>s+p.jobsCreated,0);
  const women=data.length?data.reduce((s,p)=>s+p.womenPct,0)/data.length:0;
  const youth=data.length?data.reduce((s,p)=>s+p.youthPct,0)/data.length:0;
  document.getElementById("im-total").textContent=fmtNum(total);
  document.getElementById("im-direct").textContent=fmtNum(direct);
  document.getElementById("im-indirect").textContent=fmtNum(indirect);
  document.getElementById("im-jobs").textContent=fmtNum(jobs);
  document.getElementById("im-women").textContent=women.toFixed(0)+"%";
  document.getElementById("im-youth").textContent=youth.toFixed(0)+"%";
  document.getElementById("im-women-pct").textContent=women.toFixed(0)+"%";
  document.getElementById("im-youth-pct").textContent=youth.toFixed(0)+"%";

  // reach donut
  mkChart("ch-reach",{type:"doughnut",data:{labels:["Direct","Indirect"],datasets:[{data:[direct,indirect],backgroundColor:["#008751","#ffc107"],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:"55%",plugins:{legend:{position:"bottom",labels:{font:{size:11},boxWidth:12}},tooltip:{callbacks:{label:c=>fmtNum(c.parsed)}}}}});

  // jobs by cluster horizontal bar
  const jobsByCluster=CLUSTERS.map(c=>({name:c,jobs:data.filter(p=>p.cluster===c).reduce((s,p)=>s+p.jobsCreated,0)})).sort((a,b)=>b.jobs-a.jobs);
  mkChart("ch-jobs",{type:"bar",data:{labels:jobsByCluster.map(d=>d.name),datasets:[{label:"Jobs",data:jobsByCluster.map(d=>d.jobs),backgroundColor:CLUSTERS.map(c=>CLUSTER_COLORS[c]),borderRadius:6}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});

  // women/youth gauge donuts
  const wPct=Math.round(women);
  mkChart("ch-women",{type:"doughnut",data:{datasets:[{data:[wPct,100-wPct],backgroundColor:["#e94f37","#e5e7eb"],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{display:false},tooltip:{enabled:false}}}});
  const yPct=Math.round(youth);
  mkChart("ch-youth",{type:"doughnut",data:{datasets:[{data:[yPct,100-yPct],backgroundColor:["#ffc107","#e5e7eb"],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{display:false},tooltip:{enabled:false}}}});

  // top 5 impact
  const top5=[...data].sort((a,b)=>b.totalImpacted-a.totalImpacted).slice(0,5);
  document.getElementById("im-top-list").innerHTML=top5.map((p,i)=>`
    <div class="impact-item" onclick="openModal(PROJECTS.find(x=>x.id===${p.id}))" style="cursor:pointer">
      <div class="impact-rank">${i+1}</div>
      <div class="impact-info">
        <strong>${p.name}</strong>
        <div class="meta">${p.mda} · ${p.lga} · ${p.cluster}</div>
        <div class="story">Delivering ${fmtNum(p.totalImpacted)} impacted citizens and ${p.jobsCreated} jobs — advancing ${p.sdg}.</div>
      </div>
      <div class="impact-stat">
        <div class="val">${fmtNum(p.totalImpacted)}</div>
        <div class="lbl">people</div>
      </div>
      <span class="badge-sdg" style="background:${SDG_COLORS[p.sdg]};margin-left:6px;align-self:center">${p.sdg.replace("SDG ","")}</span>
    </div>`).join("");
}

// ─── RENDER: SDG ─────────────────────────────────────────────
function renderSdg(data){
  const totalBudget=data.reduce((s,p)=>s+p.budget,0)||1;
  const sdgStats=SDG_LIST.map(sdg=>{
    const items=data.filter(p=>p.sdg===sdg);
    const budget=items.reduce((s,p)=>s+p.budget,0);
    const impact=items.reduce((s,p)=>s+p.totalImpacted,0);
    return{sdg,title:SDG_TITLES[sdg],count:items.length,budget,impact,pct:(budget/totalBudget)*100};
  });

  // tiles
  document.getElementById("sdg-tiles").innerHTML=sdgStats.map(s=>`
    <div class="sdg-tile">
      <div class="sdg-tile-header" style="background:${SDG_COLORS[s.sdg]}">
        <div class="sdg-tile-n">${s.sdg}</div>
        <div class="sdg-tile-name">${s.title}</div>
      </div>
      <div class="sdg-tile-body">
        <div class="sdg-tile-pct">${s.pct.toFixed(1)}%</div>
        <div class="sdg-tile-label">of total budget</div>
        <div class="sdg-tile-detail">${s.count} projects · ${fmtN(s.budget)}</div>
      </div>
    </div>`).join("");

  // stacked bar: clusters x SDGs
  const stackData=CLUSTERS.map(c=>{
    const row={name:c};
    SDG_LIST.forEach(sdg=>{row[sdg]=data.filter(p=>p.cluster===c&&p.sdg===sdg).reduce((s,p)=>s+p.budget,0);});
    return row;
  });
  mkChart("ch-sdg-stack",{type:"bar",data:{labels:CLUSTERS,datasets:SDG_LIST.map(sdg=>({label:sdg,data:stackData.map(r=>r[sdg]),backgroundColor:SDG_COLORS[sdg],stack:"a"}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fmtN(c.parsed.y)}`}}},scales:{x:{ticks:{font:{size:10}}},y:{ticks:{callback:v=>`₦${(v/1e9).toFixed(1)}B`}}}}});

  // radar
  const maxBudget=Math.max(1,...sdgStats.map(s=>s.budget));
  const maxImpact=Math.max(1,...sdgStats.map(s=>s.impact));
  mkChart("ch-radar",{type:"radar",data:{labels:SDG_LIST.map(s=>s.replace("SDG ","")),datasets:[{label:"Budget",data:sdgStats.map(s=>(s.budget/maxBudget)*100),borderColor:"#008751",backgroundColor:"rgba(0,135,81,.25)",borderWidth:2,pointRadius:3},{label:"Impact",data:sdgStats.map(s=>(s.impact/maxImpact)*100),borderColor:"#ffc107",backgroundColor:"rgba(255,193,7,.2)",borderWidth:2,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{size:11}}}},scales:{r:{ticks:{display:false},pointLabels:{font:{size:10}}}}}});
}

// ─── RENDER: FINANCIAL ───────────────────────────────────────
function renderFinancial(data){
  const budget=data.reduce((s,p)=>s+p.budget,0);
  const spend=data.reduce((s,p)=>s+p.spend,0);
  const variance=budget-spend;
  const util=budget?(spend/budget)*100:0;
  const peoplePerM=spend?data.reduce((s,p)=>s+p.totalImpacted,0)/spend*1e6:0;
  document.getElementById("fin-budget").textContent=fmtN(budget);
  document.getElementById("fin-spend").textContent=fmtN(spend);
  document.getElementById("fin-unspent").textContent=fmtN(variance);
  document.getElementById("fin-remaining").textContent=`${(100-util).toFixed(1)}% remaining`;
  document.getElementById("fin-util").textContent=util.toFixed(1)+"%";
  document.getElementById("fin-insight").innerHTML=`For every <strong>₦1 million</strong> spent, Abia State projects in the current view reach approximately <strong>${peoplePerM.toFixed(0)} citizens</strong> — a strong indicator of efficient public investment.`;

  // budget vs spend composed
  const byCluster=CLUSTERS.map(c=>{
    const items=data.filter(p=>p.cluster===c);
    const b=items.reduce((s,p)=>s+p.budget,0);
    const s=items.reduce((s2,p)=>s2+p.spend,0);
    return{name:c,budget:b,spend:s,util:b?(s/b)*100:0};
  });
  mkChart("ch-bvs",{type:"bar",data:{labels:byCluster.map(d=>d.name),datasets:[{label:"Budget",data:byCluster.map(d=>d.budget),backgroundColor:"#0a2540",borderRadius:6,yAxisID:"y"},{label:"Spend",data:byCluster.map(d=>d.spend),backgroundColor:"#008751",borderRadius:6,yAxisID:"y"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{tooltip:{callbacks:{label:c=>c.dataset.label===("Util %")?c.parsed.y.toFixed(1)+"%":fmtN(c.parsed.y)}},legend:{labels:{font:{size:11}}}},scales:{x:{ticks:{font:{size:10}}},y:{ticks:{callback:v=>`₦${(v/1e9).toFixed(1)}B`}}}}});

  // year utilisation line
  const utilTrend=[2025,2026].map(y=>{
    const items=data.filter(p=>p.year===y);
    const b=items.reduce((s,p)=>s+p.budget,0);
    const s=items.reduce((s2,p)=>s2+p.spend,0);
    return{year:String(y),util:b?Math.round((s/b)*100):0};
  });
  mkChart("ch-year",{type:"line",data:{labels:utilTrend.map(d=>d.year),datasets:[{label:"Utilisation %",data:utilTrend.map(d=>d.util),borderColor:"#008751",backgroundColor:"rgba(0,135,81,.1)",borderWidth:3,pointRadius:6,pointBackgroundColor:"#008751",fill:true}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{min:0,max:100,ticks:{callback:v=>v+"%"}}},plugins:{legend:{display:false}}}});

  // VFM bubble scatter
  const vfmDatasets=CLUSTERS.map(c=>({label:c,data:data.filter(p=>p.cluster===c).map(p=>({x:p.spend/1e6,y:p.totalImpacted,r:Math.max(3,Math.sqrt(p.jobsCreated)*1.5),name:p.name})),backgroundColor:CLUSTER_COLORS[c]+"aa",borderColor:CLUSTER_COLORS[c]}));
  mkChart("ch-vfm",{type:"bubble",data:{datasets:vfmDatasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:10}}},tooltip:{callbacks:{label:ctx=>`${ctx.raw.name}: ${fmtNum(ctx.raw.y)} people, ₦${ctx.raw.x.toFixed(0)}M spend`}}},scales:{x:{title:{display:true,text:"Spend (₦M)",font:{size:11}}},y:{title:{display:true,text:"People Impacted",font:{size:11}},ticks:{callback:v=>fmtNum(v)}}}}});
}

// ─── MASTER RENDER ───────────────────────────────────────────
function renderAll(){
  const data=filtered();
  if(currentPage==="overview")renderOverview(data);
  if(currentPage==="portfolio")renderPortfolio(data);
  if(currentPage==="impact")renderImpact(data);
  if(currentPage==="sdg")renderSdg(data);
  if(currentPage==="financial")renderFinancial(data);
}

// Initial render
renderAll();
