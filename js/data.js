/* ==========================================================================
   DATA.JS — Todo o conteúdo estático do jogo: classes, habilidades, itens,
   inimigos, regiões, missões e NPCs.
   ========================================================================== */

const GAME_TITLE = "Éclyria — A Última Chama";

/* ---------------------- CLASSES ---------------------- */
const CLASSES = {
  guerreiro: {
    id: "guerreiro", name: "Guerreiro", icon: "🛡️",
    description: "Combatente robusto, especialista em dano físico e resistência. Ideal para quem gosta de enfrentar o perigo de frente.",
    baseStats: { str: 14, int: 4, agi: 8, vit: 14 },
    baseHp: 120, baseMp: 20,
    startSkills: ["golpe_poderoso"],
    startWeapon: "espada_enferrujada",
    sprite: "🛡️"
  },
  mago: {
    id: "mago", name: "Mago", icon: "🔮",
    description: "Manipula as forças arcanas para conjurar magias devastadoras. Frágil, mas com poder de fogo incomparável.",
    baseStats: { str: 4, int: 16, agi: 7, vit: 7 },
    baseHp: 70, baseMp: 110,
    startSkills: ["bola_de_fogo"],
    startWeapon: "cajado_aprendiz",
    sprite: "🔮"
  },
  arqueiro: {
    id: "arqueiro", name: "Arqueiro", icon: "🏹",
    description: "Mestre da precisão e da distância. Ataques rápidos, críticos frequentes e grande mobilidade.",
    baseStats: { str: 9, int: 6, agi: 15, vit: 8 },
    baseHp: 90, baseMp: 60,
    startSkills: ["tiro_certeiro"],
    startWeapon: "arco_curto",
    sprite: "🏹"
  },
  assassino: {
    id: "assassino", name: "Assassino", icon: "🗡️",
    description: "Ataca das sombras com golpes letais e venenos. Alta velocidade e dano crítico, porém vida baixa.",
    baseStats: { str: 10, int: 5, agi: 16, vit: 6 },
    baseHp: 85, baseMp: 55,
    startSkills: ["golpe_sombrio"],
    startWeapon: "adaga_furtiva",
    sprite: "🗡️"
  }
};

