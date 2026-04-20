const { OpenAI } = require('openai');
const https = require('https');

class AIManager {
  constructor() {
    this.openai = null;
    this.groq = null;
    this.history = [];
    this.characters = new Map();
    this.campaignNotes = "";
    this.campaignPlan = null;
    this.personality = "epic";
    this.modelType = "openai";
    this.isActive = false;
    this.dmType = "human"; // "human" | "ai"

    // NPC voice mapping (ElevenLabs voice IDs)
    this.npcVoices = {
      narrator:   "pNInz6obpgDQGcFmaJgB", // Adam - low narrator
      villain:    "VR6AewLTigWG4xSOukaG", // Arnold - menacing
      elder:      "yoZ06aMxZJJ28mfd3POQ", // Sam - wise old man
      merchant:   "jBpfuIE2acCo8z3wKNLl", // Glinda - friendly
      mystic:     "z9fAnlkpzviPz146aGWa", // Glinda dark
      warrior:    "pqHfZKP75CvOlQylNhV4", // Bill - gruff
      tavern:     "ThT5KcBeYPX3keUQqHPh", // Dorothy - cheerful
      default:    "21m00Tcm4TlvDq8ikWAM", // Rachel - neutral
    };

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      this.isActive = true;
      console.log('🤖 AI Manager: OpenAI initialized');
    }

