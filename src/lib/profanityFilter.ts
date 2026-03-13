import { Filter } from 'bad-words';
import { normalizeText } from './textNormalization';
import { checkRegexProfanity } from './regexFilter';
import { moderationConfig } from '../config/moderationConfig';

// Initialize the filter with default English profanity list
const filter = new Filter();

// Add custom banned words specific to the farming community context
// These can be expanded as needed
const customBannedWords = [
    // ==========================================
    // 1. SCAMS, FRAUD, SPAM & BOTS (Extensive)
    // ==========================================
    "scam", "scammer", "scams", "scammed", "scamming", "fraud", "fraudulent", "frauds",
    "cheat", "cheater", "cheating", "cheats", "hacker", "hack", "hacking", "hacks", "hacked",
    "phishing", "phish", "fake offer", "fake job", "lottery scam", "investment scam",
    "crypto scam", "loan scam", "ponzi", "pyramid scheme", "cashapp", "venmo scam",
    "jackpot", "atm pin", "cvv", "kyc update", "account blocked", "aadhar link", "pan link",
    "send otp", "share otp", "bank otp", "credit card details", "upi verification", "otp do",
    "otp send karo", "otp batao", "otp share na karein", "pin maango", "password do",
    "buy now", "click here", "limited offer", "earn money fast", "free money", "guaranteed profit",
    "work from home scheme", "telegram group link", "whatsapp group link", "paisa kamao",
    "click karo", "link open karo", "gratis", "paisa double", "invest karo", "win iphone",
    "click to claim", "fast cash", "verified account for sale", "follow me for", "check my bio",
    "dm for details", "get rich", "earn daily", "money glitch", "free followers", "free likes",
    "buy views", "subscribe channel", "promo code", "discount code", "gift card code", "claim reward",
    "send eth", "send btc", "whatsapp me", "telegram me", "call me on", "customer support number",
    "helpline number", "toll free fake", "customer care fraud", "refund scam", "olx fraud",
    "dhokha", "loot", "dhokebaaz", "thaga", "chuna", "fasaana", "scheme", "lottery lagi",
    "paise double", "dhokhadhadi", "fareb", "jaalsazi", "jhooth", "paise de", "paise bhej",
    "ओटीपी", "पासवर्ड", "धोखा", "लूट", "पैसा कमाओ", "कस्टमर केयर", "लॉटरी", "लिंक पर क्लिक",
    "!!!!", "$$$", "###", "%%%%", "bit.ly", "tinyurl", "short link", "t.me", "wa.me",

    // ==========================================
    // 2. MURDER, VIOLENCE & HARMFUL ACTIONS
    // ==========================================
    "murder", "murderer", "murdering", "murders", "assassinate", "assassination", "stab",
    "stabbed", "stabbing", "shoot you", "cut you", "strangle", "kidnap", "kidnapped", "kidnapping",
    "i will kill", "death threat", "violent threat", "exploit", "illegal hack", "bypass security",
    "crack software", "steal account", "account takeover", "torture", "torturing", "slaughter",
    "massacre", "bomb", "bombing", "terror", "terrorist", "hostage", "choke", "choking", "beat you",
    "destroy you", "smash your face", "break your legs", "bury you", "dead body",
    "khoon", "katl", "maar dalunga", "goli maar", "chaku", "jaan se maar dunga", "maar peet",
    "haath tod", "pair tod", "katal kar", "zinda jala", "maar dal", "katl-e-aam", "gala daba",
    "jaan le lunga", "tukde kar dunga", "kaat dunga", "bhasm kar dunga", "aag laga dunga",
    "खून", "कत्ल", "चाकू", "गोली मार", "जान से मार दूंगा", "मार डालूंगा", "काट दूंगा", "गला दबा",

    // ==========================================
    // 3. SUICIDE & SELF-HARM
    // ==========================================
    "suicide", "suicidal", "kill yourself", "kys", "die", "dying", "self harm", "cut myself",
    "end my life", "hang myself", "drink poison", "suicide attempt", "jump off", "cut wrists",
    "overdose", "pills", "slit my wrists", "want to die", "tired of living", "no reason to live",
    "mar jao", "zeher", "khudkushi", "aatmahatya", "zeher kha lunga", "faasi", "maut", "mar ja",
    "marne wala", "jaan de dunga", "nas kat", "latak ja", "marne ki koshish", "kood jaunga",
    "आत्महत्या", "खुदकुशी", "ज़हर", "मरना चाहता हूँ", "मर जाओ", "फांसी", "मौत", "नस काट",

    // ==========================================
    // 4. ADULT, SEXUAL & EXPLICIT CONTENT
    // ==========================================
    "porn", "porno", "pornography", "xxx", "adult video", "explicit content", "nsfw", "adult site",
    "p0rn", "pr0n", "xxxsite", "adultsite", "onlyfans", "sugar daddy", "sugar mommy",
    "dick", "dicks", "cock", "cocks", "boob", "boobs", "tits", "titties", "vagina", "penis",
    "dildo", "masturbate", "masturbating", "blowjob", "handjob", "sex", "sexy", "sex video",
    "nude", "nudes", "send nudes", "strip", "camgirl", "escort", "call girl", "hooker", "prostitute",
    "orgasm", "clitoris", "sperm", "cum", "cumming", "ejaculate", "horny", "fetish", "bdsm",
    "gandi video", "asleel", "muthal", "hila le", "nangi", "nanga", "chudai", "choot", "chut",
    "bur", "bund", "kothewali", "tawaif", "randaap", "raand", "chodna", "chod", "chudakkad",
    "jism", "nangapan", "suhaagrat", "chuche", "muth", "muthiya", "tharki", "hawas", "hawasi",
    "गंदी वीडियो", "अश्लील", "मुठल", "छिनाल", "दलाल", "थरकी", "नंगा", "चुदाई", "हवस",

    // ==========================================
    // 5. ENGLISH SLANGS & TOXICITY (Full Families)
    // ==========================================
    "fuck", "fucker", "fucking", "fucked", "fucks", "fuckface", "fuckhead", "fuckwad",
    "motherfucker", "motherfucking", "motherfuckers", "muthafucka", "fck", "fuk", "phuck", "phuk",
    "shit", "shitter", "shitting", "shitted", "shits", "shithead", "bullshit", "dogshit",
    "horseshit", "dipshit", "dumbfuck", "asshat", "sh1t", "shity", "shitty",
    "bitch", "bitches", "bitching", "bitchy", "sonofabitch", "b1tch", "btch", "betch",
    "ass", "asses", "asshole", "assholes", "dumbass", "fatass", "smartass", "jackass", "a$$", "a$$hole",
    "slut", "sluts", "slutty", "whore", "whores", "whoring", "skank", "skanks", "bimbo",
    "bastard", "bastards", "douche", "douchebag", "dickhead", "cunt", "cunts", "prick", "pricks",
    "stfu", "loser", "idiot", "troll", "clown", "garbage", "trash", "crap", "scumbag", "twat", "wanker",
    "ugly", "shut the fuck up", "gtfo", "dumb", "creep", "pervert", "pedophile", "pedo", "incel",
    "retard", "retarded", "faggot", "fag", "nigger", "nigga", "chink", "spic", "piss off",
    "screw you", "go to hell", "suck my", "lick my", "kiss my ass", "craphead", "moron", "moronic",
    "f.u.c.k", "f*ck", "b*tch", "s.h.i.t", "a.s.s", "c.u.n.t", "kill", "die", "bloody", "poison",
    "ज़हर", "ज़हर",

    // ==========================================
    // 6. HINGLISH SLANGS & TOXICITY (Massive Variations)
    // ==========================================
    "chutiya", "chutiye", "chutya", "chuutiya", "chtya", "c.h.u.t.i.y.a", "chutiyapa", "chutiyap",
    "gandu", "gandoo", "gaandu", "g@ndu", "ganduu", "gand", "gaand", "gandi", "gandfat", "gandmasti",
    "saala", "saale", "sala", "sale", "kutta", "kutte", "kutti", "kameena", "kamine", "kaminey",
    "harami", "haraami", "haramzada", "haramzadi", "bakwas", "bewakoof", "bevkoof", "bewakuf",
    "maderchod", "madarchod", "madarchd", "mdrchod", "mc", "m.c.", "m c", "madarchood",
    "behenchod", "bhenchod", "bhenchd", "bc", "b.c.", "b c", "bhen ke lode", "bchod", "bhenchood",
    "bsdk", "bhosdike", "bhosarike", "bhosdiki", "bhosda", "bhosad", "bhosadi",
    "lavda", "lauda", "loda", "louda", "l@vda", "lavde", "laude", "lode", "lovda",
    "lund", "lunnd", "lannd", "lnd", "jhaat", "jhat", "jh@@t", "jhaantu", "jhantu",
    "tatte", "tatto", "tatay", "gote", "gotay", "rakhel", "chinaal", "randi", "dalal",
    "bevda", "bewafa", "badmash", "chamcha", "gadhe", "gadha", "ullu", "bhutiya", "pille",
    "hijda", "chakka", "meetha", "nalayak", "patli gali", "aukat", "aukaat", "jaa na", "chal nikal",
    "randwa", "bhikhari", "do kaudi ka", "teri ma ki", "teri behen ki", "jhaat ke baal",
    "chaman chutiya", "chipkali", "suar", "nalla", "berozgar", "chapri", "chhapri", "shut up",
    "chup kar", "niklo yahan se", "gaali", "teri maa ka", "teri mkc", "tmkc", "teri ma ki chut",
    "maa chuda", "ma chuda", "gand mara", "gaand mara", "mummy chuda", "baap ko mat sikha",
    "tera baap", "teri aukaat kya hai", "kutta kamina", "nark mein ja", "bhaad mein ja",
    "maa ki aankh", "teri aisi ki taisi", "chullu bhar pani", "doob mar", "kide padenge",

    // ==========================================
    // 7. HINDI (DEVANAGARI) SLANGS & TOXICITY
    // ==========================================
    "चूतिया", "गांडू", "साला", "कुत्ता", "कमीना", "हरामी", "बकवास", "बेवकूफ",
    "बिवड़ा", "बदमाश", "चमचा", "गधे", "उल्लू", "कुतिया", "नालायक", "औकात",
    "झांटू", "गांड", "टट्टे", "भिखारी", "सुअर", "नल्ला", "छपरी", "चुप कर",
    "निकलो यहाँ से", "मादरचोद", "बहनचोद", "भोसड़ीके", "लौड़ा", "लंड", "झांट",
    "रंडी", "छिनाल", "मुठल", "दलाल", "थरकी", "छक्का", "हिजड़ा", "रंडवा",
    "तेरी माँ की", "गाली", "औकात क्या है", "मर जा", "लतखोर", "हरामजादा",
    "तेरी बहन की", "गंद", "सूअर के बच्चे", "कुत्ते के पिल्ले", "गधे की औलाद",
    "मूर्ख", "पागल", "दिमाग खराब", "भाड़ में जा", "तेरी ऐसी की तैसी",
    "जूते मारूंगा", "थप्पड़", "चपेट", "बेशर्म", "बेहया", "लुच्चा", "लफंगा",
    "हरामखोर", "धूर्त", "पाखंडी", "नीच", "कुकर्मी", "पापी", "दरिंदा",
    "चुड़ैल", "डायन", "राक्षस", "भिखमंगा", "कंगाल", "कचरा", "रद्दी"
];

