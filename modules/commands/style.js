const fs = require('fs');
const path = require('path');
const axios = require('axios');

const STYLE_NAMES = [
  "hijab", "bald", "punk", "cyberpunk", "batman", "zombie", "anime", "cartoon", "robot", "fantasy_elf", "korean_idol", "viking_warrior", "steampunk", "modern_witch", "vaporwave", "elegant_goth", "samurai", "space_marine", "fairytale_whimsical", "neon_punk", "us_army_soldier", "us_marine", "us_navy_seal", "us_air_force", "vietnam_war_soldier", "wwii_gi", "modern_swat", "military_pilot", "special_forces", "army_ranger", "medieval_knight", "roman_centurion", "ninja_assassin", "pirate_captain", "cowboy_gunslinger", "apocalypse_survivor", "space_explorer", "tribal_warrior", "gladiator", "mecha_pilot", "wasteland_raider", "arctic_explorer", "jungle_commando", "desert_warrior", "cyber_soldier", "mountain_climber", "biker_gang", "secret_agent", "firefighter_hero", "police_officer", "javanese_traditional", "balinese_traditional", "sundanese_traditional", "betawi_traditional", "minangkabau_traditional", "dayak_traditional", "papuan_traditional", "torajan_traditional", "acehnese_traditional", "tni_soldier", "polri_officer", "paskibraka", "pencak_silat", "ojek_driver", "warung_owner", "batik_artisan", "gamelan_musician", "wayang_puppeteer", "traditional_fisherman", "paddy_farmer", "becak_driver", "kopi_tubruk", "angkot_driver", "street_food_vendor", "local_thug", "student_protester", "handyman", "ojol_rider", "street_punk", "waste_picker", "mall_security_guard", "motherly_figure", "fatherly_figure", "school_student", "pkk_member", "foreign_tourist", "ancient_egyptian_pharaoh", "greek_goddess", "roman_emperor", "medieval_peasant", "renaissance_noble", "victorian_gentleman", "flapper_1920s", "greaser_1950s", "hippie_1960s", "disco_dancer_1970s", "80s_aerobics_instructor", "90s_grunge_musician", "mermaid_merman", "classic_vampire", "seraphic_angel", "generic_superhero", "generic_supervillain", "mad_scientist", "classic_nasa_astronaut", "vintage_deep_sea_diver_suit", "wild_west_saloon_girl", "explorer_jungle_archaeologist", "ballerina", "opera_singer", "gourmet_chef", "doctor_surgeon", "scientist_lab", "academic_librarian", "martial_artist_kung_fu_master", "skateboarder_street", "surfer_beach", "rocker_heavy_metal", "fantasy_rogue", "fantasy_mage", "druid_nature_bound", "gothic_lolita", "hip_hop_artist", "mughal_emperor_empress", "ming_dynasty_scholar_noble", "samurai_master_weathered", "geisha_maiko", "bollywood_star", "african_tribal_elder_shaman", "native_american_chief_warrior", "regency_era_noble_bridgerton", "edwardian_lady_gentleman", "roaring_twenties_gangster", "40s_50s_pin_up_girl", "1960s_british_mod", "synthwave_aesthetic_80s_retro_futuristic", "cottagecore_aesthetic", "dark_academia_student_professor", "techwear_aesthetic", "boho_chic_fashionista", "steampunk_inventor", "art_deco_socialite", "renaissance_faire_goer", "space_pirate", "cyberpunk_nomad", "post_apocalyptic_scavenger", "fantasy_paladin_holy_knight", "fantasy_bard_minstrel", "forest_dryad_nymph", "mythological_kitsune_fox_spirit_humanoid", "oni_demon_subtle_humanoid", "ancient_robot_golem", "elegant_humanoid_alien_diplomat", "professional_gamer_esports_player", "social_media_influencer", "modern_coffee_shop_barista", "artisan_baker", "urban_architect", "investigative_journalist", "high_fashion_model", "street_artist_graffiti_muralist", "parkour_practitioner", "modern_wellness_yoga_instructor", "crossfit_athlete", "soccer_player_jersey_cleats", "basketball_player_jersey_shorts", "tennis_player_tennis_whites", "olympic_gymnast", "ice_skater_figure_skating_costume", "circus_ringmaster", "voodoo_priest_priestess", "gamer_streamer", "vintage_hollywood_star", "e-girl_e-boy", "soft_girl_aesthetic", "alt_fashion", "normcore_minimalist", "athleisure_chic", "art_hoe_aesthetic", "baddie_style", "streetwear_hypebeast", "indie_sleaze", "cottagegoth_aesthetic", "coastal_grandmother", "gorpcore_outdoor_fashion", "skater_culture", "y2k_fashion_revival", "light_academia", "fairycore_aesthetic", "goblincore_aesthetic", "vsco_girl_boy", "athleisure_streetwear", "corporate_goth", "maximalist_fashion", "cozy_casual", "avant_garde_fashion", "glam_rock_revival", "rave_fashion", "vintage_sportswear", "preppy_modern", "dark_romance", "vintage_americana", "post_punk_revival", "bohemian_grunge", "street_goth", "vaporwave_retro_futurism", "lofi_aesthetic", "dreamcore_weirdcore", "cottagecore_witch", "dark_magical_academia", "grunge_fairy", "solarpunk_optimistic_futurism", "lunarpunk_nocturnal_futurism", "clowncore_maximalist", "cottagegoth_vampire", "fairy_kei_pastel_decora", "coastal_cowgirl", "dark_fantasy_rogue", "light_fantasy_cleric", "haute_couture_futuristic", "digital_art_glitch", "liquid_metal_effect", "vaporwave_sculpture", "neon_line_effect", "psychedelic_art", "fractal_pattern_skin", "glitch_vaporwave", "pixel_art_retro", "abstract_geometric_fragmentation", "iridescent_holographic", "low_poly_art", "vaporwave_statue", "comic_book_halftone", "pop_art_bold_colors", "graffiti_street_art", "neon_noir_cyberpunk", "comic_noir_monochromatic", "modern_glitch_art", "iridescent_cyberpunk", "synthwave_retrowave_sunset", "vaporwave_glitch_art", "psychedelic_neon_glow", "cyberpunk_graffiti", "pixelated_glitch_effect", "vaporwave_neon_lighting", "retro_future_cityscape", "minimalist_line_art", "holographic_projection", "neon_graffiti_outline", "textured_digital_painting", "minimalist_vector_art", "modern_duotone_effect", "pop_art_comic_book", "geometric_abstract_art", "psychedelic_melting_effect", "retro_vaporwave_glitch", "abstract_colorful_lines", "holographic_glitch", "neon_light_body_art", "vaporwave_geometric", "digital_sketch_effect"
];

