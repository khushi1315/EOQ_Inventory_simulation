import sqlite3

conn = sqlite3.connect('delivery.db')
c = conn.cursor()

# Orders table
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

# Delivery zones table
c.execute('''
CREATE TABLE IF NOT EXISTS delivery_zones (
    zone_id INTEGER PRIMARY KEY,
    zone_name TEXT,
    boundaries TEXT,
    pricing_multiplier REAL
)
''')

# Failed deliveries table
c.execute('''
CREATE TABLE IF NOT EXISTS failed_deliveries (
    order_id INTEGER,
    failure_date TEXT,
    failure_reason TEXT,
    retry_count INTEGER
)
''')

# Customer preferences table
c.execute('''
CREATE TABLE IF NOT EXISTS customer_preferences (
    customer_id INTEGER PRIMARY KEY,
    preferred_delivery_type TEXT,
    preferred_time_slots TEXT
)
''')

# Delivery locations table
c.execute('''
CREATE TABLE IF NOT EXISTS delivery_locations (
    order_id INTEGER,
    latitude REAL,
    longitude REAL,
    address TEXT
)
''')

conn.commit()
conn.close()
print("Tables created successfully.")
