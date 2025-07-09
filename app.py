

from flask import Flask, render_template, jsonify
from EOQ_model import load_and_preprocess_data, train_model, simulate_inventory, prepare_inventory,compute_eoq  
import pandas as pd
import sqlite3
from flask import request


app = Flask(__name__)
def query_db(query, args=(), one=False):
    conn = sqlite3.connect('delivery.db')
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/store-analysis')
def store_analysis():
    return render_template('store-analysis.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')
@app.route('/customer-delivery')
def customer_delivery():
    return render_template('/customer-delivery.html');
@app.route('/salespredictions')
def sales_prediction():
    return render_template('/salespredictions.html')

@app.route('/business-reports')
def business_reports():
    return render_template('/business-reports.html');

@app.route('/smart-restocking')
def smart_restocking():
    return render_template('/smart-restocking.html');

@app.route('/get_store_ids')
def get_store_ids():
    inventory_df = pd.read_csv("inventory_monitoring.csv")
    store_ids = sorted(inventory_df["Store ID"].unique().tolist())
    return jsonify(store_ids)

@app.route('/sales-data')
def sales_data():
    df = pd.read_csv('predicted_sales.csv')
    return jsonify(df.to_dict(orient='records'))


@app.route('/simulate')
def simulate():
    try:
        # Load and preprocess data
        df_demand, df_inventory,df_price = load_and_preprocess_data()

        # Run EOQ prediction
        model, X_test, y_pred, mae = train_model(df_demand)

        # Simulate inventory based on EOQ
        EOQ_values = compute_eoq(y_pred, df_price)
        df_inv_ready = prepare_inventory(X_test, EOQ_values, df_inventory)
        result_df = simulate_inventory(df_inv_ready)


        # Convert result DataFrame to JSON and send to frontend
        return jsonify(result_df.to_dict(orient='records'))

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/api/orders/tracking')
def orders_tracking():
    rows = query_db('SELECT * FROM orders ORDER BY delivery_date DESC LIMIT 10')
    print("Fetched orders:", rows)  # <-- Add this
    return jsonify([dict(zip(['order_id', 'customer_name', 'delivery_date', 'status', 'delivery_zone', 'delivery_type'], row)) for row in rows])


@app.route('/api/delivery/zones')
def delivery_zones():
    rows = query_db('SELECT * FROM delivery_zones')
    return jsonify([dict(zip(['zone_id', 'zone_name', 'boundaries', 'pricing_multiplier'], row)) for row in rows])

@app.route('/api/delivery/cost-calculator', methods=['POST'])
def cost_calculator():
    data = request.json
    zone_id = data.get('zone_id')
    distance = data.get('distance')
    zone = query_db('SELECT pricing_multiplier FROM delivery_zones WHERE zone_id=?', (zone_id,), one=True)
    multiplier = zone[0] if zone else 1
    cost = float(distance) * multiplier * 10  # Adjust multiplier as needed
    return jsonify({'cost': round(cost, 2)})

@app.route('/api/orders/failed')
def failed_orders():
    rows = query_db('SELECT * FROM failed_deliveries ORDER BY failure_date DESC LIMIT 10')
    return jsonify([dict(zip(['order_id', 'failure_date', 'failure_reason', 'retry_count'], row)) for row in rows])

@app.route('/api/customer/preferences', methods=['GET', 'POST'])
def customer_preferences():
    if request.method == 'POST':
        data = request.json
        customer_id = data['customer_id']
        preferred_delivery_type = data['preferred_delivery_type']
        preferred_time_slots = data['preferred_time_slots']
        conn = sqlite3.connect('delivery.db')
        c = conn.cursor()
        c.execute('REPLACE INTO customer_preferences (customer_id, preferred_delivery_type, preferred_time_slots) VALUES (?, ?, ?)',
                  (customer_id, preferred_delivery_type, preferred_time_slots))
        conn.commit()
        conn.close()
        return jsonify({'status': 'success'})
    else:
        customer_id = request.args.get('customer_id')
        pref = query_db('SELECT * FROM customer_preferences WHERE customer_id=?', (customer_id,), one=True)
        if pref:
            return jsonify(dict(zip(['customer_id', 'preferred_delivery_type', 'preferred_time_slots'], pref)))
        return jsonify({})

if __name__ == '__main__':
    app.run(debug=True)