/* ---------------------- HABILIDADES (15) ---------------------- */
const SKILLS = {
  // Guerreiro
  golpe_poderoso: { id:"golpe_poderoso", name:"Golpe Poderoso", icon:"💥", classe:"guerreiro", unlockLevel:1, manaCost:8, kind:"physical", power:1.6, effect:null, description:"Um golpe físico com 60% mais força que um ataque comum." },
  brado_de_guerra: { id:"brado_de_guerra", name:"Brado de Guerra", icon:"📯", classe:"guerreiro", unlockLevel:3, manaCost:12, kind:"buff", effect:"buff_atk", value:0.3, duration:3, description:"Aumenta seu ataque físico em 30% por 3 turnos." },
  investida: { id:"investida", name:"Investida", icon:"🐎", classe:"guerreiro", unlockLevel:5, manaCost:14, kind:"physical", power:1.3, effect:"stun", effectChance:0.35, description:"Avança contra o inimigo, com chance de atordoá-lo." },
  furia_berserker: { id:"furia_berserker", name:"Fúria Berserker", icon:"😡", classe:"guerreiro", unlockLevel:8, manaCost:20, kind:"physical", power:2.2, selfDebuff:"def", selfDebuffValue:0.2, description:"Ataque devastador, mas reduz sua defesa por 2 turnos." },

  // Mago
  bola_de_fogo: { id:"bola_de_fogo", name:"Bola de Fogo", icon:"🔥", classe:"mago", unlockLevel:1, manaCost:12, kind:"magic", power:1.7, element:"fogo", effect:"burn", effectChance:0.3, description:"Uma esfera flamejante que pode queimar o inimigo." },
  cura: { id:"cura", name:"Cura", icon:"✨", classe:"mago", unlockLevel:2, manaCost:14, kind:"heal", power:0.9, description:"Restaura uma quantia de vida baseada em sua Inteligência." },
  lanca_de_gelo: { id:"lanca_de_gelo", name:"Lança de Gelo", icon:"❄️", classe:"mago", unlockLevel:3, manaCost:16, kind:"magic", power:1.9, element:"gelo", effect:"stun", effectChance:0.25, description:"Perfura o inimigo com gelo, podendo congelá-lo." },
  raio: { id:"raio", name:"Raio Arcano", icon:"⚡", classe:"mago", unlockLevel:5, manaCost:22, kind:"magic", power:1.4, hits:2, element:"eletrico", description:"Dispara dois raios elétricos consecutivos." },

  // Arqueiro
  tiro_certeiro: { id:"tiro_certeiro", name:"Tiro Certeiro", icon:"🎯", classe:"arqueiro", unlockLevel:1, manaCost:9, kind:"physical", power:1.5, critBonus:0.2, description:"Flecha precisa com chance extra de crítico." },
  olhos_de_aguia: { id:"olhos_de_aguia", name:"Olhos de Águia", icon:"🦅", classe:"arqueiro", unlockLevel:2, manaCost:10, kind:"buff", effect:"buff_crit", value:0.25, duration:3, description:"Aumenta sua chance de crítico em 25% por 3 turnos." },
  chuva_de_flechas: { id:"chuva_de_flechas", name:"Chuva de Flechas", icon:"🏹", classe:"arqueiro", unlockLevel:3, manaCost:18, kind:"physical", power:1.3, hits:3, description:"Dispara três flechas rápidas em sequência." },
  tiro_venenoso: { id:"tiro_venenoso", name:"Tiro Venenoso", icon:"🐍", classe:"arqueiro", unlockLevel:5, manaCost:16, kind:"physical", power:1.2, effect:"poison", effectChance:0.5, description:"Flecha envenenada que causa dano contínuo." },

  // Assassino
  golpe_sombrio: { id:"golpe_sombrio", name:"Golpe Sombrio", icon:"🌑", classe:"assassino", unlockLevel:1, manaCost:10, kind:"physical", power:1.6, effect:"poison", effectChance:0.3, description:"Ataque das sombras que pode envenenar o alvo." },
  passo_sombrio: { id:"passo_sombrio", name:"Passo Sombrio", icon:"👤", classe:"assassino", unlockLevel:3, manaCost:15, kind:"buff", effect:"buff_dodge", value:0.3, duration:2, description:"Torna-se mais difícil de acertar por 2 turnos." },
  lamina_envenenada: { id:"lamina_envenenada", name:"Lâmina Envenenada", icon:"🗡️", classe:"assassino", unlockLevel:5, manaCost:18, kind:"physical", power:1.4, effect:"poison", effectChance:0.75, effectPower:1.5, description:"Corte preciso que aplica veneno potente." }
};

/* ---------------------- ITENS (32) ---------------------- */
const RARITY_ORDER = ["comum","incomum","raro","epico","lendario"];
const RARITY_LABEL = { comum:"Comum", incomum:"Incomum", raro:"Raro", epico:"Épico", lendario:"Lendário" };

