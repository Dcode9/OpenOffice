export type TranslateLanguage = 'English' | 'Spanish' | 'French' | 'German' | 'Hindi'

export type TranslationRow = Record<Exclude<TranslateLanguage, 'English'>, string>

const PHRASES: Record<string, TranslationRow> = {
  'good morning': { Spanish: 'buenos días', French: 'bonjour', German: 'guten Morgen', Hindi: 'सुप्रभात' },
  'good afternoon': { Spanish: 'buenas tardes', French: 'bon après-midi', German: 'guten Tag', Hindi: 'नमस्ते' },
  'good evening': { Spanish: 'buenas noches', French: 'bonsoir', German: 'guten Abend', Hindi: 'शुभ संध्या' },
  'thank you': { Spanish: 'gracias', French: 'merci', German: 'danke', Hindi: 'धन्यवाद' },
  'thank you very much': { Spanish: 'muchas gracias', French: 'merci beaucoup', German: 'vielen Dank', Hindi: 'बहुत धन्यवाद' },
  'how are you': { Spanish: '¿cómo estás?', French: 'comment allez-vous ?', German: 'wie geht es dir?', Hindi: 'आप कैसे हैं?' },
  'see you later': { Spanish: 'hasta luego', French: 'à plus tard', German: 'bis später', Hindi: 'फिर मिलेंगे' },
  'welcome to openoffice': { Spanish: 'bienvenido a OpenOffice', French: 'bienvenue dans OpenOffice', German: 'willkommen bei OpenOffice', Hindi: 'ओपनऑफिस में आपका स्वागत है' },
  'the best way to predict the future is to invent it': {
    Spanish: 'la mejor manera de predecir el futuro es inventarlo',
    French: "la meilleure façon de prédire l'avenir est de l'inventer",
    German: 'der beste Weg, die Zukunft vorherzusagen, ist, sie zu erfinden',
    Hindi: 'भविष्य का अनुमान लगाने का सबसे अच्छा तरीका उसे आविष्कार करना है',
  },
}