filter.addWords(...customBannedWords);

export interface ProfanityResult {
    isProfane: boolean;
    reason: string;
}

/**
 * Check a message for profanity and abusive language.
 * Uses the bad-words library + custom dictionary.
 * Case-insensitive by default.
 */
export function checkProfanity(message: string): ProfanityResult {
    try {
        // Step 1: Text Normalization (if enabled)
        // Defeats obfuscation tricks like g@ndu, f.u.c.k, whitespace insertion
        const normalizedMessage = moderationConfig.enableNormalization 
            ? normalizeText(message) 
            : message;

        // Step 2: Custom Regex Layer (if enabled)
        // Checks normalized text against high-toxicity Hinglish/Hindi stems and deep obfuscation
        if (moderationConfig.enableRegexFilter) {
            const regexResult = checkRegexProfanity(normalizedMessage);
            if (regexResult.isProfane) {
                console.debug("[Moderation] Regex Pattern Match Detect:", regexResult.matchedPattern);
                return {
                    isProfane: true,
                    reason: regexResult.reason || 'Message contains inappropriate or abusive language.',
                };
            }
        }

        // Step 3: Base Dictionary Filter (bad-words + massive custom list)
        // Uses normalized text so bypassing via symbols doesn't fool the standard dictionary check
        if (moderationConfig.enableDictionaryFilter && filter.isProfane(normalizedMessage)) {
             console.debug("[Moderation] Dictionary Match Detect");
            return {
                isProfane: true,
                reason: 'Message contains inappropriate or abusive language.',
            };
        }

        return { isProfane: false, reason: '' };
    } catch {
        // If the filter pipeline fails for any reason, allow the message (fail-open)
        return { isProfane: false, reason: '' };
    }
}

/**
 * Clean a message by replacing profane words with asterisks.
 * Alternative to blocking — can be used for softer moderation.
 */
export function cleanMessage(message: string): string {
    try {
        return filter.clean(message);
    } catch {
        return message;
    }
}