const ITEMS = {
  // Armas (8)
  espada_enferrujada: { id:"espada_enferrujada", name:"Espada Enferrujada", icon:"⚔️", type:"weapon", rarity:"comum", value:10, stats:{atk:4}, description:"Uma espada velha, mas ainda cortante." },
  adaga_furtiva: { id:"adaga_furtiva", name:"Adaga Furtiva", icon:"🔪", type:"weapon", rarity:"comum", value:12, stats:{atk:3, agi:2}, description:"Leve e rápida, ideal para golpes precisos." },
  cajado_aprendiz: { id:"cajado_aprendiz", name:"Cajado de Aprendiz", icon:"🪄", type:"weapon", rarity:"comum", value:12, stats:{matk:5}, description:"Um cajado simples imbuído de magia fraca." },
  arco_curto: { id:"arco_curto", name:"Arco Curto", icon:"🏹", type:"weapon", rarity:"comum", value:10, stats:{atk:3, agi:1}, description:"Arco básico de treinamento." },
  lamina_das_sombras: { id:"lamina_das_sombras", name:"Lâmina das Sombras", icon:"🗡️", type:"weapon", rarity:"raro", value:180, stats:{atk:15, agi:6, crit:5}, description:"Forjada nas trevas, corta sem fazer ruído." },
  arco_elfico: { id:"arco_elfico", name:"Arco Élfico", icon:"🏹", type:"weapon", rarity:"raro", value:170, stats:{atk:14, agi:5, crit:3}, description:"Arco élfico de precisão sobrenatural." },
  cajado_arquimago: { id:"cajado_arquimago", name:"Cajado do Arquimago", icon:"🪄", type:"weapon", rarity:"epico", value:420, stats:{matk:28, int:8}, description:"Pulsa com um poder arcano ancestral." },
  fang_lobo_ancestral: { id:"fang_lobo_ancestral", name:"Presa do Lobo Ancestral", icon:"🦴", type:"weapon", rarity:"lendario", value:900, stats:{atk:38, agi:10, crit:8}, description:"Arma esculpida na presa do lendário Alfa da Matilha." },

  // Armaduras (6)
  armadura_de_couro: { id:"armadura_de_couro", name:"Armadura de Couro", icon:"🥋", type:"armor", rarity:"comum", value:15, stats:{def:5}, description:"Proteção básica de couro curtido." },
  cota_de_malha: { id:"cota_de_malha", name:"Cota de Malha", icon:"🛡️", type:"armor", rarity:"incomum", value:60, stats:{def:10, vit:2}, description:"Anéis de metal entrelaçados, resistente a cortes." },
  manto_arcano: { id:"manto_arcano", name:"Manto Arcano", icon:"🧥", type:"armor", rarity:"incomum", value:60, stats:{mdef:9, int:2}, description:"Tecido com fios imbuídos de energia mágica." },
  placa_do_cavaleiro: { id:"placa_do_cavaleiro", name:"Placa do Cavaleiro", icon:"🛡️", type:"armor", rarity:"raro", value:200, stats:{def:18, vit:4}, description:"Armadura pesada usada pelos cavaleiros do reino." },
  vestes_sombrias: { id:"vestes_sombrias", name:"Vestes Sombrias", icon:"🥷", type:"armor", rarity:"raro", value:190, stats:{def:12, agi:4, mdef:6}, description:"Vestes leves tecidas nas sombras." },
  armadura_do_dragao: { id:"armadura_do_dragao", name:"Armadura do Dragão", icon:"🐉", type:"armor", rarity:"lendario", value:950, stats:{def:30, vit:8, mdef:15}, description:"Escamas de um dragão ancestral, quase impenetrável." },

  // Capacetes (5)
  elmo_simples: { id:"elmo_simples", name:"Elmo Simples", icon:"⛑️", type:"helmet", rarity:"comum", value:8, stats:{def:3}, description:"Um elmo de ferro básico." },
  capuz_do_cacador: { id:"capuz_do_cacador", name:"Capuz do Caçador", icon:"🧢", type:"helmet", rarity:"incomum", value:45, stats:{def:5, agi:2}, description:"Leve e discreto, favorito dos batedores." },
  coroa_do_sabio: { id:"coroa_do_sabio", name:"Coroa do Sábio", icon:"👑", type:"helmet", rarity:"raro", value:170, stats:{mdef:10, int:4}, description:"Pertenceu a um antigo estudioso arcano." },
  elmo_de_ferro: { id:"elmo_de_ferro", name:"Elmo de Ferro Batido", icon:"⛑️", type:"helmet", rarity:"raro", value:160, stats:{def:9, vit:2}, description:"Forjado para suportar os golpes mais brutais." },
  diadema_celestial: { id:"diadema_celestial", name:"Diadema Celestial", icon:"👑", type:"helmet", rarity:"lendario", value:800, stats:{def:8, mdef:12, int:5}, description:"Diz-se que foi tocado por uma estrela." },

  // Acessórios (5)
  anel_simples: { id:"anel_simples", name:"Anel Simples", icon:"💍", type:"accessory", rarity:"comum", value:10, stats:{vit:2}, description:"Um anel de metal sem adornos." },
  amuleto_da_sorte: { id:"amuleto_da_sorte", name:"Amuleto da Sorte", icon:"🧿", type:"accessory", rarity:"incomum", value:55, stats:{crit:4}, description:"Dizem que traz sorte em batalha." },
  bracelete_veloz: { id:"bracelete_veloz", name:"Bracelete Veloz", icon:"⌚", type:"accessory", rarity:"raro", value:150, stats:{agi:6}, description:"Torna os movimentos mais ágeis e precisos." },
  pingente_arcano: { id:"pingente_arcano", name:"Pingente Arcano", icon:"🔯", type:"accessory", rarity:"raro", value:160, stats:{int:6, mdef:4}, description:"Vibra suavemente com energia mágica." },
  reliquia_da_ultima_chama: { id:"reliquia_da_ultima_chama", name:"Relíquia da Última Chama", icon:"🔥", type:"accessory", rarity:"lendario", value:1000, stats:{str:5, int:5, agi:5, vit:5}, description:"O artefato que guarda o destino de Éclyria." },

  // Poções (5)
  pocao_vida_p: { id:"pocao_vida_p", name:"Poção de Vida Pequena", icon:"🧪", type:"potion", rarity:"comum", value:15, effect:"heal", value_effect:40, description:"Restaura 40 pontos de vida." },
  pocao_vida_g: { id:"pocao_vida_g", name:"Poção de Vida Grande", icon:"🧪", type:"potion", rarity:"incomum", value:45, effect:"heal", value_effect:120, description:"Restaura 120 pontos de vida." },
  pocao_mana_p: { id:"pocao_mana_p", name:"Poção de Mana Pequena", icon:"🔵", type:"potion", rarity:"comum", value:15, effect:"mana", value_effect:30, description:"Restaura 30 pontos de mana." },
  pocao_mana_g: { id:"pocao_mana_g", name:"Poção de Mana Grande", icon:"🔵", type:"potion", rarity:"incomum", value:45, effect:"mana", value_effect:90, description:"Restaura 90 pontos de mana." },
  elixir_antidoto: { id:"elixir_antidoto", name:"Elixir Antídoto", icon:"🧉", type:"potion", rarity:"comum", value:20, effect:"cure", description:"Cura veneno e queimadura." },

  // Itens de missão (3)
  fragmento_da_chama: { id:"fragmento_da_chama", name:"Fragmento da Chama", icon:"🔥", type:"quest", rarity:"epico", value:0, description:"Um pedaço reluzente de uma chama ancestral." },
  selo_ancestral: { id:"selo_ancestral", name:"Selo Ancestral", icon:"🔱", type:"quest", rarity:"epico", value:0, description:"Um selo gravado com símbolos esquecidos." },
  diario_perdido: { id:"diario_perdido", name:"Diário Perdido", icon:"📖", type:"quest", rarity:"raro", value:0, description:"As páginas contam a queda do castelo." }
};

