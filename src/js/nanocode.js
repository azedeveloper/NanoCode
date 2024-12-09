const invoke = window.__TAURI__.invoke;
const { save, open } = window.__TAURI__.dialog;
const { readTextFile } = window.__TAURI__.fs;

let currentPath = localStorage.getItem("currentPath"); // Retrieve the last opened file path from local storage

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  lineNumbers: true,
  theme: "material-darker",
  autoIndent: true,
  autoCloseBrackets: true,
});

editor.setSize("100%", "98vh");
editor.setOption("placeholder", "Start typing here...");

editor.on("change", () => {
  updateTitlebar(false);
});

const updateEditorMode = (extension) => {
  const languageName = getLanguageName(extension);
  if (languageName) {
    editor.setOption("mode", languageName);
  }
};

const updateTitlebar = (saved) => {
  const titlebarFilename = document.querySelector(".titlebar-filename");
  if (titlebarFilename) {
    const filename = currentPath ? currentPath.split("/").pop() : "Untitled";
    titlebarFilename.textContent = filename + (saved ? "" : "*");
  }
};

const saveFileContents = async () => {
  try {
    const savePath = currentPath || (await save());
    if (!savePath) return;

    await invoke("save_file", { path: savePath, contents: editor.getValue() });
    currentPath = savePath;
    localStorage.setItem("currentPath", currentPath); // Save the current file path to local storage
    localStorage.setItem("lastSavedContents", editor.getValue());
    updateTitlebar(true);
    const extension = currentPath.split(".").pop();
    updateEditorMode(extension);
  } catch (e) {
    console.error("Error saving file:", e);
  }
};

const readFileContents = async () => {
  try {
    const selectedPath = await open({
      multiple: false,
      title: "Open",
    });
    if (!selectedPath) return;
    const contents = await readTextFile(selectedPath);
    editor.setValue(contents);
    currentPath = selectedPath;
    localStorage.setItem("currentPath", currentPath); // Save the current file path to local storage
    localStorage.setItem("lastSavedContents", contents);
    updateTitlebar(true);
    const extension = currentPath.split(".").pop();
    updateEditorMode(extension);
  } catch (e) {
    console.error("Error opening file:", e);
  }
};

const readFolderContents = async () => {
  try {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Open Folder",
    });

    if (!selectedPath) return;
    currentPath = selectedPath;
    localStorage.setItem("currentPath", currentPath); // Save the current folder path to local storage

    // Update folder name
    updateFolderName();

    populateFileManager();
  } catch (e) {
    console.error("Error opening folder:", e);
  }
};

