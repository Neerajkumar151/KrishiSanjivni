const questionIndicators = [
    /* English Question Words */
    "what", "which", "who", "whom", "whose", "why", "when", "where", "how",
    "can", "could", "should", "would", "is", "are", "do", "does", "did",
    "best", "better", "recommend", "suggest", "guide", "help", "advice",
    "tips", "solution", "idea", "method", "ways", "steps", "process",
    "how to", "how do", "how can", "how much", "how many", "how long",

    /* English Farming Query Phrases */
    "which crop", "best crop", "crop for", "fertilizer for", "pesticide for",
    "disease in", "problem in", "yellow leaves", "plant dying",
    "insects on plant", "how to grow", "how to control pest",
    "irrigation method", "soil problem", "crop yield", "seed rate",
    "plant spacing", "crop rotation", "weed control",
    "organic farming", "natural farming", "drip irrigation",
    "sprinkler irrigation", "greenhouse farming",

    /* Hinglish Question Words */
    "kya", "kaise", "kaunsa", "kaunsi", "kaun", "kab", "kaha", "kyu",
    "kitna", "kitni", "kitne", "kaisa", "kaisi", "kaise kare",
    "kaise karen", "kaise karein", "kaise ugaye", "kaise lagaye",
    "kya kare", "kya karein", "kya karna chahiye",

    /* Hinglish Farming Queries */
    "kaunsi fasal", "kaunsa beej", "gehu", "kaunsa fertilizer",
    "kaunsa pesticide", "fasal kaise ugaye", "pani kab dena",
    "sinchai kaise kare", "fasal me keede", "patti pe daag",
    "patti pe peela pan", "paudha sukh raha", "upaj kaise badhaye",
    "beej kitna dale", "fasal kab boya jata hai",

    /* Hindi (Devanagari) Question Words */
    "क्या", "कैसे", "क्यों", "कब", "कहाँ", "कौन", "कौनसा", "कौनसी",
    "कितना", "कितनी", "कितने", "कैसा", "कैसी",

    /* Hindi Farming Queries */
    "कौन सी फसल", "कौन सा बीज", "कौन सा उर्वरक", "कौन सा कीटनाशक",
    "फसल कैसे उगाएं", "बीज कैसे बोएं", "सिंचाई कैसे करें",
    "खाद कितनी डालें", "फसल में कीड़े", "पत्तियां पीली क्यों",
    "पौधा सूख क्यों रहा", "उपज कैसे बढ़ाएं",
    "फसल कब बोनी चाहिए", "फसल कब काटनी चाहिए",

    /* Help / Advice Intent */
    "please help", "need help", "any suggestion", "any advice",
    "guide me", "help me", "tell me", "explain", "clarify",
    "problem", "issue", "not growing", "not working",
    "disease", "infection", "pest attack"
];

