export function getOption(options) {
    Array.apply(this, Array.prototype.slice.call(arguments, 1)).forEach(arg => {
        options = options[arg]
    });
    return options;
}

export const optionSettings = (data) => {
    let settings = {
        combat_options: [],
        battle_options: [],
        throw_charge: {},
        buddy_friendship: {},
        trainer_friendship: {}
    };

    data.forEach(item => {
        if (item.templateId === "COMBAT_SETTINGS") {
            settings.combat_options = {}
            settings.combat_options.stab = item.data.combatSettings.sameTypeAttackBonusMultiplier
            settings.combat_options.shadow_bonus = {}
            settings.combat_options.shadow_bonus.atk = item.data.combatSettings.shadowPokemonAttackBonusMultiplier
            settings.combat_options.shadow_bonus.def = item.data.combatSettings.shadowPokemonDefenseBonusMultiplier

            settings.throw_charge.normal = item.data.combatSettings.chargeScoreBase
            settings.throw_charge.nice = item.data.combatSettings.chargeScoreNice
            settings.throw_charge.great = item.data.combatSettings.chargeScoreGreat
            settings.throw_charge.excellent = item.data.combatSettings.chargeScoreExcellent
        }
        else if (item.templateId === "BATTLE_SETTINGS") {
            settings.battle_options = {}
            settings.battle_options.enemyAttackInterval = item.data.battleSettings.enemyAttackInterval
            settings.battle_options.stab = item.data.battleSettings.sameTypeAttackBonusMultiplier
            settings.battle_options.shadow_bonus = {}
            settings.battle_options.shadow_bonus.atk = item.data.battleSettings.shadowPokemonAttackBonusMultiplier
            settings.battle_options.shadow_bonus.def = item.data.battleSettings.shadowPokemonDefenseBonusMultiplier
        }
        else if (item.templateId.includes("BUDDY_LEVEL_")) {
            const level = parseInt(item.templateId.replace("BUDDY_LEVEL_", ""))
            settings.buddy_friendship[level] = {}
            settings.buddy_friendship[level].level = level
            settings.buddy_friendship[level].minNonCumulativePointsRequired = item.data.buddyLevelSettings.minNonCumulativePointsRequired ?? 0
            settings.buddy_friendship[level].unlockedTrading = item.data.buddyLevelSettings.unlockedTraits
        }
        else if (item.templateId.includes("FRIENDSHIP_LEVEL_")) {
            const level = parseInt(item.templateId.replace("FRIENDSHIP_LEVEL_", ""))
            settings.trainer_friendship[level] = {}
            settings.trainer_friendship[level].level = level
            settings.trainer_friendship[level].atk_bonus = item.data.friendshipMilestoneSettings.attackBonusPercentage
            settings.trainer_friendship[level].unlockedTrading = item.data.friendshipMilestoneSettings.unlockedTrading
        }
    })
    return settings;
}

export const optionPokeImg = (data) => {
    return data.tree.filter(item =>
        item.path.includes("Images/Pokemon/")
    ).map(item => item.path.replace("Images/Pokemon/", "").replace(".png", ""))
}

export const optionPokeSound = (data) => {
    return data.tree.filter(item =>
        item.path.includes("Sounds/Pokemon Cries/")
    ).map(item => item.path.replace("Sounds/Pokemon Cries/", "").replace(".wav", ""))
}

export const optionPokemon = (data) => {
    return data.filter(item =>
        item.templateId.includes("POKEMON") &&
        Object.keys(item.data).includes("pokemonSettings")
    ).map(item => {
        const name = item.data.pokemonSettings.form ?? item.data.pokemonSettings.pokemonId;
        return {
            ...item.data.pokemonSettings,
            id: parseInt(item.templateId.split("_")[0].replace("V", "")),
            name: name
        };
    });
}

