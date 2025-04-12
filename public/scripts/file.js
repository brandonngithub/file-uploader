async function deleteFile(fileId) {
  if (confirm("Are you sure you want to delete this file?")) {
    try {
      const response = await fetch(`/file/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.href = "/?success=File deleted successfully";
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
