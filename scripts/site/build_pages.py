#!/usr/bin/env python3
"""Generate Walkever SEO content pages (guides, calculators), sitemap.xml and llms.txt.

Static output goes into site/ (served as-is by Vercel). Run: python3 scripts/site/build_pages.py
Home pages (site/fr/index.html, site/en/index.html) are hand-written; this script only
keeps their footer links in sync between the GUIDES markers.
"""
import html, json, os, re, datetime, subprocess

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'site')
BASE = 'https://www.walkever.app'
APP_ID = '6762572011'
TODAY = datetime.date.today().isoformat()


def store(lang, ct):
    cc = 'fr' if lang == 'fr' else 'us'
    return f'https://apps.apple.com/{cc}/app/id{APP_ID}?ct={ct}&mt=8'


def j(o):
    return '<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False, separators=(',', ':')) + '</script>'


ORG = {"@type": "Organization", "@id": BASE + "/#org", "name": "BELLASOR", "url": BASE + "/",
       "email": "contact@walkever.app", "logo": BASE + "/img/logo-512.png"}

# ---------------------------------------------------------------- pages
# key -> {fr: path, en: path}
PAGES = {}


def page(key, lang, path, **kw):
    PAGES.setdefault(key, {})[lang] = dict(path=path, lang=lang, key=key, **kw)


# ---------- 1. Steps <-> distance
def strides_table(lang):
    rows = []
    heights = [155, 165, 175, 185]
    counts = [5000, 8000, 10000, 12000, 15000, 20000]
    for c in counts:
        cells = []
        for h in heights:
            km = c * h / 100 * 0.414 / 1000
            if lang == 'fr':
                cells.append(f'{km:.1f}'.replace('.', ',') + ' km')
            else:
                cells.append(f'{km/1.609344:.1f} mi ({km:.1f} km)')
        lab = f'{c:,}'.replace(',', ' ' if lang == 'fr' else ',')
        rows.append(f'<tr><th scope="row">{lab} {"pas" if lang=="fr" else "steps"}</th>' + ''.join(f'<td>{x}</td>' for x in cells) + '</tr>')
    if lang == 'fr':
        head = '<tr><th>Pas</th>' + ''.join(f'<th>{h} cm</th>' for h in heights) + '</tr>'
    else:
        head = '<tr><th>Steps</th>' + ''.join(f'<th>{h} cm ({int(h/2.54)//12}′{round(h/2.54)%12}″)</th>' for h in heights) + '</tr>'
    return f'<table class="tbl"><thead>{head}</thead><tbody>{"".join(rows)}</tbody></table>'


page('distance', 'fr', '/fr/10000-pas-en-km/',
     title='10 000 pas en km — convertisseur selon ta taille',
     h1='10 000 pas, ça fait combien de km ?',
     desc="10 000 pas ≈ 7 km pour une personne de 170 cm. Calcule en ligne selon ta taille — pas, km, temps de marche. Télécharge Walkever sur l'App Store.",
     tool='sd',
     answer="<p><b>10 000 pas ≈ 7 km</b> pour une personne de 1,70 m (foulée d'environ 70 cm), soit 1 h 30 à 1 h 45 de marche. Plus tu es grand, plus ta foulée est longue : de 6,4 km à 1,55 m jusqu'à 7,7 km à 1,85 m.</p>",
     body=lambda: f"""
<div class="tool" id="sd">
 <div class="row">
  <label>Nombre de pas<input id="sd-n" type="number" inputmode="numeric" min="0" step="500" value="10000"></label>
  <label>Ta taille (cm)<input id="sd-h" type="number" inputmode="numeric" min="100" max="230" value="170"></label>
  <label>Profil<select id="sd-s"><option value="x">Non précisé</option><option value="f">Femme</option><option value="m">Homme</option></select></label>
 </div>
 <div class="out" aria-live="polite">
  <div class="hl"><b id="sd-km">–</b><small>distance</small></div>
  <div><b id="sd-t">–</b><small>de marche (≈ 100 pas/min)</small></div>
  <div><b id="sd-str">–</b><small>longueur de foulée estimée</small></div>
 </div>
 <div class="row" style="margin-top:22px">
  <label>Distance visée (km)<input id="sd-d" type="number" inputmode="decimal" min="0" step="0.5" value="5"></label>
  <div class="out" style="margin:0"><div><b id="sd-need">–</b><small>pas nécessaires</small></div></div>
 </div>
 <span hidden id="sd-mi"></span>
</div>
<p class="note">Estimation : foulée ≈ taille × 0,413 (femme) ou × 0,415 (homme). Ta foulée réelle varie avec la vitesse, le terrain et la pente.</p>

<h2>Tableau : pas en km selon la taille</h2>
{strides_table('fr')}

<h2>Comment le calcul fonctionne</h2>
<p>La distance parcourue, c'est simplement <b>nombre de pas × longueur de foulée</b>. La longueur de foulée (d'un talon au talon de l'autre pied) se mesure mal à l'œil, alors on l'estime à partir de la taille : environ 41 % de ta taille. À 1,70 m, ça donne 70 cm par pas, donc 1 km ≈ 1 400 pas.</p>
<p>Pour une mesure plus fidèle, compte tes pas sur une distance connue (une piste de 400 m par exemple) et divise la distance par le nombre de pas.</p>

<h2>Repères rapides</h2>
<ul>
 <li><b>1 km</b> ≈ 1 300 à 1 500 pas selon ta taille.</li>
 <li><b>5 000 pas</b> ≈ 3,5 km, environ 50 minutes de marche.</li>
 <li><b>10 000 pas</b> ≈ 7 km, entre 1 h 30 et 1 h 45 de marche à allure normale.</li>
 <li><b>20 000 pas</b> ≈ 14 km, soit plus de 3 heures de marche.</li>
</ul>
<p>Au quotidien, ces pas s'accumulent sans que tu y penses : trajets, courses, escaliers. C'est pour ça qu'il vaut mieux suivre une <b>moyenne sur le mois</b> que viser un chiffre rond chaque jour : un jour à 6 000 pas se rattrape par un week-end à 14 000.</p>

<h2>Et sur iPhone ?</h2>
<p>L'app Santé d'Apple compte tes pas et affiche aussi une distance « marche et course ». Elle utilise ta taille et, si tu as une Apple Watch, ton allure réelle : c'est généralement plus précis qu'une formule. Ce qu'elle ne te dit pas, c'est si tu es dans le rythme pour tenir ton objectif du mois. C'est exactement ce que fait Walkever.</p>
""",
     faq=[("10 000 pas, combien de km pour une femme ?", "Pour une femme de 1,60 m à 1,65 m, 10 000 pas représentent environ 6,6 à 6,8 km. La différence avec un homme vient surtout de la taille, pas du sexe."),
          ("Combien de pas pour faire 1 km ?", "Entre 1 300 et 1 500 pas pour un adulte, selon sa taille et son allure. À 1,70 m, compte environ 1 400 pas."),
          ("Combien de temps pour faire 10 000 pas ?", "Environ 1 h 30 à 1 h 45 de marche à allure normale (100 à 110 pas par minute). Dans la vraie vie, ils se répartissent sur toute la journée."),
          ("Le calcul est-il précis ?", "C'est une estimation à ±10 %. La foulée raccourcit en montée, en ville ou à petite allure et s'allonge quand tu marches vite.")],
     related=['steps', 'pace'])

page('distance', 'en', '/en/steps-to-miles/',
     title='Steps to Miles Calculator — How Far Is 10,000 Steps?',
     h1='Steps to miles: how far is 10,000 steps?',
     desc="10,000 steps ≈ 4.4 miles (7 km) at 5′7″. Free calculator by height — steps, miles, km and walking time. Download Walkever on the App Store.",
     tool='sd',
     answer="<p><b>10,000 steps ≈ 4.4 miles (7 km)</b> for someone 5′7″ (170 cm) with a stride of about 28 inches, which takes roughly 1 h 30 to 1 h 45 of walking. Taller people cover more ground: from about 4 miles at 5′1″ to 4.8 miles at 6′1″.</p>",
     body=lambda: f"""
<div class="tool" id="sd">
 <div class="row">
  <label>Number of steps<input id="sd-n" type="number" inputmode="numeric" min="0" step="500" value="10000"></label>
  <label>Your height<input id="sd-h" type="number" inputmode="decimal" min="40" max="230" value="67"></label>
  <label>Height unit<select id="sd-u"><option value="in">inches</option><option value="cm">cm</option></select></label>
  <label>Profile<select id="sd-s"><option value="x">Not specified</option><option value="f">Woman</option><option value="m">Man</option></select></label>
 </div>
 <div class="out" aria-live="polite">
  <div class="hl"><b id="sd-mi">–</b><small>distance</small></div>
  <div><b id="sd-km">–</b><small>in kilometers</small></div>
  <div><b id="sd-t">–</b><small>of walking (≈ 100 steps/min)</small></div>
  <div><b id="sd-str">–</b><small>estimated stride</small></div>
 </div>
 <div class="row" style="margin-top:22px">
  <label>Target distance<input id="sd-d" type="number" inputmode="decimal" min="0" step="0.5" value="3"></label>
  <label>Unit<select id="sd-du"><option value="mi">miles</option><option value="km">km</option></select></label>
  <div class="out" style="margin:0"><div><b id="sd-need">–</b><small>steps needed</small></div></div>
 </div>
</div>
<p class="note">Estimate: stride ≈ height × 0.413 (women) or × 0.415 (men). Your real stride changes with speed, terrain and slope.</p>

<h2>Steps to miles chart by height</h2>
{strides_table('en')}

<h2>How the calculation works</h2>
<p>Distance is simply <b>steps × stride length</b>. Stride length is hard to eyeball, so it is estimated from height: about 41% of how tall you are. At 5′7″ that is roughly 28 inches per step, so one mile takes about 2,300 steps.</p>
<p>For a more accurate number, walk a known distance (one lap of a 400 m track is a quarter mile), count your steps and divide.</p>

<h2>Quick reference</h2>
<ul>
 <li><b>1 mile</b> ≈ 2,000 to 2,400 steps depending on height.</li>
 <li><b>5,000 steps</b> ≈ 2.2 miles, about 50 minutes of walking.</li>
 <li><b>10,000 steps</b> ≈ 4.4 miles, 1 h 30 to 1 h 45 at a normal pace.</li>
 <li><b>20,000 steps</b> ≈ 8.8 miles, more than 3 hours of walking.</li>
</ul>
<p>In real life, those steps add up across the day: commuting, errands, stairs. That is why a <b>monthly average</b> is a better target than a round number every single day: a 6,000-step Tuesday is easily made up by a 14,000-step Saturday.</p>

<h2>What about iPhone?</h2>
<p>Apple Health counts your steps and also shows a "Walking + Running Distance". It uses your height and, with an Apple Watch, your actual pace, so it is usually more accurate than a formula. What it does not tell you is whether you are on pace for your monthly goal. That is exactly what Walkever does.</p>
""",
     faq=[("How many miles is 10,000 steps for a woman?", "For a woman 5′3″ to 5′5″, 10,000 steps is about 4.1 to 4.2 miles (6.6–6.8 km). The difference with men comes mostly from height, not sex."),
          ("How many steps are in a mile?", "Between 2,000 and 2,400 steps for most adults, depending on height and pace. At 5′7″, count about 2,300."),
          ("How long does it take to walk 10,000 steps?", "About 1 h 30 to 1 h 45 at a normal pace (100–110 steps per minute). In practice they are spread throughout the day."),
          ("Is this calculator accurate?", "It is an estimate within about ±10%. Stride gets shorter uphill, in crowds or at a slow pace, and longer when you walk briskly.")],
     related=['steps', 'pace'])


