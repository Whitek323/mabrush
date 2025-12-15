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
# landmark ที่ต้องการ
# -----------------------------
landmarks = [5, 9, 13, 17]

# -----------------------------
# สี
# -----------------------------
color_map = {
    5: "#ff7f0e",
    9: "#2ca02c",
    13: "#d62728",
    17: "#9467bd",
}

plt.figure(figsize=(18, 8))

for i, pos in enumerate(positions, 1):
    filename = mapping[pos]
    df = pd.read_csv(filename)

    plt.subplot(2, 3, i)

    for idx in landmarks:
        x = df[f"x{idx}"]
        y = df[f"y{idx}"]

        plt.plot(
            x,
            y,
            color=color_map[idx],
            linewidth=2,
            label=f"LM {idx}"
        )

    plt.title(f"{pos}\n{filename}", fontsize=16)
    plt.xlabel("x")
    plt.ylabel("y")
    plt.axis("equal")   # สำคัญมาก: scale แกนเท่ากัน
    plt.legend()

plt.tight_layout()
plt.show()
