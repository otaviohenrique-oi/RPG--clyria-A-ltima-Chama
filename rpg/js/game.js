/* ==========================================================================
   GAME.JS — Orquestração geral: menus, salvamento, exploração, lojas e
   integração do fluxo de combate.
   ========================================================================== */

const SAVE_KEY = "eclyria_save_v1";
let player = null;
let selectedClass = null;

/* ---------------- SALVAMENTO ---------------- */
function saveGame(){
  if(!player) return;
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify(player));
    showToast("Jogo salvo!");
  } catch(e){
    showToast("Não foi possível salvar.");
  }
}
function hasSave(){
  return !!localStorage.getItem(SAVE_KEY);
}
function loadGame(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return null;
  try{ return JSON.parse(raw); } catch(e){ return null; }
}
function eraseSave(){
  localStorage.removeItem(SAVE_KEY);
}

/* ---------------- NAVEGAÇÃO ENTRE VIEWS DO JOGO ---------------- */
function navigate(viewName){
  $all(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+viewName).classList.add("active");
  $all(".hud-btn[data-nav]").forEach(b=> b.classList.toggle("active", b.dataset.nav===viewName));
  if(viewName==="character") renderCharacter(player);
  if(viewName==="inventory") renderInventory(player);
  if(viewName==="quests") renderQuests(player);
  if(viewName==="map") renderMap(player);
  if(viewName==="explore") renderExplore(player);
}

/* ---------------- FLUXO PRINCIPAL DE TELAS ---------------- */
function goToMenu(){
  document.getElementById("btn-continue").disabled = !hasSave();
  showScreen("screen-menu");
}

function goToCreate(){
  selectedClass = null;
  document.getElementById("input-name").value = "";
  document.getElementById("class-detail").textContent = "Escolha uma classe para ver detalhes.";
  renderClassGrid();
  showScreen("screen-create");
}
function renderClassGrid(){
  const grid = document.getElementById("class-grid");
  grid.innerHTML = "";
  Object.values(CLASSES).forEach(cls=>{
    const card = document.createElement("div");
    card.className = "class-card";
    card.innerHTML = `<div class="cls-icon">${cls.icon}</div><div class="cls-name">${cls.name}</div>`;
    card.onclick = ()=>{
      selectedClass = cls.id;
      $all(".class-card").forEach(c=>c.classList.remove("selected"));
      card.classList.add("selected");
      document.getElementById("class-detail").innerHTML = `<b>${cls.name}</b><br>${cls.description}<br><br>
        Força: ${cls.baseStats.str} · Inteligência: ${cls.baseStats.int} · Agilidade: ${cls.baseStats.agi} · Vitalidade: ${cls.baseStats.vit}`;
    };
    grid.appendChild(card);
  });
}

function startNewGame(){
  const name = document.getElementById("input-name").value.trim() || "Aventureiro";
  if(!selectedClass){ showToast("Escolha uma classe antes de começar!"); return; }
  player = createPlayer(name, selectedClass);
  enterGameWorld();
}

function enterGameWorld(){
  showScreen("screen-game");
  renderHud(player);
  navigate("explore");
}

/* ---------------- EXPLORAÇÃO ---------------- */
function doExplore(){
  const region = REGIONS[player.currentRegion];
  const bossAvailable = region.boss && !player.defeatedBosses.includes(region.boss) && player.level >= (region.bossMinLevel||region.minLevel);

  if(bossAvailable && Math.random() < 0.22){
    addEventLog(`Você sente uma presença poderosa se aproximando...`, "highlight");
    beginEncounter(region.boss);
    return;
  }
  if(region.enemies.length === 0){
    randomFlavorEvent();
    return;
  }
  const roll = Math.random();
  if(roll < 0.68){
    const enemyId = region.enemies[Math.floor(Math.random()*region.enemies.length)];
    beginEncounter(enemyId);
  } else if(roll < 0.85){
    randomFlavorEvent();
  } else {
    addEventLog("Você explora a área, mas nada acontece desta vez.");
  }
}
function randomFlavorEvent(){
  const roll = Math.random();
  if(roll < 0.5){
    const gold = 5 + Math.floor(Math.random()*15);
    player.gold += gold;
    addEventLog(`Você encontrou ${gold} moedas de ouro pelo caminho.`, "highlight");
    renderHud(player);
  } else if(roll < 0.8){
    addItem(player, "pocao_vida_p", 1);
    addEventLog("Você encontrou uma Poção de Vida Pequena.", "highlight");
  } else {
    addEventLog("Tudo está calmo por aqui. Nada de interessante acontece.");
  }
}

