/* ============================================================
 * Abia Impact Dashboard 2025–2026 — vanilla JS
 * Single-file logic: data generation, filters, charts, exports.
 * ============================================================ */

/* ---------- CONFIG / CONSTANTS ---------- */
const LGAS = ["Aba North","Aba South","Arochukwu","Bende","Ikawuno","Isiala-Ngwa North","Isiala-Ngwa South","Isuikwuato","Obi Ngwa","Ohafia","Osisioma","Umuahia North","Umuahia South","Ukwa East","Ukwa West","Umu Nnochi","Ugwunagbo"];
const CLUSTERS = ["Commerce & Industry","Governance","Infrastructure","Social: Health & Edu","Social: Services"];
const MDAS = {
  "Commerce & Industry": ["Ministry of Trade & Investment","Ministry of SMEs","Abia Investment Promotion Agency"],
  "Governance": ["Office of the Governor","Ministry of Justice","Bureau of Public Procurement","Ministry of Finance"],
  "Infrastructure": ["Ministry of Works","Ministry of Power","Ministry of Housing","Abia Roads Agency"],
  "Social: Health & Edu": ["Ministry of Health","Ministry of Education","Primary Healthcare Agency","SUBEB"],
  "Social: Services": ["Ministry of Women Affairs","Ministry of Youth & Sports","Ministry of Environment","Ministry of Agriculture"],
};
const TEMPLATES = {
  "Commerce & Industry": ["SME Capital Grant Scheme","Aba Industrial Park Phase","Leather Cluster Modernisation","Trade Fair Pavilion Upgrade","Export Readiness Programme","Artisan Skills Hub"],
  "Governance": ["Digital Civil Service Rollout","Open Budget Portal","Tax Reform Implementation","E-Procurement Platform","Judiciary Case Management System","Citizens Feedback Hotline"],
  "Infrastructure": ["Township Road Rehabilitation","Rural Bridge Construction","Solar Streetlight Deployment","Drainage & Erosion Control","Public Housing Estate","Water Reticulation Project"],
  "Social: Health & Edu": ["Primary Health Centre Upgrade","Free Maternal Care Programme","School Renovation Initiative","Teacher Training Programme","Scholarship Disbursement","Hospital Equipment Supply"],
  "Social: Services": ["Women Empowerment Grant","Youth Tech Fellowship","Waste Management Expansion","Farm Input Subsidy","Community Sports Complex","Skills Acquisition Centre"],
};
const SDG_BY_CLUSTER = {
  "Commerce & Industry":["SDG 8","SDG 9","SDG 12","SDG 1"],
  "Governance":["SDG 16","SDG 17","SDG 10"],
  "Infrastructure":["SDG 9","SDG 11","SDG 6","SDG 7"],
  "Social: Health & Edu":["SDG 3","SDG 4","SDG 5"],
  "Social: Services":["SDG 5","SDG 1","SDG 2","SDG 13","SDG 15"],
};
const SDG_COLORS = {"SDG 1":"#E5243B","SDG 2":"#DDA63A","SDG 3":"#4C9F38","SDG 4":"#C5192D","SDG 5":"#FF3A21","SDG 6":"#26BDE2","SDG 7":"#FCC30B","SDG 8":"#A21942","SDG 9":"#FD6925","SDG 10":"#DD1367","SDG 11":"#FD9D24","SDG 12":"#BF8B2E","SDG 13":"#3F7E44","SDG 14":"#0A97D9","SDG 15":"#56C02B","SDG 16":"#00689D","SDG 17":"#19486A"};
const SDG_TITLES = {"SDG 1":"No Poverty","SDG 2":"Zero Hunger","SDG 3":"Good Health","SDG 4":"Quality Education","SDG 5":"Gender Equality","SDG 6":"Clean Water","SDG 7":"Affordable Energy","SDG 8":"Decent Work","SDG 9":"Industry & Innovation","SDG 10":"Reduced Inequalities","SDG 11":"Sustainable Cities","SDG 12":"Responsible Consumption","SDG 13":"Climate Action","SDG 14":"Life Below Water","SDG 15":"Life on Land","SDG 16":"Peace & Justice","SDG 17":"Partnerships"};
const SDG_LIST = Object.keys(SDG_TITLES);
const CLUSTER_COLORS = {"Commerce & Industry":"#0a2540","Governance":"#5b6b89","Infrastructure":"#008751","Social: Health & Edu":"#e94f37","Social: Services":"#ffc107"};

