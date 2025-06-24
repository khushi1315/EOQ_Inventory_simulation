
// let currentPage = 1;
// const rowsPerPage = 10;

// // 🟢 Pagination Helper Functions (move these here!)
// function displayPage(page, data) {
//     const tbody = document.getElementById("tableBody");
//     tbody.innerHTML = "";

//     const start = (page - 1) * rowsPerPage;
//     const end = start + rowsPerPage;
//     const pageItems = data.slice(start, end);

//     pageItems.forEach(row => {
//         const tr = document.createElement("tr");
//         if (row["Stock Levels"] === 0) {
//             tr.classList.add("table-danger");
//         } else if (row["Stock Levels"] < 20) {
//             tr.classList.add("table-warning");
//         } else {
//             tr.classList.add("table-success");
//         }

//         tr.innerHTML = `
//             <td>${row["Product ID"]}</td>
//             <td>${row["Store ID"]}</td>
//             <td>${row["Stock Levels"]}</td>
//             <td>${row["Order_Quantity"]}</td>
//         `;
//         tbody.appendChild(tr);
//     });
// }

// function setupPagination(data) {
//     const pageCount = Math.ceil(data.length / rowsPerPage);
//     const pagination = document.getElementById("paginationControls");
//     pagination.innerHTML = "";

//     const prevBtn = document.createElement("button");
//     prevBtn.textContent = "Prev";
//     prevBtn.disabled = currentPage === 1;
//     prevBtn.onclick = () => {
//         currentPage--;
//         displayPage(currentPage, data);
//         setupPagination(data);
//     };

//     const nextBtn = document.createElement("button");
//     nextBtn.textContent = "Next";
//     nextBtn.disabled = currentPage === pageCount;
//     nextBtn.onclick = () => {
//         currentPage++;
//         displayPage(currentPage, data);
//         setupPagination(data);
//     };

//     const pageInfo = document.createElement("span");
//     pageInfo.textContent = ` Page ${currentPage} of ${pageCount} `;

//     pagination.appendChild(prevBtn);
//     pagination.appendChild(pageInfo);
//     pagination.appendChild(nextBtn);
// }


// function runSimulation() {
//     console.log("🔁 Starting simulation...");
//     document.getElementById("loading").style.display = "block";
//     document.getElementById("simulationResultWrapper").style.display = "none";
//     document.getElementById("error").innerText = "";

//     fetch('/simulate')
//         .then(response => response.json())
//         .then(data => {
//             console.log("✅ Data received:", data);
//             document.getElementById("loading").style.display = "none";

//             if (data.error) {
//                 document.getElementById("error").innerText = "Error: " + data.error;
//                 return;
//             }

//             const storeId = document.getElementById("storeFilter").value;
//             const filtered = storeId ? data.filter(d => d["Store ID"] == storeId) : data;

//             currentPage = 1;
//             displayPage(currentPage, filtered);
//             setupPagination(filtered);

//             document.getElementById("simulationResultWrapper").style.display = "block";

//             // ✅ Inventory Status Summary
//             const totalItems = filtered.length;
//             const outOfStock = filtered.filter(d => d["Stock Levels"] === 0).length;
//             const lowStock = filtered.filter(d => d["Stock Levels"] > 0 && d["Stock Levels"] < 20).length;
//             const healthyStock = totalItems - outOfStock - lowStock;

//             // Update summary numbers
// document.getElementById("totalProducts").innerText = totalItems;
// document.getElementById("outOfStock").innerText = outOfStock;
// document.getElementById("lowStock").innerText = lowStock;
// document.getElementById("healthyStock").innerText = healthyStock;

// // Show the summary card
// document.getElementById("summaryText").classList.remove("d-none");


//             // ✅ Show Restocking Info
//             document.getElementById("restockingText").classList.remove("d-none");

//             // ✅ Render Chart
//             const labels = filtered.map(d => d["Product ID"]);
//             const quantities = filtered.map(d => d["Order_Quantity"]);