const agricultureTopics = [
    /* General Agriculture */
    // English
    "agriculture", "farming", "farm", "farmer", "cultivation", "crop", "crops", "agriculture field", "farm land", "agri", "agri farming", "agriculture work", "crop farming",
    // Hinglish
    "krishi", "kheti", "khet", "kisan", "krishak", "fasal", "fasalein", "kheti badi", "krishi bhumi", "kheti ka kaam", "fasal ki kheti",
    // Hindi
    "कृषि", "खेती", "खेत", "किसान", "कृषक", "फसल", "फसलें", "कृषि भूमि", "खेती का काम", "फसल की खेती",

    /* Crop Types */
    // English
    "wheat", "rice", "maize", "corn", "barley", "millet", "sorghum", "oats", "pulses", "lentil", "gram", "chickpea", "pea", "soybean", "groundnut", "mustard", "sunflower", "cotton", "sugarcane", "potato", "tomato", "onion", "garlic", "ginger", "turmeric", "chilli", "pepper", "vegetables", "fruits", "horticulture", "orchard", "banana", "mango", "apple", "grapes", "papaya", "pomegranate", "cauliflower", "cabbage", "brinjal", "okra", "peas", "beans", "guava", "watermelon", "muskmelon", "spinach", "coriander",
    // Hinglish
    "gehun", "ganna", "ganne", "gehu", "chawal", "dhan", "makka", "jau", "bajra", "jowar", "jai", "dalen", "masoor", "chana", "matar", "soyabean", "mungfali", "sarson", "surajmukhi", "kapas", "ganna", "aloo", "tamatar", "pyaz", "lahsun", "adrak", "haldi", "mirch", "kali mirch", "sabziyan", "fal", "bagwani", "bagh", "kela", "aam", "seb", "angoor", "papita", "anar", "phool gobhi", "patta gobhi", "baingan", "bhindi", "faliyan", "amrood", "tarbooz", "kharbooja", "palak", "dhaniya",
    // Hindi
    "गेहूं", "चावल", "धान", "मक्का", "जौ", "बाजरा", "ज्वार", "जई", "दालें", "मसूर", "चना", "मटर", "सोयाबीन", "मूंगफली", "सरसों", "सूरजमुखी", "कपास", "गन्ना", "आलू", "टमाटर", "प्याज", "लहसुन", "अदरक", "हल्दी", "मिर्च", "काली मिर्च", "सब्जियां", "फल", "बागवानी", "बाग", "केला", "आम", "सेब", "अंगूर", "पपीता", "अनार", "फूलगोभी", "पत्तागोभी", "बैंगन", "भिंडी", "फलियां", "अमरूद", "तरबूज", "खरबूजा", "पालक", "धनिया",

    /* Seeds & Planting */
    // English
    "seed", "seeds", "seed rate", "seed treatment", "seed variety", "hybrid seed", "sowing", "planting", "transplanting", "germination", "nursery", "seed drill", "plant spacing", "row spacing", "direct sowing",
    // Hinglish
    "beej", "beej dar", "beej upchar", "beej ki kism", "hybrid beej", "buwai", "ropai", "ankuran", "paudhshala", "paudh ki duri", "pankti ki duri", "sidhi buwai",
    // Hindi
    "बीज", "बीज दर", "बीज उपचार", "बीज की किस्म", "संकर बीज", "बुवाई", "रोपाई", "अंकुरण", "पौधशाला", "बीज ड्रिल", "पौधे की दूरी", "पंक्ति की दूरी", "सीधी बुवाई",

    /* Soil & Fertility */
    // English
    "soil", "soil health", "soil test", "soil testing", "soil fertility", "soil ph", "clay soil", "sandy soil", "loamy soil", "organic matter", "compost", "vermicompost", "green manure", "mulching", "soil nutrients",
    // Hinglish
    "mitti", "mrida", "mitti ka swasthya", "mitti ki janch", "mitti ki urvarakta", "mitti ka ph", "chikni mitti", "balui mitti", "domat mitti", "jaivik padarth", "kenchua khad", "hari khad", "mitti ke poshak tatva",
    // Hindi
    "मिट्टी", "मृदा", "मिट्टी की जांच", "मिट्टी का स्वास्थ्य", "मिट्टी की उर्वरता", "मिट्टी का पीएच", "चिकनी मिट्टी", "बलुई मिट्टी", "दोमट मिट्टी", "जैविक पदार्थ", "कम्पोस्ट", "केंचुआ खाद", "हरी खाद", "मल्चिंग", "मिट्टी के पोषक तत्व",

    /* Fertilizers & Nutrients */
    // English
    "fertilizer", "fertiliser", "urea", "dap", "npk", "potash", "nitrogen", "phosphorus", "potassium", "micronutrient", "zinc", "boron", "sulphur", "biofertilizer", "organic fertilizer", "liquid fertilizer", "foliar spray", "nutrient deficiency",
    // Hinglish
    "khad", "khaad", "fasal", "munafa", "urvarak", "yuriya", "sukshma poshak tatva", "jaivik urvarak", "jaivik khad", "taral urvarak", "parniya chhidkaw", "poshak tatva ki kami",
    // Hindi
    "खाद", "उर्वरक", "यूरिया", "डीएपी", "एनपीके", "पोटाश", "नाइट्रोजन", "फास्फोरस", "पोटेशियम", "सूक्ष्म पोषक तत्व", "जिंक", "बोरॉन", "सल्फर", "जैव उर्वरक", "जैविक खाद", "तरल उर्वरक", "पर्ण छिड़काव", "पोषक तत्वों की कमी",

    /* Irrigation */
    // English
    "irrigation", "watering", "water", "drip irrigation", "sprinkler irrigation", "canal irrigation", "flood irrigation", "water pump", "tubewell", "borewell", "rainwater harvesting", "rainfall", "water management",
    // Hinglish
    "sinchai", "paani dena", "paani", "tapak sinchai", "drip sinchai", "sprinkler sinchai", "nahar sinchai", "badh sinchai", "varsha jal sanchayan", "barish", "varsha", "jal prabandhan",
    // Hindi
    "सिंचाई", "पानी देना", "पानी", "ड्रिप सिंचाई", "स्प्रिंकलर सिंचाई", "नहर सिंचाई", "बाढ़ सिंचाई", "वाटर पंप", "ट्यूबवेल", "बोरवेल", "वर्षा जल संचयन", "वर्षा", "जल प्रबंधन",

    /* Pest & Disease */
    // English
    "pest", "pests", "pesticide", "pesticides", "insect", "insects", "fungus", "fungal disease", "bacterial disease", "virus", "crop disease", "plant disease", "weed", "weeds", "insecticide", "fungicide", "herbicide", "nematode", "aphid", "mite", "locust", "pest control",
    // Hinglish
    "keet", "kide", "kitnashak", "kida", "fafund", "fafundi rog", "jivanu rog", "vishanu", "fasal rog", "paudho ka rog", "kharpatwar", "fafundnashak", "kharpatwarnashak", "mahu", "tiddi", "keet niyantran",
    // Hindi
    "कीट", "कीड़े", "कीटनाशक", "फफूंद", "फफूंदी रोग", "जीवाणु रोग", "विषाणु", "फसल रोग", "पौधे का रोग", "खरपतवार", "फफूंदनाशक", "खरपतवारनाशक", "नेमाटोड", "माहू", "माइट", "टिड्डी", "कीट नियंत्रण",

    /* Harvesting */
    // English
    "harvest", "harvesting", "threshing", "crop cutting", "combine harvester", "thresher", "grain separation",
    // Hinglish
    "katai", "fasal katai", "gahai", "dhaan katai", "anaaj alag karna",
    // Hindi
    "कटाई", "फसल की कटाई", "गहाई", "कंबाइन हार्वेस्टर", "थ्रेशर", "अनाज अलग करना",

    /* Post Harvest Handling */
    // English
    "post harvest", "post harvest handling", "crop drying", "grain drying", "cleaning grain", "sorting crops", "grading", "quality check", "moisture control", "crop processing", "milling", "processing unit",
    // Hinglish
    "katai ke baad", "fasal sukhana", "anaaj sukhana", "anaaj ki safai", "fasal ki chhantai", "gunwatta janch", "nami niyantran", "fasal prasanskaran", "prasanskaran ikai",
    // Hindi
    "कटाई के बाद", "कटाई के बाद का प्रबंधन", "फसल सुखाना", "अनाज सुखाना", "अनाज की सफाई", "फसल की छंटाई", "ग्रेडिंग", "गुणवत्ता जांच", "नमी नियंत्रण", "फसल प्रसंस्करण", "मिलिंग", "प्रसंस्करण इकाई",

    /* Storage & Warehousing */
    // English
    "storage", "crop storage", "grain storage", "warehouse", "cold storage", "godown", "silo", "grain silo", "storage facility", "agriculture warehouse", "warehouse management", "storage pest control", "grain preservation",
    // Hinglish
    "bhandaran", "fasal bhandaran", "anaaj bhandaran", "godam", "anaaj silo", "bhandaran suvidha", "krishi godam", "godam prabandhan", "bhandaran keet niyantran", "anaaj sanrakshan",
    // Hindi
    "भंडारण", "फसल भंडारण", "अनाज भंडारण", "गोदाम", "कोल्ड स्टोरेज", "साइलो", "अनाज साइलो", "भंडारण सुविधा", "कृषि गोदाम", "गोदाम प्रबंधन", "भंडारण कीट नियंत्रण", "अनाज संरक्षण",

    /* Crop Transport & Logistics */
    // English
    "crop transport", "transport", "export", "transport crops", "crop movement", "farm transport", "truck transport", "tractor trolley", "pickup transport", "logistics", "supply chain", "food supply chain", "agri logistics", "crop delivery", "farm to market", "crop distribution", "shipment",
    // Hinglish
    "fasal parivahan", "uthaye", "niryaat", "dhone ke liye", "bechne ke liye", "uthane ke liye", "ek jagah se doosre jagah", "fasal aawajahi", "khet parivahan", "truck parivahan", "pickup parivahan", "aapurti shrinkhala", "khadya aapurti shrinkhala", "krishi logistics", "fasal delivery", "khet se mandi", "fasal vitaran",
    // Hindi
    "फसल परिवहन", "निर्यात", "फसल की आवाजाही", "खेत परिवहन", "ट्रक परिवहन", "ट्रैक्टर ट्रॉली", "पिकअप परिवहन", "लॉजिस्टिक्स", "आपूर्ति श्रृंखला", "खाद्य आपूर्ति श्रृंखला", "कृषि लॉजिस्टिक्स", "फसल डिलीवरी", "खेत से बाजार", "फसल वितरण", "शिपमेंट",

    /* Markets & Selling */
    // English
    "mandi", "market", "crop market", "sell crops", "selling crops", "crop price", "minimum support price", "msp", "agriculture market", "farmer market", "wholesale market", "agri trade", "crop trading", "farm produce sale",
    // Hinglish
    "bazar", "fasal mandi", "fasal bechna", "fasal ki kimat", "fasal ke daam", "nyuntam samarthan mulya", "krishi bazar", "kisan bazar", "thok bazar", "krishi vyapar", "fasal vyapar", "kheti ki upaj bikri",
    // Hindi
    "मंडी", "बाजार", "फसल बाजार", "फसल बेचना", "फसलों की बिक्री", "फसल की कीमत", "न्यूनतम समर्थन मूल्य", "एमएसपी", "कृषि बाजार", "किसान बाजार", "थोक बाजार", "कृषि व्यापार", "फसल व्यापार", "कृषि उपज बिक्री",

    /* Machinery */
    // English
    "tractor", "harvester", "thresher", "rotavator", "cultivator", "power tiller", "seed drill", "sprayer", "plough", "plow", "hoe", "sickle", "farm tools", "agriculture tools", "farm equipment", "drone spraying", "agriculture drone",
    // Hinglish
    "hal", "kudal", "daranti", "khet ke auzar", "krishi auzar", "kheti ke upkaran", "drone chhidkaw", "krishi drone",
    // Hindi
    "ट्रैक्टर", "हार्वेस्टर", "थ्रेशर", "रोटावेटर", "कल्टीवेटर", "पावर टिलर", "सीड ड्रिल", "स्प्रेयर", "हल", "कुदाल", "दरांती", "खेत के औजार", "कृषि उपकरण", "कृषि यंत्र", "ड्रोन छिड़काव", "कृषि ड्रोन",

    /* Yield & Production */
    // English
    "yield", "crop yield", "farm production", "agriculture production", "farm productivity", "profit", "farm income",
    // Hinglish
    "upaj", "fasal ki upaj", "kheti ka utpadan", "krishi utpadan", "kheti ki utpadakta", "munafa", "labh", "kheti ki aay", "kisan ki aay",
    // Hindi
    "उपज", "फसल की उपज", "खेत का उत्पादन", "कृषि उत्पादन", "खेत की उत्पादकता", "मुनाफा", "लाभ", "कृषि आय", "किसान की आय",

    /* Livestock */
    // English
    "dairy", "dairy farming", "milk", "cow", "buffalo", "goat farming", "poultry", "chicken farming", "fish farming", "aquaculture", "livestock", "animal feed", "animal disease",
    // Hinglish
    "doodh", "gaye", "bhains", "bakri palan", "murgi palan", "machhli palan", "jaliya krishi", "pashudhan", "pashu aahar", "chara", "pashu rog",
    // Hindi
    "डेयरी", "डेयरी फार्मिंग", "दूध", "गाय", "भैंस", "बकरी पालन", "मुर्गी पालन", "मछली पालन", "जलीय कृषि", "पशुधन", "पशु आहार", "चारा", "पशु रोग",

    /* Government Schemes */
    // English
    "subsidy", "scheme", "government scheme", "yojna", "pm kisan", "pmfbsy", "crop insurance", "soil health card", "kisan credit card", "agriculture loan", "farmer loan",
    // Hinglish
    "chhoot", "sarkari yojana", "yojana", "pmfby", "fasal bima", "mrida swasthya card", "krishi loan", "kisan karz",
    // Hindi
    "सब्सिडी", "छूट", "योजना", "सरकारी योजना", "पीएम किसान", "पीएमएफबीवाई", "फसल बीमा", "मृदा स्वास्थ्य कार्ड", "किसान क्रेडिट कार्ड", "कृषि ऋण", "किसान कर्ज"
];

