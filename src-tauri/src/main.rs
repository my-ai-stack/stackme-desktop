#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;

fn main() {
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    info!("Starting Stackme Desktop App");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            stackme_desktop_lib::get_facts,
            stackme_desktop_lib::add_fact,
            stackme_desktop_lib::add_message,
            stackme_desktop_lib::search_memories,
            stackme_desktop_lib::get_graph,
            stackme_desktop_lib::get_session_history,
            stackme_desktop_lib::add_session_turn,
            stackme_desktop_lib::get_count,
            stackme_desktop_lib::export_data,
            stackme_desktop_lib::clear_session,
            stackme_desktop_lib::clear_all,
            stackme_desktop_lib::start_server,
            stackme_desktop_lib::check_server_health,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}