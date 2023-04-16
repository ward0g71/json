function onUnits(data, ui8) {

    var ui16 = new window.Uint16Array(data);

    /* The amount of object that arrived in one context of units data([18] is one object data(-2 from beggining)) */
    var len = (ui8.length - 2) / 18;

    if (ui8[1] === 1)
        Entitie.removeAll();  // First message contains [0, 1 ...] at the beggining.
    for (
        var i   = 0,
        isRef8  = 2,
        isRef16 = 1;

        i < len; i++,

        isRef8  += 18,
        isRef16 += 9

        ) {
            var UNIT        = null;
            var pid         = ui8[isRef8];
            var uid         = ui8[isRef8 + 1];
            var type        = ui8[isRef8 + 3];
            var state       = ui16[isRef16 + 2];
            var id          = ui16[isRef16 + 3];
            var extra       = ui16[isRef16 + 8];

            if (state === 0) { Entitie.remove(pid, id, uid, type, extra); continue;}

            UNIT            = Entitie.get(pid, id, uid, type);

            setEntitie(
            UNIT, 
            pid, 
            uid, 
            id, 
            type, 
            ui16[isRef16 + 4], // Position X
            ui16[isRef16 + 5], // Position Y
            ui16[isRef16 + 6], // Position X
            ui16[isRef16 + 7], // Position Y
            extra,             // Distinguish look of object
            ui8[isRef8 + 2],   // Rotation
            state
            );

            var update = ENTITIES[type].update;
            if (update !== window.undefined) update(UNIT, ui16[isRef16 + 4], ui16[isRef16 + 5]);
        }
};

function onOldVersion(data) {
    var ui16 = new window.Uint16Array(data);
    if ((Home.gameMode === World.__SURVIVAL__) || (Home.gameMode === World.__GHOUL__)) {
        Client.badServerVersion(ui16[1]);
        if (Home.alertDelay <= 0) {
            Home.alertId = (Client.state === Client.State.__OLD_CLIENT_VERSION__) ? 0 : 1;
            Home.alertDelay = 3000;
        }
    } else if (Home.gameMode === World.__BR__) {
        Client.badServerVersion(-1);
        window.setTimeout(Home.joinServer, 300);
    }
};

function onFull() {
    Client.full();
    if (Home.alertDelay <= 0) {
        Home.alertId = 2;
        Home.alertDelay = 3000;
    }
};

function onPlayerDie(ui8) {
    var player = Entitie.findEntitie(__ENTITIE_PLAYER__, World.PLAYER.id, 0);
    if (player !== null)
        Entitie.remove(player.pid, player.id, player.uid, player.type, 1);
    World.PLAYER.kill = (ui8[1] << 8) + ui8[2];
    Client.closeClient();
};

function onOtherDie(id) {
    if (World.players[id].ghoul === 0)
        World.playerAlive--;
};

function onFailRestoreSession() {
    Client.failRestore();
};

function onStoleYourSession() {
    Client.stolenSession();
};

function onMute(delay) {
    Client.muted(delay);
};

function onLeaderboard(data, ui8) {
    if (data.byteLength === 1)
        return;
    var ui16 = new window.Uint16Array(data);
    World.initLeaderboard(ui16, ui8);
};

function onHandshake(data, ui8) {

    World.PLAYER.id     = ui8[1];
    var ui16          = new window.Uint16Array(data);
    var nnW             = ui16[3] << 5;

    World.initDayCycle((nnW >= World.__DAY__) ? 1 : 0, nnW);
    Client.handshake();
    Render.reset();

    Entitie.unitsPerPlayer          = ui16[1];
    World.playerNumber              = ui8[4];
    World.gameMode                  = ui8[5];
    World.PLAYER.lastScore          = -1;
    World.PLAYER.exp                = 0;
    World.PLAYER.click              = 0;
    World.PLAYER.notification       = [];
    World.PLAYER.notificationLevel  = [];
    World.PLAYER.drag.begin         = 0;
    World.PLAYER.interaction        = -1;
    World.PLAYER.interactionDelay   = 0;
    World.PLAYER.WMnWv              = 0;
    World.PLAYER.blueprint          = 0;
    World.PLAYER.buildRotate        = 0;
    World.PLAYER.hintRotate         = 0;
    World.PLAYER.grid               = 0;

    for (var i = 0; i < World.PLAYER.gridPrev.length; i++)
        World.PLAYER.gridPrev[i] = 0;
    for (var i = 0; i < 8; i++)
        World.PLAYER.teamPos[i] = {
            old: 0,
            id: 0
        };

    World.PLAYER.KARMA          = 0;
    World.PLAYER.badKarmaDelay  = 0;

    if (World.gameMode === World.__BR__)
        World.PLAYER.craftFactor = 0.2;
    else if (World.gameMode === World.__GHOUL__)
        World.PLAYER.craftFactor = 0.4;
    else
        World.PLAYER.craftFactor = 1;

    World.PLAYER.lastAreas = [
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1],
        [-1, -1]
    ];

    if (World.gameMode !== World.__GHOUL__) World.PLAYER.nextAreas = 10000000;

    World.PLAYER.badKarma           = 0;
    World.PLAYER.gridPrev[i]        = 0;
    World.PLAYER.isBuilding         = 0;
    World.PLAYER.warm               = 0;
    World.PLAYER.wrongTool          = 0;
    World.PLAYER.wrongToolTimer     = 0;
    World.PLAYER.teamLeader         = 0;
    World.PLAYER.teamDelay          = 0;
    World.PLAYER.teamQueue          = [0, 0, 0, 0, 0];
    World.PLAYER.teamCreateDelay    = 0;
    World.PLAYER.teamEffect         = 0;
    World.PLAYER.teamJoin           = 0;
    World.PLAYER.team               = -1;
    World.PLAYER.craftLen           = 0;
    World.PLAYER.craftArea          = -1;
    World.PLAYER.craftCategory      = -1;
    World.PLAYER.craftSelected      = -1;
    World.PLAYER.crafting           = 0;
    World.PLAYER.craftList          = [];
    World.PLAYER.craftAvailable     = [];
    World.PLAYER.recipeAvailable    = [];
    World.PLAYER.recipeList         = [];
    World.PLAYER.recipeLen          = 0;
    World.PLAYER.craftSpeed         = 0;
    World.PLAYER.craftGauge         = 0;
    World.PLAYER.toolsList          = [];
    World.PLAYER.toolsLen           = 0;
    World.PLAYER.skillUnlocked      = [];
    World.PLAYER.level              = 0;
    World.PLAYER.kill               = 0;
    World.PLAYER.xp                 = 0;
    World.PLAYER.skillPoint         = 0;
    World.PLAYER.nextLevel          = 0;
    World.PLAYER.isInBuilding       = 0;
    World.PLAYER.isInChest          = 0;
    World.PLAYER.extraLoot          = 0;
    Render.scale                    = 0;
    World.PLAYER.toxicMap           = [];
    World.PLAYER.toxicStep          = 0;

    for (var i = 0; i < 8; i++) {
        World.PLAYER.toxicMap[i] = [];
        for (var j = 0; j < 8; j++)
            World.PLAYER.toxicMap[i][j] = 0;
    }
    
    var len = ENTITIES[__ENTITIE_PLAYER__].inventorySize;
    
    World.PLAYER.inventory = [];

    for (var i = 0; i < len; i++)
        World.PLAYER.inventory[i] = [0, 0, 0, 0];
    var len = (data.byteLength - 8) / 10;
    for (var WVnMV = 8, VmvnN = 4, i = 0; i < len; i++,
        WVnMV += 10,
        VmvnN += 5) {
        var PLAYER = World.players[ui8[WVnMV]];
        PLAYER.id = ui8[WVnMV];
        World.addToTeam(PLAYER, ui8[WVnMV + 1]);
        PLAYER.repellent = (ui8[WVnMV + 2] === 0) ? 0 : (Render.globalTime + (ui8[WVnMV + 2] * 2000));
        PLAYER.withdrawal = (ui8[WVnMV + 3] === 0) ? 0 : (Render.globalTime + (ui8[WVnMV + 3] * 1000));
        PLAYER.ghoul = ui8[WVnMV + 4];
        if (PLAYER.ghoul !== 0)
            World.playerAlive--;
        PLAYER.tokenId = ui16[VmvnN + 3];
        PLAYER.score = MathUtils.inflateNumber(ui16[VmvnN + 4]) + 1;
        window.console.log("id", PLAYER.id, "score", PLAYER.score);
        PLAYER.scoreSimplified = MathUtils.simplifyNumber(PLAYER.score - 1);
    }

    World.PLAYER.ghoul = World.players[World.PLAYER.id].ghoul;
    localStorage2.setItem("tokenId", World.players[World.PLAYER.id].tokenId);
    localStorage2.setItem("userId", World.PLAYER.id);
    World.sortLeaderboard();
    World.initGauges();

};

function onKickInactivity() {
    Client.kickedInactivity();
};

function onNotification(ui8) {
    var PLAYER = World.players[ui8[1]];
    PLAYER.notification.push(ui8[2] >> 2);
    PLAYER.notificationLevel.push(ui8[2] & 3);
};

function onGauges(data) {
    var gauges = World.gauges;
    
    gauges.life.value       = data[1];
    gauges.food.value       = data[2];
    gauges.cold.value       = data[3];
    gauges.stamina.value    = data[4];
    gauges.rad.value        = data[5];

};

function onScore(data) {
    var ui16 = new window.Uint16Array(data);
    World.PLAYER.exp = (ui16[1] << 16) + ui16[2];
};

function onPlayerHit(id, angle) {
    var player = Entitie.findEntitie(__ENTITIE_PLAYER__, id, 0);
    if (player !== null) {
        if (id === World.PLAYER.id)
            Render.shake = 3;
        player.hurt = 300;
        player.hurtAngle = ((angle * 2) * window.Math.PI) / 255;
    }
};

function onFullInventory(MWwnV) {
    for (var i = 0; i < World.PLAYER.inventory.length; i++) {
        for (var j = 0; j < 4; j++)
            World.PLAYER.inventory[i][0] = 0;
    }
    var j = 0;
    for (var i = 1; i < MWwnV.length; i += 4) {
        var IID = MWwnV[i];
        if (IID !== 0)
            Game.inventory[j].setImages(INVENTORY[IID].itemButton.src, INVENTORY[IID].itemButton.img);
        else
            continue;
        var invtr = World.PLAYER.inventory[j];
        invtr[1] = MWwnV[i + 1];
        invtr[2] = MWwnV[i + 2];
        invtr[3] = MWwnV[i + 3];
        invtr[0] = IID;
        j++;
    }
};

