"use strict";

const clips = [
  {id:1,name:"山川之间的留白.mp4",category:"自然风光",tags:["自然风光","山川","森林","宁静"],duration:"00:28",size:"3840 × 2160",height:174,summary:"薄雾在松林覆盖的山坡间缓缓铺开，深浅的绿色在雾气中形成层次。安静的山林景色，适合自然叙事、风景转场与氛围参考。"},
  {id:2,name:"城市的另一种秩序.mov",category:"城市建筑",tags:["城市建筑","夜景","光影","日常"],duration:"00:16",size:"3840 × 2160",height:143,summary:"雨后的东京街道映着霓虹灯光，建筑、招牌与湿润的路面构成夜色中的层次。适合城市叙事、夜景氛围与色彩参考。"},
  {id:3,name:"风经过沙丘的时候.mp4",category:"自然风光",tags:["自然风光","沙丘","远景","宁静"],duration:"00:32",size:"3840 × 2160",height:196,summary:"暗色沙丘在朦胧的天空下延伸，柔和的起伏与明暗形成极简的自然构图。适合旷野题材、氛围转场与地貌参考。"},
  {id:4,name:"光落在建筑上.mp4",category:"城市建筑",tags:["城市建筑","建筑","线条","光影"],duration:"00:24",size:"1920 × 1080",height:155,summary:"混凝土建筑以简洁的坡道与几何结构展开，水面与光线衬托出空间关系。适合建筑观察、极简构图与材质参考。"},
  {id:5,name:"沿着海岸，去远方.mov",category:"旅途记录",tags:["旅途记录","海岸","旅行","远景"],duration:"00:42",size:"3840 × 2160",height:147,summary:"海岸公路沿着绿色悬崖蜿蜒，开阔的海面与道路引导视线走向远方。适合公路旅行叙事、章节过渡与出发主题的视觉参考。"},
  {id:6,name:"海浪也有自己的节奏.mp4",category:"自然风光",tags:["自然风光","海岸","绿色","宁静"],duration:"00:19",size:"1920 × 1080",height:178,summary:"青绿色的海浪翻卷，白色浪花与深浅水色交织出自然的纹理。适合海洋题材、自然转场与色彩氛围参考。"},
  {id:7,name:"把时间交给旷野.mp4",category:"自然风光",tags:["自然风光","山川","远景","旅行"],duration:"00:36",size:"3840 × 2160",height:128,summary:"广阔的自然景观向远处延伸，地形与天空形成舒展的空间关系。适合户外故事、旅行开场和自然氛围的视觉参考。"},
  {id:8,name:"停在这里，看一会儿.mov",category:"旅途记录",tags:["旅途记录","山川","日出","旅行"],duration:"00:21",size:"3840 × 2160",height:169,summary:"橙色日出照亮山顶，一位远处的徒步者走在山脊上。人物与广阔风景形成尺度对比，适合户外旅途、出发与探索主题。"}
];

const $ = selector => document.querySelector(selector);
const grid = $("#clip-grid");
const searchInput = $("#demo-search");
let activeFilter = "all";
let currentView = "video";
let columnCount = 0;
let lastDialogTrigger;
const dialogFocusTargets=new WeakMap();
const icon = name => `<svg aria-hidden="true"><use href="#${name}"/></svg>`;

function filteredClips() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  return clips.filter(clip => (activeFilter === "all" || clip.tags.includes(activeFilter)) &&
    (!query || [clip.name,clip.summary,...clip.tags].join(" ").toLocaleLowerCase().includes(query)));
}