const socialIndicators = [
    "how was", "how is your", "kaisi rahi", "kaisi gayi", "kaisa raha",
    "how are you", "kaise ho", "kya haal", "theek ho", "fine", "good morning",
    "good afternoon", "good evening", "gn", "gm", "kaise hai", "kaise ho", "kaise gaya"
    , "kaisa ho", "kaisa gaya", "kons tha", "kya tha", "kaisa tha", "kya kar rahe ho", "kya kar rahi ho", "chalo chalta hu", "chalo chalti hu",
    // Tamil
    "eppadi irukkinga", "eppadi irukkiraai", "nalla irukkingala", "vanakkam", "kaalai vanakkam", "madhiya vanakkam", "maalai vanakkam", "iravu vanakkam", "saaptingala",
    "எப்படி இருக்கீங்க", "எப்படி இருக்கிறாய்", "நல்லா இருக்கீங்களா", "வணக்கம்", "காலை வணக்கம்", "மதிய வணக்கம்", "மாலை வணக்கம்", "இரவு வணக்கம்", "சாப்பிட்டீங்களா",
    // Telugu
    "ela unnavu", "ela unnaru", "bagunnara", "namaskaram", "subhodayam", "subhasayam", "subharatri", "tinnara", "em chestunnavu",
    "ఎలా ఉన్నావు", "ఎలా ఉన్నారు", "బాగున్నారా", "నమస్కారం", "శుభోదయం", "శుభ సాయంత్రం", "శుభరాత్రి", "తిన్నారా", "ఏం చేస్తున్నావు",
    // Bengali
    "kemon acho", "kemon achen", "bhalo acho", "bhalo achen", "nomoskar", "suprobhat", "shubho shokal", "shubho bikal", "shubho sondhya", "shubho ratri", "ki korcho", "ki korchen", "khayecho", "kheyechen",
    "কেমন আছো", "কেমন আছেন", "ভালো আছো", "ভালো আছেন", "নমস্কার", "সুপ্রভাত", "শুভ সকাল", "শুভ বিকাল", "শুভ সন্ধ্যা", "শুভ রাত্রি", "কি করছো", "কি করছেন", "খেয়েছো", "খেয়েছেন"
];