function onDeleteItem(IID) {
    var invtr = World.PLAYER.inventory;
    for (var i = 0; i < invtr.length; i++) {
        if ((((invtr[i][0] === IID[1]) && (invtr[i][1] === IID[2])) && (invtr[i][2] === IID[3])) && (invtr[i][3] === IID[4])) {
            invtr[i][0] = 0;
            invtr[i][1] = 0;
            invtr[i][2] = 0;
            invtr[i][3] = 0;
            if ((Game.getSkillBoxState() === 1) && (World.PLAYER.craftCategory === -1)) 
                World.buildCraftList(World.PLAYER.craftArea);
            return;
        }
    }
};

function onNewItem(IID) {
    var invtr = World.PLAYER.inventory;
    for (var i = 0; i < invtr.length; i++) {
        if (invtr[i][0] === 0) {
            invtr[i][0] = IID[1];
            invtr[i][1] = IID[2];
            invtr[i][2] = IID[3];
            invtr[i][3] = IID[4];
            Game.inventory[i].setImages(INVENTORY[IID[1]].itemButton.src, INVENTORY[IID[1]].itemButton.img);
            if ((Game.getSkillBoxState() === 1) && (World.PLAYER.craftCategory === -1))
                World.buildCraftList(World.PLAYER.craftArea);
            return;
        }
    }
};

function onPlayerLife(vW) {
    World.gauges.life.value = vW;
};

function onLifeDecreas() {
    World.gauges.life.decrease = 1;
};

function onSelectedItem(data) {
    World.interactionEffect = INVENTORY[(data[1] << 8) + data[2]]._effect;
};

function onLifeStop() {
    World.gauges.life.decrease = 0;
};

function onPlayerHeal(id) {
    var player = Entitie.findEntitie(__ENTITIE_PLAYER__, id, 0);
    if ((player !== null) && (World.players[id].ghoul === 0))
        player.heal = 300;
};

function onStaminaIncrease() {
    World.gauges.stamina.decrease = -1;
};

function onReplaceItem(IID) {
    var invtr = World.PLAYER.inventory;
    for (var i = 0; i < invtr.length; i++) {
        if ((((invtr[i][0] === IID[1]) && (invtr[i][1] === IID[2])) && (invtr[i][2] === IID[3])) && (invtr[i][3] === IID[4])) {
            invtr[i][1] = IID[5];
            if ((Game.getSkillBoxState() === 1) && (World.PLAYER.craftCategory === -1))
                World.buildCraftList(World.PLAYER.craftArea);
            return;
        }
    }
};

function onStackItem(data) {
    var invtr = World.PLAYER.inventory;
    var wWnWW = -1;
    var MNmNm = -1;
    for (var i = 0; i < invtr.length; i++) {
        if ((((wWnWW === -1) && (invtr[i][0] === data[1])) && (invtr[i][1] === data[2])) && (invtr[i][2] === data[3]))
            wWnWW = i;
        else if (((invtr[i][0] === data[1]) && (invtr[i][1] === data[4])) && (invtr[i][2] === data[5]))
            MNmNm = i;
    }
    var item = INVENTORY[data[1]];
    var NVwnN = data[2] + data[4];
    if (item.stack < NVwnN) {
        invtr[MNmNm][3] = window.Math.min(255, window.Math.max(0, window.Math.floor(((invtr[wWnWW][3] * invtr[wWnWW][1]) + (invtr[MNmNm][3] * (item.stack - invtr[wWnWW][1]))) / item.stack)));
        invtr[wWnWW][1] = NVwnN - item.stack;
        invtr[MNmNm][1] = item.stack;
    } else {
        invtr[MNmNm][3] = window.Math.min(255, window.Math.max(0, window.Math.floor(((invtr[wWnWW][3] * invtr[wWnWW][1]) + (invtr[MNmNm][3] * invtr[MNmNm][1])) / NVwnN)));
        invtr[wWnWW][0] = 0;
        invtr[wWnWW][1] = 0;
        invtr[wWnWW][2] = 0;
        invtr[wWnWW][3] = 0;
        invtr[MNmNm][1] = NVwnN;
    }
    if ((Game.getSkillBoxState() === 1) && (World.PLAYER.craftCategory === -1))
        World.buildCraftList(World.PLAYER.craftArea);
};

function onSplitItem(data) {
    var invtr = World.PLAYER.inventory;
    var amount = window.Math.floor(data[2] / 2);
    var nvMvW = -1;
    var VVmWn = -1;
    for (var i = 0; i < invtr.length; i++) {
        if ((((VVmWn === -1) && (invtr[i][0] === data[1])) && (invtr[i][1] === data[2])) && (invtr[i][2] === data[3])) {
            VVmWn = i;
            invtr[i][1] -= amount;
        } else if ((nvMvW === -1) && (invtr[i][0] === 0)) {
            nvMvW = i;
            invtr[i][0] = data[1];
            invtr[i][1] = amount;
            invtr[i][2] = data[4];
            Game.inventory[i].setImages(INVENTORY[data[1]].itemButton.src, INVENTORY[data[1]].itemButton.img);
        }
    }
    invtr[nvMvW][3] = invtr[VVmWn][3];
    if ((Game.getSkillBoxState() === 1) && (World.PLAYER.craftCategory === -1))
        World.buildCraftList(World.PLAYER.craftArea);
};

function onStaminaStop()        { World.gauges.stamina.decrease = 0;  };
function onStaminaDecrease()    { World.gauges.stamina.decrease = 1;  };
function onColdIncrease()       { World.gauges.cold.decrease    = -1; };
function onColdStop()           { World.gauges.cold.decrease    = 0;  };
function onColdDecrease()       { World.gauges.cold.decrease    = 1;  };
function onPlayerStamina(vW)    { World.gauges.stamina.value    = vW; };
function onLifeIncrease()       { World.gauges.life.decrease    = -1; };

function onReplaceAmmo(IID) {
    var invtr = World.PLAYER.inventory;
    for (var i = 0; i < invtr.length; i++) {
        if ((((invtr[i][0] === IID[1]) && (invtr[i][1] === IID[2])) && (invtr[i][2] === IID[3])) && (invtr[i][3] === IID[4])) {
            invtr[i][3] = IID[5];
            return;
        }
    }
};

function onStartInteraction(mM) {
    World.PLAYER.interaction      = 1;
    World.PLAYER.interactionDelay = mM * 100;
    World.PLAYER.interactionWait  = World.PLAYER.interactionDelay;
};

function onInterruptInteraction() {
    World.PLAYER.interaction      = -1;
    World.PLAYER.interactionDelay = 0;
};

function onReplaceItemAndAmmo(IID) {
    var invtr = World.PLAYER.inventory;
    for (var i = 0; i < invtr.length; i++) {
        if ((((invtr[i][0] === IID[1]) && (invtr[i][1] === IID[2])) && (invtr[i][2] === IID[3])) && (invtr[i][3] === IID[4])) {
            invtr[i][1] = IID[5];
            invtr[i][3] = IID[6];
            if ((Game.getSkillBoxState() === 1) && (World.PLAYER.craftCategory === -1))
                World.buildCraftList(World.PLAYER.craftArea);
            return;
        }
    }
};

function onBlueprint(blueprint) {
    World.PLAYER.blueprint = blueprint;
};

function onDay() {
    World.setDayCycle(0, 0);
    World.gauges.cold.decrease = -1;
};

function onNight() {
    World.setDayCycle(1, 0);
    if (World.PLAYER.warm === 0)
        World.gauges.cold.decrease = 1;
};

function onPlayerXp(xp) {
    World.PLAYER.xp += xp;
};

function onPlayerXpSkill(ui8) {
    var level = ui8[1];
    World.PLAYER.level = level;
    World.PLAYER.nextLevel = World.getXpFromLevel(level);
    World.PLAYER.xp = (((ui8[2] << 24) + (ui8[3] << 16)) + (ui8[4] << 8)) + ui8[5];
    World.PLAYER.skillPoint = level;
    for (var i = 6; i < ui8.length; i++)
        onBoughtSkill(ui8[i]);
};

function onBoughtSkill(IID) {
    if (IID === 0)
        return;
    World.PLAYER.skillUnlocked[IID] = 1;
    World.PLAYER.skillPoint -= INVENTORY[IID].detail.price;
    var scaleby = INVENTORY[IID].scale;
    if (scaleby !== window.undefined)
        Render.scale = scaleby;
    else {
        var bag = INVENTORY[IID].bag;
        if (bag !== window.undefined) {
            for (var i = 0; i < bag; i++)
                World.PLAYER.inventory.push([0, 0, 0, 0]);
        }
    }
    if ((Game.getSkillBoxState() === 1) && (World.PLAYER.craftCategory !== -1)) 
        World.buildSkillList(World.PLAYER.craftCategory);
};

function onStartCraft(id) {
    if ((Game.getSkillBoxState() === 1) && (World.PLAYER.craftArea === 0))
        World.buildCraftList(AREAS.__PLAYER__);
    var delay = INVENTORY[id].detail.timer[0] * World.PLAYER.craftFactor;
    World.PLAYER.crafting = window.Date.now() + delay;
    World.PLAYER.craftingMax = delay;
};

function onLostBuilding() {
    if (((((Game.getSkillBoxState() === 1) && (World.PLAYER.vwMWn !== -1)) && (World.PLAYER.craftCategory === -1)) && (World.PLAYER.craftArea !== AREAS.__PLAYER__)) || (World.PLAYER.isInChest === 1))
        Game.BUTTON_CLOSE_BOX();
};


