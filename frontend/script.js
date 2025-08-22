// 📦 Dépendances
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// 🔌 Modules internes
const { sendSmartMessage } = require("./api");
const { saveMemory } = require("./db/memory");
const { scheduleKeyReset } = require("./api/keyManager");

// 🚀 Initialisation du serveur
const app = express();
const PORT = process.env.PORT || 3000;

// 🧰 Middleware
app.use(cors());
app.use(bodyParser.json());

// ───── Pool de clés avec rotation + cooldown
class KeyPool {
    constructor(keys=[], cooldownSec=60){
        this.items = keys.map(k=>({key:k,coolUntil:0}));
        this.i=0;
        this.cooldownSec=cooldownSec;
    }
    next(){
        const now = Date.now();
        for(let tries=0; tries<this.items.length; tries++){
            const idx = (this.i + tries)%this.items.length;
            const it = this.items[idx];
            if(now >= it.coolUntil){ this.i=(idx+1)%this.items.length; return it; }
        }
        return null;
    }
    cooldown(item, sec=this.cooldownSec){ item.coolUntil = Date.now()+sec*1000; }
    hasUsable(){ return this.items.some(it=>Date.now()>=it.coolUntil); }
}

function parseKeys(envName){
    return (process.env[envName]||'').split(',').map(s=>s.trim()).filter(Boolean);
}

const pools = {
    openai: new KeyPool(parseKeys('OPENAI_KEYS')),
    openrouter: new KeyPool(parseKeys('OPENROUTER_KEYS')),
    gemini: new KeyPool(parseKeys('GEMINI_KEYS')),
    cohere: new KeyPool(parseKeys('COHERE_KEYS')),
    ai21: new KeyPool(parseKeys('AI21_KEYS')),
};

function providersOrder(){
    return (process.env.PROVIDERS||'openai,openrouter').split(',').map(p=>p.trim().toLowerCase()).filter(p=>pools[p]?.items?.length);
}

// ───── Fonction dispatch multi-clés / multi-providers
async function dispatchSmartMessage(message){
    const order = providersOrder();
    let lastErr;
    for(const prov of order){
        const pool = pools[prov];
        if(!pool?.hasUsable()) continue;
        const fn = sendSmartMessage; // Ici tu peux adapter selon provider
        const tried = new Set();
        while(pool.hasUsable() && tried.size<pool.items.length){
            const item = pool.next();
            if(!item || tried.has(item)) break;
            tried.add(item);
            try{
                // Passer la clé comme paramètre si nécessaire
                const reply = await fn(message, prov, item.key);
                return {reply, provider:prov, key:item.key};
            }catch(e){
                pool.cooldown(item,60);
                lastErr=e;
            }
        }
    }
    throw lastErr||new Error('Tous les providers/clefs ont échoué');
}

// 📥 Endpoint principal pour les messages utilisateur
app.post("/api/chat", async (req, res) => {
    const userMessage = req.body.message || "Bonjour";
    try {
        const {reply, provider, key} = await dispatchSmartMessage(userMessage);
        saveMemory("user", userMessage);
        saveMemory("assistant ROAM", reply);
        res.json({ response: reply, provider, key });
    } catch (error) {
        console.error("❌ Erreur serveur :", error.message);
        res.status(500).json({ response: error.message });
    }
});

// 🧠 Historique mémoire (optionnel)
app.get("/api/memory", async (req, res) => {
    const { getMemory } = require("./db/memory");
    try {
        const memory = await getMemory(20);
        res.json(memory);
    } catch (err) {
        res.status(500).json({ error: "Erreur mémoire" });
    }
});

// 🔁 Reset automatique des clés API chaque nuit
scheduleKeyReset();

// 🔓 Démarrage du serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur backend ROAM'S 🔥 démarré : http://localhost:${PORT}`);
});
