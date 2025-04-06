
# EOQ_Model.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error

def load_and_preprocess_data():
    # Load data
    df_demand = pd.read_csv("demand_forecasting.csv")
    df_inventory = pd.read_csv("inventory_monitoring.csv")
    df_price = pd.read_csv("pricing_optimization.csv")

    # Drop unnecessary columns
    df_demand = df_demand.drop(["Demand Trend", "Customer Segments"], axis=1)
    df_inventory = df_inventory.drop(["Expiry Date"], axis=1)
    df_price = df_price.drop(["Customer Reviews", "Return Rate (%)"], axis=1)

    # Handle missing values
    df_demand.dropna(subset=['Seasonality Factors', 'External Factors'], inplace=True)

    # Encode categorical data
    label_enc = LabelEncoder()
    df_demand['Seasonality Factors'] = label_enc.fit_transform(df_demand['Seasonality Factors'].astype(str))
    df_demand['External Factors'] = label_enc.fit_transform(df_demand['External Factors'].astype(str))
    df_demand['Promotions'] = label_enc.fit_transform(df_demand['Promotions'].astype(str))

    return df_demand, df_inventory, df_price

def train_model(df_demand):
    X = df_demand.drop(columns=["Sales Quantity", "Date"])
    y = df_demand["Sales Quantity"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)

    return model, X_test, y_pred, mae

def compute_eoq(y_pred, df_price):
    ordering_cost = df_price["Storage Cost"].mean()
    holding_cost = ordering_cost * 0.1

    EOQ_values = np.sqrt((2 * y_pred * ordering_cost) / holding_cost)
    return EOQ_values

def prepare_inventory(X_test, EOQ_values, df_inventory):
    X_test = X_test.copy()
    X_test["EOQ"] = EOQ_values

    reorder_points = df_inventory.set_index(['Product ID', 'Store ID'])['Reorder Point']
    X_test_reset = X_test.reset_index()
    df = pd.merge(X_test_reset, reorder_points, on=['Product ID', 'Store ID'], how='left')
    df = df.set_index(['Product ID', 'Store ID'])

    df["Stock Levels"] = np.random.randint(50, 500, size=len(df))
    df["Supplier Lead Time (days)"] = np.random.randint(5, 15, size=len(df))
    df["EOQ"] = df["EOQ"].round().fillna(1).replace(0, 1).astype(int)
    df["Reorder Point"] = df["Reorder Point"].fillna(df["EOQ"] * 0.5).astype(int)

    return df

def simulate_inventory(df_inventory, steps=10):
    for day in range(steps):
        df_inventory = df_inventory.reset_index()
        df_inventory["Needs_Reorder"] = df_inventory["Stock Levels"] < df_inventory["Reorder Point"]
        df_inventory["Order_Quantity"] = 0
        df_inventory.loc[df_inventory["Needs_Reorder"], "Order_Quantity"] = df_inventory.loc[df_inventory["Needs_Reorder"], "EOQ"]
        df_inventory["Stock Levels"] -= df_inventory["Order_Quantity"]
        df_inventory["Stock Levels"] = df_inventory["Stock Levels"].clip(lower=0)

        avg_demand = df_inventory["EOQ"].median() // 2
        customer_demand = np.random.randint(avg_demand - 5, avg_demand + 5, size=len(df_inventory))
        df_inventory["Stock Levels"] -= customer_demand
        df_inventory["Stock Levels"] = df_inventory["Stock Levels"].clip(lower=0)

        df_inventory = df_inventory.set_index(["Product ID", "Store ID"])

    return df_inventory.reset_index()[["Product ID", "Store ID", "Stock Levels", "Order_Quantity"]]










