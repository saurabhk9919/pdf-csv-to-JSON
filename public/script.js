
// Initialize drag and drop
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const btnText = document.getElementById('btnText');
const resultDiv = document.getElementById('result');
const fileNameDisplay = document.getElementById('fileName');
const copyBtn = document.getElementById('copyBtn');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
});

// Handle dropped files
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  fileInput.files = files;
  updateFileName();
}

// Handle file input change
fileInput.addEventListener('change', updateFileName);

function updateFileName() {
  if (fileInput.files.length > 0) {
    const fileName = fileInput.files[0].name;
    fileNameDisplay.textContent = `✅ Selected: ${fileName}`;
    fileNameDisplay.classList.add('animate-slide-in');
  } else {
    fileNameDisplay.textContent = '';
  }
}

// Click on drop zone to open file dialog
dropZone.addEventListener('click', () => fileInput.click());

async function uploadFile() {
  const file = fileInput.files[0];

  if (!file) {
    resultDiv.textContent = '❌ Please select a file first!';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Validate file type
  if (!file.type.includes('pdf') && !file.type.includes('csv') && !file.name.endsWith('.csv') && !file.name.endsWith('.pdf')) {
    resultDiv.textContent = '❌ Error: Please upload a PDF or CSV file only.';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  resultDiv.textContent = '⏳ Uploading and processing...';
  uploadBtn.disabled = true;
  btnText.textContent = 'Processing...';
  copyBtn.classList.add('hidden');

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://pdf-csv-to-json-production.up.railway.app/upload', {
      method: 'POST',
      body: formData,
      timeout: 120000
    });

    const data = await response.json();

    if (!response.ok) {
      resultDiv.textContent = '❌ Error: ' + JSON.stringify(data, null, 2);
      resultDiv.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    resultDiv.textContent = '✅ File uploaded successfully!\n\n' + JSON.stringify(data, null, 2);
    resultDiv.classList.add('animate-slide-in');
    copyBtn.classList.remove('hidden');
    fileInput.value = ''; // Clear input
    fileNameDisplay.textContent = '';

  } catch (error) {
    resultDiv.textContent = '❌ Error: ' + error.message + '\n\nMake sure the file format is valid and try again.';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
    console.error('Upload failed:', error);
  } finally {
    uploadBtn.disabled = false;
    btnText.textContent = 'Upload & Process';
  }
}

// Copy result to clipboard
copyBtn.addEventListener('click', () => {
  const text = resultDiv.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  });
});

// Allow Enter key to upload
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && fileInput.files.length > 0) {
    uploadFile();
  }
});
