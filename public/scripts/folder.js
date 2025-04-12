// DOM Elements
const renameModal = document.getElementById("renameModal");
const renameForm = document.getElementById("renameForm");

// Modal functions
const showModal = (type) => {
  document.getElementById(`${type}Modal`).classList.add("show");
  document.body.style.overflow = "hidden"; // Prevent scrolling
};

const hideModal = (type) => {
  document.getElementById(`${type}Modal`).classList.remove("show");
  document.body.style.overflow = ""; // Re-enable scrolling
};

// Show rename modal with prefilled data
const showRenameModal = (type, id, currentName) => {
  const title = renameModal.querySelector("h2");
  const input = renameModal.querySelector("#newName");

  title.textContent = `Rename ${type}`;
  input.value = currentName.replace(/\.[^/.]+$/, ""); // Remove extension
  document.getElementById("renameType").value = type;
  document.getElementById("renameId").value = id;

  showModal("rename");
  input.focus(); // Focus the input field
};

// Handle rename form submission
const handleRenameSubmit = async (e) => {
  e.preventDefault();

  const type = document.getElementById("renameType").value;
  const id = document.getElementById("renameId").value;
  let newName = document.getElementById("newName").value.trim();

  // Get file extension if renaming a file
  const fileExt =
    type === "file"
      ? `.${document.querySelector(`tr[data-file-id="${id}"] td:nth-child(2)`).textContent.toLowerCase()}`
      : "";

  if (!newName) {
    alert("Please enter a name");
    return;
  }

  // Add extension back for files
  if (type === "file" && !newName.endsWith(fileExt)) {
    newName += fileExt;
  }

  try {
    const response = await fetch(`/${type}/${id}/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newName }),
    });

    if (response.ok) {
      window.location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    alert("Failed to rename");
    console.error("Rename error:", err);
  }
};

// Delete file with confirmation
const deleteFile = async (fileId) => {
  if (!confirm("Are you sure you want to delete this file?")) return;

  try {
    const response = await fetch(`/file/${fileId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      window.location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    alert("Failed to delete file");
    console.error("Delete error:", err);
  }
};

// Event Listeners
renameForm.addEventListener("submit", handleRenameSubmit);

// Close modal when clicking outside content
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    hideModal("rename");
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && renameModal.classList.contains("show")) {
    hideModal("rename");
  }
});
