let currentProfessional = document.getElementById('professional').value;
let patients = JSON.parse(localStorage.getItem(currentProfessional)) || [];

// Inicializamos arrays vacíos para gastos y retiros
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let withdrawals = JSON.parse(localStorage.getItem('withdrawals')) || [];

document.getElementById('professional').addEventListener('change', function() {
    currentProfessional = this.value;
    patients = JSON.parse(localStorage.getItem(currentProfessional)) || [];
    renderPatients();
});

// Agregar Paciente
document.getElementById('addPatient').addEventListener('click', function() {
    const name = document.getElementById('patientName').value;
    const operation = document.getElementById('operationType').value;
    const value = document.getElementById('operationValue').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const commission = document.getElementById('commission').value;

    if (name && operation && value && paymentMethod && commission) {
        const patient = {
            name, operation, value: parseFloat(value), paymentMethod, commission: parseFloat(commission)
        };
        patients.push(patient);
        localStorage.setItem(currentProfessional, JSON.stringify(patients));
        renderPatients();
    } else {
        alert('Por favor complete todos los campos.');
    }
});

// Borrar Paciente
document.getElementById('deletePatient').addEventListener('click', function() {
    const patientName = prompt('Ingrese el nombre del paciente a borrar:');
    patients = patients.filter(patient => patient.name !== patientName);
    localStorage.setItem(currentProfessional, JSON.stringify(patients));
    renderPatients();
});

// Mostrar Pacientes en la Tabla
function renderPatients() {
    const tbody = document.getElementById('patientTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Limpiar tabla
    patients.forEach(patient => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = patient.name;
        row.insertCell(1).textContent = patient.operation;
        row.insertCell(2).textContent = patient.value;
        row.insertCell(3).textContent = patient.paymentMethod;
        row.insertCell(4).textContent = patient.commission;
    });
}

// Función para guardar gasto
document.getElementById('add-expense').addEventListener('click', function() {
    const expenseInput = document.getElementById('expense').value;
    if (expenseInput.includes(',')) {
        const [description, amount] = expenseInput.split(',').map(item => item.trim());
        if (description && !isNaN(amount)) {
            expenses.push({ description, amount: parseFloat(amount) });
            localStorage.setItem('expenses', JSON.stringify(expenses));
            alert('Gasto guardado correctamente.');
            document.getElementById('expense').value = ''; // Limpiar input
        } else {
            alert('Por favor, ingresa un gasto válido con formato "nombre, valor".');
        }
    } else {
        alert('Por favor, ingresa el gasto en formato "nombre, valor".');
    }
});

// Función para guardar retiro
document.getElementById('add-withdrawal').addEventListener('click', function() {
    const withdrawalInput = document.getElementById('withdrawal').value;
    if (!isNaN(withdrawalInput) && withdrawalInput !== '') {
        withdrawals.push(parseFloat(withdrawalInput));
        localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
        alert('Retiro guardado correctamente.');
        document.getElementById('withdrawal').value = ''; // Limpiar input
    } else {
        alert('Por favor, ingresa un valor numérico para el retiro.');
    }
});

// Función para ver los gastos y retiros
document.getElementById('view-expenses-withdrawals').addEventListener('click', function() {
    let totalWithdrawals = withdrawals.reduce((acc, withdrawal) => acc + withdrawal, 0);
    let expensesList = expenses.map(expense => `${expense.description}: $${expense.amount}`).join('\n');
    
    if (expensesList === '') {
        expensesList = 'No hay gastos registrados.';
    }

    alert(
        `Gastos:\n${expensesList}\n\n` +
        `Total de retiros: $${totalWithdrawals}`
    );
});

// Sumar valores de pacientes
document.getElementById('sumValues').addEventListener('click', function() {
    const totals = { efectivo: 0, debito: 0, comisiones: {} };

    patients.forEach(patient => {
        if (patient.paymentMethod === 'efectivo') {
            totals.efectivo += patient.value;
        } else if (patient.paymentMethod === 'debito') {
            totals.debito += patient.value;
        }

        if (!totals.comisiones[currentProfessional]) {
            totals.comisiones[currentProfessional] = 0;
        }
        totals.comisiones[currentProfessional] += patient.commission;
    });

    let comisionesPorProfesional = '';
    for (const profesional in totals.comisiones) {
        comisionesPorProfesional += `${profesional}: $${totals.comisiones[profesional]}\n`;
    }

    alert(
        `Efectivo Total: $${totals.efectivo}\n` +
        `Débito Total: $${totals.debito}\n\n` +
        `Comisiones por profesional:\n${comisionesPorProfesional}`
    );
});