# ---------- 2. How many steps a day
SRC_FR = """<ol class="sources">
<li>Paluch A.E. et al. « Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts ». <i>The Lancet Public Health</i>, 2022.</li>
<li>Ding D. et al. « Daily steps and health outcomes in adults: a systematic review and dose-response meta-analysis ». <i>The Lancet Public Health</i>, 2025.</li>
<li>Lee I-M. et al. « Association of Step Volume and Intensity With All-Cause Mortality in Older Women ». <i>JAMA Internal Medicine</i>, 2019.</li>
<li>Organisation mondiale de la santé. Lignes directrices sur l'activité physique et la sédentarité, 2020.</li>
</ol>"""
SRC_EN = SRC_FR.replace('Organisation mondiale de la santé. Lignes directrices sur l\'activité physique et la sédentarité, 2020.', 'World Health Organization. Guidelines on physical activity and sedentary behaviour, 2020.').replace('« ', '"').replace(' »', '"')

page('steps', 'fr', '/fr/combien-de-pas-par-jour/',
     title='Combien de pas par jour ? Ce que dit la recherche',
     h1='Combien de pas par jour faut-il faire ?',
     desc="10 000 pas/j n'est pas une règle. Les études montrent un bénéfice jusqu'à 7 000–8 000 pas selon l'âge. Sources à l'appui. Télécharge Walkever.",
     answer="<p><b>Viser 7 000 à 10 000 pas par jour</b> est un bon objectif pour la plupart des adultes. Les grandes études montrent que le risque de mortalité baisse nettement jusqu'à environ 7 000–8 000 pas, puis se stabilise vers <b>6 000–8 000 pas après 60 ans</b> et <b>8 000–10 000 pas avant 60 ans</b>. Chaque pas en plus compte, surtout si tu pars de peu.</p>",
     body=lambda: """
<h2>D'où vient le chiffre de 10 000 pas ?</h2>
<p>Pas d'un laboratoire : d'une publicité. En 1965, au Japon, un fabricant lance un podomètre baptisé <i>manpo-kei</i>, littéralement « compteur de 10 000 pas ». Le chiffre est rond, facile à retenir, et il est resté. Il n'est pas faux pour autant : la recherche récente montre que c'est un objectif qui apporte de vrais bénéfices. Mais ce n'est pas un seuil magique.</p>

<h2>Ce que disent les études</h2>
<ul>
 <li><b>Une méta-analyse de 15 cohortes</b> (près de 47 000 adultes, <i>The Lancet Public Health</i>, 2022) : plus on marche, plus le risque de mortalité baisse, jusqu'à un plateau situé vers <b>6 000–8 000 pas par jour après 60 ans</b> et <b>8 000–10 000 pas avant 60 ans</b>.</li>
 <li><b>Une revue de 2025</b> (<i>The Lancet Public Health</i>) : autour de <b>7 000 pas par jour</b>, le risque de mortalité est nettement plus faible qu'à 2 000 pas, avec aussi moins de maladies cardiovasculaires, de démence et de symptômes dépressifs.</li>
 <li><b>Chez les femmes âgées</b> (moyenne 72 ans, <i>JAMA Internal Medicine</i>, 2019) : le bénéfice apparaît dès 4 400 pas par jour et se stabilise autour de 7 500.</li>
</ul>
<p>En résumé : <b>le gros du bénéfice se gagne entre 2 000 et 7 000 pas</b>. Au-delà, ça reste utile pour la forme, mais l'effet sur la santé progresse plus lentement.</p>

<h2>Combien de pas par jour selon l'âge ?</h2>
<table class="tbl"><thead><tr><th>Âge</th><th>Repère conseillé</th><th>Pourquoi</th></tr></thead><tbody>
<tr><th scope="row">18–59 ans</th><td>8 000 à 10 000 pas</td><td>Plateau de bénéfice observé dans cette tranche (Lancet 2022)</td></tr>
<tr><th scope="row">60–69 ans</th><td>6 000 à 8 000 pas</td><td>Le bénéfice se stabilise plus tôt</td></tr>
<tr><th scope="row">70 ans et plus</th><td>4 000 à 7 500 pas</td><td>Bénéfice dès 4 400 pas chez les femmes âgées (JAMA 2019)</td></tr>
</tbody></table>
<p>Ces repères sont des moyennes de population, pas une prescription. Si tu as un problème de santé, demande l'avis de ton médecin.</p>

<h2>Et pour une femme ?</h2>
<p>Les études ne montrent pas de besoin différent selon le sexe : les mêmes repères s'appliquent. La seule différence pratique, c'est la distance : à taille plus petite, la foulée est plus courte, donc 10 000 pas font un peu moins de kilomètres (<a href="/fr/10000-pas-en-km/">calcule ta distance</a>).</p>

<h2>Combien de pas par jour pour maigrir ?</h2>
<p>Il n'y a pas de chiffre magique. Marcher dépense de l'énergie, aide à garder une activité régulière et se combine bien avec l'alimentation, mais la perte de poids dépend surtout de l'équilibre global. Ce qui marche : augmenter ta moyenne progressivement (par exemple +1 000 pas par jour chaque mois) et la tenir dans la durée, plutôt que viser un gros chiffre deux jours puis abandonner.</p>

<h2>La bonne méthode : une moyenne, pas un chiffre par jour</h2>
<p>Les études parlent de <b>moyenne quotidienne</b>, calculée sur des jours ou des semaines. Viser 10 000 pas chaque jour sans exception est épuisant et décourage au premier jour de pluie. Viser une moyenne de 8 000 pas sur le mois est plus réaliste : un jour calme se compense par une balade le week-end.</p>
<p>Pour ça, il faut savoir où tu en es : combien de pas il te reste pour finir le mois, et combien par jour. Tu peux le calculer avec notre <a href="/fr/calculateur-objectif-pas/">calculateur d'objectif de pas mensuel</a>, ou laisser Walkever le faire automatiquement à partir de l'app Santé.</p>

<h2>Sources</h2>
""" + SRC_FR,
     faq=[("10 000 pas par jour, c'est obligatoire ?", "Non. C'est un repère utile, mais les bénéfices sur la santé apparaissent bien avant, et se stabilisent autour de 7 000–10 000 pas selon l'âge."),
          ("Combien de pas par jour à 70 ans ?", "Entre 4 000 et 7 500 pas par jour selon ta forme. Les études chez les personnes âgées montrent un bénéfice dès 4 400 pas et un plateau autour de 7 500."),
          ("Combien de pas par jour pour être en bonne santé ?", "Autour de 7 000 à 8 000 pas par jour pour la plupart des adultes, d'après les méta-analyses récentes. L'OMS recommande aussi 150 à 300 minutes d'activité modérée par semaine."),
          ("Combien de pas par jour pour être considéré comme sédentaire ?", "On parle souvent de mode de vie sédentaire en dessous d'environ 5 000 pas par jour. C'est là que chaque pas supplémentaire a le plus d'effet.")],
     related=['pace', 'avg', 'distance'])

page('steps', 'en', '/en/how-many-steps-a-day/',
     title='How Many Steps a Day? What Research Says (by Age)',
     h1='How many steps a day should you walk?',
     desc="10,000 steps a day is not a scientific rule. Large studies show benefits up to 7,000–8,000 steps, by age. Evidence inside. Download Walkever.",
     answer="<p><b>Aim for 7,000 to 10,000 steps a day</b>, which is a solid target for most adults. Large studies show mortality risk drops sharply up to about 7,000–8,000 steps, then levels off around <b>6,000–8,000 steps after 60</b> and <b>8,000–10,000 steps under 60</b>. Every extra step counts, especially if you start low.</p>",
     body=lambda: """
<h2>Where does 10,000 steps come from?</h2>
<p>Not a lab: an ad campaign. In 1965 a Japanese company launched a pedometer called <i>manpo-kei</i>, literally "10,000-step meter". The number was round and catchy, and it stuck. It is not wrong: recent research confirms it brings real benefits. But it is not a magic threshold.</p>

<h2>What the studies say</h2>
<ul>
 <li><b>A meta-analysis of 15 cohorts</b> (about 47,000 adults, <i>The Lancet Public Health</i>, 2022): the more people walked, the lower their mortality risk, up to a plateau around <b>6,000–8,000 steps a day for adults 60+</b> and <b>8,000–10,000 for adults under 60</b>.</li>
 <li><b>A 2025 review</b> (<i>The Lancet Public Health</i>): around <b>7,000 steps a day</b> was linked to a much lower risk of death than 2,000 steps, along with less cardiovascular disease, dementia and depressive symptoms.</li>
 <li><b>In older women</b> (average age 72, <i>JAMA Internal Medicine</i>, 2019): benefits appeared from 4,400 steps a day and levelled off around 7,500.</li>
</ul>
<p>In short: <b>most of the benefit comes between 2,000 and 7,000 steps</b>. Beyond that, walking still helps fitness, but the health effect grows more slowly.</p>

<h2>How many steps a day by age</h2>
<table class="tbl"><thead><tr><th>Age</th><th>Suggested target</th><th>Why</th></tr></thead><tbody>
<tr><th scope="row">18–59</th><td>8,000 to 10,000 steps</td><td>Benefit plateau observed in this group (Lancet 2022)</td></tr>
<tr><th scope="row">60–69</th><td>6,000 to 8,000 steps</td><td>Benefits level off earlier</td></tr>
<tr><th scope="row">70+</th><td>4,000 to 7,500 steps</td><td>Benefits from 4,400 steps in older women (JAMA 2019)</td></tr>
</tbody></table>
<p>These are population averages, not a prescription. If you have a health condition, ask your doctor.</p>

<h2>How many steps a day for a woman?</h2>
<p>Studies do not show a different need by sex: the same targets apply. The only practical difference is distance: a shorter stride means 10,000 steps covers slightly fewer miles (<a href="/en/steps-to-miles/">calculate your distance</a>).</p>

<h2>How many steps a day to lose weight?</h2>
<p>There is no magic number. Walking burns energy, keeps you consistently active and pairs well with diet, but weight loss depends mostly on your overall balance. What works: raise your average gradually (say +1,000 steps a day each month) and keep it up, rather than hitting a huge number for two days and quitting.</p>

<h2>The better approach: an average, not a daily number</h2>
<p>Studies talk about <b>average daily steps</b>, measured over days or weeks. Hitting 10,000 steps every single day is exhausting and falls apart on the first rainy day. Averaging 8,000 steps over a month is more realistic: a quiet day is offset by a weekend walk.</p>
<p>To do that you need to know where you stand: how many steps are left this month, and how many per day. You can work it out with our <a href="/en/step-goal-calculator/">monthly step goal calculator</a>, or let Walkever do it automatically from Apple Health.</p>

<h2>Sources</h2>
""" + SRC_EN,
     faq=[("Do I have to walk 10,000 steps a day?", "No. It is a useful benchmark, but health benefits start well before it and level off around 7,000–10,000 steps depending on age."),
          ("How many steps a day is considered active?", "Around 7,500 to 10,000 steps a day is commonly described as active. Under about 5,000 is usually considered sedentary."),
          ("How many steps a day is healthy?", "About 7,000 to 8,000 steps a day for most adults, according to recent meta-analyses. The WHO also recommends 150 to 300 minutes of moderate activity per week."),
          ("How many steps a day for seniors?", "Between 4,000 and 7,500 steps a day depending on fitness. Studies in older adults show benefits from 4,400 steps and a plateau around 7,500.")],
     related=['pace', 'avg', 'distance'])


