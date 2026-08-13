/* ==========================================================================
   COMBAT.JS — Motor de combate por turnos.
   ========================================================================== */

let combatState = null;

function startCombat(player, enemyId){
  const base = ENEMIES[enemyId];
  const stats = getStats(player);
  combatState = {
    enemyId,
    enemy: {
      id: enemyId,
      name: base.name, icon: base.icon, isBoss: !!base.isBoss,
      hp: base.hp, maxHp: base.hp,
      mp: base.mp, maxMp: base.mp,
      atk: base.atk, def: base.def, matk: base.matk, mdef: base.mdef,
      crit: base.crit, dodge: base.dodge,
      element: base.element, weakness: base.weakness, inflicts: base.inflicts,
      statuses: [], // {type:'poison'|'burn'|'stun', turns, power}
      buffs: {}
    },
    player: {
      statuses: [],
      buffs: {}, // {atk:{value,turns}, crit:{...}, dodge:{...}}
      defending: false
    },
    playerStatsCache: stats,
    turn: "player",
    ended: false,
    result: null,
    log: []
  };
  logCombat(`Um ${base.name} apareceu!`, "info");
  return combatState;
}

function logCombat(text, cls=""){
  combatState.log.push({ text, cls });
}

function clampHp(entity, prop, maxProp){
  if(entity[prop] < 0) entity[prop] = 0;
  if(entity[prop] > entity[maxProp]) entity[prop] = entity[maxProp];
}

function getPlayerCombatAtk(player){
  const s = getStats(player);
  let atk = s.atk;
  if(combatState.player.buffs.atk) atk *= (1+combatState.player.buffs.atk.value);
  return { s, atk };
}

/* ---------------- AÇÕES DO JOGADOR ---------------- */

function playerAttack(player){
  if(!combatState || combatState.ended) return;
  const { s, atk } = getPlayerCombatAtk(player);
  const enemy = combatState.enemy;
  const dodged = Math.random() < enemy.dodge;
  if(dodged){
    logCombat(`${enemy.name} esquivou do seu ataque!`, "info");
  } else {
    let crit = combatState.player.buffs.crit ? s.crit + combatState.player.buffs.crit.value : s.crit;
    const isCrit = Math.random() < crit;
    let dmg = Math.max(1, Math.round(atk * (0.9+Math.random()*0.2) - enemy.def));
    if(isCrit) dmg = Math.round(dmg*1.8);
    enemy.hp -= dmg; clampHp(enemy,"hp","maxHp");
    logCombat(`Você atacou ${enemy.name} causando ${dmg} de dano${isCrit?" (CRÍTICO!)":""}.`, "dmg-enemy");
  }
  afterPlayerAction();
}

