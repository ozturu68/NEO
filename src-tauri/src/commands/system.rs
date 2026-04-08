use serde::Serialize;

#[derive(Serialize)]
pub struct PlatformInfo {
    os: String,
    arch: String,
    version: String,
}

#[tauri::command]
pub fn get_platform_info() -> Result<PlatformInfo, String> {
    Ok(PlatformInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}