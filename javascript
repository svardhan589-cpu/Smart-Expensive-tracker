// LOGIN SYSTEM
function goToDashboard() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboardPage").classList.remove("hidden");
    localStorage.setItem("isLoggedIn", "true");
}

function logout() {
    localStorage.removeItem("isLoggedIn");
    location.reload();
}

window.onload = function() {
    if (localStorage.getItem("isLoggedIn") === "true") {
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("dashboardPage").classList.remove("hidden");
    }
};

// EXPENSE TRACKER
let records = JSON.parse(localStorage.getItem("records")) || [];
let expenseChart, comparisonChart;

const form = document.getElementById("expenseForm");
const list = document.getElementById("list");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const weeklyExpenseEl = document.getElementById("weeklyExpense");
const monthlyExpenseEl = document.getElementById("monthlyExpense");
const growthEl = document.getElementById("growthPercentage");
const savingsRateEl = document.getElementById("savingsRate");
const startDateEl = document.getElementById("startDate");
const endDateEl = document.getElementById("endDate");
const generateReportBtn = document.getElementById("generateReport");
const customReportResult = document.getElementById("customReportResult");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const type = document.getElementById("type").value;
    const date = document.getElementById("date").value;

    if (amount <= 0 || !category || !type || !date) {
        alert("Enter valid data");
        return;
    }

    records.push({
        amount,
        category,
        type,
        date
    });
    updateUI();
    form.reset();
});

function updateUI() {
    list.innerHTML = "";

    records.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "border p-2 rounded flex justify-between " +
            (item.type === "Income" ? "bg-green-50" : "bg-red-50");

        li.innerHTML = `${item.category} | ₹${item.amount} | ${item.type} | ${item.date}`;

        const btn = document.createElement("button");
        btn.textContent = "Delete";
        btn.className = "text-red-600";

        btn.onclick = () => {
            records.splice(index, 1);
            updateUI();
        };

        li.appendChild(btn);
        list.appendChild(li);
    });

    calculateTotals();
    updateCharts();
    localStorage.setItem("records", JSON.stringify(records));
}

function calculateTotals() {
    const income = records.filter(r => r.type === "Income")
        .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = records.filter(r => r.type === "Expense")
        .reduce((sum, r) => sum + r.amount, 0);

    incomeEl.textContent = income;
    expenseEl.textContent = totalExpense;
    balanceEl.textContent = income - totalExpense;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpense = records.filter(r => {
        const d = new Date(r.date);
        return r.type === "Expense" &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear;
    }).reduce((sum, r) => sum + r.amount, 0);

    monthlyExpenseEl.textContent = monthlyExpense;

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const prevMonthExpense = records.filter(r => {
        const d = new Date(r.date);
        return r.type === "Expense" &&
            d.getMonth() === previousMonth &&
            d.getFullYear() === previousYear;
    }).reduce((sum, r) => sum + r.amount, 0);

    const growth = prevMonthExpense > 0 ?
        ((monthlyExpense - prevMonthExpense) / prevMonthExpense) * 100 : 0;

    growthEl.textContent = growth.toFixed(2) + "%";

    const savingsRate = income > 0 ?
        ((income - totalExpense) / income) * 100 : 0;

    savingsRateEl.textContent = savingsRate.toFixed(2) + "%";

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const weeklyExpense = records.filter(r => {
        const d = new Date(r.date);
        return r.type === "Expense" && d >= startOfWeek && d <= now;
    }).reduce((sum, r) => sum + r.amount, 0);

    weeklyExpenseEl.textContent = weeklyExpense;
}

function updateCharts() {

    const categories = {};
    records.filter(r => r.type === "Expense")
        .forEach(r => {
            categories[r.category] = (categories[r.category] || 0) + r.amount;
        });

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(document.getElementById("expenseChart"), {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories)
            }]
        }
    });

    if (comparisonChart) comparisonChart.destroy();

    comparisonChart = new Chart(document.getElementById("comparisonChart"), {
        type: "bar",
        data: {
            labels: ["Weekly", "Monthly"],
            datasets: [{
                label: "Expense ₹",
                data: [
                    Number(weeklyExpenseEl.textContent),
                    Number(monthlyExpenseEl.textContent)
                ]
            }]
        }
    });
}

generateReportBtn.addEventListener("click", function() {

    if (!startDateEl.value || !endDateEl.value) {
        alert("Select both dates");
        return;
    }

    const start = new Date(startDateEl.value);
    const end = new Date(endDateEl.value);

    const total = records.filter(r => {
        const d = new Date(r.date);
        return d >= start && d <= end;
    }).reduce((sum, r) => sum + r.amount, 0);

    customReportResult.textContent =
        "Total between selected dates: ₹ " + total;
});

updateUI();