/* ---------------------- INIMIGOS ---------------------- */
const ENEMIES = {
  lobo_selvagem: { id:"lobo_selvagem", name:"Lobo Selvagem", icon:"🐺", level:2, hp:30, mp:0, atk:6, def:2, matk:0, mdef:1, crit:0.05, dodge:0.05, element:null, weakness:"fogo", xp:15, gold:5, drops:[{item:"pocao_vida_p",chance:0.3}] },
  javali_furioso: { id:"javali_furioso", name:"Javali Furioso", icon:"🐗", level:3, hp:45, mp:0, atk:8, def:4, matk:0, mdef:1, crit:0.05, dodge:0.03, element:null, weakness:null, xp:20, gold:8, drops:[{item:"pocao_vida_p",chance:0.25}] },
  morcego_da_caverna: { id:"morcego_da_caverna", name:"Morcego da Caverna", icon:"🦇", level:5, hp:35, mp:10, atk:10, def:3, matk:4, mdef:2, crit:0.1, dodge:0.15, element:null, weakness:"fogo", xp:28, gold:12, drops:[{item:"pocao_mana_p",chance:0.25},{item:"fragmento_da_chama",chance:0.3}] },
  aranha_venenosa: { id:"aranha_venenosa", name:"Aranha Venenosa", icon:"🕷️", level:6, hp:50, mp:5, atk:9, def:5, matk:0, mdef:2, crit:0.08, dodge:0.1, element:null, weakness:"fogo", xp:32, gold:15, inflicts:"poison", drops:[{item:"elixir_antidoto",chance:0.3},{item:"fragmento_da_chama",chance:0.3}] },
  goblin_batedor: { id:"goblin_batedor", name:"Goblin Batedor", icon:"👺", level:8, hp:60, mp:0, atk:13, def:7, matk:0, mdef:3, crit:0.1, dodge:0.08, element:null, weakness:null, xp:45, gold:20, drops:[{item:"adaga_furtiva",chance:0.1}] },
  harpia_da_neve: { id:"harpia_da_neve", name:"Harpia da Neve", icon:"🦅", level:9, hp:55, mp:15, atk:15, def:6, matk:8, mdef:4, crit:0.12, dodge:0.18, element:"gelo", weakness:"fogo", xp:50, gold:22, drops:[{item:"pocao_vida_g",chance:0.2}] },
  sapo_do_pantano: { id:"sapo_do_pantano", name:"Sapo do Pântano", icon:"🐸", level:11, hp:80, mp:0, atk:14, def:9, matk:0, mdef:4, crit:0.05, dodge:0.05, element:null, weakness:null, xp:65, gold:30, inflicts:"poison", drops:[{item:"elixir_antidoto",chance:0.35},{item:"selo_ancestral",chance:0.25}] },
  espectro_do_charco: { id:"espectro_do_charco", name:"Espectro do Charco", icon:"👻", level:12, hp:70, mp:30, atk:18, def:8, matk:14, mdef:8, crit:0.1, dodge:0.2, element:"sombra", weakness:"fogo", xp:70, gold:35, drops:[{item:"vestes_sombrias",chance:0.08},{item:"selo_ancestral",chance:0.25}] },
  guarda_esqueleto: { id:"guarda_esqueleto", name:"Guarda Esqueleto", icon:"💀", level:14, hp:95, mp:0, atk:20, def:13, matk:0, mdef:6, crit:0.08, dodge:0.05, element:null, weakness:"sagrado", xp:90, gold:45, drops:[{item:"elmo_de_ferro",chance:0.12}] },
  cavaleiro_amaldicoado: { id:"cavaleiro_amaldicoado", name:"Cavaleiro Amaldiçoado", icon:"⚔️", level:17, hp:130, mp:10, atk:26, def:17, matk:6, mdef:9, crit:0.12, dodge:0.08, element:null, weakness:"sagrado", xp:140, gold:70, drops:[{item:"placa_do_cavaleiro",chance:0.15}] },

  // Chefes
  alfa_da_matilha: { id:"alfa_da_matilha", name:"Alfa da Matilha", icon:"🐺", level:7, hp:180, mp:0, atk:16, def:8, matk:0, mdef:4, crit:0.1, dodge:0.1, element:null, weakness:"fogo", xp:150, gold:80, isBoss:true, drops:[{item:"lamina_das_sombras",chance:0.5},{item:"fang_lobo_ancestral",chance:0.05}] },
  senhor_das_ruinas: { id:"senhor_das_ruinas", name:"Senhor das Ruínas", icon:"🗿", level:15, hp:420, mp:60, atk:28, def:18, matk:20, mdef:12, crit:0.12, dodge:0.08, element:"sombra", weakness:"sagrado", xp:350, gold:200, isBoss:true, drops:[{item:"cajado_arquimago",chance:0.4},{item:"coroa_do_sabio",chance:0.3}] },
  devorador_de_chamas: { id:"devorador_de_chamas", name:"O Devorador de Chamas", icon:"🐉", level:20, hp:900, mp:100, atk:40, def:25, matk:35, mdef:20, crit:0.15, dodge:0.1, element:"fogo", weakness:"gelo", xp:1000, gold:500, isBoss:true, drops:[{item:"armadura_do_dragao",chance:1},{item:"reliquia_da_ultima_chama",chance:1}] }
};

