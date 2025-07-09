let map = null;


function fetchOrders() {
    fetch('/api/orders/tracking')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#orders-table tbody');
            let rows = '';
            data.forEach(order => {
                const badgeClass = {
                    'Pending': 'bg-warning',
                    'In Transit': 'bg-info',
                    'Delivered': 'bg-success',
                    'Failed': 'bg-danger'
                }[order.status] || 'bg-secondary';

                rows += `
          <tr>
            <td>${order.order_id}</td>
            <td>${order.customer_name}</td>
            <td><span class="badge ${badgeClass}">${order.status}</span></td>
          </tr>`;
            });
            tbody.innerHTML = rows;
        });
}

function fetchZones() {
    fetch('/api/delivery/zones')
        .then(res => res.json())
        .then(zones => {
            const select = document.getElementById('zone-select');
            select.innerHTML = '';
            zones.forEach(zone => {
                select.innerHTML += `<option value="${zone.zone_id}">${zone.zone_name}</option>`;
            });

            if (!map) {
                map = L.map('delivery-map').setView([20.5937, 78.9629], 5);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                setTimeout(() => {
                    map.invalidateSize();
                }, 600); // 500–700ms is usually enough
            }


            // Optional: clear previous zone markers
            zones.forEach(zone => {
                L.circle([20 + Math.random(), 78 + Math.random()], {
                    color: 'blue',
                    fillColor: '#30f',
                    fillOpacity: 0.2,
                    radius: 20000 * zone.pricing_multiplier
                }).addTo(map).bindPopup(zone.zone_name);
            });
        });
}

function fetchFailed() {
    fetch('/api/orders/failed')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#failed-table tbody');
            let rows = '';
            data.forEach(fail => {
                rows += `
          <tr>
            <td>${fail.order_id}</td>
            <td>${fail.failure_date}</td>
            <td>
              <button class="btn btn-sm btn-warning">Reschedule</button>
              <button class="btn btn-sm btn-danger">Return</button>
            </td>
          </tr>`;
            });
            tbody.innerHTML = rows;
        });
}

document.getElementById('cost-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const zone_id = document.getElementById('zone-select').value;
    const distance = document.getElementById('distance-input').value;
    fetch('/api/delivery/cost-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id, distance })
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById('cost-result').innerText = `Estimated Cost: ₹${data.cost}`;
        });
});

document.getElementById('same-day-btn').addEventListener('click', () => {
    setPreference('Same-Day');
});
document.getElementById('standard-btn').addEventListener('click', () => {
    setPreference('Standard');
});

function setPreference(type, persist = true) {
    fetch("/api/customer/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            customer_id: 1,
            preferred_delivery_type: type,
            preferred_time_slots: "Any",
        }),
    }).then(() => {
        updatePreferenceUI(type);
        if (persist) {
            localStorage.setItem("preferredType", type);
        }
    });
}


function updatePreferenceUI(type) {
    const sameDayBtn = document.getElementById("same-day-btn");
    const standardBtn = document.getElementById("standard-btn");


    sameDayBtn.classList.remove("btn-primary", "btn-outline-primary");
    standardBtn.classList.remove("btn-primary", "btn-outline-secondary");

    if (type === "Same-Day") {
        sameDayBtn.classList.add("btn-primary");
        standardBtn.classList.add("btn-outline-secondary");
    } else {
        sameDayBtn.classList.add("btn-outline-primary");
        standardBtn.classList.add("btn-primary");
    }

    const msg = document.getElementById("preference-content");
    if (msg) {
        msg.innerHTML = `<p class="text-muted">Preferred delivery type set to <strong>${type}</strong> successfully.</p>`;
    }
}
document.getElementById("same-day-btn").addEventListener("click", () => {
    setPreference("Same-Day");
});
document.getElementById("standard-btn").addEventListener("click", () => {
    setPreference("Standard");
});


// Initial data fetch
fetchOrders();
fetchZones();
fetchFailed();
const storedPref = localStorage.getItem("preferredType") || "Same-Day";
setPreference(storedPref); // Load stored or default


// Periodic polling
setInterval(fetchOrders, 30000);
setInterval(fetchFailed, 30000);
