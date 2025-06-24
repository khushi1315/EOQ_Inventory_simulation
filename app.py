# from flask import Flask, render_template, jsonify
# from EOQ_model import load_and_preprocess_data, train_model, simulate_inventory, prepare_inventory,compute_eoq # 
# import pandas as pd

# app = Flask(__name__)



# @app.route('/store-analysis')
# def store_analysis():
#     return render_template('store-analysis.html')
# @app.route('/get_store_ids')
# def get_store_ids():
#     inventory_df = pd.read_csv("inventory_monitoring.csv")
#     store_ids = sorted(inventory_df["Store ID"].unique().tolist())
#     return jsonify(store_ids)



# @app.route('/simulate')
# def simulate():
#     try:
#         # Load and preprocess data
#         df_demand, df_inventory,df_price = load_and_preprocess_data()

#         # Run EOQ prediction
#         model, X_test, y_pred, mae = train_model(df_demand)

#         # Simulate inventory based on EOQ
#         EOQ_values = compute_eoq(y_pred, df_price)
#         df_inv_ready = prepare_inventory(X_test, EOQ_values, df_inventory)
#         result_df = simulate_inventory(df_inv_ready)


#         # Convert result DataFrame to JSON and send to frontend
#         return jsonify(result_df.to_dict(orient='records'))

#     except Exception as e:
#         return jsonify({"error": str(e)})

# if __name__ == '__main__':
#     app.run(debug=True) 




from flask import Flask, render_template, jsonify
from EOQ_model import load_and_preprocess_data, train_model, simulate_inventory, prepare_inventory,compute_eoq # 
import pandas as pd

app = Flask(__name__)

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
    return "COMING SOON";
@app.route('/salespredictions')
def sales_prediction():
    return "COMING SOON";
@app.route('/business-reports')
def business_reports():
    return "COMING SOON";

@app.route('/get_store_ids')
def get_store_ids():
    inventory_df = pd.read_csv("inventory_monitoring.csv")
    store_ids = sorted(inventory_df["Store ID"].unique().tolist())
    return jsonify(store_ids)


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

if __name__ == '__main__':
    app.run(debug=True)
