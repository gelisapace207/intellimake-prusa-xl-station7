const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("improvement-form");
const result = document.getElementById("calc-result");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const current = Number(document.getElementById("current-time").value);
  const improved = Number(document.getElementById("improved-time").value);

  if (!current || !improved || current <= 0 || improved <= 0) {
    result.textContent = "Please enter two positive cycle-time values.";
    return;
  }

  const change = ((current - improved) / current) * 100;

  if (change > 0) {
    result.innerHTML = `Cycle time improved by <strong>${change.toFixed(1)}%</strong>.`;
  } else if (change === 0) {
    result.textContent = "There is no change in cycle time.";
  } else {
    result.innerHTML = `Cycle time increased by <strong>${Math.abs(change).toFixed(1)}%</strong>.`;
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

// ---------- Prusa XL configuration selector ----------
const configButtons = document.querySelectorAll("[data-config]");
const configPanel = document.getElementById("config-panel");
const docks = document.querySelectorAll(".dock");
let xlConfig = "single";
const configCopy = {
  single: "<strong>Single Tool:</strong> One Nextruder performs the print. This is the simplest configuration for single-material jobs.",
  dual: "<strong>Dual Head:</strong> Two independent Nextruders can be selected by the ToolChanger, supporting multi-material, multi-color, or different-nozzle workflows.",
  five: "<strong>Five Head:</strong> Up to five independent Nextruders can be docked and selected automatically for advanced multi-material and multi-tool workflows."
};
configButtons.forEach((button) => button.addEventListener("click", () => {
  xlConfig = button.dataset.config;
  configButtons.forEach((b) => b.classList.toggle("active", b === button));
  configPanel.innerHTML = configCopy[xlConfig];
  docks.forEach((d, i) => d.classList.toggle("hidden", xlConfig === "single" || (xlConfig === "dual" && i > 0)));
  restartAnimation();
}));

// ---------- Prusa XL educational animation ----------
const animTitle = document.getElementById("animation-title");
const animCopy = document.getElementById("animation-copy");
const animProgress = document.getElementById("animation-progress");
const animSteps = [...document.querySelectorAll("#step-list span")];
const toolhead = document.getElementById("toolhead");
const printPart = document.getElementById("print-part");
const startBtn = document.getElementById("anim-start");
const pauseBtn = document.getElementById("anim-pause");
const restartBtn = document.getElementById("anim-restart");
let animIndex = 0;
let animTimer = null;
const animationData = [
  ["Prepare the digital model", "A printable 3D model — here, an 89 × 51 mm business card with raised name and QR pad — defines the geometry."],
  ["Slice and generate G-code", "PrusaSlicer converts the card model, layer height, and metal-composite filament profile into machine instructions."],
  ["Prepare printer and material", "Load the matching copper, bronze, steel-filled, or PETG spool and confirm nozzle, sheet, and tool count."],
  ["Calibrate the print area", "The XL uses its sensing and calibration routines to establish the print surface relationship before deposition."],
  ["Heat and extrude", "The Nextruder feeds filament into the hotend, where it is heated and deposited through the nozzle."],
  ["Build layer by layer", "XY motion traces the card outline and lettering while Z builds thickness. Dual/five-head jobs can swap tools for a logo inlay."],
  ["Complete the part", "After cooling, the card is removed from the sheet, optionally polished to show metal particles, then handed to S6."]
];
function renderAnimationStep() {
  const [title, copy] = animationData[animIndex];
  animTitle.textContent = title; animCopy.textContent = copy;
  animProgress.style.width = `${((animIndex + 1) / animationData.length) * 100}%`;
  animSteps.forEach((s, i) => s.classList.toggle("active", i === animIndex));
  if (animIndex < 4) { toolhead.style.left = "14%"; printPart.style.height = "0"; }
  if (animIndex === 4) { toolhead.style.left = "42%"; toolhead.style.top = "48%"; printPart.style.height = "18px"; }
  if (animIndex === 5) { toolhead.style.top = "27%"; toolhead.style.left = xlConfig === "single" ? "62%" : "74%"; printPart.style.height = "105px"; toolhead.firstChild; if (xlConfig !== "single") toolhead.childNodes[0].nodeValue = xlConfig === "dual" ? "T2" : "T3"; }
  if (animIndex === 6) { toolhead.style.left = "14%"; toolhead.style.top = "17%"; printPart.style.height = "125px"; }
}
function advanceAnimation() { renderAnimationStep(); if (animIndex < animationData.length - 1) { animIndex++; animTimer = setTimeout(advanceAnimation, 2100); } else { animTimer = null; } }
function pauseAnimation() { if (animTimer) clearTimeout(animTimer); animTimer = null; }
function restartAnimation() { pauseAnimation(); animIndex = 0; toolhead.style.left="14%"; toolhead.style.top="17%"; toolhead.childNodes[0].nodeValue="T1"; printPart.style.height="0"; animProgress.style.width="0"; animSteps.forEach(s=>s.classList.remove("active")); animTitle.textContent="Ready to begin"; animCopy.textContent="Select Start to follow a simplified digital-to-physical printing workflow."; }
startBtn?.addEventListener("click", () => { if (!animTimer) advanceAnimation(); });
pauseBtn?.addEventListener("click", pauseAnimation);
restartBtn?.addEventListener("click", restartAnimation);

// ---------- Personalized metal-look card studio ----------
const finishLabels = {
  copper: "Copper-filled PLA",
  bronze: "Bronze-filled PLA",
  steel: "Steel-filled PLA",
  gold: "Gold silk PLA",
  petg: "Black PETG"
};

function cardInputs() {
  return {
    name: document.getElementById("card-name")?.value.trim() || "Your Name",
    title: document.getElementById("card-title")?.value.trim() || "Title",
    company: document.getElementById("card-company")?.value.trim() || "Company",
    finish: document.getElementById("card-finish")?.value || "copper",
    style: document.getElementById("card-style")?.value || "raised",
    layer: Number(document.getElementById("card-layer")?.value || 0.2)
  };
}

function updateCardStudio() {
  const card = document.getElementById("metal-card");
  if (!card) return;
  const job = cardInputs();
  document.getElementById("preview-name").textContent = job.name;
  document.getElementById("preview-title").textContent = job.title;
  document.getElementById("preview-company").textContent = job.company;
  document.getElementById("preview-finish").textContent = finishLabels[job.finish];
  card.className = `metal-card finish-${job.finish}`;

  const thickness = job.style === "thin" ? 0.8 : job.style === "dual" ? 1.6 : 1.2;
  const volumeCm3 = (8.9 * 5.1 * thickness) / 1000;
  const infill = 0.85;
  const density = job.finish === "petg" ? 1.27 : job.finish === "gold" ? 1.24 : 2.4;
  const grams = volumeCm3 * infill * density;
  const layers = Math.ceil(thickness / job.layer);
  const minutes = Math.round(layers * (job.style === "dual" ? 3.4 : 2.6) + 8);
  const tools = job.style === "dual" ? "2 Nextruders" : "1 Nextruder";

  document.getElementById("est-size").textContent = `89 × 51 × ${thickness.toFixed(1)} mm`;
  document.getElementById("est-time").textContent = minutes >= 60
    ? `${Math.floor(minutes / 60)} h ${minutes % 60} min`
    : `${minutes} min`;
  document.getElementById("est-filament").textContent = `${grams.toFixed(1)} g`;
  document.getElementById("est-tools").textContent = tools;
  return { ...job, minutes, grams, tools, thickness };
}

["card-name", "card-title", "card-company", "card-finish", "card-style", "card-layer"].forEach((id) => {
  document.getElementById(id)?.addEventListener("input", updateCardStudio);
  document.getElementById(id)?.addEventListener("change", updateCardStudio);
});
updateCardStudio();

document.querySelectorAll(".cap-filters button").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.cap;
    document.querySelectorAll(".cap-filters button").forEach((b) => b.classList.toggle("active", b === button));
    document.querySelectorAll(".cap-card").forEach((card) => {
      card.classList.toggle("hidden", filter !== "all" && card.dataset.cap !== filter);
    });
  });
});