export const optionformSpecial = (data) => {
    return data.filter(item =>
        item.templateId.includes("POKEMON") &&
        item.templateId.includes("FORMS") &&
        Object.keys(item.data).includes("formSettings") &&
        item.data.formSettings.forms
    ).map(item => item.data.formSettings.forms)
    .reduce((prev, curr) => [...prev, ...curr], [])
    .filter(item => { return item.assetBundleSuffix || item.isCostume ||
        (item.form &&
        (item.form.includes("NORMAL") || (!item.form.includes("UNOWN") && item.form.split("_")[item.form.split("_").length-1] === "S")))})
    .map(item => item.form);
}

export const optionPokemonFamily = (pokemon) => {
    return Array.from(new Set(pokemon.map(item => item.pokemonId)));
}

export const optionEvolution = (data, pokemon, formSpecial) => {

    const evolutionModel = () => {
        return {
            id: 0,
            name: "",
            evo_list: [],
            mega_evo: [],
            purified: {},
            thirdMove: {},
            form: ""
        }
    }

    return pokemon.filter(item => !formSpecial.includes(item.name))
            .map(item => {
                let result = evolutionModel();
                result.id = item.id;
                result.name = item.name;
                if (item.evolutionBranch) {
                    item.evolutionBranch.forEach(evo => {
                        let dataEvo = {}
                        let name = evo.evolution ?? result.name;
                        if (evo.form) {
                            dataEvo.evo_to_form = evo.form.replace(name+"_", "").replace("NORMAL", "")
                        } else {
                            dataEvo.evo_to_form = ""
                        }
                        dataEvo.evo_to_id = pokemon.find(poke => poke.name === name).id;
                        dataEvo.evo_to_name = name.replace("_NORMAL", "")
                        if (evo.candyCost) dataEvo.candyCost = evo.candyCost;
                        dataEvo.quest = {};
                        if (evo.genderRequirement) dataEvo.quest.genderRequirement = evo.genderRequirement;
                        if (evo.kmBuddyDistanceRequirement) dataEvo.quest.kmBuddyDistanceRequirement = evo.kmBuddyDistanceRequirement;
                        if (evo.mustBeBuddy) dataEvo.quest.mustBeBuddy = evo.mustBeBuddy;
                        if (evo.onlyDaytime) dataEvo.quest.onlyDaytime = evo.onlyDaytime;
                        if (evo.onlyNighttime) dataEvo.quest.onlyNighttime = evo.onlyNighttime;
                        if (evo.lureItemRequirement) {
                            if (evo.lureItemRequirement === "ITEM_TROY_DISK_MAGNETIC") item = "magnetic";
                            else if (evo.lureItemRequirement === "ITEM_TROY_DISK_MOSSY") item = "moss";
                            else if (evo.lureItemRequirement === "ITEM_TROY_DISK_GLACIAL") item = "glacial";
                            else if (evo.lureItemRequirement === "ITEM_TROY_DISK_RAINY") item = "rainy";
                            dataEvo.quest.lureItemRequirement = item;
                        }
                        if (evo.evolutionItemRequirement) {
                            if (evo.evolutionItemRequirement === "ITEM_SUN_STONE") item = "Sun_Stone";
                            else if (evo.evolutionItemRequirement === "ITEM_KINGS_ROCK") item = "King's_Rock";
                            else if (evo.evolutionItemRequirement === "ITEM_METAL_COAT") item = "Metal_Coat";
                            else if (evo.evolutionItemRequirement === "ITEM_GEN4_EVOLUTION_STONE") item = "Sinnoh_Stone";
                            else if (evo.evolutionItemRequirement === "ITEM_DRAGON_SCALE") item = "Dragon_Scale";
                            else if (evo.evolutionItemRequirement === "ITEM_UP_GRADE") item = "Up-Grade";
                            else if (evo.evolutionItemRequirement === "ITEM_GEN5_EVOLUTION_STONE") item = "Unova_Stone";
                            dataEvo.quest.evolutionItemRequirement = item;
                        }
                        if (evo.onlyUpsideDown) dataEvo.quest.onlyUpsideDown = evo.onlyUpsideDown;
                        if (evo.questDisplay) {
                            const questDisplay = evo.questDisplay[0].questRequirementTemplateId;
                            const template = data.find(template => template.templateId === questDisplay);
                            dataEvo.quest.condition = null;
                            try {
                                const condition = template.data.evolutionQuestTemplate.goals[0].condition[0]
                                dataEvo.quest.condition = {}
                                dataEvo.quest.condition.desc = condition.type.replace("WITH_", "")
                                if (condition.withPokemonType) {
                                    dataEvo.quest.condition.pokemonType = condition.withPokemonType.pokemonType.map(type => type.split("_")[2])
                                }
                                if (condition.withThrowType) {
                                    dataEvo.quest.condition.throwType = condition.withThrowType.throwType.split("_")[2]
                                }
                            }
                            catch {}
                            dataEvo.quest.goal = template.data.evolutionQuestTemplate.goals[0].target
                            dataEvo.quest.type = template.data.evolutionQuestTemplate.questType.replace("QUEST_", "")
                        } else if (item.evolutionBranch && item.evolutionBranch.length > 1 && Object.keys(dataEvo.quest).length === 0) {
                            if (evo.form) {
								dataEvo.quest.randomEvolution = false
                            } else {
                                dataEvo.quest.randomEvolution = true
                            }
                        }
                        if (evo.temporaryEvolution) {
                            let megaEvo = {}
                            megaEvo.megaEvolutionName = name + evo.temporaryEvolution.split("TEMP_EVOLUTION")[1]
                            megaEvo.firstMegaEvolution = evo.temporaryEvolutionEnergyCost
                            megaEvo.megaEvolution = evo.temporaryEvolutionEnergyCostSubsequent
                            result.mega_evo.push(megaEvo)
                        }
                        if (result.mega_evo.length === 0) { result.evo_list.push(dataEvo) }
                    })
                }
                if (item.shadow) {
                    result.purified.stardust = item.shadow.purificationStardustNeeded
				    result.purified.candy = item.shadow.purificationCandyNeeded
                }
                if (item.thirdMove) {
                    result.thirdMove.stardust = item.thirdMove.stardustToUnlock
				    result.thirdMove.candy = item.thirdMove.candyToUnlock
                }
                if (item.form) {
                    result.form = item.form.replace(item.pokemonId+"_", "");
                    if (result.form === "GALARIAN") result.form = "GALAR"
                    else if (result.form === "HISUIAN") result.form = "HISUI"
                }
                return result;
            })
}

