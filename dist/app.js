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
const english = document.documentElement.lang === "en";
const localize = (chinese, translated) => english ? translated : chinese;
const englishTags = {
  自然风光: "Nature", 城市建筑: "City", 旅途记录: "Travel log",
  山川: "Mountains", 森林: "Forest", 宁静: "Calm", 夜景: "Night",
  光影: "Light", 日常: "Daily life", 沙丘: "Dunes", 远景: "Wide shot",
  建筑: "Architecture", 线条: "Lines", 海岸: "Coast", 旅行: "Travel",
  绿色: "Green", 日出: "Sunrise"
};
const englishClipCopy = [
  ["Stillness in the Mountains.mp4", "Mist drifts over forested slopes, softening the greens into layers. A quiet landscape for nature stories, transitions, and mood references."],
  ["Tokyo After the Rain.mov", "Neon signs reflect off rain-soaked Tokyo streets. Use the clip for city stories, night scenes, or color references."],
  ["Wind Across the Dunes.mp4", "Dark dunes roll under a hazy sky. Gentle slopes and shifting shadows create a minimal landscape."],
  ["Light on Concrete.mp4", "Light and water highlight the geometry of a concrete building and its ramp. Useful for architecture and composition references."],
  ["Along the Coast.mov", "A road winds along green coastal cliffs. The open sea makes it a natural fit for road-trip stories and travel transitions."],
  ["Rhythm of the Waves.mp4", "White foam curls through turquoise waves, creating a textured surface for ocean stories and natural transitions."],
  ["Wide Open Country.mp4", "Open terrain stretches towards the sky. Use this wide shot for outdoor stories, travel openings, or establishing a sense of scale."],
  ["Pause at Sunrise.mov", "Sunrise lights a ridge as a lone hiker crosses it, giving scale to the landscape. Useful for outdoor travel and exploration stories."]
];
const tagLabel = tag => english ? englishTags[tag] : tag;
const clipName = clip => english ? englishClipCopy[clip.id - 1][0] : clip.name;
const clipSummary = clip => english ? englishClipCopy[clip.id - 1][1] : clip.summary;
const clipCount = count => english ? `${count} ${count === 1 ? "clip" : "clips"}` : `${count} 段素材`;
const thumbnail = id => `${english ? "../" : ""}assets/clip-${String(id).padStart(2, "0")}.jpg`;
const grid = $("#clip-grid");
const searchInput = $("#demo-search");
let activeFilter = "all";
let currentView = "video";
let columnCount = 0;
let lastDialogTrigger;
const dialogFocusTargets=new WeakMap();
const icon = name => `<svg aria-hidden="true"><use href="#${name}"/></svg>`;
const scrollToDemo = () => $("#demo").scrollIntoView({behavior:"smooth"});
const tagVisuals = {
  自然风光:{image:1}, 城市建筑:{image:4}, 旅途记录:{image:5}, 海岸:{image:6}, 建筑:{image:4}, 日出:{image:8},
  山川:{tone:"ice",symbol:"mountain"}, 光影:{tone:"cyan",symbol:"spark"}, 旅行:{tone:"ink",symbol:"arrow-up"},
  宁静:{tone:"ink",symbol:"moon"}, 远景:{image:3}, 森林:{tone:"cyan",symbol:"leaf"},
  夜景:{tone:"ice",symbol:"moon"}, 日常:{tone:"ink",symbol:"play"}, 沙丘:{tone:"ice",symbol:"mountain"},
  线条:{tone:"ink",symbol:"tag-icon"}, 绿色:{tone:"cyan",symbol:"leaf"}
};

function filteredClips() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  return clips.filter(clip => (activeFilter === "all" || clip.tags.includes(activeFilter)) &&
    (!query || [clipName(clip), clipSummary(clip), ...clip.tags.map(tagLabel)].join(" ").toLocaleLowerCase().includes(query)));
}