// ---------- Factory automation simulation ----------
const simStations = [
  ["order", "Order intake", "Customer design captured"],
  ["slice", "PrusaSlicer / G-code", "XL profile, layer height, and tool map written"],
  ["s7", "S7 Prusa XL", "Nextruder depositing the card layer by layer"],
  ["cool", "Cool & sheet release", "Part cooled; magnetic sheet flexed to release"],
  ["s6", "S6 robot handling", "Gripper picks the oriented card"],
  ["laser", "S4/S5 laser mark", "Optional serial / logo mark on polymer or metal-look surface"],
  ["inspect", "Inspection", "Dimensional and visual check"],
  ["ship", "S8 ship & pack", "Card packed for the customer"]
];
let simIndex = -1;
let simTimer = null;
let simSeconds = 0;
let simClockTimer = null;

function setSimJobLabel() {
  const job = cardInputs();
  const label = document.getElementById("sim-job");
  if (label) label.textContent = `${job.name} · ${finishLabels[job.finish]}`;
}

function renderSim() {
  document.querySelectorAll("#sim-stations li").forEach((li, i) => {
    li.classList.toggle("active", i === simIndex);
    li.classList.toggle("done", i < simIndex);
    const status = li.querySelector("span");
    if (i < simIndex) status.textContent = "Complete";
    else if (i === simIndex) status.textContent = "In process";
    else status.textContent = "Waiting";
  });
  const log = document.getElementById("sim-log");
  if (simIndex < 0) log.textContent = "Press Start run, or design a card and send it here.";
  else if (simIndex >= simStations.length) log.textContent = "Job complete. Card is packed. Reset to run another order.";
  else log.textContent = simStations[simIndex][2];
}

function tickSimClock() {
  simSeconds += 1;
  const m = String(Math.floor(simSeconds / 60)).padStart(1, "0");
  const s = String(simSeconds % 60).padStart(2, "0");
  document.getElementById("sim-clock").textContent = `T+${m}:${s}`;
}

function stopSimTimers() {
  if (simTimer) clearTimeout(simTimer);
  if (simClockTimer) clearInterval(simClockTimer);
  simTimer = null;
  simClockTimer = null;
}

function advanceSim() {
  if (simIndex >= simStations.length) {
    stopSimTimers();
    renderSim();
    return;
  }
  renderSim();
  simIndex += 1;
  simTimer = setTimeout(advanceSim, 1800);
}

function startSim() {
  stopSimTimers();
  setSimJobLabel();
  if (simIndex < 0 || simIndex >= simStations.length) {
    simIndex = 0;
    simSeconds = 0;
  }
  simClockTimer = setInterval(tickSimClock, 1000);
  advanceSim();
}

function resetSim() {
  stopSimTimers();
  simIndex = -1;
  simSeconds = 0;
  document.getElementById("sim-clock").textContent = "T+0:00";
  renderSim();
}