/* ---------------------- REGIÕES ---------------------- */
const REGIONS = {
  vila_inicial: { id:"vila_inicial", name:"Vila de Ébano", icon:"🏘️", desc:"Uma pequena vila às margens da floresta. Aqui tudo começou.", minLevel:1, requiresQuest:null, enemies:[], boss:null, npcs:["anciao_bertrand","ferreiro_dario","alquimista_lyra","guarda_otto"] },
  floresta_sombria: { id:"floresta_sombria", name:"Floresta Sombria", icon:"🌲", desc:"Árvores antigas escondem perigos e criaturas famintas.", minLevel:1, requiresQuest:null, enemies:["lobo_selvagem","javali_furioso"], boss:"alfa_da_matilha", bossMinLevel:6, npcs:["cacadora_mira"] },
  caverna_ecoante: { id:"caverna_ecoante", name:"Caverna Ecoante", icon:"🕳️", desc:"Túneis escuros onde ecos estranhos ressoam pelas pedras.", minLevel:4, requiresQuest:null, enemies:["morcego_da_caverna","aranha_venenosa"], boss:null, npcs:["eremita_toran"] },
  montanha_gelada: { id:"montanha_gelada", name:"Montanha Gelada", icon:"🏔️", desc:"Ventos cortantes e passagens traiçoeiras cobertas de neve.", minLevel:7, requiresQuest:"mq3", enemies:["goblin_batedor","harpia_da_neve"], boss:null, npcs:["xama_kessa"] },
  pantano_negro: { id:"pantano_negro", name:"Pântano Negro", icon:"🌿", desc:"Águas escuras escondem segredos — e coisas que preferem não ser encontradas.", minLevel:10, requiresQuest:"mq4", enemies:["sapo_do_pantano","espectro_do_charco"], boss:null, npcs:["refugiada_senna"] },
  ruinas_antigas: { id:"ruinas_antigas", name:"Ruínas Antigas", icon:"🏛️", desc:"O que resta de uma civilização esquecida pelo tempo.", minLevel:13, requiresQuest:"mq5", enemies:["guarda_esqueleto"], boss:"senhor_das_ruinas", bossMinLevel:14, npcs:["escriba_aldric"] },
  castelo_desolado: { id:"castelo_desolado", name:"Castelo Desolado", icon:"🏰", desc:"O castelo real, agora tomado por uma maldição silenciosa.", minLevel:16, requiresQuest:"mq6", enemies:["cavaleiro_amaldicoado"], boss:null, npcs:["espectro_do_rei"] },
  nucleo_da_chama: { id:"nucleo_da_chama", name:"Núcleo da Última Chama", icon:"🌋", desc:"O coração de Éclyria, onde tudo será decidido.", minLevel:19, requiresQuest:"mq7", enemies:[], boss:"devorador_de_chamas", bossMinLevel:19, npcs:[] }
};