export const optionSticker = (data, pokemon) => {

    const stickerModel = () => {
        return {
            id: "",
            maxCount: 0,
            stickerUrl: null,
            pokemonId: null,
            pokemonName: null,
            shop: false,
            pack: []
        }
    }

    let stickers = [];
    data.forEach(item => {
        if (item.templateId.includes("STICKER_")) {
            if (Object.keys(item.data).includes("iapItemDisplay")) {
                const id = item.data.iapItemDisplay.sku.replace("STICKER_", "");
                const sticker = stickers.find(sticker => sticker.id === id.split(".")[0])
                if (sticker) {
                    sticker.shop = true;
                    sticker.pack.push(parseInt(id.replace(sticker.id+".", "")))
                }
            } else if (Object.keys(item.data).includes("stickerMetadata")) {
                let sticker = stickerModel();
                sticker.id = item.data.stickerMetadata.stickerId.replace("STICKER_", "")
                sticker.maxCount = item.data.stickerMetadata.maxCount ?? 0;
                sticker.stickerUrl = item.data.stickerMetadata.stickerUrl ?? null;
                if (item.data.stickerMetadata.pokemonId) {
                    sticker.pokemonId = pokemon.find(poke => poke.pokemonId === item.data.stickerMetadata.pokemonId).id;
                    sticker.pokemonName = item.data.stickerMetadata.pokemonId
                }
                stickers.push(sticker);
            }
        }
    })
    return stickers;
}