function playerUseSkill(player, skillId){
  if(!combatState || combatState.ended) return { ok:false, msg:"Combate encerrado." };
  const sk = SKILLS[skillId];
  if(!sk) return { ok:false, msg:"Habilidade inválida." };
  if(player.mp < sk.manaCost) return { ok:false, msg:"Mana insuficiente!" };
  player.mp -= sk.manaCost;
  const { s, atk } = getPlayerCombatAtk(player);
  const enemy = combatState.enemy;

  if(sk.kind === "heal"){
    const heal = Math.round(s.int * 1.8 * sk.power);
    player.hp = Math.min(getStats(player).maxHp, player.hp + heal);
    logCombat(`Você usou ${sk.name} e recuperou ${heal} de vida.`, "info");
  } else if(sk.kind === "buff"){
    combatState.player.buffs[sk.effect.replace("buff_","")] = { value: sk.value, turns: sk.duration };
    logCombat(`Você usou ${sk.name}!`, "info");
  } else if(sk.kind === "physical" || sk.kind === "magic"){
    const hits = sk.hits || 1;
    let totalDmg = 0;
    for(let h=0; h<hits; h++){
      const dodged = Math.random() < enemy.dodge;
      if(dodged){ logCombat(`${enemy.name} esquivou de ${sk.name}!`, "info"); continue; }
      let base = sk.kind==="physical" ? atk : s.matk;
      let dmg = Math.round(base * sk.power * (0.9+Math.random()*0.2));
      dmg -= sk.kind==="physical" ? enemy.def*0.8 : enemy.mdef*0.8;
      dmg = Math.max(1, Math.round(dmg));
      if(sk.element && enemy.weakness === sk.element) dmg = Math.round(dmg*1.5);
      let crit = combatState.player.buffs.crit ? s.crit + combatState.player.buffs.crit.value + (sk.critBonus||0) : s.crit + (sk.critBonus||0);
      const isCrit = Math.random() < crit;
      if(isCrit) dmg = Math.round(dmg*1.8);
      enemy.hp -= dmg; clampHp(enemy,"hp","maxHp");
      totalDmg += dmg;
      if(sk.effect==="stun" && Math.random()<sk.effectChance){
        enemy.statuses.push({ type:"stun", turns:1 });
        logCombat(`${enemy.name} foi atordoado!`, "info");
      }
      if(sk.effect==="poison" && Math.random()<sk.effectChance){
        enemy.statuses.push({ type:"poison", turns:3, power:Math.round((sk.effectPower||1)*6) });
        logCombat(`${enemy.name} foi envenenado!`, "info");
      }
      if(sk.effect==="burn" && Math.random()<sk.effectChance){
        enemy.statuses.push({ type:"burn", turns:3, power:7 });
        logCombat(`${enemy.name} está queimando!`, "info");
      }
      if(isCrit) logCombat(`Golpe crítico com ${sk.name}!`, "dmg-enemy");
    }
    logCombat(`Você usou ${sk.name} em ${enemy.name}, causando ${totalDmg} de dano.`, "dmg-enemy");
    if(sk.selfDebuff==="def"){
      combatState.player.buffs.defDown = { value: sk.selfDebuffValue, turns:2 };
    }
  }
  afterPlayerAction();
  return { ok:true };
}

function playerUseItem(player, itemId){
  if(!combatState || combatState.ended) return { ok:false };
  const it = ITEMS[itemId];
  if(!it || itemCount(player, itemId)<1) return { ok:false, msg:"Item indisponível." };
  removeItem(player, itemId, 1);
  const derived = getStats(player);
  if(it.effect==="heal"){
    player.hp = Math.min(derived.maxHp, player.hp + it.value_effect);
    logCombat(`Você usou ${it.name} e recuperou ${it.value_effect} de vida.`, "info");
  } else if(it.effect==="mana"){
    player.mp = Math.min(derived.maxMp, player.mp + it.value_effect);
    logCombat(`Você usou ${it.name} e recuperou ${it.value_effect} de mana.`, "info");
  } else if(it.effect==="cure"){
    combatState.player.statuses = combatState.player.statuses.filter(s=>s.type!=="poison" && s.type!=="burn");
    logCombat(`Você usou ${it.name} e removeu efeitos negativos.`, "info");
  }
  afterPlayerAction();
  return { ok:true };
}

function playerDefend(){
  if(!combatState || combatState.ended) return;
  combatState.player.defending = true;
  logCombat("Você se prepara para se defender.", "info");
  afterPlayerAction();
}

function playerFlee(player){
  if(!combatState || combatState.ended) return { ok:false };
  if(combatState.enemy.isBoss){
    logCombat("Não é possível fugir deste combate!", "info");
    return { ok:false, fled:false };
  }
  const chance = 0.55;
  if(Math.random() < chance){
    combatState.ended = true;
    combatState.result = "flee";
    logCombat("Você fugiu do combate.", "info");
    return { ok:true, fled:true };
  } else {
    logCombat("Você tentou fugir, mas não conseguiu!", "info");
    afterPlayerAction();
    return { ok:true, fled:false };
  }
}

/* ---------------- FIM DE AÇÃO / TURNO DO INIMIGO ---------------- */

function afterPlayerAction(){
  const enemy = combatState.enemy;
  if(enemy.hp <= 0){
    combatState.ended = true;
    combatState.result = "win";
    logCombat(`Você derrotou ${enemy.name}!`, "highlight");
    return;
  }
  combatState.turn = "enemy";
}