const REGION_ORDER = ["vila_inicial","floresta_sombria","caverna_ecoante","montanha_gelada","pantano_negro","ruinas_antigas","castelo_desolado","nucleo_da_chama"];

/* ---------------------- NPCs ---------------------- */
const NPCS = {
  anciao_bertrand: { id:"anciao_bertrand", name:"Ancião Bertrand", icon:"🧙‍♂️", region:"vila_inicial", dialogue:"Estranhos uivos vêm da Floresta Sombria todas as noites. Preciso que alguém investigue.", quests:["mq1"] },
  ferreiro_dario: { id:"ferreiro_dario", name:"Ferreiro Dário", icon:"🔨", region:"vila_inicial", dialogue:"Armas e armaduras, forjadas com o melhor aço da vila!", isShop:true, shopItems:["espada_enferrujada","adaga_furtiva","arco_curto","cota_de_malha","armadura_de_couro","elmo_simples","capuz_do_cacador","anel_simples"] },
  alquimista_lyra: { id:"alquimista_lyra", name:"Alquimista Lyra", icon:"🧪", region:"vila_inicial", dialogue:"Poções frescas, direto do meu caldeirão!", isShop:true, shopItems:["pocao_vida_p","pocao_vida_g","pocao_mana_p","pocao_mana_g","elixir_antidoto","cajado_aprendiz"] },
  guarda_otto: { id:"guarda_otto", name:"Guarda Otto", icon:"💂", region:"vila_inicial", dialogue:"Lobos têm atacado viajantes na estrada. Dê um jeito neles, sim?", quests:["sq1"] },
  cacadora_mira: { id:"cacadora_mira", name:"Caçadora Mira", icon:"🏹", region:"floresta_sombria", dialogue:"O Alfa da Matilha comanda os lobos daqui. Cuidado — ele é feroz.", quests:["sq2","mq2"] },
  eremita_toran: { id:"eremita_toran", name:"Eremita Torã", icon:"🧙", region:"caverna_ecoante", dialogue:"Um fragmento de chama antiga se esconde nestas cavernas. Sinto seu calor.", quests:["mq3","sq3","sq4"] },
  xama_kessa: { id:"xama_kessa", name:"Xamã Kessa", icon:"🪶", region:"montanha_gelada", dialogue:"As harpias guardam segredos das montanhas. Envie-me flechas cravadas em suas penas.", quests:["sq5","mq4","sq6"] },
  refugiada_senna: { id:"refugiada_senna", name:"Refugiada Senna", icon:"🧕", region:"pantano_negro", dialogue:"Um selo ancestral afundou-se no pântano quando fugimos do castelo.", quests:["mq5","sq7","sq8"] },
  escriba_aldric: { id:"escriba_aldric", name:"Escriba Aldric", icon:"📜", region:"ruinas_antigas", dialogue:"Estas ruínas guardam um diário — e um guardião que não quer que ele seja lido.", quests:["mq6","sq9","sq10"] },
  espectro_do_rei: { id:"espectro_do_rei", name:"Espectro do Rei", icon:"👑", region:"castelo_desolado", dialogue:"Eu foi o último rei de Éclyria. O Devorador de Chamas aguarda no núcleo. Termine o que eu não pude.", quests:["mq7","mq8","sq11","sq12"] }
};

