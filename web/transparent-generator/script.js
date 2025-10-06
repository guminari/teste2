const ratioSelect = document.getElementById('ratio');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const downloadBtn = document.getElementById('download');
const feedback = document.querySelector('.feedback');
const dimensionsText = document.querySelector('.dimensions');
const previewCanvas = document.querySelector('.preview-canvas');

const ratioPresets = {
  '16:9': [1920, 1080],
  '4:3': [1600, 1200],
  '1:1': [1080, 1080],
  '9:16': [1080, 1920]
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function setAspectRatio(width, height) {
  const aspect = width / height;
  previewCanvas.style.setProperty('--aspect', aspect);
}

function updateDimensionsText(width, height) {
  dimensionsText.textContent = `${width} × ${height} px`;
}

function handleRatioChange() {
  const value = ratioSelect.value;
  if (value !== 'custom' && ratioPresets[value]) {
    const [presetWidth, presetHeight] = ratioPresets[value];
    widthInput.value = presetWidth;
    heightInput.value = presetHeight;
  }
  updatePreview();
}

function validateInput() {
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);

  if (!width || !height) {
    feedback.textContent = 'Informe valores válidos para largura e altura.';
    return false;
  }

  if (width < 1 || height < 1) {
    feedback.textContent = 'As dimensões devem ser maiores que zero.';
    return false;
  }

  if (width > 8000 || height > 8000) {
    feedback.textContent = 'O tamanho máximo suportado é 8000 × 8000 pixels.';
    return false;
  }

  feedback.textContent = '';
  return true;
}

function updatePreview() {
  if (!validateInput()) {
    return;
  }
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);

  setAspectRatio(width, height);
  updateDimensionsText(width, height);
}

function downloadTransparentPNG() {
  if (!validateInput()) {
    return;
  }

  const width = clamp(Math.round(Number(widthInput.value)), 1, 8000);
  const height = clamp(Math.round(Number(heightInput.value)), 1, 8000);

  widthInput.value = width;
  heightInput.value = height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const link = document.createElement('a');
  link.download = `transparent_${width}x${height}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  feedback.textContent = 'Arquivo gerado com sucesso!';
  setTimeout(() => {
    feedback.textContent = '';
  }, 2500);
}

ratioSelect.addEventListener('change', handleRatioChange);
widthInput.addEventListener('input', () => {
  ratioSelect.value = 'custom';
  updatePreview();
});
heightInput.addEventListener('input', () => {
  ratioSelect.value = 'custom';
  updatePreview();
});
downloadBtn.addEventListener('click', downloadTransparentPNG);

document.addEventListener('DOMContentLoaded', updatePreview);