module.exports = {
    config: {
        name: 'style',
        version: '1.0',
        author: 'Hridoy',
        countDown: 10,
        prefix: true,
        groupAdminOnly: false,
        description: 'Change image style using AI. Reply to an image or mention a user, specify a style.',
        category: 'ai',
        guide: {
            en: '   {pn}style <style_name> [reply to an image or @mention|uid]\n   {pn}style list (to see style names)'
        },
    },
    onStart: async ({ api, event, args }) => {
        const { senderID, mentions, messageReply } = event;

     
        if (args[0] && args[0].toLowerCase() === 'list') {
          
            const styleList = STYLE_NAMES.join(', ');
            api.sendMessage(
                `🎨 Available Styles:\n${styleList}\n\nThis message will be deleted automatically in 30 seconds.`,
                event.threadID,
                async (err, info) => {
                    if (info && info.messageID) {
                        setTimeout(() => {
                            api.unsendMessage(info.messageID);
                        }, 30000);
                    }
                }
            );
            return;
        }

       
        const style = args[0] ? args[0].trim() : null;
        if (!style) {
            return api.sendMessage("Please specify a style name. Use {pn}style list to see available styles.", event.threadID);
        }
        if (!STYLE_NAMES.includes(style)) {
            return api.sendMessage(`Style "${style}" not found. Use {pn}style list to see available styles.`, event.threadID);
        }

        let imageUrl;
        let targetIDForFilename = senderID;

        if (messageReply && messageReply.attachments && messageReply.attachments.length > 0 && ['photo', 'sticker'].includes(messageReply.attachments[0].type)) {
            imageUrl = messageReply.attachments[0].url;
            targetIDForFilename = messageReply.senderID;
        } else {
            let targetID = senderID;
            if (Object.keys(mentions).length > 0) {
                targetID = Object.keys(mentions)[0];
            } else if (args.length > 1) {
                const uid = args[1].replace(/[^0-9]/g, '');
                if (uid.length === 15 || uid.length === 16) targetID = uid;
            }
            targetIDForFilename = targetID;
            imageUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        }

        if (!imageUrl) {
            return api.sendMessage("Please reply to an image or mention a user to apply a style.", event.threadID);
        }

        const apiUrl = `https://hridoy-apis.vercel.app/ai-image/style?url=${encodeURIComponent(imageUrl)}&style=${encodeURIComponent(style)}&apikey=hridoyXQC`;

        try {
            api.sendMessage(`🎨 | Applying style "${style}" with AI, please wait...`, event.threadID);
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }
            const imagePath = path.join(cacheDir, `style_${style}_${targetIDForFilename}_${Date.now()}.png`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath));
        } catch (error) {
            console.error("Error generating styled image:", error);
            api.sendMessage("Sorry, an error occurred while processing the image or style. Please try again later.", event.threadID);
        }
    }
};