/* ---------------------- MISSÕES (principais + secundárias = 20) ---------------------- */
const QUESTS = {
  // Principais (8)
  mq1: { id:"mq1", name:"Ecos na Vila", type:"main", giver:"anciao_bertrand", region:"vila_inicial", description:"Investigue os uivos vindos da Floresta Sombria.", objective:{ type:"kill", target:"lobo_selvagem", count:3 }, rewards:{ xp:40, gold:20, items:[] }, requires:null },
  mq2: { id:"mq2", name:"O Uivo na Floresta", type:"main", giver:"cacadora_mira", region:"floresta_sombria", description:"Derrote o Alfa da Matilha e restaure a paz na floresta.", objective:{ type:"kill", target:"alfa_da_matilha", count:1 }, rewards:{ xp:120, gold:60, items:["pocao_vida_g"] }, requires:"mq1" },
  mq3: { id:"mq3", name:"Ecos na Escuridão", type:"main", giver:"eremita_toran", region:"caverna_ecoante", description:"Encontre o Fragmento da Chama escondido na Caverna Ecoante.", objective:{ type:"collect", target:"fragmento_da_chama", count:1 }, rewards:{ xp:90, gold:40, items:[] }, requires:"mq2" },
  mq4: { id:"mq4", name:"A Trilha Gélida", type:"main", giver:"xama_kessa", region:"montanha_gelada", description:"Enfrente as harpias que aterrorizam a Montanha Gelada.", objective:{ type:"kill", target:"harpia_da_neve", count:4 }, rewards:{ xp:160, gold:80, items:["pocao_mana_g"] }, requires:"mq3" },
  mq5: { id:"mq5", name:"O Pântano dos Sussurros", type:"main", giver:"refugiada_senna", region:"pantano_negro", description:"Recupere o Selo Ancestral perdido no Pântano Negro.", objective:{ type:"collect", target:"selo_ancestral", count:1 }, rewards:{ xp:220, gold:110, items:[] }, requires:"mq4" },
  mq6: { id:"mq6", name:"Ruínas do Passado", type:"main", giver:"escriba_aldric", region:"ruinas_antigas", description:"Derrote o Senhor das Ruínas e recupere o Diário Perdido.", objective:{ type:"kill", target:"senhor_das_ruinas", count:1 }, rewards:{ xp:400, gold:220, items:["diario_perdido"] }, requires:"mq5" },
  mq7: { id:"mq7", name:"O Castelo Desolado", type:"main", giver:"espectro_do_rei", region:"castelo_desolado", description:"Abra caminho pelo Castelo Desolado até o trono.", objective:{ type:"kill", target:"cavaleiro_amaldicoado", count:3 }, rewards:{ xp:500, gold:260, items:[] }, requires:"mq6" },
  mq8: { id:"mq8", name:"A Última Chama", type:"main", giver:"espectro_do_rei", region:"nucleo_da_chama", description:"Enfrente o Devorador de Chamas e salve Éclyria.", objective:{ type:"kill", target:"devorador_de_chamas", count:1 }, rewards:{ xp:2000, gold:1000, items:["reliquia_da_ultima_chama"] }, requires:"mq7" },

  // Secundárias (12)
  sq1: { id:"sq1", name:"Lobos na Estrada", type:"side", giver:"guarda_otto", region:"vila_inicial", description:"Elimine lobos selvagens que atacam viajantes.", objective:{ type:"kill", target:"lobo_selvagem", count:5 }, rewards:{ xp:35, gold:25, items:["pocao_vida_p"] }, requires:null },
  sq2: { id:"sq2", name:"Javalis Furiosos", type:"side", giver:"cacadora_mira", region:"floresta_sombria", description:"Controle a população de javalis furiosos da floresta.", objective:{ type:"kill", target:"javali_furioso", count:4 }, rewards:{ xp:50, gold:30, items:[] }, requires:"mq1" },
  sq3: { id:"sq3", name:"Morcegos Incômodos", type:"side", giver:"eremita_toran", region:"caverna_ecoante", description:"Afugente os morcegos que atormentam o eremita.", objective:{ type:"kill", target:"morcego_da_caverna", count:5 }, rewards:{ xp:60, gold:35, items:["pocao_mana_p"] }, requires:null },
  sq4: { id:"sq4", name:"Veneno nas Sombras", type:"side", giver:"eremita_toran", region:"caverna_ecoante", description:"Elimine as aranhas venenosas da caverna.", objective:{ type:"kill", target:"aranha_venenosa", count:4 }, rewards:{ xp:65, gold:35, items:["elixir_antidoto"] }, requires:"sq3" },
  sq5: { id:"sq5", name:"Penas de Harpia", type:"side", giver:"xama_kessa", region:"montanha_gelada", description:"Colete penas derrotando harpias da neve.", objective:{ type:"kill", target:"harpia_da_neve", count:3 }, rewards:{ xp:85, gold:45, items:[] }, requires:"mq3" },
  sq6: { id:"sq6", name:"Batedores Goblin", type:"side", giver:"xama_kessa", region:"montanha_gelada", description:"Expulse os batedores goblin da montanha.", objective:{ type:"kill", target:"goblin_batedor", count:5 }, rewards:{ xp:90, gold:50, items:["pocao_vida_g"] }, requires:"sq5" },
  sq7: { id:"sq7", name:"Sombras do Charco", type:"side", giver:"refugiada_senna", region:"pantano_negro", description:"Afaste os espectros que rondam o pântano.", objective:{ type:"kill", target:"espectro_do_charco", count:4 }, rewards:{ xp:140, gold:70, items:[] }, requires:"mq4" },
  sq8: { id:"sq8", name:"Sapos Traiçoeiros", type:"side", giver:"refugiada_senna", region:"pantano_negro", description:"Reduza a população de sapos venenosos.", objective:{ type:"kill", target:"sapo_do_pantano", count:5 }, rewards:{ xp:130, gold:65, items:["elixir_antidoto"] }, requires:"sq7" },
  sq9: { id:"sq9", name:"Guardiões de Pedra", type:"side", giver:"escriba_aldric", region:"ruinas_antigas", description:"Derrote os guardas esqueleto que protegem as ruínas.", objective:{ type:"kill", target:"guarda_esqueleto", count:5 }, rewards:{ xp:180, gold:95, items:[] }, requires:"mq5" },
  sq10: { id:"sq10", name:"O Peso da História", type:"side", giver:"escriba_aldric", region:"ruinas_antigas", description:"Ajude Aldric a recolher fragmentos históricos das ruínas.", objective:{ type:"kill", target:"guarda_esqueleto", count:3 }, rewards:{ xp:150, gold:80, items:["coroa_do_sabio"] }, requires:"sq9" },
  sq11: { id:"sq11", name:"Cavaleiros Perdidos", type:"side", giver:"espectro_do_rei", region:"castelo_desolado", description:"Liberte os cavaleiros amaldiçoados de seu sofrimento.", objective:{ type:"kill", target:"cavaleiro_amaldicoado", count:5 }, rewards:{ xp:260, gold:130, items:[] }, requires:"mq6" },
  sq12: { id:"sq12", name:"Última Ronda", type:"side", giver:"espectro_do_rei", region:"castelo_desolado", description:"Uma última ronda pelo castelo antes do confronto final.", objective:{ type:"kill", target:"cavaleiro_amaldicoado", count:4 }, rewards:{ xp:280, gold:150, items:["placa_do_cavaleiro"] }, requires:"sq11" }
};

const QUEST_ORDER = ["mq1","sq1","mq2","sq2","mq3","sq3","sq4","mq4","sq5","sq6","mq5","sq7","sq8","mq6","sq9","sq10","mq7","sq11","sq12","mq8"];