export function shouldAIRespond(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // 1. Social Exclusion: Ignore messages that look like personal check-ins or greetings
    const isSocialPersonaChat = socialIndicators.some(indicator => {
        // We use word boundaries \b to match phrases accurately
        const regex = new RegExp(`\\b${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(lowerMessage);
    });

    if (isSocialPersonaChat) return false;

    // 2. Check for explicit question marks
    const hasQuestionMark = lowerMessage.includes("?");

    // 3. Check for question indicators (how, what, why, etc.)
    // We use word boundaries \b to avoid matching substrings like "are" inside "farmers"
    const hasQuestionIndicator = questionIndicators.some(indicator => {
        const regex = new RegExp(`\\b${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(lowerMessage);
    });

    // 4. Check for agricultural topics
    const matchingAgriTopics = agricultureTopics.filter(topic => {
        const regex = new RegExp(`\\b${topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(lowerMessage);
    });

    const hasAgriTopic = matchingAgriTopics.length > 0;
    const hasMultipleAgriTopics = matchingAgriTopics.length >= 2;

    // AI responds if it's a question (mark or word) AND about agriculture
    // OR if it's a specific farming phrase (covered by 2+ keywords)
    return ((hasQuestionIndicator || hasQuestionMark) && hasAgriTopic) || hasMultipleAgriTopics;
}