function onOpenBuilding(ui8) {
    var area = ui8[1];
    World.buildCraftList(area);
    if (ui8[8] === 0) {
        AudioUtils.playFx(AudioUtils._fx.open, 1, 0);
        Game.openBox(1);
        World.PLAYER.isInBuilding = 1;
    }
    var craft = World.PLAYER.building;
    var queue = craft.queue;
    World.PLAYER.building.len = 4;
    for (var i = 0; i < 4; i++) {
        var item = ui8[i + 4];
        queue[i] = item;
        if (item !== 0)
            Game.queue[i].setImages(INVENTORY[item].itemButton.src, INVENTORY[item].itemButton.img);
        else {
            World.PLAYER.building.len = i;
            break;
        }
    }
    craft.pos = ui8[3];
    if (((((((area === AREAS.__SMELTER__) || (area === AREAS.__FIRE__)) || (area === AREAS.__COMPOST__)) || (area === AREAS.__BBQ__)) || (area === AREAS.__TESLA__)) || (area === AREAS.__AGITATOR__)) || (area === AREAS.__EXTRACTOR__))
        craft.fuel = ui8[9];
    else
        craft.fuel = -1;
    if (((queue[0] !== 0) && (craft.pos !== 4)) && (queue[craft.pos] !== 0)) {
        var item = INVENTORY[queue[craft.pos]];
        var canvasZ = item.detail.area;
        for (i = 0; i < canvasZ.length; i++) {
            if (canvasZ[i] === area) {
                craft.timeMax = item.detail.timer[i] * World.PLAYER.craftFactor;
                break;
            }
        }
        craft.time = window.Date.now() + (craft.timeMax * (ui8[2] / 255));
    } else if (World.PLAYER.building.len === craft.pos)
        craft.time = 0;
};

function onNewFuelValue(ui8) {
    World.PLAYER.building.fuel = ui8[1];
};

function onWarmOn() {
    World.PLAYER.warm = 1;
    World.gauges.cold.decrease = -1;
};

function onWarmOff() {
    World.PLAYER.warm = 0;
    if ((World.day === 1) || (World.transition > 0))
        World.gauges.cold.decrease = 1;
};

function onWrongTool(tool) {
    if (World.PLAYER.wrongToolTimer <= 0) {
        World.PLAYER.wrongToolTimer = 2000;
        World.PLAYER.wrongTool      = tool;
    }
};

function onModdedGaugesValues(data) {
    var ui16 = new window.Uint16Array(data);

    World.gauges.life._max          = ui16[1];
    World.gauges.life.speedInc      = ui16[2] / 10000;
    World.gauges.life.speedDec      = ui16[3] / 10000;

    World.gauges.food._max          = ui16[4];
    World.gauges.food.speedInc      = ui16[5] / 10000;
    World.gauges.food.speedDec      = ui16[6] / 10000;

    World.gauges.cold._max          = ui16[7];
    World.gauges.cold.speedInc      = ui16[8] / 10000;
    World.gauges.cold.speedDec      = ui16[9] / 10000;

    World.gauges.stamina._max       = ui16[10];
    World.gauges.stamina.speedInc   = ui16[11] / 10000;
    World.gauges.stamina.speedDec   = ui16[12] / 10000;

    World.gauges.rad._max           = ui16[13];
    World.gauges.rad.speedInc       = ui16[14] / 10000;
    World.gauges.rad.speedDec       = ui16[15] / 10000;

    World.gauges.life.current       = window.Math.min(World.gauges.life._max, World.gauges.life.current);
    World.gauges.life.value         = window.Math.min(World.gauges.life._max, World.gauges.life.value);

    World.gauges.food.current       = window.Math.min(World.gauges.food._max, World.gauges.food.current);
    World.gauges.food.value         = window.Math.min(World.gauges.food._max, World.gauges.food.value);

    World.gauges.cold.current       = window.Math.min(World.gauges.cold._max, World.gauges.cold.current);
    World.gauges.cold.value         = window.Math.min(World.gauges.cold._max, World.gauges.cold.value);

    World.gauges.stamina.current    = window.Math.min(World.gauges.stamina._max, World.gauges.stamina.current);
    World.gauges.stamina.value      = window.Math.min(World.gauges.stamina._max, World.gauges.stamina.value);

    World.gauges.rad.current        = window.Math.min(World.gauges.rad._max, World.gauges.rad.current);
    World.gauges.rad.value          = window.Math.min(World.gauges.rad._max, World.gauges.rad.value);

};

function onShakeExplosionState(shake) {
    Render.explosionShake = -shake;
};

function onFullChest(ui8) {
    var itemsinside = World.PLAYER.chest;

    if (ui8[1] === 1) {
        Game.openBox(2);            
        World.PLAYER.isInChest = 1;            
        AudioUtils.playFx(AudioUtils._fx.open, 1, 0); 
    }

    for (var space = 0; space < 4; space++) {
        for (var j = 0; j < 3; j++) {
            var itemimage = ui8[(2 + (space * 3)) + j];
            if (j === 0) {
                if (itemimage === 0) {
                    itemsinside[space][0] = 0;
                    itemsinside[space][1] = 0;
                    itemsinside[space][2] = 0;
                    itemsinside[space][3] = 0;
                    break;
                }
                Game.chest[space].setImages(INVENTORY[itemimage].itemButton.src, INVENTORY[itemimage].itemButton.img);
            }
            itemsinside[space][j] = itemimage;
        }
        itemsinside[space][3] = itemsinside[space][2];
    }


};

function onRadOn() {
    World.gauges.rad.decrease = 1;
};

function onRadOff() {
    World.gauges.rad.decrease = -1;
};

function onAcceptedTeam(PLAYER, team) {
    World.players[PLAYER].team = team;
    World.players[PLAYER].teamUid = World.teams[team].uid;
    if (PLAYER === World.PLAYER.id)
        World.PLAYER.team = team;
};

function onKickedTeam(PLAYER) {
    World.players[PLAYER].team = -1;
    if (PLAYER === World.PLAYER.id)
        World.PLAYER.team = -1;
};

function onDeleteTeam(team) {
    World.deleteTeam(team);
    if (team === World.PLAYER.team) {
        World.PLAYER.team       = -1;
        World.PLAYER.teamLeader = 0;
    }
};

function onJoinTeam(PLAYER) {
    var queue = World.PLAYER.teamQueue;
    for (var i = 0; i < 5; i++) {
        if (queue[i] === 0) {
            if (World.PLAYER.teamJoin === 0) {
                World.PLAYER.teamJoin = PLAYER;
                World.PLAYER.teamDelay = 0;
            } else
                queue[i] = PLAYER;
            return;
        }
    }
};

function onTeamPosition(ui8) {
    window.console.log(ui8);
    var pos = World.PLAYER.teamPos;
    var len = (ui8.length - 1) / 3;
    var j = 0;
    for (var i = 0; i < len; i++) {
        var id = ui8[3 + (i * 3)];
        if (World.PLAYER.id !== id) {
            var wX = ui8[1 + (i * 3)];
            var wY = ui8[2 + (i * 3)];
            var PLAYER = World.players[id];
            pos[j].id = id;
            pos[j].old = 14000;
            PLAYER.x = wX * Render.__TRANSFORM__;
            PLAYER.y = wY * Render.__TRANSFORM__;
            if (Math2d.fastDist(PLAYER.rx, PLAYER.ry, PLAYER.x, PLAYER.y) > 3000000) {
                PLAYER.rx = PLAYER.x;
                PLAYER.ry = PLAYER.y;
            }
            j++;
        }
    }
    World.PLAYER.teamLength = j;
};


function onKarma(KARMA) {
    World.PLAYER.KARMA = KARMA;
};

function onBadKarma(ui8) {
    if (ui8[1] !== World.PLAYER.id) {
        var PLAYER = World.players[ui8[1]];

        PLAYER.x        = ui8[2] * Render.__TRANSFORM__;
        PLAYER.y        = ui8[3] * Render.__TRANSFORM__;
        PLAYER.KARMA    = ui8[4];
        World.PLAYER.badKarma       = PLAYER.id;
        World.PLAYER.badKarmaDelay  = 14000;
    }
};

function onAreas(ui8) {
    World.PLAYER.toxicStep++;
    World.PLAYER.nextAreas = ui8[1] * 1000;
    for (var k = 2; k < 14; k++) {
        if (ui8[k] === 100) {
            World.PLAYER.lastAreas[k - 2][0] = -1;
            World.PLAYER.lastAreas[k - 2][1] = -1;
        } else {
            var i = window.Math.floor(ui8[k] / 8);
            var j = ui8[k] % 8;
            World.PLAYER.toxicMap[i][j] = World.PLAYER.toxicStep;
            World.PLAYER.lastAreas[k - 2][0] = i;
            World.PLAYER.lastAreas[k - 2][1] = j;
        }
    }
    Render.battleRoyale();
};

function onWrongPassword() {
    Client.badServerVersion(0);
    if (Home.alertDelay <= 0) {
        Home.alertId    = 3;
        Home.alertDelay = 3000;
    }
};

function onPlayerEat(id) {
    var player = Entitie.findEntitie(__ENTITIE_PLAYER__, id, 0);
    if (player !== null)
        player.hurt2 = 300;
};

function onCitiesLocation(cities) {
    World.PLAYER.cities = [];
    for (var i = 1; i < cities.length; i++)
        World.PLAYER.cities.push(cities[i] * 100);
};

function onPoisened(delay) {
    Render.setPoisonEffect(delay * 1000);
};

function onRepellent(id, delay) {
    World.players[id].repellent = Render.globalTime + (delay * 2000);
};

function onLapadoine(id, delay) {
    World.players[id].withdrawal = Render.globalTime + (delay * 1000);
};

function onResetDrug(id, withdrawal) {
    var PLAYER = World.players[id];
    PLAYER.withdrawal = (withdrawal !== 0) ? Render.globalTime : 0;
    PLAYER.repellent = Render.globalTime;
};

function onDramaticChrono(nnW) {
    World.PLAYER.nextAreas = nnW * 10000;
};