const WORDS: Record<string, TranslationRow> = {
  welcome: { Spanish: 'bienvenido', French: 'bienvenue', German: 'willkommen', Hindi: 'स्वागत' },
  to: { Spanish: 'a', French: 'à', German: 'zu', Hindi: 'को' },
  the: { Spanish: 'el', French: 'le', German: 'der', Hindi: 'वह' },
  a: { Spanish: 'un', French: 'un', German: 'ein', Hindi: 'एक' },
  document: { Spanish: 'documento', French: 'document', German: 'Dokument', Hindi: 'दस्तावेज़' },
  editor: { Spanish: 'editor', French: 'éditeur', German: 'Editor', Hindi: 'संपादक' },
  word: { Spanish: 'palabra', French: 'mot', German: 'Wort', Hindi: 'शब्द' },
  words: { Spanish: 'palabras', French: 'mots', German: 'Wörter', Hindi: 'शब्द' },
  text: { Spanish: 'texto', French: 'texte', German: 'Text', Hindi: 'पाठ' },
  page: { Spanish: 'página', French: 'page', German: 'Seite', Hindi: 'पृष्ठ' },
  pages: { Spanish: 'páginas', French: 'pages', German: 'Seiten', Hindi: 'पृष्ठ' },
  file: { Spanish: 'archivo', French: 'fichier', German: 'Datei', Hindi: 'फ़ाइल' },
  open: { Spanish: 'abrir', French: 'ouvrir', German: 'öffnen', Hindi: 'खोलें' },
  save: { Spanish: 'guardar', French: 'enregistrer', German: 'speichern', Hindi: 'सहेजें' },
  print: { Spanish: 'imprimir', French: 'imprimer', German: 'drucken', Hindi: 'प्रिंट करें' },
  help: { Spanish: 'ayuda', French: 'aide', German: 'Hilfe', Hindi: 'सहायता' },
  home: { Spanish: 'inicio', French: 'accueil', German: 'Start', Hindi: 'होम' },
  insert: { Spanish: 'insertar', French: 'insérer', German: 'einfügen', Hindi: 'सम्मिलित करें' },
  design: { Spanish: 'diseño', French: 'conception', German: 'Entwurf', Hindi: 'डिज़ाइन' },
  layout: { Spanish: 'diseño', French: 'mise en page', German: 'Layout', Hindi: 'लेआउट' },
  references: { Spanish: 'referencias', French: 'références', German: 'Referenzen', Hindi: 'संदर्भ' },
  mailings: { Spanish: 'correspondencia', French: 'publipostage', German: 'Sendungen', Hindi: 'मेलिंग' },
  review: { Spanish: 'revisar', French: 'révision', German: 'Überprüfen', Hindi: 'समीक्षा' },
  view: { Spanish: 'vista', French: 'affichage', German: 'Ansicht', Hindi: 'दृश्य' },
  comment: { Spanish: 'comentario', French: 'commentaire', German: 'Kommentar', Hindi: 'टिप्पणी' },
  comments: { Spanish: 'comentarios', French: 'commentaires', German: 'Kommentare', Hindi: 'टिप्पणियाँ' },
  changes: { Spanish: 'cambios', French: 'modifications', German: 'Änderungen', Hindi: 'परिवर्तन' },
  language: { Spanish: 'idioma', French: 'langue', German: 'Sprache', Hindi: 'भाषा' },
  translate: { Spanish: 'traducir', French: 'traduire', German: 'übersetzen', Hindi: 'अनुवाद करें' },
  accessibility: { Spanish: 'accesibilidad', French: 'accessibilité', German: 'Barrierefreiheit', Hindi: 'पहुँच' },
  spelling: { Spanish: 'ortografía', French: 'orthographe', German: 'Rechtschreibung', Hindi: 'वर्तनी' },
  grammar: { Spanish: 'gramática', French: 'grammaire', German: 'Grammatik', Hindi: 'व्याकरण' },
  thesaurus: { Spanish: 'tesauro', French: 'dictionnaire des synonymes', German: 'Thesaurus', Hindi: 'शब्दकोश' },
  table: { Spanish: 'tabla', French: 'tableau', German: 'Tabelle', Hindi: 'तालिका' },
  picture: { Spanish: 'imagen', French: 'image', German: 'Bild', Hindi: 'चित्र' },
  style: { Spanish: 'estilo', French: 'style', German: 'Stil', Hindi: 'शैली' },
  paragraph: { Spanish: 'párrafo', French: 'paragraphe', German: 'Absatz', Hindi: 'अनुच्छेद' },
  font: { Spanish: 'fuente', French: 'police', German: 'Schriftart', Hindi: 'फ़ॉन्ट' },
  color: { Spanish: 'color', French: 'couleur', German: 'Farbe', Hindi: 'रंग' },
  work: { Spanish: 'trabajo', French: 'travail', German: 'Arbeit', Hindi: 'काम' },
  good: { Spanish: 'bueno', French: 'bon', German: 'gut', Hindi: 'अच्छा' },
  new: { Spanish: 'nuevo', French: 'nouveau', German: 'neu', Hindi: 'नया' },
  next: { Spanish: 'siguiente', French: 'suivant', German: 'weiter', Hindi: 'अगला' },
  previous: { Spanish: 'anterior', French: 'précédent', German: 'zurück', Hindi: 'पिछला' },
  yes: { Spanish: 'sí', French: 'oui', German: 'ja', Hindi: 'हाँ' },
  no: { Spanish: 'no', French: 'non', German: 'nein', Hindi: 'नहीं' },
  please: { Spanish: 'por favor', French: "s'il vous plaît", German: 'bitte', Hindi: 'कृपया' },
  today: { Spanish: 'hoy', French: "aujourd'hui", German: 'heute', Hindi: 'आज' },
  tomorrow: { Spanish: 'mañana', French: 'demain', German: 'morgen', Hindi: 'कल' },
  future: { Spanish: 'futuro', French: 'avenir', German: 'Zukunft', Hindi: 'भविष्य' },
  world: { Spanish: 'mundo', French: 'monde', German: 'Welt', Hindi: 'दुनिया' },
  computer: { Spanish: 'ordenador', French: 'ordinateur', German: 'Computer', Hindi: 'कंप्यूटर' },
  and: { Spanish: 'y', French: 'et', German: 'und', Hindi: 'और' },
  or: { Spanish: 'o', French: 'ou', German: 'oder', Hindi: 'या' },
  is: { Spanish: 'es', French: 'est', German: 'ist', Hindi: 'है' },
  are: { Spanish: 'son', French: 'sont', German: 'sind', Hindi: 'हैं' },
  this: { Spanish: 'este', French: 'ce', German: 'dieser', Hindi: 'यह' },
  that: { Spanish: 'ese', French: 'cela', German: 'das', Hindi: 'वह' },
}

function translateToken(token: string, target: Exclude<TranslateLanguage, 'English'>) {
  const match = token.match(/^([^\p{L}]*)([\p{L}][\p{L}'’-]*)([^\p{L}]*)$/u)
  if (!match) return token
  const [, prefix, word, suffix] = match
  const row = WORDS[word.toLowerCase()]
  if (!row) return token
  return `${prefix}${row[target]}${suffix}`
}

export function translateText(text: string, target: TranslateLanguage) {
  if (target === 'English') return text
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ')
  const phrase = PHRASES[normalized]
  if (phrase) {
    const translated = phrase[target]
    return text.trim().replace(/\S+[\s\S]*/, translated)
  }
  return text.replace(/[\p{L}][\p{L}'’-]*/gu, (token) => translateToken(token, target))
}

export function phrasebookSize() {
  return Object.keys(WORDS).length + Object.keys(PHRASES).length
}
