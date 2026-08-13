/* ==========================================================================
   PLAYER.JS — Criação de personagem, atributos, inventário, equipamentos,
   progressão de nível e progresso de missões.
   ========================================================================== */

function createPlayer(name, classeId){
  const cls = CLASSES[classeId];
  const player = {
    name: name || "Aventureiro",
    classe: classeId,
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(2),
    gold: 30,
    baseStats: { ...cls.baseStats },
    hp: 0, mp: 0, // set below
    equipment: { weapon:null, armor:null, helmet:null, accessory:null },
    inventory: [], // {id, qty}
    skills: [...cls.startSkills],
    quests: {}, // id -> {status:'active'|'done', progress:number}
    currentRegion: "vila_inicial",
    unlockedRegions: ["vila_inicial","floresta_sombria"],
    defeatedBosses: [],
    combatBuffs: {} // used only transiently during combat, not saved deeply
  };
  addItem(player, cls.startWeapon, 1);
  equipItem(player, cls.startWeapon);
  addItem(player, "pocao_vida_p", 3);
  addItem(player, "pocao_mana_p", 2);
  const derived = getStats(player);
  player.hp = derived.maxHp;
  player.mp = derived.maxMp;
  return player;
}

function xpForLevel(level){
  // XP total necessário para alcançar "level"
  return Math.round(40 * Math.pow(level, 1.9));
}

/* ---- Atributos derivados (base + crescimento por nível + equipamentos) ---- */
function getStats(player){
  const cls = CLASSES[player.classe];
  const lvlBonus = player.level - 1;
  let str = player.baseStats.str + lvlBonus * 1.6;
  let int_ = player.baseStats.int + lvlBonus * 1.6;
  let agi = player.baseStats.agi + lvlBonus * 1.4;
  let vit = player.baseStats.vit + lvlBonus * 1.6;

  let atkBonus=0, matkBonus=0, defBonus=0, mdefBonus=0, critBonus=0, agiBonus=0, vitBonus=0, strBonus=0, intBonus=0;

  Object.values(player.equipment).forEach(itemId=>{
    if(!itemId) return;
    const it = ITEMS[itemId];
    if(!it || !it.stats) return;
    atkBonus += it.stats.atk||0;
    matkBonus += it.stats.matk||0;
    defBonus += it.stats.def||0;
    mdefBonus += it.stats.mdef||0;
    critBonus += it.stats.crit||0;
    agiBonus += it.stats.agi||0;
    vitBonus += it.stats.vit||0;
    strBonus += it.stats.str||0;
    intBonus += it.stats.int||0;
  });

  str += strBonus; int_ += intBonus; agi += agiBonus; vit += vitBonus;

  const maxHp = Math.round(cls.baseHp + lvlBonus*(10+vit*0.8));
  const maxMp = Math.round(cls.baseMp + lvlBonus*(6+int_*0.6));

  const atk = Math.round(str*1.8 + atkBonus);
  const matk = Math.round(int_*1.8 + matkBonus);
  const def = Math.round(vit*0.6 + defBonus);
  const mdef = Math.round(int_*0.3 + mdefBonus);
  const crit = Math.min(0.6, 0.03 + agi*0.003 + critBonus/100);
  const dodge = Math.min(0.45, 0.02 + agi*0.0035);

  return { str, int:int_, agi, vit, maxHp, maxMp, atk, matk, def, mdef, crit, dodge };
}

/* ---- Inventário ---- */
function addItem(player, itemId, qty=1){
  const existing = player.inventory.find(i=>i.id===itemId);
  if(existing) existing.qty += qty;
  else player.inventory.push({ id:itemId, qty });
}
function removeItem(player, itemId, qty=1){
  const idx = player.inventory.findIndex(i=>i.id===itemId);
  if(idx===-1) return false;
  player.inventory[idx].qty -= qty;
  if(player.inventory[idx].qty <= 0) player.inventory.splice(idx,1);
  return true;
}
function itemCount(player, itemId){
  const it = player.inventory.find(i=>i.id===itemId);
  return it ? it.qty : 0;
}

