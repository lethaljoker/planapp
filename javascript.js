let bills = [
    { name: "Rent", amount: 1200, dueDate: 15, isAutoPay: true, isPaid: false },
    { name: "Electric", amount: 150, dueDate: 18, isAutoPay: false, isPaid: false },
    { name: "Xfinity-Internet", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Xfinity-Phone", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Direct Auto", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Water", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Water-Taxes", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Renters Insure", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Phone-Tmobile", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Amazon-Prime", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Rent A Center", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Ally Card", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "Avant Card", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "CapitalOne Card", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "MissionLane Card", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false },
    { name: "OnePay Card", amount: 80, dueDate: 22, isAutoPay: true, isPaid: false }
];

const startPayday = new Date(2026, 2, 12); // March 12, 2026

function loadFromPhone() {
    const saved = localStorage.getItem('wolfBills');
    if (saved) {
        const parsed = JSON.parse(saved);
        // If the number of bills in the code is different than saved, 
        // we keep the new bills but keep the 'paid' status of the old ones.
        if (parsed.length !== bills.length) {
            console.log("New bills detected, updating storage...");
            saveToPhone(); // Overwrite old memory with your new full list
        } else {
            bills = parsed;
        }
    }
}

function saveToPhone() {
    localStorage.setItem('wolfBills', JSON.stringify(bills));
}

// UI Update Functions
function updateAmount(index, val) {
    bills[index].amount = parseFloat(val) || 0;
    saveToPhone();
    renderApp();
}

function toggleAuto(index) {
    bills[index].isAutoPay = !bills[index].isAutoPay;
    saveToPhone();
    renderApp();
}

function togglePaid(index) {
    bills[index].isPaid = !bills[index].isPaid;
    saveToPhone();
    renderApp();
}

function renderApp() {
    loadFromPhone();
    const list = document.getElementById('billList');
    list.innerHTML = '';

    // Logic for 2 periods
    const periods = [
        { name: "Current Period", start: new Date(startPayday), end: new Date(startPayday.getTime() + 13 * 24 * 60 * 60 * 1000) },
        { name: "Next Period", start: new Date(startPayday.getTime() + 14 * 24 * 60 * 60 * 1000), end: new Date(startPayday.getTime() + 27 * 24 * 60 * 60 * 1000) }
    ];

    periods.forEach(period => {
        const section = document.createElement('div');
        section.innerHTML = `<h3 style="color: #aaa; margin-top: 20px;">${period.name} (${period.start.getMonth()+1}/${period.start.getDate()} - ${period.end.getMonth()+1}/${period.end.getDate()})</h3>`;
        
        let periodTotal = 0;

        bills.forEach((bill, index) => {
            // Check if bill due date falls in this 14-day window (simplified for 1 month view)
            const billDate = bill.dueDate;
            const startDay = period.start.getDate();
            const endDay = period.end.getDate();

            // Check if bill falls in this window (Assumes bills are monthly)
            if (billDate >= startDay && billDate <= endDay) {
                periodTotal += bill.amount;
                const item = document.createElement('div');
                item.className = 'bill-item';
                item.innerHTML = `
                    <div style="display: flex; align-items: center; flex: 1;">
                        <input type="checkbox" ${bill.isPaid ? 'checked' : ''} onchange="togglePaid(${index})">
                        <div style="margin-left: 10px;">
                            <div style="${bill.isPaid ? 'text-decoration: line-through; color: #888;' : ''}">
                                **${bill.name}**
                            </div>
                            <button onclick="toggleAuto(${index})" class="tag ${bill.isAutoPay ? 'auto' : 'manual'}" style="border:none; cursor:pointer;">
                                ${bill.isAutoPay ? 'AUTO-PAY' : 'MANUAL'}
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        $<input type="number" value="${bill.amount}" onchange="updateAmount(${index}, this.value)" 
                            style="width: 70px; background: #333; color: white; border: 1px solid #444; border-radius: 4px; padding: 5px; margin-left: 10px;">
                    </div>
                `;
                section.appendChild(item);
            }
        });

        list.appendChild(section);
    });

    calculate();
}

function calculate() {
    const income = document.getElementById('paycheck').value || 0;
    // Calculation logic for Current period only
    const currentTotal = bills.filter(b => b.dueDate >= 12 && b.dueDate <= 25).reduce((s, b) => s + b.amount, 0);
    document.getElementById('remaining').innerText = `Remaining (Current): $${(income - currentTotal).toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', renderApp);