function onMessageRaw(data) {
    var ui8 = new window.Uint8Array(data);
    // Decode data
    switch (ui8[0]) {
        case 0:          onUnits                    (data, ui8);                    break;
        case 1:          onOldVersion               (data);                         break;
        case 2:          onFull                     ();                             break;
        case 3:          onPlayerDie                (ui8);                          break;
        case 4:          onOtherDie                 (ui8[1]);                       break;
        case 5:          onFailRestoreSession       ();                             break;
        case 6:          onStoleYourSession         ();                             break;
        case 7:          onMute                     (ui8[1]);                       break;
        case 8:          onLeaderboard              (data, ui8);                    break;
        case 9:          onHandshake                (data, ui8);                    break;
        case 10:         onKickInactivity           ();                             break;
        case 11:         onNotification             (ui8);                          break;
        case 12:         onGauges                   (ui8);                          break;
        case 13:         onScore                    (data);                         break;
        case 14:         onPlayerHit                (ui8[1], ui8[2]);               break;
        case 15:         onFullInventory            (ui8);                          break;
        case 16:         onDeleteItem               (ui8);                          break;
        case 17:         onNewItem                  (ui8);                          break;
        case 18:         onPlayerLife               (ui8[1]);                       break;
        case 19:         onLifeDecreas              ();                             break;
        case 20:         onSelectedItem             (ui8);                          break;
        case 21:         onLifeStop                 ();                             break;
        case 22:         onPlayerHeal               (ui8[1]);                       break;
        case 23:         onStaminaIncrease          ();                             break;
        case 24:         onStaminaStop              ();                             break;
        case 25:         onStaminaDecrease          ();                             break;
        case 26:         onColdIncrease             ();                             break;
        case 27:         onColdStop                 ();                             break;
        case 28:         onColdDecrease             ();                             break;
        case 29:         onPlayerStamina            (ui8[1]);                       break;
        case 30:         onLifeIncrease             ();                             break;
        case 31:         onReplaceItem              (ui8);                          break;
        case 32:         onStackItem                (ui8);                          break;
        case 33:         onSplitItem                (ui8);                          break;
        case 34:         onReplaceAmmo              (ui8);                          break;
        case 35:         onStartInteraction         (ui8[1]);                       break;
        case 36:         onInterruptInteraction     ();                             break;
        case 37:         onReplaceItemAndAmmo       (ui8);                          break;
        case 38:         onBlueprint                (ui8[1]);                       break;
        case 39:         onDay                      ();                             break;
        case 40:         onNight                    ();                             break;
        case 41:         onPlayerXp                 ((ui8[1] << 8) + ui8[2]);       break;
        case 42:         onPlayerXpSkill            (ui8);                          break;
        case 43:         onBoughtSkill              (ui8[1]);                       break;
        case 44:         onStartCraft               (ui8[1]);                       break;
        case 45:         onLostBuilding             ();                             break;
        case 46:         onOpenBuilding             (ui8);                          break;
        case 47:         onNewFuelValue             (ui8);                          break;
        case 48:         onRadOn                    ();                             break;
        case 49:         onRadOff                   ();                             break;
        case 50:         onWarmOn                   ();                             break;
        case 51:         onWarmOff                  ();                             break;
        case 52:         onWrongTool                (ui8[1]);                       break;
        case 53:         onFullChest                (ui8);                          break;
        case 54:         onAcceptedTeam             (ui8[1], ui8[2]);               break;
        case 55:         onKickedTeam               (ui8[1]);                       break;
        case 56:         onDeleteTeam               (ui8[1]);                       break;
        case 57:         onJoinTeam                 (ui8[1]);                       break;
        case 58:         onTeamPosition             (ui8);                          break;
        case 59:         onKarma                    (ui8[1]);                       break;
        case 60:         onBadKarma                 (ui8);                          break;
        case 61:         onAreas                    (ui8);                          break;
        case 62:         onWrongPassword            ();                             break;
        case 63:         onModdedGaugesValues       (data);                         break;
        case 64:         onShakeExplosionState      (ui8[1]);                       break;
        case 65:         onPlayerEat                (ui8[1]);                       break;
        case 66:         onCitiesLocation           (ui8);                          break;
        case 67:         onPoisened                 (ui8[1]);                       break;
        case 68:         onRepellent                (ui8[1], ui8[2]);               break;
        case 69:         onLapadoine                (ui8[1], ui8[2]);               break;
        case 70:         onResetDrug                (ui8[1], ui8[2]);               break;
        case 71:         onDramaticChrono           (ui8[1]);                       break;
    }
};

function onChat(data) {
    World.players[data[1]].text.push(data[2]);
};

function onNewPlayer(data) {
    var PLAYER = World.players[data[1]];

    PLAYER.tokenId          = data[2];
    PLAYER.score            = 0;
    PLAYER.old              = __ENTITIE_PLAYER__;
    PLAYER.nickname         = data[3];
    PLAYER.skin             = data[4];
    PLAYER.ghoul            = data[5];
    PLAYER.team             = -1;
    PLAYER.breath           = 0;
    PLAYER.move             = 0;
    PLAYER.orientation      = 1;
    PLAYER.punch            = 1;
    PLAYER.withdrawal       = 0;
    PLAYER.repellent        = 0;
    PLAYER.notification     = [];
    PLAYER.notificationLevel = [];
    PLAYER.notificationDelay = 0;
    PLAYER.textEase         = 0;
    PLAYER.text             = [];
    PLAYER.textEffect       = [];
    PLAYER.textMove         = [];
    PLAYER.label            = [];
    PLAYER.locatePlayer     = -1;
    PLAYER.frameId          = -1;
    PLAYER.nicknameLabel    = null;
    PLAYER.playerIdLabel    = null;
    PLAYER.storeLabel       = null;
    PLAYER.leaderboardLabel = null;
    if (PLAYER.ghoul === 0)
        World.playerAlive++;
};

function onNicknamesToken(data) {
    var len = data.length - 1;
    World.playerNumber = len;
    localStorage2.setItem("token", data[len]);
    data[0] = "";
    World.allocatePlayers(data);
};

function onAlert(vvMVW) {};

function onNewTeam(data) {
    var team = World.teams[data[1]];
    team.leader = data[2];
    team.name = data[3];
    var PLAYER = World.players[team.leader];
    PLAYER.teamUid = team.uid;
    PLAYER.teamLeader = 1;
    PLAYER.team = team.id;
    if (team.leader === World.PLAYER.id) {
        World.PLAYER.teamLeader = 1;
        World.PLAYER.team = team.id;
    }
    if (Game.teamName === team.name)
        Game.teamNameValid = 0;
};

function onTeamName(data) {
    World.allocateTeam(data);
};

function onMessageJSON(data) {
    switch (data[0]) {
        case 0:     onChat          (data);      break;
        case 1:     onNewPlayer     (data);      break;
        case 2:     onNicknamesToken(data);      break;
        case 3:     onAlert         (data[1]);   break;
        case 4:     onNewTeam       (data);      break;
        case 5:     onTeamName      (data);      break;
    }
};

function onFirstMessage(dat) {
    var token   = localStorage2.getItem("token");
    var tokenId = localStorage2.getItem("tokenId");
    var userid  = -1;

    try {
        userid = window.Number(localStorage2.getItem("userId"));
        if (userid === window.NaN)
            userid = -1;
    } catch (error) {};

    var nickname    = localStorage2.getItem("nickname");
    var state       = ((Client.state & Client.State.__CONNECTION_LOST__) > 0) ? 1 : 0;
    var skin        = window.Number(localStorage2.getItem("skin"));
    var password    = 0;

    if (window.document.getElementById("passwordInput") !== null) {
        password = window.document.getElementById("passwordInput").value;
        if (password.length > 0)
            localStorage2.setItem("password", password);
        if (Loader.getURLData("admin") !== null) {
            Home.adblocker = 0;
            Home.ads = -1;
        }
    }
    return [dat, token, tokenId, userid, state, nickname, skin, Home.adblocker, password];
};

