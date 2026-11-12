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
const scrollToDemo = () => $("#demo").scrollIntoView({behavior:"smooth"});

function filteredClips() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  return clips.filter(clip => (activeFilter === "all" || clip.tags.includes(activeFilter)) &&
    (!query || [clip.name,clip.summary,...clip.tags].join(" ").toLocaleLowerCase().includes(query)));
}

function renderClips() {
  const filtered = filteredClips();
  const columns = window.matchMedia("(max-width:600px)").matches ? 2 : 4;
  columnCount = columns;
  grid.replaceChildren();
  const buckets = Array.from({length:columns},()=>{const column=document.createElement("div");column.className="clip-column";grid.append(column);return column;});
  filtered.forEach((clip,index)=>{
    const button=document.createElement("button");
    button.type="button";button.className="clip-card";button.setAttribute("aria-label",`查看 ${clip.name} 的素材详情`);
    button.innerHTML=`<div class="clip-thumb" style="--clip-height:${clip.height}px"><img src="assets/clip-${String(clip.id).padStart(2,"0")}.jpg" alt="${clip.tags.slice(0,2).join("，")}示例画面" width="600" height="400" ${index>3?'loading="lazy"':''}><span class="clip-duration">${clip.duration}</span><span class="clip-hover-play">${icon("arrow-up")}</span></div><div class="clip-info"><span class="clip-name">${clip.name}</span><div class="clip-tags">${clip.tags.slice(0,columns===2?1:2).map(tag=>`<span>${tag}</span>`).join("")}<span class="clip-tag-extra">+${clip.tags.length-(columns===2?1:2)}</span></div></div>`;
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
  const changed=currentView!==view;
  currentView=view;
  for(const name of ["video","tag"]){const active=name===view;const tab=$(`#${name}-tab`);tab.setAttribute("aria-selected",String(active));tab.tabIndex=active?0:-1;$(`#${name}-panel`).hidden=!active;}
  updateSearchPlaceholder();
  searchInput.setAttribute("aria-label",view==="tag"?"搜索演示标签":"搜索演示视频");
  $(".filter-list").hidden=view==="tag";
  $("#tag-view-heading").hidden=view!=="tag";
  if(view==="tag")renderMosaic();else renderClips();
  if(changed){
    const panel=$(`#${view}-panel`);
    panel.scrollTop=0;
    panel.classList.remove("view-enter");
    requestAnimationFrame(()=>{if(currentView===view)panel.classList.add("view-enter");});
  }
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
  const colors=["#4d626d","#52636c","#65808c","#46565f","#607781","#788b94","#4d6878","#5c7481","#435963","#79919b","#526c78","#6a818a"];
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
  clip.tags.forEach(tag=>{const button=document.createElement("button");button.type="button";button.textContent=tag;button.addEventListener("click",()=>{dialogFocusTargets.set($("#clip-dialog"),searchInput);$("#clip-dialog").close();searchInput.value="";setFilter(tag);switchView("video");scrollToDemo();});$("#detail-tags").append(button);});
  showDialog($("#clip-dialog"),trigger);
}

document.querySelectorAll(".filter").forEach(button=>button.addEventListener("click",()=>setFilter(button.dataset.filter)));
searchInput.addEventListener("input",()=>{if(currentView==="tag")renderMosaic();else renderClips();});
$("#reset-search").addEventListener("click",()=>{searchInput.value="";setFilter("all");searchInput.focus();});
for(const name of ["video","tag"]){$(`#${name}-tab`).addEventListener("click",()=>switchView(name));$(`#${name}-tab`).addEventListener("keydown",event=>{if(["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){event.preventDefault();const next=event.key==="Home"?"video":event.key==="End"?"tag":name==="video"?"tag":"video";switchView(next);$(`#${next}-tab`).focus();}});}
document.addEventListener("keydown",event=>{if(event.key==="/"&&!document.querySelector("dialog[open]")&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){event.preventDefault();scrollToDemo();searchInput.focus({preventScroll:true});}});
document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>showDialog($(`#${button.dataset.open}-dialog`),button)));
document.querySelectorAll("dialog").forEach(dialog=>{dialog.querySelector(".dialog-close").addEventListener("click",()=>dialog.close());dialog.addEventListener("click",event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});dialog.addEventListener("close",()=>{const target=dialogFocusTargets.get(dialog)||lastDialogTrigger;dialogFocusTargets.delete(dialog);if(target?.isConnected)target.focus({preventScroll:true});});});
const menuButton=$(".menu-toggle");
menuButton.addEventListener("click",()=>{const expanded=menuButton.getAttribute("aria-expanded")!=="true";menuButton.setAttribute("aria-expanded",String(expanded));menuButton.setAttribute("aria-label",expanded?"收起导航":"展开导航");$("#mobile-nav").hidden=!expanded;});
$("#mobile-nav").addEventListener("click",event=>{if(event.target.closest("a,button")){menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","展开导航");$("#mobile-nav").hidden=true;}});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&menuButton.getAttribute("aria-expanded")==="true"){menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","展开导航");$("#mobile-nav").hidden=true;menuButton.focus();}});
$("#year").textContent=new Date().getFullYear();
let resizeTimer;
window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{updateSearchPlaceholder();if(currentView==="tag")renderMosaic();else if((window.matchMedia("(max-width:600px)").matches?2:4)!==columnCount)renderClips();},100);});
renderClips();

// The same rounded polygon vocabulary as ClipDen's tag map, now used in the page itself.
const heroPieces = [
  {title:"让收藏，\n重新发生。", subtitle:"YOUR NEXT FRAME", tone:"ink", filter:"all", icon:"spark"},
  {title:"城市建筑", subtitle:"AFTER HOURS", image:2, filter:"城市建筑"},
  {title:"山川", subtitle:"A LITTLE FURTHER", tone:"lilac", filter:"山川", icon:"arrow-up"},
  {title:"旅途记录", subtitle:"ON THE ROAD", image:8, filter:"旅途记录"},
  {title:"建筑", subtitle:"LINES & SHAPES", image:4, filter:"建筑"},
  {title:"光影", subtitle:"FOLLOW THE LIGHT", tone:"peach", filter:"光影", icon:"spark"},
  {title:"自然风光", subtitle:"ROOM TO BREATHE", image:3, filter:"自然风光"},
  {title:"海岸", subtitle:"A QUIETER MOMENT", image:6, filter:"海岸"}
];

function renderHeroMosaic() {
  const board=$("#hero-mosaic");
  const width=board.clientWidth;
  const height=board.clientHeight;
  if(!width||!height)return;
  const small=window.matchMedia("(max-width:600px)").matches;
  const positions=small
    ? [[.22,.08],[.73,.12],[.25,.34],[.83,.35],[.13,.61],[.62,.58],[.30,.87],[.85,.85]]
    : [[.12,.15],[.40,.16],[.68,.11],[.90,.27],[.09,.72],[.35,.73],[.61,.65],[.88,.83]];
  const sites=positions.map(([x,y],index)=>({x:x*width,y:y*height,weight:index===0?width*height*.009:0}));
  const frame=[{x:0,y:0},{x:width,y:0},{x:width,y:height},{x:0,y:height}];
  board.replaceChildren();
  sites.forEach((site,index)=>{
    let polygon=frame;
    for(const neighbor of sites)if(neighbor!==site)polygon=clipMosaicCell(polygon,site,neighbor);
    const tile=mosaicTile(polygon,index);
    const piece=heroPieces[index];
    const button=document.createElement("button");
    button.type="button";
    button.className=`hero-piece ${piece.image?"has-photo":`tile-${piece.tone}`}`;
    button.style.cssText=`left:${tile.left}px;top:${tile.top}px;width:${tile.width}px;height:${tile.height}px;clip-path:path('${tile.path}');`;
    button.setAttribute("aria-label",`探索${piece.filter==="all"?"全部":piece.filter}素材演示`);
    if(piece.image){
      const img=document.createElement("img");
      img.src=`assets/clip-${String(piece.image).padStart(2,"0")}.jpg`;
      img.alt="";
      img.width=600;img.height=400;
      img.decoding="async";
      button.append(img);
    }
    const label=document.createElement("span");
    label.className="hero-piece-label";
    label.style.cssText=`left:${tile.label.x}px;top:${tile.label.y}px;width:${Math.max(tile.label.width,90)}px;`;
    if(piece.icon)label.innerHTML=icon(piece.icon);
    const title=document.createElement("strong");title.textContent=piece.title;
    const subtitle=document.createElement("small");subtitle.textContent=piece.subtitle;
    label.append(title,subtitle);
    button.append(label);
    button.addEventListener("click",()=>{searchInput.value="";setFilter(piece.filter);switchView("video");scrollToDemo();searchInput.focus({preventScroll:true});});
    board.append(button);
  });
}

function clipPanel(selector,points,radius=28) {
  const element=$(selector);
  if(!element)return;
  const polygon=points.map(([x,y])=>({x:x*element.clientWidth,y:y*element.clientHeight}));
  element.style.clipPath=`path('${mosaicPath(polygon,radius)}')`;
}

// Offset shared polygon edges by the same amount to create even, non-overlapping seams.
function insetFeaturePolygon(polygon,distance) {
  let result=polygon;
  for(let i=0;i<polygon.length;i++) {
    const a=polygon[i],b=polygon[(i+1)%polygon.length];
    const dx=b.x-a.x,dy=b.y-a.y;
    const signed=p=>dx*(p.y-a.y)-dy*(p.x-a.x)-distance*Math.hypot(dx,dy);
    const clipped=[];
    let previous=result.at(-1),previousDistance=signed(previous);
    for(const point of result) {
      const pointDistance=signed(point);
      if((pointDistance>=0)!==(previousDistance>=0)) {
        const t=previousDistance/(previousDistance-pointDistance);
        clipped.push({x:previous.x+(point.x-previous.x)*t,y:previous.y+(point.y-previous.y)*t});
      }
      if(pointDistance>=0)clipped.push(point);
      previous=point;previousDistance=pointDistance;
    }
    result=clipped;
  }
  return result;
}

function renderFeatureBoard() {
  const board=$(".feature-board");
  const width=board.clientWidth,height=board.clientHeight;
  if(!width||!height)return;
  const stacked=window.matchMedia("(max-width:800px)").matches;
  // Every piece uses the same junctions, so changing the canvas cannot separate their edges.
  const shapes=stacked?[
    [[0,0],[1,0],[1,.36],[0,.39]],
    [[0,.39],[1,.36],[1,.69],[0,.65]],
    [[0,.65],[1,.69],[1,1],[0,1]]
  ]:[
    [[0,0],[.47,0],[.54,.5],[.42,1],[0,1]],
    [[.47,0],[1,0],[1,.41],[.54,.5]],
    [[.54,.5],[1,.41],[1,1],[.42,1]]
  ];
  board.style.setProperty("--feature-safe-width",`${Math.round(width*.42-72)}px`);
  for(const [index,card] of [...board.querySelectorAll(".feature-card")].entries()) {
    const polygon=insetFeaturePolygon(shapes[index].map(([x,y])=>({x:x*width,y:y*height})),4);
    const left=Math.floor(Math.min(...polygon.map(p=>p.x)));
    const top=Math.floor(Math.min(...polygon.map(p=>p.y)));
    const right=Math.ceil(Math.max(...polygon.map(p=>p.x)));
    const bottom=Math.ceil(Math.max(...polygon.map(p=>p.y)));
    card.style.left=`${left}px`;card.style.top=`${top}px`;
    card.style.width=`${right-left}px`;card.style.height=`${bottom-top}px`;
    card.style.clipPath=`path('${mosaicPath(polygon,stacked?26:32,left,top)}')`;
    card.style.setProperty("--feature-content-left",stacked?"26px":index===0?"36px":`${Math.round(width*(index===1?.09:.14))}px`);
  }

}

function renderPageShapes() {
  const small=window.matchMedia("(max-width:600px)").matches;
  renderFeatureBoard();
  renderLocalConnection();
  updateIllustrationType();
  clipPanel(".closing-icon",small?[[0,0],[1,0],[.91,1],[0,.92]]:[[0,0],[1,0],[.85,1],[0,1]]);
  clipPanel(".closing-copy",small?[[0,0],[1,.07],[1,1],[0,1]]:[[.08,0],[1,0],[.92,1],[0,1]]);
  clipPanel(".closing-decoration",small?[[.13,0],[1,0],[1,1],[0,.87]]:[[.17,0],[1,0],[1,1],[0,1]]);
}

function renderLocalConnection() {
  const diagram=$(".local-system"),svg=diagram.querySelector(".local-connection");
  const origin=diagram.getBoundingClientRect();
  const folder=diagram.querySelector(".folder-front").getBoundingClientRect();
  const model=diagram.querySelector(".model-node").getBoundingClientRect();
  const start={x:folder.right-origin.left,y:folder.top+folder.height/2-origin.top};
  const end={x:model.left-origin.left,y:model.top+model.height/2-origin.top};
  const middle=(start.x+end.x)/2;
  svg.setAttribute("viewBox",`0 0 ${origin.width} ${origin.height}`);
  svg.querySelector("path").setAttribute("d",`M ${start.x} ${start.y} C ${middle} ${start.y} ${middle} ${end.y} ${end.x} ${end.y}`);
  for(const [selector,point] of [[".connection-start",start],[".connection-end",end]]){
    svg.querySelector(selector).setAttribute("cx",point.x);
    svg.querySelector(selector).setAttribute("cy",point.y);
  }
}

let shapeFrame;
const shapeObserver=new ResizeObserver(()=>{cancelAnimationFrame(shapeFrame);shapeFrame=requestAnimationFrame(()=>{renderHeroMosaic();renderPageShapes();});});
shapeObserver.observe($("#hero-mosaic"));
shapeObserver.observe($(".feature-board"));
document.querySelectorAll(".closing-tile").forEach(element=>shapeObserver.observe(element));
renderHeroMosaic();
renderPageShapes();

function updateSearchPlaceholder() {
  searchInput.placeholder=currentView==="tag"?"搜索标签":window.matchMedia("(max-width:600px)").matches?"搜索素材":"搜索视频、标签或画面描述";
}

// SVG coordinates shrink with the diagrams, so retain a readable physical size.
function updateIllustrationType() {
  document.querySelectorAll(".process-illustration").forEach(svg=>{
    const rect=svg.getBoundingClientRect();
    const scale=Math.min(rect.width/svg.viewBox.baseVal.width,rect.height/svg.viewBox.baseVal.height);
    if(!scale)return;
    svg.querySelectorAll("text").forEach(text=>{
      const minimum=/[\u3400-\u9fff]/u.test(text.textContent)?12:10;
      text.setAttribute("font-size",String(Math.ceil(minimum/scale)));
    });
  });
}
document.querySelectorAll(".process-illustration").forEach(element=>shapeObserver.observe(element));
updateSearchPlaceholder();

function setupPageMotion() {
  const targets=[...document.querySelectorAll(".hero h1,.hero-description,.hero-actions,.platform-note,.hero-art,.section-heading,.app-window,.feature-board,.steps article,.faq-intro,.faq-list details,.closing,.site-footer")];
  targets.forEach(element=>{
    element.dataset.reveal="";
    const siblings=[...element.parentElement.children].filter(sibling=>sibling.matches(".steps article,.faq-list details"));
    const index=siblings.indexOf(element);
    if(index>0)element.style.setProperty("--reveal-delay",`${Math.min(index*55,220)}ms`);
  });
  const reveal="IntersectionObserver" in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");reveal.unobserve(entry.target);}});
  },{threshold:.08,rootMargin:"0px 0px -28px 0px"}):null;
  document.addEventListener("focusin",event=>event.target.closest("[data-reveal]")?.classList.add("is-visible"));
  const scenes=[...document.querySelectorAll(".hero-art,.feature-board")];
  const animatedScenes=[...document.querySelectorAll(".hero-art,.feature-board,.app-window")];
  if("IntersectionObserver" in window){
    const sceneObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle("scene-active",entry.isIntersecting)),{rootMargin:"40px"});
    animatedScenes.forEach(element=>sceneObserver.observe(element));
  }else animatedScenes.forEach(element=>element.classList.add("scene-active"));
  let frame;
  const update=()=>{
    frame=undefined;
    scenes.forEach(element=>{
      const rect=element.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight)return;
      const progress=Math.max(-1,Math.min(1,(innerHeight/2-(rect.top+rect.height/2))/(innerHeight/2+rect.height/2)));
      element.style.setProperty("--scene-y",`${(progress*8).toFixed(2)}px`);
    });
  };
  window.addEventListener("scroll",()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  document.documentElement.classList.add("motion-allowed");
  document.documentElement.classList.toggle("motion-ready",!!reveal);
  targets.forEach(element=>{
    if(reveal)reveal.observe(element);
    else element.classList.add("is-visible");
  });
  const stopInvitation=()=>$(".app-window").classList.add("demo-used");
  $(".app-tabs").addEventListener("pointerdown",stopInvitation,{once:true});
  $(".app-tabs").addEventListener("keydown",stopInvitation,{once:true});
  document.querySelectorAll("[role=tabpanel]").forEach(panel=>{
    panel.addEventListener("animationend",event=>{if(event.target===panel)panel.classList.remove("view-enter");});
  });
  update();
}
setupPageMotion();
