use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn show_notification(
    app: AppHandle,
    title: String,
    body: String
) -> Result<(), String> {
    use tauri::api::notification::Notification;

    // Input sanitization
    let safe_title = title.chars().take(100).collect::<String>();
    let safe_body = body.chars().take(256).collect::<String>();

    Notification::new(&app.config().tauri.bundle.identifier)
        .title(&safe_title)
        .body(&safe_body)
        .show()
        .map_err(|e| format!("Notification failed: {}", e))?;

    Ok(())
}