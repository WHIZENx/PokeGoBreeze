import { asset } from "./models/asset";
import { combat, combatPokemon } from "./models/combat";
import { evolution } from "./models/evolution";
import { league, leagueData, leagueReward, leagueRewardPokemon } from "./models/league";
import { sticker } from "./models/sticker";
import { details } from "./models/details";

export const getOption = (options: any, args: string[]) => {
    args.forEach((arg: any) => {
        options = options[arg]
    });
    return options;
}

export const optionSettings = (data: any[]) => {
    const settings: any = {
        combat_options: [],
        battle_options: [],
        throw_charge: {},
        buddy_friendship: {},
        trainer_friendship: {}
    };

    data.forEach((item: { templateId: string; data: { combatSettings: { sameTypeAttackBonusMultiplier: any; shadowPokemonAttackBonusMultiplier: any; shadowPokemonDefenseBonusMultiplier: any; chargeScoreBase: any; chargeScoreNice: any; chargeScoreGreat: any; chargeScoreExcellent: any; }; battleSettings: { enemyAttackInterval: any; sameTypeAttackBonusMultiplier: any; shadowPokemonAttackBonusMultiplier: any; shadowPokemonDefenseBonusMultiplier: any; }; buddyLevelSettings: { minNonCumulativePointsRequired: number; unlockedTraits: any; }; friendshipMilestoneSettings: { attackBonusPercentage: any; unlockedTrading: any; }; }; }) => {
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

export const optionPokeImg = (data: { tree: any[]; }) => {
    return data.tree.filter((item: { path: string | string[]; }) =>
        item.path.includes("Images/Pokemon/")
    ).map((item: { path: string; }) => item.path.replace("Images/Pokemon/", "").replace(".png", ""))
}

export const optionPokeSound = (data: { tree: any[]; }) => {
    return data.tree.filter((item: { path: string | string[]; }) =>
        item.path.includes("Sounds/Pokemon Cries/")
    ).map((item: { path: string; }) => item.path.replace("Sounds/Pokemon Cries/", "").replace(".wav", ""))
}

export const optionPokemonSpawn = (data: any[]) => {
    return data.filter((item: any) =>
    item.templateId.includes("SPAWN") &&
        Object.keys(item.data).includes("genderSettings")
    ).map((item: { data: { genderSettings: { gender: any; }; }; templateId: string; }) => {
        return {
            id: parseInt(item.templateId.split("_")[1].replace("V", "")),
            name: item.templateId.split("POKEMON_")[1],
            gender: item.data.genderSettings.gender
        };
    });
}

export const optionPokemon = (data: any[]) => {
    return data.filter((item: any) =>
        item.templateId.includes("POKEMON") &&
        Object.keys(item.data).includes("pokemonSettings")
    ).map((item: { data: { pokemonSettings: { form: any; pokemonId: any; }; }; templateId: string; }) => {
        const name = item.data.pokemonSettings.form ?? item.data.pokemonSettings.pokemonId;
        return {
            ...item.data.pokemonSettings,
            id: parseInt(item.templateId.split("_")[0].replace("V", "")),
            name: name
        };
    });
}

export const optionformSpecial = (data: any[]) => {
    return data.filter((item: { templateId: string | string[]; data: { formSettings?: any; }; }) =>
        item.templateId.includes("POKEMON") &&
        item.templateId.includes("FORMS") &&
        Object.keys(item.data).includes("formSettings") &&
        item.data.formSettings.forms
    ).map((item: { data: { formSettings: { forms: any; }; }; }) => item.data.formSettings.forms)
    .reduce((prev: any, curr: any) => [...prev, ...curr], [])
    .filter((item: { assetBundleSuffix: any; isCostume: any; form: string; }) => { return item.assetBundleSuffix || item.isCostume ||
        (item.form &&
        (item.form.includes("NORMAL") || (!item.form.includes("UNOWN") && item.form.split("_")[item.form.split("_").length-1] === "S")))})
    .map((item: { form: any; }) => item.form);
}

export const optionPokemonFamily = (pokemon: any[]) => {
    return Array.from(new Set(pokemon.map((item: { pokemonId: any; }) => item.pokemonId)));
}

export const optionEvolution = (data: any[], pokemon: any[], formSpecial: string | any[]) => {

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

    return pokemon.filter((item: { name: any; }) => !formSpecial.includes(item.name))
            .map((item: any) => {
                const result: evolution = evolutionModel();
                result.id = item.id;
                result.name = item.name;
                if (item.evolutionBranch) {
                    item.evolutionBranch.forEach((evo: { evolution: string; form: string; candyCost: any; genderRequirement: any; kmBuddyDistanceRequirement: any; mustBeBuddy: any; onlyDaytime: any; onlyNighttime: any; lureItemRequirement: string; evolutionItemRequirement: string; onlyUpsideDown: any; questDisplay: { questRequirementTemplateId: any; }[]; temporaryEvolution: string; temporaryEvolutionEnergyCost: any; temporaryEvolutionEnergyCostSubsequent: any; }) => {
                        const dataEvo: any = {}
                        const name = evo.evolution ?? result.name;
                        if (evo.form) {
                            dataEvo.evo_to_form = evo.form.replace(name+"_", "").replace("NORMAL", "")
                        } else {
                            dataEvo.evo_to_form = ""
                        }
                        dataEvo.evo_to_id = pokemon.find((poke: { name: any; }) => poke.name === name).id;
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
                            const template = data.find((template: { templateId: any; }) => template.templateId === questDisplay);
                            dataEvo.quest.condition = null;
                            try {
                                const condition = template.data.evolutionQuestTemplate.goals[0].condition[0]
                                dataEvo.quest.condition = {}
                                dataEvo.quest.condition.desc = condition.type.replace("WITH_", "")
                                if (condition.withPokemonType) {
                                    dataEvo.quest.condition.pokemonType = condition.withPokemonType.pokemonType.map((type: string) => type.split("_")[2])
                                }
                                if (condition.withThrowType) {
                                    dataEvo.quest.condition.throwType = condition.withThrowType.throwType.split("_")[2]
                                }
                            }
                            // eslint-disable-next-line no-empty
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
                            const megaEvo: any = {}
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

export const optionSticker = (data: any[], pokemon: any[]) => {

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

    const stickers: sticker[] = [];
    data.forEach((item: { templateId: string | string[]; data: { iapItemDisplay?: any; stickerMetadata?: any; }; }) => {
        if (item.templateId.includes("STICKER_")) {
            if (Object.keys(item.data).includes("iapItemDisplay")) {
                const id = item.data.iapItemDisplay.sku.replace("STICKER_", "");
                const sticker: any = stickers.find(sticker => sticker.id === id.split(".")[0])
                if (sticker) {
                    sticker.shop = true;
                    sticker.pack.push(parseInt(id.replace(sticker.id+".", "")))
                }
            } else if (Object.keys(item.data).includes("stickerMetadata")) {
                const sticker: sticker = stickerModel();
                sticker.id = item.data.stickerMetadata.stickerId.replace("STICKER_", "")
                sticker.maxCount = item.data.stickerMetadata.maxCount ?? 0;
                sticker.stickerUrl = item.data.stickerMetadata.stickerUrl ?? null;
                if (item.data.stickerMetadata.pokemonId) {
                    sticker.pokemonId = pokemon.find((poke: { pokemonId: any; }) => poke.pokemonId === item.data.stickerMetadata.pokemonId).id;
                    sticker.pokemonName = item.data.stickerMetadata.pokemonId
                }
                stickers.push(sticker);
            }
        }
    })
    return stickers;
}

export const optionAssets = (pokemon: any[], family: any[], imgs: any[], sounds: any[]) => {

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

    return family.map((item: string) => {
        const result: asset = assetModel();
        result.id = pokemon.find((poke: { name: any; }) => poke.name === item).id;
        result.name = item;

        let formSet = imgs.filter((img: string | string[]) => img.includes(`Addressable Assets/pm${result.id}.`));
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

        formSet = imgs.filter((img: string | string[]) => !img.includes(`Addressable Assets/`)
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

        const formList = result.image.map((img: any) => img.form.replaceAll("_", ""));
        formSet = imgs.filter((img: string | string[]) => !img.includes(`Addressable Assets/`)
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

        if (result.image.length === 0) {
            formSet = imgs.filter((img: string | string[]) => !img.includes(`Addressable Assets/`)
            && img.includes(`pokemon_icon_${result.id.toString().padStart(3, '0')}`))
            for (let index = 0; index < formSet.length; index += 2) {
                const form = "NORMAL";
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
        }

        mega = false
        let soundForm = sounds.filter((sound: string) => sound.includes(`Addressable Assets/pm${result.id}.`));
        result.sound.cry = soundForm.map((sound: string) => {
            let form: any = sound.split(".");
            if (form[1] === "cry") form = "NORMAL";
            else form = form[1].replace(/[a-z]/g, "");
            if (form.includes("MEGA")) mega = true;
            return {
                form: form,
                path: sound
            }
        });

        soundForm = sounds.filter((sound: string | string[]) => !sound.includes(`Addressable Assets/`)
        && (sound.includes(`pv${result.id.toString().padStart(3, '0')}_51`) || sound.includes(`pv${result.id.toString().padStart(3, '0')}_52`)))
        if (!mega) {
            soundForm.forEach((sound: string | string[]) => {
                result.sound.cry.push({
                    form: soundForm.length !== 2 ? "MEGA" : sound.includes("_51") ? "MEGA_X" : "MEGA_Y",
                    path: sound
                });
            })
        }
        soundForm = sounds.filter((sound: string | string[]) => !sound.includes(`Addressable Assets/`)
        && sound.includes(`pv${result.id.toString().padStart(3, '0')}`))
        if (result.sound.cry.length === 0) {
            soundForm.forEach((sound: string | string[]) => {
                result.sound.cry.push({
                    form: sound.includes("_31") ? "SPECIAL" :"NORMAL",
                    path: sound
                });
            })
        }
        return result;
    });

}

export const optionCombat = (data: any[]) => {

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

    const moves = data.filter((item: { templateId: string | string[]; }) => item.templateId[0] === "V" && item.templateId.includes("MOVE"))
    .map((item: { data: { moveSettings: any; }; templateId: string; }) => {
        return {
            ...item.data.moveSettings,
            id: parseInt(item.templateId.split("_")[0].replace("V", ""))
        }
    });
    const sequence = data.filter((item: { templateId: string | string[]; data: { moveSequenceSettings: { sequence: any[]; }; }; }) => item.templateId.includes("sequence_") && item.data.moveSequenceSettings.sequence.find((seq: string | string[]) => seq.includes("sfx attacker")))
    .map((item: { templateId: string; data: { moveSequenceSettings: { sequence: any[]; }; }; }) => {
        return {
            id: item.templateId.replace("sequence_", "").toUpperCase(),
            path: item.data.moveSequenceSettings.sequence.find((seq: string | string[]) => seq.includes("sfx attacker")).replace("sfx attacker ", "")
        }
    });

    return data.filter((item: { templateId: string | string[]; }) => item.templateId.includes("COMBAT_V"))
    .map((item: { data: { combatMove: { uniqueId: string; type: { replace: (arg0: string, arg1: string) => null; }; power: number; energyDelta: number; buffs: { [x: string]: any; }; }; }; templateId: string | string[]; }) => {
        const result: combat = combatModel();
        result.name = item.data.combatMove.uniqueId
		result.type = item.data.combatMove.type.replace("POKEMON_TYPE_", "")
		if (item.templateId.includes("FAST")) result.type_move = "FAST"
		else result.type_move = "CHARGE";
        result.pvp_power = item.data.combatMove.power ?? 0.0;
        result.pvp_energy = item.data.combatMove.energyDelta ?? 0;
        const seq = sequence.find((seq: { id: string; }) => seq.id === result.name);
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
		const move = moves.find((move: { movementId: string; }) => move.movementId === result.name);
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

export const optionPokemonCombat = (data: any[], pokemon: any[], formSpecial: any[]) => {

    const combatPokemonModel = () => {
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

    return pokemon.filter((item: { name: any; }) => !formSpecial.includes(item.name)).map((item: { id: number; name: string; pokemonId: string; quickMoves: { map: (arg0: (move: any) => any) => any[]; }; cinematicMoves: any[]; eliteQuickMove: { map: (arg0: (move: any) => any) => any[]; }; eliteCinematicMove: any[]; shadow: { shadowChargeMove: any; purifiedChargeMove: any; }; }) => {
        const result: combatPokemon = combatPokemonModel();
        result.id = item.id;
        result.name = item.name;
        result.baseSpecies = item.pokemonId;
        if (result.id === 235) {
            const moves = data.find((item: { templateId: string; }) => item.templateId === "SMEARGLE_MOVES_SETTINGS").data.smeargleMovesSettings;
            result.quickMoves = moves.quickMoves.map((move: string) => move.replace("_FAST", ""));
            result.cinematicMoves = moves.cinematicMoves;
        } else {
            result.quickMoves = item.quickMoves ? item.quickMoves.map((move: string) => move.replace("_FAST", "")) : [];
            result.cinematicMoves = item.cinematicMoves;
            result.eliteQuickMoves = item.eliteQuickMove ? item.eliteQuickMove.map((move: string) => move.replace("_FAST", "")) : [];
            result.eliteCinematicMoves = item.eliteCinematicMove ?? [];
            if (item.shadow) {
                result.shadowMoves.push(item.shadow.shadowChargeMove);
                result.purifiedMoves.push(item.shadow.purifiedChargeMove);
            }
        }
        return result;
    })

}

export const optionLeagues = (data: { find: (arg0: { (item: any): boolean; (item: any): boolean; (item: any): boolean; }) => { (): any; new(): any; data: { (): any; new(): any; vsSeekerClientSettings: { (): any; new(): any; allowedVsSeekerLeagueTemplateId: { (): any; new(): any; map: { (arg0: (item: any) => any): any[]; new(): any; }; }; }; combatCompetitiveSeasonSettings: { (): any; new(): any; seasonEndTimeTimestamp: any; }; combatRankingProtoSettings: { (): any; new(): any; rankLevel: any; }; }; }; filter: (arg0: { (item: any): any; (item: any): any; (item: any): any; }) => { (): any; new(): any; map: { (arg0: (item: any) => { id: null; title: string; enabled: boolean; conditions: any; iconUrl: null; league: string; }): any[]; new(): any; }; forEach: { (arg0: { (item: any): void; (item: any): void; }): void; new(): any; }; }; }, pokemon: any[]) => {

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

    const leagueRewardModel = () => {
        return {
            type: false,
            count: 0,
            step: 0
        }
    }

    const leagueRewardPokemonModel = () => {
        return {
            guaranteedLimited: false,
            id: null,
            name: "",
            form: ""
        }
    }

    const result: leagueData = {
        allowLeagues: [],
        data: [],
        season: {}
    }

    result.allowLeagues = data.find((item: { templateId: string; }) => item.templateId === "VS_SEEKER_CLIENT_SETTINGS").data.vsSeekerClientSettings.allowedVsSeekerLeagueTemplateId
    .map((item: string) => item.replace("COMBAT_LEAGUE_", "").replace("DEFAULT_", ""))

    result.data = data.filter((item: { templateId: string; }) => item.templateId.includes("COMBAT_LEAGUE_") && !item.templateId.includes("SETTINGS"))
    .map((item: any) => {
        const result: league = leagueModel();
        result.id = item.templateId.replace("COMBAT_LEAGUE_", "").replace("DEFAULT_", "");
        result.title = item.data.combatLeague.title.replace("combat_", "").replace("_title", "").toUpperCase()
        result.enabled = item.data.combatLeague.enabled
        result.conditions = leagueConditionModel();
        item.data.combatLeague.pokemonCondition.forEach((con: { type: string; pokemonCaughtTimestamp: { afterTimestamp: any; beforeTimestamp: null; }; withPokemonType: { pokemonType: any[]; }; pokemonLevelRange: { maxLevel: any; }; withPokemonCpLimit: { maxCp: any; }; pokemonWhiteList: { pokemon: any[]; }; }) => {
            if (con.type === "POKEMON_CAUGHT_TIMESTAMP") {
                result.conditions.timestamp = {}
                result.conditions.timestamp.start = con.pokemonCaughtTimestamp.afterTimestamp
                result.conditions.timestamp.end = con.pokemonCaughtTimestamp.beforeTimestamp ?? null;
            }
            if (con.type === "WITH_UNIQUE_POKEMON") {
                result.conditions.unique_selected = true
            }
            if (con.type === "WITH_POKEMON_TYPE") {
                result.conditions.unique_type = con.withPokemonType.pokemonType.map((type: string) => type.replace("POKEMON_TYPE_", ""))
            }
            if (con.type === "POKEMON_LEVEL_RANGE") {
                result.conditions.max_level = con.pokemonLevelRange.maxLevel
            }
            if (con.type === "WITH_POKEMON_CP_LIMIT") {
                result.conditions.max_cp = con.withPokemonCpLimit.maxCp
            }
            if (con.type === "POKEMON_WHITELIST") {
                result.conditions.whiteList = con.pokemonWhiteList.pokemon.map((poke: { id: any; form: string; forms: string | any[]; }) => {
                    const whiteList: any = {};
                    whiteList.id = pokemon.find((item: { name: any; }) => item.name === poke.id).id
                    whiteList.name = poke.id
                    whiteList.form = poke.form ? poke.form.replace(whiteList.name+"_", "") : "NORMAL";
                    if (poke.forms && poke.forms.length === 1) whiteList.form = poke.forms[0].replace(whiteList.name+"_", "");
                    return whiteList;
                });
                result.conditions.whiteList = result.conditions.whiteList.sort((a: { id: number; },b: { id: number; }) => a.id-b.id);
            }
            result.iconUrl = item.data.combatLeague.iconUrl.replace("https://storage.googleapis.com/prod-public-images/", "").replace("https://prodholoholo-public-images.nianticlabs.com/LeagueIcons/", "")
            result.league = item.data.combatLeague.badgeType.replace("BADGE_", "")
            if (item.data.combatLeague.bannedPokemon) {
                result.conditions.banned = item.data.combatLeague.bannedPokemon.map((poke: any) => {
                    const banList: any = {};
                    banList.id = pokemon.find((item: { name: any; }) => item.name === poke).id;
                    banList.name = poke;
                    return banList;
                });
                result.conditions.banned = result.conditions.banned.sort((a: { id: number; },b: { id: number; }) => a.id-b.id);
            }
        })
        return result;
    })

    const seasons = data.find((item: { templateId: string; }) => item.templateId === "COMBAT_COMPETITIVE_SEASON_SETTINGS").data.combatCompetitiveSeasonSettings.seasonEndTimeTimestamp;
    const rewards: any = {
        rank: {},
        pokemon: {}
    };
    data.filter((item: { templateId: string | string[]; }) => item.templateId.includes("VS_SEEKER_LOOT_PER_WIN_SETTINGS_RANK_")).forEach((item: { data: { vsSeekerLoot: any; }; }) => {
        const data = item.data.vsSeekerLoot;
        if (!rewards.rank[data.rankLevel]) {
            rewards.rank[data.rankLevel] = {
                rank: data.rankLevel,
                free: [],
                premium: []
            };
        }
        data.reward.slice(0, 5).forEach((reward: { pokemonReward: any; itemLootTable: any; item: { stardust: any; item: boolean; count: number; }; }, index: number) => {
            const result: leagueReward = leagueRewardModel();
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

    data.filter((item: { templateId: string | string[]; }) => item.templateId.includes("VS_SEEKER_POKEMON_REWARDS_")).forEach((item: { data: { vsSeekerPokemonRewards: any; }; templateId: string | string[]; }) => {
        const data = item.data.vsSeekerPokemonRewards;
        const track = item.templateId.includes("FREE") ? "FREE" : "PREMIUM";
        data.availablePokemon.forEach((value: { unlockedAtRank: string | number; guaranteedLimitedPokemonReward: { pokemon: any; }; pokemon: any; }) => {
            if (!rewards.pokemon[value.unlockedAtRank]) {
                rewards.pokemon[value.unlockedAtRank] = {
                    rank: value.unlockedAtRank,
                    free: [],
                    premium: []
                };
            }
            const result: leagueRewardPokemon = leagueRewardPokemonModel();
            let poke: { pokemonId: string; pokemonDisplay: { form: string; }; };
            if (value.guaranteedLimitedPokemonReward) {
                result.guaranteedLimited = true;
                poke = value.guaranteedLimitedPokemonReward.pokemon;
            } else {
                poke = value.pokemon;
            }
            result.id = pokemon.find((item: { name: any; }) => item.name === poke.pokemonId).id
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
        settings: data.find((item: { templateId: string; }) => item.templateId === `COMBAT_RANKING_SETTINGS_S${seasons.length-1}`).data.combatRankingProtoSettings.rankLevel
    }

    return result;
}

export const optionDetailsPokemon = (data: any[], pokemon: any[], formSpecial: any[], assets: any[]) => {

    const datailsPokemonModel = () => {
        return {
            id: 0,
            name: '',
            releasedGO: false,
            form: '',
            gender: null,
            isTransferable: null,
            isDeployable: null,
            isTradable: null,
            pokemonClass: null,
            disableTransferToPokemonHome: null,
            isBaby: false
        }
    }

    const spawn = optionPokemonSpawn(data);
    const result = pokemon.filter((item: { name: string; }) => !formSpecial.includes(item.name)).map(item => {
        const result: details = datailsPokemonModel();
        result.id = item.id;
        result.name = item.name;
        if (item.form) {
            result.form = item.form.replace(`${item.pokemonId}_`, '');
        } else {
            if (result.id === 555) {
                result.form = 'STANDARD';
            } else {
                result.form = 'NORMAL';
            }
        }
        const gender = spawn.find(item => item.id === result.id && item.name === result.name)
        if (gender) {
            result.gender = gender.gender;
        }
        if (item.disableTransferToPokemonHome) {
            result.disableTransferToPokemonHome = item.disableTransferToPokemonHome;
        }
        result.isDeployable = item.isDeployable;
        result.isTradable = item.isTradable;
        result.isTransferable = item.isTransferable;
        if (item.pokemonClass) {
            result.pokemonClass = item.pokemonClass.replace("POKEMON_CLASS_", "");
        }

        const form = assets.find((asset: { id: number; }) => asset.id === result.id)
            .image.find((img: { form: string; }) => img.form === result.form);

        if (form && form.default) {
            result.releasedGO = form.default.includes('Addressable Assets/');
        }
        return result;
    });

    pokemon.filter((item: { name: string; }) => !formSpecial.includes(item.name)).forEach(item => {
        if (item.tempEvoOverrides) {
            item.tempEvoOverrides.forEach((evos: { tempEvoId: string; }) => {
                if (evos.tempEvoId) {
                    const detail: details = datailsPokemonModel();
                    detail.id = item.id;
                    detail.form = evos.tempEvoId.replace("TEMP_EVOLUTION_", "");
                    const gender = spawn.find(item => item.id === detail.id && item.name === detail.name)
                    if (gender) {
                        detail.gender = gender.gender;
                    }
                    detail.name = item.name+"_"+detail.form;
                    detail.releasedGO = true;
                    result.push(detail);
                }
            })
        }
    });

    return result;
}