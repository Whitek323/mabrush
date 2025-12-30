from ultralytics import YOLO
import cv2

model = YOLO('yolov8n')
results = model("img/1.png")
cv2.waitKey(0)