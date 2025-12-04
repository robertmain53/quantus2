## Come avviare la creazione automatica

Per la creazione automatica con script python

1. Se nella cartella inputs non ci sono i file zip e le cartelle corrispondenti (OPEN AI legge le cartelle e non i file) nella cartella scripts/generate-zip aprire il file keywords.txt, caricarvi le keywords e i nomi file e lanciare index.js

2. Dalla cartella scripts lanciare generate-prompts.js per la creazione dei file json in generated/prompts. Fare attenzione che questo file genera solo i calcolatori che hanno data di pubblicazione pari a oggi o anteriormente a oggi.

3. dalla root del progetto lanciare l'automazione pyton, ad esempio in batch da 3:

uc@uc:~/Projects/quantus2$ source .venv/bin/activate
(.venv) uc@uc:~/Projects/quantus2$ python factory_runner.py 36 3


questo push su vercel

4. Aprire Vercel e guardare se ci sono errori di build. Risolverli. Ripushare manualmente con 

git add .
git commit -m "fix row x"
git push -u origin main


Lo script automaticamente aggiunge le date di creazione sul file calc.csv


# Come gestire la revisione manuale