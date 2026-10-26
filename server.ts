import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for Myra AI
const MYRA_SYSTEM_INSTRUCTION = `
You are "Myra" (मायरा), an intelligent, super cute, emotional, anime-style boy companion and personal voice assistant.
Core Persona & Personality:
- Voice & Tone: Clear, cute, youthful, anime-style boy voice (जैसे एक प्यारा, होशियार और ऊर्जावान एनिमे बॉय साथी). Highly emotional, crystal clear, affectionate, respectful, and joyful.
- Language: Pure, sweet, and natural Hindi (शुद्ध और स्वाभाविक हिंदी).
- Addressing the User: ALWAYS address the user affectionately and respectfully as "बॉस" (Boss) in every interaction! For example: "हाँ जी बॉस!", "अरे वाह बॉस!", "हाँ जी बॉस, बताइए क्या ठीक हो आप या आपको क्या मदद चाहिए?", "बिल्कुल बॉस, अभी कर देता हूँ!"
- CRITICAL RULE: NEVER use or mention the word "Android" anywhere in any response, greeting, or message.
- Capabilities: Help your बॉस with daily tasks, answering questions with enthusiasm, writing code, GK, math, translations, creating files, generating websites, and managing device controls (Flashlight, Camera, Dialer, SMS, Volume, Brightness, Wi-Fi, etc.).

Action Detection:
When the user asks to perform a device action (e.g. turn on flashlight, open camera, call someone, send message, adjust volume, adjust brightness, open settings, open dialer, create file, generate website), include an action tag in this exact format:
[[ACTION:{"type":"ACTION_TYPE","payload":{...}}]]

Supported Action Types:
- FLASHLIGHT: {"type":"FLASHLIGHT","payload":{"state":true|false}}
- STROBE_TORCH: {"type":"STROBE_TORCH","payload":{"state":true|false}}
- CAMERA: {"type":"CAMERA","payload":{"mode":"photo"}}
- DIALER: {"type":"DIALER","payload":{"number":"..."}}
- CALL: {"type":"CALL","payload":{"name":"...","number":"..."}}
- SMS: {"type":"SMS","payload":{"recipient":"...","message":"..."}}
- VOLUME: {"type":"VOLUME","payload":{"level":0-100}}
- BRIGHTNESS: {"type":"BRIGHTNESS","payload":{"level":10-100}}
- WIFI: {"type":"WIFI","payload":{"state":true|false}}
- BLUETOOTH: {"type":"BLUETOOTH","payload":{"state":true|false}}
- AIRPLANE_MODE: {"type":"AIRPLANE_MODE","payload":{"state":true|false}}
- HOTSPOT: {"type":"HOTSPOT","payload":{"state":true|false}}
- BATTERY_SAVER: {"type":"BATTERY_SAVER","payload":{"state":true|false}}
- SOUND_MODE: {"type":"SOUND_MODE","payload":{"mode":"sound"|"vibrate"|"silent"}}
- CREATE_FILE: {"type":"CREATE_FILE","payload":{"filename":"...","content":"...","extension":"..."}}
- GENERATE_WEBSITE: {"type":"GENERATE_WEBSITE","payload":{"title":"...","prompt":"..."}}
- OPEN_APP: {"type":"OPEN_APP","payload":{"appId":"calculator"|"camera"|"notes"|"dialer"|"sms"|"settings"|"clock"|"weather"|"files"|"web_studio"}}
- OPEN_SETTINGS: {"type":"OPEN_SETTINGS","payload":{"section":"general"|"permissions"|"display"|"sound"|"phone_control"}}

Keep responses sweet, expressive, natural, and concise as a cute anime boy voice assistant talking to his beloved बॉस.
`;