document.getElementById("sim-start")?.addEventListener("click", startSim);
document.getElementById("sim-pause")?.addEventListener("click", stopSimTimers);
document.getElementById("sim-reset")?.addEventListener("click", resetSim);
document.getElementById("send-to-factory")?.addEventListener("click", () => {
  updateCardStudio();
  setSimJobLabel();
  document.getElementById("factory-sim")?.scrollIntoView({ behavior: "smooth" });
  startSim();
});
renderSim();

// ---------- Guided assembled-XL educational procedure ----------
const assemblySteps = [
["Prepare a safe workspace","Before unpacking, clear a stable, level work surface with room for the printer and packing materials. Check that you have assistance for lifting the heavy printer. Identify the delivered configuration and read its exact official assembly manual.","Do not lift or energize the printer alone or before following the manufacturer's handling instructions.","Unboxing"],
["Open the shipping package","Inspect the outer packaging for damage. Open the carton in the order illustrated in the matching Prusa manual. Identify the printer and the separate accessory boxes before removing components.","Retain all packaging until setup and inspection are complete.","Unboxing"],
["Remove transport protection","With the required assistance, remove the printer from the packaging as the official guide illustrates. Remove only the foam, protective material and transport restraints explicitly identified by the manual. Account for loose components.","Do not pull on the frame, belts, cables, tool docks or electronics. Never remove unidentified components.","Unboxing"],
["Inventory the supplied parts","Locate the display/LCD, toolhead assembly or assemblies, spool holders, Wi-Fi antenna and holder, print sheet, cables and accessories applicable to the chosen model. Compare the actual contents with the official checklist.","Parts and quantities vary by assembled, semi-assembled, and multi-tool version.","Identification"],
["Identify front, rear and major systems","Find the front display location, rear electronics and antenna connection area, segmented heatbed, CoreXY gantry, toolhead mounting positions and—on multi-tool versions—tool docks. Compare each feature to the official pictures.","Do not unplug or alter motherboard connectors merely to identify them.","Identification"],
["Mount the LCD assembly","Using the exact Prusa guide for this model, position and secure the LCD/display at its specified mounting point. Route and connect its cable only as the illustrated instructions direct.","Power must remain disconnected during assembly. Do not force connectors or pinch the cable.","Assembly"],
["Fit the toolhead(s) and accessories","Follow the selected assembled-printer manual to fit the supplied Nextruder(s), toolhead cable routing and any applicable tool docks. For the five-head model, verify each tool's position against the corresponding manufacturer diagrams.","A five-head assembled XL is not the same procedure as a single-to-five-head upgrade kit.","Assembly"],
["Install the spool holder(s)","Identify the designated spool-holder mounting locations in the guide. Install the supplied holder(s) in the orientation specified for your configuration. Confirm that spools can feed without rubbing cables or moving parts.","Do not assume the holder count or mounting orientation from a different XL configuration.","Assembly"],
["Locate and fit the Wi-Fi antenna","Find the Wi-Fi antenna, its mounting hardware and the designated rear antenna connector using the manufacturer illustrations. Assemble the antenna holder/connector as directed, secure the antenna, and position it as shown in the guide.","The antenna connection is not a removable motherboard module. Do not remove internal electronic components to install Wi-Fi.","Connectivity"],
["Check cable routing and the print sheet","Compare every accessible cable and connector with the illustrated guide; inspect for pinching or loose external connections. Confirm that the correct removable spring-steel print sheet is seated on the magnetic heatbed.","Do not energize a printer with damaged wiring or unexplained missing parts; ask the lab supervisor.","Inspection"],
["Review safety before power-up","With instructor authorization, review emergency response, hot-surface and moving-mechanism hazards, approved material and ventilation requirements, and the lab's specific operating rules. Confirm the machine is ready for first power-up.","Do not operate the machine unsupervised. This webpage is not an operating authorization.","First run"],
["Power on and complete the setup wizard","After supervised inspection, follow the official first-run manual to connect power, switch on, check firmware prompts, and complete the machine's guided setup. The exact screens depend on installed firmware and tool configuration.","Stop and consult the supervisor if the machine reports an unexpected error.","First run"],
["Configure network and calibrations","Use the XL setup wizard and current Prusa instructions to configure Wi-Fi/PrusaLink or Prusa Connect if approved. Complete prompted checks, including relevant motion, loadcell, filament-sensor, and tool-offset calibrations.","Network credentials, calibration values and service procedures must come from authorized lab personnel.","First run"],
["Prepare filament, slice a test model","Verify approved filament, nozzle, print sheet and tool assignments. In PrusaSlicer select the exact XL profile, generate G-code for a small authorized test model, and verify the print preview and settings before transfer.","Specialty or abrasive filaments may require specific hardware; do not assume compatibility.","First print"],
["Supervise a test print and document results","With permission, observe first-layer behavior and the supervised test run without reaching into the moving printer. After completion and safe cooling, remove the part according to sheet guidance. Record results, issues and remaining open questions.","S7-to-S6 robot pickup and downstream laser marking are proposed integration steps, not validated automatic procedures.","First print"]
];
let assemblyIndex=0;const assemblyConfig=document.getElementById('assembly-config');
function renderAssembly(){const s=assemblySteps[assemblyIndex];if(!s)return;document.getElementById('assembly-number').textContent=String(assemblyIndex+1).padStart(2,'0');document.getElementById('assembly-phase').textContent=s[3];document.getElementById('assembly-title').textContent=s[0];document.getElementById('assembly-description').textContent=s[1]+(assemblyIndex===6?' Selected configuration: '+assemblyConfig.options[assemblyConfig.selectedIndex].text+'.':'');document.getElementById('assembly-warning').textContent='Safety / verification: '+s[2];document.getElementById('assembly-count').textContent='Step '+(assemblyIndex+1)+' of '+assemblySteps.length;document.getElementById('assembly-check').checked=false;document.getElementById('assembly-prev').disabled=assemblyIndex===0;document.getElementById('assembly-next').textContent=assemblyIndex===assemblySteps.length-1?'Finish guide':'Next step →';document.getElementById('assembly-roadmap').innerHTML=assemblySteps.map((step,i)=>'<li class="'+(i===assemblyIndex?'current':i<assemblyIndex?'complete':'')+'" data-step="'+i+'">'+(i+1)+'. '+step[0]+'</li>').join('');}
document.getElementById('assembly-next')?.addEventListener('click',()=>{if(assemblyIndex<assemblySteps.length-1){assemblyIndex++;renderAssembly();}else{document.getElementById('assembly-count').textContent='Guide reviewed · 15 steps';}});
document.getElementById('assembly-prev')?.addEventListener('click',()=>{assemblyIndex=Math.max(0,assemblyIndex-1);renderAssembly();});document.getElementById('assembly-reset')?.addEventListener('click',()=>{assemblyIndex=0;renderAssembly();});assemblyConfig?.addEventListener('change',renderAssembly);document.getElementById('assembly-roadmap')?.addEventListener('click',e=>{const li=e.target.closest('[data-step]');if(li){assemblyIndex=Number(li.dataset.step);renderAssembly();}});renderAssembly();
// ---------- Clickable factory explorer and distinct product workflows ----------
const factoryStations=[['S1','Receiving conveyor','Receives material blanks and feeds incoming logistics.','intellimake-concept-production-cell.png'],['S2','xArm 850 cobot','Transfers incoming material from receiving toward staging.','intellimake-concept-production-cell.png'],['S3','Inbound staging','Temporary storage and positioning before processing.','intellimake-concept-production-cell.png'],['S4','Laser conveyor','Transfers blanks to the laser-processing area.','intellimake-concept-production-cell.png'],['S5','xTool F1 Ultra','Personalizes compatible blanks using laser marking or engraving.','intellimake-concept-production-cell.png'],['S6','xArm 6 cobot','Proposed downstream transfer and handling; handoff to S7 requires future validation.','intellimake-concept-production-cell.png'],['S7','Prusa XL 3D printer','Future production extension: manufactures customized polymer geometry with one, two or five toolheads.','IMG_4099.jpg'],['S8','Outbound / QC','Routes completed work toward shipping or quality hold.','intellimake-concept-production-cell.png'],['S10','Packing & labeling','Final identification, packing and labeling.','intellimake-concept-production-cell.png'],['S11','IntelliAware monitoring','Course concept for AI vision and factory monitoring.','intellimake-concept-production-cell.png']];
const stationGrid=document.getElementById('station-grid');stationGrid.innerHTML=factoryStations.map(s=>'<button type="button" data-id="'+s[0]+'"><strong>'+s[0]+'</strong>'+s[1]+'</button>').join('');let factoryMode='metal',routeTimer=null,routeIndex=0;
const routes={metal:['S1','S2','S3','S4','S5','S6','S8','S10'],polymer:['S7','S6','S4','S5','S8','S10']};
function selectStation(id){const s=factoryStations.find(x=>x[0]===id);if(!s)return;document.getElementById('station-title').textContent=s[0]+' · '+s[1];document.getElementById('station-detail').textContent=s[2];document.getElementById('station-photo').src=s[3];document.querySelectorAll('#station-grid button').forEach(b=>b.classList.toggle('selected',b.dataset.id===id));}
stationGrid.addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(b)selectStation(b.dataset.id);});
function stopRoute(){clearTimeout(routeTimer);routeTimer=null;routeIndex=0;document.querySelectorAll('#station-grid button').forEach(b=>b.classList.remove('route-active'));document.getElementById('route-caption').textContent='Select a workflow and press Play route.';}
function setRoute(mode){stopRoute();factoryMode=mode;document.getElementById('flow-metal').classList.toggle('active',mode==='metal');document.getElementById('flow-polymer').classList.toggle('active',mode==='polymer');document.getElementById('route-caption').textContent=mode==='metal'?'Current concept: metal blank → laser engraving. S7 is not used.':'Future extension: polymer part from S7 → robot handling → compatible laser processing.';}
function advanceRoute(){const route=routes[factoryMode];if(routeIndex>=route.length){routeTimer=null;document.getElementById('route-caption').textContent='Simulation complete · This does not verify actual autonomous machine integration.';return;}const id=route[routeIndex++];selectStation(id);document.querySelectorAll('#station-grid button').forEach(b=>b.classList.toggle('route-active',b.dataset.id===id));document.getElementById('route-caption').textContent='Educational route step '+routeIndex+' of '+route.length+': '+id;routeTimer=setTimeout(advanceRoute,1250);}
document.getElementById('flow-metal')?.addEventListener('click',()=>setRoute('metal'));document.getElementById('flow-polymer')?.addEventListener('click',()=>setRoute('polymer'));document.getElementById('flow-play')?.addEventListener('click',()=>{stopRoute();advanceRoute();});document.getElementById('flow-stop')?.addEventListener('click',stopRoute);selectStation('S7');setRoute('metal');