var Client = (function() {

    State = {
        __CONNECTED__:               1,
        __PENDING__:                 2,
        __ATTEMPTS_LIMIT_EXCEEDED__: 4,
        __OLD_CLIENT_VERSION__:      8,
        __OLD_SERVER_VERSION__:      16,
        __FULL__:                    32,
        __CONNECTION_LOST__:         64,
        __CLOSED__:                  128,
        __FAIL_RESTORE__:            256,
        __KICKED_INACTIVITY__:       512,
        __STOLEN_SESSION__:          1024
    };

    var VMVmm = 0;
    var hostname = 1;
    var port = 2;
    var vNNmW = 3;
    var Wmvmm = 4;
    var VMvvn = 3000;
    var WmNnm = 1500;
    var string0 = window.JSON.stringify([0]);
    var MMvMv = 150;
    var mvNWn = 60;
    var LEFT = 0;
    var RIGHT = 1;
    var socket = window.undefined;
    var Nvwnv = 0;
    var isconnected = 0;
    var delay = 0;
    var NvVVv = VMvvn;
    var vVw = 0;
    var wwNNN = 0;
    var NMmmW = 0;
    var nnvmV = 0;
    var getServList = "";
    var dat = 0;
    var nwmmM = 0;
    var timeoutnb = 0;
    var nVMNw = 0;
    var wVmvv = 0;
    var wVmvW = 0;
    var MmnWW = 0;
    var MouseAngle = Mouse.angle;
    var nmVmM = 0;
    var onMessageJSON = window.undefined;
    var onMessageRaw = window.undefined;
    var nnwwV = window.undefined;

    function init(nmnVn, NWNnv, vVVWm, NvwVV, mWnNN, NwvVN, MnmWV, Wnmwv, WvnMM) {
        //getServList = (wwwWN !== window.undefined) ? wwwWN : "json/servers.json";
        dat = (nmnVn !== window.undefined) ? nmnVn : 0;
        nwmmM = (NWNnv !== window.undefined) ? NWNnv : 15000;
        nVMNw = (NvwVV !== window.undefined) ? NvwVV : 3;
        wwNNN = (mWnNN !== window.undefined) ? mWnNN : 20000;
        windowFocusDelay = (NwvVN !== window.undefined) ? NwvVN : 10000;
        onMessageRaw = (MnmWV !== window.undefined) ? MnmWV : (function() {});
        onMessageJSON = (Wnmwv !== window.undefined) ? Wnmwv : (function() {});
        nnwwV = (WvnMM !== window.undefined) ? WvnMM : (function() {});
        timeoutnb = (vVVWm !== window.undefined) ? vVVWm : 2000;
        nmVmM = previousTimestamp;
        var serverversion = localStorage2.getItem("serverVersion");
        if ((localStorage2.getItem("token") === null) || (serverversion !== ("" + dat)))
            localStorage2.setItem("token", chngtoken());
        localStorage2.setItem("serverVersion", dat);
    };

    function WmMnn() {
        if (((Client.state & State.__CONNECTED__) === 0) || ((Client.state & State.__CONNECTION_LOST__) > 0))
            return;
        Client.state = State.__CONNECTION_LOST__;
        socket.close();
        checkConnection();
    };

    function WNmnv() {
        if (delta > windowFocusDelay)
            delay = previousTimestamp;
        if ((previousTimestamp - delay) > nwmmM) {
            delay = previousTimestamp;
            WmMnn();
        }
    };

    function onOtherDie() {
        window.clearTimeout(cannotJoinServerHandler);
    };

    function checkConnection(rivetToken) {
        isconnected = 0;
        Client.state = State.__PENDING__ + (Client.state & (State.__CONNECTION_LOST__ | State.__FULL__));
        completeConnection(rivetToken);
    };

    function startConnection(nickname, skin, rivetToken) {
        if (((Client.state & State.__PENDING__) === 0) && ((Client.state & State.__CONNECTED__) === 0)) {
            localStorage2.setItem("nickname", nickname);
            localStorage2.setItem("skin", skin);
            checkConnection(rivetToken);
        }
    };

    function mnnMw() {
        isconnected++;
        socket.close();
        if (isconnected >= nVMNw) {
            Client.state = State.__ATTEMPTS_LIMIT_EXCEEDED__ + (Client.state & State.__CONNECTION_LOST__);
            if ((Client.state & State.__CONNECTION_LOST__) > 0)
                onError();
        } else
            completeConnection();
    };

    function sendPacket(NwnNM) {
        vVw = previousTimestamp;
        socket.send(NwnNM);
    };

    function MNVNn() {
        if ((previousTimestamp - vVw) > wwNNN) {
            socket.send(string0);
            vVw = previousTimestamp;
        }
    };

    function sendChatMessage(message) {
        if ((previousTimestamp - wVmvv) > wVmvW) {
            vVw = previousTimestamp;
            socket.send(window.JSON.stringify([1, message]));
            return 0;
        }
        return wVmvW - (previousTimestamp - wVmvv);
    };

    function sendWSmsg(ss) {
        socket.send(ss);

    };

    function sendAfk() {
            var i = 1;

            function myLoop() {
                setTimeout(function() {
                    socket.send(0);
                    i++;
                    if (i < 99999999999999999999) {
                        myLoop();
                    }
                }, 20000)
            }
            myLoop();
    };

    function newToken() {
        localStorage2.setItem("tokenId", 0);
        localStorage2.setItem("userId", 1);
        completeConnection();
    };


    function sendMouseAngle() {
            if ((previousTimestamp - nmVmM) > MMvMv) {
                var rotation = (((((Mouse.angle - MouseAngle) * 180) / window.Math.PI) % 360) + 360) % 360;
                if (rotation > 2) {
                    vVw = previousTimestamp;
                    nmVmM = previousTimestamp;
                    MouseAngle = Mouse.angle;
                    rotation = window.Math.floor(((((Mouse.angle * 180) / window.Math.PI) % 360) + 360) % 360);
                    socket.send(window.JSON.stringify([6, rotation]));
                }
            }
    };

    function sendFastMouseAngle() {
            if ((previousTimestamp - nmVmM) > mvNWn) {
                var rotation = (((((Mouse.angle - MouseAngle) * 180) / window.Math.PI) % 360) + 360) % 360;
                if (rotation > 2) {
                    vVw = previousTimestamp;
                    nmVmM = previousTimestamp;
                    MouseAngle = Mouse.angle;
                    rotation = window.Math.floor(((((Mouse.angle * 180) / window.Math.PI) % 360) + 360) % 360);
                    socket.send(window.JSON.stringify([6, rotation]));
                }
            }
    };

    function sendShift() {
        var shift = Keyboard.isShift();
        if (shift !== nnvmV) {
            vVw = previousTimestamp;
            window.console.log("sendShift", shift);
            nnvmV = shift;
            socket.send(window.JSON.stringify([7, shift]));
        }
    };

    function sendMouseRightLeft() {
        if (Mouse.x >= canw2ns) {
            if (MmnWW !== RIGHT) {
                vVw = previousTimestamp;
                MmnWW = RIGHT;
                socket.send(window.JSON.stringify([3, RIGHT]));
            }
        } else {
            if (MmnWW !== LEFT) {
                vVw = previousTimestamp;
                MmnWW = LEFT;
                socket.send(window.JSON.stringify([3, LEFT]));
            }
        }
    };

    function sendMouseDown() {
        vVw = previousTimestamp;
        socket.send(window.JSON.stringify([4]));
    };

    function sendMouseUp() {
        vVw = previousTimestamp;
        socket.send(window.JSON.stringify([5]));
    };

    function sendMove() {
        var move = 0;
        if (Keyboard.isLeft()   === 1)      move |= 1;  
        if (Keyboard.isRight()  === 1)      move |= 2;
        if (Keyboard.isBottom() === 1)      move |= 4;
        if (Keyboard.isTop()    === 1)      move |= 8;
        if (NMmmW !== move) {
            vVw = previousTimestamp;
            NMmmW = move;
            socket.send(window.JSON.stringify([2, move]));
        }
    };

    function completeConnection(rivetToken) {
        var ip = Client.connectedLobby['ports']['default']['hostname'];
        var port = Client.connectedLobby['ports']['default']['port'];
        var NnnNv = Client.connectedLobby['ports']['default']['is_tls'] ? 1 : 0;
        socket = new window.WebSocket("ws" + (NnnNv === 1 ? "s" : "") + "://" + ip + ":" + port + '/?token=' + rivetToken);

        Nvwnv++;
        socket.currentId = Nvwnv;
        var currentId = Nvwnv;


        socket.binaryType = "arraybuffer";
        socket.onerror = function() {
            if (this.currentId !== Nvwnv)
                return;
            WmMnn();
        };
        socket.onclose = function(event) {
            if (this.currentId !== Nvwnv)
                return;
            WmMnn();
        };
        socket.onmessage = function(event, vnWMw) {
            if (this.currentId !== Nvwnv)
                return;

            delay = previousTimestamp;
            if (typeof event.data === 'string')
                onMessageJSON(window.JSON.parse(event.data));
            else {
                onMessageRaw(event.data);
                }
        };
        
        socket.onopen = function(event) {
            MmnWW = -1;
            vVw = previousTimestamp;
            onOtherDie();
            socket.send(window.JSON.stringify(onFirstMessage(dat)));
            cannotJoinServerHandler = window.setTimeout(function() {
                if (currentId !== Nvwnv)
                    return;
                mnnMw();
            }, timeoutnb);
        };
        cannotJoinServerHandler = window.setTimeout(function() {
            if (currentId !== Nvwnv)
                return;
            mnnMw();
        }, timeoutnb);
    };

    function full() {
        Client.state |= Client.State.__FULL__;
    };

    function muted(delay) {
        wVmvv = previousTimestamp;
        wVmvW = delay * 60000;
    };

    function stolenSession() {
        Client.state = State.__STOLEN_SESSION__;
        onError();
    };

    function kickedInactivity() {
        Client.state = State.__KICKED_INACTIVITY__;
        onError();
    };

    function closeClient() {
        Client.state = State.__CLOSED__;
        onError();
    };

    function failRestore() {
        onOtherDie();
        Client.state = State.__FAIL_RESTORE__;
        onError();
    };

    function handshake() {
        onOtherDie();
        Client.state = Client.State.__CONNECTED__;
        if (Client.onOpen !== null)
            Client.onOpen();
    };

    function badServerVersion(serverversion) {
        if (serverversion > dat)
            Client.state = State.__OLD_CLIENT_VERSION__;
        else if (serverversion < dat)
            Client.state = State.__OLD_SERVER_VERSION__;
        onOtherDie();
    };

    function getServerList(_srv) {

        var lobbyList = 'https://matchmaker.api.rivet.gg/v1/lobbies/list';
    
        let header = {'Accept': 'application/json'};
    
        window.RIVET_TOKEN && (header['Authorization'] = 'Bearer' + window.RIVET_TOKEN),
    
        fetch(lobbyList, { 
            headers: header 
        })
        .then(_list=>{
            if (_list['ok'])
                return _list.json();
            else
                throw 'Failed to list lobbies: ' + _list['status'];
        })
        .then(_lobb=>{
            Client.serverList = _lobb['lobbies']['map'](_reg=>{
                let _nam = _lobb.regions.find(id=>id['region_id'] == _reg['region_id'])
                  , nam = _nam ? _nam['region_display_name'] : '?';
                return [_reg['lobby_id'], '', '', 1, nam, _reg['total_player_count'], _reg['game_mode_id']];
            }
            ),
            _srv();
        }
        );
    }

    function chngtoken() {
        var token = "";
        for (var i = 0; i < 20; i++) {
            token += window.String.fromCharCode(48 + window.Math.floor(window.Math.random() * 74));
        }
        return token;
    };

    function update() {
        if (Client.state === Client.State.__CONNECTED__) {
            WNmnv();
            MNVNn();
        }
    };

    function onError() {
        if (Client.onError !== null) {
            var StWSstate = Client.state;
            Client.state = 0;
            Client.onError(StWSstate);
        }
    };
    
    return {
        state:              0,
        State:              State,
        serverList:         window.undefined,
        selectedServer:     0,
        init:               init,
        startConnection:    startConnection,
        getServerList:      getServerList,
        full:               full,
        handshake:          handshake,
        badServerVersion:   badServerVersion,
        failRestore:        failRestore,
        kickedInactivity:   kickedInactivity,
        stolenSession:      stolenSession,
        muted:              muted,
        closeClient:        closeClient,
        sendChatMessage:    sendChatMessage,

        // not official \/
        sendWSmsg:        sendWSmsg,
        sendAfk:          sendAfk,
        newToken:         newToken,
        // not official /\

        sendPacket:         sendPacket,
        sendMove:           sendMove,
        sendMouseAngle:     sendMouseAngle,
        sendFastMouseAngle: sendFastMouseAngle,
        sendMouseRightLeft: sendMouseRightLeft,
        sendMouseDown:      sendMouseDown,
        sendMouseUp:        sendMouseUp,
        sendShift:          sendShift,
        update:             update,
        onError:            null,
        onOpen:             null
    };

})();

