import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

# Set page config
st.set_page_config(layout="wide")
st.title("📈 Sales Prediction Dashboard")

# Load data
@st.cache_data
def load_data():
    df = pd.read_csv("predicted_sales.csv")
    df["Store ID"] = df["Store ID"].astype(int)
    df["Product ID"] = df["Product ID"].astype(str)

    # Map Month number to name
    if df["Month"].dtype != "object":
        month_map = {
            1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
            5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
            9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
        }
        df["Month"] = df["Month"].map(month_map)

    # Add Seasonal Spike if missing
    if "Seasonal Spike" not in df.columns:
        if "Seasonality Factors_Festival" in df.columns:
            df["Seasonal Spike"] = df.apply(
                lambda row: "Diwali" if row.get("Seasonality Factors_Festival", 0) == 1
                else "Christmas" if row.get("Seasonality Factors_Holiday", 0) == 1
                else "-", axis=1)
        elif "Seasonality Factors" in df.columns:
            df["Seasonal Spike"] = df["Seasonality Factors"].map({
                "Festival": "Diwali", "Holiday": "Christmas"
            }).fillna("-")
        else:
            df["Seasonal Spike"] = "-"

    return df

df = load_data()

# Sidebar filters
st.sidebar.header("🔎 Filters")
store_ids = sorted(df["Store ID"].unique())
product_ids = sorted(df["Product ID"].unique())

selected_store = st.sidebar.selectbox("Select Store ID", store_ids)
selected_product = st.sidebar.selectbox("Select Product ID", product_ids)

# Filter data
filtered = df[
    (df["Store ID"] == selected_store) &
    (df["Product ID"] == selected_product)
]

if filtered.empty:
    st.warning("❌ No data found for this combination.")
else:
    st.subheader(f"📦 Store {selected_store} | Product {selected_product}")
    st.write("### 📊 Predicted Sales with Confidence Interval")

    # --- Matplotlib Plot (Static) ---
    fig, ax = plt.subplots(figsize=(10, 5))

    # X and Y values
    x_vals = filtered["Month"]
    y_vals = filtered["Prediction"]
    lower = filtered["Lower"]
    upper = filtered["Upper"]

    # Plot prediction line
    ax.plot(x_vals, y_vals, color="blue", marker="o", label="Prediction")

    # Confidence interval fill
    ax.fill_between(x_vals, lower, upper, color="skyblue", alpha=0.4, label="95% CI")

    # Annotate each point with Month + Prediction
    for i in range(len(x_vals)):
        ax.annotate(f"{x_vals.iloc[i]}: {int(y_vals.iloc[i])}", 
                    (x_vals.iloc[i], y_vals.iloc[i]), 
                    textcoords="offset points", 
                    xytext=(0, -12), ha='center', fontsize=9, color="blue")

    ax.set_xlabel("Month")
    ax.set_ylabel("Sales Quantity")
    ax.set_title(f"Sales Forecast - Store {selected_store}, Product {selected_product}")
    ax.grid(True)
    ax.legend()
    plt.tight_layout()

    # Show chart
    st.pyplot(fig)

    # --- Forecast Table ---
    st.write("### 📋 Forecast Summary Table")
    table_df = filtered[[
        "Store ID", "Month", "Prediction", "Lower", "Upper", "Alert", "Seasonal Spike"
    ]].copy()

    table_df.columns = [
        "Store ID", "Month", "Predicted Sales", "Confidence Low",
        "Confidence High", "Is Hot Product", "Seasonal Spike"
    ]

    st.dataframe(table_df.reset_index(drop=True), use_container_width=True)