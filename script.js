'use strict';
const tabs = document.querySelectorAll('[data-id]');
const contents = document.querySelectorAll('[data-content]');
let id = 0;

tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        tabs[id].classList.remove('active');
        tab.classList.add('active');
        id = tab.getAttribute('data-id');
        contents.forEach(function (box) {
            box.classList.add('hide');
            if (box.getAttribute('data-content') == id){
                box.classList.remove('hide');
                box.classList.add('show');
            }
        });
    });
});


// Función para procesar y cargar datos desde un archivo Excel
function processData() {
    const fileInput = document.getElementById('input-excel');
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo de Excel.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Obtener valores máximos introducidos por el usuario
        const so2Max = parseFloat(document.getElementById('so2Max').value);
        const seismicMax = parseFloat(document.getElementById('seismicMax').value);
        const heightMax = parseFloat(document.getElementById('heightMax').value);

        if (isNaN(so2Max) || isNaN(seismicMax) || isNaN(heightMax)) {
            alert("Por favor, ingresa todos los valores máximos.");
            return;
        }

        const results = json.map(row => {
            const so2 = row['SO2'];
            const seismic = row['Actividad Sísmica'];
            const height = row['Altura Máxima'];
            const index = 0.3 * (so2 / so2Max) + 0.4 * (seismic / seismicMax) + 0.3 * (height / heightMax);
            let evaluation = '';
            if (index < 0.4) {
                evaluation = 'Inactivo';
            } else if (index < 0.6) {
                evaluation = 'Incremento de actividad sísmica';
            } else if (index < 0.8) {
                evaluation = 'Aumento de actividad eruptiva';
            } else {
                evaluation = 'Erupción inminente';
            }
            return {
                ...row,
                'Índice Compuesto': index.toFixed(2),
                'Índice de Evaluación': evaluation
            };
        });

        displayResults(results);
    };

    reader.readAsArrayBuffer(file);
}

// Función para mostrar los resultados en la tabla
function displayResults(data) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    generateChart(data);
}

// Función para generar el gráfico
function generateChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = data.map(row => `${row['Día']}/${row['Mes']}/${row['Año']}`);
    const so2Data = data.map(row => row['SO2']);
    const seismicData = data.map(row => row['Actividad Sísmica']);
    const heightData = data.map(row => row['Altura Máxima']);
    const indexData = data.map(row => row['Índice Compuesto']);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'SO2',
                    data: so2Data,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false
                },
                {
                    label: 'Actividad Sísmica',
                    data: seismicData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false
                },
                {
                    label: 'Altura Máxima',
                    data: heightData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false
                },
                {
                    label: 'Índice Compuesto',
                    data: indexData,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Valores'
                    }
                }
            }
        }
    });
}

// Función para generar el PDF
function generatePDF() {
    const element = document.getElementById('result');
    html2pdf().from(element).save('informe_volcanes.pdf');
}

// Función para analizar datos con IA (simulación)
function analyzeData() {
    const input = document.getElementById('ai-input').value;
    const responseDiv = document.getElementById('ai-response');

    // Simulación de respuesta de IA
    responseDiv.textContent = `Resultado del análisis: ${input}`;
}

