import options from '../data/pokemon_go_options.json';

export function getUpdateTime() {
    return new Date(options.timestamp);
}

export function getOption() {
    let result = options.data;
    Array.apply(this, Array.prototype.slice.call(arguments, 0)).forEach(arg => {
        result = result[arg]
    });
    return result;
}

export const optionPokemon = (data) => {
    return data.filter(item => {
        return item.templateId.includes("POKEMON") &&
        item.templateId[0] === "V" &&
        Object.keys(item.data).includes("pokemonSettings")
    }).map(item => {
        const name = item.data.pokemonSettings.form ?? item.data.pokemonSettings.pokemonId;
        return {
            ...item.data.pokemonSettings,
            id: parseInt(item.templateId.split("_")[0].replace("V", "")),
            name: name
        };
    });
}

export const optionEvolution = (data, pokemon) => {

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

    return pokemon.filter(item => {return !item.name.includes("NORMAL") &&
            !item.name.includes("ANNIV") &&
            !item.name.includes("OKINAWA") &&
            !item.name.includes("KARIYUSHI") &&
            !item.name.includes("POP_STAR") &&
            !item.name.includes("ROCK_STAR") &&
            !item.name.includes("2018") &&
            !item.name.includes("2019") &&
            !item.name.includes("2020") &&
            !item.name.includes("2021") &&
            !item.name.includes("2022") &&
            !item.name.split("_")[-1] !== 'S'})
            .map(item => {
                let result = evolutionModel();
                result.id = item.id;
                result.name = item.name;
                if (item.evolutionBranch) {
                    item.evolutionBranch.forEach(evo => {
                        let dataEvo = {}
                        let name = evo.evolution ?? result.name;
                        if (evo.form) {
                            dataEvo["evo_to_form"] = evo.form.replace(name+"_", "").replace("NORMAL", "")
                        } else {
                            dataEvo["evo_to_form"] = ""
                        }
                        dataEvo["evo_to_id"] = pokemon.find(poke => poke.name === name).id;
                        dataEvo["evo_to_name"] = name.replace("_NORMAL", "")
                        if (evo.candyCost) dataEvo["candyCost"] = evo.candyCost;
                        dataEvo["quest"] = {};
                        if (evo.genderRequirement) dataEvo.quest["genderRequirement"] = evo.genderRequirement;
                        if (evo.kmBuddyDistanceRequirement) dataEvo.quest["kmBuddyDistanceRequirement"] = evo.kmBuddyDistanceRequirement;
                        if (evo.mustBeBuddy) dataEvo.quest["mustBeBuddy"] = evo.mustBeBuddy;
                        if (evo.onlyDaytime) dataEvo.quest["onlyDaytime"] = evo.onlyDaytime;
                        if (evo.onlyNighttime) dataEvo.quest["onlyNighttime"] = evo.onlyNighttime;
                        if (evo.lureItemRequirement) {
                            if (evo.lureItemRequirement === "ITEM_TROY_DISK_MAGNETIC") item = "magnetic";
                            else if (evo.lureItemRequirement === "ITEM_TROY_DISK_MOSSY") item = "moss";
                            else if (evo.lureItemRequirement === "ITEM_TROY_DISK_GLACIAL") item = "glacial";
                            else if (evo.lureItemRequirement === "ITEM_TROY_DISK_RAINY") item = "rainy";
                            dataEvo.quest["lureItemRequirement"] = item;
                        }
                        if (evo.evolutionItemRequirement) {
                            if (evo.evolutionItemRequirement === "ITEM_SUN_STONE") item = "Sun_Stone";
                            else if (evo.evolutionItemRequirement === "ITEM_KINGS_ROCK") item = "King's_Rock";
                            else if (evo.evolutionItemRequirement === "ITEM_METAL_COAT") item = "Metal_Coat";
                            else if (evo.evolutionItemRequirement === "ITEM_GEN4_EVOLUTION_STONE") item = "Sinnoh_Stone";
                            else if (evo.evolutionItemRequirement === "ITEM_DRAGON_SCALE") item = "Dragon_Scale";
                            else if (evo.evolutionItemRequirement === "ITEM_UP_GRADE") item = "Up-Grade";
                            else if (evo.evolutionItemRequirement === "ITEM_GEN5_EVOLUTION_STONE") item = "Unova_Stone";
                            dataEvo.quest["evolutionItemRequirement"] = item;
                        }
                        if (evo.onlyUpsideDown) dataEvo.quest["onlyUpsideDown"] = evo.onlyUpsideDown;
                        if (evo.questDisplay) {
                            const questDisplay = evo.questDisplay[0].questRequirementTemplateId;
                            const template = data.find(template => template.templateId === questDisplay);
                            dataEvo.quest["condition"] = null;
                            try {
                                const condition = template.data.evolutionQuestTemplate.goals[0].condition[0]
                                dataEvo.quest.condition = {}
                                dataEvo.quest.condition["desc"] = condition.type.replace("WITH_", "")
                                if (condition.withPokemonType) {
                                    dataEvo.quest.condition["pokemonType"] = condition.withPokemonType.pokemonType.map(type => type.split("_")[2])
                                }
                                if (condition.withThrowType) {
                                    dataEvo.quest.condition["throwType"] = condition.withThrowType.throwType.split("_")[2]
                                }
                            }
                            catch {}
                            dataEvo.quest["goal"] = template.data.evolutionQuestTemplate.goals[0].target
                            dataEvo.quest["type"] = template.data.evolutionQuestTemplate.questType.replace("QUEST_", "")
                        } else if (item.evolutionBranch && item.evolutionBranch.length > 1 && Object.keys(dataEvo.quest).length === 0) {
                            if (evo.form) {
								dataEvo.quest["randomEvolution"] = false
                            } else {
                                dataEvo.quest["randomEvolution"] = true
                            }
                        }
                        if (evo.temporaryEvolution) {
                            let megaEvo = {}
                            megaEvo["megaEvolutionName"] = name + evo.temporaryEvolution.split("TEMP_EVOLUTION")[1]
                            megaEvo["firstMegaEvolution"] = evo.temporaryEvolutionEnergyCost
                            megaEvo["megaEvolution"] = evo.temporaryEvolutionEnergyCostSubsequent
                            result.mega_evo.push(megaEvo)
                        }
                        if (result.mega_evo.length === 0) { result.evo_list.push(dataEvo) }
                    })
                }
                if (item.shadow) {
                    result.purified["stardust"] = item.shadow.purificationStardustNeeded
				    result.purified["candy"] = item.shadow.purificationCandyNeeded
                }
                if (item.thirdMove) {
                    result.thirdMove["stardust"] = item.thirdMove.stardustToUnlock
				    result.thirdMove["candy"] = item.thirdMove.candyToUnlock
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