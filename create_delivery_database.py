import sqlite3
import json

conn = sqlite3.connect('delivery.db')
c = conn.cursor()

# --- TABLE CREATION ---
c.execute('''
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY,
    customer_name TEXT,
    delivery_date TEXT,
    status TEXT,
    delivery_zone INTEGER,
    delivery_type TEXT
)
''')

c.execute('''
CREATE TABLE IF NOT EXISTS delivery_zones (
    zone_id INTEGER PRIMARY KEY,
    zone_name TEXT,
    boundaries TEXT,  -- Stored as JSON
    pricing_multiplier REAL
)
''')

c.execute('''
CREATE TABLE IF NOT EXISTS failed_deliveries (
    order_id INTEGER,
    failure_date TEXT,
    failure_reason TEXT,
    retry_count INTEGER
)
''')

c.execute('''
CREATE TABLE IF NOT EXISTS customer_preferences (
    customer_id INTEGER PRIMARY KEY,
    preferred_delivery_type TEXT,
    preferred_time_slots TEXT
)
''')

c.execute('''
CREATE TABLE IF NOT EXISTS delivery_locations (
    order_id INTEGER,
    latitude REAL,
    longitude REAL,
    address TEXT
)
''')

# --- DELIVERY ZONES DATA (✅ Proper Polygons) ---
zones = [
    {
        "zone_name": "Central Zone",
        "boundaries": [[
            [28.6139, 77.2090],
            [28.6170, 77.2150],
            [28.6120, 77.2220],
            [28.6080, 77.2180],
            [28.6139, 77.2090]
        ]],
        "pricing_multiplier": 1.5
    },
    {
        "zone_name": "North Zone",
        "boundaries": [[
            [28.7000, 77.1000],
            [28.7050, 77.1100],
            [28.7100, 77.1050],
            [28.7050, 77.0950],
            [28.7000, 77.1000]
        ]],
        "pricing_multiplier": 1.8
    },
    {
        "zone_name": "South Zone",
        "boundaries": [[
            [28.5000, 77.2000],
            [28.5100, 77.2100],
            [28.5150, 77.2050],
            [28.5100, 77.1950],
            [28.5000, 77.2000]
        ]],
        "pricing_multiplier": 1.2
    }
]

# --- INSERT ZONES ---
for zone in zones:
    c.execute("SELECT COUNT(*) FROM delivery_zones WHERE zone_name = ?", (zone["zone_name"],))
    if c.fetchone()[0] == 0:
        c.execute(
            '''
            INSERT INTO delivery_zones (zone_name, boundaries, pricing_multiplier)
            VALUES (?, ?, ?)
            ''',
            (zone["zone_name"], json.dumps(zone["boundaries"]), zone["pricing_multiplier"])
        )

conn.commit()
conn.close()
print("✅ Database initialized with polygon zones.")