/* ---------- SEEDED RNG ---------- */
function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const rand = mulberry32(42);
const pick = a => a[Math.floor(rand()*a.length)];
const rng = (lo,hi)=>lo+rand()*(hi-lo);
const irng = (lo,hi)=>Math.floor(rng(lo,hi+1));

function genProject(id){
  const cluster = pick(CLUSTERS);
  const mda = pick(MDAS[cluster]);
  const lga = pick(LGAS);
  const year = rand()<.55?2025:2026;
  const priority = rand()<.45?"Priority":"Non-priority";
  const sdg = pick(SDG_BY_CLUSTER[cluster]);
  const name = `${pick(TEMPLATES[cluster])} — ${lga}`;
  const base = cluster==="Infrastructure"?rng(.8e9,5e9):cluster==="Social: Health & Edu"?rng(.3e9,2.5e9):cluster==="Commerce & Industry"?rng(.2e9,1.8e9):rng(.05e9,1.2e9);
  const budget = Math.round(base/1e6)*1e6;
  let progress, status, utilisation;
  const r = rand();
  if(r<.3){status="Completed";progress=irng(95,100);utilisation=irng(85,100)}
  else if(r<.85){status="In progress";progress=irng(15,90);utilisation=irng(20,95)}
  else{status="Not started";progress=0;utilisation=irng(0,10)}
  const spend = Math.round(budget*utilisation/100);
  const mul = cluster==="Social: Health & Edu"?3:cluster==="Infrastructure"?2:1;
  const directPeople = Math.round(irng(200,8000)*mul*(priority==="Priority"?1.5:1));
  const indirectPeople = Math.round(directPeople*rng(1.5,4));
  return {id,name,budget,spend,utilisation,year,cluster,mda,lga,priority,progress,status,sdg,
    directPeople,indirectPeople,totalImpacted:directPeople+indirectPeople,
    jobsCreated:Math.round(irng(10,600)*(cluster==="Commerce & Industry"?1.8:1)),
    womenPct:Math.round(rng(25,60)),youthPct:Math.round(rng(30,70))};
}
const PROJECTS = Array.from({length:150},(_,i)=>genProject(i+1));

