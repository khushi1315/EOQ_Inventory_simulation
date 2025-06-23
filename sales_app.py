import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

# Load prediction results
@st.cache_data
def load_data():
    return pd.read_csv("predicted_sales.csv")

data = load_data()

st.set_page_config(layout="wide")
st.title("📈 Sales Prediction Dashboard")

# Sidebar filters
store_ids = sorted(data["Store ID"].unique())
product_ids = sorted(data["Product ID"].unique())

store_id = st.sidebar.selectbox("Select Store ID", store_ids)
product_id = st.sidebar.selectbox("Select Product ID", product_ids)

# Filter based on selection
filtered = data[(data["Store ID"] == store_id) & (data["Product ID"] == product_id)]

if filtered.empty:
    st.warning("❌ No data found for this Store ID and Product ID combination.")
else:
    st.subheader(f"📦 Store {store_id}, Product {product_id}")

    st.metric("Predicted Sales", f"{filtered['Prediction'].mean():.2f}")
    st.metric("95% CI Width", f"{(filtered['Upper'] - filtered['Lower']).mean():.2f}")

    # Plot prediction with CI
    st.write("### Prediction with 95% Confidence Interval")
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(filtered["Prediction"].values, label="Prediction", color="blue", marker='o')
    ax.fill_between(range(len(filtered)),
                    filtered["Lower"].values,
                    filtered["Upper"].values,
                    color="skyblue", alpha=0.4, label="95% CI")
    ax.set_xlabel("Time Index")
    ax.set_ylabel("Sales Quantity")
    ax.set_title("Predicted Sales with Confidence Interval")
    ax.grid(True)
    ax.legend()
    st.pyplot(fig)

    # Show alert table
    st.write("### Alert Table")
    st.dataframe(filtered[["Prediction", "Lower", "Upper", "Alert"]].reset_index(drop=True))