function renderClips() {
  const filtered = filteredClips();
  const columns = window.matchMedia("(max-width:600px)").matches ? 2 : 4;
  columnCount = columns;
  grid.replaceChildren();
  const buckets = Array.from({length:columns},()=>{const column=document.createElement("div");column.className="clip-column";grid.append(column);return column;});
  filtered.forEach((clip,index)=>{
    const button=document.createElement("button");
    const name = clipName(clip);
    const tags = clip.tags.map(tagLabel);
    const alt = localize(`${tags.slice(0, 2).join("，")}示例画面`, `Sample footage: ${tags.slice(0, 2).join(", ")}`);
    const shownTags = columns === 2 ? 1 : 2;
    button.type="button";button.className="clip-card";button.setAttribute("aria-label",localize(`查看 ${name} 的素材详情`, `View details for ${name}`));
    button.innerHTML=`<div class="clip-thumb" style="--clip-height:${clip.height}px"><img src="${thumbnail(clip.id)}" alt="${alt}" width="600" height="400" ${index>3?'loading="lazy"':''}><span class="clip-duration">${clip.duration}</span><span class="clip-hover-play">${icon("arrow-up")}</span></div><div class="clip-info"><span class="clip-name">${name}</span><div class="clip-tags">${tags.slice(0,shownTags).map(tag=>`<span>${tag}</span>`).join("")}<span class="clip-tag-extra">+${tags.length-shownTags}</span></div></div>`;
    button.addEventListener("click",()=>showClip(clip,button));
    buckets[index%columns].append(button);
  });
  $("#empty-state").hidden=filtered.length>0;
  $("#result-count").textContent=`${clipCount(filtered.length)}${activeFilter!=="all"?` · ${tagLabel(activeFilter)}`:""}`;
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
  searchInput.setAttribute("aria-label", view === "tag" ? localize("搜索演示标签", "Search demo tags") : localize("搜索演示视频", "Search demo videos"));
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
  const entries=[...counts].map(([tag,n])=>({tag,n})).sort((a,b)=>b.n-a.n).filter(({tag})=>tagLabel(tag).toLocaleLowerCase().includes(query));
  mosaic.replaceChildren();
  if (!entries.length) {
    mosaic.style.height = "320px";
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = localize("还没有匹配的标签，试试“山川”或“旅行”。", "No tags match. Try “mountains” or “travel”.");
    mosaic.append(message);
    $("#result-count").textContent = localize("0 个匹配标签", "0 matching tags");
    return;
  }
  const width=mosaic.clientWidth;
  if(!width)return;
  const layout=layoutShowcaseTags(width,entries.length);
  mosaic.style.height=`${layout.height}px`;
  layout.tiles.forEach((tile,index)=>{
    const entry=entries[index],visual=tagVisuals[entry.tag]||{tone:"ink",symbol:"tag-icon"};
    const title = tagLabel(entry.tag);
    const countLabel = clipCount(entry.n);
    const button=document.createElement("button");
    button.type="button";button.className=`mosaic-tile tag-piece ${visual.image?"has-photo":`tile-${visual.tone}`}`;
    button.style.cssText=`left:${tile.left}px;top:${tile.top}px;width:${tile.width}px;height:${tile.height}px;clip-path:path('${tile.path}');`;
    button.setAttribute("aria-label",localize(`查看标签 ${title}，${countLabel}`, `View ${countLabel} tagged ${title}`));
    if(visual.image){
      const img=document.createElement("img");
      img.src=thumbnail(visual.image);img.alt="";
      img.width=600;img.height=400;img.decoding="async";if(index>7)img.loading="lazy";
      button.append(img);
    }
    const label=document.createElement("span");label.className="mosaic-label";
    const { x, y, width, band, nameSize } = tile.label;
    const titleWidth = title.length * (english ? .62 : 1);
    const fontSize = Math.max(12, Math.min(nameSize, Math.floor(width / titleWidth)));
    const showSymbol = visual.symbol && band >= 34;
    label.style.cssText=`left:${x}px;top:${y}px;width:${width}px;font-size:${fontSize}px;`;
    if(showSymbol)label.innerHTML=`<span class="tile-symbol">${icon(visual.symbol)}</span>`;
    const name=document.createElement("strong");name.textContent=title;
    const count=document.createElement("small");count.textContent=countLabel;
    label.append(name,count);button.append(label);
    button.addEventListener("click",()=>{searchInput.value="";setFilter(entry.tag);switchView("video");searchInput.focus({preventScroll:true});});
    mosaic.append(button);
  });
  $("#result-count").textContent=localize(`${entries.length} 个标签 · 示例素材库`, `${entries.length} ${entries.length === 1 ? "tag" : "tags"} · Demo library`);
}