function tickStatuses(entity, hpProp, maxHpProp, name){
  let skip = false;
  entity.statuses = entity.statuses.filter(st=>{
    if(st.type==="poison" || st.type==="burn"){
      entity[hpProp] -= st.power;
      clampHp(entity, hpProp, maxHpProp);
      logCombat(`${name} sofreu ${st.power} de dano por ${st.type==="poison"?"veneno":"queimadura"}.`, "info");
    }
    if(st.type==="stun" && st.turns>0){ skip = true; }
    st.turns -= 1;
    return st.turns > 0 || (st.type!=="poison" && st.type!=="burn" && st.type!=="stun" ? true : st.turns>0);
  });
  return skip;
}

function tickBuffs(buffObj){
  Object.keys(buffObj).forEach(k=>{
    buffObj[k].turns -= 1;
    if(buffObj[k].turns <= 0) delete buffObj[k];
  });
}

// Executa o turno do inimigo. Retorna true se combate terminou.
function runEnemyTurn(player){
  if(!combatState || combatState.ended) return true;
  const enemy = combatState.enemy;

  const skipEnemy = tickStatuses(enemy, "hp","maxHp", enemy.name);
  if(enemy.hp<=0){
    combatState.ended = true; combatState.result="win";
    logCombat(`${enemy.name} sucumbiu aos efeitos!`, "highlight");
    return true;
  }
  if(skipEnemy){
    logCombat(`${enemy.name} está atordoado e perde o turno!`, "info");
  } else {
    // ataque do inimigo
    const derived = getStats(player);
    let dodgeChance = derived.dodge + (combatState.player.buffs.dodge?combatState.player.buffs.dodge.value:0);
    const dodged = Math.random() < dodgeChance;
    if(dodged){
      logCombat(`Você esquivou do ataque de ${enemy.name}!`, "info");
    } else {
      let def = derived.def;
      if(combatState.player.buffs.defDown) def *= (1-combatState.player.buffs.defDown.value);
      let dmg = Math.max(1, Math.round(enemy.atk*(0.9+Math.random()*0.2) - def*0.8));
      const isCrit = Math.random() < enemy.crit;
      if(isCrit) dmg = Math.round(dmg*1.7);
      if(combatState.player.defending) dmg = Math.round(dmg*0.45);
      player.hp -= dmg;
      if(player.hp<0) player.hp=0;
      logCombat(`${enemy.name} atacou você causando ${dmg} de dano${isCrit?" (CRÍTICO!)":""}.`, "dmg-player");
      if(enemy.inflicts && Math.random()<0.3){
        combatState.player.statuses.push({ type:enemy.inflicts, turns:3, power: enemy.inflicts==="poison"?6:7 });
        logCombat(`Você foi afetado por ${enemy.inflicts==="poison"?"veneno":"um efeito negativo"}!`, "info");
      }
    }
  }

  // tick de status do jogador (dano de veneno/queimadura)
  applyPlayerStatusDamage(player);

  tickBuffs(combatState.player.buffs);
  combatState.player.defending = false;

  if(player.hp<=0){
    player.hp = 0;
    combatState.ended = true;
    combatState.result = "lose";
    logCombat("Você foi derrotado...", "highlight");
    return true;
  }
  combatState.turn = "player";
  return false;
}

// Como o jogador usa player.hp real (persistido), tratamos status separadamente aqui.
function applyPlayerStatusDamage(player){
  const derived = getStats(player);
  combatState.player.statuses.forEach(st=>{
    if(st.type==="poison" || st.type==="burn"){
      player.hp -= st.power;
      if(player.hp<0) player.hp = 0;
      logCombat(`Você sofreu ${st.power} de dano por ${st.type==="poison"?"veneno":"queimadura"}.`, "dmg-player");
    }
  });
  combatState.player.statuses = combatState.player.statuses.filter(st=>{
    st.turns -= 1;
    return st.turns>0;
  });
}

function getCombatRewards(){
  const base = ENEMIES[combatState.enemyId];
  return { xp: base.xp, gold: base.gold, drops: base.drops||[] };
}
