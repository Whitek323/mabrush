import cv2 as cv

cap = cv.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    edges = cv.Canny(gray, 100, 200)

    cv.imshow("Normal", frame)
    cv.imshow("Edges", edges)

    if cv.waitKey(1) == ord('q'):
        break

cap.release()
cv.destroyAllWindows()