function showDialog(dialog,trigger) {
  lastDialogTrigger=trigger||document.activeElement;
  dialog.showModal();
}

function showClip(clip,trigger) {
  $("#detail-image").src=thumbnail(clip.id);
  $("#detail-image").alt=clip.tags.map(tagLabel).join(localize("，", ", "));
  $("#clip-title").textContent=clipName(clip);
  $("#detail-meta").textContent=`${clip.size}  /  ${clip.duration}  /  ${clip.name.split(".").pop().toUpperCase()}`;
  $("#detail-summary").textContent=clipSummary(clip);
  $("#detail-tags").replaceChildren();
  clip.tags.forEach(tag=>{const button=document.createElement("button");button.type="button";button.textContent=tagLabel(tag);button.addEventListener("click",()=>{dialogFocusTargets.set($("#clip-dialog"),searchInput);$("#clip-dialog").close();searchInput.value="";setFilter(tag);switchView("video");scrollToDemo();});$("#detail-tags").append(button);});
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
function setMobileMenu(expanded) {
  menuButton.setAttribute("aria-expanded", String(expanded));
  menuButton.setAttribute("aria-label", expanded ? localize("收起导航", "Close navigation") : localize("展开导航", "Open navigation"));
  $("#mobile-nav").hidden = !expanded;
}
menuButton.addEventListener("click", () => setMobileMenu(menuButton.getAttribute("aria-expanded") !== "true"));
$("#mobile-nav").addEventListener("click", event => {
  if (event.target.closest("a,button")) setMobileMenu(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMobileMenu(false);
    menuButton.focus();
  }
});
function setupStickyHeader() {
  const shell=$(".header-shell");
  let frame;
  const update=()=>{frame=undefined;shell.classList.toggle("is-scrolled",window.scrollY>24);};
  window.addEventListener("scroll",()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  window.addEventListener("pageshow",update);
  document.addEventListener("pointerdown",event=>{
    if(menuButton.getAttribute("aria-expanded")==="true"&&!shell.contains(event.target)){
      setMobileMenu(false);
    }
  });
  update();
}
setupStickyHeader();

// Native popovers escape the clipped closing tiles without moving the page layout.
function setupDownloadMenus() {
  const closeMenus=[];
  document.querySelectorAll(".download-choice").forEach(group=>{
    const trigger=group.querySelector(".download-button");
    const menu=group.querySelector(".download-menu");
    const links=[...menu.querySelectorAll("a")];
    let closeTimer,pinned=false;
    const isOpen=()=>menu.matches(":popover-open");
    const cancelClose=()=>clearTimeout(closeTimer);
    const close=()=>{cancelClose();if(isOpen())menu.hidePopover();};
    closeMenus.push(close);
    const position=()=>{
      const rect=trigger.getBoundingClientRect();
      const width=menu.offsetWidth,height=menu.offsetHeight,gap=10,gutter=12;
      const preferredLeft=group.classList.contains("header-downloads")?rect.right-width:rect.left+(rect.width-width)/2;
      const left=Math.max(gutter,Math.min(preferredLeft,document.documentElement.clientWidth-width-gutter));
      const below=rect.bottom+gap;
      const top=below+height>window.innerHeight-gutter&&rect.top>height+gap+gutter?rect.top-height-gap:below;
      menu.style.left=`${left}px`;
      menu.style.top=`${Math.max(gutter,Math.min(top,window.innerHeight-height-gutter))}px`;
    };
    const open=()=>{
      cancelClose();
      if(!isOpen())menu.showPopover({source:trigger});
      position();
    };
    const scheduleClose=event=>{
      if(event.pointerType!=="mouse")return;
      cancelClose();
      closeTimer=setTimeout(()=>{if(!menu.contains(document.activeElement))close();},180);
    };
    trigger.addEventListener("pointerenter",event=>{
      if(event.pointerType==="mouse"&&window.matchMedia("(hover:hover)").matches)open();
    });
    group.addEventListener("pointerleave",scheduleClose);
    menu.addEventListener("pointerenter",cancelClose);
    menu.addEventListener("pointerleave",scheduleClose);
    trigger.addEventListener("click",event=>{
      event.preventDefault();
      if(isOpen()&&pinned){close();return;}
      open();pinned=true;
      if(event.detail===0)links[0].focus();
    });
    trigger.addEventListener("keydown",event=>{
      if(!["ArrowDown","ArrowUp"].includes(event.key))return;
      event.preventDefault();open();pinned=true;
      links[event.key==="ArrowDown"?0:links.length-1].focus();
    });
    group.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&isOpen()){
        event.preventDefault();close();trigger.focus({preventScroll:true});
      }else if(menu.contains(event.target)&&["ArrowDown","ArrowUp","Home","End"].includes(event.key)){
        event.preventDefault();
        const index=links.indexOf(document.activeElement);
        const next=event.key==="Home"?0:event.key==="End"?links.length-1:(index+(event.key==="ArrowDown"?1:-1)+links.length)%links.length;
        links[next].focus();
      }
    });
    group.addEventListener("focusout",()=>queueMicrotask(()=>{if(!group.contains(document.activeElement))close();}));
    menu.addEventListener("click",event=>{if(event.target.closest("a"))close();});
    menu.addEventListener("beforetoggle",event=>{
      trigger.setAttribute("aria-expanded",String(event.newState==="open"));
      if(event.newState==="closed"){pinned=false;cancelClose();}
    });
  });
  const closeAll=()=>closeMenus.forEach(close=>close());
  window.addEventListener("resize",closeAll);
  window.addEventListener("scroll",closeAll,{capture:true,passive:true});
}
setupDownloadMenus();
$("#year").textContent=new Date().getFullYear();
let resizeTimer;
window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{updateSearchPlaceholder();if(currentView==="tag")renderMosaic();else if((window.matchMedia("(max-width:600px)").matches?2:4)!==columnCount)renderClips();},100);});
renderClips();

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
const shapeObserver=new ResizeObserver(()=>{cancelAnimationFrame(shapeFrame);shapeFrame=requestAnimationFrame(()=>{renderPageShapes();});});
shapeObserver.observe($(".feature-board"));
document.querySelectorAll(".closing-tile").forEach(element=>shapeObserver.observe(element));
renderPageShapes();

