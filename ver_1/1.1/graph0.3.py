import pandas as pd
import matplotlib.pyplot as plt
from matplotlib import font_manager

# -----------------------------
# ฟอนต์ไทย
# -----------------------------
font_path = "./THSarabun.ttf"
font_manager.fontManager.addfont(font_path)
plt.rcParams['font.family'] = font_manager.FontProperties(
    fname=font_path
).get_name()

# -----------------------------
# mapping ไฟล์
# -----------------------------
mapping = {
    "ซ้าย บน": "./data/0.1-1.csv",
    "ซ้าย ล่าง": "./data/0.1-2.csv",
    "กลาง บน": "./data/0.2-1.csv",
    "กลาง ล่าง": "./data/0.2-2.csv",
    "ขวา บน": "./data/0.3-1.csv",
    "ขวา ล่าง": "./data/0.3-2.csv"
}

positions = [
    "ซ้าย บน",  "กลาง บน",  "ขวา บน",
    "ซ้าย ล่าง", "กลาง ล่าง", "ขวา ล่าง"
]

# -----------------------------
# landmark ที่ไม่เอา
# -----------------------------
exclude_idx = {0,1,2,3, 4, 7, 8, 11, 12, 15, 16, 19, 20}

# -----------------------------
# กำหนดสีต่อ landmark index
# -----------------------------
color_map = {
    5: "#ff7f0e",
    6: "#ffbb78",
    9: "#2ca02c",
    10: "#98df8a",
    13: "#d62728",
    14: "#ff9896",
    17: "#9467bd",
    18: "#c5b0d5"
}

plt.figure(figsize=(18, 8))

for i, pos in enumerate(positions, 1):
    filename = mapping[pos]
    df = pd.read_csv(filename)

    plt.subplot(2, 3, i)

    for col in df.columns:
        if col == "timestamp":
            continue

        axis = col[0]          # x หรือ y
        idx = int(col[1:])     # landmark index

        if idx in exclude_idx:
            continue

        color = color_map.get(idx, "#7f7f7f")  # default เทา

        plt.plot(
            df["timestamp"],
            df[col],
            color=color,
            linewidth=1.5,
            alpha=0.9,
            label=f"{col}"
        )

    plt.title(f"{pos}\n{filename}", fontsize=16)

plt.tight_layout()
plt.show()
