const tableTransition = document.getElementById("tableTransition")
const btnNouvelEtat = document.getElementById("btnNouvelEtat")
const btnValider = document.getElementById("btnValider")
const btnPrev = document.getElementById("btnPrev")
const btnNext = document.getElementById("btnNext")
const btnLecture = document.getElementById("btnLecture")
const spanRuban = document.querySelector(".ruban")
const divMachine = document.querySelector(".machine")
const pMessage = document.getElementById("message")
const listeEtats = []
var ruban
var etatActuel
var pileAvant = []
var pileApres = []
var idLecture

class Ruban {
    constructor(avant, lu, apres) {
        this.teteLecture = new Cell(null, null, lu);
        this.teteLecture.span.className = "lu"
        spanRuban.appendChild(this.teteLecture.span);
        this.premiereCase = this.teteLecture;
        this.derniereCase = this.teteLecture;
        this.nbAvant = 0;
        this.nbApres = 0;
        Array.from(avant).reverse().forEach(v => this.etendre(false, v));
        Array.from(apres).forEach(v => this.etendre(true, v));
        for (let i = 0; i<15; i++) {
            this.etendre(true, "\u00a0");
            this.etendre(false, "\u00a0");
        }
        divMachine.scrollLeft = 0.5*(spanRuban.offsetWidth-divMachine.offsetWidth)
    }
    etendre(fin, valeur) {
        if (fin) {
            const cell = new Cell(this.derniereCase, null, valeur);
            this.derniereCase.suivante = cell;
            this.derniereCase = cell;
            this.nbApres += 1;
            spanRuban.appendChild(cell.span);
        } else {
            const cell = new Cell(null, this.premiereCase, valeur);
            this.premiereCase.precedente = cell;
            this.premiereCase = cell;
            this.nbAvant += 1;
            spanRuban.insertBefore(cell.span, spanRuban.firstChild);
        }
    }
    deplacer(direction) {
        if (direction == "→") {
            this.teteLecture.span.className = "";
            this.teteLecture = this.teteLecture.suivante;
            this.teteLecture.span.className = "lu";
            this.nbAvant += 1;
            this.nbApres -= 1;
            if (this.nbApres < 15) {
                this.etendre(true, "\u00a0");
            }
        } else {
            this.teteLecture.span.className = "";
            this.teteLecture = this.teteLecture.precedente;
            this.teteLecture.span.className = "lu";
            this.nbAvant -= 1;
            this.nbApres += 1;
            if (this.nbAvant < 15) {
                this.etendre(false, "\u00a0");
            }
        }
    }
    getValeur() {
        return this.teteLecture.span.textContent.replace("\u00a0", "_")
    }
    setValeur(valeur) {
        this.teteLecture.span.textContent = valeur.replace("_", "\u00a0")
    }
}

class Cell {
    constructor(precedente, suivante, valeur) {
        this.precedente = precedente;
        this.suivante = suivante;
        this.span = document.createElement("span");
        this.span.textContent = valeur;
    }
}

class Ligne {
    constructor(lu) {
        this.tdLu = document.createElement("td");
        this.tdLu.textContent = lu
        this.tdEcrit = document.createElement("td");
        this.selectEcrit = document.createElement("select");
        this.selectEcrit.add(new Option("0", "0"));
        this.selectEcrit.add(new Option("1", "1"));
        this.selectEcrit.add(new Option("_", "_"));
        this.tdEcrit.appendChild(this.selectEcrit);
        this.tdSens = document.createElement("td");
        this.selectSens = document.createElement("select");
        this.selectSens.add(new Option("→", "→"));
        this.selectSens.add(new Option("←", "←"));
        this.tdSens.appendChild(this.selectSens);
        this.tdEtatSuivant = document.createElement("td");
        this.selectEtatSuivant = document.createElement("select");
        this.selectEtatSuivant.add(new Option("FIN", "FIN"));
        this.selectEtatSuivant.add(new Option("VRAI", "VRAI"));
        this.selectEtatSuivant.add(new Option("FAUX", "FAUX"));
        listeEtats.forEach(etat => {
            this.selectEtatSuivant.add(new Option(etat.nom, listeEtats.indexOf(etat)));
        })
        this.tdEtatSuivant.appendChild(this.selectEtatSuivant);
    }
    placer(tr) {
        tr.appendChild(this.tdLu);
        tr.appendChild(this.tdEcrit);
        tr.appendChild(this.tdSens);
        tr.appendChild(this.tdEtatSuivant);
    }
}

class Etat {
    constructor(n) {
        this.nom = `E${n}`;
        this.tr = document.createElement("tr");
        this.td = document.createElement("td");
        this.td.textContent = this.nom;
        this.td.rowSpan = "3";
        this.tr.appendChild(this.td);
        this.etat = {
            "0" : new Ligne("0"),
            "1" : new Ligne("1"),
            "_" : new Ligne("_")
        }
        this.etat["0"].placer(this.tr);
        const tr2 = document.createElement("tr");
        this.etat["1"].placer(tr2);
        const tr3 = document.createElement("tr");
        this.etat["_"].placer(tr3);
        tableTransition.appendChild(this.tr);
        tableTransition.appendChild(tr2);
        tableTransition.appendChild(tr3);
    }
}

