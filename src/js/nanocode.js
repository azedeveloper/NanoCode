/****************************************************************************************************************************************************************
*
*  Copyright (c) AzE. All rights reserved.                                                                                                                    
*                                                                                                                                                             
*  This code is licensed for non-commercial use only. You may not publish, distribute, sublicense, and/or sell copies of the software for commercial purposes.
*                                                                                                                                                             
*
****************************************************************************************************************************************************************/

const invoke = window.__TAURI__.invoke;
const { save, open } = window.__TAURI__.dialog;
const { readTextFile } = window.__TAURI__.fs;

let currentPath = localStorage.getItem("currentPath"); // Retrieve the last opened file path from local storage

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  lineNumbers: true,
  theme: "material-darker",
});

editor.setSize("100%", "98vh");
editor.setOption("placeholder", "Start typing here..");

editor.on("change", () => {
  updateTitlebar(false);
});

const updateEditorMode = (extension) => {
  const languageName = getLanguageName(extension);
  if (languageName) {
    console.log('Set the language name to ' + languageName)
    editor.setOption("mode", languageName);
  }
};

const updateTitlebar = (saved) => {
  const titlebarFilename = document.querySelector(".titlebar-filename");
  if (titlebarFilename) {
    const filename = currentPath ? currentPath.split("/").pop() : "";
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
    updateTitlebar(true);
    const extension = currentPath.split(".").pop();
    updateEditorMode(extension);
  } catch (e) {
    console.error(e);
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
    updateTitlebar(true);
    const extension = currentPath.split(".").pop();
    updateEditorMode(extension);
  } catch (e) {
    console.log(e);
  }
};

const checkFileSaved = async () => {
  if (!currentPath) {
    await readFileContents();
    updateTitlebar(true);
    const extension = currentPath.split(".").pop();
    updateEditorMode(extension);
    console.log(extension)
    return;
  }

  try {
    const savedContents = await readTextFile(currentPath);
    const currentContents = editor.getValue();
    const saved = savedContents === currentContents;
    updateTitlebar(saved);
    const extension = currentPath.split(".").pop();
    updateEditorMode(extension);
  } catch (e) {
    console.log(e);
  }
};

// Check if there is a previously opened file in local storage and open it
window.onload = async () => {
  if (currentPath) {
    try {
      const savedContents = await readTextFile(currentPath);
      editor.setValue(savedContents);
      updateTitlebar(true);
      const extension = currentPath.split(".").pop();
      updateEditorMode(extension);
    } catch (e) {
      console.log(e);
    }
  }
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveFileContents();
  } else if (e.ctrlKey && e.key === "o") {
    e.preventDefault();
    readFileContents();
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
    html: "htmlmixed",
    css: "css",
    jsx: "javascript",
    tsx: "javascript",
    coffee: "coffeescript",
    c: "text/x-csrc"
  };

  return languageMap[extension.toLowerCase()] || null;
}