export const optionAssets = (pokemon, family, imgs, sounds) => {

    const assetModel = () => {
        return {
            id: 0,
            name: "",
            image: [],
            sound: {
                cry: []
            }
        }
    }

    return family.map((item, index) => {
        let result = assetModel();
        result.id = pokemon.find(poke => poke.name === item).id;
        result.name = item;

        let formSet = imgs.filter(img => img.includes(`Addressable Assets/pm${result.id}.`));
        let count = 0, mega = false;
        while (formSet.length > count) {
            let form = formSet[count].split("."), shiny = false, gender = 3;
            if (form[1] === "icon" || form[1] === "g2") form = "NORMAL";
            else form = form[1].replace("_NOEVOLVE", "").replace(/[a-z]/g, "");
            if (formSet.includes(formSet[count].replace(".icon", "")+".s.icon")) shiny = true;
            if (!formSet[count].includes(".g2.") && formSet.includes(formSet[count].replace(".icon", "")+".g2.icon")) gender = 1;
            else if (formSet[count].includes(".g2.")) gender = 2;
            if (form.includes("MEGA")) mega = true;
            result.image.push({
                gender: gender,
                pokemonId: result.id,
                form: form,
                default: formSet[count],
                shiny: shiny ? formSet[count+1] : null
            });
            count += shiny ? 2 : 1;
        }

        formSet = imgs.filter(img => !img.includes(`Addressable Assets/`)
        && (img.includes(`pokemon_icon_${result.id.toString().padStart(3, '0')}_51`) || img.includes(`pokemon_icon_${result.id.toString().padStart(3, '0')}_52`)));
        if (!mega) {
            for (let index = 0; index < formSet.length; index += 2) {
                result.image.push({
                    gender: 3,
                    pokemonId: result.id,
                    form: formSet.length === 2 ? "MEGA" : formSet[index].includes("_51") ? "MEGA_X" : "MEGA_Y",
                    default: formSet[index],
                    shiny: formSet[index+1]
                });
            }
        }

        const formList = result.image.map(img => img.form.replaceAll("_", ""));
        formSet = imgs.filter(img => !img.includes(`Addressable Assets/`)
        && img.includes(`pokemon_icon_pm${result.id.toString().padStart(4, '0')}`))
        for (let index = 0; index < formSet.length; index += 2) {
            const subForm = formSet[index].replace("_shiny", "").split("_");
            const form = subForm[subForm.length-1].toUpperCase();
            if (!formList.includes(form)) {
                formList.push(form)
                result.image.push({
                    gender: 3,
                    pokemonId: result.id,
                    form: form,
                    default: formSet[index],
                    shiny: formSet[index+1]
                });
            }
        }

        mega = false
        let soundForm = sounds.filter(sound => sound.includes(`Addressable Assets/pm${result.id}.`));
        result.sound.cry = soundForm.map(sound => {
            let form = sound.split(".");
            if (form[1] === "cry") form = "NORMAL";
            else form = form[1].replace(/[a-z]/g, "");
            if (form.includes("MEGA")) mega = true;
            return {
                form: form,
                path: sound
            }
        });

        soundForm = sounds.filter(sound => !sound.includes(`Addressable Assets/`)
        && (sound.includes(`pv${result.id.toString().padStart(3, '0')}_51`) || sound.includes(`pv${result.id.toString().padStart(3, '0')}_52`)))
        if (!mega) {
            soundForm.forEach(sound => {
                result.sound.cry.push({
                    form: soundForm.length !== 2 ? "MEGA" : sound.includes("_51") ? "MEGA_X" : "MEGA_Y",
                    path: sound
                });
            })
        }
        soundForm = sounds.filter(sound => !sound.includes(`Addressable Assets/`)
        && sound.includes(`pv${result.id.toString().padStart(3, '0')}`))
        if (result.sound.cry.length === 0) {
            soundForm.forEach(sound => {
                result.sound.cry.push({
                    form: sound.includes("_31") ? "SPECIAL" :"NORMAL",
                    path: sound
                });
            })
        }
        return result;
    });

}

