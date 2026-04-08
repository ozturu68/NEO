// Commands modules
mod commands;

// Re-exports
pub use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            commands::auth::save_session_token,
            commands::auth::get_session_token,
            commands::auth::clear_session,
            commands::notifications::show_notification,
            commands::system::get_platform_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}