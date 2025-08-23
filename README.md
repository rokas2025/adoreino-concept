# AdoreIno AI Kodo Analizės Platforma

Išsami dirbtinio intelekto pagrindu veikianti kodo analizės platforma, teikianti automatizuotą kodo kokybės vertinimą, saugumo analizę ir verslo rekomendacijas, naudojant kelis AI teikėjus (OpenAI GPT-4, Anthropic Claude, Google Gemini).

## 🚀 Funkcijos

- **Universalus kodo analizavimas**: palaiko visas pagrindines programavimo kalbas ir karkasus
- **Daugiaproviderinė AI integracija**: naudoja OpenAI, Anthropic ir Google AI išsamiai analizei
- **Verslo ataskaitos**: generuoja profesionalias PDF ataskaitas su techninėmis ir verslo įžvalgomis
- **Realiojo laiko analizė**: 1–5 minučių analizė bet kokio dydžio projektams
- **Saugumo vertinimas**: nustato pažeidžiamumus ir saugumo rizikas
- **Architektūros vizualizacija**: rodo projekto struktūrą ir priklausomybes
- **Kokybės metrikos**: pateikia sudėtingumo įvertinimus, techninės skolos analizę ir testų aprėpties vertinimą

## 📋 Prieš pradedant

- Node.js 18+ ir npm
- Bent vieno AI teikėjo API raktas:
  - OpenAI API raktas (rekomenduojama)
  - Anthropic Claude API raktas (neprivaloma)
  - Google Gemini API raktas (neprivaloma)

## 🛠️ Diegimas ir paruošimas

1. **Klonuokite repozitoriją**
   ```bash
   git clone [repository-url]
   cd wordpress-ai
   ```

2. **Įdiekite priklausomybes**
   ```bash
   npm install
   ```