const populateFileManager = async () => {
  if (!currentPath) return;
  try {
    const files = await invoke("read_dir", { path: currentPath, recursive: false });
    const fileList = document.querySelector(".file-list");
    fileList.innerHTML = ""; // Clear existing file list

    // Update folder name
    updateFolderName();

    files.forEach(file => {
      const li = document.createElement("li");
      const img = document.createElement("img");

      img.src = "assets/img/file/default_file.svg";
      img.alt = "File Icon";
      img.classList.add("file-icon"); 

      li.textContent = file.name;

      if (file.is_dir) {
        li.classList.add("folder");
        img.src = "assets/img/file/default_folder.svg"; 

        // Folder click handler to toggle open/closed state
        li.addEventListener("click", async () => {
          if (li.classList.contains("opened")) {
            li.classList.remove("opened");
            li.querySelectorAll(".nested").forEach(nested => nested.remove());
            img.src = "assets/img/file/default_folder.svg"; // Change back to closed folder icon
          } else {
            li.classList.add("opened");
            img.src = "assets/img/file/default_folder_opened.svg"; // Change to open folder icon

            // Fetch the folder's contents and display them indented
            const nestedFiles = await invoke("read_dir", { path: file.path, recursive: false });
            nestedFiles.forEach(nestedFile => {
              const nestedLi = document.createElement("li");
              const nestedImg = document.createElement("img");

              nestedImg.src = "assets/img/file/default_file.svg";
              nestedImg.alt = "File Icon";
              nestedImg.classList.add("file-icon"); 

              nestedLi.textContent = nestedFile.name;
              nestedLi.classList.add("nested"); // Add a class to style indentation

              if (nestedFile.is_dir) {
                nestedLi.classList.add("folder");
                nestedImg.src = "assets/img/file/default_folder.svg"; 
                nestedLi.addEventListener("click", () => {
                  // Nested folder toggle logic can go here
                });
              } else {
                nestedLi.classList.add("file");
                nestedLi.addEventListener("click", async () => {
                  const contents = await readTextFile(nestedFile.path);
                  editor.setValue(contents);
                  currentPath = nestedFile.path;
                  localStorage.setItem("currentPath", currentPath);
                  updateTitlebar(true);
                  const extension = nestedFile.name.split(".").pop();
                  updateEditorMode(extension);
                });
              }

              nestedLi.prepend(nestedImg);
              li.appendChild(nestedLi); // Add nested file to the parent folder
            });
          }
        });
      } else {
        li.classList.add("file");
        li.addEventListener("click", async () => {
          const contents = await readTextFile(file.path);
          editor.setValue(contents);
          currentPath = file.path;
          localStorage.setItem("currentPath", currentPath);
          updateTitlebar(true);
          const extension = file.name.split(".").pop();
          updateEditorMode(extension);
        });
      }

      li.prepend(img);
      fileList.appendChild(li);
    });
  } catch (e) {
    console.error("Error populating file manager:", e);
  }
};



const updateFolderName = () => {
  const folderNameElement = document.querySelector(".foldername");
  const folderName = currentPath ? currentPath.split(/[/\\]/).pop() : "EXPLORER"; 
  folderNameElement.textContent = folderName;
};


const checkUnsavedChanges = () => {
  const saved = editor.getValue() === localStorage.getItem("lastSavedContents");
  if (!saved) {
    return confirm("You have unsaved changes. Do you want to discard them?");
  }
  return true;
};

window.onbeforeunload = () => {
  if (!checkUnsavedChanges()) {
    return "You have unsaved changes. Are you sure you want to exit?";
  }
};

window.onload = async () => {
  if (currentPath) {
    try {
      const savedContents = await readTextFile(currentPath);
      editor.setValue(savedContents);
      updateTitlebar(true);
      const extension = currentPath.split(".").pop();
      updateEditorMode(extension);
    } catch (e) {
      console.error("Error loading file on startup:", e);
    }
  }

  // Update folder name on startup
  updateFolderName();
};



const fileManager = document.querySelector('.file-manager');
const fileList = fileManager.querySelector('.file-list');


function toggleFileManager() {
  fileManager.classList.toggle('visible');
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveFileContents();
  } else if (e.ctrlKey && e.key === "o") {
    e.preventDefault();
    readFileContents();
  } else if (e.ctrlKey && e.key === "l") {
    e.preventDefault();
    toggleFileManager();
  } else if (e.ctrlKey && e.key === "f") {
    e.preventDefault();
    readFolderContents();
  }
});

function getLanguageName(extension) {
  const languageMap = {
    js: "javascript",
    py: "python",
    java: "text/x-java",
    php: "php",
    cpp: "text/x-c++src",
    cs: "text/x-java",
    swift: "swift",
    go: "go",
    ruby: "ruby",
    kotlin: "text/x-kotlin",
    scala: "text/x-scala",
    ts: "javascript",
    r: "r",
    lua: "lua",
    perl: "perl",
    groovy: "groovy",
    rust: "rust",
    dart: "dart",
    powershell: "powershell",
    scss: "sass",
    html: "html",
    css: "css",
    jsx: "javascript",
    tsx: "javascript",
    coffee: "coffeescript",
    c: "text/x-csrc",
  };

  return languageMap[extension.toLowerCase()] || null;
}
