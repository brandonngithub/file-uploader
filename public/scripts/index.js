// Toggle New menu
function toggleNewMenu() {
  const menu = document.getElementById("newMenu");
  menu.classList.toggle("show");
}

// Close New menu when clicking outside
document.addEventListener("click", function (event) {
  const newButton = document.querySelector(".new-button");
  const newMenu = document.getElementById("newMenu");

  if (!newButton.contains(event.target)) {
    newMenu.classList.remove("show");
  }
});

// Modal functions
function showModal(type) {
  document.getElementById(`${type}Modal`).classList.add("show");
  document.getElementById("newMenu").classList.remove("show");
}

function hideModal(type) {
  document.getElementById(`${type}Modal`).classList.remove("show");
}

// Navigate to folder on double click
function navigateToFolder(row) {
  const folderId = row.getAttribute("data-folder-id");
  window.location.href = `/folder/${folderId}`;
}

// Delete file
async function deleteFile(fileId) {
  if (confirm("Are you sure you want to delete this file?")) {
    try {
      const response = await fetch(`/file/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload(); // Refresh to show changes
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      alert("Failed to delete file");
      console.error(err);
    }
  }
}

// Delete folder
async function deleteFolder(folderId) {
  if (
    confirm("Are you sure you want to delete this folder and all its contents?")
  ) {
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
      console.error(err);
    }
  }
}

// Show rename modal
function showRenameModal(type, id, currentName) {
  document.getElementById("renameModalTitle").textContent = `Rename ${type}`;
  document.getElementById("newName").value = currentName;
  document.getElementById("renameType").value = type;
  document.getElementById("renameId").value = id;
  document.getElementById("renameModal").classList.add("show");
}

// Handle rename form submission
document
  .getElementById("renameForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const type = document.getElementById("renameType").value;
    const id = document.getElementById("renameId").value;
    const newName = document.getElementById("newName").value.trim();

    if (!newName) {
      alert("Please enter a name");
      return;
    }

    try {
      const response = await fetch(`/${type}/${id}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newName: newName }), // Ensure proper property name
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      alert("Failed to rename");
      console.error(err);
    }
  });
