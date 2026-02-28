//Ezeket a változókat az import.js is használja
let hasKarBeenSelected = false;
let kreditIndex = 0;
let _odijJsonData = null;
window.addEventListener('DOMContentLoaded', () => {
     const kreditErrorSnackBar = document.getElementById('kreditsnackbar');
     const jegyErrorSnackBar = document.getElementById('jegysnackbar');
     const dataTable = document.getElementById('tantargytablazat');
     const foKredit = document.getElementById('fokredit');
     const perKredit = document.getElementById('perkredit');
     const kreditProgress = document.getElementById('kreditprogress');
     const kIndex = document.getElementById('kindex');
     const sAtlag = document.getElementById('satlag');
     const korrKIndex = document.getElementById('kokindex');
     const karValasztGomb = document.getElementById('import_gomb_iskolavalasztas');
     const karValasztMenu = document.getElementById('karvalasztas_menu');
     const karSnackBar = document.getElementById('karsnackbar');
     const oDij = document.getElementById('odij');
     const oDijInfo = document.getElementById('odijinfo');
     const koszontGomb = document.getElementById('koszonto_gomb');
     const koszontDialog = document.getElementById('dialog_koszonto');

     let hasDataBeenImported = false; //Jelenleg csak egy json-fájlra van kitalálva

     document.addEventListener('input', (event) => {
          const currentElement = event.target;
          const elmValue = currentElement.value;

          let validInput = false;

          //Kredit és jegy bemenet ellenőrzés
          if (currentElement.className == "jegyinput" && currentElement.value) {

               if (elmValue <= 5 && elmValue >= 1) {
                    jegyErrorSnackBar.style.visibility = 'hidden';
                    validInput = true;
               }
               else {
                    jegyErrorSnackBar.style.visibility = 'visible';
                    validInput = false;
               }

          }
          else if (currentElement.className == "kredinput" && currentElement.value) {

               if (elmValue > 0) {
                    kreditErrorSnackBar.style.visibility = 'hidden';
                    validInput = true;
               }
               else {
                    kreditErrorSnackBar.style.visibility = 'visible';
                    validInput = false;
               }
          }

          if (validInput) {
               calcAverages();
               calcPayment(_odijJsonData, kreditIndex);
          }
     });

     karValasztGomb.addEventListener('click', () => {
          karValasztMenu.open = !karValasztMenu.open;
     });

     karValasztMenu.addEventListener('close-menu', (event) => {
          const selectItem = event.target;
          knev = selectItem.getAttribute('data-value');
          switch (knev) {
               case 'elteik':
                    karValasztGomb.innerHTML = "ELTE IK";
                    hasKarBeenSelected = true;
                    oDijInfo.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4a4751"><path d="M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
                    oDijInfo.innerHTML += "A jelenlegi legfrissebb ösztöndíj információk: 2025/26/2 félév.";
                    oDijInfo.style.display = 'flex';
                    karSnackBar.style.visibility = 'hidden';
                    if (!hasDataBeenImported) {
                         importJson(knev);
                    }
                    break;
               default:
                    karValasztGomb.innerHTML = "Kar kiválasztása";
                    break;
          }
     });

     async function importJson(karnev) {
          const oszDijak = await fetch(`src/${karnev}.json`);
          const odJson = await oszDijak.json();

          _odijJsonData = odJson;
          hasDataBeenImported = true;
     }

     function calcAverages() {
          const tableRows = dataTable.rows.length;
          let osszKredit = 0;
          let aktKredit = 0;
          let kIndexSzamlalo = 0;

          //A tantárgy táblázatból szedi ki az adatokat
          for (let index = 0; index < tableRows; index++) {
               let row = dataTable.rows[index];

               osszKredit += parseInt(row.cells[1].childNodes[0].value);

               if (row.cells[2].childNodes[0].value && row.cells[2].childNodes[0].value != "1") {
                    aktKredit += parseInt(row.cells[1].childNodes[0].value);
               }

               kIndexSzamlalo += parseInt(row.cells[1].childNodes[0].value) * parseInt(row.cells[2].childNodes[0].value);
          }

          foKredit.innerHTML = aktKredit;
          perKredit.innerHTML = `/${osszKredit} kredit`;
          kreditProgress.value = aktKredit / osszKredit;

          kreditIndex = (kIndexSzamlalo / 30).toFixed(2);
          kIndex.innerHTML = `Kreditindex: ${kreditIndex}`;

          sAtlag.innerHTML = `Súlyozott átlag: ${(kIndexSzamlalo / osszKredit).toFixed(2)}`;

          korrKIndex.innerHTML = `Korrigált kreditindex: ${(kIndexSzamlalo / 30 * (aktKredit / osszKredit)).toFixed(2)}`;
     }

     window.calcAverages = calcAverages; //Így látja a függvényt a másik fájl

     function calcPayment(odijJsonData, kindex) {

          //Ezt is ilyen formában csak ezzel az ösztöndíj fájlal működik
          if (kindex >= 4.13) {
               let oszdij = null;

               odijJsonData.forEach(row => {
                    if (row['kreditindex'] == parseFloat(kindex).toLocaleString("hu")) {
                         oszdij = row['ösztöndíj'];
                    }

               });

               oDij.innerHTML = `Ösztöndíj: ${oszdij}`;
          }
          else {
               oDij.innerHTML = "Ösztöndíj: Túl alacsony kreditindex";
          }

     }

     window.calcPayment = calcPayment;

     koszontGomb.addEventListener('click', async () => {
          await koszontDialog.close();
     });
});

