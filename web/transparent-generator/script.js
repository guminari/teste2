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
const MAX_SIZE = 8000;
const MAX_PREVIEW_EDGE = 420;
let isSyncing = false;

function showFeedback(message = '', isError = false) {
  feedback.textContent = message;
  feedback.classList.toggle('error', Boolean(message) && isError);
  feedback.classList.toggle('success', Boolean(message) && !isError);
}

function parseDimensions({ report = true } = {}) {
  const widthRaw = widthInput.value;
  const heightRaw = heightInput.value;

  if (widthRaw === '' || heightRaw === '') {
    if (report) {
      showFeedback('');
    }
    return null;
  }

  const width = Number(widthRaw);
  const height = Number(heightRaw);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    if (report) {
      showFeedback('Use apenas números para largura e altura.', true);
    }
    return null;
  }

  if (width <= 0 || height <= 0) {
    if (report) {
      showFeedback('As dimensões devem ser maiores que zero.', true);
    }
    return null;
  }

  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (report) {
      showFeedback(`O tamanho máximo suportado é ${MAX_SIZE} × ${MAX_SIZE} pixels.`, true);
    }
    return null;
  }

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    if (report) {
      showFeedback('Informe valores inteiros para largura e altura.', true);
    }
    return null;
  }

  if (report) {
    showFeedback('');
  }

  return { width, height };
}

function simplifyRatio(width, height) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const factor = gcd(width, height) || 1;
  return `${Math.round(width / factor)}:${Math.round(height / factor)}`;
}

function setPreviewMetrics(width, height) {
  const aspect = width / height;
  previewCanvas.style.setProperty('--aspect', aspect);

  let previewWidth = MAX_PREVIEW_EDGE;
  let previewHeight = previewWidth / aspect;

  if (previewHeight > MAX_PREVIEW_EDGE) {
    previewHeight = MAX_PREVIEW_EDGE;
    previewWidth = previewHeight * aspect;
  }

  previewCanvas.style.setProperty('--preview-width', `${previewWidth}px`);
  previewCanvas.style.setProperty('--preview-height', `${previewHeight}px`);
  previewCanvas.setAttribute(
    'aria-label',
    `Pré-visualização das dimensões selecionadas: ${width} por ${height} pixels`
  );
}

function updateDimensionsText(width, height) {
  const ratioText = simplifyRatio(width, height);
  dimensionsText.textContent = `${width} × ${height} px • proporção ${ratioText}`;
}

function syncDimension(source) {
  const preset = ratioPresets[ratioSelect.value];
  if (!preset || isSyncing) {
    return;
  }

  const [presetWidth, presetHeight] = preset;
  const ratio = presetWidth / presetHeight;

  isSyncing = true;
  if (source === 'width') {
    const newWidth = Number(widthInput.value);
    if (Number.isFinite(newWidth) && newWidth > 0) {
      heightInput.value = Math.round(newWidth / ratio);
    }
  } else if (source === 'height') {
    const newHeight = Number(heightInput.value);
    if (Number.isFinite(newHeight) && newHeight > 0) {
      widthInput.value = Math.round(newHeight * ratio);
    }
  }
  isSyncing = false;
}

function updatePreview() {
  const dims = parseDimensions();
  if (!dims) {
    return;
  }

  const { width, height } = dims;
  setPreviewMetrics(width, height);
  updateDimensionsText(width, height);
}

function downloadTransparentPNG() {
  const dims = parseDimensions();
  if (!dims) {
    return;
  }

  const width = clamp(dims.width, 1, MAX_SIZE);
  const height = clamp(dims.height, 1, MAX_SIZE);

  widthInput.value = width;
  heightInput.value = height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const filename = `transparent_${width}x${height}.png`;

  const exportData = (blob) => {
    if (!blob) {
      showFeedback('Não foi possível gerar o arquivo. Tente novamente.', true);
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    requestAnimationFrame(() => URL.revokeObjectURL(url));

    showFeedback(`Arquivo “${filename}” gerado com sucesso!`, false);
    setTimeout(() => showFeedback(''), 2500);
  };

  if (canvas.toBlob) {
    canvas.toBlob(exportData, 'image/png');
  } else {
    const dataUrl = canvas.toDataURL('image/png');
    fetch(dataUrl)
      .then((response) => response.blob())
      .then(exportData)
      .catch(() => showFeedback('Não foi possível gerar o arquivo. Tente novamente.', true));
  }
}

function handleRatioChange() {
  const value = ratioSelect.value;
  if (value !== 'custom' && ratioPresets[value]) {
    const [presetWidth, presetHeight] = ratioPresets[value];
    widthInput.value = presetWidth;
    heightInput.value = presetHeight;
    showFeedback('');
  }
  updatePreview();
}

ratioSelect.addEventListener('change', handleRatioChange);
widthInput.addEventListener('input', () => {
  if (ratioSelect.value !== 'custom') {
    syncDimension('width');
  }
  updatePreview();
});
heightInput.addEventListener('input', () => {
  if (ratioSelect.value !== 'custom') {
    syncDimension('height');
  }
  updatePreview();
});
downloadBtn.addEventListener('click', downloadTransparentPNG);

updatePreview();