/* ---- Equipamentos ---- */
function equipItem(player, itemId){
  const it = ITEMS[itemId];
  if(!it || !["weapon","armor","helmet","accessory"].includes(it.type)) return false;
  if(itemCount(player, itemId) < 1) return false;
  const slot = it.type;
  const prev = player.equipment[slot];
  if(prev) addItem(player, prev, 1);
  removeItem(player, itemId, 1);
  player.equipment[slot] = itemId;
  return true;
}
function unequipItem(player, slot){
  const cur = player.equipment[slot];
  if(!cur) return false;
  addItem(player, cur, 1);
  player.equipment[slot] = null;
  return true;
}

/* ---- XP / Level Up ---- */
function gainXp(player, amount){
  player.xp += amount;
  const levelsGained = [];
  while(player.xp >= player.xpToNext){
    player.xp -= player.xpToNext;
    player.level += 1;
    levelsGained.push(player.level);
    player.xpToNext = xpForLevel(player.level+1) - xpForLevel(player.level);
    const derived = getStats(player);
    player.hp = derived.maxHp;
    player.mp = derived.maxMp;
    unlockSkillsForLevel(player);
  }
  return levelsGained;
}
function unlockSkillsForLevel(player){
  Object.values(SKILLS).forEach(sk=>{
    if(sk.classe === player.classe && sk.unlockLevel <= player.level && !player.skills.includes(sk.id)){
      player.skills.push(sk.id);
    }
  });
}

/* ---- Missões ---- */
function acceptQuest(player, questId){
  if(player.quests[questId]) return false;
  const q = QUESTS[questId];
  if(!q) return false;
  let progress = 0;
  // Se o objetivo é derrotar um chefe que já foi derrotado antes de aceitar a missão, conta automaticamente.
  if(q.objective.type==="kill" && player.defeatedBosses.includes(q.objective.target)){
    progress = q.objective.count;
  }
  if(q.objective.type==="collect"){
    progress = Math.min(q.objective.count, itemCount(player, q.objective.target));
  }
  player.quests[questId] = { status:"active", progress };
  return true;
}
function questProgressLabel(q, state){
  if(q.objective.type==="kill") return `${state.progress}/${q.objective.count} derrotados`;
  if(q.objective.type==="collect") return `${state.progress}/${q.objective.count} coletados`;
  return "";
}
function updateKillProgress(player, enemyId){
  const rewards = [];
  Object.keys(player.quests).forEach(qid=>{
    const state = player.quests[qid];
    if(state.status!=="active") return;
    const q = QUESTS[qid];
    if(q.objective.type==="kill" && q.objective.target===enemyId){
      state.progress = Math.min(q.objective.count, state.progress+1);
      if(state.progress >= q.objective.count){
        rewards.push(qid);
      }
    }
  });
  return rewards; // quest ids ready to turn in (still needs completeQuest call)
}
function updateCollectProgress(player, itemId){
  Object.keys(player.quests).forEach(qid=>{
    const state = player.quests[qid];
    if(state.status!=="active") return;
    const q = QUESTS[qid];
    if(q.objective.type==="collect" && q.objective.target===itemId){
      state.progress = itemCount(player, itemId);
    }
  });
}
function isQuestComplete(player, questId){
  const state = player.quests[questId];
  const q = QUESTS[questId];
  if(!state || state.status!=="active") return false;
  return state.progress >= q.objective.count;
}
function completeQuest(player, questId){
  const q = QUESTS[questId];
  const state = player.quests[questId];
  if(!state || state.status!=="active") return null;
  if(q.objective.type==="collect"){
    removeItem(player, q.objective.target, q.objective.count);
  }
  state.status = "done";
  const levels = gainXp(player, q.rewards.xp);
  player.gold += q.rewards.gold;
  (q.rewards.items||[]).forEach(itId=> addItem(player, itId, 1));
  return { levels, rewards:q.rewards };
}

/* ---- Regiões ---- */
function isRegionUnlocked(player, regionId){
  const r = REGIONS[regionId];
  if(!r) return false;
  if(player.level < r.minLevel) return false;
  if(r.requiresQuest && !(player.quests[r.requiresQuest] && player.quests[r.requiresQuest].status==="done")) return false;
  return true;
}
function refreshUnlockedRegions(player){
  REGION_ORDER.forEach(rid=>{
    if(isRegionUnlocked(player, rid) && !player.unlockedRegions.includes(rid)){
      player.unlockedRegions.push(rid);
    }
  });
}