# ---------- 3. Monthly pace calculator
page('pace', 'fr', '/fr/calculateur-objectif-pas/',
     title='Calculateur d\'objectif de pas mensuel',
     h1='Combien de pas par jour pour tenir ton objectif du mois ?',
     desc="Calcule combien de pas par jour il te reste à faire ce mois-ci, et ton avance ou ton retard. Gratuit, sans inscription. Essaie Walkever sur iPhone.",
     tool='mp',
     answer="<p>Entre ton objectif quotidien et les pas déjà faits ce mois-ci : le calculateur te donne <b>la moyenne requise par jour</b> pour finir le mois à temps, et ton <b>avance ou ton retard</b> sur le rythme idéal.</p>",
     body=lambda: """
<div class="tool" id="mp">
 <div class="row">
  <label>Objectif quotidien (pas)<input id="mp-g" type="number" inputmode="numeric" min="0" step="500" value="10000"></label>
  <label>Pas déjà faits ce mois-ci<input id="mp-t" type="number" inputmode="numeric" min="0" step="1000" value="80000"></label>
  <label>Date<input id="mp-d" type="date"></label>
 </div>
 <label class="chk"><input id="mp-x" type="checkbox"> Exclure aujourd'hui (commencer demain)</label>
 <div class="out" aria-live="polite">
  <div class="hl"><b id="mp-avg">–</b><small>pas/jour requis sur <span id="mp-days"></span></small></div>
  <div><b id="mp-rest">–</b><small>pas restants</small></div>
  <div><b id="mp-goal">–</b><small>objectif du mois</small></div>
  <div><b id="mp-gap">–</b><small id="mp-gapl"></small></div>
 </div>
</div>
<p class="note">Rien n'est envoyé : le calcul se fait dans ton navigateur.</p>

<h2>Comment ça se calcule</h2>
<ul>
 <li><b>Objectif du mois</b> = objectif quotidien × nombre de jours du mois (310 000 pas en octobre à 10 000/jour, 300 000 en novembre).</li>
 <li><b>Moyenne requise</b> = pas restants ÷ jours restants. Les jours restants incluent aujourd'hui, sauf si tu choisis de commencer demain.</li>
 <li><b>Avance ou retard</b> = pas faits − objectif quotidien × jours déjà écoulés. Si tu es à 95 000 pas au matin du 10, tu as 5 000 pas d'avance sur un objectif de 10 000 par jour.</li>
</ul>

<h2>Pourquoi raisonner sur le mois</h2>
<p>Un objectif quotidien fixe a un défaut : un seul jour raté et la série est cassée. Sur le mois, tu gardes la même exigence (la même moyenne), mais avec de la souplesse : une journée de bureau à 4 000 pas se rattrape par une randonnée le dimanche. Tu sais aussi tout de suite si le retard est sérieux ou non : 300 pas par jour à rattraper, c'est 3 minutes de marche.</p>

<h2>Le faire sans calcul, tous les jours</h2>
<p>Walkever fait ce calcul en continu à partir de l'app Santé de ton iPhone : moyenne requise (avec ou sans aujourd'hui), avance ou retard cumulé, barre de progression qui change de couleur selon ton rythme, et historique par jour, mois et année. Aucune saisie, aucun compte, aucune donnée collectée.</p>
""",
     faq=[("Quel objectif de pas mensuel choisir ?", "Multiplie ton objectif quotidien par le nombre de jours du mois. Avec 8 000 pas par jour, ça fait 240 000 pas en novembre et 248 000 en décembre."),
          ("Faut-il compter aujourd'hui dans les jours restants ?", "Le matin, oui : tu as encore la journée devant toi. Le soir, mieux vaut exclure aujourd'hui pour voir ce qu'il faudra faire à partir de demain."),
          ("Combien de pas par mois pour 10 000 pas par jour ?", "Entre 280 000 (février) et 310 000 pas (mois de 31 jours). Sur un an, ça fait 3 650 000 pas."),
          ("Le calculateur enregistre-t-il mes données ?", "Non. Tout se calcule dans ton navigateur, rien n'est envoyé ni stocké.")],
     related=['steps', 'distance', 'compare', 'challenge'])

page('pace', 'en', '/en/step-goal-calculator/',
     title='Step Goal Calculator — Daily Steps for Monthly Goal',
     h1='How many steps a day to hit your monthly goal?',
     desc="Work out the daily step average you need to hit your monthly step goal, and how far ahead or behind pace you are. Free, no sign-up. Try Walkever.",
     tool='mp',
     answer="<p>Enter your daily goal and the steps you have done this month: the calculator gives you <b>the daily average you need</b> to finish the month on track, and how far <b>ahead or behind</b> the ideal pace you are.</p>",
     body=lambda: """
<div class="tool" id="mp">
 <div class="row">
  <label>Daily goal (steps)<input id="mp-g" type="number" inputmode="numeric" min="0" step="500" value="10000"></label>
  <label>Steps so far this month<input id="mp-t" type="number" inputmode="numeric" min="0" step="1000" value="80000"></label>
  <label>Date<input id="mp-d" type="date"></label>
 </div>
 <label class="chk"><input id="mp-x" type="checkbox"> Exclude today (start tomorrow)</label>
 <div class="out" aria-live="polite">
  <div class="hl"><b id="mp-avg">–</b><small>steps/day needed over <span id="mp-days"></span></small></div>
  <div><b id="mp-rest">–</b><small>steps left</small></div>
  <div><b id="mp-goal">–</b><small>monthly goal</small></div>
  <div><b id="mp-gap">–</b><small id="mp-gapl"></small></div>
 </div>
</div>
<p class="note">Nothing is sent anywhere: the math runs in your browser.</p>

<h2>How it is calculated</h2>
<ul>
 <li><b>Monthly goal</b> = daily goal × days in the month (310,000 steps in October at 10,000/day, 300,000 in November).</li>
 <li><b>Required average</b> = steps left ÷ days left. Days left include today, unless you choose to start tomorrow.</li>
 <li><b>Ahead or behind</b> = steps done − daily goal × days already elapsed. At 95,000 steps on the morning of the 10th, you are 5,000 steps ahead of a 10,000/day goal.</li>
</ul>

<h2>Why think in months</h2>
<p>A fixed daily goal has one flaw: miss one day and the streak is gone. A monthly goal keeps the same bar (the same average) with more flexibility: a 4,000-step office day is made up by a Sunday hike. You also see right away whether you are seriously behind or not: 300 steps a day to catch up is three minutes of walking.</p>

<h2>Skip the math, every day</h2>
<p>Walkever runs this calculation continuously from Apple Health on your iPhone: required average (with or without today), cumulative lead or lag, a progress bar that changes color with your pace, and history by day, month and year. No manual entry, no account, no data collected.</p>
""",
     faq=[("What monthly step goal should I set?", "Multiply your daily goal by the days in the month. At 8,000 steps a day that is 240,000 steps in November and 248,000 in December."),
          ("Should today count in the days left?", "In the morning, yes: you still have the day ahead. In the evening, exclude today to see what you need from tomorrow on."),
          ("How many steps a month is 10,000 a day?", "Between 280,000 (February) and 310,000 steps (31-day months). Over a year that is 3,650,000 steps."),
          ("Does the calculator store my data?", "No. Everything runs in your browser; nothing is sent or stored.")],
     related=['steps', 'distance', 'compare', 'challenge'])


# ---------- 4. Best step counter app (compare)
def compare_table_fr():
    return """<div class="table-wrap"><table class="tbl">
<thead><tr>
  <th>Application</th><th>Gratuit&nbsp;?</th><th>Publicités&nbsp;?</th><th>HealthKit&nbsp;?</th><th>Fonctionnalité clé</th>
</tr></thead>
<tbody>
<tr><th scope="row"><b>Walkever</b></th><td>✅ Oui</td><td>❌ Aucune</td><td>✅ Oui</td><td>Objectif mensuel + moyenne requise par jour</td></tr>
<tr><th scope="row">Apple Santé (natif)</th><td>✅ Oui</td><td>❌ Aucune</td><td>✅ Natif</td><td>Comptage automatique, tendances hebdomadaires</td></tr>
<tr><th scope="row">Pedometer++</th><td>Freemium</td><td>Non</td><td>✅ Oui</td><td>Widgets, intégration Apple Watch</td></tr>
</tbody>
</table></div>"""


def compare_table_en():
    return """<div class="table-wrap"><table class="tbl">
<thead><tr>
  <th>App</th><th>Free?</th><th>Ads?</th><th>HealthKit?</th><th>Key feature</th>
</tr></thead>
<tbody>
<tr><th scope="row"><b>Walkever</b></th><td>✅ Yes</td><td>❌ None</td><td>✅ Yes</td><td>Monthly goal + required daily average</td></tr>
<tr><th scope="row">Apple Health (built-in)</th><td>✅ Yes</td><td>❌ None</td><td>✅ Native</td><td>Automatic step counting, weekly trends</td></tr>
<tr><th scope="row">Pedometer++</th><td>Freemium</td><td>No</td><td>✅ Yes</td><td>Widgets, Apple Watch integration</td></tr>
</tbody>
</table></div>"""