function updateSearchPlaceholder() {
  const compact = window.matchMedia("(max-width:600px)").matches;
  searchInput.placeholder = currentView === "tag" ? localize("搜索标签", "Search tags")
    : compact ? localize("搜索素材", "Search clips")
    : localize("搜索视频、标签或画面描述", "Search videos, tags, or scenes");
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
  const targets=[...document.querySelectorAll(".hero h1,.hero-description,.hero-actions,.section-heading,.app-window,.product-film,.feature-board,.steps article,.faq-intro,.faq-list details,.closing,.site-footer")];
  targets.forEach(element=>{
    element.dataset.reveal="";
    const siblings=[...element.parentElement.children].filter(sibling=>sibling.matches(".steps article,.faq-list details"));
    const index=siblings.indexOf(element);
    if(index>0)element.style.setProperty("--reveal-delay",`${Math.min(index*55,220)}ms`);
  });
  const reveal="IntersectionObserver" in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("is-visible");});
  },{threshold:.08,rootMargin:"0px 0px -28px 0px"}):null;
  // Reset only after the element leaves the viewport, leaving room for its 24px motion.
  const resetReveal=reveal?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(!entry.isIntersecting)entry.target.classList.remove("is-visible");});
  },{rootMargin:"48px 0px",threshold:0}):null;
  document.addEventListener("focusin",event=>event.target.closest("[data-reveal]")?.classList.add("is-visible"));
  const scenes=[...document.querySelectorAll(".hero-art,.feature-board")];
  const animatedScenes=[...document.querySelectorAll(".hero-backdrop,.hero-art,.feature-board,.app-window")];
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
    if(reveal){reveal.observe(element);resetReveal.observe(element);}
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

function setupProductVideo() {
  const video=$("#product-video");
  video.muted=true;
  let visible=false,pausedByUser=false;
  video.addEventListener("pause",()=>{if(visible)pausedByUser=true;});
  video.addEventListener("play",()=>{pausedByUser=false;});
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.12;
      if(visible){if(!pausedByUser)video.play().catch(()=>{});}
      else video.pause();
    },{threshold:[0,.12]});
    observer.observe(video);
  }else video.play().catch(()=>{});
}
setupProductVideo();
