function waitForElement(selector, callback, interval = 100) {
    const intervalId = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(intervalId); // Stop la boucle
            callback(element); // Exécute une action avec l'élément détecté
        }
    }, interval);
}

function getAllTextFromSpans(className) {
    const spans = document.querySelectorAll(`span.${className}`);
    // Récupère tous les textes sauf les deux derniers, comme dans votre script.
    return Array.from(spans).slice(0, -2).map(span => span.textContent.trim());
}

function getRelatedTitlesAndValues(titles) {
    const result = {};
    const titleCounts = {}; // Compteur pour gérer les doublons dans le dictionnaire

    titles.forEach((titleText) => {
        // Trouver tous les éléments correspondants dans le DOM
        const matchingElements = Array.from(document.querySelectorAll('.ie-titre-gros'))
            .filter(el => el.textContent.trim() === titleText);

        matchingElements.forEach((titleElement, occurrence) => {
            // Trouver le conteneur principal
            const zoneCentrale = titleElement.closest('.zone-centrale');
            if (zoneCentrale) {
                // Chercher dans "zone-complementaire" la valeur associée
                const complementaryValue = zoneCentrale.querySelector('.zone-complementaire .ie-titre-gros');
                if (complementaryValue) {
                    // Gestion des doublons : ajouter un suffixe si le titre existe déjà
                    let uniqueTitle = titleText;
                    if (result[uniqueTitle]) {
                        titleCounts[titleText] = (titleCounts[titleText] || 1) + 1;
                        uniqueTitle = `${titleText} ${titleCounts[titleText]}`;
                    } else {
                        titleCounts[titleText] = 1;
                    }

                    // Ajouter l'entrée au dictionnaire
                    result[uniqueTitle] = complementaryValue.textContent.trim();
                }
            }
        });
    });

    return result;
}

// Exemple d'utilisation : Attendre un div avec la classe total-content
waitForElement('.total-content', (element) => {

    // Fonction pour lire un cookie par son nom
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    }
    
    // Fonction pour définir un cookie
    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    }
    
    // Vérifie si le cookie existe
    const userPreference = getCookie("user_preference");
    
    // Création du texte pour la popup avec des checkboxes
    let text = '<p>Quelles sont vos spécialités ?</p>';
    const texts = getAllTextFromSpans('ie-titre-gros');

    // Enlever les doublons dans la liste de titres
    const uniqueTexts = Array.from(new Set(texts));  // Utilisation d'un Set pour enlever les doublons

    // Création des checkboxes
    uniqueTexts.forEach(textOption => {
        text += `<label><input type="checkbox" value="${textOption}" class="user-choice-checkbox"> ${textOption}</label><br>`;
    });

    text += '<div style="margin-top: 10px; text-align: right;"><button id="confirm-choice">Confirmer</button></div>';
    console.log(text);

    if (!userPreference) {
        // Si le cookie n'existe pas, afficher une popup
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.backgroundColor = "white";
        popup.style.padding = "20px";
        popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.2)";
        popup.style.zIndex = "9999";
        popup.style.width = "300px";
        popup.innerHTML = text;
    
        document.body.appendChild(popup);
    
        // Gestion du clic sur le bouton "Confirmer"
        document.getElementById("confirm-choice").addEventListener("click", () => {
            const selectedOptions = Array.from(document.querySelectorAll('.user-choice-checkbox:checked'))
                .map(checkbox => checkbox.value); // Récupère toutes les options cochées

            // Enregistrer la liste des choix dans un cookie
            setCookie("user_preference", JSON.stringify(selectedOptions), 400); // Cookie valide 30 jours
            alert(`Merci pour vos choix : ${selectedOptions.join(', ')}`);
            document.body.removeChild(popup);
            window.location.reload()

        });
    } else {
        // Si le cookie existe, afficher son contenu dans la console
        console.log("Contenu du cookie user_preference :", JSON.parse(userPreference));
        specialite = JSON.parse(userPreference);
        // Récupérer toutes les associations titre-valeur
        const note = getRelatedTitlesAndValues(uniqueTexts);
        console.log('note récupérées :', note);

        function calculerMoyennePonderee(dict, specialKeys) {
            let somme = 0;
            let totalPondere = 0;
          
            for (let key in dict) {
              // Conversion de la valeur de chaîne en nombre flottant
              let valeur = parseFloat(dict[key].replace(',', '.')); // Remplacer la virgule par un point
              let coefficient = specialKeys.includes(key) ? 2 : 1;
              
              somme += valeur * coefficient;
              totalPondere += coefficient;
            }
          
            return somme / totalPondere;
          }
          
        const moyenne = calculerMoyennePonderee(note, specialite).toFixed(2);
        console.log(moyenne);


        // Sélectionner tous les éléments avec les classes "ie-titre-gros" et "m-left"
        const elements = document.getElementsByClassName("ie-titre-gros m-left");

        // Parcourir tous les éléments et changer leur textContent
        for (let i = 0; i < elements.length; i++) {
            elements[i].textContent = moyenne;
        }


    }

});