page('compare', 'fr', '/fr/meilleure-application-podometre-iphone/',
     title='Meilleure application podomètre iPhone gratuite sans publicité (2026)',
     h1='Meilleure application podomètre iPhone gratuite sans publicité',
     desc="Comparatif honnête de 3 applications podomètre iPhone : Walkever, Apple Santé et Pedometer++. Gratuit, sans pub, avec HealthKit — lequel choisir ?",
     ct_override='site-compare-fr',
     answer="<p>Pour un suivi fiable sans publicité, <b>trois applications se distinguent sur iPhone</b> en 2026 : Walkever, Apple Santé (natif) et Pedometer++. Le critère qui fait la différence : te dire si tu es dans les temps pour ton objectif du mois, pas seulement combien de pas tu as faits aujourd'hui.</p>",
     body=lambda: f"""
<h2>Critères de comparaison</h2>
<p>Pour être utile au quotidien, une application podomètre doit répondre à trois questions : est-elle vraiment gratuite ? Affiche-t-elle de la publicité ? Lit-elle les pas depuis l'app Santé (HealthKit) sans dupliquer le comptage ? Voici les faits, sans opinion ni formulation dénigrant les concurrents.</p>
{compare_table_fr()}

<h2>Pourquoi Walkever si tu veux suivre un objectif mensuel</h2>
<p>Apple Santé te dit combien de pas tu as faits. Walkever te dit si c'est assez. L'application calcule en temps réel combien de pas par jour il te reste à faire pour atteindre ton objectif à la fin du mois — avec ou sans aujourd'hui — et affiche ton avance ou ton retard cumulé. Aucune saisie manuelle, aucun compte à créer, aucune donnée quittant ton iPhone.</p>
<p>Pour calculer ton rythme à la main, utilise notre <a href="/fr/calculateur-objectif-pas/">calculateur d'objectif de pas mensuel</a>. Pour savoir combien de pas viser selon ton âge, consulte notre guide <a href="/fr/combien-de-pas-par-jour/">combien de pas par jour</a>.</p>

<h2>Apple Santé suffit-elle ?</h2>
<p>Pour un comptage simple, oui. Apple Santé utilise l'accéléromètre de l'iPhone et affiche tes pas dans Santé › Activité. Elle montre une tendance hebdomadaire et une moyenne sur 7 jours. Ce qu'elle ne fait pas : calculer la moyenne requise pour finir ton mois dans les temps, ni afficher ton avance ou ton retard par rapport au rythme idéal.</p>
""",
     faq=[("Quelle est la meilleure application podomètre gratuite iPhone ?",
           "Walkever si tu veux suivre un objectif mensuel sans publicité ni collecte de données. Apple Santé si tu veux un comptage automatique intégré à iOS. Les deux lisent HealthKit et sont entièrement gratuites."),
          ("Quel podomètre ne collecte pas mes données ?",
           "Walkever et Apple Santé n'envoient aucune donnée à des serveurs externes : tout reste sur ton iPhone. Consulte la politique de confidentialité de chaque app avant de l'installer."),
          ("Peut-on changer l'objectif de pas sur iPhone ?",
           "Oui. Dans Walkever, tu règles ton objectif directement dans l'application. Dans Apple Santé, l'objectif d'activité se configure depuis l'onglet Résumé. Les deux permettent de personnaliser la cible."),
          ("Apple Santé compte-t-elle les pas automatiquement ?",
           "Oui. Apple Santé utilise l'accéléromètre de l'iPhone pour compter les pas en permanence, sans configuration. Les données sont accessibles dans Santé › Activité › Pas.")],
     related=['pace', 'steps'])

page('compare', 'en', '/en/best-step-counter-app-iphone/',
     title='Best Free Step Counter App for iPhone Without Ads (2026)',
     h1='Best free step counter app for iPhone without ads',
     desc="Honest comparison of 3 iPhone step counter apps: Walkever, Apple Health and Pedometer++. Free, no ads, HealthKit — which one to choose?",
     ct_override='site-compare-en',
     answer="<p>For reliable, ad-free step tracking on iPhone, <b>three apps stand out in 2026</b>: Walkever, Apple Health (built-in) and Pedometer++. The differentiator: does the app tell you whether you are on pace for your monthly goal, not just today's count?</p>",
     body=lambda: f"""
<h2>What we compared</h2>
<p>A useful step counter app needs to answer three questions: is it really free? Does it show ads? Does it read steps from Apple Health (HealthKit) without double-counting? Here are the facts — no opinions, no disparaging competitors.</p>
{compare_table_en()}

<h2>Why Walkever if you want to track a monthly step goal</h2>
<p>Apple Health tells you how many steps you have taken. Walkever tells you whether that is enough. The app calculates in real time how many steps a day you still need to reach your goal by the end of the month — with or without today — and shows your cumulative lead or lag. No manual entry, no account required, no data leaving your iPhone.</p>
<p>Want to run the numbers yourself first? Use our <a href="/en/step-goal-calculator/">monthly step goal calculator</a>. For science-based guidance on how many steps to aim for, read our guide on <a href="/en/how-many-steps-a-day/">how many steps a day</a>.</p>

<h2>Is Apple Health enough?</h2>
<p>For basic counting, yes. Apple Health uses the iPhone accelerometer and shows your steps under Health › Activity. It displays a weekly trend and a 7-day average. What it does not do: calculate the daily average you need to finish your month on track, or show how far ahead or behind your ideal pace you are.</p>
""",
     faq=[("What is the best free step counter app for iPhone?",
           "Walkever if you want to track a monthly goal with no ads and no data collection. Apple Health if you just want automatic step counting built into iOS. Both read HealthKit and are completely free."),
          ("Which pedometer app does not collect my data?",
           "Walkever and Apple Health send no data to external servers — everything stays on your iPhone. Check each app's privacy policy before installing."),
          ("Can I change my step goal on iPhone?",
           "Yes. In Walkever you set your goal directly in the app. In Apple Health your activity goal is in the Summary tab. Both let you customise the target."),
          ("Does Apple Health count steps automatically?",
           "Yes. Apple Health uses the iPhone accelerometer to count steps continuously with no setup. The data is in Health › Activity › Steps.")],
     related=['pace', 'steps'])


# ---------- 5. January step challenge
def plan_table(lang):
    fr = lang == 'fr'
    rows = [("1–7", 7, 70000), ("8–14", 7, 140000), ("15–21", 7, 210000), ("22–28", 7, 280000), ("29–31", 3, 310000)]
    fmt = (lambda v: f'{v:,}'.replace(',', '\u202f')) if fr else (lambda v: f'{v:,}')
    head = ('<th>Semaine</th><th>Jours</th><th>Pas visés</th><th>Cumul fin de période</th>' if fr
            else '<th>Week</th><th>Days</th><th>Steps target</th><th>Running total</th>')
    body = ''.join(f'<tr><th scope="row">{"Janvier" if fr else "Jan"} {d}</th><td>{n}</td><td>{fmt(n*10000)}</td><td>{fmt(c)}</td></tr>'
                   for d, n, c in rows)
    return f'<div class="table-wrap"><table class="tbl"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


page('challenge', 'fr', '/fr/defi-10000-pas-janvier/',
     title='Défi 10 000 pas par jour en janvier : plan sur 31 jours',
     h1='Défi 10 000 pas par jour en janvier : plan sur 31 jours',
     desc="Relève le défi 10 000 pas par jour en janvier 2027 : 310 000 pas au total, un plan semaine par semaine, des conseils concrets et un suivi automatique.",
     ct_override='site-defi-fr',
     answer="<p>Faire 10 000 pas par jour en janvier 2027, c'est <b>310 000 pas sur 31 jours</b>, soit environ 225 km. Le plus simple : viser une <b>moyenne</b> plutôt qu'une série parfaite, répartir l'effort par semaine et vérifier chaque soir si tu es dans les temps.</p>",
     body=lambda: f"""
<h2>Pourquoi janvier</h2>
<p>Les bonnes résolutions font de janvier le mois où l'on se remet à bouger. Le défi des 10 000 pas est simple à expliquer et se mesure tout seul grâce à l'app Santé de ton iPhone. Le piège classique : tout miser sur une série quotidienne sans jamais rater un jour. Dès le premier jour à 6 000 pas, la motivation chute. La parade est de raisonner sur le mois entier : 310 000 pas, et une moyenne à tenir.</p>

<h2>Le plan semaine par semaine</h2>
{plan_table('fr')}
<h3>Semaine 1 (1–7 janvier) : installer l'habitude</h3>
<p>Le 1er janvier tombe un vendredi : profite du week-end pour caler une marche de 45 minutes, le matin de préférence. Ajoute deux marches de 10 minutes après les repas en semaine. Si tu pars de 5 000 pas par jour, accepte de rester un peu en dessous cette semaine et compense plus tard.</p>
<h3>Semaine 2 (8–14 janvier) : trouver ton rythme</h3>
<p>Repère les créneaux qui reviennent chaque jour : trajet, pause déjeuner, appel téléphone à faire en marchant. Descends un arrêt plus tôt, prends les escaliers. Vise une journée « longue » le week-end (13 000 à 15 000 pas) pour absorber les jours de bureau.</p>
<h3>Semaine 3 (15–21 janvier) : tenir quand la motivation baisse</h3>
<p>C'est la semaine critique. Fixe ta marche à une heure précise, prépare tes affaires la veille. Un mauvais jour à 6 000 pas n'est pas grave : il demande environ 800 pas de plus par jour sur les cinq jours suivants.</p>
<h3>Semaine 4 (22–28 janvier) : consolider</h3>
<p>Tu as de l'avance ou du retard : regarde-le sans dramatiser. Une marche de 30 minutes représente environ 3 000 à 3 500 pas, de quoi rattraper un retard en un ou deux jours.</p>
<h3>Derniers jours (29–31 janvier) : finir</h3>
<p>Il reste trois jours. Calcule exactement ce qu'il te manque et répartis-le : c'est là que la moyenne requise est la plus utile.</p>

<h2>Calcule ton défi</h2>
<p>L'objectif total est <b>310 000 pas</b> (31 jours × 10 000). Dans notre <a href="/fr/calculateur-objectif-pas/">calculateur d'objectif de pas mensuel</a>, indique 10 000 pas par jour, les pas déjà faits et la date du jour : tu obtiens la moyenne requise pour finir le mois et ton avance ou ton retard. Pas assez de temps pour 10 000 ? Garde la même méthode avec 7 000 pas (217 000 sur le mois) : les études montrent déjà un bénéfice net à ce niveau, comme détaillé dans <a href="/fr/combien-de-pas-par-jour/">combien de pas par jour</a>.</p>

<h2>Suivre le défi sans y penser</h2>
<p>Walkever lit tes pas dans l'app Santé et affiche en continu ton total du mois, la moyenne requise et ton avance ou retard cumulé, avec une barre qui change de couleur selon ton rythme. Gratuit, sans publicité, aucune donnée collectée.</p>
""",
     faq=[("Comment faire 10 000 pas par jour en janvier ?",
           "Répartis l'effort : une marche de 30 à 45 minutes, deux courtes marches après les repas, les escaliers et un trajet à pied. Vise la moyenne du mois plutôt qu'une série parfaite."),
          ("Quel est l'objectif total de pas pour janvier ?",
           "310 000 pas, soit 31 jours × 10 000. Si tu prends du retard, la moyenne requise sur les jours restants te dit exactement quoi rattraper."),
          ("Combien de km représentent 310 000 pas ?",
           "Environ 225 km pour une taille de 1,75 m, entre 200 et 240 km selon ta taille (pas d'environ 0,64 à 0,77 m)."),
          ("Que faire si je rate une journée ?",
           "Rien de dramatique : sur le mois, une journée à 5 000 pas se rattrape avec environ 500 pas en plus sur les dix jours suivants.")],
     related=['pace', 'steps', 'annual'])

