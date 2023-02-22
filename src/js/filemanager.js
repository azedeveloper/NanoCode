const fileManager = document.querySelector('.file-manager');
const fileList = fileManager.querySelector('.file-list');
const closeButton = fileManager.querySelector('.close-button');

function toggleFileManager() {
    console.log('afa')
  fileManager.classList.toggle('visible');
}

function populateFileManager() {
  // Use the Tauri `fs` module to read the current directory
  // and display the files and folders in `fileList`.
  
}

// Add event listeners to buttons that should trigger the file manager
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      toggleFileManager();
    }
    
  });