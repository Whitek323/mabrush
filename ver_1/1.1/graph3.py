import pandas as pd
import matplotlib.pyplot as plt

# -----------------------------
# โหลดข้อมูล
# -----------------------------
filename = "./data/1.csv"
df = pd.read_csv(filename)

# -----------------------------
# เลือก frame
# -----------------------------
row_idx = 0
row = df.iloc[row_idx]

# -----------------------------
# ดึง x,y
# -----------------------------
xs = [row[f"x{i}"] for i in range(21)]
ys = [row[f"y{i}"] for i in range(21)]

# -----------------------------
# MediaPipe hand connections
# -----------------------------
connections = [
    (0,1),(1,2),(2,3),(3,4),
    (0,5),(5,6),(6,7),(7,8),
    (0,9),(9,10),(10,11),(11,12),
    (0,13),(13,14),(14,15),(15,16),
    (0,17),(17,18),(18,19),(19,20)
]

# -----------------------------
# Plot
# -----------------------------
plt.figure(figsize=(6,6))

# วาดเส้น
for a, b in connections:
    plt.plot([xs[a], xs[b]], [ys[a], ys[b]], linewidth=1)

# วาดจุด
plt.scatter(xs, ys, s=30)

# ใส่ label จุด
for i, (x, y) in enumerate(zip(xs, ys)):
    plt.text(
        x,
        y,
        f"{i}\n(x{i}, y{i})",
        fontsize=8,
        ha="center",
        va="bottom"
    )

plt.gca().invert_yaxis()
plt.axis("equal")
plt.title(f"Hand landmarks with labels (frame {row_idx})")
plt.show()