function doRest(){
  const s = getStats(player);
  player.hp = s.maxHp;
  player.mp = s.maxMp;
  renderHud(player);
  addEventLog("Você descansou junto à fogueira e recuperou toda sua vida e mana.", "highlight");
  showToast("Vida e mana totalmente restauradas.");
}

/* ---------------- NPCs / LOJAS / MISSÕES ---------------- */
function openNpcModal(pl, npcId){
  const npc = NPCS[npcId];
  let html = `<h3>${npc.icon} ${npc.name}</h3><p style="color:var(--text-dim); font-style:italic;">"${npc.dialogue}"</p>`;

  if(npc.isShop){
    html += `<div style="max-height:260px; overflow-y:auto; margin:12px 0;">`;
    npc.shopItems.forEach(itemId=>{
      const it = ITEMS[itemId];
      html += `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-gold); padding:6px 0;">
        <span>${it.icon} ${it.name} <small style="color:var(--text-dim);">(${it.value}🪙)</small></span>
        <button class="btn-fantasy" data-buy="${itemId}" style="padding:6px 10px; font-size:13px;">Comprar</button>
      </div>`;
    });
    html += `</div>`;
  }

  const questsToShow = (npc.quests||[]);
  questsToShow.forEach(qid=>{
    const q = QUESTS[qid];
    const state = pl.quests[qid];
    if(!state){
      const reqMet = !q.requires || (pl.quests[q.requires] && pl.quests[q.requires].status==="done");
      if(reqMet){
        html += `<div style="border:1px solid var(--border-gold); border-radius:6px; padding:10px; margin-top:8px;">
          <b style="color:var(--gold-bright);">${q.name}</b> <span class="quest-tag ${q.type==='main'?'main':'side'}">${q.type==='main'?'Principal':'Secundária'}</span>
          <p style="font-size:13px; color:var(--text-dim);">${q.description}</p>
          <button class="btn-fantasy" data-accept="${qid}" style="padding:6px 10px; font-size:13px;">Aceitar Missão</button>
        </div>`;
      }
    } else if(state.status==="active" && isQuestComplete(pl, qid)){
      html += `<div style="border:1px solid var(--gold-bright); border-radius:6px; padding:10px; margin-top:8px;">
        <b style="color:var(--gold-bright);">${q.name}</b> — pronta para entrega!
        <br><button class="btn-fantasy" data-claim="${qid}" style="padding:6px 10px; font-size:13px; margin-top:6px;">Entregar Missão</button>
      </div>`;
    }
  });

  html += `<div class="modal-actions"><button class="btn-fantasy btn-ghost" id="modal-close">Fechar</button></div>`;
  showModal(html);
  document.getElementById("modal-close").onclick = closeModal;
  $all("[data-buy]").forEach(btn=>{
    btn.onclick = ()=>{
      const itemId = btn.dataset.buy;
      const it = ITEMS[itemId];
      if(pl.gold < it.value){ showToast("Ouro insuficiente!"); return; }
      pl.gold -= it.value;
      addItem(pl, itemId, 1);
      renderHud(pl);
      showToast(`Comprou ${it.name}.`);
    };
  });
  $all("[data-accept]").forEach(btn=>{
    btn.onclick = ()=>{
      const qid = btn.dataset.accept;
      acceptQuest(pl, qid);
      closeModal();
      renderNpcList(pl);
      showToast(`Missão aceita: ${QUESTS[qid].name}`);
    };
  });
  $all("[data-claim]").forEach(btn=>{
    btn.onclick = ()=>{
      const qid = btn.dataset.claim;
      const result = completeQuest(pl, qid);
      closeModal();
      renderHud(pl); renderNpcList(pl);
      showToast(`Missão concluída: ${QUESTS[qid].name}!`);
      if(result && result.levels.length>0) handleLevelUps(pl, result.levels);
      refreshUnlockedRegions(pl);
    };
  });
}

