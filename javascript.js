let bills = [
    { name: "xfinity-internet", amount: 100, dueDate: 1, isAutoPay: true, isPaid: false },
    { name: "xfinity-Phone", amount: 4.39, dueDate: 25, isAutoPay: true, isPaid: false },
    { name: "direct auto", amount: 47.65, dueDate: 23, isAutoPay: false, isPaid: false },
    { name: "Electric", amount: 590, dueDate: 15, isAutoPay: false, isPaid: false },
    { name: "water bill", amount: 191, dueDate: 15, isAutoPay: false, isPaid: false },
    { name: "water tax", amount: 6, dueDate: 15, isAutoPay: false, isPaid: false },
    { name: "renters insure", amount: 17.75, dueDate: 15, isAutoPay: false, isPaid: false },
    { name: "Tmobile", amount: 188.17, dueDate: 21, isAutoPay: true, isPaid: false },
    { name: "amazon", amount: 14.99, dueDate: 28, isAutoPay: true, isPaid: false },
    { name: "Rent a center", amount: 6.42, dueDate: 0, isAutoPay: false, isPaid: false, everyPaycheck: true },
    { name: "Rent", amount: 575, dueDate: 30, isAutoPay: false, isPaid: false },
    { name: "Ally Card", amount: 170, dueDate: 12, isAutoPay: false, isPaid: false },
    { name: "Avant Card", amount: 80, dueDate: 13, isAutoPay: false, isPaid: false },
    { name: "CapitalOne Card", amount: 100, dueDate: 18, isAutoPay: false, isPaid: false },
    { name: "MissionLane Card", amount: 0, dueDate: 17, isAutoPay: false, isPaid: false },
    { name: "OnePay Card", amount: 50, dueDate: 7, isAutoPay: false, isPaid: false },
    { name: "House Taxes (Spring)", amount: 462.99, dueDate: 1, dueMonth: 4, isAutoPay: false, isPaid: false }, // May 1st
    { name: "House Taxes (Fall)", amount: 442.99, dueDate: 1, dueMonth: 10, isAutoPay: false, isPaid: false } // Nov 1st
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

    const periods = [
        { name: "Current Period", start: new Date(2026, 2, 12), end: new Date(2026, 2, 25) },
        { name: "Next Period", start: new Date(2026, 2, 26), end: new Date(2026, 3, 8) }
    ];

    periods.forEach(period => {
        const section = document.createElement('div');
        section.innerHTML = `<h3 style="color: #00e5ff; border-bottom: 1px solid #333; padding-bottom: 5px;">${period.name}</h3>`;
        
        bills.forEach((bill, index) => {
            const startDay = period.start.getDate();
            const endDay = period.end.getDate();
            const startMonth = period.start.getMonth();
            const endMonth = period.end.getMonth();

            // Logic to decide if bill shows in this period
            let showBill = false;
            
            if (bill.everyPaycheck) {
                showBill = true; // Always show Rent a Center
            } else if (bill.dueMonth !== undefined) {
                // Seasonal Taxes logic
                if (bill.dueMonth === period.start.getMonth() && bill.dueDate >= startDay) showBill = true;
            } else {
                // Monthly bill logic
                if (bill.dueDate >= startDay && bill.dueDate <= endDay && startMonth === endMonth) showBill = true;
                // Handle split-month periods (e.g., Mar 26 - Apr 8)
                if (startMonth !== endMonth) {
                    if (bill.dueDate >= startDay || bill.dueDate <= endDay) showBill = true;
                }
            }

            if (showBill) {
                const item = document.createElement('div');
                item.className = 'bill-item';
                const displayDate = bill.everyPaycheck ? "Every Pay" : `Due: ${bill.dueDate}${getOrdinal(bill.dueDate)}`;
                
                item.innerHTML = `
                    <div style="flex: 1;">
                        <input type="checkbox" ${bill.isPaid ? 'checked' : ''} onchange="togglePaid(${index})">
                        <span style="font-weight: bold; margin-left: 8px; ${bill.isPaid ? 'text-decoration: line-through; color: #666;' : ''}">${bill.name}</span>
                        <div style="font-size: 0.8em; margin-left: 28px; color: #aaa;">${displayDate}</div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 0.8em; color: ${bill.isAutoPay ? '#4caf50' : '#2196f3'}">${bill.isAutoPay ? 'AUTO' : 'MANUAL'}</span>
                        <div style="font-weight: bold;">$${bill.amount}</div>
                    </div>
                `;
                section.appendChild(item);
            }
        });
        list.appendChild(section);
    });
    calculate();
}

// Helper for "1st, 2nd, 3rd" formatting
function getOrdinal(d) {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

function calculate() {
    const income = document.getElementById('paycheck').value || 0;
    // Calculation logic for Current period only
    const currentTotal = bills.filter(b => b.dueDate >= 12 && b.dueDate <= 25).reduce((s, b) => s + b.amount, 0);
    document.getElementById('remaining').innerText = `Remaining (Current): $${(income - currentTotal).toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', renderApp);

function addNewBill() {
    const name = prompt("Bill Name:");
    const amount = parseFloat(prompt("Amount:"));
    const date = parseInt(prompt("Due Date (Day of month):"));
    
    if (name && amount && date) {
        bills.push({
            name: name,
            amount: amount,
            dueDate: date,
            isAutoPay: false,
            isPaid: false
        });
        saveToPhone();
        renderApp();
    }
}