function ajouterEtat(event) {
    const etat = new Etat(listeEtats.length)
    listeEtats.push(etat);
    listeEtats.forEach(e => {
        e.etat["0"].selectEtatSuivant.add(new Option(etat.nom, listeEtats.indexOf(etat)));
        e.etat["1"].selectEtatSuivant.add(new Option(etat.nom, listeEtats.indexOf(etat)));
        e.etat["_"].selectEtatSuivant.add(new Option(etat.nom, listeEtats.indexOf(etat)));
    })
}

function verifierEntree(texte) {
    for (let i=0; i<texte.length; i++) {
        if (texte[i] != "0" && texte[i] != "1" && texte[i] != "\u00a0") {
            message.className = "centrer erreur"
            message.textContent = "Caractère interdit en entrée."
            return false
        }
    }
    message.className = "centrer"
    message.textContent = ""
    return true
}

function surlignerEtat() {
    const listeTd = document.querySelectorAll("#tableTransition td");
    listeTd.forEach(td => td.className = "")
    if (etatActuel) {
        const ligne = etatActuel.etat[ruban.getValeur()];
        etatActuel.td.className = "evidence";
        ligne.tdLu.className = "evidence";
        ligne.tdEcrit.className = "evidence";
        ligne.tdSens.className = "evidence";
        ligne.tdEtatSuivant.className = "evidence";
    }
}

function reinitialiser(event) {
    if (event.target.value == "Valider") {
        const apres = document.getElementById("textApresTete").value.replace(" ", "\u00a0").replace("_", "\u00a0")
        const avant = document.getElementById("textAvantTete").value.replace(" ", "\u00a0").replace("_", "\u00a0")
        const lu = document.getElementById("textTete").value.replace(" ", "\u00a0").replace("_", "\u00a0") || "\u00a0"
        if (verifierEntree(avant+lu+apres)) {
            ruban = new Ruban(avant, lu, apres)
            etatActuel = listeEtats[0]
            surlignerEtat()
            btnNouvelEtat.disabled = true
            btnValider.value = "Modifier"
            document.querySelectorAll("#tableTransition select").forEach(select => select.disabled=true)
            btnPrev.disabled = false
            btnNext.disabled = false
            btnLecture.disabled = false
            document.getElementById("textApresTete").disabled = true
            document.getElementById("textAvantTete").disabled = true
            document.getElementById("textTete").disabled = true
        }
    } else {
        pileApres = []
        pileAvant = []
        while (spanRuban.firstChild) {
            spanRuban.removeChild(spanRuban.firstChild)
        }
        etatActuel = null
        surlignerEtat()
        btnNouvelEtat.disabled = false
        btnValider.value = "Valider"
        document.querySelectorAll("#tableTransition select").forEach(select => select.disabled=false)
        btnPrev.disabled = true
        btnNext.disabled = true
        btnLecture.disabled = true
        document.getElementById("textApresTete").disabled = false
        document.getElementById("textAvantTete").disabled = false
        document.getElementById("textTete").disabled = false
    }
}

function transitions() {
    if (etatActuel) {
        const ligne = etatActuel.etat[ruban.getValeur()];
        pileAvant.push({etatActuel, ligne})
        ruban.setValeur(ligne.selectEcrit.value)
        ruban.deplacer(ligne.selectSens.value)
        if (listeEtats[ligne.selectEtatSuivant.value]) {
            etatActuel = listeEtats[ligne.selectEtatSuivant.value]
            surlignerEtat()
        } else {
            message.textContent = `L'éxécution s'arrête sur l'état ${ligne.selectEtatSuivant.value}`
            etatActuel = null
            surlignerEtat()
        }
    }
}

function afficherSuivant(histo) {
    const etat = histo.etatActuel
    const ligne = histo.ligne
    ruban.setValeur(ligne.selectEcrit.value)
    ruban.deplacer(ligne.selectSens.value)
    etatActuel = listeEtats[ligne.selectEtatSuivant.value]
    surlignerEtat()
}

function suivant(event) {
    if (event && idLecture) {
        lecture(null)
    }
    if (pileApres.length > 0) {
        const histo = pileApres.pop()
        pileAvant.push(histo)
        afficherSuivant(histo)
    } else {
        transitions()
    }
}

function afficherPrecedent(histo) {
    const etat = histo.etatActuel
    const ligne = histo.ligne
    if (ligne.selectSens.value == "→") {
        ruban.deplacer("←")
    } else {
        ruban.deplacer("→")
    }
    ruban.setValeur(ligne.tdLu.textContent)
    etatActuel = etat
    surlignerEtat()
}

function precedent(event) {
    if (idLecture) {
        lecture(event)
    }
    if (pileAvant.length > 0) {
        const histo = pileAvant.pop()
        pileApres.push(histo)
        afficherPrecedent(histo)
    }
}

function lecture(event) {
    if (btnLecture.value == "Pause") {
        clearInterval(idLecture);
        btnLecture.value = "Lecture auto"
        idLecture = null
    } else {
        idLecture = setInterval(suivant, 750);
        btnLecture.value = "Pause"
    }
}

ajouterEtat(null)
btnPrev.disabled = true
btnNext.disabled = true
btnLecture.disabled = true
document.getElementById("textApresTete").value = ""
document.getElementById("textAvantTete").value = ""
document.getElementById("textTete").value = ""

btnNouvelEtat.addEventListener("click", ajouterEtat)
btnValider.addEventListener("click", reinitialiser)
btnPrev.addEventListener("click", precedent)
btnNext.addEventListener("click", suivant)
btnLecture.addEventListener("click", lecture)
