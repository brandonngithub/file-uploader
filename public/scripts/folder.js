// Modal functions
function showModal(type) {
  document.getElementById(`${type}Modal`).classList.add("show");
}

function hideModal(type) {
  document.getElementById(`${type}Modal`).classList.remove("show");
}

// Show rename modal
function showRenameModal(type, id, currentName) {
  const modal = document.getElementById("renameModal");
  const title = modal.querySelector("h2");
  const input = modal.querySelector("#newName");

  title.textContent = `Rename ${type}`;
  input.value = currentName.replace(/\.[^/.]+$/, ""); // Remove extension
  document.getElementById("renameType").value = type;
  document.getElementById("renameId").value = id;

  showModal("rename");
}

// Handle rename form submission
document
  .getElementById("renameForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const type = document.getElementById("renameType").value;
    const id = document.getElementById("renameId").value;
    let newName = document.getElementById("newName").value.trim();
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
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error(err);
    }
  });

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