export const optionCombat = (data) => {

    const combatModel = () => {
        return {
            name: "",
            type: null,
            type_move: null,
            pvp_power: 0,
            pvp_energy: 0,
            sound: null,
            buffs: [],
            id: 0,
            pve_power: 0,
            pve_energy: 0,
            durationMs: 0,
            damageWindowStartMs: 0,
            damageWindowEndMs: 0,
            accuracyChance: 0,
            criticalChance: 0,
            staminaLossScalar: 0,
            archetype: null
        }
    }

    const moves = data.filter(item => item.templateId[0] === "V" && item.templateId.includes("MOVE"))
    .map(item => {
        return {
            ...item.data.moveSettings,
            id: parseInt(item.templateId.split("_")[0].replace("V", ""))
        }
    });
    const sequence = data.filter(item => item.templateId.includes("sequence_") && item.data.moveSequenceSettings.sequence.find(seq => seq.includes("sfx attacker")))
    .map(item => {
        return {
            id: item.templateId.replace("sequence_", "").toUpperCase(),
            path: item.data.moveSequenceSettings.sequence.find(seq => seq.includes("sfx attacker")).replace("sfx attacker ", "")
        }
    });

    return data.filter(item => item.templateId.includes("COMBAT_V"))
    .map(item => {
        let result = combatModel();
        result.name = item.data.combatMove.uniqueId
		result.type = item.data.combatMove.type.replace("POKEMON_TYPE_", "")
		if (item.templateId.includes("FAST")) result.type_move = "FAST"
		else result.type_move = "CHARGE";
        result.pvp_power = item.data.combatMove.power ?? 0.0;
        result.pvp_energy = item.data.combatMove.energyDelta ?? 0;
        const seq = sequence.find(seq => seq.id === result.name);
        result.sound = seq ? seq.path : null;
        if (item.data.combatMove.buffs) {
            const buffKey = Object.keys(item.data.combatMove.buffs);
            buffKey.forEach(buff => {
                if (buff.includes("AttackStat")) {
                    if (buff.includes("target")) result.buffs.push({type: "atk", target: "target", power: item.data.combatMove.buffs[buff]})
                    else result.buffs.push({type: "atk", target: "attacker", power: item.data.combatMove.buffs[buff]})
                } else if (buff.includes("DefenseStat")) {
                    if (buff.includes("target")) result.buffs.push({type: "def", target: "target", power: item.data.combatMove.buffs[buff]})
                    else result.buffs.push({type: "def", target: "attacker", power: item.data.combatMove.buffs[buff]})
                }
                result.buffs[result.buffs.length-1].buffChance = item.data.combatMove.buffs[buffKey[buffKey.length-1]]
            })
        }
		const move = moves.find(move => move.movementId === result.name);
        result.id = move.id;
        result.name = result.name.replace("_FAST", "");
        result.pve_power = move.power ?? 0.0;
        if (result.name === "STRUGGLE") result.pve_energy = -33;
        else result.pve_energy = move.energyDelta ?? 0;
        result.durationMs = move.durationMs;
        result.damageWindowStartMs = move.damageWindowStartMs;
        result.damageWindowEndMs = move.damageWindowEndMs;
        result.accuracyChance = move.accuracyChance;
        result.criticalChance = move.criticalChance ?? 0;
        result.staminaLossScalar = move.staminaLossScalar ?? 0;
        return result;
    })
}