page('challenge', 'en', '/en/january-step-challenge/',
     title='January Step Challenge: 10,000 Steps a Day (31-Day Plan)',
     h1='January step challenge: 10,000 steps a day, 31-day plan',
     desc="Take the 10,000 steps a day challenge in January 2027: 310,000 steps in total, a week-by-week plan, practical tips and automatic tracking.",
     ct_override='site-defi-en',
     answer="<p>Walking 10,000 steps a day in January 2027 means <b>310,000 steps over 31 days</b>, about 140 miles. The easiest way: aim for an <b>average</b> rather than a perfect streak, spread the effort by week and check each evening whether you are on pace.</p>",

     body=lambda: f"""
<h2>Why January</h2>
<p>New Year resolutions make January the month people start moving again. The 10,000 steps challenge is easy to explain and tracks itself through Apple Health on your iPhone. The classic trap is betting everything on a daily streak with no missed day: one 6,000-step day and motivation drops. The fix is to think in months: 310,000 steps, and an average to hold.</p>

<h2>The week-by-week plan</h2>
{plan_table('en')}
<h3>Week 1 (Jan 1–7): build the habit</h3>
<p>January 1 falls on a Friday: use the weekend to lock in a 45-minute walk, ideally in the morning. Add two 10-minute walks after meals on weekdays. If you start from 5,000 steps a day, accept being a little under this week and make it up later.</p>
<h3>Week 2 (Jan 8–14): find your rhythm</h3>
<p>Spot the slots that come back every day: commute, lunch break, phone calls you can take on foot. Get off one stop early, take the stairs. Aim for one long day on the weekend (13,000 to 15,000 steps) to absorb desk days.</p>
<h3>Week 3 (Jan 15–21): hold on when motivation dips</h3>
<p>This is the critical week. Fix your walk at a set time and lay out your gear the night before. One bad 6,000-step day is not a problem: it costs about 800 extra steps a day over the next five.</p>
<h3>Week 4 (Jan 22–28): consolidate</h3>
<p>You are ahead or behind: look at it calmly. A 30-minute walk is roughly 3,000 to 3,500 steps, enough to recover a deficit in a day or two.</p>
<h3>Final days (Jan 29–31): finish</h3>
<p>Three days left. Work out exactly what is missing and split it: this is where the required daily average helps most.</p>

<h2>Run your challenge numbers</h2>
<p>The total target is <b>310,000 steps</b> (31 days × 10,000). In our <a href="/en/step-goal-calculator/">monthly step goal calculator</a>, enter 10,000 steps a day, the steps you have done and today's date: you get the average required to finish the month and your lead or lag. Not enough time for 10,000? Keep the same method with 7,000 steps (217,000 for the month): research already shows a clear benefit at that level, as covered in <a href="/en/how-many-steps-a-day/">how many steps a day</a>.</p>

<h2>Track the challenge without thinking about it</h2>
<p>Walkever reads your steps from Apple Health and continuously shows your month total, the required average and your cumulative lead or lag, with a bar that changes color with your pace. Free, no ads, no data collected.</p>
""",
     faq=[("How do I walk 10,000 steps a day in January?",
           "Spread the effort: one 30 to 45 minute walk, two short walks after meals, stairs and a commute on foot. Aim for the monthly average rather than a perfect streak."),
          ("What is the total step goal for January?",
           "310,000 steps, which is 31 days × 10,000. If you fall behind, the required average over the remaining days tells you exactly what to make up."),
          ("How many miles is 310,000 steps?",
           "About 140 miles (225 km) at 5 ft 9 in, and between 124 and 148 miles depending on height (stride of roughly 2.1 to 2.5 ft)."),
          ("What if I miss a day?",
           "No drama: over a month, a 5,000-step day is made up with about 500 extra steps a day over the next ten.")],
     related=['pace', 'steps', 'annual'])



# ---------- 6. Annual step goal calculator
def annual_ref_table(lang):
    fr = lang == 'fr'
    year = int(TODAY[:4])
    diy = 366 if (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)) else 365
    def fv(v):
        return f'{v:,}'.replace(',', ' ' if fr else ',')
    def fkm(steps_count):
        km = round(steps_count * 0.70 / 1000)
        return fv(km) + ' km'
    def fcal(steps_count):
        cal = round(steps_count * 0.04 / 1000) * 1000
        return fv(cal) + ' kcal'
    goals = [7000, 8000, 10000, 12000]
    if fr:
        head = f'<tr><th>Objectif / jour</th><th>Total {year} ({diy} j)</th><th>Distance est.</th><th>Calories est.</th></tr>'
    else:
        head = f'<tr><th>Daily goal</th><th>{year} total ({diy} days)</th><th>Est. distance</th><th>Est. calories</th></tr>'
    body = ''
    for g in goals:
        total = g * diy
        lab = fv(g) + (' pas/j' if fr else ' steps/d')
        body += f'<tr><th scope="row">{lab}</th><td>{fv(total)}</td><td>{fkm(total)}</td><td>{fcal(total)}</td></tr>'
    return f'<div class="table-wrap"><table class="tbl"><thead>{head}</thead><tbody>{body}</tbody></table></div>'


page('annual', 'fr', '/fr/objectif-annuel-pas/',
     title="Calculateur d'objectif annuel de pas",
     h1="Calculateur d'objectif annuel de pas",
     desc="Calcule en ligne ton total annuel de pas, les semaines restantes et la moyenne requise pour tenir ton objectif. Tableau de référence de 7 000 à 12 000 pas/jour. Télécharge Walkever.",
     tool='ap',
     ct_override='site-annual-fr',
     answer="<p>Entre ton objectif quotidien et les pas déjà faits cette année : le calculateur te donne <b>ton total annuel visé</b>, <b>la moyenne requise par jour</b> pour finir l'année à temps, et ton <b>avance ou ton retard</b> sur le rythme idéal.</p>",
     body=lambda: f"""
<div class="tool" id="ap">
 <div class="row">
  <label>Objectif quotidien (pas)<input id="ap-g" type="number" inputmode="numeric" min="0" step="500" value="10000"></label>
  <label>Pas déjà faits cette année<input id="ap-t" type="number" inputmode="numeric" min="0" step="100000" value="2500000"></label>
  <label>Date<input id="ap-d" type="date"></label>
 </div>
 <label class="chk"><input id="ap-x" type="checkbox"> Exclure aujourd'hui (commencer demain)</label>
 <div class="out" aria-live="polite">
  <div class="hl"><b id="ap-avg">–</b><small>pas/jour requis sur <span id="ap-days"></span></small></div>
  <div><b id="ap-wk">–</b><small id="ap-wkl"></small></div>
  <div><b id="ap-rest">–</b><small>pas restants</small></div>
  <div><b id="ap-goal">–</b><small>objectif de l'année</small></div>
  <div><b id="ap-gap">–</b><small id="ap-gapl"></small></div>
 </div>
</div>
<p class="note">Rien n'est envoyé : le calcul se fait dans ton navigateur.</p>

<h2>Tableau de référence</h2>
<p>Combien de pas, de kilomètres et de calories selon ton objectif journalier sur une année complète (estimation à 70 cm de foulée et 0,04 kcal/pas pour une personne de 70 kg) :</p>
{annual_ref_table('fr')}
<p class="note">Les calories sont une estimation indicative : elles varient selon le poids, la taille, l'allure et le terrain. Consulte un professionnel de santé pour un suivi personnalisé.</p>

<h2>Comment ça se calcule</h2>
<ul>
 <li><b>Objectif de l'année</b> = objectif quotidien × nombre de jours dans l'année (365 ou 366 en année bissextile).</li>
 <li><b>Moyenne requise</b> = pas restants ÷ jours restants dans l'année. Les jours restants incluent aujourd'hui, sauf si tu coches l'option "commencer demain".</li>
 <li><b>Avance ou retard</b> = pas faits − objectif quotidien × jours déjà écoulés depuis le 1er janvier.</li>
</ul>

<h2>Bilan {int(TODAY[:4])} : où en es-tu ?</h2>
<p>En fin d'année, l'écran Historique de Walkever affiche ton cumul depuis le 1er janvier : total de pas, nombre de mois au-dessus de l'objectif et record journalier. Entre tes données dans le calculateur ci-dessus pour voir exactement ce qu'il te reste d'ici le 31 décembre, puis fixe ton objectif {int(TODAY[:4]) + 1} en t'appuyant sur ta vraie moyenne annuelle. Pour tenir un objectif mensuel en parallèle, utilise le <a href="/fr/calculateur-objectif-pas/">calculateur d'objectif de pas mensuel</a>.</p>
""",
     faq=[("Quel est l'objectif total de pas pour une année entière ?",
           "À 10 000 pas par jour, le total annuel est de 3 650 000 pas sur 365 jours (ou 3 660 000 en année bissextile), soit environ 2 555 km et 146 000 kcal."),
          ("Comment calculer sa moyenne annuelle de pas ?",
           "Additionne tous tes pas depuis le 1er janvier et divise par le nombre de jours écoulés. Walkever le fait automatiquement depuis l'app Santé et affiche aussi la moyenne requise pour finir l'année."),
          ("Combien de km représentent 10 000 pas par jour sur un an ?",
           "Environ 2 555 km pour une année de 365 jours, avec une foulée de 70 cm (taille ≈ 1,70 m). Entre 2 190 km à 7 000 pas/jour et 3 065 km à 12 000 pas/jour."),
          ("Le calculateur enregistre-t-il mes données ?",
           "Non. Tout se calcule dans ton navigateur, rien n'est envoyé ni stocké.")],
     related=['pace', 'challenge'])

