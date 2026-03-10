// Initial Data Structure
const bills = [
    { name: "Rent", amount: 1200, dueDate: 15, isAutoPay: true, isPaid: false },
    { name: "Electric", amount: 150, dueDate: 18, isAutoPay: false, isPaid: false },
    { name: "Internet", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false }
];

// 1. Load data as soon as the script runs
loadFromPhone();

function saveToPhone() {
    localStorage.setItem('wolfBills', JSON.stringify(bills));
}

function loadFromPhone() {
    const saved = localStorage.getItem('wolfBills');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Sync the 'isPaid' status from storage to our active array
        parsed.forEach((savedBill, i) => {
            if(bills[i]) bills[i].isPaid = savedBill.isPaid;
        });
    }
}

function togglePaid(index) {
    bills[index].isPaid = !bills[index].isPaid;
    saveToPhone();
    renderApp();
}

function calculate() {
    const income = document.getElementById('paycheck').value || 0;
    const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
    document.getElementById('remaining').innerText = `Remaining: $${(income - totalBills).toFixed(2)}`;
}

function renderApp() {
    const list = document.getElementById('billList');
    if (!list) return;

    list.innerHTML = ''; // Clear current list

    bills.forEach((bill, index) => {
        const item = document.createElement('div');
        item.className = 'bill-item';
        item.innerHTML = `
            <div style="display: flex; align-items: center;">
                <input type="checkbox" ${bill.isPaid ? 'checked' : ''} onchange="togglePaid(${index})">
                <div style="margin-left: 10px;">
                    <div style="${bill.isPaid ? 'text-decoration: line-through; color: #888;' : ''}">
                        **${bill.name}** - Due: ${bill.dueDate}th
                    </div>
                    <small style="color: ${bill.isAutoPay ? '#4caf50' : '#2196f3'}">
                        ${bill.isAutoPay ? 'AUTO-PAY' : 'MANUAL'}
                    </small>
                </div>
            </div>
            <span>$${bill.amount}</span>
        `;
        list.appendChild(item);
    });

    calculateRemaining();
}

// Initial render
document.addEventListener('DOMContentLoaded', renderApp);