export const optionPokemonCombat = (data, pokemon, formSpecial) => {

    const combatModel = () => {
        return {
            id: 0,
            name: "",
            baseSpecies: "",
            quickMoves: [],
            cinematicMoves: [],
            shadowMoves: [],
            purifiedMoves: [],
            eliteQuickMoves: [],
            eliteCinematicMoves: []
        }
    }

    return pokemon.filter(item => !formSpecial.includes(item.name)).map(item => {
        let result = combatModel();
        result.id = item.id;
        result.name = item.name;
        result.baseSpecies = item.pokemonId;
        if (result.id === 235) {
            const moves = data.find(item => item.templateId === "SMEARGLE_MOVES_SETTINGS").data.smeargleMovesSettings;
            result.quickMoves = moves.quickMoves.map(move => move.replace("_FAST", ""));
            result.cinematicMoves = moves.cinematicMoves;
        } else {
            result.quickMoves = item.quickMoves ? item.quickMoves.map(move => move.replace("_FAST", "")) : [];
            result.cinematicMoves = item.cinematicMoves;
            result.eliteQuickMoves = item.eliteQuickMove ? item.eliteQuickMove.map(move => move.replace("_FAST", "")) : [];
            result.eliteCinematicMoves = item.eliteCinematicMove ?? [];
            if (item.shadow) {
                result.shadowMoves.push(item.shadow.shadowChargeMove);
                result.purifiedMoves.push(item.shadow.purifiedChargeMove);
            }
        }
        return result;
    })

}

