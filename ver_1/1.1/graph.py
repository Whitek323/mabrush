import pandas as pd
import matplotlib.pyplot as plt
from matplotlib import font_manager

# ตั้งฟอนต์ไทย
font_path = "./THSarabun.ttf"
font_manager.fontManager.addfont(font_path)
plt.rcParams['font.family'] = font_manager.FontProperties(fname=font_path).get_name()

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

plt.figure(figsize=(18, 8))

for i, pos in enumerate(positions, 1):
    filename = mapping[pos]
    df = pd.read_csv(filename)
    cols = [c for c in df.columns if c != "timestamp"]

    plt.subplot(2, 3, i)
    for col in cols:
        plt.plot(df["timestamp"], df[col], label=col)

    plt.title(f"{pos}\n{filename}", fontsize=16)

plt.tight_layout()
plt.show()
