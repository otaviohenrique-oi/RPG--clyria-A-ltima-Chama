/* ==========================================================================
   UI.JS — Funções de renderização de todas as telas.
   ========================================================================== */

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return document.querySelectorAll(sel); }

function showScreen(id){
  $all(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function showToast(msg){
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.getElementById("toast-container").appendChild(el);
  setTimeout(()=> el.remove(), 3200);
}

function showModal(innerHtml){
  document.getElementById("modal-box").innerHTML = innerHtml;
  document.getElementById("modal-overlay").classList.add("active");
}
function closeModal(){
  document.getElementById("modal-overlay").classList.remove("active");
}

function showLevelUp(text){
  document.getElementById("levelup-text").textContent = text;
  document.getElementById("levelup-overlay").classList.add("active");
}
function closeLevelUp(){
  document.getElementById("levelup-overlay").classList.remove("active");
}

function addEventLog(text, cls=""){
  const log = document.getElementById("event-log");
  const p = document.createElement("p");
  if(cls) p.className = cls;
  p.textContent = text;
  log.prepend(p);
  while(log.children.length > 40) log.removeChild(log.lastChild);
}

function rarityClass(rarity){ return "rarity-"+rarity; }
const RARITY_VAR = { comum:"--rarity-common", incomum:"--rarity-uncommon", raro:"--rarity-rare", epico:"--rarity-epic", lendario:"--rarity-legendary" };

/* ---------------- HUD ---------------- */
function renderHud(player){
  const s = getStats(player);
  document.getElementById("hud-portrait").textContent = CLASSES[player.classe].icon;
  document.getElementById("hud-name").textContent = player.name;
  document.getElementById("hud-level").textContent = player.level;
  document.getElementById("hud-gold").textContent = player.gold;

  setBar("hud-hp-fill","hud-hp-label", player.hp, s.maxHp);
  setBar("hud-mp-fill","hud-mp-label", player.mp, s.maxMp);
  setBar("hud-xp-fill","hud-xp-label", player.xp, player.xpToNext, " XP");
}
function setBar(fillId, labelId, val, max, suffix=""){
  const pct = max>0 ? Math.max(0,Math.min(100,(val/max)*100)) : 0;
  document.getElementById(fillId).style.width = pct+"%";
  document.getElementById(labelId).textContent = `${Math.max(0,Math.round(val))}/${Math.round(max)}${suffix}`;
}

/* ---------------- EXPLORAR ---------------- */
function renderExplore(player){
  const region = REGIONS[player.currentRegion];
  document.getElementById("region-name").textContent = `${region.icon} ${region.name}`;
  document.getElementById("region-desc").textContent = region.desc;
  renderNpcList(player);
}
function renderNpcList(player){
  const region = REGIONS[player.currentRegion];
  const wrap = document.getElementById("npc-list");
  wrap.innerHTML = "";
  region.npcs.forEach(npcId=>{
    const npc = NPCS[npcId];
    const card = document.createElement("div");
    card.className = "npc-card";
    const hasQuestFlag = (npc.quests||[]).some(qid=> !player.quests[qid] || isQuestComplete(player,qid));
    card.innerHTML = `<div class="npc-icon">${npc.icon}</div><div class="npc-name">${npc.name}</div>${hasQuestFlag?'<div class="npc-quest-flag">! missão</div>':''}`;
    card.onclick = ()=> openNpcModal(player, npcId);
    wrap.appendChild(card);
  });
}

/* ---------------- PERSONAGEM ---------------- */
function renderCharacter(player){
  const s = getStats(player);
  $all(".equip-slot").forEach(slotEl=>{
    const slot = slotEl.dataset.slot;
    const itemId = player.equipment[slot];
    slotEl.classList.toggle("filled", !!itemId);
    if(itemId){
      const it = ITEMS[itemId];
      slotEl.querySelector(".slot-icon").textContent = it.icon;
      slotEl.querySelector(".slot-name").textContent = it.name;
    } else {
      const defaults = { weapon:"⚔️", armor:"🛡️", helmet:"⛑️", accessory:"💍" };
      const labels = { weapon:"Arma", armor:"Armadura", helmet:"Capacete", accessory:"Acessório" };
      slotEl.querySelector(".slot-icon").textContent = defaults[slot];
      slotEl.querySelector(".slot-name").textContent = labels[slot];
    }
    slotEl.onclick = ()=>{
      if(player.equipment[slot]){
        unequipItem(player, slot);
        renderCharacter(player); renderInventory(player); renderHud(player);
        showToast("Item desequipado.");
      }
    };
  });

  const panel = document.getElementById("stats-panel");
  panel.innerHTML = `
    <div class="stat-row"><span class="stat-name">Classe</span><span class="stat-val">${CLASSES[player.classe].name}</span></div>
    <div class="stat-row"><span class="stat-name">Vida</span><span class="stat-val">${Math.round(player.hp)}/${s.maxHp}</span></div>
    <div class="stat-row"><span class="stat-name">Mana</span><span class="stat-val">${Math.round(player.mp)}/${s.maxMp}</span></div>
    <div class="stat-row"><span class="stat-name">Ataque</span><span class="stat-val">${s.atk}</span></div>
    <div class="stat-row"><span class="stat-name">Ataque Mágico</span><span class="stat-val">${s.matk}</span></div>
    <div class="stat-row"><span class="stat-name">Defesa</span><span class="stat-val">${s.def}</span></div>
    <div class="stat-row"><span class="stat-name">Defesa Mágica</span><span class="stat-val">${s.mdef}</span></div>
    <div class="stat-row"><span class="stat-name">Crítico</span><span class="stat-val">${Math.round(s.crit*100)}%</span></div>
    <div class="stat-row"><span class="stat-name">Esquiva</span><span class="stat-val">${Math.round(s.dodge*100)}%</span></div>
    <div class="stat-row"><span class="stat-name">Força</span><span class="stat-val">${Math.round(s.str)}</span></div>
    <div class="stat-row"><span class="stat-name">Inteligência</span><span class="stat-val">${Math.round(s.int)}</span></div>
    <div class="stat-row"><span class="stat-name">Agilidade</span><span class="stat-val">${Math.round(s.agi)}</span></div>
    <div class="stat-row"><span class="stat-name">Vitalidade</span><span class="stat-val">${Math.round(s.vit)}</span></div>
  `;

  const tree = document.getElementById("skill-tree");
  tree.innerHTML = "";
  Object.values(SKILLS).filter(sk=>sk.classe===player.classe).sort((a,b)=>a.unlockLevel-b.unlockLevel).forEach(sk=>{
    const unlocked = player.skills.includes(sk.id);
    const node = document.createElement("div");
    node.className = "skill-node " + (unlocked?"unlocked":"locked");
    node.innerHTML = `<div class="sk-icon">${sk.icon}</div><div class="sk-name">${sk.name}</div><div class="sk-lvl">Nv. ${sk.unlockLevel}</div>`;
    node.title = sk.description;
    tree.appendChild(node);
  });
}

/* ---------------- INVENTÁRIO ---------------- */
let currentInvFilter = "all";
function renderInventory(player){
  const filters = [
    {id:"all", label:"Tudo"}, {id:"weapon", label:"Armas"}, {id:"armor", label:"Armaduras"},
    {id:"helmet", label:"Capacetes"}, {id:"accessory", label:"Acessórios"},
    {id:"potion", label:"Poções"}, {id:"quest", label:"Missão"}
  ];
  const filterWrap = document.getElementById("inv-filters");
  filterWrap.innerHTML = "";
  filters.forEach(f=>{
    const btn = document.createElement("button");
    btn.className = "inv-filter-btn" + (currentInvFilter===f.id?" active":"");
    btn.textContent = f.label;
    btn.onclick = ()=>{ currentInvFilter = f.id; renderInventory(player); };
    filterWrap.appendChild(btn);
  });

  const grid = document.getElementById("inventory-grid");
  grid.innerHTML = "";
  const items = player.inventory.filter(inv=>{
    const it = ITEMS[inv.id];
    return currentInvFilter==="all" || it.type===currentInvFilter;
  });
  if(items.length===0){
    grid.innerHTML = `<div class="empty-msg">Nenhum item nesta categoria.</div>`;
    return;
  }
  items.forEach(inv=>{
    const it = ITEMS[inv.id];
    const slot = document.createElement("div");
    slot.className = `item-slot ${rarityClass(it.rarity)}`;
    slot.innerHTML = `<span class="item-icon">${it.icon}</span>${inv.qty>1?`<span class="item-qty">x${inv.qty}</span>`:""}`;
    slot.onclick = ()=> openItemModal(player, it.id);
    grid.appendChild(slot);
  });
}

function openItemModal(player, itemId){
  const it = ITEMS[itemId];
  const equipable = ["weapon","armor","helmet","accessory"].includes(it.type);
  const usable = it.type==="potion";
  let statsHtml = "";
  if(it.stats) statsHtml = Object.entries(it.stats).map(([k,v])=>`<div>${statLabel(k)}: +${v}</div>`).join("");
  showModal(`
    <span class="item-rarity-tag" style="background:var(${RARITY_VAR[it.rarity]});color:#111;">${RARITY_LABEL[it.rarity]}</span>
    <h3>${it.icon} ${it.name}</h3>
    <p>${it.description}</p>
    <div style="color:var(--gold-bright); font-size:13px;">${statsHtml}</div>
    <p style="color:var(--text-dim); font-size:13px;">Valor: ${it.value} 🪙</p>
    <div class="modal-actions">
      ${equipable?`<button class="btn-fantasy" id="modal-equip">Equipar</button>`:""}
      ${usable?`<button class="btn-fantasy" id="modal-use">Usar</button>`:""}
      ${it.value>0?`<button class="btn-fantasy" id="modal-sell">Vender (${Math.round(it.value/2)}🪙)</button>`:""}
      <button class="btn-fantasy btn-ghost" id="modal-close">Fechar</button>
    </div>
  `);
  document.getElementById("modal-close").onclick = closeModal;
  if(equipable){
    document.getElementById("modal-equip").onclick = ()=>{
      equipItem(player, itemId);
      closeModal(); renderInventory(player); renderCharacter(player); renderHud(player);
      showToast(`${it.name} equipado.`);
    };
  }
  if(usable){
    document.getElementById("modal-use").onclick = ()=>{
      useItemOutOfCombat(player, itemId);
      closeModal();
    };
  }
  if(it.value>0){
    const sellBtn = document.getElementById("modal-sell");
    if(sellBtn) sellBtn.onclick = ()=>{
      removeItem(player, itemId, 1);
      player.gold += Math.round(it.value/2);
      closeModal(); renderInventory(player); renderHud(player);
      showToast(`Vendido por ${Math.round(it.value/2)} 🪙.`);
    };
  }
}
function statLabel(k){
  const map = { atk:"Ataque", matk:"Atq. Mágico", def:"Defesa", mdef:"Def. Mágica", crit:"Crítico", agi:"Agilidade", vit:"Vitalidade", str:"Força", int:"Inteligência" };
  return map[k]||k;
}

/* ---------------- MISSÕES ---------------- */
let currentQuestTab = "active";
function renderQuests(player){
  $all(".quest-tab").forEach(t=> t.classList.toggle("active", t.dataset.qtab===currentQuestTab));
  const list = document.getElementById("quest-list");
  list.innerHTML = "";
  const entries = Object.entries(player.quests).filter(([qid,st])=>{
    return currentQuestTab==="active" ? st.status==="active" : st.status==="done";
  });
  if(entries.length===0){
    list.innerHTML = `<div class="empty-msg">Nenhuma missão aqui ainda.</div>`;
    return;
  }
  entries.forEach(([qid,state])=>{
    const q = QUESTS[qid];
    const div = document.createElement("div");
    div.className = "quest-item";
    const complete = isQuestComplete(player, qid);
    div.innerHTML = `
      <h4>${q.name} <span class="quest-tag ${q.type==='main'?'main':'side'}">${q.type==='main'?'Principal':'Secundária'}</span></h4>
      <p>${q.description}</p>
      <p style="color:var(--parchment-text); font-size:13px;">${state.status==='active'?questProgressLabel(q,state):'Concluída'}</p>
      <div class="quest-rewards">Recompensa: ${q.rewards.xp} XP, ${q.rewards.gold} 🪙${(q.rewards.items||[]).length?', '+q.rewards.items.map(i=>ITEMS[i].name).join(', '):''}</div>
      ${(state.status==='active' && complete) ? `<button class="btn-fantasy" style="margin-top:8px;" data-claim="${qid}">Entregar Missão</button>` : ""}
    `;
    list.appendChild(div);
  });
  $all("[data-claim]").forEach(btn=>{
    btn.onclick = ()=>{
      const qid = btn.dataset.claim;
      const result = completeQuest(player, qid);
      renderQuests(player); renderHud(player);
      showToast(`Missão concluída: ${QUESTS[qid].name}!`);
      if(result.levels.length>0) handleLevelUps(player, result.levels);
      refreshUnlockedRegions(player);
    };
  });
}

/* ---------------- MAPA ---------------- */
function renderMap(player){
  const wrap = document.getElementById("world-map");
  wrap.innerHTML = "";
  REGION_ORDER.forEach(rid=>{
    const r = REGIONS[rid];
    const unlocked = isRegionUnlocked(player, rid);
    const node = document.createElement("div");
    node.className = "map-node " + (rid===player.currentRegion?"current":"") + (unlocked?"":" locked");
    node.innerHTML = `<div class="map-icon">${r.icon}</div><div class="map-name">${r.name}</div><div class="map-lvl">Nv. sugerido ${r.minLevel}</div>`;
    if(unlocked){
      node.onclick = ()=>{
        player.currentRegion = rid;
        renderExplore(player);
        navigate("explore");
        showToast(`Viajou para ${r.name}.`);
      };
    }
    wrap.appendChild(node);
  });
}

/* ---------------- COMBATE ---------------- */
function renderCombatScreen(player){
  const enemy = combatState.enemy;
  const s = getStats(player);
  document.getElementById("enemy-name").textContent = `${enemy.icon} ${enemy.name}${enemy.isBoss?" 👑":""}`;
  document.getElementById("enemy-sprite").textContent = enemy.icon;
  setBar("enemy-hp-fill","enemy-hp-label", enemy.hp, enemy.maxHp);
  document.getElementById("enemy-status").innerHTML = statusIcons(enemy.statuses);

  document.getElementById("pc-name").textContent = player.name;
  document.getElementById("pc-sprite").textContent = CLASSES[player.classe].sprite;
  setBar("pc-hp-fill","pc-hp-label", player.hp, s.maxHp);
  setBar("pc-mp-fill","pc-mp-label", player.mp, s.maxMp);
  document.getElementById("pc-status").innerHTML = statusIcons(combatState.player.statuses);

  const log = document.getElementById("combat-log");
  log.innerHTML = combatState.log.map(l=>`<p class="${l.cls}">${l.text}</p>`).join("");
  log.scrollTop = log.scrollHeight;

  document.getElementById("combat-submenu").innerHTML = "";
  const disabled = combatState.turn !== "player" || combatState.ended;
  $all(".combat-btn").forEach(b=> b.disabled = disabled);
}
function statusIcons(statuses){
  const map = { poison:"🟢", burn:"🔥", stun:"💫" };
  return statuses.map(s=>`<span title="${s.type}">${map[s.type]||"❔"}</span>`).join("");
}
function appendCombatLogOnly(){
  const log = document.getElementById("combat-log");
  log.innerHTML = combatState.log.map(l=>`<p class="${l.cls}">${l.text}</p>`).join("");
  log.scrollTop = log.scrollHeight;
}

function showSkillMenu(player){
  const wrap = document.getElementById("combat-submenu");
  wrap.innerHTML = "";
  player.skills.forEach(skId=>{
    const sk = SKILLS[skId];
    const btn = document.createElement("button");
    btn.className = "submenu-btn";
    btn.disabled = player.mp < sk.manaCost;
    btn.innerHTML = `${sk.icon} ${sk.name} <small>Mana: ${sk.manaCost} — ${sk.description}</small>`;
    btn.onclick = ()=> onSkillChosen(skId);
    wrap.appendChild(btn);
  });
  const back = document.createElement("button");
  back.className = "submenu-btn"; back.textContent = "← Voltar";
  back.onclick = ()=>{ wrap.innerHTML = ""; };
  wrap.appendChild(back);
}
function showItemMenu(player){
  const wrap = document.getElementById("combat-submenu");
  wrap.innerHTML = "";
  const potions = player.inventory.filter(inv=> ITEMS[inv.id].type==="potion");
  if(potions.length===0){
    wrap.innerHTML = `<div class="empty-msg">Sem itens utilizáveis.</div>`;
  }
  potions.forEach(inv=>{
    const it = ITEMS[inv.id];
    const btn = document.createElement("button");
    btn.className = "submenu-btn";
    btn.innerHTML = `${it.icon} ${it.name} x${inv.qty} <small>${it.description}</small>`;
    btn.onclick = ()=> onItemChosen(inv.id);
    wrap.appendChild(btn);
  });
  const back = document.createElement("button");
  back.className = "submenu-btn"; back.textContent = "← Voltar";
  back.onclick = ()=>{ wrap.innerHTML = ""; };
  wrap.appendChild(back);
}