export const optionLeagues = (data, pokemon) => {

    const leagueModel = () => {
        return {
            id: null,
            title: "",
            enabled: false,
            conditions: {},
            iconUrl: null,
            league: ""
        }
    }

    const leagueConditionModel = () => {
        return {
            timestamp: null,
            unique_selected: false,
            unique_type: false,
            max_level: null,
            max_cp: 0,
            whiteList: [],
            banned: []
        }
    }

    const  leagueRewardModel = () => {
        return {
            type: false,
            count: 0,
            step: 0
        }
    }

    const  leagueRewardPokemonModel = () => {
        return {
            guaranteedLimited: false,
            id: null,
            name: "",
            form: ""
        }
    }

    let result = {
        allowLeagues: [],
        data: [],
        season: {}
    }

    result.allowLeagues = data.find(item => item.templateId === "VS_SEEKER_CLIENT_SETTINGS").data.vsSeekerClientSettings.allowedVsSeekerLeagueTemplateId
    .map(item => item.replace("COMBAT_LEAGUE_", "").replace("DEFAULT_", ""))

    result.data = data.filter(item => item.templateId.includes("COMBAT_LEAGUE_") && !item.templateId.includes("SETTINGS"))
    .map(item => {
        let result = leagueModel();
        result.id = item.templateId.replace("COMBAT_LEAGUE_", "").replace("DEFAULT_", "");
        result.title = item.data.combatLeague.title.replace("combat_", "").replace("_title", "").toUpperCase()
        result.enabled = item.data.combatLeague.enabled
        result.conditions = leagueConditionModel();
        item.data.combatLeague.pokemonCondition.forEach(con => {
            if (con.type === "POKEMON_CAUGHT_TIMESTAMP") {
                result.conditions.timestamp = {}
                result.conditions.timestamp.start = con.pokemonCaughtTimestamp.afterTimestamp
                result.conditions.timestamp.end = con.pokemonCaughtTimestamp.beforeTimestamp ?? null;
            }
            if (con.type === "WITH_UNIQUE_POKEMON") {
                result.conditions.unique_selected = true
            }
            if (con.type === "WITH_POKEMON_TYPE") {
                result.conditions.unique_type = con.withPokemonType.pokemonType.map(type => type.replace("POKEMON_TYPE_", ""))
            }
            if (con.type === "POKEMON_LEVEL_RANGE") {
                result.conditions.max_level = con.pokemonLevelRange.maxLevel
            }
            if (con.type === "WITH_POKEMON_CP_LIMIT") {
                result.conditions.max_cp = con.withPokemonCpLimit.maxCp
            }
            if (con.type === "POKEMON_WHITELIST") {
                result.conditions.whiteList = con.pokemonWhiteList.pokemon.map(poke => {
                    let whiteList = {};
                    whiteList.id = pokemon.find(item => item.name === poke.id).id
                    whiteList.name = poke.id
                    whiteList.form = poke.form ? poke.form.replace(whiteList.name+"_", "") : "NORMAL";
                    if (poke.forms && poke.forms.length === 1) whiteList.form = poke.forms[0].replace(whiteList.name+"_", "");
                    return whiteList;
                });
                result.conditions.whiteList = result.conditions.whiteList.sort((a,b) => a.id-b.id);
            }
            result.iconUrl = item.data.combatLeague.iconUrl.replace("https://storage.googleapis.com/prod-public-images/", "").replace("https://prodholoholo-public-images.nianticlabs.com/LeagueIcons/", "")
            result.league = item.data.combatLeague.badgeType.replace("BADGE_", "")
            if (item.data.combatLeague.bannedPokemon) {
                result.conditions.banned = item.data.combatLeague.bannedPokemon.map(poke => {
                    let banList = {};
                    banList.id = pokemon.find(item => item.name === poke).id;
                    banList.name = poke;
                    return banList;
                });
                result.conditions.banned = result.conditions.banned.sort((a,b) => a.id-b.id);
            }
        })
        return result;
    })

    const seasons = data.find(item => item.templateId === "COMBAT_COMPETITIVE_SEASON_SETTINGS").data.combatCompetitiveSeasonSettings.seasonEndTimeTimestamp;
    let rewards = {
        rank: {},
        pokemon: {}
    };
    data.filter(item => item.templateId.includes("VS_SEEKER_LOOT_PER_WIN_SETTINGS_RANK_")).forEach(item => {
        const data = item.data.vsSeekerLoot;
        if (!rewards.rank[data.rankLevel]) {
            rewards.rank[data.rankLevel] = {
                rank: data.rankLevel,
                free: [],
                premium: []
            };
        }
        data.reward.slice(0, 5).forEach((reward, index) => {
            let result = leagueRewardModel();
            result.step = index+1;
            if (reward.pokemonReward) {
                result.type = "pokemon";
                result.count = 1;
            } else if (reward.itemLootTable) {
                result.type = "itemLoot";
                result.count = 1;
            } else if (reward.item) {
                if (reward.item.stardust) {
                    result.type = "stardust";
                } else {
                    result.type = reward.item.item;
                }
                result.count = reward.item.count;
            }
            if (!data.rewardTrack) {
                rewards.rank[data.rankLevel].free.push(result);
            } else {
                rewards.rank[data.rankLevel].premium.push(result);
            }
        });
    });

    data.filter(item => item.templateId.includes("VS_SEEKER_POKEMON_REWARDS_")).forEach(item => {
        const data = item.data.vsSeekerPokemonRewards;
        const track = item.templateId.includes("FREE") ? "FREE" : "PREMIUM";
        data.availablePokemon.forEach(value => {
            if (!rewards.pokemon[value.unlockedAtRank]) {
                rewards.pokemon[value.unlockedAtRank] = {
                    rank: value.unlockedAtRank,
                    free: [],
                    premium: []
                };
            }
            let result = leagueRewardPokemonModel();
            let poke;
            if (value.guaranteedLimitedPokemonReward) {
                result.guaranteedLimited = true;
                poke = value.guaranteedLimitedPokemonReward.pokemon;
            } else {
                poke = value.pokemon;
            }
            result.id = pokemon.find(item => item.name === poke.pokemonId).id
            result.name = poke.pokemonId
            if (poke.pokemonDisplay) result.form = poke.pokemonDisplay.form.replace(poke.pokemonId+"_", "")
            else result.form = "NORMAL";
            if (track === "FREE") {
                rewards.pokemon[value.unlockedAtRank].free.push(result)
            } else {
                rewards.pokemon[value.unlockedAtRank].premium.push(result)
            }
        });
    });

    result.season = {
        season: seasons.length-1,
        timestamp: {
            start: seasons[seasons.length-3],
            end: seasons[seasons.length-2]
        },
        rewards: rewards,
        settings: data.find(item => item.templateId === `COMBAT_RANKING_SETTINGS_S${seasons.length-1}`).data.combatRankingProtoSettings.rankLevel
    }

    return result;
}