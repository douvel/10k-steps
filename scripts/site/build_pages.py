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
     related=['pace', 'distance', 'compare'])

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
     related=['pace', 'distance', 'compare'])


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
     related=['steps', 'distance', 'compare'])

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
     related=['steps', 'distance', 'compare'])


# ---------- 4. Best step counter app (compare)
def compare_table_fr():
    return """<div class="table-wrap"><table class="tbl">
<thead><tr>
  <th>Application</th><th>Gratuit&nbsp;?</th><th>Publicités&nbsp;?</th><th>HealthKit&nbsp;?</th><th>Fonctionnalité clé</th>
</tr></thead>
<tbody>
<tr><th scope="row"><b>Walkever</b></th><td>✅ Oui</td><td>❌ Aucune</td><td>✅ Oui</td><td>Objectif mensuel + moyenne requise par jour</td></tr>
<tr><th scope="row">Apple Santé (natif)</th><td>✅ Oui</td><td>❌ Aucune</td><td>✅ Natif</td><td>Comptage automatique, tendances hebdomadaires</td></tr>
<tr><th scope="row">Steps – Fitness Tracker</th><td>Freemium</td><td>Oui (gratuit)</td><td>✅ Oui</td><td>Graphiques détaillés, streaks quotidiens</td></tr>
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
<tr><th scope="row">Steps – Fitness Tracker</th><td>Freemium</td><td>Yes (free tier)</td><td>✅ Yes</td><td>Detailed charts, daily streaks</td></tr>
<tr><th scope="row">Pedometer++</th><td>Freemium</td><td>No</td><td>✅ Yes</td><td>Widgets, Apple Watch integration</td></tr>
</tbody>
</table></div>"""


page('compare', 'fr', '/fr/meilleure-application-podometre-iphone/',
     title='Meilleure application podomètre iPhone gratuite sans publicité (2026)',
     h1='Meilleure application podomètre iPhone gratuite sans publicité',
     desc="Comparatif honnête de 4 applications podomètre iPhone : Walkever, Apple Santé, Steps et Pedometer++. Gratuit, sans pub, avec HealthKit — lequel choisir ?",
     ct_override='site-compare-fr',
     answer="<p>Pour un suivi fiable sans publicité, <b>quatre applications se distinguent sur iPhone</b> en 2026 : Walkever, Apple Santé (natif), Steps et Pedometer++. Le critère qui fait la différence : te dire si tu es dans les temps pour ton objectif du mois, pas seulement combien de pas tu as faits aujourd'hui.</p>",
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
     desc="Honest comparison of 4 iPhone step counter apps: Walkever, Apple Health, Steps and Pedometer++. Free, no ads, HealthKit — which one to choose?",
     ct_override='site-compare-en',
     answer="<p>For reliable, ad-free step tracking on iPhone, <b>four apps stand out in 2026</b>: Walkever, Apple Health (built-in), Steps and Pedometer++. The differentiator: does the app tell you whether you are on pace for your monthly goal, not just today's count?</p>",
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


# ---------------------------------------------------------------- render
L = {
    'fr': dict(home='Accueil', related='À lire aussi', promo_t='Walkever : ton rythme de pas, sans calcul',
               promo_p="Moyenne requise, avance ou retard, historique jour/mois/année. Gratuit, sans pub, aucune donnée collectée.",
               cta="Télécharger sur l'App Store", faq='Questions fréquentes', updated='Mis à jour le',
               privacy='/fr/confidentialite.html', privacy_l='Confidentialité', other='English',
               footnote="Apple, App Store et Apple Santé sont des marques d'Apple Inc. Walkever est édité par BELLASOR.",
               og_locale='fr_FR'),
    'en': dict(home='Home', related='Read next', promo_t='Walkever: your step pace, no math',
               promo_p="Required average, lead or lag, history by day/month/year. Free, no ads, no data collected.",
               cta='Download on the App Store', faq='FAQ', updated='Updated',
               privacy='/en/privacy.html', privacy_l='Privacy', other='Français',
               footnote="Apple, App Store and Apple Health are trademarks of Apple Inc. Walkever is published by BELLASOR.",
               og_locale='en_US'),
}
SHORT = {  # link labels
    'distance': {'fr': '10 000 pas en km : convertisseur', 'en': 'Steps to miles calculator'},
    'steps': {'fr': 'Combien de pas par jour ?', 'en': 'How many steps a day?'},
    'pace': {'fr': "Calculateur d'objectif de pas mensuel", 'en': 'Monthly step goal calculator'},
    'compare': {'fr': 'Meilleure application podomètre iPhone', 'en': 'Best step counter app iPhone'},
}


def footer_links(lang):
    return ' '.join(f'<a href="{PAGES[k][lang]["path"]}">{SHORT[k][lang]}</a>' for k in ('steps', 'distance', 'pace', 'compare'))


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
         "description": p['desc'], "inLanguage": lang, "url": url, "dateModified": TODAY,
         "author": {"@id": BASE + "/#org"}, "publisher": ORG, "image": BASE + f"/img/{lang}/1-dashboard.png"},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Walkever", "item": BASE + home},
            {"@type": "ListItem", "position": 2, "name": p['h1'], "item": url}]},
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
<meta property="og:type" content="article">
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
<nav class="nav" aria-label="Navigation"><span class="lang"><a href="{PAGES[p['key']]['fr']['path']}" hreflang="fr"{' aria-current="page"' if lang=='fr' else ''}>FR</a><a href="{PAGES[p['key']]['en']['path']}" hreflang="en"{' aria-current="page"' if lang=='en' else ''}>EN</a></span><a class="btn sm" href="{store(lang, ct + '-header')}">App Store</a></nav></div></header>
<main class="doc">
<p class="crumbs"><a href="{home}">Walkever</a> › {html.escape(SHORT[p['key']][lang])}</p>
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

    # keep home footers in sync
    for lang in ('fr', 'en'):
        fp = os.path.join(ROOT, lang, 'index.html')
        s = open(fp, encoding='utf-8').read()
        block = f'<!--GUIDES--><p class="links">{footer_links(lang)}</p><!--/GUIDES-->'
        s2 = re.sub(r'<!--GUIDES-->.*?<!--/GUIDES-->', block, s, flags=re.S)
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
    groups = [{'fr': '/fr/', 'en': '/en/'}, {'fr': '/fr/confidentialite.html', 'en': '/en/privacy.html'}]
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
    lines += [f"- [Walkever (English)]({BASE}/en/): product page", f"- [Walkever (français)]({BASE}/fr/): page produit"]
    for k in PAGES:
        for l in ('en', 'fr'):
            p = PAGES[k][l]
            lines.append(f"- [{p['h1']}]({BASE + p['path']}): {p['desc']}")
    lines += [f"- [Privacy policy]({BASE}/en/privacy.html)", ""]
    write('/llms.txt', '\n'.join(lines))


if __name__ == '__main__':
    main()
