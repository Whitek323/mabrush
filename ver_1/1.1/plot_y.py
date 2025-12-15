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

target_idx = {5, 9, 13, 17}

color_map = {
    5: "#ff7f0e",
    9: "#2ca02c",
    13: "#d62728",
    17: "#9467bd",
}

plt.figure(figsize=(18, 8))

for i, pos in enumerate(positions, 1):
    df = pd.read_csv(mapping[pos])

    plt.subplot(2, 3, i)

    for col in df.columns:
        if col == "timestamp":
            continue

        axis = col[0]
        idx = int(col[1:])

        # ✅ ดูเฉพาะแกน y
        if axis != "y":
            continue

        if idx not in target_idx:
            continue

        plt.plot(
            df["timestamp"],
            df[col],
            color=color_map[idx],
            linewidth=2,
            label=f"y{idx}"
        )

    plt.title(f"{pos}\n{mapping[pos]}", fontsize=16)
    plt.ylabel("ตำแหน่งแกน Y")
    plt.legend()

plt.tight_layout()
plt.show()