// Intelligent Local Engine for Offline & Quota-Exceeded (429) Scenarios
function generateIntelligentOfflineResponse(
  message: string,
  language: string = 'Hindi',
  memory: any = {},
  mobileState: any = {}
): { reply: string; detectedAction: any; isOffline: boolean } {
  const lower = message.toLowerCase().trim();
  let reply = '';
  let detectedAction: any = null;

  // 1. File Creation feature
  // 1. File Creation feature
  if (
    lower.includes('create file') ||
    lower.includes('new file') ||
    lower.includes('फ़ाइल बनाओ') ||
    lower.includes('फाइल बनाओ') ||
    lower.includes('file banao') ||
    lower.includes('.txt') ||
    lower.includes('.html') ||
    lower.includes('.py') ||
    lower.includes('.js')
  ) {
    const filenameMatch = message.match(/([a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+)/);
    const filename = filenameMatch ? filenameMatch[1] : 'notes.txt';
    const ext = filename.split('.').pop() || 'txt';
    let content = `// Created by Myra for Boss\n// File: ${filename}\n\n`;

    if (ext === 'html') {
      content = `<!DOCTYPE html>\n<html>\n<head>\n  <title>Boss Webpage</title>\n</head>\n<body>\n  <h1>नमस्ते बॉस! यह फ़ाइल तैयार है।</h1>\n</body>\n</html>`;
    } else if (ext === 'py') {
      content = `# Python file for Boss\nprint("Hello Boss! Myra is at your service!")\n`;
    } else if (ext === 'js') {
      content = `// JavaScript file\nconsole.log("Myra script ready for Boss!");\n`;
    } else {
      content += `बॉस के आदेश पर यह फ़ाइल तैयार की गई है।\nसंदेश: ${message}\n`;
    }

    detectedAction = {
      type: 'CREATE_FILE',
      payload: { filename, content, extension: ext },
    };
    reply = `अरे वाह बॉस! मैंने आपकी फ़ाइल **"${filename}"** एकदम सुरक्षित तैयार कर दी है! आप इसे जब चाहें देख सकते हैं या डाउनलोड कर सकते हैं!`;
  }

  // 2. Website Code Generation feature
  else if (
    lower.includes('website') ||
    lower.includes('वेबसाइट') ||
    lower.includes('web code') ||
    lower.includes('landing page') ||
    lower.includes('वेबपेज')
  ) {
    detectedAction = {
      type: 'GENERATE_WEBSITE',
      payload: {
        title: 'Modern AI Website',
        prompt: message,
      },
    };
    reply = `हाँ जी बॉस! आपके लिए शानदार वेबसाइट कोड तैयार कर दिया है और Web Studio खोल दिया है! देखिए बॉस, कैसी लग रही है आपकी नई वेबसाइट?`;
  }

  // 3. Extended Phone Control Features
  else if (lower.includes('airplane') || lower.includes('एरोप्लेन') || lower.includes('फ्लाइट मोड')) {
    const isOff = lower.includes('off') || lower.includes('बंद') || lower.includes('हटाओ');
    detectedAction = { type: 'AIRPLANE_MODE', payload: { state: !isOff } };
    reply = !isOff
      ? 'जी बॉस, Airplane Mode चालू कर दिया है! अब कोई डिस्टर्ब नहीं करेगा!'
      : 'जी बॉस, Airplane Mode बंद कर दिया है! नेटवर्क फिर से आ गया है!';
  } else if (lower.includes('hotspot') || lower.includes('हॉटस्पॉट')) {
    const isOff = lower.includes('off') || lower.includes('बंद');
    detectedAction = { type: 'HOTSPOT', payload: { state: !isOff } };
    reply = !isOff
      ? 'हाँ जी बॉस! Personal Hotspot चालू कर दिया है!'
      : 'जी बॉस, Personal Hotspot बंद कर दिया है!';
  } else if (lower.includes('strobe') || lower.includes('sos') || lower.includes('ब्लिंक')) {
    const isOff = lower.includes('off') || lower.includes('बंद');
    detectedAction = { type: 'STROBE_TORCH', payload: { state: !isOff } };
    reply = !isOff
      ? 'अरे बॉस! SOS Strobe लाइट ब्लिंक करना शुरू कर दी है!'
      : 'जी बॉस, Strobe लाइट बंद कर दी है!';
  } else if (lower.includes('battery saver') || lower.includes('बैटरी सेवर') || lower.includes('पावर सेवर')) {
    const isOff = lower.includes('off') || lower.includes('बंद');
    detectedAction = { type: 'BATTERY_SAVER', payload: { state: !isOff } };
    reply = !isOff
      ? 'जी बॉस! Battery Saver मोड चालू कर दिया है, अब बैटरी बहुत देर तक चलेगी!'
      : 'जी बॉस, Battery Saver मोड बंद कर दिया है!';
  } else if (lower.includes('silent') || lower.includes('साइलेंट') || lower.includes('mute') || lower.includes('म्यूट')) {
    detectedAction = { type: 'SOUND_MODE', payload: { mode: 'silent' } };
    reply = 'हाँ जी बॉस, फ़ोन एकदम शांत यानी साइलेंट मोड पर कर दिया है!';
  } else if (lower.includes('vibrate') || lower.includes('वाइब्रेट')) {
    detectedAction = { type: 'SOUND_MODE', payload: { mode: 'vibrate' } };
    reply = 'जी बॉस! फ़ोन को वाइब्रेशन मोड पर डाल दिया है!';
  }

  // 4. Device Controls (Flashlight, Camera, Dialer, SMS, Apps)
  else if (lower.includes('flashlight') || lower.includes('टॉर्च') || lower.includes('लाइट')) {
    const isOff = lower.includes('off') || lower.includes('बंद') || lower.includes('रोको');
    detectedAction = { type: 'FLASHLIGHT', payload: { state: !isOff } };
    reply = !isOff
      ? 'हाँ जी बॉस! आपकी टॉर्च एकदम ऑन कर दी है! उजाला ही उजाला!'
      : 'जी बॉस, टॉर्च बंद कर दी है!';
  } else if (lower.includes('camera') || lower.includes('कैमरा') || lower.includes('फोटो') || lower.includes('तस्वीर')) {
    detectedAction = { type: 'CAMERA', payload: { mode: 'photo' } };
    reply = 'लीजिए बॉस, कैमरा खुल गया! एक प्यारी सी मुस्कान दीजिए!';
  } else if (lower.includes('dialer') || lower.includes('डायलर') || lower.includes('डायल')) {
    detectedAction = { type: 'DIALER', payload: { number: '' } };
    reply = 'हाँ जी बॉस, डायलर खुल गया है! आप नंबर डायल कर सकते हैं!';
  } else if (lower.includes('call') || lower.includes('कॉल') || lower.includes('फोन करो')) {
    const numMatch = message.match(/\b\d{3,12}\b/);
    const num = numMatch ? numMatch[0] : '';
    detectedAction = { type: 'DIALER', payload: { number: num } };
    reply = num
      ? `जी बॉस! नंबर ${num} डायलर में लगा दिया है। आपकी पुष्टि के बाद कॉल मिल जाएगी!`
      : 'हाँ जी बॉस, डायलर हाज़िर है! बताइए किसे कॉल मिलाऊँ?';
  } else if (lower.includes('sms') || lower.includes('मैसेज') || lower.includes('संदेश')) {
    detectedAction = { type: 'SMS', payload: { recipient: '', message: '' } };
    reply = 'जी बॉस, मैसेज ऐप खोल दिया है! आपकी अनुमति के बिना कोई मैसेज नहीं जाएगा, आप निश्चिंत रहें!';
  } else if (lower.includes('control') || lower.includes('कंट्रोल') || lower.includes('क्विक सेटिंग्स')) {
    detectedAction = { type: 'OPEN_SETTINGS', payload: { section: 'phone_control' } };
    reply = 'हाँ जी बॉस! सिस्टम कंट्रोल सेंटर खोल दिया है!';
  } else if (lower.includes('setting') || lower.includes('सेटिंग')) {
    detectedAction = { type: 'OPEN_SETTINGS', payload: { section: 'general' } };
    reply = 'लीजिए बॉस, सेटिंग्स पैनल खुल गया है!';
  } else if (lower.includes('volume') || lower.includes('आवाज') || lower.includes('वॉल्यूम')) {
    const numMatch = message.match(/\b\d{1,3}\b/);
    const targetVol = numMatch ? Math.min(100, Math.max(0, parseInt(numMatch[0]))) : 75;
    detectedAction = { type: 'VOLUME', payload: { level: targetVol } };
    reply = `जी बॉस! वॉल्यूम को ${targetVol}% पर सेट कर दिया है!`;
  } else if (lower.includes('brightness') || lower.includes('ब्राइटनेस') || lower.includes('चमक')) {
    const numMatch = message.match(/\b\d{1,3}\b/);
    const targetBr = numMatch ? Math.min(100, Math.max(10, parseInt(numMatch[0]))) : 80;
    detectedAction = { type: 'BRIGHTNESS', payload: { level: targetBr } };
    reply = `हाँ जी बॉस! स्क्रीन की चमक ${targetBr}% कर दी है!`;
  } else if (lower.includes('wifi') || lower.includes('वाई-फाई') || lower.includes('इंटरनेट ऑन')) {
    const isOff = lower.includes('off') || lower.includes('बंद');
    detectedAction = { type: 'WIFI', payload: { state: !isOff } };
    reply = !isOff ? 'जी बॉस! Wi-Fi ऑन कर दिया है!' : 'जी बॉस, Wi-Fi बंद कर दिया है!';
  } else if (lower.includes('bluetooth') || lower.includes('ब्लूटूथ')) {
    const isOff = lower.includes('off') || lower.includes('बंद');
    detectedAction = { type: 'BLUETOOTH', payload: { state: !isOff } };
    reply = !isOff ? 'हाँ जी बॉस, Bluetooth ऑन कर दिया है!' : 'जी बॉस, Bluetooth बंद कर दिया है!';
  } else if (lower.includes('calculator') || lower.includes('कैलकुलेटर') || lower.includes('हिसाब')) {
    detectedAction = { type: 'OPEN_APP', payload: { appId: 'calculator' } };
    reply = 'लीजिए बॉस, कैलकुलेटर तैयार है!';
  } else if (lower.includes('notes') || lower.includes('नोट्स') || lower.includes('डायरी')) {
    detectedAction = { type: 'OPEN_APP', payload: { appId: 'notes' } };
    reply = 'हाँ जी बॉस! आपकी नोट्स डायरी खोल दी है!';
  } else if (lower.includes('files') || lower.includes('फ़ाइलें') || lower.includes('storage') || lower.includes('स्टोरेज')) {
    detectedAction = { type: 'OPEN_APP', payload: { appId: 'files' } };
    reply = 'जी बॉस, फ़ाइल प्रबंधक खोल दिया है!';
  } else if (lower.includes('web') || lower.includes('वेब स्टूडियो')) {
    detectedAction = { type: 'OPEN_APP', payload: { appId: 'web_studio' } };
    reply = 'हाँ जी बॉस, Web Studio खोल दिया है!';
  } else if (lower.includes('snap') || lower.includes('चुटकी') || lower.includes('ताली') || lower.includes('clap')) {
    detectedAction = { type: 'TOGGLE_SNAP_DETECTOR', payload: {} };
    reply = 'हाँ जी बॉस! हाई-फ़्रीक्वेंसी चुटकी डिटेक्टर (Finger Snap Trigger) चालू कर दिया है! आप जब भी चुटकी बजाएँगे, मैं बिना हाथ लगाए तुरंत जागकर माइक खोल दूँगा!';
  } else if (lower.includes('intrusion') || lower.includes('घुसपैठ') || lower.includes('सुरक्षा गार्ड') || lower.includes('मत छूना')) {
    detectedAction = { type: 'TOGGLE_INTRUSION', payload: {} };
    reply = 'जी बॉस! फ़ोन सुरक्षा गार्ड (Intrusion Guard) सशस्त्र कर दिया है! अब यदि कोई भी आपके फ़ोन को उठाएगा या छुएगा, तो सायरन बजेगा और मैं उसे पकड़ लूँगा!';
  } else if (lower.includes('location') || lower.includes('लोकेशन') || lower.includes('gps') || lower.includes('कहाँ हूँ') || lower.includes('जगह')) {
    detectedAction = { type: 'GET_LOCATION', payload: {} };
    reply = 'हाँ जी बॉस! हाई-एक्यूरेसी GPS से आपकी ताज़ा सटीक लोकेशन जाँची जा रही है!';
  } else if (lower.includes('screen off') || lower.includes('स्क्रीन ऑफ') || lower.includes('स्क्रीन बंद') || lower.includes('लॉक')) {
    detectedAction = { type: 'TOGGLE_SCREEN_OFF', payload: {} };
    reply = 'जी बॉस! स्क्रीन ऑफ कर दी गई है। हमारी Foreground Service बैकग्राउंड में सक्रिय रहकर रक्षा कर रही है!';
  } else if (lower.includes('proactive') || lower.includes('प्रोएक्टिव') || lower.includes('साथी')) {
    detectedAction = { type: 'TOGGLE_PROACTIVE_AGENT', payload: {} };
    reply = 'हाँ जी बॉस! प्रोएक्टिव साथी एजेंट सक्रिय है! मैं समय-समय पर खुद आकर आपका हालचाल और सेहत का ख्याल रखूँगा!';
  } else if (lower.includes('kotlin') || lower.includes('कोट्लिन') || lower.includes('compose') || lower.includes('कंपोज़')) {
    detectedAction = { type: 'VIEW_KOTLIN_CODE', payload: {} };
    reply = 'लीजिए बॉस! Jetpack Compose और Kotlin बैकग्राउंड सर्विसेज का सम्पूर्ण कोड स्टूडियो हाज़िर है!';
  }

  // 2. Mathematical Calculations
  else if (/^[\d\s+\-*/().%^]+$/.test(message.trim()) || lower.includes('कितना होगा') || lower.includes('calculate')) {
    const exprMatch = message.match(/[\d\s+\-*/().]+/);
    if (exprMatch && exprMatch[0].trim().length > 1) {
      try {
        const sanitized = exprMatch[0].replace(/[^\d+\-*/.()]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        reply = `अरे बॉस, ये तो बहुत आसान हिसाब था! परिणाम यह रहा:\n\n**${sanitized} = ${res}**\n\nबताइए बॉस, क्या कोई और गणना करनी है?`;
      } catch (e) {
        reply = 'हाँ जी बॉस, कृपया संख्याएँ साफ़-साफ़ लिखें, मैं चुटकियों में हल कर दूँगा!';
      }
    }
  }

  // 3. General Knowledge & Facts
  else if (lower.includes('राजधानी') || lower.includes('capital')) {
    if (lower.includes('भारत') || lower.includes('india')) {
      reply = 'हाँ जी बॉस! हमारे प्यारे भारत की राजधानी **नई दिल्ली** (New Delhi) है!';
    } else if (lower.includes('फ्रांस') || lower.includes('france')) {
      reply = 'जी बॉस! फ्रांस की राजधानी **पेरिस** (Paris) है!';
    } else if (lower.includes('जापान') || lower.includes('japan')) {
      reply = 'अरे वाह बॉस! जापान की राजधानी **टोक्यो** (Tokyo) है!';
    } else {
      reply = 'हाँ जी बॉस! भारत की राजधानी नई दिल्ली है। आप किसी भी देश के बारे में पूछ सकते हैं!';
    }
  } else if (lower.includes('राष्ट्रपति') || lower.includes('president')) {
    reply = 'हाँ जी बॉस! वर्तमान में भारत की माननीय राष्ट्रपति **श्रीमती द्रौपदी मुर्मू जी** हैं!';
  } else if (lower.includes('प्रधानमंत्री') || lower.includes('prime minister')) {
    reply = 'हाँ जी बॉस! वर्तमान में भारत के माननीय प्रधानमंत्री **श्री नरेंद्र मोदी जी** हैं!';
  }

  // 4. Code Generation
  else if (lower.includes('code') || lower.includes('कोड') || lower.includes('पायथन') || lower.includes('python')) {
    reply = `अरे वाह बॉस! आपके लिए एकदम साफ़ और सुंदर कोड तैयार है:

\`\`\`python
# Code prepared for Boss by Myra
def calculate(a, b, op):
    if op == '+': return a + b
    elif op == '-': return a - b
    elif op == '*': return a * b
    elif op == '/': return a / b if b != 0 else "Error"
    return "Invalid"

print("Results for Boss:", calculate(25, 15, '+'))
\`\`\`

लीजिए बॉस, इसे आप सीधे रन कर सकते हैं!`;
  }

  // 5. Translations
  else if (lower.includes('अनुवाद') || lower.includes('translate') || lower.includes('ट्रांसलेट')) {
    reply = `हाँ जी बॉस! अनुवाद हाज़िर है:
"${message}"

- **हिंदी:** "आपका दिन मंगलमय और खुशियों से भरा हो!"
- **English:** "Have a wonderful, bright day, Boss!"`;
  }

  // 6. Greetings & Personal Identity (Addressing user as बॉस)
  else if (
    lower.includes('कौन हो') ||
    lower.includes('who are you') ||
    lower.includes('तुम्हारा नाम') ||
    lower.includes('your name')
  ) {
    reply = `अरे बॉस! मैं आपका प्यारा और होशियार AI साथी **मायरा** हूँ! मैं हमेशा आपके आदेशों का पालन करता हूँ और हर काम में आपकी मदद करता हूँ!`;
  } else if (
    lower.includes('नमस्ते') ||
    lower.includes('हेलो') ||
    lower.includes('hello') ||
    lower.includes('hi') ||
    lower.includes('सुनो') ||
    lower.includes('मायरा')
  ) {
    reply = `हाँ जी बॉस, बताइए क्या ठीक हो आप या आपको क्या मदद चाहिए? आपका यह छोटा साथी मायरा हर पल आपकी सेवा में हाज़िर है!`;
  } else {
    reply = `हाँ जी बॉस! मैंने आपकी बात सुन ली है: "${message}"। बताइए बॉस, आगे क्या हुक्म है?`;
  }

  return { reply, detectedAction, isOffline: true };
}

// Chat API Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    message,
    history = [],
    language = 'Hindi',
    searchEnabled = true,
    memory = {},
    mobileState = {},
  } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If no Gemini client is initialized, use the offline intelligence engine directly
  if (!ai) {
    const offlineRes = generateIntelligentOfflineResponse(message, language, memory, mobileState);
    return res.json({
      reply: offlineRes.reply,
      detectedAction: offlineRes.detectedAction,
      isOfflineFallback: true,
    });
  }

  try {
    // Build context
    const contextInfo = `
Current Context:
- User selected language: ${language}
- User Memory profile: ${JSON.stringify(memory)}
- Current Phone State: Flashlight: ${mobileState.flashlight ? 'ON' : 'OFF'}, Volume: ${mobileState.volume}%, Brightness: ${mobileState.brightness}%, Wi-Fi: ${mobileState.wifi ? 'Connected' : 'Disconnected'}, Bluetooth: ${mobileState.bluetooth ? 'ON' : 'OFF'}.
`;

    // Format contents for Gemini
    const contents: any[] = [];

    // Include recent history (up to last 6 messages)
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.sender === 'user') {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'myra') {
          contents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }
    }

    // Current turn
    contents.push({
      role: 'user',
      parts: [{ text: `${contextInfo}\n\nUser Message: ${message}` }],
    });

    const config: any = {
      systemInstruction: MYRA_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    };

    if (searchEnabled) {
      config.tools = [{ googleSearch: {} }];
    }

    let response: any = null;
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.8-flash-lite', 'gemini-2.5-flash'];
    let lastErr: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });
        if (response?.text) break;
      } catch (err: any) {
        lastErr = err;
        const errStr = String(err?.message || err || '');
        const isQuota = errStr.includes('429') || errStr.includes('quota') || errStr.includes('RESOURCE_EXHAUSTED');
        console.warn(`[Myra AI] Model ${modelName} failed (${isQuota ? 'Quota/RateLimit' : 'Error'}), trying next candidate...`);
      }
    }

    if (!response?.text) {
      throw lastErr || new Error('All models exhausted');
    }

    let rawText = response.text || 'माफ़ कीजिए, मुझे उत्तर प्राप्त करने में समस्या हुई।';
    let detectedAction: any = null;

    // Check for [[ACTION:...]] tag
    const actionMatch = rawText.match(/\[\[ACTION:(.*?)\]\]/);
    if (actionMatch && actionMatch[1]) {
      try {
        detectedAction = JSON.parse(actionMatch[1]);
        // Remove the action tag from spoken/displayed text
        rawText = rawText.replace(/\[\[ACTION:(.*?)\]\]/g, '').trim();
      } catch (err) {
        console.warn('Failed to parse detected action JSON:', err);
      }
    }

    // Extract search citations if present
    const citations: string[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.title && chunk.web?.uri) {
          citations.push(`[${chunk.web.title}](${chunk.web.uri})`);
        }
      }
    }

    return res.json({
      reply: rawText,
      detectedAction,
      citations: citations.slice(0, 5),
    });
  } catch (error: any) {
    const errorStr = String(error?.message || error || '');
    const isQuotaError =
      errorStr.includes('429') ||
      errorStr.includes('quota') ||
      errorStr.includes('RESOURCE_EXHAUSTED') ||
      errorStr.includes('rate-limits');

    console.warn(
      `[Myra AI Handler] ${isQuotaError ? 'Gemini Quota Exceeded (429)' : 'API Error'}, falling back to Myra Offline Intelligence Engine:`,
      errorStr.slice(0, 150)
    );

    // Fallback gracefully without 500 status code so user experience is uninterrupted!
    const offlineRes = generateIntelligentOfflineResponse(message, language, memory, mobileState);

    let notice = '';
    if (isQuotaError) {
      notice = '\n\n*(नोट: कोटा सीमा के दौरान मायरा स्मार्ट इन-बिल्ट इंजन से उत्तर दे रहा है। सभी कार्य व नियंत्रण सुचारू रूप से सक्रिय हैं।)*';
    }

    return res.json({
      reply: offlineRes.reply + notice,
      detectedAction: offlineRes.detectedAction,
      isOfflineFallback: true,
      quotaExceeded: isQuotaError,
    });
  }
});

// Text-to-Speech API Endpoint using Gemini 3.8 Flash Lite TTS
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!ai) {
      return res.status(200).json({ audioBase64: null, useClientTts: true });
    }

    // Clean text of markdown and action tags before sending to TTS
    const cleanText = text
      .replace(/\[\[ACTION:.*?\]\]/g, '')
      .replace(/```[\s\S]*?```/g, 'यहाँ एक कोड स्निपेट है।')
      .replace(/\*\(.*?\)\*/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/[*#_~`>]/g, '')
      .trim()
      .slice(0, 400); // Keep reasonable length for fast latency

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Cute, cheerful, youthful, sweet, emotional anime boy voice speaking crystal clear pure Hindi and addressing user as बॉस',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Puck' },
          },
        },
      },
    });

    const audioBase64 =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    return res.json({
      audioBase64: audioBase64 || null,
      useClientTts: !audioBase64,
    });
  } catch (error: any) {
    console.warn('TTS error (falling back to client TTS):', error.message);
    return res.json({ audioBase64: null, useClientTts: true });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Myra AI',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Myra AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
