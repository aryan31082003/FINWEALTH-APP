const API_URL = 'http://localhost:5000/api/records';

const token = localStorage.getItem('token');

// Check if user is logged in on page load
window.onload = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Session expired or unauthorized. Redirecting to login...");
        window.location.href = 'index.html';
        return;
    }
    fetchRecords();
    const loadUserProfile = async () => {
        const res = await fetch('http://localhost:5000/api/user/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const user = await res.json();
        document.getElementById('display-username').innerText = user.username;

        if (user.profilePic) {
            profileImg.src = user.profilePic;
        }
        document.getElementById('total-salary').innerText = `$${user.totalIncome}`;
        document.getElementById('total-expense').innerText = `$${user.totalExpense}`;

    };

    loadUserProfile();

};

if (!token && !window.location.href.includes('index.html')) {
    window.location.href = 'index.html';
}

document.getElementById('display-username').innerText = localStorage.getItem('username');

async function fetchRecords() {
    const search = document.getElementById('search').value;
    const sortBy = document.getElementById('sortBy').value;

    const res = await fetch(`${API_URL}?search=${search}&sortBy=${sortBy}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    renderTable(data);
}

function renderTable(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = data.map(record => `
        <tr>
            <td>${record.category}</td>
            <td class="${record.status.toLowerCase()}">$${record.amount}</td>
            <td>${record.status}</td>
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td><button onclick="deleteRecord(
                '${record._id}',
                 ${record.amount},
                '${record.status}')">
                Delete
                </button>
            </td>
        </tr>
    `).join('');
}

async function addRecord() {
    const record = {
        category: document.getElementById('category').value,
        amount: Number(document.getElementById('amount').value),
        status: document.getElementById('status').value,
        date: document.getElementById('date').value
    };

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(record)
    });

    const data = await res.json();

    // Update totals in DB
    let totalIncome = Number(document.getElementById('total-salary').innerText.replace('$', ''));
    let totalExpense = Number(document.getElementById('total-expense').innerText.replace('$', ''));

    if (record.status === 'Income') totalIncome += record.amount;
    else totalExpense += record.amount;

    await fetch('http://localhost:5000/api/user/totals', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ totalIncome, totalExpense })
    });

    fetchRecords();       // refresh table
    document.getElementById('total-salary').innerText = `$${totalIncome}`;
    document.getElementById('total-expense').innerText = `$${totalExpense}`;
}

async function deleteRecord(id, amount, status) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
        alert("Failed to delete record");
        return;
    }

    let totalIncome = Number(
        document.getElementById('total-salary').innerText.replace('$', '')
    );
    let totalExpense = Number(
        document.getElementById('total-expense').innerText.replace('$', '')
    );

    if (status === 'Income') {
        totalIncome = Math.max(0, totalIncome - amount);
    } else {
        totalExpense = Math.max(0, totalExpense - amount);  
    }


    // Save updated totals
    await fetch('http://localhost:5000/api/user/totals', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ totalIncome, totalExpense })
    });

    document.getElementById('total-salary').innerText = `$${totalIncome}`;
    document.getElementById('total-expense').innerText = `$${totalExpense}`;

    fetchRecords();
}


const imgInput = document.getElementById('img-input');
const profileImg = document.getElementById('profile-img');

if (imgInput) {
    imgInput.addEventListener('change', async () => {
        const file = imgInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        const res = await fetch('http://localhost:5000/api/user/profile-pic', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();
        profileImg.src = data.profilePic;
    });
}

function openCharts() {
    window.open('charts.html', '_blank');
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}