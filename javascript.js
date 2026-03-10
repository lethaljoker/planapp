let bills = [
    { name: "xfinity-internet", amount: 100, dueDate: 1, isAutoPay: true, isPaid: false },
    { name: "xfinity-Phone", amount: 4.39, dueDate: 25, isAutoPay: true, isPaid: false },
    { name: "direct auto", amount: 47.65, dueDate: 23, isAutoPay: true, isPaid: false },
    { name: "Electric", amount: 590, dueDate: 15, isAutoPay: false, isPaid: false },
    { name: "water bill", amount: 191, dueDate: 15, isAutoPay: false, isPaid: false },
    { name: "water tax", amount: 6, dueDate: 15, isAutoPay: false, isPaid: false },
    { name: "renters insure", amount: 17.75, dueDate: 15, isAutoPay: true, isPaid: false },
    { name: "Tmobile", amount: 188.17, dueDate: 21, isAutoPay: true, isPaid: false },
    { name: "amazon", amount: 14.99, dueDate: 28, isAutoPay: true, isPaid: false },
    { name: "Rent a center", amount: 6.42, dueDate: 0, isAutoPay: false, isPaid: false, everyPaycheck: true },
    { name: "Rent", amount: 575, dueDate: 30, isAutoPay: false, isPaid: false },
    { name: "Ally Card", amount: 170, dueDate: 12, isAutoPay: false, isPaid: false },
    { name: "Avant Card", amount: 80, dueDate: 13, isAutoPay: false, isPaid: false },
    { name: "CapitalOne Card", amount: 100, dueDate: 18, isAutoPay: false, isPaid: false },
    { name: "MissionLane Card", amount: 0, dueDate: 17, isAutoPay: false, isPaid: false },
    { name: "OnePay Card", amount: 50, dueDate: 7, isAutoPay: false, isPaid: false },
    { name: "House Taxes (Spring)", amount: 462.99, dueDate: 1, dueMonth: 4, isAutoPay: false, isPaid: false } 
];

// Calculation for Tax Savings
// Goal: $462.99 by May 1. Paydays: Mar 12, Mar 26, Apr 9, Apr 23 (4 paychecks)
const taxGoal = 462.99;
const paychecksUntilTax = 4;
const taxPerCheck = (taxGoal / paychecksUntilTax).toFixed(2);

function updateAmount(index, newAmount) {
    bills[index].amount = parseFloat(newAmount) || 0;
    saveToPhone();
    renderApp(); // Rerender to update the "Remaining" math
}

function loadFromPhone() {
    const saved = localStorage.getItem('wolfBills');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // If the saved list is empty or completely different, overwrite it with your hardcoded list
            if (parsed.length === 0 || (parsed.length !== bills.length && !localStorage.getItem('forceUpdate'))) {
                saveToPhone();
            } else {
                bills = parsed;
            }
        } catch (e) {
            console.error("Error loading data", e);
            saveToPhone();
        }
    }
}

function renderApp() {
    // 1. Load the data FIRST
    loadFromPhone();
    
    const list = document.getElementById('billList');
    if (!list) return; // Safety check
    list.innerHTML = '';

    // 2. Define the periods
    const periods = [
        { name: "Current Period", start: new Date(2026, 2, 12), end: new Date(2026, 2, 25) },
        { name: "Next Period", start: new Date(2026, 2, 26), end: new Date(2026, 3, 8) }
    ];

    // 3. Render the periods
    periods.forEach(period => {
        const section = document.createElement('div');
        section.innerHTML = `<h3 style="color: #00e5ff; border-bottom: 1px solid #333; padding: 10px 0;">${period.name}</h3>`;
        
        let hasBills = false;

        bills.forEach((bill, index) => {
            const startDay = period.start.getDate();
            const endDay = period.end.getDate();
            const startMonth = period.start.getMonth();
            const endMonth = period.end.getMonth();

            let showBill = false;
            
            if (bill.everyPaycheck) {
                showBill = true;
            } else if (bill.dueMonth !== undefined) {
                if (bill.dueMonth === period.start.getMonth() && bill.dueDate >= startDay) showBill = true;
            } else {
                if (startMonth === endMonth) {
                    if (bill.dueDate >= startDay && bill.dueDate <= endDay) showBill = true;
                } else {
                    if (bill.dueDate >= startDay || bill.dueDate <= endDay) showBill = true;
                }
            }

            if (showBill) {
                hasBills = true;
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
        
        if (hasBills) list.appendChild(section);
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
    const income = parseFloat(document.getElementById('paycheck').value) || 0;
    
    // Calculate bills for the current period (Mar 12 - Mar 25)
    const currentBillsTotal = bills.filter(b => {
        return (b.everyPaycheck || (b.dueDate >= 12 && b.dueDate <= 25)) && b.dueMonth === undefined;
    }).reduce((sum, b) => sum + b.amount, 0);

    // Subtract bills AND the savings goal amount
    const remaining = income - currentBillsTotal - parseFloat(taxPerCheck);
    
    document.getElementById('remaining').innerText = `Safe to Spend: $${remaining.toFixed(2)}`;
    document.getElementById('remaining').style.color = remaining < 0 ? "#ff5252" : "#4caf50";
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
