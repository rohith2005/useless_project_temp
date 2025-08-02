const imageUpload = document.getElementById("imageUpload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const shapeResult = document.getElementById("shapeResult");
const burnResult = document.getElementById("burnResult");

imageUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const maxWidth = 500;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      analyzeChapathi();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function analyzeChapathi() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  let minX = width, maxX = 0, minY = height, maxY = 0;
  let blackPixelCount = 0;
  let yellowishPixelCount = 0;
  const totalPixels = width * height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Count black pixels (burn)
      if (gray < 50) blackPixelCount++;

      // Find chapathi edges (non-white)
      if (gray < 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      // Count yellowish-brown (chapathi color) pixels
      if (r > 150 && g > 110 && b < 100) {
        yellowishPixelCount++;
      }
    }
  }

  const detectedWidth = maxX - minX;
  const detectedHeight = maxY - minY;
  const aspectRatio = detectedWidth / detectedHeight;
  const circular = aspectRatio > 0.9 && aspectRatio < 1.1;
  const blackPercent = (blackPixelCount / totalPixels) * 100;
  const yellowPercent = (yellowishPixelCount / totalPixels) * 100;

  // ✅ Check if it's a chapathi based on yellow percent
  if (yellowPercent < 10) {
    shapeResult.textContent = "🔴 Image does not resemble a chapathi (not enough chapathi-colored pixels).";
    shapeResult.style.color = "red";
    burnResult.textContent = "❌ Cannot analyze burn level.";
    burnResult.style.color = "red";
    return;
  }

  // ✅ Circular shape check
  if (circular) {
    shapeResult.textContent = "🟢 Shape is approximately circular.";
    shapeResult.style.color = "green";
  } else {
    shapeResult.textContent = "🔴 Chapathi is not circular.";
    shapeResult.style.color = "red";
  }

  // ✅ Burn check
  if (blackPercent > 2.0) {
    burnResult.textContent = `❌ Burnt chapathi detected (${blackPercent.toFixed(2)}% dark spots).`;
    burnResult.style.color = "red";
  } else {
    burnResult.textContent = `✅ Chapathi looks good (${blackPercent.toFixed(2)}% dark spots).`;
    burnResult.style.color = "green";
  }
}
