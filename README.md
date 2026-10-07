# UNIGRAM — Daily Pages Website

Har din ek nayi HTML file `pages/` folder me daalo → website par apne aap nayi date ka button aa jayega
(bilkul `14-15-17-25_sept_06_oct.html` ki tarah). Koi code edit nahi karna.

## 📁 Roz nayi file kahan daalni hai?

**`pages/` folder me.** Bas.

Naam ka format (koi bhi chalega):

| Naam | Website par label |
|------|-------------------|
| `07-10-2026.html` ✅ (best) | 07 OCT |
| `2026-10-08.html` | 08 OCT |
| `9 oct.html` | 09 OCT (saal = `site.config.json` ka `defaultYear`) |

- Date ke hisaab se **apne aap sorted** hota hai (purani → nayi).
- Jis file ka naam `_` se shuru ho (`_draft.html`) wo website par nahi dikhti.
- Website kholne par **sabse nayi date** pehle khulti hai. Pehli date se shuru karna ho to `site.config.json` me `"defaultPage": "first"` kar do.

## 🚀 Roz ka kaam (2 minute)

### Tarika A — GitHub website se (easy, Git install nahi chahiye)
1. GitHub par apna repo kholo → `pages` folder me jao
2. **Add file → Upload files** → nayi `07-10-2026.html` drag karo
3. **Commit changes** dabao
4. 30–60 second me Vercel / Render khud redeploy kar dega ✅

> GitHub website upload ki limit: ek file max 25 MB. (Tumhari sabse badi file ~2.6 MB hai, to koi dikkat nahi.)

### Tarika B — Git se
```bash
# nayi file pages/ me copy karo, phir:
git add .
git commit -m "07 Oct page"
git push
```

## 🌐 Pehli baar deploy karna

Pehle repo GitHub par daalo: GitHub → **New repository** → is zip ke andar ki saari files upload karo
(`pages/`, `src/`, `build.js`, `vercel.json`, `render.yaml`, ... sab).

### Vercel (free)
1. vercel.com → **Add New → Project** → apna GitHub repo import karo
2. Framework Preset: **Other** (baaki sab `vercel.json` se apne aap set hota hai)
3. **Deploy** ✅ — link milega `xxxx.vercel.app`

### Render (free)
1. render.com → **New → Static Site** → apna GitHub repo select karo
2. Build Command: `node build.js`
3. Publish Directory: `dist`
4. **Create Static Site** ✅ — link milega `xxxx.onrender.com`

(Ya **New → Blueprint** choose karo — `render.yaml` se sab auto set ho jata hai.)

## 💻 Apne computer par test karna (optional)
```bash
node build.js
cd dist
python -m http.server 8000     # phir browser me http://localhost:8000
```
> `index.html` ko seedha double-click karke mat kholna — pages iframe me load hote hain, local server se kholo.

## 🗂 Folder structure
```
pages/               ← 👈 YAHAN roz nayi HTML daalo
src/index.template.html   ← website ka design (switcher bar)
build.js             ← pages/ scan karke dist/ banata hai
site.config.json     ← title, default page, default year
vercel.json          ← Vercel settings
render.yaml          ← Render settings
```

## ℹ️ Notes
- Site par `noindex` laga hai, to Google search me nahi aayegi (sirf link wale dekh payenge).
- Date ka naam samajh na aaye to file list ke end me filename ke label se dikhegi, aur build log me warning aayegi.
- Ek hi date ki 2 files ho to labels `07 OCT` aur `07 OCT · 2` banenge.