var World = (function() {
    var worldWidth = 0;
    var worldHeight = 0;
    var worldX = 0;
    var worldY = 0;
    var NNMVV = 18;
    var NmmnM = 9;
    var Mnnnn = 50;

    function setSizeWorld(worldWidth, worldHeight) {
        worldWidth = worldWidth;
        worldHeight = worldHeight;
        worldX = worldWidth - 1;
        worldY = worldHeight - 1;
    };

    function allocatePlayers(mNWnw) {
        World.playerAlive = -1;
        for (var i = 0; i < World.playerNumber; i++) {
            if (mNWnw[i] !== 0)
                World.playerAlive++;
            World.players[i] = new player(i, mNWnw[i]);
        }
    };

    function player(id, nickname) {

        this.id                 = id;
        this.nickname           = nickname;
        this.tokenId            = 0;
        this.skin               = 0;
        this.ghoul              = 0;
        this.score              = 0;
        this.scoreSimplified    = 0;
        this.team               = -1;
        this.teamUid            = 0;
        this.teamLeader         = 0;
        this.repellent          = 0;
        this.withdrawal         = 0;
        this.notification       = [];
        this.notificationLevel  = [];
        this.notificationDelay  = 0;
        this.textEase           = 0;
        this.text               = [];
        this.textEffect         = [];
        this.textMove           = [];
        this.label              = [];
        this.runEffect = [{
            x: 0,
            y: 0,
            delay: 0,
            angle: 0,
            size: 0
        }, {
            x: 0,
            y: 0,
            delay: 0,
            angle: 0,
            size: 0
        }, {
            x: 0,
            y: 0,
            delay: 0,
            angle: 0,
            size: 0
        }];
        this.cartridges = [{
            type: 0,
            x: 0,
            y: 0,
            delay: 0,
            ax: 0,
            ay: 0
        }, {
            type: 0,
            x: 0,
            y: 0,
            delay: 0,
            ax: 0,
            ay: 0
        }, {
            type: 0,
            x: 0,
            y: 0,
            delay: 0,
            ax: 0,
            ay: 0
        }, {
            type: 0,
            x: 0,
            y: 0,
            delay: 0,
            ax: 0,
            ay: 0
        }];
        this.breath             = 0;
        this.move               = 0;
        this.orientation        = 1;
        this.punch              = 1;
        this.consumable         = -1;
        this.consumableLast     = 0;
        this.leaderboardLabel   = null;
        this.nicknameLabel      = null;
        this.playerIdLabel      = null;
        this.scoreLabel         = null;
        this.locatePlayer       = -1;
        this.frameId            = -1;
        this.x                  = 0;
        this.y                  = 0;
        this.rx                 = 0;
        this.ry                 = 0;
        this.KARMA              = 0;
    };

    function allocateTeam(teams) {
        for (var i = 0; i < NNMVV; i++)
            World.teams[i] = new MmvWv(i, teams[i + 1]);
    };

    function addToTeam(WwnMv, id) {
        if (id === Mnnnn) {
            WwnMv.team = -1;
            return;
        } else if (id > Mnnnn) {
            id -= Mnnnn + 1;
            World.teams[id].leader = WwnMv.id;
            WwnMv.teamLeader = 1;
            if (World.PLAYER.id === WwnMv.id)
                World.PLAYER.teamLeader = 1;
        } else
            WwnMv.teamLeader = 0;
        if (World.PLAYER.id === WwnMv.id)
            World.PLAYER.team = id;
        WwnMv.team = id;
        WwnMv.teamUid = World.teams[id].uid;
    };

    function nextInvitation() {
        PLAYER.teamJoin = 0;
        for (var i = 0; i < PLAYER.teamQueue.length; i++) {
            if (PLAYER.teamQueue[i] !== 0) {
                PLAYER.teamJoin = PLAYER.teamQueue[i];
                PLAYER.teamQueue[i] = 0;
                return;
            }
        }
        PLAYER.teamEffect = 0;
    };

    function deleteTeam(id) {
        var team = World.teams[id];
        team.label          = null;
        team.labelNickname  = null;
        team.uid            = teamUid++;
        team.leader         = 0;
        team.name           = "";
    };
    var teamUid = 0;

    function MmvWv(id, _name) {
        this.id             = id;
        this.name           = _name;
        this.label          = null;
        this.labelNickname  = null;
        this.leader         = 0;
        this.uid            = teamUid++;
    };

    function updatePosition() {
        var len = ENTITIES.length;
        for (var i = 0; i <= len; i++) {
            if ((len !== i) && (ENTITIES[i].move === 0))
                continue;
            var units = Entitie.units[i];
            var border = Entitie.border[i];
            var n = border.border;
            for (var j = 0; j < n; j++)
                moveEntitie(units[border.cycle[j]]);
        }
        if (World.PLAYER.team !== -1) {
            for (var i = 0; i < PLAYER.teamLength; i++) {
                var nmmvN = PLAYER.teamPos[i];
                if (nmmvN.old < 0)
                    continue;
                var wmW = World.players[nmmvN.id];
                wmW.rx = CanvasUtils.lerp(wmW.rx, wmW.x, 0.03);
                wmW.ry = CanvasUtils.lerp(wmW.ry, wmW.y, 0.03);
                nmmvN.old -= delta;
            }
        }
        if (World.PLAYER.badKarmaDelay > 0) {
            var wmW = World.players[World.PLAYER.badKarma];
            wmW.rx = CanvasUtils.lerp(wmW.rx, wmW.x, 0.03);
            wmW.ry = CanvasUtils.lerp(wmW.ry, wmW.y, 0.03);
            World.PLAYER.badKarmaDelay -= delta;
        }
    };

    function moveEntitie(UNIT) {
        wX = UNIT.rx + ((delta * UNIT.speed) * UNIT.angleX);
        wY = UNIT.ry + ((delta * UNIT.speed) * UNIT.angleY);
        if (Math2d.fastDist(UNIT.rx, UNIT.ry, UNIT.nx, UNIT.ny) < Math2d.fastDist(wX, wY, UNIT.rx, UNIT.ry)) {
            UNIT.rx = UNIT.nx;
            UNIT.ry = UNIT.ny;
        } else {
            UNIT.rx = wX;
            UNIT.ry = wY;
        }
        UNIT.x = MathUtils.lerp(UNIT.x, UNIT.rx, UNIT.lerp);
        UNIT.y = MathUtils.lerp(UNIT.y, UNIT.ry, UNIT.lerp);
        UNIT.i = window.Math.max(0, window.Math.min(worldY, window.Math.floor(UNIT.y / Render.__TILE_SIZE__)));
        UNIT.j = window.Math.max(0, window.Math.min(worldX, window.Math.floor(UNIT.x / Render.__TILE_SIZE__)));
        if ((World.PLAYER.id === UNIT.pid) && (UNIT.id === 0))
            UNIT.angle = Mouse.angle;
        else if (UNIT.pid === 0)
            UNIT.angle = MathUtils.lerp(UNIT.angle, UNIT.nangle, UNIT.lerp / 2);
        else
            UNIT.angle = MathUtils.lerp(UNIT.angle, UNIT.nangle, UNIT.lerp * 2);
    };

    function VVnvw(a, M) {
        if ((World.players[a].nickname === 0) && (World.players[M].nickname === 0))
            return 0;
        else if (World.players[a].nickname === 0)
            return World.players[M].score - 1;
        else if (World.players[M].nickname === 0)
            return -1 - World.players[a].score;
        else
            return World.players[M].score - World.players[a].score;
    };

    function sortLeaderboard() {
        window.console.log(World.playerNumber);
        for (var i = 0; i < World.playerNumber; i++)
            World.leaderboard[i] = i;
        World.leaderboard = World.leaderboard.sort(VVnvw).slice(0, 10);
        for (var i = 0; i < World.playerNumber; i++)
            World.newLeaderboard = 1;
    };

    function initLeaderboard(ui16, ui8) {
        for (var i = 0; i < 10; i++) {
            var id = ui8[2 + (i * 4)];
            var score = ui16[2 + (i * 2)];
            var PLAYER = World.players[id];
            PLAYER.score = MathUtils.inflateNumber(score);
            PLAYER.KARMA = ui8[3 + (i * 4)];
            var scoreSimplified = MathUtils.simplifyNumber(PLAYER.score);
            if (scoreSimplified !== PLAYER.scoreSimplified)
                PLAYER.scoreLabel = null;
            PLAYER.scoreSimplified = scoreSimplified;
            World.leaderboard[i] = id;
        }
        World.newLeaderboard = 1;
    };

    function VmmnM() {
        this.current    = 0;
        this.value      = 0;
        this._max       = 0;
        this.speed      = 0;
        this.time       = 0;
        this.maxTime    = 1;
        this.bonus      = 0;
    };

    function nVnwv(Vnv, vW, speedInc, speedDec, decrease) {
        Vnv.current     = vW;
        Vnv.value       = vW;
        Vnv._max        = vW;
        Vnv.speedInc    = speedInc;
        Vnv.speedDec    = speedDec;
        Vnv.decrease    = decrease;
        Vnv.bonus       = 0;
    };

    function initGauges() {
        var WvW = ENTITIES[__ENTITIE_PLAYER__].gauges;
        nVnwv(gauges.life, WvW.life._max, WvW.life.speedInc, WvW.life.speedDec, 0);
        if (PLAYER.ghoul === 0) {
            nVnwv(gauges.food, WvW.food._max, WvW.food.speedInc, WvW.food.speedDec, 1);
            nVnwv(gauges.cold, WvW.cold._max, WvW.cold.speedInc, WvW.cold.speedDec, 0);
            nVnwv(gauges.stamina, WvW.stamina._max, WvW.stamina.speedInc, WvW.stamina.speedDec, -1);
            nVnwv(gauges.rad, WvW.rad._max, WvW.rad.speedInc, WvW.rad.speedDec, 0);
        } else {
            nVnwv(gauges.food, WvW.food._max, WvW.food.speedInc, 0, 1);
            nVnwv(gauges.cold, WvW.cold._max, WvW.cold.speedInc, 0, 0);
            nVnwv(gauges.stamina, WvW.stamina._max, WvW.stamina.speedInc * 2, WvW.stamina.speedDec / 2, -1);
            nVnwv(gauges.rad, WvW.rad._max, WvW.rad.speedInc, 0, 0);
        }
        nVnwv(gauges.xp, 255, 0, 0, 0);
        gauges.xp.value = 0;
        gauges.xp.current = 0;
        PLAYER.nextLevel = __XP_START__;
        if (day === NwVWM)
            gauges.cold.decrease = 1;
    };

    function nMmNW(Vnv) {
        if (Vnv.decrease === 1)
            Vnv.value = window.Math.min(Vnv._max, window.Math.max(Vnv.value - (delta * (Vnv.speedDec - Vnv.bonus)), 0));
        else if (Vnv.decrease === -1)
            Vnv.value = window.Math.min(Vnv.value + (delta * (Vnv.speedInc + Vnv.bonus)), Vnv._max);
        Vnv.current = MathUtils.lerp(Vnv.current, Vnv.value, 0.1);
    };

    function updateGauges() {
        nMmNW(gauges.life);
        nMmNW(gauges.food);
        nMmNW(gauges.cold);
        nMmNW(gauges.rad);
        nMmNW(gauges.stamina);
        nMmNW(gauges.xp);
        World.PLAYER.VWMmM += delta;
        if (gauges.rad.current > 254)
            AudioManager.geiger = 0;
        else
            AudioManager.geiger = window.Math.min(1, window.Math.max(0, 1 - (gauges.rad.current / 255)));
        vNvmW();
    };
    var gauges = {
        life: new VmmnM,
        food: new VmmnM,
        cold: new VmmnM,
        rad: new VmmnM,
        stamina: new VmmnM,
        xp: new VmmnM
    };
    var NwVWM = 1;
    var __DAY__ = 0;
    var day = __DAY__;
    var wVnVV = 0;

    function changeDayCycle() {
        var mWN;
        mWN = INVENTORY2;
        INVENTORY2 = INVENTORY;
        INVENTORY = mWN;
        mWN = PARTICLES2;
        PARTICLES2 = PARTICLES;
        PARTICLES = mWN;
        mWN = LOOT2;
        LOOT2 = LOOT;
        LOOT = mWN;
        mWN = RESOURCES2;
        RESOURCES2 = RESOURCES;
        RESOURCES = mWN;
        mWN = ENTITIES2;
        ENTITIES2 = ENTITIES;
        ENTITIES = mWN;
        mWN = LIGHTFIRE2;
        LIGHTFIRE2 = LIGHTFIRE;
        LIGHTFIRE = mWN;
        mWN = GROUND2;
        GROUND2 = GROUND;
        GROUND = mWN;
        mWN = AI2;
        AI2 = AI;
        AI = mWN;
        day = (day + 1) % 2;
        World.day = day;
        if (day === 0) {
            window.document.getElementById("bod").style.backgroundColor = "#3D5942";
            canvas.style.backgroundColor = "#3D5942";
        } else {
            window.document.getElementById("bod").style.backgroundColor = "#0B2129";
            canvas.style.backgroundColor = "#0B2129";
        }
        wVnVV = 0;
    };

    function setDayCycle(cycle, MVNvn) {
        if (cycle !== day)
            World.transition = 1000;
        World.day = day;
        wVnVV = MVNvn;
    };

    function initDayCycle(cycle, MVNvn) {
        if (cycle !== day)
            changeDayCycle();
        World.day = day;
        wVnVV = MVNvn;
    };

    function updateHour() {
        wVnVV += delta;
        return (wVnVV % World.__DAY__) + (day * 10000000);
    };

    function selectRecipe(id) {
        var len = 0;
        var item = INVENTORY[id];
        Game.preview.setImages(item.itemButton.src, item.itemButton.img);
        var MWVwN = item.detail.recipe;
        var canvasZ = item.detail.area;
        var recipe = Game.recipe;
        var tools = Game.tools;
        var recipeList = PLAYER.recipeList;
        PLAYER.craftSelected = id;
        if (canvasZ !== window.undefined) {
            for (var i = 0; i < canvasZ.length; i++) {
                var tool = AREASTOITEM[canvasZ[i]];
                if (tool !== window.undefined) {
                    item = INVENTORY[tool];
                    tools[len].setImages(item.itemButton.src, item.itemButton.img);
                    len++;
                }
            }
        }
        PLAYER.toolsLen = len;
        len = 0;
        if (MWVwN !== window.undefined) {
            for (i = 0; i < MWVwN.length; i++) {
                item = INVENTORY[MWVwN[i][0]];
                recipe[len].setImages(item.itemButton.src, item.itemButton.img);
                recipeList[len] = item.id;
                len++;
            }
        }
        PLAYER.recipeLen = len;
        MMMWN(MWVwN);
    };

    function _CheckSkillState(id, NW) {
        if ((PLAYER.skillUnlocked[id] === 1) || (NW.level === -1))
            return 2;
        else if (((NW.level > PLAYER.level) || (PLAYER.skillPoint < NW.price)) || ((NW.previous !== -1) && (PLAYER.skillUnlocked[NW.previous] === window.undefined)))
            return 0;
        return 1;
    };

    function MMMWN(recipe) {
        var MvmWv = PLAYER.recipeAvailable;
        var invtr = PLAYER.inventory;
        var mNmnm = 1;
        if (recipe === window.undefined)
            return mNmnm;
        for (var i = 0; i < recipe.length; i++) {
            var VWVMW = recipe[i];
            for (var j = 0; j < invtr.length; j++) {
                var IID = invtr[j];
                if (IID[0] === VWVMW[0]) {
                    if (IID[1] >= VWVMW[1]) {
                        MvmWv[i] = VWVMW[1];
                        break;
                    } else
                        MvmWv[i] = -VWVMW[1];
                }
            }
            if (j === invtr.length) {
                MvmWv[i] = -VWVMW[1];
                mNmnm = 0;
            }
        }
        return mNmnm;
    };

    function releaseBuilding() {
        if ((World.PLAYER.isInBuilding === 1) || (World.PLAYER.isInChest === 1)) {
            World.PLAYER.isInBuilding = 0;
            World.PLAYER.isInChest = 0;
            Client.sendPacket("[17]");
        }
    };

    function buildSkillList(category) {
        World.releaseBuilding();
        var receipe = 0;
        var selected = 0;
        var len = 0;
        var craft = PLAYER.craftList;
        var craftList = Game.craft;
        var craftAvailable = PLAYER.craftAvailable;
        for (var i = 1; i < INVENTORY.length; i++) {
            var item = INVENTORY[i];
            if (item.detail.category === category) {
                if (receipe === 0) {
                    receipe = i;
                    selected = len;
                }
                craftList[len].setImages(item.itemButton.src, item.itemButton.img);
                craft[len] = i;
                craftAvailable[len] = _CheckSkillState(i, item.detail);
                len++;
            }
        }
        PLAYER.craftLen = len;
        PLAYER.craftArea = -1;
        PLAYER.craftCategory = category;
        PLAYER.craftIdSelected = selected;
        selectRecipe(receipe);
    };

    function buildCraftList(area) {
        if (area === AREAS.__PLAYER__) {
            World.releaseBuilding();
            PLAYER.building.fuel = -1;
        }
        var receipe = 0;
        var selected = 0;
        var previous = World.PLAYER.craftSelected;
        var len = 0;
        var craft = PLAYER.craftList;
        var craftAvailable = PLAYER.craftAvailable;
        var craftList = Game.craft;
        for (var i = 1; i < INVENTORY.length; i++) {
            var item = INVENTORY[i];
            var NW = item.detail;
            if (((NW.area !== window.undefined) && (NW.area.indexOf(area) !== -1)) && ((NW.level === -1) || (PLAYER.skillUnlocked[item.id] === 1))) {
                if ((receipe === 0) || (previous === i)) {
                    receipe = i;
                    selected = len;
                }
                craftList[len].setImages(item.itemButton.src, item.itemButton.img);
                craft[len] = i;
                craftAvailable[len] = MMMWN(NW.recipe);
                len++;
            }
        }
        PLAYER.craftLen = len;
        PLAYER.craftArea = area;
        PLAYER.craftCategory = -1;
        PLAYER.craftIdSelected = selected;
        if (receipe > 0)
            selectRecipe(receipe);
    };
    __XP_START__ = 900;
    __XP_SPEED__ = 1.105;

    function getXpFromLevel(level) {
        var xp = __XP_START__;
        for (var i = 0; i < level; i++)
            xp = window.Math.floor(xp * __XP_SPEED__);
        return xp;
    };

    function vNvmW() {
        if ((PLAYER.xp > 0) && (window.Math.abs(gauges.xp.current - gauges.xp.value) < 0.6)) {
            if (gauges.xp.value === 255) {
                gauges.xp.current = 0;
                gauges.xp.value = 0;
                PLAYER.level++;
                PLAYER.skillPoint++;
                if ((Game.getSkillBoxState() === 1) && (PLAYER.craftCategory !== -1))
                    buildSkillList(PLAYER.craftCategory);
                AudioUtils.playFx(AudioUtils._fx.levelup, 1, 0);
                return;
            }
            if (PLAYER.xp >= PLAYER.nextLevel) {
                gauges.xp.value     = 255;
                PLAYER.xp           -= PLAYER.nextLevel;
                PLAYER.nextLevel    = window.Math.floor(PLAYER.nextLevel * __XP_SPEED__);
            } else
                gauges.xp.value = window.Math.floor((255 * PLAYER.xp) / PLAYER.nextLevel);
        }
    };

    var PLAYER = {
        id:                 0,
        x:                  0,
        y:                  0,
        _i:                 0,
        _j:                 0,
        score:              0,
        lastScore:          -1,
        inLeaderboard:      0,
        scoreLabel:         null,
        click:              0,
        inventory:          [],
        recipeLen:          0,
        toolsLen:           0,
        toolsList:          0,
        craftLen:           0,
        isInBuilding:       0,
        isInChest:          0,
        craftArea:          -1,
        craftCategory:      -1,
        craftSelected:      -1,
        craftIdSelected:    -1,
        skillUnlocked:      [],
        level:              0,
        kill:               0,
        xp:                 0,
        nextLevel:          0,
        skillPoint:         0,
        recipeList:         [],
        craftList:          [],
        craftAvailable:     [],
        recipeAvailable:    [],
        crafting:           0,
        craftingMax:        0,
        drag: {
            begin: 0,
            x: 0,
            y: 0,
            id: 0
        },
        eInteract:          null,
        interaction:        -1,
        interactionDelay:   0,
        interactionWait:    0,
        loot:               -1,
        lootId:             -1,
        extraLoot:          0,
        packetId:           -1,
        buildingArea:       -1,
        buildingId:         -1,
        buildingPid:        -1,
        chest: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        chestLen: 0,
        building: {
            queue: [0, 0, 0, 0],
            pos:        0,
            time:       0,
            timeMax:    0,
            len:        0,
            fuel:       0
        },
        blueprint:      0,
        furniture:      0,
        buildRotate:    0,
        hintRotate:     0,
        grid:           0,
        gridPrev:   [0, 0, 0],
        iGrid:          0,
        jGrid:          0,
        iGridPrev:  [0, 0, 0],
        jGridPrev:  [0, 0, 0],
        isBuilding:     0,
        iBuild:         0,
        jBuild:         0,
        canBuild:       0,
        warm:           0,
        wrongTool:      0,
        wrongToolTimer: 0,
        teamEffect:     0,
        teamLeader:     0,
        teamLocked:     0,
        teamDelay:      0,
        teamNameValid:  0,
        teamCreateDelay: 0,
        teamQueue:      [0, 0, 0, 0, 0],
        teamJoin:       0,
        teamDelay:      0,
        team:           -1,
        teamPos:        [],
        teamLength:     0,
        KARMA:          0,
        badKarma:       0,
        badKarmaDelay:  0,
        lastAreas:      null,
        nextAreas:      0,
        craftFactor:    1,
        timePlayed:     0,
        toxicMap:       0,
        toxicStep:      0,
        admin:          0,
        ghoul:          0,
        cities:         []
    };

    return {
        __SURVIVAL__:       0,
        __BR__:             1,
        __GHOUL__:          2,
        gameMode:           0,
        leaderboard:        [],
        sortLeaderboard:    sortLeaderboard,
        initLeaderboard:    initLeaderboard,
        setSizeWorld:       setSizeWorld,
        newLeaderboard:     0,
        playerNumber:       0,
        playerAlive:        0,
        allocateTeam:       allocateTeam,
        teams:              [],
        addToTeam:          addToTeam,
        deleteTeam:         deleteTeam,
        nextInvitation:     nextInvitation,
        allocatePlayers:    allocatePlayers,
        players:            [],
        PLAYER:             PLAYER,
        moveEntitie:        moveEntitie,
        updatePosition:     updatePosition,
        gauges:             gauges,
        initGauges:         initGauges,
        updateGauges:       updateGauges,
        changeDayCycle:     changeDayCycle,
        setDayCycle:        setDayCycle,
        initDayCycle:       initDayCycle,
        updateHour:         updateHour,
        __DAY__:            (8 * 60) * 1000,
        day:                0,
        transition:         0,
        buildCraftList:     buildCraftList,
        buildSkillList:     buildSkillList,
        selectRecipe:       selectRecipe,
        releaseBuilding:    releaseBuilding,
        getXpFromLevel:     getXpFromLevel
    };

})();
var Entitie = (function() {
    var MwvWW = 0;
    var units = [];
    var border = [];
    var WVMvm = [];
    var MnMWW = 0;

    function init(WvwVn, maxUnitsMaster, localUnits) {
        Entitie.maxUnitsMaster = (maxUnitsMaster === window.undefined) ? 0 : maxUnitsMaster;
        Entitie.localUnits = (localUnits === window.undefined) ? 0 : localUnits;
        MnMWW = Entitie.localUnits + Entitie.maxUnitsMaster;
        MwvWW = ENTITIES.length;
        var len = ENTITIES.length + 1;
        for (var i = 0; i < len; i++) {
            border[i] = new Border.Border(WvwVn);
            units[i] = [];
            for (var j = 0; j < WvwVn; j++)
                units[i][j] = Entitie.create(i);
        }
    };

    function create(type) {
        return new EntitieClass(type);
    };

    function removeAll() {
        for (var i = 0; i < ENTITIES.length; i++)
            border[i].border = 0;
        WVMvm = [];
    };

    function remove(pid, id, uid, type, nVmNV) {
        var i = 0;
        var mMnVn = (((pid === 0) ? 0 : MnMWW) + (pid * Entitie.unitsPerPlayer)) + id;
        var UNIT = WVMvm[mMnVn];
        if (((UNIT !== window.undefined) && (UNIT.type === type)) && (UNIT.uid === uid))
            WVMvm[mMnVn] = window.undefined;
        var M = border[type];
        var NMwVv = units[type];
        var len = M.border;
        for (i = 0; i < len; i++) {
            var UNIT = NMwVv[M.cycle[i]];
            if (((UNIT.uid === uid) && (UNIT.pid === pid)) && (UNIT.id === id)) {
                Border.fastKillIdentifier(M, i);
                if ((ENTITIES[UNIT.type].remove > 0) && (nVmNV === 1)) {
                    var VWvMW = units[MwvWW][Border.forceNewIdentifier(border[MwvWW])];
                    for (var j in UNIT)
                        VWvMW[j] = UNIT[j];
                    VWvMW.removed = 1;
                }
                return;
            }
        }
    };

    function get(pid, id, uid, type) {
        var mMnVn = (((pid === 0) ? 0 : MnMWW) + (pid * Entitie.unitsPerPlayer)) + id;
        var UNIT = WVMvm[mMnVn];
        if ((UNIT === window.undefined) || (UNIT.uid !== uid)) {
            var wmWnw = Border.forceNewIdentifier(border[type]);
            UNIT = units[type][wmWnw];
            if (UNIT === window.undefined) {
                window.console.log("Memory Warn: new entitie created");
                units[type][wmWnw] = Entitie.create(type);
                UNIT = units[type][wmWnw];
            }
            WVMvm[mMnVn] = UNIT;
            UNIT.update = 0;
            UNIT.removed = 0;
        }
        return UNIT;
    };

    function cleanRemoved() {
        var M = border[MwvWW];
        var NMwVv = units[MwvWW];
        var len = M.border;
        for (i = 0; i < len; i++) {
            var UNIT = NMwVv[M.cycle[i]];
            if (UNIT.removed !== 1) {
                Border.fastKillIdentifier(M, i);
                len--;
                i--;
            }
        }
    };

    function findEntitie(type, pid, id) {
        var NMwVv = units[type];
        var M = border[type];
        var len = M.border;
        for (var i = 0; i < len; i++) {
            var player = NMwVv[M.cycle[i]];
            if ((player.id === id) && (player.pid === pid))
                return player;
        }
        return null;
    };

    return {
        init:           init,
        create:         create,
        get:            get,
        findEntitie:    findEntitie,
        remove:         remove,
        removeAll:      removeAll,
        units:          units,
        border:         border,
        cleanRemoved:   cleanRemoved,
        unitsPerPlayer: 0,
        maxUnitsMaster: 0,
        localUnits:     0
    };

})();

