document.addEventListener('DOMContentLoaded', function () {
    const API_URL = 'http://localhost:3000/api';
    const user = JSON.parse(localStorage.getItem('user')) || {};
    let incomeBarChart, assetPieChart, expenseBarChart, liabilityPieChart;
    let showingAssetTable = false;
    let showingLiabilityTable = false;

    async function fetchAndRenderCategoryCharts() {
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (!response.ok) throw new Error(`Failed to fetch transactions: HTTP ${response.status}`);
            const transactions = await response.json();
            window.savedTransactions = transactions;
            renderCategoryCharts(transactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert(`Error loading charts: ${error.message}`);
            renderCategoryCharts([
                { category: 'Liability', subcategory: 'Eatables', amount: 2000, date: '2025-04-01' },
                { category: 'Liability', subcategory: 'Fruits', amount: 1000, date: '2025-04-02' },
                { category: 'Liability', subcategory: 'Chitkara...', amount: 500, date: '2025-04-03' },
                { category: 'Liability', subcategory: 'Study', amount: 300, date: '2025-04-04' },
                { category: 'Liability', subcategory: 'Other', amount: 100, date: '2025-04-05' },
                { category: 'Liability', subcategory: 'Fare', amount: 30.50, date: '2025-04-06' }
            ]);
        }
    }

    function groupByCategory(transactions, type) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const summary = {};

        transactions
            .filter(tx => tx.category === type && tx.date.slice(0, 7) === currentMonth)
            .forEach(tx => {
                const label = tx.subcategory || 'Other';
                const amount = parseFloat(tx.amount) || 0;
                summary[label] = (summary[label] || 0) + amount;
            });

        return {
            labels: Object.keys(summary),
            values: Object.values(summary)
        };
    }

    function renderCategoryCharts(transactions) {
        const incomeData = groupByCategory(transactions, 'Income');
        renderIncomeBarChart(incomeData.labels, incomeData.values);

        const assetData = groupByCategory(transactions, 'Asset');
        renderStyledPieChart('assetPieChart', assetData.labels, assetData.values, 'Asset Distribution');

        const expenseData = groupByCategory(transactions, 'Expense');
        renderExpenseBarChart(expenseData.labels, expenseData.values);

        const liabilityData = groupByCategory(transactions, 'Liability');
        renderStyledPieChart('liabilityPieChart', liabilityData.labels, liabilityData.values, 'Liability Distribution');
    }

    function renderIncomeBarChart(labels, data) {
        const ctx = document.getElementById('incomeBarChart')?.getContext('2d');
        if (!ctx) return;
        if (incomeBarChart) incomeBarChart.destroy();

        incomeBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Income (INR)',
                    data,
                    backgroundColor: '#48bb78',
                    borderColor: '#2f855a',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Income Sources This Month',
                        color: '#ffffff',
                        font: { size: 18 }
                    }
                },
                scales: {
                    x: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: '#333333' } },
                    y: { ticks: { color: '#ffffff' } }
                }
            }
        });
    }

    function renderExpenseBarChart(labels, data) {
        const ctx = document.getElementById('expenseBarChart')?.getContext('2d');
        if (!ctx) return;
        if (expenseBarChart) expenseBarChart.destroy();

        expenseBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Expenses (INR)',
                    data,
                    backgroundColor: '#f56565',
                    borderColor: '#c53030',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Expense Categories This Month',
                        color: '#ffffff',
                        font: { size: 18 }
                    }
                },
                scales: {
                    x: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: '#333333' } },
                    y: { ticks: { color: '#ffffff' } }
                }
            }
        });
    }
    

    function renderStyledPieChart(canvasId, labels, data, titleText) {


        if (canvasId === 'assetPieChart' && assetPieChart) {
            assetPieChart.destroy();
        }
        if (canvasId === 'liabilityPieChart' && liabilityPieChart) {
            liabilityPieChart.destroy();
        }

        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;
    
        const isAsset = canvasId === 'assetPieChart';
        const themeColor = isAsset ? '#48bb78' : '#ff4b5c';
        const bgColors = isAsset
            ? ['#48bb78', '#68d391', '#38a169', '#2f855a', '#276749', '#22543d']
            : ['#ff4b5c', '#ff6f61', '#ff847c', '#ffa07a', '#ffb6b9', '#ffc3a0'];
    
        // ✅ Custom plugin for drawing center text
        const centerText = {
            id: 'centerText',
            beforeDraw(chart) {
                const { width, height, ctx } = chart;
                const total = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                const isAsset = chart.canvas.id === 'assetPieChart';
    
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
    
                if (isAsset) {
                    ctx.font = '16px sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText('Assets', width / 2, height / 2 - 35); // name above
                }else{
                    ctx.font = '16px sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText('Liabilities', width / 2, height / 2 - 35);

                }
    
                
    
                ctx.font = 'bold 24px sans-serif';
                ctx.fillStyle = themeColor;
                ctx.fillText(`₹${total.toFixed(2)}`, width / 2, height / 2);
    
                ctx.font = '18px sans-serif';
                ctx.fillStyle = '#00ff90';
                // ctx.fillText('₹0', width / 2, height / 2 + 30);
    
                ctx.restore();
            }
        };
    
        const chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: bgColors,
                    borderColor: '#111',
                    borderWidth: 1
                }]
            },
            options: {
                layout: {
                    padding: {
                        top: 30
                    }
                },
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 0.8,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    title: {
                        display: false, // hiding "Asset Distribution"
                        text: titleText,
                        color: themeColor,
                        font: { size: 18 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) =>
                                `${tooltipItem.label}: ₹${tooltipItem.raw.toFixed(2)}`
                        }
                    },
                    datalabels: {
                        color: '#ffffff',
                        padding: 8,
                        formatter: (value, ctx) => {
                            const total = ctx.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${ctx.chart.data.labels[ctx.dataIndex]} ${percentage}%`;
                        },
                        font: { size: 14, weight: 'bold' },
                        anchor: 'end',
                        align: 'end',
                        offset: 9,
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        clamp: true,
                        display: true
                    }
                }
            },
            plugins: [ChartDataLabels, centerText]
        });
    
        if (isAsset) assetPieChart = chartInstance;
        else liabilityPieChart = chartInstance;
    }    

    function renderDistributionTable(containerId, labels, values, title) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const total = values.reduce((sum, val) => sum + (val || 0), 0);
        container.innerHTML = `
            <h3 style="color: #ffffff; margin-bottom: 10px;">${title}</h3>
            <table class="distribution-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount (INR)</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${labels.map((label, i) => {
                        const amount = values[i] || 0;
                        const percentage = total > 0 ? ((amount / total) * 100).toFixed(2) : 0;
                        return `
                            <tr>
                                <td>${label}</td>
                                <td>₹${amount.toFixed(2)}</td>
                                <td>${percentage}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // Flip Asset Pie to Table
    document.getElementById('assetChartContainer')?.addEventListener('click', () => {
        const pieCanvas = document.getElementById('assetPieChart');
        const tableContainer = document.getElementById('assetTableContainer');
        showingAssetTable = !showingAssetTable;

        if (showingAssetTable) {
            pieCanvas.classList.add('hidden');
            setTimeout(() => {
                pieCanvas.style.display = 'none';
                tableContainer.style.display = 'block';
                tableContainer.classList.add('visible');
                const assetData = groupByCategory(window.savedTransactions || [], 'Asset');
                renderDistributionTable('assetTableContainer', assetData.labels, assetData.values, 'Asset Distribution');
            }, 300);
        } else {
            tableContainer.classList.remove('visible');
            setTimeout(() => {
                tableContainer.style.display = 'none';
                pieCanvas.style.display = 'block';
                pieCanvas.classList.remove('hidden');
            }, 300);
        }
    });

    // Flip Liability Pie to Table
    document.getElementById('liabilityChartContainer')?.addEventListener('click', () => {
        const pieCanvas = document.getElementById('liabilityPieChart');
        const tableContainer = document.getElementById('liabilityTableContainer');
        showingLiabilityTable = !showingLiabilityTable;

        if (showingLiabilityTable) {
            pieCanvas.classList.add('hidden');
            setTimeout(() => {
                pieCanvas.style.display = 'none';
                tableContainer.style.display = 'block';
                tableContainer.classList.add('visible');
                const liabilityData = groupByCategory(window.savedTransactions || [], 'Liability');
                renderDistributionTable('liabilityTableContainer', liabilityData.labels, liabilityData.values, 'Liability Distribution');
            }, 300);
        } else {
            tableContainer.classList.remove('visible');
            setTimeout(() => {
                tableContainer.style.display = 'none';
                pieCanvas.style.display = 'block';
                pieCanvas.classList.remove('hidden');
            }, 300);
        }
    });

    const categoryNav = document.getElementById('nav-category');
    if (categoryNav) categoryNav.addEventListener('click', fetchAndRenderCategoryCharts);

    if (document.getElementById('category')?.style.display === 'block') {
        fetchAndRenderCategoryCharts();
    }

    const dateSpan = document.getElementById('currentDateCategory');
    if (dateSpan) {
        dateSpan.textContent = new Date().toLocaleDateString();
    }
});