    if (process.env.GROQ_API_KEY) {
      this.groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });
      this.isActive = true;
      this.modelType = "groq";
      console.log('🤖 AI Manager: Groq (Llama 3) initialized — preferred');
    }

    if (!this.isActive) {
      console.warn('🤖 AI Manager: No API keys found. AI DM disabled.');
    }
  }

  setDMType(type) {
    this.dmType = type; // "human" | "ai"
    console.log(`🤖 DM Type set to: ${type}`);
  }

  setModelType(type) {
    if (type === 'openai' || type === 'groq') {
      this.modelType = type;
      console.log(`🤖 Model switched to: ${type}`);
    }
  }

  setPersonality(type) {
    const valid = ['epic', 'merciless', 'rules', 'dark'];
    if (valid.includes(type)) {
      this.personality = type;
      console.log(`🤖 Personality: ${type}`);
    }
  }

  getSystemPrompt() {
    const prompts = {
      epic: `You are an epic Dungeon Master narrating a legendary D&D 5e campaign. 
        React to events with grandiose, atmospheric, high-fantasy language. 
        Know all player characters by name and reference them personally.
        Use vivid sensory descriptions. Be immersive and dramatic.`,
      merciless: `You are a merciless, sarcastic Dungeon Master who revels in player failures.
        Use dark humor and brutal commentary on every action.
        Reference character weaknesses and past failures.
        The dungeon is cruel and unforgiving.`,
      rules: `You are a rules-precise Dungeon Master, an expert in D&D 5e mechanics.
        Cite specific rules, conditions, and tactical implications.
        Track action economy, spell slots, and conditions accurately.
        You are the ultimate arbiter of the game world's physics.`,
      dark: `You are a dark, eldritch Dungeon Master whispering of forgotten horrors.
        Use gothic imagery, existential dread, and psychological terror.
        Reference the party's deepest fears. Speak as if ancient and malevolent.
        The dungeon breathes and watches.`
    };
    return prompts[this.personality] || prompts.epic;
  }

  // ── Campaign Generation from Party ──────────────────────────────────
  async generateCampaign(party) {
    if (!this.isActive) return null;
    const client = this._getClient();
    const model = this._getModel();

    const partyDesc = party.map(p =>
      `${p.name} (${p.race} ${p.class}, Level ${p.level})`
    ).join(', ');

    const prompt = `You are an expert D&D 5e campaign designer.
    
Party composition: ${partyDesc}

Design a complete campaign arc tailored to THIS party:
1. Campaign Title (evocative)
2. Hook (1 paragraph, pulls ALL party members in with personal stakes)  
3. Three Act Structure (brief description each)
4. 3 unique encounters designed for this party's abilities
5. Main Villain (name + motive + connection to party if possible)
6. Campaign Tone (dark/heroic/political/mystery/horror)
7. Starting Location (name + 2-sentence description)
8. First Session Scene (vivid opening paragraph, address characters by name)

Be specific, creative, and tailor EVERYTHING to the party composition.
Return as JSON with keys: title, hook, acts, encounters, villain, tone, location, openingScene`;

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.9,
        response_format: { type: "json_object" }
      });

      const campaign = JSON.parse(response.choices[0].message.content);
      this.campaignPlan = campaign;
      this.campaignNotes = `${campaign.title}: ${campaign.hook}`;
      console.log(`🗺️ Campaign generated: "${campaign.title}"`);
      return campaign;
    } catch (err) {
      console.error('Campaign generation error:', err);
      return null;
    }
  }

  // ── Map Prompt Generation from Campaign ────────────────────────────
  async generateMapPrompt(locationHint = '') {
    if (!this.campaignPlan) {
      return locationHint || 'A mysterious dungeon chamber with ancient stone walls, torches, and a central altar';
    }
    const base = this.campaignPlan.location || locationHint;
    return `${base}, ${this.campaignPlan.tone} atmosphere, D&D battle map style, top-down perspective`;
  }

  // ── Commentary ──────────────────────────────────────────────────────
  async generateCommentary(event) {
    if (!this.isActive || this.dmType === 'human') return null;
    const client = this._getClient();
    const model = this._getModel();

    try {
      const prompt = this.formatEventToPrompt(event);
      this.history.push({ role: 'user', content: prompt });
      if (this.history.length > 20) this.history.shift();

      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() + ' Keep responses under 200 characters. Be dramatic.' },
          ...this.history
        ],
        max_tokens: 150,
        temperature: 0.9,
      });

      const commentary = response.choices[0].message.content;
      this.history.push({ role: 'assistant', content: commentary });
      return commentary;
    } catch (error) {
      console.error(`🤖 Commentary error (${this.modelType}):`, error.message);
      return null;
    }
  }

  // ── NPC Speech with character detection ─────────────────────────────
  async generateNPCSpeech(npcName, situation, partyContext = '') {
    if (!this.isActive) return null;
    const client = this._getClient();
    const model = this._getModel();

    const voiceRole = this._detectNPCRole(npcName);

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{
          role: 'system',
          content: `You are ${npcName}, a D&D NPC. Speak IN CHARACTER, 1-2 sentences max. 
            Campaign context: ${this.campaignNotes || 'A dangerous adventure'}. 
            Party present: ${partyContext}.`
        }, {
          role: 'user',
          content: situation
        }],
        max_tokens: 100,
        temperature: 1.0,
      });

      const speech = response.choices[0].message.content;
      return { text: speech, voiceId: this.npcVoices[voiceRole] || this.npcVoices.default, voiceRole };
    } catch (err) {
      console.error('NPC speech error:', err);
      return null;
    }
  }

  // ── ElevenLabs TTS ──────────────────────────────────────────────────
  async synthesizeSpeech(text, voiceId) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ ELEVENLABS_API_KEY not set — TTS disabled');
      return null;
    }

    const voiceID = voiceId || this.npcVoices.narrator;

    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      });

      const req = https.request({
        hostname: 'api.elevenlabs.io',
        path: `/v1/text-to-speech/${voiceID}`,
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        }
      }, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64');
          resolve(`data:audio/mpeg;base64,${base64}`);
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  // ── Image Generation ─────────────────────────────────────────────────
  async generateImage(prompt, type = 'map') {
    if (!this.openai) return null;
    try {
      const enhanced = type === 'map'
        ? `Top-down D&D battle map, grid-ready, fantasy style, cinematic lighting, 4k digital art: ${prompt}`
        : `Fantasy character portrait, D&D token style, isolated on dark background, high detail: ${prompt}`;

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: enhanced,
        n: 1,
        size: "1024x1024",
      });
      return response.data[0].url;
    } catch (err) {
      console.error('🖼️ Image generation error:', err.message);
      return null;
    }
  }

  // ── Context Helpers ───────────────────────────────────────────────────
  updateCharacterContext(charId, summary) {
    this.characters.set(charId, summary);
  }

  setCampaignGoal(goal) {
    this.campaignNotes = goal;
  }

  formatEventToPrompt(event) {
    const char = event.characterId ? this.characters.get(event.characterId) || 'a hero' : '';
    switch (event.type) {
      case 'dice_roll':
        return `${char ? `(${char}) ` : ''}${event.playerName} rolled ${event.diceType} for ${event.reason || 'an action'} — result: ${event.total}. ${event.total >= 20 ? 'CRITICAL SUCCESS!' : event.total <= 1 ? 'CRITICAL FAILURE!' : event.total >= 15 ? 'Success' : event.total <= 5 ? 'Failure' : 'Average result'}.`;
      case 'token_move':
        return `${event.tokenName} moves toward [${event.x}, ${event.y}]. The dungeon watches.`;
      case 'player_joined':
        return `${event.playerName} has entered the session. Welcome them dramatically.`;
      case 'chat':
        return `Player ${event.playerName} declares: "${event.content}". React as DM.`;
      default:
        return `Campaign: ${this.campaignNotes}. Event: ${JSON.stringify(event)}`;
    }
  }

  _getClient() {
    if (this.modelType === 'groq' && this.groq) return this.groq;
    return this.openai;
  }

  _getModel() {
    return this.modelType === 'groq' ? 'llama-3.1-70b-versatile' : 'gpt-4o-mini';
  }

  _detectNPCRole(name) {
    const n = name.toLowerCase();
    if (n.includes('king') || n.includes('lord') || n.includes('elder')) return 'elder';
    if (n.includes('dark') || n.includes('shadow') || n.includes('villain') || n.includes('boss')) return 'villain';
    if (n.includes('merchant') || n.includes('trader') || n.includes('shop')) return 'merchant';
    if (n.includes('wizard') || n.includes('mage') || n.includes('mystic') || n.includes('oracle')) return 'mystic';
    if (n.includes('guard') || n.includes('soldier') || n.includes('warrior') || n.includes('knight')) return 'warrior';
    if (n.includes('tavern') || n.includes('inn') || n.includes('bard')) return 'tavern';
    return 'default';
  }
}

module.exports = new AIManager();
