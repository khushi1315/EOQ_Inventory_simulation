
let currentPage = 1;
const rowsPerPage = 10;

// 🟢 Pagination Helper Functions (move these here!)
function displayPage(page, data) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageItems = data.slice(start, end);

    pageItems.forEach(row => {
        const tr = document.createElement("tr");
        if (row["Stock Levels"] === 0) {
            tr.classList.add("table-danger");
        } else if (row["Stock Levels"] < 20) {
            tr.classList.add("table-warning");
        } else {
            tr.classList.add("table-success");
        }

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
    const pagination = document.getElementById("paginationControls");
    pagination.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        currentPage--;
        displayPage(currentPage, data);
        setupPagination(data);
    };

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === pageCount;
    nextBtn.onclick = () => {
        currentPage++;
        displayPage(currentPage, data);
        setupPagination(data);
    };

    const pageInfo = document.createElement("span");
    pageInfo.textContent = ` Page ${currentPage} of ${pageCount} `;

    pagination.appendChild(prevBtn);
    pagination.appendChild(pageInfo);
    pagination.appendChild(nextBtn);
}


function runSimulation() {
    console.log("🔁 Starting simulation...");
    document.getElementById("loading").style.display = "block";
    document.getElementById("simulationResultWrapper").style.display = "none";
    document.getElementById("error").innerText = "";

    fetch('/simulate')
        .then(response => response.json())
        .then(data => {
            console.log("✅ Data received:", data);
            document.getElementById("loading").style.display = "none";

            if (data.error) {
                document.getElementById("error").innerText = "Error: " + data.error;
                return;
            }

            const storeId = document.getElementById("storeFilter").value;
            const filtered = storeId ? data.filter(d => d["Store ID"] == storeId) : data;

            currentPage = 1;
            displayPage(currentPage, filtered);
            setupPagination(filtered);

            document.getElementById("simulationResultWrapper").style.display = "block";

            // ✅ Inventory Status Summary
            const totalItems = filtered.length;
            const outOfStock = filtered.filter(d => d["Stock Levels"] === 0).length;
            const lowStock = filtered.filter(d => d["Stock Levels"] > 0 && d["Stock Levels"] < 20).length;
            const healthyStock = totalItems - outOfStock - lowStock;

            // Update summary numbers
document.getElementById("totalProducts").innerText = totalItems;
document.getElementById("outOfStock").innerText = outOfStock;
document.getElementById("lowStock").innerText = lowStock;
document.getElementById("healthyStock").innerText = healthyStock;

// Show the summary card
document.getElementById("summaryText").classList.remove("d-none");


            // ✅ Show Restocking Info
            document.getElementById("restockingText").classList.remove("d-none");

            // ✅ Render Chart
            const labels = filtered.map(d => d["Product ID"]);
            const quantities = filtered.map(d => d["Order_Quantity"]);

            const ctx = document.getElementById("forecastChart").getContext("2d");
            if (window.orderChartInstance) {
                window.orderChartInstance.destroy();
            }
            window.orderChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Order Quantity',
                        data: quantities,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)'
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
                        x: {
                            title: {
                                display: true,
                                text: 'Product ID'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Order Quantity (Units)'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            document.getElementById("loading").style.display = "none";
            console.error("❌ Fetch error:", error);
            document.getElementById("error").innerText = "Fetch error: " + error.message;
        });
}


function applyFilter() {
    runSimulation();
}

window.onload = function() {
    fetch('/get_store_ids')
        .then(response => response.json())
        .then(storeIds => {
            const storeFilter = document.getElementById('storeFilter');
            storeIds.forEach(id => {
                const option = document.createElement('option');
                option.value = id;
                option.text = id;
                storeFilter.appendChild(option);
            });
        });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("runBtn").addEventListener("click", runSimulation);
    // document.getElementById("storeFilter").addEventListener("change", applyFilter);
 });