function useItemOutOfCombat(pl, itemId){
  const it = ITEMS[itemId];
  const s = getStats(pl);
  if(it.effect==="heal"){
    removeItem(pl, itemId, 1);
    pl.hp = Math.min(s.maxHp, pl.hp + it.value_effect);
    showToast(`Recuperou ${it.value_effect} de vida.`);
  } else if(it.effect==="mana"){
    removeItem(pl, itemId, 1);
    pl.mp = Math.min(s.maxMp, pl.mp + it.value_effect);
    showToast(`Recuperou ${it.value_effect} de mana.`);
  } else if(it.effect==="cure"){
    removeItem(pl, itemId, 1);
    showToast("Efeitos negativos removidos.");
  } else {
    showToast("Este item não pode ser usado agora.");
    return;
  }
  renderHud(pl); renderInventory(pl);
}

/* ---------------- LEVEL UP ---------------- */
function handleLevelUps(pl, levels){
  const s = getStats(pl);
  showLevelUp(`${pl.name} alcançou o nível ${levels[levels.length-1]}!\nVida máx: ${s.maxHp} · Mana máx: ${s.maxMp}\nAtaque: ${s.atk} · Defesa: ${s.def}`);
}

/* ---------------- COMBATE ---------------- */
function beginEncounter(enemyId){
  startCombat(player, enemyId);
  showScreen("screen-combat");
  renderCombatScreen(player);
}

function onSkillChosen(skillId){
  const res = playerUseSkill(player, skillId);
  document.getElementById("combat-submenu").innerHTML = "";
  if(!res.ok){ showToast(res.msg); return; }
  postPlayerAction();
}
function onItemChosen(itemId){
  playerUseItem(player, itemId);
  document.getElementById("combat-submenu").innerHTML = "";
  postPlayerAction();
}

function postPlayerAction(){
  renderCombatScreen(player);
  if(combatState.ended){
    setTimeout(()=> resolveCombatEnd(), 900);
    return;
  }
  setTimeout(()=>{
    runEnemyTurn(player);
    renderCombatScreen(player);
    renderHud(player);
    if(combatState.ended){
      setTimeout(()=> resolveCombatEnd(), 900);
    }
  }, 800);
}

function resolveCombatEnd(){
  const result = combatState.result;
  if(result === "win"){
    const rewards = getCombatRewards();
    const killedRegionRewards = updateKillProgress(player, combatState.enemyId);
    gainXpAndShow(rewards.xp);
    player.gold += rewards.gold;
    let dropMsgs = [];
    (rewards.drops||[]).forEach(d=>{
      if(Math.random() < d.chance){
        addItem(player, d.item, 1);
        updateCollectProgress(player, d.item);
        dropMsgs.push(ITEMS[d.item].name);
      }
    });
    if(ENEMIES[combatState.enemyId].isBoss){
      player.defeatedBosses.push(combatState.enemyId);
      refreshUnlockedRegions(player);
    }
    addEventLog(`Vitória! +${rewards.xp} XP, +${rewards.gold} 🪙${dropMsgs.length? ' — Itens: '+dropMsgs.join(', '):''}`, "highlight");
    showToast(`Você derrotou ${ENEMIES[combatState.enemyId].name}!`);
  } else if(result === "lose"){
    player.hp = Math.max(1, Math.round(getStats(player).maxHp*0.3));
    player.currentRegion = "vila_inicial";
    addEventLog("Você foi derrotado e resgatado até a Vila de Ébano.", "info");
    showToast("Você foi derrotado...");
  } else if(result === "flee"){
    addEventLog("Você escapou do combate.");
  }
  combatState = null;
  renderHud(player);
  showScreen("screen-game");
  navigate("explore");
}