function EntitieClass(type) {

    this.uid        = 0;
    this.pid        = 0;
    this.id         = 0;
    this.type       = type;
    this.subtype    = 0;
    this.angle      = 0;
    this.nangle     = 0;
    this.angleX     = 0;
    this.angleY     = 0;
    this.state      = 0;
    this.extra      = 0;
    this.broke      = 0;
    this.x          = 0;
    this.y          = 0;
    this.rx         = 0;
    this.ry         = 0;
    this.nx         = -1;
    this.ny         = 0;
    this.px         = 0;
    this.py         = 0;
    this.i          = 0;
    this.j          = 0;
    this.speed      = 0;
    this.update     = 0;
    this.removed    = 0;
    this.hit        = 0;
    this.hitMax     = 0;
    this.hurt       = 0;
    this.hurtAngle  = 0;
    this.heal       = 0;
    this.death      = 0;
    this.born       = 0;
    this.breath     = 0;
    this.breath2    = 0;
    this.particles = [];
    this.draw       = null;
    this.lerp       = 0.1;

    for (var i = 0; i < 10; i++)
        this.particles.push({
            c: 0,
            V: 0,
            l: 0,
            m: 0,
            t: 0,
            r: 0
        });
};

function setEntitie(UNIT, pid, uid, id, type, wX, wY, nx, ny, extra, angle, state) {

    UNIT.pid      = pid;
    UNIT.uid      = uid;
    UNIT.id       = id;
    UNIT.nangle   = MathUtils.reduceAngle(UNIT.angle, ((angle * 2) * window.Math.PI) / 255);
    UNIT.state    = state;
    UNIT.nx       = nx;
    UNIT.ny       = ny;
    UNIT.extra    = extra;

    if (UNIT.update === 0) {

        var WvW         = ENTITIES[type];
        UNIT.speed        = WvW.speed;
        UNIT.angle        = UNIT.nangle;
        UNIT.x            = wX;
        UNIT.y            = wY;
        UNIT.z            = WvW.z;
        UNIT.lerp         = WvW.lerp;
        UNIT.rx           = wX;
        UNIT.ry           = wY;
        UNIT.i            = window.Math.floor(wY / Render.__TILE_SIZE__);
        UNIT.j            = window.Math.floor(wX / Render.__TILE_SIZE__);
        UNIT.hit          = 0;
        UNIT.hitMax       = 0;
        UNIT.hurt         = 0;
        UNIT.hurt2        = 0;
        UNIT.hurtAngle    = 0;
        UNIT.heal         = 0;
        UNIT.death        = 0;
        UNIT.breath       = 0;
        UNIT.breath2      = 0;
        UNIT.born         = 0;
        UNIT.broke        = 0;
        UNIT.subtype      = 0;
        UNIT.draw         = null;

        var init = WvW.init;

        if (init !== window.undefined)
            init(UNIT);

    }
    var angle = Math2d.angle(UNIT.rx, UNIT.ry, nx, ny);
    UNIT.angleX = window.Math.cos(angle);
    UNIT.angleY = window.Math.sin(angle);
    UNIT.update = 1;
};