page('annual', 'en', '/en/annual-step-goal/',
     title='Annual Step Goal Calculator',
     h1='Annual step goal calculator',
     desc="Calculate your yearly step total, weeks remaining and the daily average you need online. Reference table from 7,000 to 12,000 steps a day. Download Walkever.",
     tool='ap',
     ct_override='site-annual-en',
     answer="<p>Enter your daily goal and the steps you have done this year: the calculator gives you <b>your annual target</b>, <b>the daily average you need</b> to finish the year on track, and how far <b>ahead or behind</b> the ideal pace you are.</p>",
     body=lambda: f"""
<div class="tool" id="ap">
 <div class="row">
  <label>Daily goal (steps)<input id="ap-g" type="number" inputmode="numeric" min="0" step="500" value="10000"></label>
  <label>Steps done this year<input id="ap-t" type="number" inputmode="numeric" min="0" step="100000" value="2500000"></label>
  <label>Date<input id="ap-d" type="date"></label>
 </div>
 <label class="chk"><input id="ap-x" type="checkbox"> Exclude today (start tomorrow)</label>
 <div class="out" aria-live="polite">
  <div class="hl"><b id="ap-avg">–</b><small>steps/day needed over <span id="ap-days"></span></small></div>
  <div><b id="ap-wk">–</b><small id="ap-wkl"></small></div>
  <div><b id="ap-rest">–</b><small>steps left</small></div>
  <div><b id="ap-goal">–</b><small>annual goal</small></div>
  <div><b id="ap-gap">–</b><small id="ap-gapl"></small></div>
 </div>
</div>
<p class="note">Nothing is sent anywhere: the math runs in your browser.</p>

<h2>Reference table</h2>
<p>Steps, distance and calories by daily goal over a full year (estimated at a 2.3 ft stride and 0.04 kcal/step for a 154 lb person):</p>
{annual_ref_table('en')}
<p class="note">Calories are an estimate: they vary with weight, height, pace and terrain. Consult a health professional for personalised advice.</p>

<h2>How it is calculated</h2>
<ul>
 <li><b>Annual goal</b> = daily goal × days in the year (365, or 366 in a leap year).</li>
 <li><b>Required average</b> = steps left ÷ days remaining in the year. Days remaining include today, unless you choose to start tomorrow.</li>
 <li><b>Ahead or behind</b> = steps done − daily goal × days elapsed since January 1.</li>
</ul>

<h2>{int(TODAY[:4])} in review: where do you stand?</h2>
<p>At year-end, Walkever's History screen shows your cumulative total since January 1: step total, months on target and daily record. Enter your numbers in the calculator above to see exactly what is left before December 31, then set your {int(TODAY[:4]) + 1} goal based on your real annual average. To track a monthly goal alongside your annual one, use the <a href="/en/step-goal-calculator/">monthly step goal calculator</a>.</p>
""",
     faq=[("What is a good annual step goal?",
           "At 10,000 steps a day the annual total is 3,650,000 steps over 365 days — about 1,580 miles (2,555 km). Studies show clear health benefits starting from 7,000 steps a day (2,555,000 steps a year)."),
          ("How do I calculate my yearly step average?",
           "Add up your steps since January 1 and divide by the days elapsed. Walkever does it automatically from Apple Health and also shows the required daily average to finish the year."),
          ("How many miles is 10,000 steps a day for a year?",
           "About 1,580 miles (2,555 km) over 365 days at a 2.3 ft stride (5 ft 9 in height). Between 1,105 miles at 7,000 steps/day and 1,897 miles at 12,000 steps/day."),
          ("Does the calculator store my data?",
           "No. Everything runs in your browser; nothing is sent or stored.")],
     related=['pace', 'challenge'])


# ---------- 5. Average steps per day (age / gender)
SRC_AVG_FR = """<ol class="sources">
<li>Paluch A.E. et al. « Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts ». <i>The Lancet Public Health</i>, 2022.</li>
<li>Ding D. et al. « Daily steps and health outcomes in adults: a systematic review and dose-response meta-analysis ». <i>The Lancet Public Health</i>, 2025.</li>
<li>Althoff T. et al. « Large-scale physical activity data reveal worldwide activity inequality ». <i>Nature</i>, 2017.</li>
<li>Bassett D.R. et al. « Pedometer-measured physical activity and health behaviors in U.S. adults ». <i>Medicine &amp; Science in Sports &amp; Exercise</i>, 2010.</li>
<li>Tudor-Locke C. et al. « How many steps/day are enough? For adults ». <i>International Journal of Behavioral Nutrition and Physical Activity</i>, 2011.</li>
</ol>"""
SRC_AVG_EN = SRC_AVG_FR.replace('« ', '"').replace(' »', '"')


def avg_table(lang):
    fr = lang == 'fr'
    n = lambda a, b: (f'{a:,} – {b:,}'.replace(',', ' ' if fr else ',') if fr else f'{a:,}–{b:,}'.replace(',', ','))
    rows = [
        ('20–29', (7000, 9500), '8 000 – 10 000' if fr else '8,000–10,000'),
        ('30–39', (6500, 9000), '8 000 – 10 000' if fr else '8,000–10,000'),
        ('40–49', (6000, 8500), '8 000 – 10 000' if fr else '8,000–10,000'),
        ('50–59', (5500, 8000), '8 000 – 10 000' if fr else '8,000–10,000'),
        ('60–69', (5000, 7500), '6 000 – 8 000' if fr else '6,000–8,000'),
        ('70+', (3000, 6000), '6 000 – 8 000' if fr else '6,000–8,000'),
    ]
    if fr:
        head = '<tr><th>Âge</th><th>Moyenne typique observée (pas/jour)</th><th>Zone de bénéfice maximal (Paluch 2022)</th></tr>'
    else:
        head = '<tr><th>Age</th><th>Typical observed average (steps/day)</th><th>Peak benefit range (Paluch 2022)</th></tr>'
    body = ''.join(f'<tr><th scope="row">{a}</th><td>{n(*r)}</td><td>{z}</td></tr>' for a, r, z in rows)
    return f'<div class="table-wrap"><table class="tbl"><thead>{head}</thead><tbody>{body}</tbody></table></div>'


page('avg', 'fr', '/fr/moyenne-pas-par-jour/',
     title='Moyenne de pas par jour : par âge, hommes, femmes',
     h1='Moyenne de pas par jour : par âge, hommes, femmes',
     desc="Quelle est la moyenne de pas par jour ? Repères par âge (20 à 70 ans et +), différences hommes/femmes et comparaison mondiale, sources à l'appui. Télécharge Walkever.",
     ct_override='site-avg-fr',
     answer="<p><b>Un adulte fait en moyenne 5 000 à 7 500 pas par jour</b> selon les pays et les études ; la moyenne mondiale mesurée par smartphone est d'environ 5 000. Au-dessus de 7 000 pas, tu fais mieux que la moyenne et tu es déjà dans la zone où le bénéfice santé est net. Les hommes marchent en général un peu plus que les femmes, et la moyenne baisse avec l'âge.</p>",
     body=lambda: f"""
<h2>Trois repères à retenir</h2>
<ul>
 <li><b>Sédentaire :</b> moins de 5 000 pas par jour. C'est la zone où chaque pas supplémentaire apporte le plus.</li>
 <li><b>Adulte actif :</b> 7 500 à 10 000 pas par jour, soit la zone de bénéfice maximal avant 60 ans (8 000–10 000).</li>
 <li><b>Senior :</b> 6 000 à 8 000 pas par jour suffisent à obtenir l'essentiel du bénéfice après 60 ans.</li>
</ul>

<h2>Moyenne de pas par jour selon l'âge</h2>
<p>Les valeurs ci-dessous sont des <b>ordres de grandeur</b> : elles varient beaucoup selon le pays, la méthode de mesure (podomètre, smartphone, bracelet) et le niveau d'activité de l'échantillon. La colonne de droite n'est pas une moyenne : c'est la zone où le risque de mortalité cesse de baisser nettement, d'après la méta-analyse de Paluch (2022).</p>
{avg_table('fr')}
<p class="note">Fourchettes indicatives établies à partir de la synthèse de Tudor-Locke (2011) et des mesures par podomètre de Bassett (2010) ; elles ne constituent pas des médianes officielles par tranche d'âge.</p>

<h2>Hommes et femmes : y a-t-il un écart ?</h2>
<p>Dans la plupart des études, les hommes font un peu plus de pas que les femmes à âge égal, de l'ordre de quelques centaines de pas par jour. L'écart reste faible comparé à celui qui sépare les tranches d'âge ou les modes de vie (travail debout ou assis, ville ou campagne, voiture ou marche). Côté santé, le bénéfice des pas est similaire pour les deux sexes.</p>

<h2>Et dans le monde ?</h2>
<p>L'étude de Stanford (Althoff, 2017), menée sur 717 527 personnes dans 46 pays, donne une moyenne mondiale d'environ <b>4 961 pas par jour</b>. Hong Kong est en tête (≈ 6 880), les États-Unis sont à ≈ 4 774, l'Allemagne à ≈ 5 205 et le Royaume-Uni à ≈ 5 444. Les mesures par podomètre dans des échantillons plus actifs (Suisse, Australie) montent à près de 9 700 (Bassett, 2010).</p>

<h2>Comment calculer ta moyenne personnelle</h2>
<p>Additionne tes pas sur la période choisie et divise par le nombre de jours. Sur iPhone, l'app Santé affiche la moyenne sur 7 jours ou sur le mois. Pour savoir en plus combien de pas par jour il te reste à faire pour atteindre ton objectif, utilise le <a href="/fr/calculateur-objectif-pas/">calculateur d'objectif de pas mensuel</a>.</p>

<h2>Pourquoi la moyenne du mois compte plus que le compteur du jour</h2>
<p>Un jour à 4 000 pas ne dit presque rien : un week-end de randonnée le rattrape. Ce qui pèse sur la santé, c'est l'habitude répétée, donc la <b>moyenne sur plusieurs semaines</b>. Suivre le mois, c'est transformer un objectif flou en chiffre concret : « il me reste 8 200 pas par jour ». C'est exactement ce que calcule Walkever. Pour les seuils selon l'âge, lis le guide <a href="/fr/combien-de-pas-par-jour/">combien de pas par jour</a>.</p>

<h2>Sources</h2>
{SRC_AVG_FR}
""",
     faq=[("Quelle est la moyenne de pas par jour d'un Français ?",
           "Il n'existe pas de chiffre officiel fiable. Les mesures par smartphone placent les grands pays d'Europe de l'Ouest autour de 5 000 à 5 500 pas par jour (Althoff, 2017) ; les adultes actifs dépassent 7 500."),
          ("Quelle est la moyenne de pas par jour à 60 ans ?",
           "Autour de 5 000 à 7 500 pas par jour, avec de grandes variations. Après 60 ans, le bénéfice santé se stabilise vers 6 000 à 8 000 pas (Paluch, 2022)."),
          ("Combien de pas fait en moyenne une femme par jour ?",
           "À âge égal, les femmes font en général quelques centaines de pas de moins que les hommes. Le bénéfice santé des pas est comparable chez les deux sexes."),
          ("Comment calculer sa propre moyenne de pas mensuelle ?",
           "Additionne tes pas du mois et divise par le nombre de jours écoulés. Walkever le fait automatiquement depuis l'app Santé et affiche aussi la moyenne requise pour finir le mois."),
          ("7 000 ou 10 000 pas par jour : que dit la science ?",
           "Le gain majeur se situe jusqu'à 7 000–8 000 pas. Au-delà, jusqu'à 10 000 avant 60 ans, le bénéfice continue de croître plus lentement (Paluch 2022, Ding 2025).")],
     related=['steps', 'pace'])