function renderClips() {
  const filtered = filteredClips();
  const columns = window.matchMedia("(max-width:540px)").matches ? 2 : 4;
  columnCount = columns;
  grid.replaceChildren();
  const buckets = Array.from({length:columns},()=>{const column=document.createElement("div");column.className="clip-column";grid.append(column);return column;});
  filtered.forEach((clip,index)=>{
    const button=document.createElement("button");
    button.type="button";button.className="clip-card";button.setAttribute("aria-label",`查看 ${clip.name} 的素材详情`);
    button.innerHTML=`<div class="clip-thumb" style="--clip-height:${clip.height}px"><img src="assets/clip-${String(clip.id).padStart(2,"0")}.jpg" alt="${clip.tags.slice(0,2).join("，")}示例画面" width="600" height="400" ${index>3?'loading="lazy"':''}><span class="clip-duration">${clip.duration}</span><span class="clip-hover-play">${icon("arrow-up")}</span></div><div class="clip-info"><span class="clip-name">${clip.name}</span><div class="clip-tags">${clip.tags.slice(0,3).map(tag=>`<span>${tag}</span>`).join("")}<span class="clip-tag-extra">+1</span></div></div>`;
    button.addEventListener("click",()=>showClip(clip,button));
    buckets[index%columns].append(button);
  });
  $("#empty-state").hidden=filtered.length>0;
  $("#result-count").textContent=`${filtered.length} 段素材${activeFilter!=="all"?` · ${activeFilter}`:""}`;
}

function setFilter(value) {
  activeFilter=value;
  document.querySelectorAll(".filter").forEach(button=>{const active=button.dataset.filter===value;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));});
  renderClips();
}

function switchView(view) {
  currentView=view;
  for(const name of ["video","tag"]){const active=name===view;const tab=$(`#${name}-tab`);tab.setAttribute("aria-selected",String(active));tab.tabIndex=active?0:-1;$(`#${name}-panel`).hidden=!active;}
  searchInput.placeholder=view==="tag"?"搜索标签":"搜索视频、标签或画面描述";
  searchInput.setAttribute("aria-label",view==="tag"?"搜索演示标签":"搜索演示视频");
  $(".filter-list").style.visibility=view==="tag"?"hidden":"visible";
  if(view==="tag")renderMosaic();else renderClips();
}

function renderMosaic() {
  const mosaic=$("#demo-mosaic");
  const counts=new Map();
  clips.forEach(clip=>clip.tags.forEach(tag=>counts.set(tag,(counts.get(tag)||0)+1)));
  const query=searchInput.value.trim().toLocaleLowerCase();
  const entries=[...counts].map(([tag,n])=>({tag,n})).sort((a,b)=>b.n-a.n).filter(({tag})=>tag.toLocaleLowerCase().includes(query));
  mosaic.replaceChildren();
  if(!entries.length){mosaic.style.height="320px";const message=document.createElement("p");message.className="empty-state";message.textContent="还没有匹配的标签，试试“山川”或“旅行”。";mosaic.append(message);$("#result-count").textContent="0 个匹配标签";return;}
  const width=mosaic.clientWidth;
  if(!width)return;
  const layout=layoutTagMosaic(width,entries);
  mosaic.style.height=`${layout.height}px`;
  if(layout.wide){const stats=document.createElement("div");stats.className="mosaic-stats";stats.innerHTML=`<span>画面里的线索</span><strong>${entries.length}</strong><span>点击标签，再次遇见素材</span>`;mosaic.append(stats);const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.classList.add("mosaic-contours");svg.setAttribute("viewBox",`0 0 ${width} ${layout.height}`);const path=document.createElementNS("http://www.w3.org/2000/svg","path");path.setAttribute("d",layout.contours);svg.append(path);mosaic.append(svg);}
  const colors=["#59634f","#5d6254","#73745f","#484f40","#6d705e","#83836d","#525d46","#656957","#464f3e","#7c7e66","#5e6952","#6d7360"];
  layout.tiles.forEach((tile,index)=>{const entry=entries[index];if(!entry)return;const button=document.createElement("button");button.type="button";button.className="mosaic-tile";button.style.cssText=`left:${tile.left}px;top:${tile.top}px;width:${tile.width}px;height:${tile.height}px;clip-path:path('${tile.path}');`;button.setAttribute("aria-label",`查看标签 ${entry.tag}，${entry.n} 段素材`);button.innerHTML=`<svg viewBox="0 0 ${tile.width} ${tile.height}" aria-hidden="true"><path d="${tile.path}" fill="${colors[index%colors.length]}"/></svg><span style="left:${tile.label.x}px;top:${tile.label.y}px;width:${tile.label.width}px;font-size:${Math.min(18,tile.label.nameSize)}px">${entry.tag}<small>${entry.n} 段素材</small></span>`;button.addEventListener("click",()=>{searchInput.value="";setFilter(entry.tag);switchView("video");searchInput.focus({preventScroll:true});});mosaic.append(button);});
  $("#result-count").textContent=`${entries.length} 个标签 · 示例素材库`;
}