// ---------- Animated whole-cell digital twin ----------
(()=>{
const svg=document.getElementById('cell-svg');if(!svg)return;
const NS='http://www.w3.org/2000/svg';const host=document.getElementById('cell-machines');
const sites=[['S1','RECEIVING','Conveyor',90,230,'belt'],['S2','xARM 850','Cobot',245,230,'robot'],['S3','STAGING','Table',380,230,'table'],['S4','LASER BELT','Conveyor',515,230,'belt'],['S5','F1 ULTRA','Laser',650,230,'laser'],['S6','xARM 6','Cobot',785,230,'robot'],['S7','PRUSA XL','3D Printer',785,405,'printer'],['S8','OUTBOUND','QC conveyor',925,230,'belt'],['S10','PACK / LABEL','Shipping',1030,405,'pack']];
const mk=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));(parent||host).appendChild(e);return e;};
function label(g,txt,y,cls){const t=mk('text',{x:0,y,'text-anchor':'middle',class:cls},g);t.textContent=txt;}
for(const [id,name,sub,x,y,type] of sites){const g=mk('g',{transform:`translate(${x} ${y})`,'data-cell':id,class:'cell-node'});mk('rect',{x:-57,y:-65,width:114,height:116,rx:12,class:'station-body'},g);mk('rect',{x:-45,y:-49,width:90,height:56,rx:6,fill:'#0c1420',stroke:'#526b86'},g);
if(type==='belt'){for(let i=-35;i<=35;i+=14)mk('line',{x1:i,y1:-40,x2:i,y2:-4,class:'cell-belt'},g);mk('rect',{x:-24,y:-33,width:25,height:16,rx:3,fill:'#efc05a'},g)}
if(type==='robot'){const arm=mk('g',{class:'cell-robot'},g);mk('path',{d:'M-15 0 L-12 -20 L12 -35 L25 -12',stroke:'#f6f8fa','stroke-width':9,'stroke-linecap':'round',fill:'none'},arm);mk('circle',{cx:-12,cy:-20,r:6,fill:'#ffab31'},arm);mk('circle',{cx:12,cy:-35,r:6,fill:'#ffab31'},arm);mk('path',{d:'M25 -12 L31 -5 M25 -12 L20 -5',stroke:'#fa784a','stroke-width':3},arm)}
if(type==='laser'){mk('rect',{x:-30,y:-44,width:60,height:42,rx:4,fill:'#121b26',stroke:'#f8ac39','stroke-width':2},g);mk('path',{d:'M0 -38V-20',stroke:'#fa553b','stroke-width':4},g);mk('path',{d:'M0 -20L-8 -6H8Z',fill:'#ff723d'},g)}
if(type==='printer'){mk('rect',{x:-31,y:-44,width:62,height:41,rx:3,fill:'#101925',stroke:'#fa9739','stroke-width':3},g);mk('path',{d:'M-26 -12H26',stroke:'#f4b638','stroke-width':3},g);mk('rect',{x:-14,y:-27,width:28,height:14,fill:'#de7b3a',class:'cell-print'},g);mk('path',{d:'M-32 -47H32',stroke:'#f5f6ff','stroke-width':4},g)}
if(type==='table'){mk('rect',{x:-33,y:-36,width:66,height:30,rx:4,fill:'#d69c48'},g);mk('rect',{x:-18,y:-31,width:25,height:16,rx:2,fill:'#f6e2a3'},g)}
if(type==='pack'){mk('path',{d:'M-27 -38L0 -48L28 -37V-9L0 2L-27 -10Z',fill:'#be8247',stroke:'#ffdb8c','stroke-width':2},g);mk('path',{d:'M0 -48V2M-27 -38L0 -27L28 -37',stroke:'#ffe6b5',fill:'none'},g)}
label(g,id+' · '+name,24,'station-label');label(g,sub,40,'station-sub');g.addEventListener('click',()=>{document.getElementById('cell-station').textContent=id+' · '+name;document.getElementById('cell-operation').textContent=sub;});}
const modes={metal:{name:'Metal card blank',steps:[['S1','Receive metal blank'],['S2','Robot transfers blank'],['S3','Stage workpiece'],['S4','Move along laser conveyor'],['S5','Laser engraves personalized card'],['S6','Robot unloads laser station'],['S8','Inspect and route outbound'],['S10','Pack and label card']]},poly:{name:'3D-printed polymer part',steps:[['S7','Print customized polymer geometry'],['S6','Proposed robot handoff'],['S4','Transport to laser area'],['S5','Compatible laser marking (requires validation)'],['S6','Robot transfers finished part'],['S8','Inspect and route outbound'],['S10','Pack and label part']]}};
let mode='metal',running=false,idx=0,progress=0,last=0,frame=0;const piece=document.getElementById('cell-workpiece'),path=document.getElementById('cell-route-line');const coord=id=>{const a=sites.find(s=>s[0]===id);return[a[3],a[4]]};
function update(){const steps=modes[mode].steps;document.getElementById('cell-step').textContent=Math.min(idx+1,steps.length)+' / '+steps.length;document.getElementById('cell-material').textContent=modes[mode].name;const current=steps[Math.min(idx,steps.length-1)];document.getElementById('cell-station').textContent=current[0];document.getElementById('cell-operation').textContent=current[1];document.querySelectorAll('[data-cell]').forEach(g=>g.classList.toggle('active',g.getAttribute('data-cell')===current[0]));}
function reset(){running=false;cancelAnimationFrame(frame);idx=0;progress=0;last=0;const steps=modes[mode].steps;piece.setAttribute('transform',`translate(${coord(steps[0][0]).join(' ')})`);path.setAttribute('d','M'+steps.map(s=>coord(s[0]).join(' ')).join(' L'));document.getElementById('cell-route-label').textContent=mode==='metal'?'S1 → S2 → S3 → S4 → S5 → S6 → S8 → S10 · S7 bypassed':'S7 → S6 → S4 → S5 → S6 → S8 → S10 · future concept';document.getElementById('cell-status').textContent='Ready · Select Run cell';update();}
function tick(t){if(!running)return;if(!last)last=t;const dt=Math.min(100,t-last);last=t;const steps=modes[mode].steps;const speed=Number(document.getElementById('cell-speed').value);progress+=dt*speed/1900;while(progress>=1){progress-=1;idx++;if(idx>=steps.length){idx=steps.length-1;running=false;document.getElementById('cell-status').textContent='✓ Production route completed · simulated';update();return;}update();}
const a=coord(steps[Math.max(0,idx-1)][0]),b=coord(steps[idx][0]);const q=idx===0?b:[a[0]+(b[0]-a[0])*progress,a[1]+(b[1]-a[1])*progress];piece.setAttribute('transform',`translate(${q[0]} ${q[1]})`);document.getElementById('cell-status').textContent='NOW RUNNING · '+steps[idx][1];frame=requestAnimationFrame(tick);}
document.getElementById('cell-play').addEventListener('click',()=>{if(running)return;if(idx>=modes[mode].steps.length-1&&progress===0)reset();running=true;last=0;frame=requestAnimationFrame(tick);});document.getElementById('cell-pause').addEventListener('click',()=>{running=false;cancelAnimationFrame(frame);document.getElementById('cell-status').textContent='Paused';});document.getElementById('cell-reset').addEventListener('click',reset);for(const m of ['metal','poly'])document.getElementById('cell-'+m).addEventListener('click',()=>{mode=m;document.getElementById('cell-metal').classList.toggle('active',m==='metal');document.getElementById('cell-poly').classList.toggle('active',m==='poly');reset();});reset();
})();


