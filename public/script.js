
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first!");
    return;
  }

  const resultDiv = document.getElementById("result");
  resultDiv.textContent = "Uploading and processing...";

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://pdf-csv-to-json-production.up.railway.app/upload", {
      method: "POST",
      body: formData,
      timeout: 120000 
    });
  const data = await response.json();

    if (!response.ok) {
      resultDiv.textContent = "Error: " + JSON.stringify(data, null, 2);
      return;
    }

    resultDiv.textContent = "✅ File uploaded successfully!\n\n" + JSON.stringify(data, null, 2);
    fileInput.value = ""; // Clear input
    
  } catch (error) {
    resultDiv.textContent = "❌ Error: " + error.message;
    console.error("Upload failed:", error);
  }
}
