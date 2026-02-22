let hasFileBeenSelected = false;
// Kell, hogy biztosan akkor fusson a javascript, ha már betöltött a html
window.addEventListener('DOMContentLoaded', () => {

    const importButton = document.getElementById('gomb_import');
    const importDialog = document.getElementById('dialog_import');
    const closeImportButton = document.getElementById('import_gomb_megse');
    const fileInputButton = document.getElementById('import_gomb_fajlvalasztas');
    const loadButton = document.getElementById('import_gomb_betoltes');
    const addButton = document.getElementById('gomb_hozzaad');
    const karValasztGomb = document.getElementById('import_gomb_iskolavalasztas');
    const karSnackBar = document.getElementById('karsnackbar');
    const oDijInfo = document.getElementById('odijinfo');

    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = '.xlsx, .xls';
    let jsonData = null;


    importButton.addEventListener('click', async () => {
        await importDialog.show();
    });

    closeImportButton.addEventListener('click', async () => {
        await importDialog.close();
        fileInputButton.innerHTML = "Fájl kiválasztása";
        karValasztGomb.innerHTML = "Kar kiválasztása";
        karSnackBar.style.visibility = 'hidden';
        oDijInfo.style.display = 'none';
    });


    inputFile.onchange = async e => {
        let fajl = e.target.files[0];

        fileInputButton.innerHTML = fajl.name;

        const reader = new FileReader();

        // Neptun excel-fájl importálása és feldolgozása json objektummá
        reader.onload = function (event) {
            const data = new Uint8Array(event.target.result);

            const worksheets = XLSX.read(data, { type: 'array' });

            const firstSheetName = worksheets.SheetNames[0];
            const worksheet = worksheets.Sheets[firstSheetName];

            jsonData = XLSX.utils.sheet_to_json(worksheet);

            karSnackBar.style.visibility = 'hidden';
            hasFileBeenSelected = true;

        };

        reader.readAsArrayBuffer(fajl, 'UTF-8')
    }
    loadButton.addEventListener('click', () => {
        //Csak akkor tölti be a táblázatot, ha kar és fájl is ki lett választva
        if (hasKarBeenSelected && hasFileBeenSelected) {
            karSnackBar.style.visibility = 'hidden';
            oDijInfo.style.display = 'none';
            loadTableDataMaterial(jsonData);
            importDialog.close();
            fileInputButton.innerHTML = "Fájl kiválasztása";
            karValasztGomb.innerHTML = "Kar kiválasztása";

            window.calcAverages();
            if (_odijJsonData !== null) {
                window.calcPayment(_odijJsonData, kreditIndex);
            }

            hasKarBeenSelected = false;
            hasFileBeenSelected = false;
            jsonData = null;
        }
        else {
            karSnackBar.style.visibility = 'visible';
        }

    });

    function loadTableDataMaterial(data) {
        const dataTable = document.getElementById('tantargytablazat');
        dataTable.innerHTML = "";

        data.forEach(row => {
            const tr = document.createElement('tr');

            const subjectNameTd = document.createElement('td');
            const subjectNameInputField = document.createElement('md-outlined-text-field');
            subjectNameInputField.value = row['Tárgynév'];
            subjectNameInputField.style.width = "100%";
            subjectNameTd.appendChild(subjectNameInputField);
            subjectNameTd.style.paddingLeft = "20px";

            const creditTd = document.createElement('td');
            const creditInputField = document.createElement('md-outlined-text-field');
            creditInputField.value = row['Kredit'];
            creditInputField.style.width = "45px";
            creditInputField.classList.add("kredinput");
            creditTd.appendChild(creditInputField);
            creditTd.style.width = "132px";
            creditTd.style.textAlign = "center";

            const gradeTd = document.createElement('td');
            const gradeInputField = document.createElement('md-outlined-text-field');
            switch (row['Teljesítés, érdemjegy']) {
                case 'Jeles':
                case 'Kiválóan megfelelt':
                    gradeInputField.value = 5;
                    break;
                case 'Jó':
                case 'Jól megfelelt':
                    gradeInputField.value = 4;
                    break;
                case 'Közepes':
                case 'Megfelelt':
                    gradeInputField.value = 3;
                    break;
                case 'Elégséges':
                case 'Gyengén felelt meg':
                    gradeInputField.value = 2;
                    break;
                case 'Elégtelen':
                case 'Nem felelt meg': //Ezek a szöveges értékelések nem biztos, hogy kellenek
                    gradeInputField.value = 1;
                    break;
                default:
                    gradeInputField.value = 1;
                    break;
            }
            gradeInputField.style.width = "45px";
            gradeInputField.classList.add("jegyinput");
            gradeTd.appendChild(gradeInputField);
            gradeTd.style.width = "133px";
            gradeTd.style.textAlign = "center";

            const deleteTd = document.createElement('td');
            const deleteButton = document.createElement('md-icon-button');
            const deleteButtonIcon = document.createElement('md-icon');
            deleteButtonIcon.innerHTML = 'delete';
            deleteButton.appendChild(deleteButtonIcon);
            deleteButton.onclick = () => deleteTableRow(tr);
            deleteTd.appendChild(deleteButton);
            deleteTd.style.width = "50px";

            tr.appendChild(subjectNameTd);
            tr.appendChild(creditTd);
            tr.appendChild(gradeTd);
            tr.appendChild(deleteTd);

            dataTable.appendChild(tr);
        });

    }

    fileInputButton.addEventListener('click', async () => {
        await inputFile.click();
    });

    addButton.addEventListener('click', () => {
        const dataTable = document.getElementById('tantargytablazat');

        const tr = dataTable.insertRow(0);

        const subjectNameTd = tr.insertCell(0);
        const subjectNameInputField = document.createElement('md-outlined-text-field');
        subjectNameInputField.style.width = "100%";
        subjectNameTd.appendChild(subjectNameInputField);
        subjectNameTd.style.paddingLeft = "20px";

        const creditTd = tr.insertCell(1);
        const creditInputField = document.createElement('md-outlined-text-field');
        creditInputField.style.width = "45px";
        creditInputField.classList.add("kredinput");
        creditTd.appendChild(creditInputField);
        creditTd.style.width = "132px";
        creditTd.style.textAlign = "center";

        const gradeTd = tr.insertCell(2);
        const gradeInputField = document.createElement('md-outlined-text-field');
        gradeInputField.style.width = "45px";
        gradeInputField.classList.add("jegyinput");
        gradeTd.appendChild(gradeInputField);
        gradeTd.style.width = "133px";
        gradeTd.style.textAlign = "center";

        const deleteTd = tr.insertCell(3);
        const deleteButton = document.createElement('md-icon-button');
        const deleteButtonIcon = document.createElement('md-icon');
        deleteButtonIcon.innerHTML = 'delete';
        deleteButton.appendChild(deleteButtonIcon);
        deleteButton.onclick = () => deleteTableRow(tr);
        deleteTd.appendChild(deleteButton);
        deleteTd.style.width = "50px";
    });

    function deleteTableRow(tr) {
        tr.remove();
        window.calcAverages();
        if (_odijJsonData !== null) {
            window.calcPayment(_odijJsonData, kreditIndex);
        }
    }

})