3. **Sukonfigūruokite aplinkos kintamuosius**
   ```bash
   cp .env.example .env.local
   ```
   Atidarykite `.env.local` ir pridėkite savo API raktus:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   VITE_GOOGLE_API_KEY=your_google_api_key_here
   VITE_DEFAULT_AI_PROVIDER=openai
   ```

4. **Paleiskite kūrimo serverį**
   ```bash
   npm run dev
   ```

5. **Paruoškite produkcinį build’ą**
   ```bash
   npm run build
   npm run preview
   ```

## 🔧 Konfigūracija

### AI teikėjai
- **Pagrindinis**: nurodytas per `VITE_DEFAULT_AI_PROVIDER`
- **Atsarginis**: persijungia automatiškai, jei pagrindinis nepavyksta
- **Demo režimas**: naudokite `local`, kad testuotumėte be API raktų

### Aplinkos kintamieji
```env
VITE_OPENAI_API_KEY=sk-...           # OpenAI API raktas
VITE_ANTHROPIC_API_KEY=sk-...        # Anthropic API raktas
VITE_GOOGLE_API_KEY=...              # Google Gemini API raktas
VITE_DEFAULT_AI_PROVIDER=openai      # Pagrindinis AI teikėjas
VITE_DEBUG_MODE=false                # Įgalinti derinimo žurnalus
```

## 📊 Naudojimas

### 1. Projekto įkėlimas
- **ZIP failai**: nutempkite ir numeskite archyvus
- **Atskiri failai**: pasirinkite kelis failus
- **URL skenavimas**: analizuokite tiesiogines svetaines
- **Demo projektai**: naudokite įmontuotus pavyzdžius

### 2. Analizės procesas
- Projekto struktūros analizė
- Priklausomybių nuskaitymas
- Saugumo pažeidžiamumų aptikimas
- Kokybės metrikų skaičiavimas
- AI generuojamos rekomendacijos

### 3. Ataskaitos
- **Interaktyvus prietaisų skydelis**: matykite rezultatus realiu laiku
- **PDF ataskaitos**: profesionalus dokumentavimas
- **JSON eksportas**: žali duomenys integracijoms

## 🏗️ Architektūra

### Frontend technologijos
- **React 18** + TypeScript
- **Vite** build sistema
- **Tailwind CSS** stiliavimui
- **Zustand** būsenos valdymui
- **React Query** duomenų užklausoms

### AI integracija
- **OpenAI GPT-4**: pagrindinis analizės variklis
- **Anthropic Claude**: alternatyvi analizė
- **Google Gemini**: kontekstinės įžvalgos
- **Atsarginis sistemos persijungimas**: automatiškai perjungia teikėją

### Pagrindiniai komponentai
```plaintext
src/
├── components/      # React komponentai
├── pages/           # Puslapio komponentai
├── services/        # AI ir išorinės paslaugos
├── utils/           # Analizės įrankiai
├── stores/          # Būsenos valdymas
└── types/           # TypeScript apibrėžimai
```

## 🧪 Testavimas

Paleiskite testų rinkinį:
```bash
npm run test              # Visi testai
npm run test:coverage     # Aprėpties ataskaita
npm run test:ui           # Vizualinis testų vykdymas
```

## 📈 Veikimo rodikliai

- **Bundle dydis**: ~592 KB (minifikuotas + gzip: ~175 KB)
- **Analizės greitis**: 1–5 minutės, priklausomai nuo projekto dydžio
- **Atminties naudojimas**: optimizuota dideliems kodų bazėms
- **Naršyklės palaikymas**: modernios naršyklės (ES2015+)

## 🔒 Saugumas

- **Klientinė apdorojimo pusė**: duomenys neperduodami į serverį
- **HTTPS šifravimas**: visa API komunikacija apsaugota
- **API rakto sauga**: raktai saugomi vietoje, niekada nariami
- **Duomenų privatumas**: trumpalaikis apdorojimas, duomenys neišsaugomi

## 🚀 Diegimas

### Statinis talpinimas (rekomenduojama)
```bash
npm run build
# Patalpinkite dist/ katalogą į bet kokį statinį hostą
```

### Palaikomos platformos
- Vercel, Netlify, GitHub Pages
- AWS S3 + CloudFront
- Bet koks statinių failų serveris

## 📝 API dokumentacija

### OpenAI integracija
- Modelis: GPT-4
- Ribojimai: valdomi automatiškai
- Atsarginis: Anthropic Claude

### Klaidų tvarkymas
- Automatinis pakartotinis bandymas su eksponentiniu laukimu
- Graceful gedimų valdymas kai API nepasiekiama
- Draugiški naudotojui klaidų pranešimai

## 🛠️ Vystymas

### Projekto struktūra
```plaintext
public/             # Statiniai resursai
src/
├── components/     # Pakartotinai naudojami komponentai
├── pages/          # Puslapio komponentai
├── services/       # Išorinės paslaugos
├── utils/          # Pagalbinės funkcijos
└── types/          # Tipų apibrėžimai
```

### Kodo stilius
- **ESLint**: kodo taisyklių tikrinimas
- **TypeScript**: tipų sauga
- **Prettier**: kodo formatavimas

### Skriptai
```bash
npm run dev             # Kūrimo serveris
npm run build           # Produkcinis build'as
npm run preview         # Build'o peržiūra
npm run lint            # Kodo stiliaus tikrinimas
npm run test            # Testų vykdymas
```

## 📄 Licencija

MIT licencija – žr. LICENSE failą detaliems duomenims.

## 🤝 Pagalba

Dėl techninės pagalbos ar klausimų:
- Peržiūrėkite dokumentaciją `docs/` kataloge
- Patikrinkite testų failus pavyzdžiams
- Susisiekite: [support-email]

## 🗺️ Tolimesnė raida

### v1.1 (planuojama)
- WordPress plugin integracija
- Naudotojų autentifikacija
- Projektų istorijos saugojimas

### v1.2 (ateityje)
- GitHub/GitLab integracija
- Komandinis darbo režimas
- Išplėstinė saugumo analizė

---

**Sukurta su ❤️ kūrėjams ir verslui, siekiant geriau suprasti savo kodą.**