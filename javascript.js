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

function saveToPhone() {
    localStorage.setItem('wolfBills', JSON.stringify(bills));
}

function loadFromPhone() {
    const saved = localStorage.getItem('wolfBills');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length === bills.length) {
            bills = parsed;
        }
    }
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
    const taxSavings = (462.99 / 4); // Saving for May taxes
    
    // Calculate current period total (Mar 12 - Mar 25)
    const currentTotal = bills.filter(b => (b.everyPaycheck || (b.dueDate >= 12 && b.dueDate <= 25)) && b.dueMonth === undefined)
                              .reduce((s, b) => s + b.amount, 0);

    const safeToSpend = income - currentTotal - taxSavings;
    const el = document.getElementById('remaining');
    el.innerText = `Safe to Spend: $${safeToSpend.toFixed(2)}`;
    el.style.color = safeToSpend < 0 ? "#ff5252" : "#4caf50";
}

document.addEventListener('DOMContentLoaded', renderApp);
