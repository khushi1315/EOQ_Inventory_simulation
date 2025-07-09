import sqlite3

conn = sqlite3.connect('delivery.db')
c = conn.cursor()

# Insert sample data into orders table
c.execute("INSERT OR REPLACE INTO orders (order_id, customer_name, delivery_date, status, delivery_zone, delivery_type) VALUES (1001, 'Alice Brown', '2025-07-10', 'Pending', 1, 'Same-Day')")
c.execute("INSERT OR REPLACE INTO orders (order_id, customer_name, delivery_date, status, delivery_zone, delivery_type) VALUES (1002, 'John Clark', '2025-07-09', 'In Transit', 2, 'Standard')")
c.execute("INSERT OR REPLACE INTO orders (order_id, customer_name, delivery_date, status, delivery_zone, delivery_type) VALUES (1003, 'Emily Davis', '2025-07-08', 'Delivered', 1, 'Same-Day')")
c.execute("INSERT OR REPLACE INTO orders (order_id, customer_name, delivery_date, status, delivery_zone, delivery_type) VALUES (1004, 'Michael Smith', '2025-07-07', 'Failed', 3, 'Standard')")

# Insert sample data into delivery_zones table
c.execute("INSERT OR REPLACE INTO delivery_zones (zone_id, zone_name, boundaries, pricing_multiplier) VALUES (1, 'Zone A', 'Boundary A', 1.0)")
c.execute("INSERT OR REPLACE INTO delivery_zones (zone_id, zone_name, boundaries, pricing_multiplier) VALUES (2, 'Zone B', 'Boundary B', 1.5)")
c.execute("INSERT OR REPLACE INTO delivery_zones (zone_id, zone_name, boundaries, pricing_multiplier) VALUES (3, 'Zone C', 'Boundary C', 2.0)")

# Insert sample data into failed_deliveries table
c.execute("INSERT OR REPLACE INTO failed_deliveries (order_id, failure_date, failure_reason, retry_count) VALUES (1004, '2025-07-09', 'Customer not available', 1)")

# Insert sample data into customer_preferences table
c.execute("INSERT OR REPLACE INTO customer_preferences (customer_id, preferred_delivery_type, preferred_time_slots) VALUES (1, 'Same-Day', 'Morning')")

# Insert sample data into delivery_locations table
c.execute("INSERT OR REPLACE INTO delivery_locations (order_id, latitude, longitude, address) VALUES (1001, 40.7128, -74.0060, '123 Main St, New York, NY')")
c.execute("INSERT OR REPLACE INTO delivery_locations (order_id, latitude, longitude, address) VALUES (1002, 34.0522, -118.2437, '456 Elm St, Los Angeles, CA')")

conn.commit()
conn.close()
print("Sample data inserted successfully.")