//             const ctx = document.getElementById("forecastChart").getContext("2d");
//             if (window.orderChartInstance) {
//                 window.orderChartInstance.destroy();
//             }
//             window.orderChartInstance = new Chart(ctx, {
//                 type: 'bar',
//                 data: {
//                     labels: labels,
//                     datasets: [{
//                         label: 'Order Quantity',
//                         data: quantities,
//                         backgroundColor: 'rgba(54, 162, 235, 0.6)'
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     plugins: {
//                         title: {
//                             display: true,
//                             text: 'Order Quantities for Products That Need Restocking'
//                         }
//                     },
//                     scales: {
//                         x: {
//                             title: {
//                                 display: true,
//                                 text: 'Product ID'
//                             }
//                         },
//                         y: {
//                             beginAtZero: true,
//                             title: {
//                                 display: true,
//                                 text: 'Order Quantity (Units)'
//                             }
//                         }
//                     }
//                 }
//             });
//         })
//         .catch(error => {
//             document.getElementById("loading").style.display = "none";
//             console.error("❌ Fetch error:", error);
//             document.getElementById("error").innerText = "Fetch error: " + error.message;
//         });
// }


// function applyFilter() {
//     runSimulation();
// }

// window.onload = function() {
//     fetch('/get_store_ids')
//         .then(response => response.json())
//         .then(storeIds => {
//             const storeFilter = document.getElementById('storeFilter');
//             storeIds.forEach(id => {
//                 const option = document.createElement('option');
//                 option.value = id;
//                 option.text = id;
//                 storeFilter.appendChild(option);
//             });
//         });
// }

// document.addEventListener("DOMContentLoaded", () => {
//     document.getElementById("runBtn").addEventListener("click", runSimulation);
//     // document.getElementById("storeFilter").addEventListener("change", applyFilter);
//  });










 // Global variables for data caching and pagination
let globalSimulationData = null;
let currentPage = 1;
const rowsPerPage = 10;

// 🔍 Utility function to safely get elements
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Element with ID '${id}' not found`);
    }
    return element;
}

// 🟢 Pagination Helper Functions
function displayPage(page, data) {
    const tbody = safeGetElement("tableBody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageItems = data.slice(start, end);

    pageItems.forEach(row => {
        const tr = document.createElement("tr");
        
        // Color coding based on stock levels
        if (row["Stock Levels"] === 0) {
            tr.classList.add("table-danger");
        } else if (row["Stock Levels"] < 20) {
            tr.classList.add("table-warning");
        } else {
            tr.classList.add("table-success");
        }

        // Include inventory value if available
        const inventoryValue = row["Inventory_Value"] 
            ? `$${row["Inventory_Value"].toLocaleString()}` 
            : 'N/A';

        tr.innerHTML = `
            <td>${row["Product ID"]}</td>
            <td>${row["Store ID"]}</td>
            <td>${row["Stock Levels"]}</td>
            <td>${row["Order_Quantity"]}</td>
            
        `;
        tbody.appendChild(tr);
    });
}

function setupPagination(data) {
    const pageCount = Math.ceil(data.length / rowsPerPage);
    const pagination = safeGetElement("paginationControls");
    if (!pagination) return;
    
    pagination.innerHTML = "";

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.className = "btn btn-outline-primary btn-sm mx-1";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage, data);
            setupPagination(data);
        }
    };

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.className = "btn btn-outline-primary btn-sm mx-1";
    nextBtn.disabled = currentPage === pageCount || pageCount === 0;
    nextBtn.onclick = () => {
        if (currentPage < pageCount) {
            currentPage++;
            displayPage(currentPage, data);
            setupPagination(data);
        }
    };

    // Page info
    const pageInfo = document.createElement("span");
    pageInfo.className = "mx-2";
    pageInfo.textContent = pageCount > 0 ? ` Page ${currentPage} of ${pageCount} ` : " No data ";

    pagination.appendChild(prevBtn);
    pagination.appendChild(pageInfo);
    pagination.appendChild(nextBtn);
}

// 🔄 Main simulation function with proper error handling
function runSimulation() {
    console.log("🔁 Starting simulation...");

    // Safely handle loading state
    const loading = safeGetElement("loading");
    if (loading) loading.style.display = "block";

    const errorBox = safeGetElement("error");
    if (errorBox) errorBox.innerText = "";

    const simWrap = safeGetElement("simulationResultWrapper");
    if (simWrap) simWrap.style.display = "none";

    // Check if we have cached data
    if (globalSimulationData) {
        console.log("📦 Using cached simulation data");
        processSimulationData(globalSimulationData);
        if (loading) loading.style.display = "none";
        return;
    }

    // Fetch new data
    fetch('/simulate')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ Fresh data received:", data.length || 0, "records");
            
            if (loading) loading.style.display = "none";

            if (data.error) {
                if (errorBox) errorBox.innerText = "Error: " + data.error;
                return;
            }

            // Cache the data globally
            globalSimulationData = data;
            processSimulationData(data);
        })
        .catch(error => {
            if (loading) loading.style.display = "none";
            if (errorBox) errorBox.innerText = "Fetch error: " + error.message;
            console.error("❌ Fetch error:", error);
        });
}

// 📊 Process simulation data for both dashboard and store analysis
function processSimulationData(data) {
    if (!data || data.length === 0) {
        console.warn("⚠️ No data to process");
        return;
    }

    // Get filter value safely
    const storeFilter = safeGetElement("storeFilter");
    const storeId = storeFilter ? storeFilter.value : "";
    const filtered = storeId ? data.filter(d => d["Store ID"] == storeId) : data;

    console.log(`📊 Processing ${filtered.length} records (filtered from ${data.length})`);

    // Update dashboard metrics
    updateDashboardMetrics(filtered, data);

    // Update table if it exists (store-analysis page)
    updateTable(filtered);

    // Update charts
    updateCharts(filtered, data);

    // Update summary boxes if they exist
    updateSummaryBoxes(filtered);

    // Show results
    const simWrap = safeGetElement("simulationResultWrapper");
    if (simWrap) simWrap.style.display = "block";
}

// 📈 Update dashboard metrics
function updateDashboardMetrics(filtered, allData) {
    // Calculate unique stores and products
    const uniqueStores = new Set(allData.map(d => d["Store ID"]));
    const uniqueProducts = new Set(filtered.map(d => d["Product ID"]));
    const outOfStockProducts = new Set(
        filtered.filter(d => d["Stock Levels"] === 0).map(d => d["Product ID"])
    );

    // Calculate inventory value
    const totalValue = filtered.reduce((sum, item) => {
        return sum + (item["Inventory_Value"] || (item["Stock Levels"] * 50)); // Fallback price
    }, 0);

    // Update UI elements safely
    const totalStoresEl = safeGetElement("totalStores");
    if (totalStoresEl) totalStoresEl.innerText = uniqueStores.size;

    const totalProductsEl = safeGetElement("totalProducts");
    if (totalProductsEl) totalProductsEl.innerText = uniqueProducts.size;

    const outOfStockEl = safeGetElement("outOfStock");
    if (outOfStockEl) outOfStockEl.innerText = outOfStockProducts.size;

    const totalValueEl = safeGetElement("totalValue");
    if (totalValueEl) totalValueEl.innerText = `$${totalValue.toLocaleString()}`;

    // Store-analysis specific metrics
    const lowStockEl = safeGetElement("lowStock");
    const healthyStockEl = safeGetElement("healthyStock");
    if (lowStockEl && healthyStockEl) {
        const lowStock = filtered.filter(d => d["Stock Levels"] > 0 && d["Stock Levels"] < 20).length;
        const healthy = filtered.length - outOfStockProducts.size - lowStock;
        lowStockEl.innerText = lowStock;
        healthyStockEl.innerText = Math.max(0, healthy);
    }
}

// 📋 Update table (store-analysis page only)
function updateTable(filtered) {
    const tableBody = safeGetElement("tableBody");
    if (!tableBody) return;

    currentPage = 1;
    displayPage(currentPage, filtered);
    setupPagination(filtered);
}

// 📊 Update all charts
function updateCharts(filtered, allData) {
    // Update store-analysis chart
    updateStoreAnalysisChart(filtered);
    
    // Update dashboard charts
    updateStorePerformanceChart(allData);
    updateStockStatusChart(filtered);
}

// 📊 Update store analysis chart (EOQ chart)
function updateStoreAnalysisChart(filtered) {
    const chartCanvas = safeGetElement("forecastChart");
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext("2d");
    const labels = filtered.map(d => d["Product ID"]);
    const quantities = filtered.map(d => d["Order_Quantity"]);

    // Destroy existing chart
    if (window.orderChartInstance) {
        window.orderChartInstance.destroy();
    }

    // Create new chart
    window.orderChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.slice(0, 20),
            datasets: [{
                label: 'Order Quantity',
                data: quantities.slice(0, 20),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Order Quantities for Products That Need Restocking'
                }
            },
            scales: {
                x: { title: { display: true, text: 'Product ID' } },
                y: { beginAtZero: true, title: { display: true, text: 'Order Quantity (Units)' } }
            }
        }
    });
}

// 📊 Update store performance chart (Dashboard)
function updateStorePerformanceChart(allData) {
    const chartCanvas = safeGetElement("storePerformanceChart");
    if (!chartCanvas) return;

    // Group data by store
    const storePerformance = {};
    allData.forEach(item => {
        const storeId = item["Store ID"];
        if (!storePerformance[storeId]) {
            storePerformance[storeId] = {
                totalProducts: 0,
                totalStock: 0,
                outOfStock: 0,
                inventoryValue: 0
            };
        }
        storePerformance[storeId].totalProducts += 1;
        storePerformance[storeId].totalStock += item["Stock Levels"];
        storePerformance[storeId].inventoryValue += item["Inventory_Value"] || (item["Stock Levels"] * 50);
        if (item["Stock Levels"] === 0) {
            storePerformance[storeId].outOfStock += 1;
        }
    });

    const storeIds = Object.keys(storePerformance).slice(0, 10); // Limit to 10 stores
    const inventoryValues = storeIds.map(id => storePerformance[id].inventoryValue);

    const ctx = chartCanvas.getContext("2d");
    
    // Destroy existing chart
    if (window.storePerformanceChartInstance) {
        window.storePerformanceChartInstance.destroy();
    }

    // Create new chart
    window.storePerformanceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: storeIds.map(id => `Store ${id}`),
            datasets: [{
                label: 'Inventory Value',
                data: inventoryValues,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                    '#4BC0C0', '#FF6384'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Store Performance by Inventory Value'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 📊 Update stock status chart (Dashboard)
function updateStockStatusChart(filtered) {
    const chartCanvas = safeGetElement("stockStatusChart");
    if (!chartCanvas) return;

    // Calculate stock status
    const outOfStock = filtered.filter(d => d["Stock Levels"] === 0).length;
    const lowStock = filtered.filter(d => d["Stock Levels"] > 0 && d["Stock Levels"] < 20).length;
    const healthyStock = filtered.length - outOfStock - lowStock;

    const ctx = chartCanvas.getContext("2d");
    
    // Destroy existing chart
    if (window.stockStatusChartInstance) {
        window.stockStatusChartInstance.destroy();
    }

    // Create new chart
    window.stockStatusChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Out of Stock', 'Low Stock', 'Healthy Stock'],
            datasets: [{
                data: [outOfStock, lowStock, healthyStock],
                backgroundColor: ['#FF6384', '#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Status Distribution'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 📝 Update summary boxes (store-analysis page only)
function updateSummaryBoxes(filtered) {
    const summaryBox = safeGetElement("summaryText");
    if (summaryBox) summaryBox.classList.remove("d-none");

    const restockingBox = safeGetElement("restockingText");
    if (restockingBox) restockingBox.classList.remove("d-none");
}

// 🔍 Apply filter and refresh data
function applyFilter() {
    console.log("🔍 Applying filter...");
    if (globalSimulationData) {
        processSimulationData(globalSimulationData);
    } else {
        runSimulation();
    }
}

// 🏪 Load store IDs for dropdown
function loadStoreIds() {
    const storeFilter = safeGetElement('storeFilter');
    if (!storeFilter) return;

    fetch('/get_store_ids')
        .then(response => response.json())
        .then(storeIds => {
            // Clear existing options except the first one
            while (storeFilter.children.length > 1) {
                storeFilter.removeChild(storeFilter.lastChild);
            }

            // Add store options
            storeIds.forEach(id => {
                const option = document.createElement('option');
                option.value = id;
                option.text = `Store ${id}`;
                storeFilter.appendChild(option);
            });
        })
        .catch(error => {
            console.error("❌ Error loading store IDs:", error);
        });
}

// 🎯 Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("🎯 DOM Content Loaded - Initializing...");

    // Load store IDs for dropdown
    loadStoreIds();

    // Set up event listeners safely
    const runBtn = safeGetElement("runBtn");
    if (runBtn) {
        runBtn.addEventListener("click", runSimulation);
    }

    const storeFilter = safeGetElement("storeFilter");
    if (storeFilter) {
        storeFilter.addEventListener("change", applyFilter);
    }

    // Auto-run simulation for dashboard page
    const isDashboard = window.location.pathname.includes('dashboard');
    if (isDashboard) {
        console.log("📊 Dashboard detected - auto-running simulation");
        setTimeout(runSimulation, 500);
    }
});

// 🔄 Handle page load for store IDs
window.onload = function() {
    console.log("🔄 Window loaded");
    loadStoreIds();
};
