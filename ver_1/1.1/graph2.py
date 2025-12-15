import pandas as pd
import matplotlib.pyplot as plt

# -----------------------------
# รายชื่อไฟล์ (dropdown)
# -----------------------------
files = [
    "./data/0.1-1.csv",
    "./data/0.1-2.csv",
    "./data/0.2-1.csv",
    "./data/0.2-2.csv",
    "./data/0.3-1.csv",
    "./data/0.3-2.csv"
]

print("เลือกไฟล์ที่ต้องการ plot:")
for i, f in enumerate(files):
    print(f"{i+1}. {f}")

choice = int(input("พิมพ์หมายเลข: ")) - 1
filename = files[choice]

print(f"\nกำลัง plot จากไฟล์: {filename}")

# -----------------------------
# โหลด CSV
# -----------------------------
df = pd.read_csv(filename)

# -----------------------------
# เลือกทุกแกน x*, y*
# -----------------------------
cols_to_plot = [
    c for c in df.columns
    if c.startswith("x") or c.startswith("y")
]

print("Plot columns:", cols_to_plot)

# -----------------------------
# Plot
# -----------------------------
plt.figure(figsize=(14, 7))

for col in cols_to_plot:
    plt.plot(df["timestamp"], df[col], label=col)

plt.xlabel("Time (s)")
plt.ylabel("Value")
plt.title(f"Hand Landmarks (X,Y) from {filename}")
plt.legend(
    ncol=6,
    fontsize=8,
    bbox_to_anchor=(1.02, 1),
    loc="upper left"
)
plt.grid(True)
plt.tight_layout()
plt.show()
