use keyring::Entry;
use thiserror::Error;

const SERVICE_NAME: &str = "com.neo.client";
const USERNAME: &str = "neo_user";

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("Keyring error: {0}")]
    Keyring(#[from] keyring::Error),
    #[error("Invalid token: {0}")]
    Validation(String),
}

impl serde::Serialize for AuthError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
pub fn save_session_token(token: String) -> Result<(), String> {
    // Input validation
    if token.is_empty() || token.len() > 2048 {
        return Err("Invalid token".to_string());
    }

    // Save to keyring (secure)
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring error: {}", e))?;
    
    entry.set_password(&token)
        .map_err(|e| format!("Failed to save token: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_session_token() -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring error: {}", e))?;
    
    entry.get_password()
        .map_err(|e| format!("Token not found: {}", e))
}

#[tauri::command]
pub fn clear_session() -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring error: {}", e))?;
    
    entry.delete_password()
        .map_err(|e| format!("Failed to clear token: {}", e))?;

    Ok(())
}