page('avg', 'en', '/en/average-steps-per-day/',
     title='Average Steps per Day: by Age, Men and Women',
     h1='Average steps per day: by age, men and women',
     desc="What is the average number of steps per day? Benchmarks by age (20s to 70+), men vs women and a world comparison, with sources. Download Walkever.",
     ct_override='site-avg-en',
     answer="<p><b>The average adult takes 5,000 to 7,500 steps a day</b> depending on country and study; the worldwide average measured by smartphone is about 5,000. Above 7,000 steps you are ahead of the average and already in the range where the health benefit is clear. Men usually walk slightly more than women, and the average falls with age.</p>",
     body=lambda: f"""
<h2>Three benchmarks to remember</h2>
<ul>
 <li><b>Sedentary:</b> under 5,000 steps a day. This is where each extra step helps the most.</li>
 <li><b>Active adult:</b> 7,500 to 10,000 steps a day, the peak-benefit range before age 60 (8,000–10,000).</li>
 <li><b>Senior:</b> 6,000 to 8,000 steps a day gets most of the benefit after age 60.</li>
</ul>

<h2>Average steps per day by age</h2>
<p>The values below are <b>orders of magnitude</b>: they vary a lot with country, measurement method (pedometer, phone, wristband) and how active the sample was. The right-hand column is not an average: it is the range where mortality risk stops falling sharply, from the Paluch (2022) meta-analysis.</p>
{avg_table('en')}
<p class="note">Indicative ranges drawn from the Tudor-Locke (2011) review and Bassett (2010) pedometer data; they are not official medians by age band.</p>

<h2>Men and women: is there a gap?</h2>
<p>In most studies men take slightly more steps than women of the same age, by a few hundred steps a day. The gap is small next to the difference between age groups or lifestyles (standing vs sitting work, city vs countryside, driving vs walking). For health, the benefit of steps is similar in both sexes.</p>

<h2>And worldwide?</h2>
<p>The Stanford study (Althoff, 2017), covering 717,527 people in 46 countries, found a worldwide average of about <b>4,961 steps a day</b>. Hong Kong leads (≈ 6,880); the US is at ≈ 4,774, Germany ≈ 5,205 and the UK ≈ 5,444. Pedometer studies in more active samples (Switzerland, Australia) reach nearly 9,700 (Bassett, 2010).</p>

<h2>How to work out your own average</h2>
<p>Add up your steps over the period and divide by the number of days. On iPhone, the Health app shows a 7-day or monthly average. To also see how many steps a day you still need to hit your goal, use the <a href="/en/step-goal-calculator/">monthly step goal calculator</a>.</p>

<h2>Why the monthly average matters more than today's count</h2>
<p>One 4,000-step day says almost nothing: a weekend hike makes up for it. What counts for health is the repeated habit, so the <b>average over several weeks</b>. Tracking the month turns a vague goal into a concrete number: "I need 8,200 steps a day from here." That is exactly what Walkever computes. For age-based thresholds, read the guide on <a href="/en/how-many-steps-a-day/">how many steps a day</a>.</p>

<h2>Sources</h2>
{SRC_AVG_EN}
""",
     faq=[("What is the average number of steps per day?",
           "Roughly 5,000 steps worldwide (Althoff, 2017) and 5,000 to 7,500 for adults in most studies. Active adults exceed 7,500. Averages vary by country, age and measurement method."),
          ("What is the average number of steps at age 60?",
           "Around 5,000 to 7,500 steps a day, with wide variation. After 60, the health benefit levels off around 6,000 to 8,000 steps (Paluch, 2022)."),
          ("How many steps does a woman take on average per day?",
           "At the same age, women usually take a few hundred fewer steps a day than men. The health benefit of steps is comparable in both sexes."),
          ("How do I calculate my own monthly step average?",
           "Add up your steps for the month and divide by the days elapsed. Walkever does it automatically from Apple Health and also shows the average needed to finish the month."),
          ("7,000 or 10,000 steps a day: what does science say?",
           "Most of the gain comes up to 7,000–8,000 steps. Beyond that, up to 10,000 before age 60, benefit keeps rising more slowly (Paluch 2022, Ding 2025).")],
     related=['steps', 'pace'])


# ---------------------------------------------------------------- render
L = {
    'fr': dict(home='Accueil', related='À lire aussi', promo_t='Walkever : ton rythme de pas, sans calcul',
               promo_p="Moyenne requise, avance ou retard, historique jour/mois/année. Gratuit, sans pub, aucune donnée collectée.",
               cta="Télécharger sur l'App Store", faq='Questions fréquentes', updated='Mis à jour le',
               privacy='/fr/confidentialite', privacy_l='Confidentialité', other='English',
               footnote="Apple, App Store et Apple Santé sont des marques d'Apple Inc. Walkever est édité par BELLASOR.",
               og_locale='fr_FR'),
    'en': dict(home='Home', related='Read next', promo_t='Walkever: your step pace, no math',
               promo_p="Required average, lead or lag, history by day/month/year. Free, no ads, no data collected.",
               cta='Download on the App Store', faq='FAQ', updated='Updated',
               privacy='/en/privacy', privacy_l='Privacy', other='Français',
               footnote="Apple, App Store and Apple Health are trademarks of Apple Inc. Walkever is published by BELLASOR.",
               og_locale='en_US'),
}
SHORT = {  # link labels
    'distance': {'fr': '10 000 pas en km : convertisseur', 'en': 'Steps to miles calculator'},
    'steps': {'fr': 'Combien de pas par jour ?', 'en': 'How many steps a day?'},
    'pace': {'fr': "Calculateur d'objectif de pas mensuel", 'en': 'Monthly step goal calculator'},
    'compare': {'fr': 'Meilleure application podomètre iPhone', 'en': 'Best step counter app iPhone'},
    'avg': {'fr': 'Moyenne de pas par jour', 'en': 'Average steps per day'},
    'challenge': {'fr': 'Défi 10 000 pas en janvier', 'en': 'January step challenge'},
    'annual': {'fr': "Calculateur d'objectif annuel de pas", 'en': 'Annual step goal calculator'},
}


HUB = {
    'fr': dict(path='/fr/guides/', label='Guides', tools='Calculateurs',
               title='Guides et calculateurs de pas : objectifs, moyennes, conversions | Walkever',
               desc="Tous les guides Walkever : combien de pas par jour, moyenne selon l'âge, 10 000 pas en km, calculateur d'objectif mensuel et annuel, comparatif d'apps podomètre iPhone et défis.",
               h1='Guides et calculateurs pour la marche',
               intro="Des repères sourcés et des outils gratuits pour fixer un objectif de pas réaliste, le convertir en distance et le tenir sur le mois.",
               sections=[('reperes', 'Repères : combien marcher', ['steps', 'avg']),
                         ('outils', 'Calculateurs', ['pace', 'distance', 'annual']),
                         ('apps', 'Applis et défis', ['compare', 'challenge'])]),
    'en': dict(path='/en/guides/', label='Guides', tools='Calculators',
               title='Step guides and calculators: goals, averages, conversions | Walkever',
               desc='All Walkever guides: how many steps a day, average steps by age, steps to miles, monthly and annual step goal calculators, best iPhone step counter apps and challenges.',
               h1='Walking guides and calculators',
               intro='Sourced benchmarks and free tools to set a realistic step goal, turn it into distance and stay on pace all month.',
               sections=[('benchmarks', 'Benchmarks: how much to walk', ['steps', 'avg']),
                         ('tools', 'Calculators', ['pace', 'distance', 'annual']),
                         ('apps', 'Apps and challenges', ['compare', 'challenge'])]),
}


def menu(lang):
    h = HUB[lang]
    tools_anchor = h['sections'][1][0]
    return (f'<span class="menu"><a href="{h["path"]}">{h["label"]}</a>'
            f'<a href="{h["path"]}#{tools_anchor}">{h["tools"]}</a></span>')


def footer_links(lang):
    return ' '.join([f'<a href="{HUB[lang]["path"]}">{"Tous les guides" if lang == "fr" else "All guides"}</a>'] +
                    [f'<a href="{PAGES[k][lang]["path"]}">{SHORT[k][lang]}</a>' for k in ('steps', 'avg', 'distance', 'pace', 'annual', 'compare', 'challenge')])


def footer(lang, other_href):
    t = L[lang]
    return f"""<footer><div class="wrap">
  <p class="links">{footer_links(lang)}</p>
  <p><a href="{store(lang, 'site-footer')}">App Store</a> · <a href="{t['privacy']}">{t['privacy_l']}</a> · <a href="mailto:contact@walkever.app">Contact</a> · <a href="{other_href}" hreflang="{'en' if lang=='fr' else 'fr'}">{t['other']}</a></p>
  <p>{t['footnote']}</p>
</div></footer>"""