Entitie.init(600, 30000, 5000);
Client.init(30, 15000, 2000, 3, 60000, 10000, onMessageRaw, onMessageJSON, onFirstMessage);

function waitHTMLAndRun() {
    htmlLoaded = ((((((((true && (window.document.getElementById("nickname") !== null)) && (window.document.getElementById("terms") !== null)) && (window.document.getElementById("serverList") !== null)) && (window.document.getElementById("changelog") !== null)) && (window.document.getElementById("howtoplay") !== null)) && (window.document.getElementById("featuredVideo") !== null)) && (window.document.getElementById("trevda") !== null)) && (window.document.getElementById("preroll") !== null)) && (window.document.getElementById("chat") !== null);
    if (htmlLoaded === true) {
        Loader.init();
        Home.init();
        Game.init();
        Score.init();
        Rank.init();
        Editor.init();
        CanvasUtils.initAnimatedCanvas(Loader, __RESIZE_METHOD_SCALE__, "can", "bod", 1280, window.undefined, true);
        Loader.run();
    } else window.setTimeout(waitHTMLAndRun, 100);
};

window.onbeforeunload = function() {
    if (Client.state & Client.State.__CONNECTED__) return "Are you sure you want quit?";
};
waitHTMLAndRun();

//var noDebug = window.console;
//noDebug.log = noDebug.info = noDebug.error = noDebug.warn = noDebug.debug = noDebug.NWVnW = noDebug.trace = noDebug.time = noDebug.timeEnd = function() {};