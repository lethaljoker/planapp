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
    { name: "House Taxes (Spring)", amount: 462.99, dueDate: 1, dueMonth: 4, isAutoPay: false, isPaid: false }
];

let savings = {
    springSaved: 0, 
    fallSaved: 0,
    currentContribution: 115.75 // Changed from currentSpringContribution
};

// Update your saveToPhone to include this
function saveToPhone() {
    localStorage.setItem('wolfBills', JSON.stringify(bills));
    localStorage.setItem('wolfSavings', JSON.stringify(savings));
}

// Update your loadFromPhone
function loadFromPhone() {
    const savedBills = localStorage.getItem('wolfBills');
    const savedSavings = localStorage.getItem('wolfSavings');
    if (savedBills) bills = JSON.parse(savedBills);
    if (savedSavings) savings = JSON.parse(savedSavings);
}

function updateAmount(index, val) {
    bills[index].amount = parseFloat(val) || 0;
    saveToPhone();
    calculate();
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

function getOrdinal(d) {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
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
        section.innerHTML = `<h3 style="color: #00e5ff; border-bottom: 1px solid #333; padding: 10px 0; margin-top:20px;">${period.name}</h3>`;
        
        let periodTotal = 0;

        bills.forEach((bill, index) => {
            let showBill = false;
            const bDay = bill.dueDate;
            
            if (bill.everyPaycheck) {
                showBill = true;
            } else if (bill.dueMonth === undefined) {
                // Monthly logic: handles month rollover (e.g. 26th to 8th)
                if (period.start.getMonth() === period.end.getMonth()) {
                    if (bDay >= period.start.getDate() && bDay <= period.end.getDate()) showBill = true;
                } else {
                    if (bDay >= period.start.getDate() || bDay <= period.end.getDate()) showBill = true;
                }
            }

            if (showBill) {
                periodTotal += bill.amount;
                const item = document.createElement('div');
                item.className = 'bill-item';
                const displayDate = bill.everyPaycheck ? "Every Pay" : `Due: ${bDay}${getOrdinal(bDay)}`;
                
                item.innerHTML = `
                    <div style="flex: 1; display: flex; align-items: center;">
                        <input type="checkbox" ${bill.isPaid ? 'checked' : ''} onchange="togglePaid(${index})">
                        <div style="margin-left: 10px;">
                            <span style="font-weight: bold; ${bill.isPaid ? 'text-decoration: line-through; color: #666;' : ''}">${bill.name}</span>
                            <div style="font-size: 0.8em; color: #aaa;">${displayDate}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <button onclick="toggleAuto(${index})" style="border:none; border-radius:4px; padding:2px 6px; font-size:0.7em; color:white; background:${bill.isAutoPay ? '#4caf50' : '#2196f3'}">
                            ${bill.isAutoPay ? 'AUTO' : 'MANUAL'}
                        </button>
                        <div style="margin-top:5px;">
                            $<input type="number" step="0.01" value="${bill.amount}" onchange="updateAmount(${index}, this.value)" style="width:70px; background:#333; color:white; border:1px solid #444; text-align:right;">
                        </div>
                    </div>
                `;
                section.appendChild(item);
            }
        });
        
        const totalDiv = document.createElement('div');
        totalDiv.style = "text-align: right; padding: 10px; color: #888; font-size: 0.9em;";
        totalDiv.innerHTML = `Period Total: $${periodTotal.toFixed(2)}`;
        section.appendChild(totalDiv);
        list.appendChild(section);
    });
    calculate();
}

function calculate() {
    const income = parseFloat(document.getElementById('paycheck').value) || 0;
    const taxContribution = parseFloat(savings.currentContribution) || 0;
    
    // 1. Get all bills for the Current Period (Mar 12 - Mar 25)
    const currentPeriodBills = bills.filter(b => 
        (b.everyPaycheck || (b.dueDate >= 12 && b.dueDate <= 25)) && b.dueMonth === undefined
    );

    const totalPeriodCost = currentPeriodBills.reduce((sum, b) => sum + b.amount, 0);
    const amountPaid = currentPeriodBills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
    
    // MATH:
    // Safe to Spend = Income - All Bills - Savings Contribution
    const safeToSpend = income - totalPeriodCost - taxContribution;
    
    // Bank Balance = Income - What you've actually CHECKED as paid - Savings Contribution
    const bankBalance = income - amountPaid - taxContribution;
    
    const el = document.getElementById('remaining');
    el.style.display = "flex";
    el.style.flexDirection = "column"; 
    el.style.gap = "10px";

    el.innerHTML = `
        <div style="display: flex; justify-content: space-between; gap: 10px;">
            <div style="flex: 1.2;">
                <div style="font-size: 1.1em; color: ${safeToSpend < 0 ? "#ff5252" : "#4caf50"}; font-weight: bold;">
                    Safe to Spend: $${safeToSpend.toFixed(2)}
                </div>
                <div style="font-size: 1.1em; color: #fff; margin-top: 5px;">
                    Bank Balance: $${bankBalance.toFixed(2)}
                </div>
                <div style="font-size: 0.75em; color: #888; margin-top: 5px;">
                    Total Bills: $${totalPeriodCost.toFixed(2)} | Paid: $${amountPaid.toFixed(2)}
                </div>
            </div>

            <div style="flex: 1; background: #252525; padding: 10px; border-radius: 8px; border-left: 3px solid #ff9800;">
                <div style="font-size: 0.7em; color: #ff9800; font-weight: bold; margin-bottom: 5px;">TAX SAVINGS</div>
                
                <div style="font-size: 0.65em; margin-bottom: 3px;">Spring: $${savings.springSaved.toFixed(2)} / $462.99</div>
                <div style="font-size: 0.65em; margin-bottom: 8px;">Fall: $${savings.fallSaved.toFixed(2)} / $442.99</div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                    <label style="font-size: 0.65em;">This Check:</label>
                    <input type="number" value="${savings.currentContribution}" 
                        onchange="updateTaxContribution(this.value)"
                        style="width: 55px; background: #333; color: #fff; border: 1px solid #555; font-size: 0.75em; text-align: right;">
                </div>

                <button onclick="commitSavings()" style="width: 100%; background: #ff9800; border: none; color: #000; font-size: 0.65em; font-weight: bold; padding: 3px; border-radius: 3px; cursor: pointer;">
                    Confirm & Save
                </button>
            </div>
        </div>
    `;
}

function updateTaxContribution(val) {
    savings.currentContribution = parseFloat(val) || 0;
    saveToPhone();
    calculate();
}

function commitSavings() {
    const choice = prompt("Which fund are you adding this to? Type 'Spring' or 'Fall'").toLowerCase();
    if (choice === 'spring') {
        savings.springSaved += savings.currentContribution;
    } else if (choice === 'fall') {
        savings.fallSaved += savings.currentContribution;
    } else {
        alert("Invalid choice. Type 'Spring' or 'Fall'.");
        return;
    }
    saveToPhone();
    renderApp();
}


document.addEventListener('DOMContentLoaded', renderApp);
