#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use std::fs;
use std::path::Path;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file, read_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    let mut client = DiscordIpcClient::new("1075814804998074498").unwrap();
    client.connect().unwrap();
    client
        .set_activity(
            activity::Activity::new()
                .state("v0.0.5")
                .assets(activity::Assets::new().large_image("big").large_text("NanoCode")),
        )
        .unwrap();
}

#[tauri::command]
fn save_file(path: String, contents: String) -> Result<(), String> {
    fs::write(path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_dir(path: String, recursive: bool) -> Result<Vec<FileItem>, String> {
    fn visit_dir(path: &Path, recursive: bool, files: &mut Vec<FileItem>) -> Result<(), String> {
        let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let metadata = entry.metadata().map_err(|e| e.to_string())?;
            let file_name = entry.file_name().into_string().unwrap_or_default();
            let file_path = entry.path().to_string_lossy().to_string();

            if metadata.is_dir() {
                files.push(FileItem {
                    name: file_name.clone(),
                    path: file_path.clone(),
                    is_dir: true,
                    children: if recursive {
                        let mut children = Vec::new();
                        visit_dir(&entry.path(), recursive, &mut children)?;
                        Some(children)
                    } else {
                        None
                    },
                });
            } else {
                files.push(FileItem {
                    name: file_name,
                    path: file_path,
                    is_dir: false,
                    children: None,
                });
            }
        }
        Ok(())
    }

    let mut files = Vec::new();
    visit_dir(Path::new(&path), recursive, &mut files)?;
    Ok(files)
}

#[derive(serde::Serialize)]
struct FileItem {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<FileItem>>,
}
