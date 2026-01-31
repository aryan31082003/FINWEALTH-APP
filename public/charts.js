const API_URL = 'http://localhost:5000/api/records';
const token = localStorage.getItem('token');

async function loadCharts() {
    const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const records = await res.json();

    const incomeData = records
        .filter(r => r.status === 'Income')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const expenseData = records
        .filter(r => r.status === 'Expense')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    renderIncomeChart(incomeData);
    renderExpenseChart(expenseData);
}

function renderIncomeChart(data) {
    new Chart(document.getElementById('incomeChart'), {
        type: 'line',
        data: {
            labels: data.map(r => new Date(r.date).toLocaleDateString()),
            datasets: [{
                label: 'Salary',
                data: data.map(r => r.amount),
                borderWidth: 3,
                tension: 0.4
            }]
        }
    });
}

function renderExpenseChart(data) {
    new Chart(document.getElementById('expenseChart'), {
        type: 'line',
        data: {
            labels: data.map(r => new Date(r.date).toLocaleDateString()),
            datasets: [{
                label: 'Expense',
                data: data.map(r => r.amount),
                borderWidth: 3,
                tension: 0.4
            }]
        }
    });
}

loadCharts();