/* ---------- FORMAT ---------- */
const fmtN = n => n>=1e9?`₦${(n/1e9).toFixed(2)}B`:n>=1e6?`₦${(n/1e6).toFixed(1)}M`:n>=1e3?`₦${(n/1e3).toFixed(1)}K`:`₦${n}`;
const fmtNum = n => n>=1e6?`${(n/1e6).toFixed(2)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:n.toLocaleString();

/* ---------- STATE ---------- */
const state = {
  filters:{cluster:"all",lga:"all",year:"all",status:"all",priority:"all",sdg:"all",search:""},
  page:"overview",
  sort:{col:"budget",dir:"desc"},
};
const charts = {};

function getFiltered(){
  const f = state.filters;
  return PROJECTS.filter(p=>{
    if(f.cluster!=="all"&&p.cluster!==f.cluster)return false;
    if(f.lga!=="all"&&p.lga!==f.lga)return false;
    if(f.year!=="all"&&String(p.year)!==f.year)return false;
    if(f.status!=="all"&&p.status!==f.status)return false;
    if(f.priority!=="all"&&p.priority!==f.priority)return false;
    if(f.sdg!=="all"&&p.sdg!==f.sdg)return false;
    if(f.search){
      const q=f.search.toLowerCase();
      if(!p.name.toLowerCase().includes(q)&&!p.mda.toLowerCase().includes(q))return false;
    }
    return true;
  });
}

/* ---------- AGGREGATIONS ---------- */
function groupBy(arr, key){
  const m={}; arr.forEach(x=>{const k=x[key];(m[k]=m[k]||[]).push(x)}); return m;
}
function sum(arr,k){return arr.reduce((a,b)=>a+b[k],0)}

/* ---------- POPULATE FILTERS ---------- */
function populateFilters(){
  const fill=(id,arr)=>{const el=document.getElementById(id);arr.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;el.appendChild(o)})};
  fill("f-cluster",CLUSTERS);
  fill("f-lga",[...LGAS].sort());
  fill("f-sdg",SDG_LIST);
}

/* ---------- RENDER ---------- */
function destroyChart(id){if(charts[id]){charts[id].destroy();delete charts[id]}}

function renderOverview(data){
  document.getElementById("kpi-projects").textContent = data.length.toLocaleString();
  const done = data.filter(d=>d.status==="Completed").length;
  document.getElementById("kpi-projects-sub").textContent = `${done} completed · ${data.filter(d=>d.status==="In progress").length} in progress`;
  const budget=sum(data,"budget"), spend=sum(data,"spend");
  document.getElementById("kpi-budget").textContent = fmtN(budget);
  document.getElementById("kpi-spend").textContent = fmtN(spend);
  document.getElementById("kpi-util").textContent = budget?`${(spend/budget*100).toFixed(1)}% utilised`:"–";
  const people=sum(data,"totalImpacted"), jobs=sum(data,"jobsCreated");
  document.getElementById("kpi-people").textContent = fmtNum(people);
  document.getElementById("kpi-jobs").textContent = `${fmtNum(jobs)} jobs created`;

  // Cluster bar
  const byCluster = groupBy(data,"cluster");
  const cLabels = Object.keys(byCluster);
  destroyChart("cluster");
  charts.cluster = new Chart(document.getElementById("ch-cluster"),{
    type:"bar",
    data:{labels:cLabels,datasets:[{label:"Budget",data:cLabels.map(c=>sum(byCluster[c],"budget")),backgroundColor:cLabels.map(c=>CLUSTER_COLORS[c]),borderRadius:6}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>fmtN(ctx.raw)}}},scales:{y:{ticks:{callback:v=>fmtN(v)}}}}
  });

  // Status pie
  const byStatus = groupBy(data,"status");
  const sLabels = Object.keys(byStatus);
  const sColors = {"Completed":"#22c55e","In progress":"#3b82f6","Not started":"#ef4444"};
  destroyChart("status");
  charts.status = new Chart(document.getElementById("ch-status"),{
    type:"doughnut",
    data:{labels:sLabels,datasets:[{data:sLabels.map(s=>byStatus[s].length),backgroundColor:sLabels.map(s=>sColors[s]||"#888")}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}}
  });

  // SDG treemap
  const bySdg = groupBy(data,"sdg");
  const tree = Object.keys(bySdg).map(s=>({sdg:s,value:sum(bySdg[s],"budget"),count:bySdg[s].length}));
  destroyChart("sdg");
  charts.sdg = new Chart(document.getElementById("ch-sdg-tree"),{
    type:"treemap",
    data:{datasets:[{tree,key:"value",
      backgroundColor:ctx=>ctx.raw?SDG_COLORS[ctx.raw._data.sdg]:"#ccc",
      borderColor:"#fff",borderWidth:2,spacing:1,
      labels:{display:true,color:"#fff",font:{weight:"600",size:11},
        formatter:ctx=>[ctx.raw._data.sdg,SDG_TITLES[ctx.raw._data.sdg],fmtN(ctx.raw._data.value)]}}]},
    options:{plugins:{legend:{display:false},tooltip:{callbacks:{title:i=>i[0].raw._data.sdg+" — "+SDG_TITLES[i[0].raw._data.sdg],label:i=>`${fmtN(i.raw._data.value)} · ${i.raw._data.count} projects`}}},maintainAspectRatio:false}
  });
}

function renderPortfolio(data){
  document.getElementById("port-count").textContent = data.length;
  const {col,dir} = state.sort;
  const sorted = [...data].sort((a,b)=>{const va=a[col],vb=b[col];if(va<vb)return dir==="asc"?-1:1;if(va>vb)return dir==="asc"?1:-1;return 0});
  const tb = document.querySelector("#port-table tbody");
  tb.innerHTML = sorted.slice(0,300).map(p=>{
    const cls = p.status==="Completed"?"done":p.status==="In progress"?"prog":"not";
    return `<tr data-id="${p.id}">
      <td><strong>${p.name}</strong><br><small style="color:var(--muted)">${p.mda}</small></td>
      <td>${p.cluster}</td><td>${p.lga}</td>
      <td>${fmtN(p.budget)}</td><td>${p.utilisation}%</td>
      <td><span class="progress"><span style="width:${p.progress}%"></span></span> ${p.progress}%</td>
      <td><span class="pill ${cls}">${p.status}</span></td>
      <td><span style="color:${SDG_COLORS[p.sdg]};font-weight:700">●</span> ${p.sdg}</td>
    </tr>`;
  }).join("");
  tb.querySelectorAll("tr").forEach(tr=>tr.addEventListener("click",()=>openModal(+tr.dataset.id)));
}

function renderImpact(data){
  document.getElementById("im-direct").textContent = fmtNum(sum(data,"directPeople"));
  document.getElementById("im-indirect").textContent = fmtNum(sum(data,"indirectPeople"));
  document.getElementById("im-jobs").textContent = fmtNum(sum(data,"jobsCreated"));
  const w = data.length?Math.round(data.reduce((a,b)=>a+b.womenPct,0)/data.length):0;
  document.getElementById("im-women").textContent = `${w}%`;

  const byLga = groupBy(data,"lga");
  const lgaLabels = Object.keys(byLga).sort((a,b)=>sum(byLga[b],"totalImpacted")-sum(byLga[a],"totalImpacted"));
  destroyChart("lga");
  charts.lga = new Chart(document.getElementById("ch-lga"),{
    type:"bar",
    data:{labels:lgaLabels,datasets:[
      {label:"Direct",data:lgaLabels.map(l=>sum(byLga[l],"directPeople")),backgroundColor:"#008751"},
      {label:"Indirect",data:lgaLabels.map(l=>sum(byLga[l],"indirectPeople")),backgroundColor:"#ffc107"},
    ]},
    options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,scales:{x:{stacked:true,ticks:{callback:v=>fmtNum(v)}},y:{stacked:true}},plugins:{legend:{position:"bottom"}}}
  });

  const byC = groupBy(data,"cluster");
  const cl = Object.keys(byC);
  destroyChart("demo");
  charts.demo = new Chart(document.getElementById("ch-demo"),{
    type:"bar",
    data:{labels:cl,datasets:[
      {label:"Women %",data:cl.map(c=>Math.round(byC[c].reduce((a,b)=>a+b.womenPct,0)/byC[c].length)),backgroundColor:"#e94f37"},
      {label:"Youth %",data:cl.map(c=>Math.round(byC[c].reduce((a,b)=>a+b.youthPct,0)/byC[c].length)),backgroundColor:"#0a2540"},
    ]},
    options:{responsive:true,maintainAspectRatio:false,scales:{y:{max:100,ticks:{callback:v=>v+"%"}}},plugins:{legend:{position:"bottom"}}}
  });
}

function renderSDG(data){
  const bySdg = groupBy(data,"sdg");
  const grid = document.getElementById("sdg-grid");
  grid.innerHTML = SDG_LIST.map(s=>{
    const arr = bySdg[s]||[];
    return `<div class="sdg-card" data-sdg="${s}" style="background:${SDG_COLORS[s]}">
      <div class="num">${s}</div><div class="name">${SDG_TITLES[s]}</div>
      <div class="count">${arr.length}</div>
      <div class="bsub">${fmtN(sum(arr,"budget"))} · ${fmtNum(sum(arr,"totalImpacted"))} impacted</div>
    </div>`;
  }).join("");
  grid.querySelectorAll(".sdg-card").forEach(c=>c.addEventListener("click",()=>{
    document.getElementById("f-sdg").value=c.dataset.sdg;
    state.filters.sdg=c.dataset.sdg; renderAll();
  }));

  const byCluster = groupBy(data,"cluster");
  const cl = Object.keys(byCluster);
  destroyChart("radar");
  charts.radar = new Chart(document.getElementById("ch-radar"),{
    type:"radar",
    data:{labels:SDG_LIST,datasets:cl.map(c=>({
      label:c,
      data:SDG_LIST.map(s=>byCluster[c].filter(p=>p.sdg===s).length),
      borderColor:CLUSTER_COLORS[c],
      backgroundColor:CLUSTER_COLORS[c]+"33",
    }))},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}}
  });
}

function renderFinancial(data){
  const byC = groupBy(data,"cluster");
  const cl = Object.keys(byC);
  destroyChart("bvs");
  charts.bvs = new Chart(document.getElementById("ch-bvs"),{
    type:"bar",
    data:{labels:cl,datasets:[
      {label:"Budget",data:cl.map(c=>sum(byC[c],"budget")),backgroundColor:"#0a2540"},
      {label:"Spend",data:cl.map(c=>sum(byC[c],"spend")),backgroundColor:"#008751"},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:ctx=>ctx.dataset.label+": "+fmtN(ctx.raw)}}},scales:{y:{ticks:{callback:v=>fmtN(v)}}}}
  });

  const byY = groupBy(data,"year");
  const yrs = Object.keys(byY).sort();
  destroyChart("year");
  charts.year = new Chart(document.getElementById("ch-year"),{
    type:"bar",
    data:{labels:yrs,datasets:[
      {label:"Budget",data:yrs.map(y=>sum(byY[y],"budget")),backgroundColor:"#5b6b89"},
      {label:"Spend",data:yrs.map(y=>sum(byY[y],"spend")),backgroundColor:"#ffc107"},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{ticks:{callback:v=>fmtN(v)}}}}
  });

  destroyChart("vfm");
  charts.vfm = new Chart(document.getElementById("ch-vfm"),{
    type:"scatter",
    data:{datasets:cl.map(c=>({
      label:c,
      data:byC[c].map(p=>({x:p.budget/1e6,y:p.totalImpacted,name:p.name})),
      backgroundColor:CLUSTER_COLORS[c],
    }))},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:ctx=>`${ctx.raw.name}: ₦${ctx.raw.x.toFixed(0)}M → ${fmtNum(ctx.raw.y)} people`}}},
      scales:{x:{title:{display:true,text:"Budget (₦ Millions)"}},y:{title:{display:true,text:"Citizens Impacted"},ticks:{callback:v=>fmtNum(v)}}}}
  });
}

function renderAll(){
  const data = getFiltered();
  if(state.page==="overview")renderOverview(data);
  if(state.page==="portfolio")renderPortfolio(data);
  if(state.page==="impact")renderImpact(data);
  if(state.page==="sdg")renderSDG(data);
  if(state.page==="financial")renderFinancial(data);
}

/* ---------- MODAL ---------- */
function openModal(id){
  const p = PROJECTS.find(x=>x.id===id); if(!p)return;
  document.getElementById("modal-body").innerHTML = `
    <h2>${p.name}</h2>
    <div class="meta">${p.mda} · ${p.lga} · ${p.year}</div>
    <span class="pill ${p.status==='Completed'?'done':p.status==='In progress'?'prog':'not'}">${p.status}</span>
    <span style="color:${SDG_COLORS[p.sdg]};font-weight:700;margin-left:8px">● ${p.sdg} — ${SDG_TITLES[p.sdg]}</span>
    <div class="modal-grid">
      <div><div class="lbl">Cluster</div><div class="val">${p.cluster}</div></div>
      <div><div class="lbl">Priority</div><div class="val">${p.priority}</div></div>
      <div><div class="lbl">Budget</div><div class="val">${fmtN(p.budget)}</div></div>
      <div><div class="lbl">Spend (${p.utilisation}%)</div><div class="val">${fmtN(p.spend)}</div></div>
      <div><div class="lbl">Progress</div><div class="val">${p.progress}%</div></div>
      <div><div class="lbl">Jobs Created</div><div class="val">${p.jobsCreated.toLocaleString()}</div></div>
      <div><div class="lbl">Direct Beneficiaries</div><div class="val">${p.directPeople.toLocaleString()}</div></div>
      <div><div class="lbl">Indirect Beneficiaries</div><div class="val">${p.indirectPeople.toLocaleString()}</div></div>
      <div><div class="lbl">Women %</div><div class="val">${p.womenPct}%</div></div>
      <div><div class="lbl">Youth %</div><div class="val">${p.youthPct}%</div></div>
    </div>`;
  document.getElementById("modal-bd").hidden = false;
}
document.getElementById("modal-close").onclick = ()=>document.getElementById("modal-bd").hidden=true;
document.getElementById("modal-bd").onclick = e=>{if(e.target.id==="modal-bd")document.getElementById("modal-bd").hidden=true};

/* ---------- NAV ---------- */
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".nav-link").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("page-"+b.dataset.page).classList.add("active");
  state.page = b.dataset.page;
  document.querySelector(".sidebar").classList.remove("open");
  renderAll();
}));
document.getElementById("menu-toggle").onclick = ()=>document.querySelector(".sidebar").classList.toggle("open");

/* ---------- FILTERS ---------- */
["cluster","lga","year","status","priority","sdg"].forEach(k=>{
  document.getElementById("f-"+k).addEventListener("change",e=>{state.filters[k]=e.target.value;renderAll()});
});
document.getElementById("f-search").addEventListener("input",e=>{state.filters.search=e.target.value;renderAll()});
document.getElementById("f-reset").onclick = ()=>{
  state.filters = {cluster:"all",lga:"all",year:"all",status:"all",priority:"all",sdg:"all",search:""};
  document.querySelectorAll(".filters select").forEach(s=>s.value="all");
  document.getElementById("f-search").value="";
  renderAll();
};

/* ---------- SORTING ---------- */
document.querySelectorAll("#port-table th").forEach(th=>th.addEventListener("click",()=>{
  const col=th.dataset.sort; if(!col)return;
  if(state.sort.col===col)state.sort.dir = state.sort.dir==="asc"?"desc":"asc";
  else{state.sort.col=col;state.sort.dir="desc"}
  renderAll();
}));

/* ---------- THEME ---------- */
document.getElementById("theme-toggle").onclick = ()=>{
  const d = document.documentElement.dataset.theme==="dark"?"":"dark";
  document.documentElement.dataset.theme = d;
};

/* ---------- EXPORTS ---------- */
document.getElementById("export-csv").onclick = ()=>{
  const data = getFiltered();
  const headers = Object.keys(data[0]||PROJECTS[0]);
  const rows = data.map(p=>headers.map(h=>JSON.stringify(p[h]??"")).join(","));
  const csv = [headers.join(","),...rows].join("\n");
  download(new Blob([csv],{type:"text/csv"}),"abia-projects.csv");
};
document.getElementById("export-xlsx").onclick = ()=>{
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(getFiltered()),"Projects");
  XLSX.writeFile(wb,"abia-projects.xlsx");
};
document.getElementById("export-img").onclick = async ()=>{
  const el = document.querySelector(".page.active");
  const canvas = await html2canvas(el,{backgroundColor:getComputedStyle(document.body).backgroundColor,scale:2});
  canvas.toBlob(b=>download(b,`abia-${state.page}.png`));
};
document.getElementById("export-pdf").onclick = async ()=>{
  const el = document.querySelector(".page.active");
  const canvas = await html2canvas(el,{backgroundColor:"#fff",scale:2});
  const img = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:"landscape",unit:"pt",format:"a4"});
  const w = pdf.internal.pageSize.getWidth(), h = canvas.height*w/canvas.width;
  pdf.addImage(img,"PNG",0,0,w,h);
  pdf.save(`abia-${state.page}.pdf`);
};
function download(blob,name){const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}

/* ---------- BOOT ---------- */
populateFilters();
renderAll();
