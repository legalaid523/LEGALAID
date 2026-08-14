/**
 * Translations for LegalAId — English, Hindi, Hinglish
 *
 * Each key maps to { en, hi, hinglish } strings.
 * The `t(key, lang)` helper resolves the right string at runtime.
 */

const translations = {
  // ── Welcome & general ────────────────────────────────────────────
  welcome: {
    en: `Welcome to **LegalAId** — your intelligent legal rights assistant.\n\nDescribe your legal issue in detail: what happened, when, and who is involved. I will classify your case, gather the relevant facts, and identify the applicable Indian laws for your situation.\n\nYou can speak in **English**, **Hindi**, or **Hinglish**.`,
    hi: `**LegalAId** में आपका स्वागत है — आपका बुद्धिमान कानूनी अधिकार सहायक।\n\nअपनी कानूनी समस्या का विस्तार से वर्णन करें: क्या हुआ, कब हुआ, और कौन शामिल है। मैं आपके मामले को वर्गीकृत करूंगा, प्रासंगिक तथ्य एकत्र करूंगा, और आपकी स्थिति पर लागू होने वाले भारतीय कानूनों की पहचान करूंगा।\n\nआप **हिंदी**, **अंग्रेज़ी**, या **हिंग्लिश** में बात कर सकते हैं।`,
    hinglish: `**LegalAId** mein aapka swagat hai — aapka intelligent legal rights assistant.\n\nApni legal problem detail mein batayein: kya hua, kab hua, aur kaun involved hai. Main aapke case ko classify karunga, relevant facts collect karunga, aur applicable Indian laws identify karunga.\n\nAap **English**, **Hindi**, ya **Hinglish** mein baat kar sakte hain.`,
  },

  disclaimer: {
    en: 'This is not a substitute for professional legal advice.',
    hi: 'यह पेशेवर कानूनी सलाह का विकल्प नहीं है।',
    hinglish: 'Yeh professional legal advice ka substitute nahi hai.',
  },

  // ── Chat input ───────────────────────────────────────────────────
  inputPlaceholder: {
    en: 'Describe your situation...',
    hi: 'अपनी स्थिति का वर्णन करें...',
    hinglish: 'Apni situation describe karein...',
  },

  conversationComplete: {
    en: 'Conversation complete',
    hi: 'बातचीत पूरी हुई',
    hinglish: 'Conversation complete ho gaya',
  },

  inputHint: {
    en: 'Share dates, amounts, and any correspondence you have — the more detail, the better.',
    hi: 'तारीखें, राशि, और कोई भी पत्र-व्यवहार साझा करें — जितना अधिक विवरण, उतना बेहतर।',
    hinglish: 'Dates, amounts, aur koi bhi correspondence share karein — jitna detail, utna better.',
  },

  // ── Loading ──────────────────────────────────────────────────────
  analyzingCase: {
    en: 'Analyzing your case...',
    hi: 'आपके मामले का विश्लेषण हो रहा है...',
    hinglish: 'Aapke case ka analysis ho raha hai...',
  },

  // ── Case analysis result ─────────────────────────────────────────
  caseAnalysisComplete: {
    en: 'Case Analysis Complete',
    hi: 'मामले का विश्लेषण पूरा हुआ',
    hinglish: 'Case Analysis Complete Ho Gaya',
  },

  domainLabel: {
    en: 'Domain',
    hi: 'क्षेत्र',
    hinglish: 'Domain',
  },

  issueLabel: {
    en: 'Issue',
    hi: 'मुद्दा',
    hinglish: 'Issue',
  },

  matchScoreLabel: {
    en: 'Match Score',
    hi: 'मिलान स्कोर',
    hinglish: 'Match Score',
  },

  extractedFactsLabel: {
    en: 'Extracted Facts',
    hi: 'एकत्रित तथ्य',
    hinglish: 'Extracted Facts',
  },

  disputeLabel: {
    en: 'Dispute',
    hi: 'विवाद',
    hinglish: 'Dispute',
  },

  caseResultSuffix: {
    en: 'Below you will find your applicable legal rights, recommended evidence to strengthen your case, and a downloadable legal notice.',
    hi: 'नीचे आपको अपने लागू कानूनी अधिकार, आपके मामले को मजबूत करने के लिए अनुशंसित साक्ष्य, और एक डाउनलोड करने योग्य कानूनी नोटिस मिलेगा।',
    hinglish: 'Neeche aapko applicable legal rights, case strengthen karne ke liye recommended evidence, aur downloadable legal notice milega.',
  },

  // ── No match ─────────────────────────────────────────────────────
  noMatchMessage: {
    en: `I was unable to match your situation to a specific tracked legal section. This doesn't mean you don't have rights — it means your case may require professional legal counsel.\n\n**Suggestions:**\n• Try describing your situation with more specific details\n• Contact your nearest Legal Aid office\n• You can start a new conversation to try again`,
    hi: `मैं आपकी स्थिति को किसी विशिष्ट ट्रैक किए गए कानूनी अनुभाग से मिलान करने में असमर्थ रहा। इसका मतलब यह नहीं है कि आपके अधिकार नहीं हैं — इसका मतलब है कि आपके मामले में पेशेवर कानूनी सलाह की आवश्यकता हो सकती है।\n\n**सुझाव:**\n• अधिक विशिष्ट विवरण के साथ अपनी स्थिति का वर्णन करने का प्रयास करें\n• अपने निकटतम विधिक सहायता कार्यालय से संपर्क करें\n• आप फिर से प्रयास करने के लिए एक नई बातचीत शुरू कर सकते हैं`,
    hinglish: `Main aapki situation ko kisi specific tracked legal section se match nahi kar paya. Iska matlab yeh nahi ki aapke rights nahi hain — iska matlab hai ki aapke case mein professional legal counsel ki zaroorat ho sakti hai.\n\n**Suggestions:**\n• Zyada specific details ke saath apni situation describe karne ki koshish karein\n• Apne nearest Legal Aid office se contact karein\n• Aap dobara try karne ke liye naya conversation start kar sakte hain`,
  },

  // ── Error ─────────────────────────────────────────────────────────
  errorPrefix: {
    en: 'Error',
    hi: 'त्रुटि',
    hinglish: 'Error',
  },

  connectionError: {
    en: 'Could not connect to the backend server. Make sure the FastAPI server is running.',
    hi: 'बैकएंड सर्वर से कनेक्ट नहीं हो सका। सुनिश्चित करें कि FastAPI सर्वर चल रहा है।',
    hinglish: 'Backend server se connect nahi ho paya. Make sure FastAPI server chal raha hai.',
  },

  // ── Voice input ──────────────────────────────────────────────────
  voiceInputSoon: {
    en: 'Voice input (coming soon)',
    hi: 'आवाज इनपुट (जल्द आ रहा है)',
    hinglish: 'Voice input (jald aa raha hai)',
  },

  // ── Rights card ──────────────────────────────────────────────────
  yourLegalRights: {
    en: 'Your Legal Rights',
    hi: 'आपके कानूनी अधिकार',
    hinglish: 'Aapke Legal Rights',
  },

  yourRightsPrefix: {
    en: 'Your Rights',
    hi: 'आपके अधिकार',
    hinglish: 'Aapke Rights',
  },

  applicableLaws: {
    en: 'Applicable Laws',
    hi: 'लागू कानून',
    hinglish: 'Applicable Laws',
  },

  stateSpecificNote: {
    en: 'State-specific rules may vary. Keep written records of all communication.',
    hi: 'राज्य-विशिष्ट नियम भिन्न हो सकते हैं। सभी संचार का लिखित रिकॉर्ड रखें।',
    hinglish: 'State-specific rules alag ho sakte hain. Saari communication ka written record rakhein.',
  },

  // ── Confidence flags card ────────────────────────────────────────
  strengthenCase: {
    en: 'Strengthen your case',
    hi: 'अपना मामला मजबूत करें',
    hinglish: 'Apna case mazboot karein',
  },

  strengthenCaseItems: {
    en: (count) => `${count} item${count !== 1 ? 's' : ''} to gather for stronger evidence`,
    hi: (count) => `मजबूत साक्ष्य के लिए ${count} चीज़${count !== 1 ? 'ें' : ''} एकत्र करने हैं`,
    hinglish: (count) => `Stronger evidence ke liye ${count} item${count !== 1 ? 's' : ''} collect karne hain`,
  },

  strengthenCaseFooter: {
    en: 'Gathering these documents before sending your notice will make your position significantly stronger.',
    hi: 'अपना नोटिस भेजने से पहले ये दस्तावेज़ एकत्र करने से आपकी स्थिति काफी मजबूत होगी।',
    hinglish: 'Apna notice bhejne se pehle yeh documents collect karne se aapki position kaafi strong hogi.',
  },

  // ── PDF button ───────────────────────────────────────────────────
  legalNoticePrefix: {
    en: 'Legal Notice',
    hi: 'कानूनी नोटिस',
    hinglish: 'Legal Notice',
  },

  // ── Quick reply labels ───────────────────────────────────────────
  yes: {
    en: 'Yes',
    hi: 'हाँ',
    hinglish: 'Haan',
  },

  no: {
    en: 'No',
    hi: 'नहीं',
    hinglish: 'Nahi',
  },

  // ── Send button ──────────────────────────────────────────────────
  sendMessage: {
    en: 'Send message',
    hi: 'संदेश भेजें',
    hinglish: 'Message bhejein',
  },

  changeLanguage: {
    en: 'Change language',
    hi: 'भाषा बदलें',
    hinglish: 'Language change karein',
  },

  // ── New chat / multi-question ─────────────────────────────────────
  newChat: {
    en: 'New Chat',
    hi: 'नई चैट',
    hinglish: 'Naya Chat',
  },

  askAnotherQuestion: {
    en: 'Ask another legal question...',
    hi: 'एक और कानूनी सवाल पूछें...',
    hinglish: 'Ek aur legal question poochein...',
  },

  newQuestion: {
    en: 'New Question',
    hi: 'नया सवाल',
    hinglish: 'Naya Question',
  },

  newQuestionHint: {
    en: 'Starting a fresh analysis — describe your next legal issue below.',
    hi: 'एक नया विश्लेषण शुरू हो रहा है — अपनी अगली कानूनी समस्या नीचे बताएं।',
    hinglish: 'Fresh analysis start ho raha hai — apni next legal problem neeche batayein.',
  },
};

/**
 * Resolve a language code to a translation key.
 * 'en' → 'en', 'hi' → 'hi', 'hi-en' / 'hinglish' → 'hinglish'
 */
function resolveLang(langCode) {
  if (!langCode) return 'en';
  const lower = langCode.toLowerCase();
  if (lower === 'hi') return 'hi';
  if (lower === 'hinglish' || lower === 'hi-en') return 'hinglish';
  return 'en';
}

/**
 * Get a translated string by key.
 *
 * @param {string} key — dot-path key into translations (e.g. 'welcome')
 * @param {string} langCode — 'en', 'hi', or 'hi-en'/'hinglish'
 * @param  {...any} args — extra args for function-type translations
 * @returns {string}
 */
export function t(key, langCode, ...args) {
  const entry = translations[key];
  if (!entry) {
    console.warn(`[i18n] Missing translation key: "${key}"`);
    return key;
  }

  const lang = resolveLang(langCode);
  let value = entry[lang] ?? entry.en; // fall back to English

  if (typeof value === 'function') {
    return value(...args);
  }

  return value;
}

export { translations };
export default t;