// Función para el Cierre de Caja
document.getElementById('cierreDeCaja').addEventListener('click', function() {
    const cierreFecha = document.getElementById('cierreFecha').value;
    const professionals = ['Dra. Rocio', 'Dra. Xiomara', 'Dra. Leila', 'Dra. Florencia', 'Dr. Marcelo', 'Dra. Yohary'];

    // Obtener pacientes de la Dra. seleccionada
    const professionalPatients = JSON.parse(localStorage.getItem(currentProfessional)) || [];

    // Calcular totales de la Dra. seleccionada
    const totalEfectivo = professionalPatients.reduce((acc, patient) => patient.paymentMethod === 'efectivo' ? acc + patient.value : acc, 0);
    const totalDebito = professionalPatients.reduce((acc, patient) => patient.paymentMethod === 'debito' ? acc + patient.value : acc, 0);
    const totalComisiones = professionalPatients.reduce((acc, patient) => acc + patient.commission, 0);

    // Calcular totales globales
    let totalEfectivoGlobal = 0;
    let totalDebitoGlobal = 0;
    let totalComisionesGlobales = 0;

    professionals.forEach(professional => {
        const professionalPatients = JSON.parse(localStorage.getItem(professional)) || [];
        
        const totalEfectivo = professionalPatients.reduce((acc, patient) => patient.paymentMethod === 'efectivo' ? acc + patient.value : acc, 0);
        const totalDebito = professionalPatients.reduce((acc, patient) => patient.paymentMethod === 'debito' ? acc + patient.value : acc, 0);

        // Sumar al total global
        totalEfectivoGlobal += totalEfectivo;
        totalDebitoGlobal += totalDebito;
        totalComisionesGlobales += professionalPatients.reduce((acc, patient) => acc + patient.commission, 0);
    });

    // Total de gastos y retiros globales
    const totalGastos = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const totalRetiros = withdrawals.reduce((acc, withdrawal) => acc + withdrawal, 0);

    // Calcular el total global
    const totalGlobal = totalEfectivoGlobal - totalComisionesGlobales - totalGastos - totalRetiros;

    // Crear la nueva ventana con todos los datos
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
        <head>
            <title>Cierre de Caja ${cierreFecha}</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #ffffff; color: #000000; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid black; padding: 5px; text-align: left; }
                th { background-color: #ffffff; color: #000000; }
                h1, h2, h3 { color: #000000; margin: 0; padding: 5px 0; }
                .summary-table { margin-top: 10px; }
                .summary-table th, .summary-table td { border: 1px solid black; padding: 5px; text-align: left; }
                .summary-table th { background-color: #ffffff; color: #000000; }
                .horizontal-table { border-collapse: collapse; margin-top: 10px; }
                .horizontal-table td, .horizontal-table th { border: 1px solid black; padding: 5px; text-align: center; }
                .horizontal-table th { background-color: #ffffff; color: #000000; }
                .horizontal-table td { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>Cierre de Caja ${cierreFecha}</h1>

            <h2>Resumen de ${currentProfessional}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Operación</th>
                        <th>Valor</th>
                        <th>Forma de Pago</th>
                        <th>Comisión</th>
                    </tr>
                </thead>
                <tbody>
                    ${professionalPatients.map(patient => `
                        <tr>
                            <td>${patient.name}</td>
                            <td>${patient.operation}</td>
                            <td>${patient.value}</td>
                            <td>${patient.paymentMethod}</td>
                            <td>${patient.commission}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h2>Totales de ${currentProfessional}</h2>
            <table class="horizontal-table">
                <tr>
                    <th>Total en Efectivo</th>
                    <th>Total en Débito</th>
                    <th>Total de Comisiones</th>
                </tr>
                <tr>
                    <td>$${totalEfectivo}</td>
                    <td>$${totalDebito}</td>
                    <td>$${totalComisiones}</td>
                </tr>
            </table>

            <h2>Totales Globales</h2>
            <table class="summary-table">
                <tr>
                    <th>Total en Efectivo (Todos los Profesionales):</th>
                    <td>$${totalEfectivoGlobal}</td>
                </tr>
                <tr>
                    <th>Total en Débito (Todos los Profesionales):</th>
                    <td>$${totalDebitoGlobal}</td>
                </tr>
                <tr>
                    <th>Total de Gastos:</th>
                    <td>$${totalGastos}</td>
                </tr>
                <tr>
                    <th>Total de Retiros:</th>
                    <td>$${totalRetiros}</td>
                </tr>
                <tr>
                    <th>Total de Comisiones de Profesionales:</th>
                    <td>$${totalComisionesGlobales}</td>
                </tr>
                <tr>
                    <th>Total:</th>
                    <td>$${totalGlobal}</td>
                </tr>
            </table>
        </body>
        </html>
    `);
});
