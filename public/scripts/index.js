// DOM Elements
const newMenu = document.getElementById("newMenu");
const renameForm = document.getElementById("renameForm");

// Toggle New menu visibility
function toggleNewMenu() {
  newMenu.classList.toggle("show");
  const button = document.querySelector(".new-button button");
  button.setAttribute("aria-expanded", newMenu.classList.contains("show"));
}

// Close New menu when clicking outside
document.addEventListener("click", (event) => {
  const newButton = document.querySelector(".new-button");
  if (!newButton.contains(event.target)) {
    newMenu.classList.remove("show");
    document
      .querySelector(".new-button button")
      .setAttribute("aria-expanded", "false");
  }
});

// Modal functions
function showModal(type) {
  document.getElementById(`${type}Modal`).classList.add("show");
  newMenu.classList.remove("show");
  document.body.style.overflow = "hidden";
}

function hideModal(type) {
  document.getElementById(`${type}Modal`).classList.remove("show");
  document.body.style.overflow = "";
}

// Navigate to folder on double click
function navigateToFolder(row) {
  const folderId = row.getAttribute("data-folder-id");
  window.location.href = `/folder/${folderId}`;
}

// Delete file with confirmation
async function deleteFile(fileId) {
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
    console.error("Delete file error:", err);
  }
}

// Delete folder with confirmation
async function deleteFolder(folderId) {
  if (
    !confirm(
      "Are you sure you want to delete this folder and all its contents?",
    )
  )
    return;

  try {
    const response = await fetch(`/folder/${folderId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      window.location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    alert("Failed to delete folder");
    console.error("Delete folder error:", err);
  }
}

// Show rename modal with prefilled data
function showRenameModal(type, id, currentName) {
  const title = document.getElementById("renameModalTitle");
  const input = document.getElementById("newName");

  title.textContent = `Rename ${type}`;
  input.value =
    type === "file" ? currentName.replace(/\.[^/.]+$/, "") : currentName;
  document.getElementById("renameType").value = type;
  document.getElementById("renameId").value = id;

  showModal("rename");
  input.focus();
}

// Handle rename form submission
const handleRenameSubmit = async (e) => {
  e.preventDefault();

  const type = document.getElementById("renameType").value;
  const id = document.getElementById("renameId").value;
  let newName = document.getElementById("newName").value.trim();

  if (!newName) {
    alert("Please enter a name");
    return;
  }

  // Add extension back for files
  if (type === "file") {
    const fileExt = document
      .querySelector(`tr[data-file-id="${id}"] td:nth-child(2)`)
      .textContent.toLowerCase();
    if (!newName.endsWith(`.${fileExt}`)) {
      newName += `.${fileExt}`;
    }
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

// Event Listeners
renameForm.addEventListener("submit", handleRenameSubmit);

// Close modal when clicking outside content
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    hideModal("folder");
    hideModal("file");
    hideModal("rename");
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideModal("folder");
    hideModal("file");
    hideModal("rename");
  }
});