def render(p):
    lang, t = p['lang'], L[p['lang']]
    other = PAGES[p['key']]['en' if lang == 'fr' else 'fr']
    url = BASE + p['path']
    home = f'/{lang}/'
    ct = p.get('ct_override') or ('site-' + p['key'])
    faq_html = ''.join(f'<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>' for q, a in p['faq'])
    related = ''.join(f'<li><a href="{PAGES[k][lang]["path"]}">{SHORT[k][lang]}</a></li>' for k in p['related'])
    ld = [
        {"@context": "https://schema.org", "@type": "Article" if not p.get('tool') else "WebPage", "headline": p['h1'],
         "description": p['desc'], "inLanguage": lang, "url": url, "datePublished": p.get('published', TODAY), "dateModified": TODAY,
         "author": {"@id": BASE + "/#org"}, "publisher": ORG, "image": BASE + f"/img/{lang}/1-dashboard.png"},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Walkever", "item": BASE + home},
            {"@type": "ListItem", "position": 2, "name": HUB[lang]['label'], "item": BASE + HUB[lang]['path']},
            {"@type": "ListItem", "position": 3, "name": p['h1'], "item": url}]},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p['faq']]},
    ]
    if p.get('tool'):
        ld[0]["mainEntity"] = {"@type": "WebApplication", "name": p['h1'], "applicationCategory": "HealthApplication",
                               "operatingSystem": "Any", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}}
    tools_js = '<script src="/tools.js" defer></script>' if p.get('tool') else ''
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0b0f">
<title>{html.escape(p['title'])}</title>
<meta name="description" content="{html.escape(p['desc'])}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="{lang}" href="{url}">
<link rel="alternate" hreflang="{other['lang']}" href="{BASE + other['path']}">
<link rel="alternate" hreflang="x-default" href="{BASE + PAGES[p['key']]['en']['path']}">
<meta name="apple-itunes-app" content="app-id={APP_ID}">
<meta property="og:type" content="{'website' if p.get('tool') else 'article'}">
<meta property="og:site_name" content="Walkever">
<meta property="og:locale" content="{t['og_locale']}">
<meta property="og:locale:alternate" content="{L['en' if lang == 'fr' else 'fr']['og_locale']}">
<meta property="og:title" content="{html.escape(p['title'])}">
<meta property="og:description" content="{html.escape(p['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/img/og/{lang}-{p['key']}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{html.escape(p['h1'])} — Walkever">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(p['title'])}">
<meta name="twitter:description" content="{html.escape(p['desc'])}">
<meta name="twitter:image" content="{BASE}/img/og/{lang}-{p['key']}.png">
<link rel="stylesheet" href="/style.css">
<link rel="icon" type="image/png" sizes="32x32" href="/img/logo-32.png">
<link rel="apple-touch-icon" href="/img/logo-180.png">
{''.join(j(x) for x in ld)}
{tools_js}
</head>
<body>
<header><div class="wrap"><a class="brand" href="{home}"><img src="/img/logo-64.png" width="36" height="36" alt="">Walkever</a>
<nav class="nav" aria-label="Navigation">{menu(lang)}<span class="lang"><a href="{PAGES[p['key']]['fr']['path']}" hreflang="fr"{' aria-current="page"' if lang=='fr' else ''}>FR</a><a href="{PAGES[p['key']]['en']['path']}" hreflang="en"{' aria-current="page"' if lang=='en' else ''}>EN</a></span><a class="btn sm" href="{store(lang, ct + '-header')}">App Store</a></nav></div></header>
<main class="doc">
<p class="crumbs"><a href="{home}">Walkever</a> › <a href="{HUB[lang]['path']}">{HUB[lang]['label']}</a> › {html.escape(SHORT[p['key']][lang])}</p>
<h1>{p['h1']}</h1>
<div class="answer">{p['answer']}</div>
{p['body']()}
<aside class="promo"><img src="/img/logo-180.png" width="72" height="72" alt="Walkever"><div><b>{t['promo_t']}</b><p>{t['promo_p']}</p><a class="btn sm" href="{store(lang, ct)}">{t['cta']}</a></div></aside>
<h2>{t['faq']}</h2>
<div class="faq">{faq_html}</div>
<h2>{t['related']}</h2>
<ul class="related">{related}</ul>
<p class="note">{t['updated']} {TODAY} · Walkever</p>
</main>
{footer(lang, other['path'])}
</body>
</html>
"""


def render_hub(lang):
    h, t = HUB[lang], L[lang]
    other = HUB['en' if lang == 'fr' else 'fr']
    url = BASE + h['path']
    home = f'/{lang}/'
    secs, items = '', []
    for sid, stitle, keys in h['sections']:
        cards = ''
        for k in keys:
            p = PAGES[k][lang]
            items.append(p)
            cards += (f'<li><a href="{p["path"]}"><b>{html.escape(SHORT[k][lang])}</b>'
                      f'<span>{html.escape(re.sub(r"\s*(Télécharge|Essaie|Download|Try) Walkever[^.]*\.$", "", p["desc"]))}</span></a></li>')
        secs += f'<h2 id="{sid}">{html.escape(stitle)}</h2>\n<ul class="hub">{cards}</ul>\n'
    ld = [
        {"@context": "https://schema.org", "@type": "CollectionPage", "name": h['h1'], "description": h['desc'],
         "inLanguage": lang, "url": url, "publisher": ORG,
         "mainEntity": {"@type": "ItemList", "itemListElement": [
             {"@type": "ListItem", "position": i + 1, "url": BASE + p['path'], "name": p['h1']} for i, p in enumerate(items)]}},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Walkever", "item": BASE + home},
            {"@type": "ListItem", "position": 2, "name": h['label'], "item": url}]},
    ]
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0b0f">
<title>{html.escape(h['title'])}</title>
<meta name="description" content="{html.escape(h['desc'])}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="{lang}" href="{url}">
<link rel="alternate" hreflang="{'en' if lang == 'fr' else 'fr'}" href="{BASE + other['path']}">
<link rel="alternate" hreflang="x-default" href="{BASE + HUB['en']['path']}">
<meta name="apple-itunes-app" content="app-id={APP_ID}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Walkever">
<meta property="og:locale" content="{t['og_locale']}">
<meta property="og:title" content="{html.escape(h['title'])}">
<meta property="og:description" content="{html.escape(h['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/img/og/{lang}-home.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{BASE}/img/og/{lang}-home.png">
<link rel="stylesheet" href="/style.css">
<link rel="icon" type="image/png" sizes="32x32" href="/img/logo-32.png">
<link rel="apple-touch-icon" href="/img/logo-180.png">
{''.join(j(x) for x in ld)}
</head>
<body>
<header><div class="wrap"><a class="brand" href="{home}"><img src="/img/logo-64.png" width="36" height="36" alt="">Walkever</a>
<nav class="nav" aria-label="Navigation">{menu(lang).replace(f'href="{h["path"]}"', f'href="{h["path"]}" aria-current="page"', 1)}<span class="lang"><a href="{HUB['fr']['path']}" hreflang="fr"{' aria-current="page"' if lang=='fr' else ''}>FR</a><a href="{HUB['en']['path']}" hreflang="en"{' aria-current="page"' if lang=='en' else ''}>EN</a></span><a class="btn sm" href="{store(lang, 'site-guides-header')}">App Store</a></nav></div></header>
<main class="doc">
<p class="crumbs"><a href="{home}">Walkever</a> › {h['label']}</p>
<h1>{h['h1']}</h1>
<p class="lead">{h['intro']}</p>
{secs}
<aside class="promo"><img src="/img/logo-180.png" width="72" height="72" alt="Walkever"><div><b>{t['promo_t']}</b><p>{t['promo_p']}</p><a class="btn sm" href="{store(lang, 'site-guides')}">{t['cta']}</a></div></aside>
</main>
{footer(lang, other['path'])}
</body>
</html>
"""


def write(path, content):
    full = os.path.join(ROOT, path.lstrip('/'))
    if full.endswith('/'):
        full += 'index.html'
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)


def generate_webp(png_path):
    """Generate a .webp alongside a .png using cwebp."""
    webp_path = png_path[:-4] + '.webp'
    if os.path.exists(webp_path) and os.path.getmtime(webp_path) >= os.path.getmtime(png_path):
        return
    try:
        subprocess.run(['cwebp', '-q', '82', png_path, '-o', webp_path],
                       check=True, capture_output=True)
    except (FileNotFoundError, subprocess.CalledProcessError) as e:
        print(f'Warning: cannot convert {os.path.basename(png_path)} to WebP — install cwebp (brew install webp). {e}')


def _wrap_phone_imgs_webp(html_content):
    """Wrap <div class="phone"><img .../img/.../X.png ...></div> with <picture>."""
    def repl(m):
        img = m.group(1)
        src_m = re.search(r'src="(/img/[^"]+)\.png"', img)
        if not src_m:
            return m.group(0)
        webp = src_m.group(1) + '.webp'
        return f'<div class="phone"><picture><source type="image/webp" srcset="{webp}">{img}</picture></div>'
    return re.sub(
        r'<div class="phone">(<img\s[^>]*src="/img/(?:fr|en)/[^"]*\.png"[^>]*>)</div>',
        repl, html_content)


def main():
    for key, langs in PAGES.items():
        for p in langs.values():
            write(p['path'], render(p))
    for lang in ('fr', 'en'):
        write(HUB[lang]['path'], render_hub(lang))

    # keep home footers + menu in sync
    for lang in ('fr', 'en'):
        fp = os.path.join(ROOT, lang, 'index.html')
        s = open(fp, encoding='utf-8').read()
        block = f'<!--GUIDES--><p class="links">{footer_links(lang)}</p><!--/GUIDES-->'
        s2 = re.sub(r'<!--GUIDES-->.*?<!--/GUIDES-->', block, s, flags=re.S)
        mblock = f'<!--MENU-->{menu(lang)}<!--/MENU-->'
        if '<!--MENU-->' in s2:
            s2 = re.sub(r'<!--MENU-->.*?<!--/MENU-->', mblock, s2, flags=re.S)
        else:
            s2 = s2.replace('<nav class="nav" aria-label="Navigation">', '<nav class="nav" aria-label="Navigation">' + mblock, 1)
        if s2 != s:
            open(fp, 'w', encoding='utf-8').write(s2)

    # H3: generate WebP variants for all app screenshots
    for lang in ('fr', 'en'):
        img_dir = os.path.join(ROOT, 'img', lang)
        for name in ('1-dashboard', '2-days', '3-months', '4-years'):
            png = os.path.join(img_dir, f'{name}.png')
            if os.path.exists(png):
                generate_webp(png)

    # H2 + H3: inject preload and <picture> wrappers in hand-written home pages
    for lang in ('fr', 'en'):
        fp = os.path.join(ROOT, lang, 'index.html')
        s = open(fp, encoding='utf-8').read()
        # H2: <link rel="preload"> for LCP hero image (idempotent)
        preload = f'<link rel="preload" as="image" href="/img/{lang}/1-dashboard.webp" type="image/webp" fetchpriority="high">'
        old_preload = f'<link rel="preload" as="image" href="/img/{lang}/1-dashboard.png" fetchpriority="high">'
        s = s.replace(old_preload + '\n', '')
        if preload not in s:
            s = s.replace('<link rel="stylesheet" href="/style.css">',
                          f'{preload}\n<link rel="stylesheet" href="/style.css">')
        # H3: wrap phone <img> elements with <picture> for WebP (idempotent)
        s = _wrap_phone_imgs_webp(s)
        open(fp, 'w', encoding='utf-8').write(s)

    # sitemap
    groups = [{'fr': '/fr/', 'en': '/en/'}, {'fr': HUB['fr']['path'], 'en': HUB['en']['path']},
              {'fr': '/fr/confidentialite', 'en': '/en/privacy'}]
    groups += [{l: PAGES[k][l]['path'] for l in ('fr', 'en')} for k in PAGES]
    urls = []
    for g in groups:
        for l, path in g.items():
            alts = ''.join(f'<xhtml:link rel="alternate" hreflang="{a}" href="{BASE + ap}"/>' for a, ap in g.items())
            alts += f'<xhtml:link rel="alternate" hreflang="x-default" href="{BASE + g["en"]}"/>'
            urls.append(f'<url><loc>{BASE + path}</loc><lastmod>{TODAY}</lastmod>{alts}</url>')
    write('/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + '\n'.join(urls) + '\n</urlset>\n')

    # llms.txt
    lines = ["# Walkever", "",
             "> Walkever (iOS, formerly \"Objectif 10K Pas\") is a free iPhone step tracker that tells you whether you are on pace to hit your step goal by day, month and year. It reads steps from Apple Health. No ads, no account, no data collected; everything stays on the iPhone. Available in English and French.", "",
             "## Key facts",
             f"- App Store: https://apps.apple.com/app/id{APP_ID}",
             "- Price: free, no in-app purchases, no ads",
             "- Platform: iPhone (iOS 15.1+), data source: Apple Health (HealthKit, read-only)",
             "- Features: today's steps; monthly total and daily average; required daily average to finish the month (with or without today); cumulative lead/lag vs ideal pace with a color-coded progress bar; history by day, month and year; customizable daily goal (10,000 by default)",
             "- Privacy: no data collected, no analytics, no third-party tracking",
             "- Publisher: BELLASOR (France), contact@walkever.app", "",
             "## Pages"]
    lines += [f"- [Walkever (English)]({BASE}/en/): product page", f"- [Walkever (français)]({BASE}/fr/): page produit",
              f"- [{HUB['en']['h1']}]({BASE + HUB['en']['path']}): {HUB['en']['desc']}",
              f"- [{HUB['fr']['h1']}]({BASE + HUB['fr']['path']}): {HUB['fr']['desc']}"]
    for k in PAGES:
        for l in ('en', 'fr'):
            p = PAGES[k][l]
            lines.append(f"- [{p['h1']}]({BASE + p['path']}): {p['desc']}")
    lines += [f"- [Privacy policy]({BASE}/en/privacy)", f"- [Politique de confidentialité]({BASE}/fr/confidentialite)", ""]
    write('/llms.txt', '\n'.join(lines))


if __name__ == '__main__':
    main()