// INTELLIMAKE V3 interactive floor, anatomy, shift controls, multilingual headings, and quiz
(()=>{
const byId=id=>document.getElementById(id);
const shift=byId('shift-mode');shift?.addEventListener('click',()=>{const day=document.body.classList.toggle('day-shift');shift.textContent=day?'☾ Night Shift':'☀ Day Shift';shift.setAttribute('aria-pressed',String(day));});
const dict={es:{floorEyebrow:'APRENDIZAJE INMERSIVO · FASE 1',floorTitle:'La planta de producción automatizada',floorIntro:'Explore toda la celda IntelliMake en una simulación isométrica educativa. Seleccione una estación; seleccione S7 para acercarse a la Prusa XL de cinco cabezales. Los movimientos son esquemáticos.',runTour:'▶ Iniciar recorrido',pauseTour:'Ⅱ Pausa',resetView:'↺ Restablecer vista',anatomyEyebrow:'ESTACIÓN 7 · LABORATORIO',anatomyTitle:'Dentro de la Prusa XL de cinco cabezales',anatomyIntro:'Seleccione las piezas etiquetadas para conocer su función. La ilustración es conceptual; consulte el manual del fabricante.',galleryEyebrow:'GALERÍA DE PRODUCTOS',galleryTitle:'Qué puede fabricar la celda',galleryIntro:'Explore aplicaciones ilustrativas y recursos oficiales. No todos estos productos se han fabricado en el laboratorio.',arcadeEyebrow:'JUEGOS DE APRENDIZAJE',arcadeTitle:'Aprenda. Responda. Gane insignias.',arcadeIntro:'Preguntas cortas sobre la fábrica, la impresora y la seguridad. El progreso dura esta visita.'},fr:{floorEyebrow:'APPRENTISSAGE IMMERSIF · PHASE 1',floorTitle:'L’atelier de production automatisé',floorIntro:'Explorez toute la cellule IntelliMake en simulation isométrique éducative. Sélectionnez une station; sélectionnez S7 pour zoomer sur la Prusa XL à cinq outils. Les mouvements sont schématiques.',runTour:'▶ Lancer la visite',pauseTour:'Ⅱ Pause',resetView:'↺ Réinitialiser',anatomyEyebrow:'STATION 7 · LABORATOIRE',anatomyTitle:'À l’intérieur de la Prusa XL à cinq outils',anatomyIntro:'Touchez les pièces étiquetées pour comprendre leur fonction. Illustration conceptuelle : consultez le manuel du fabricant.',galleryEyebrow:'GALERIE DES PRODUITS',galleryTitle:'Ce que la cellule peut fabriquer',galleryIntro:'Découvrez des applications illustratives et des ressources officielles. Elles ne sont pas toutes validées dans le laboratoire.',arcadeEyebrow:'JEUX PÉDAGOGIQUES',arcadeTitle:'Apprendre. Répondre. Gagner.',arcadeIntro:'Des questions courtes sur la fabrication, la Prusa XL et la sécurité. Le score dure pendant cette visite.'}};
const originals=new Map([...document.querySelectorAll('[data-i18n]')].map(e=>[e,e.textContent]));byId('site-language')?.addEventListener('change',e=>{const lang=e.target.value;document.documentElement.lang=lang;for(const [el,original] of originals)el.textContent=dict[lang]?.[el.dataset.i18n]||original;const message=lang==='en'?'English interface selected.':lang==='es'?'Interfaz principal en español.':'Interface principale en français.';byId('floor-status').textContent=message;});
const parts={tool:['Five independent Nextruders','Each toolhead carries its own filament and nozzle. The ToolChanger docks and selects tools during multi-material jobs. Tool changes take time but reduce some shared-nozzle purging.'],xy:['CoreXY frame and motion','A coordinated belt-driven XY motion system positions the active toolhead; the Z axis changes the build height as layers are deposited.'],bed:['16-segment heated bed','Individually controlled heatbed tiles provide the large print area. The removable print sheet must match the approved filament and workflow.'],sensor:['Filament and loadcell sensors','Filament sensors monitor material presence; the loadcell assists nozzle-based first-layer calibration. The exact sensor positions must be checked on the lab machine.'],lcd:['LCD and controller','The front display provides local status and setup access. Firmware coordinates tool selection, motion, heaters and sensing.']};
function selectPart(id){const data=parts[id];byId('part-title').textContent=data[0];byId('part-text').textContent=data[1];document.querySelectorAll('[data-part]').forEach(b=>b.classList.toggle('active',b.dataset.part===id));}document.querySelectorAll('[data-part]').forEach(b=>{b.addEventListener('click',()=>selectPart(b.dataset.part));b.addEventListener('mouseenter',()=>selectPart(b.dataset.part));});selectPart('tool');
const ns='http://www.w3.org/2000/svg',eq=byId('floor-equipment'),camera=byId('floor-camera'),part=byId('floor-part');const stations=[['S1','Receiving',205,305,'Conveyor receives metal card blanks.'],['S2','xArm 850',320,250,'Robot moves workpieces between receiving and staging.'],['S3','Staging',430,305,'Temporary staging for incoming workpieces.'],['S4','Laser conveyor',540,250,'Motorized conveyor transfers workpieces to the laser.'],['S5','F1 Ultra laser',660,305,'Laser engraves personalized metal business cards.'],['S6','xArm 6',770,250,'Robot handles processed parts and proposed S7 handoffs.'],['S7','Prusa XL 5-head',750,415,'Future additive manufacturing extension for custom polymer parts.'],['S8','Outbound',865,330,'Conveyor transports completed items toward packing.'],['S10','Packing',935,400,'Final labeling and packaging.'],['S11','IntelliAware',540,150,'Factory monitoring and future vision-based inspection.']];
const node=(tag,attrs,parent)=>{const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.appendChild(n);return n};
function makeStation([id,name,x,y,description]){const g=node('g',{class:'floor-station',tabindex:'0',role:'button','aria-label':id+' '+name,transform:`translate(${x} ${y})`},eq);node('path',{d:'M-56 -8L0 -34L56 -8L0 18Z',fill:'url(#tableTop)',stroke:'#b9d2e5','stroke-width':2,class:'machine-top'},g);for(const dx of [-43,38])node('path',{d:`M${dx} 0v45`,stroke:'#93a8b6','stroke-width':6},g);if(['S1','S4','S8'].includes(id)){for(let k=-35;k<=35;k+=14)node('path',{d:`M${k} -17l18 10`,stroke:'#223245','stroke-width':4},g);}else if(['S2','S6'].includes(id)){const arm=node('g',{class:'cell-robot'},g);node('path',{d:'M-9 -8L-15 -58L15 -76L36 -47',stroke:'#f4f7fa','stroke-width':11,'stroke-linecap':'round',fill:'none'},arm);node('circle',{cx:-15,cy:-58,r:7,fill:'#ed9d37'},arm);node('circle',{cx:15,cy:-76,r:7,fill:'#ed9d37'},arm);}else if(id==='S7'){node('rect',{x:-34,y:-83,width:68,height:66,fill:'#172333',stroke:'#ffb547','stroke-width':4},g);for(let i=0;i<5;i++)node('rect',{x:-28+i*12,y:-83,width:9,height:17,fill:'#e76539'},g);node('rect',{x:-23,y:-31,width:45,height:7,fill:'#f3bd4c'},g);}else if(id==='S5'){node('rect',{x:-31,y:-66,width:62,height:50,rx:5,fill:'#152236',stroke:'#f3b547','stroke-width':3},g);node('path',{d:'M0 -62V-35',stroke:'#ed5535','stroke-width':4},g);}else if(id==='S10'){node('rect',{x:-21,y:-37,width:40,height:30,fill:'#b87d42',stroke:'#f6cb79','stroke-width':2},g);}else{node('rect',{x:-22,y:-27,width:44,height:14,fill:'#c48d49'},g);}node('text',{x:0,y:68,'text-anchor':'middle'},g).textContent=id+' '+name;const select=()=>{document.querySelectorAll('.floor-station').forEach(n=>n.classList.remove('selected'));g.classList.add('selected');byId('floor-selected').textContent=id+' · '+name;byId('floor-explanation').textContent=description;byId('floor-scene-label').textContent=id+' · '+name;camera.style.transform=id==='S7'?'translate(-415px,-235px) scale(1.62)':'translate(0,0) scale(1)';};g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});}stations.forEach(makeStation);
const routes={metal:['S1','S2','S3','S4','S5','S6','S8','S10'],poly:['S7','S6','S4','S5','S6','S8','S10']};let route='metal',idx=0,frac=0,running=false,last=0,raf=0;const point=id=>{const a=stations.find(s=>s[0]===id);return[a[2],a[3]]};function resetFloor(){running=false;cancelAnimationFrame(raf);idx=0;frac=0;last=0;const [x,y]=point(routes[route][0]);part.setAttribute('transform',`translate(${x} ${y})`);camera.style.transform='translate(0,0) scale(1)';byId('floor-scene-label').textContent='Full production cell';byId('floor-status').textContent='Ready · '+(route==='metal'?'Laser route · S7 bypassed':'Future polymer route · S7 included');}function tick(t){if(!running)return;if(!last)last=t;frac+=Math.min(t-last,80)/1450;last=t;const steps=routes[route];if(frac>=1){frac=0;idx++;if(idx>=steps.length-1){running=false;byId('floor-status').textContent='✓ Simulated route complete';return;}}const a=point(steps[idx]),b=point(steps[idx+1]);const x=a[0]+(b[0]-a[0])*frac,y=a[1]+(b[1]-a[1])*frac;part.setAttribute('transform',`translate(${x} ${y})`);byId('floor-status').textContent='NOW RUNNING · '+steps[idx]+' → '+steps[idx+1];raf=requestAnimationFrame(tick);}byId('floor-tour').addEventListener('click',()=>{if(running)return;if(idx>=routes[route].length-1)resetFloor();running=true;last=0;raf=requestAnimationFrame(tick);});byId('floor-pause').addEventListener('click',()=>{running=false;cancelAnimationFrame(raf);byId('floor-status').textContent='Paused';});byId('floor-reset').addEventListener('click',resetFloor);byId('floor-route').addEventListener('change',e=>{route=e.target.value;resetFloor();});resetFloor();
const questions=[{module:'FACTORY FLOW',q:'Which station engraves a metal business card?',a:['S7 Prusa XL','S5 xTool F1 Ultra','S10 Packing','S3 Staging'],correct:1,why:'S5 performs laser personalization of the metal blank.'},{module:'FACTORY FLOW',q:'Which route includes S7 in the supplied course diagram?',a:['Initial metal-card laser route','Future 3D-printed product route','Both always','Neither'],correct:1,why:'S7 is the future additive manufacturing extension.'},{module:'PRUSA HARDWARE',q:'What does the XL ToolChanger select?',a:['Different independent Nextruders','A metal laser','Packing labels','Conveyor speeds'],correct:0,why:'It docks and selects independent print tools.'},{module:'PRUSA HARDWARE',q:'Which claim about five-head printing is accurate?',a:['No tool-change time','It directly prints solid metal cards','Tool switching takes time but can reduce purging','Every print is flawless'],correct:2,why:'Multiple tools reduce some purging, but switching still takes time.'},{module:'SAFE OPERATION',q:'Before running the school printer, students should…',a:['Ignore the setup wizard','Follow current Prusa guidance and get authorization','Reach inside while moving','Use any filament with any nozzle'],correct:1,why:'Manufacturer instructions and lab authorization come first.'},{module:'SAFE OPERATION',q:'Which part can become dangerously hot?',a:['Printer nozzle and heated bed','The website menu','Card preview','A printed QR code on screen'],correct:0,why:'Hotend and heatbed temperatures present burn hazards.'}];let qi=0,score=0,streak=0,answered=false;const badges=new Set();function renderQuiz(){const q=questions[qi];byId('quiz-module').textContent='MODULE · '+q.module;byId('quiz-counter').textContent=`QUESTION ${qi+1} OF ${questions.length}`;byId('quiz-question').textContent=q.q;byId('quiz-progress').textContent=`${qi+1} / ${questions.length}`;byId('quiz-feedback').textContent='';byId('quiz-next').disabled=true;answered=false;const root=byId('quiz-answers');root.replaceChildren();q.a.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+i)+'. '+label;b.addEventListener('click',()=>answer(i));root.appendChild(b);});}function answer(i){if(answered)return;answered=true;const q=questions[qi],correct=i===q.correct;streak=correct?streak+1:0;if(correct){score+=100;if(qi===1)badges.add('🏭 Conveyor Captain');if(qi===3)badges.add('🖨 Toolhead Master');if(qi===5)badges.add('🦺 Safety Champion');}byId('quiz-score').textContent=score;byId('quiz-streak').textContent=streak;byId('quiz-feedback').textContent=(correct?'✓ Correct! ':'✕ Not quite. ')+q.why;[...byId('quiz-answers').children].forEach((b,k)=>{b.disabled=true;if(k===q.correct)b.classList.add('correct');else if(k===i)b.classList.add('wrong');});byId('quiz-badges').replaceChildren();for(const badge of badges){const n=document.createElement('span');n.textContent=badge;byId('quiz-badges').appendChild(n);}byId('quiz-next').disabled=false;byId('quiz-next').textContent=qi===questions.length-1?'See results →':'Next question →';}byId('quiz-next').addEventListener('click',()=>{if(qi<questions.length-1){qi++;renderQuiz();}else{byId('quiz-question').textContent=`Mission complete — ${score} / 600 points`;byId('quiz-answers').replaceChildren();byId('quiz-feedback').textContent='Use Restart quiz to try again and improve your score.';byId('quiz-next').disabled=true;byId('quiz-counter').textContent='COMPLETED';}});byId('quiz-restart').addEventListener('click',()=>{qi=0;score=0;streak=0;badges.clear();byId('quiz-score').textContent='0';byId('quiz-streak').textContent='0';byId('quiz-badges').replaceChildren();renderQuiz();});renderQuiz();
})();