function gainXpAndShow(amount){
  const levels = gainXp(player, amount);
  if(levels.length>0) handleLevelUps(player, levels);
}

/* ---------------- INICIALIZAÇÃO / EVENTOS ---------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  spawnEmberParticles();
  goToMenu();

  document.getElementById("btn-new").onclick = goToCreate;
  document.getElementById("btn-continue").onclick = ()=>{
    const data = loadGame();
    if(!data){ showToast("Nenhum save encontrado."); return; }
    player = data;
    // garante compatibilidade com saves antigos / novos campos
    if(!player.defeatedBosses) player.defeatedBosses = [];
    if(!player.unlockedRegions) player.unlockedRegions = ["vila_inicial","floresta_sombria"];
    refreshUnlockedRegions(player);
    enterGameWorld();
  };
  document.getElementById("btn-erase").onclick = ()=>{
    if(confirm("Tem certeza que deseja apagar seu save? Esta ação não pode ser desfeita.")){
      eraseSave();
      showToast("Save apagado.");
      goToMenu();
    }
  };
  document.getElementById("btn-back-menu").onclick = goToMenu;
  document.getElementById("btn-start-game").onclick = startNewGame;

  $all(".hud-btn[data-nav]").forEach(btn=>{
    btn.onclick = ()=> navigate(btn.dataset.nav);
  });
  document.getElementById("btn-save").onclick = saveGame;
  document.getElementById("btn-explore").onclick = doExplore;
  document.getElementById("btn-rest").onclick = doRest;

  $all(".quest-tab").forEach(tab=>{
    tab.onclick = ()=>{ currentQuestTab = tab.dataset.qtab; renderQuests(player); };
  });

  document.getElementById("modal-overlay").onclick = (e)=>{
    if(e.target.id==="modal-overlay") closeModal();
  };
  document.getElementById("levelup-close").onclick = closeLevelUp;

  document.getElementById("act-attack").onclick = ()=>{
    document.getElementById("combat-submenu").innerHTML = "";
    playerAttack(player);
    postPlayerAction();
  };
  document.getElementById("act-skill").onclick = ()=> showSkillMenu(player);
  document.getElementById("act-item").onclick = ()=> showItemMenu(player);
  document.getElementById("act-defend").onclick = ()=>{
    document.getElementById("combat-submenu").innerHTML = "";
    playerDefend();
    postPlayerAction();
  };
  document.getElementById("act-flee").onclick = ()=>{
    document.getElementById("combat-submenu").innerHTML = "";
    const res = playerFlee(player);
    renderCombatScreen(player);
    if(combatState && combatState.ended){
      setTimeout(()=> resolveCombatEnd(), 700);
    } else if(res && res.ok && !res.fled){
      setTimeout(()=>{
        runEnemyTurn(player);
        renderCombatScreen(player);
        renderHud(player);
        if(combatState.ended) setTimeout(()=> resolveCombatEnd(), 900);
      }, 800);
    }
  };
});

function spawnEmberParticles(){
  const container = document.getElementById("particles");
  for(let i=0;i<18;i++){
    const p = document.createElement("div");
    p.className = "ember-particle";
    p.style.left = Math.random()*100+"vw";
    p.style.animationDuration = (6+Math.random()*8)+"s";
    p.style.animationDelay = (Math.random()*8)+"s";
    container.appendChild(p);
  }
}
