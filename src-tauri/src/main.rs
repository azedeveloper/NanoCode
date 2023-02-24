#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use discord_rich_presence::{DiscordIpc, DiscordIpcClient, activity};
use std::fs;

fn main() {
    // Initialize Discord Rich Presence
    let mut client = DiscordIpcClient::new("1075814804998074498").unwrap();
    client.connect().unwrap();
    client.set_activity(activity::Activity::new()
    .state("v0.0.4")
    .assets(activity::Assets::new()
    .large_image("big")
    .large_text("NanoCode"),)
    ).unwrap();

    // Start Tauri application
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn save_file(path: String, contents: String) {
    fs::write(path, contents).unwrap();
}