function showDialog(dialog,trigger) {
  lastDialogTrigger=trigger||document.activeElement;
  dialog.showModal();
}

function showClip(clip,trigger) {
  $("#detail-image").src=`assets/clip-${String(clip.id).padStart(2,"0")}.jpg`;
  $("#detail-image").alt=clip.tags.join("，");
  $("#clip-title").textContent=clip.name;
  $("#detail-meta").textContent=`${clip.size}  /  ${clip.duration}  /  ${clip.name.split(".").pop().toUpperCase()}`;
  $("#detail-summary").textContent=clip.summary;
  $("#detail-tags").replaceChildren();
  clip.tags.forEach(tag=>{const button=document.createElement("button");button.type="button";button.textContent=tag;button.addEventListener("click",()=>{dialogFocusTargets.set($("#clip-dialog"),searchInput);$("#clip-dialog").close();searchInput.value="";setFilter(tag);switchView("video");$("#demo").scrollIntoView({behavior:"smooth"});});$("#detail-tags").append(button);});
  showDialog($("#clip-dialog"),trigger);
}

document.querySelectorAll(".filter").forEach(button=>button.addEventListener("click",()=>setFilter(button.dataset.filter)));
searchInput.addEventListener("input",()=>{if(currentView==="tag")renderMosaic();else renderClips();});
$("#reset-search").addEventListener("click",()=>{searchInput.value="";setFilter("all");searchInput.focus();});
for(const name of ["video","tag"]){$(`#${name}-tab`).addEventListener("click",()=>switchView(name));$(`#${name}-tab`).addEventListener("keydown",event=>{if(["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){event.preventDefault();const next=event.key==="Home"?"video":event.key==="End"?"tag":name==="video"?"tag":"video";switchView(next);$(`#${next}-tab`).focus();}});}
document.addEventListener("keydown",event=>{if(event.key==="/"&&!document.querySelector("dialog[open]")&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){event.preventDefault();$("#demo").scrollIntoView({behavior:"smooth"});searchInput.focus({preventScroll:true});}});
document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>showDialog($(`#${button.dataset.open}-dialog`),button)));
document.querySelectorAll("dialog").forEach(dialog=>{dialog.querySelector(".dialog-close").addEventListener("click",()=>dialog.close());dialog.addEventListener("click",event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});dialog.addEventListener("close",()=>{const target=dialogFocusTargets.get(dialog)||lastDialogTrigger;dialogFocusTargets.delete(dialog);if(target?.isConnected)target.focus({preventScroll:true});});});
$("#start-demo").addEventListener("click",()=>{dialogFocusTargets.set($("#release-dialog"),searchInput);$("#release-dialog").close();$("#demo").scrollIntoView({behavior:"smooth"});});
const menuButton=$(".menu-toggle");
menuButton.addEventListener("click",()=>{const expanded=menuButton.getAttribute("aria-expanded")!=="true";menuButton.setAttribute("aria-expanded",String(expanded));menuButton.setAttribute("aria-label",expanded?"收起导航":"展开导航");$("#mobile-nav").hidden=!expanded;});
$("#mobile-nav").addEventListener("click",event=>{if(event.target.closest("a,button")){menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","展开导航");$("#mobile-nav").hidden=true;}});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&menuButton.getAttribute("aria-expanded")==="true"){menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","展开导航");$("#mobile-nav").hidden=true;menuButton.focus();}});
$("#year").textContent=new Date().getFullYear();
let resizeTimer;
window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(currentView==="tag")renderMosaic();else if((window.matchMedia("(max-width:540px)").matches?2:4)!==columnCount)renderClips();},100);});
fetch("assets/credits.json").then(response=>response.ok?response.json():[]).then(photos=>{photos.forEach(photo=>{const a=document.createElement("a");a.href=photo.source;a.target="_blank";a.rel="noopener noreferrer";a.textContent=`${photo.title} · ${photo.author}`;$("#photo-credits").append(a);});}).catch(()=>{$("#photo-credits").textContent="摄影作品来自 Unsplash。";});
renderClips();
