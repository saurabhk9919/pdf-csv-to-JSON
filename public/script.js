
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  document.getElementById("result").textContent =
    JSON.stringify(data, null, 2);
}
