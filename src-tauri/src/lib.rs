use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Mutex;
use tauri::State;

// API response structures
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse {
    pub status: Option<String>,
    pub id: Option<String>,
    pub content: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FactsResponse {
    pub facts: Vec<String>,
    pub count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResponse {
    pub query: String,
    pub results: Vec<String>,
    pub count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GraphFact {
    pub id: String,
    pub subject: String,
    pub predicate: String,
    pub value: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GraphResponse {
    pub facts: Vec<GraphFact>,
    pub count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryItem {
    pub role: String,
    pub content: String,
    pub metadata: serde_json::Value,
    pub ts: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryResponse {
    pub history: Vec<HistoryItem>,
    pub count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CountResponse {
    pub count: usize,
    pub user_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResponse {
    pub memory: Vec<serde_json::Value>,
    pub graph: Vec<serde_json::Value>,
    pub exported_at: String,
}

// App state to manage the Python server
pub struct AppState {
    pub server_url: Mutex<String>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            server_url: Mutex::new("http://127.0.0.1:8000".to_string()),
        }
    }
}

fn get_python_server_url() -> String {
    // Try to find running server or start one
    "http://127.0.0.1:8000".to_string()
}

fn start_python_server() -> Result<(), String> {
    // Check if server is already running
    let check = reqwest::blocking::get("http://127.0.0.1:8000/health")
        .map(|_| true)
        .unwrap_or(false);

    if check {
        log::info!("Python server already running");
        return Ok(());
    }

    // Start the Python server in background
    let output = Command::new("python")
        .args(["-m", "stackme.server", "--port", "8000"])
        .spawn();

    match output {
        Ok(_) => {
            log::info!("Started Python server");
            // Wait for server to start
            std::thread::sleep(std::time::Duration::from_secs(2));
            Ok(())
        }
        Err(e) => {
            log::error!("Failed to start Python server: {}", e);
            Err(format!("Failed to start server: {}", e))
        }
    }
}

// Tauri commands

#[tauri::command]
pub fn get_facts() -> Result<FactsResponse, String> {
    let url = format!("{}/memory/facts", get_python_server_url());
    let response = reqwest::blocking::get(&url)
        .map_err(|e| e.to_string())?
        .json::<FactsResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn add_fact(content: String) -> Result<ApiResponse, String> {
    let url = format!("{}/memory/facts", get_python_server_url());
    let body = serde_json::json!({
        "content": content,
        "user_id": "default"
    });
    let response = reqwest::blocking::Client::new()
        .post(&url)
        .json(&body)
        .send()
        .map_err(|e| e.to_string())?
        .json::<ApiResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn add_message(content: String) -> Result<ApiResponse, String> {
    let url = format!("{}/memory/messages", get_python_server_url());
    let body = serde_json::json!({
        "content": content,
        "user_id": "default"
    });
    let response = reqwest::blocking::Client::new()
        .post(&url)
        .json(&body)
        .send()
        .map_err(|e| e.to_string())?
        .json::<ApiResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn search_memories(query: String, top_k: Option<usize>) -> Result<SearchResponse, String> {
    let top_k = top_k.unwrap_or(5);
    let url = format!(
        "{}/memory/search?q={}&top_k={}&user_id=default",
        get_python_server_url(),
        urlencoding::encode(&query),
        top_k
    );
    let response = reqwest::blocking::get(&url)
        .map_err(|e| e.to_string())?
        .json::<SearchResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn get_graph(subject: Option<String>) -> Result<GraphResponse, String> {
    let subject_param = subject
        .map(|s| format!("&subject={}", urlencoding::encode(&s)))
        .unwrap_or_default();
    let url = format!(
        "{}/memory/graph?user_id=default{}",
        get_python_server_url(),
        subject_param
    );
    let response = reqwest::blocking::get(&url)
        .map_err(|e| e.to_string())?
        .json::<GraphResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn get_session_history(last_n: Option<usize>) -> Result<HistoryResponse, String> {
    let last_n_param = last_n
        .map(|n| format!("&last_n={}", n))
        .unwrap_or_default();
    let url = format!(
        "{}/session/history?user_id=default{}",
        get_python_server_url(),
        last_n_param
    );
    let response = reqwest::blocking::get(&url)
        .map_err(|e| e.to_string())?
        .json::<HistoryResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn add_session_turn(role: String, content: String) -> Result<ApiResponse, String> {
    let url = format!("{}/session/turn", get_python_server_url());
    let body = serde_json::json!({
        "role": role,
        "content": content,
        "user_id": "default"
    });
    let response = reqwest::blocking::Client::new()
        .post(&url)
        .json(&body)
        .send()
        .map_err(|e| e.to_string())?
        .json::<ApiResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn get_count() -> Result<CountResponse, String> {
    let url = format!("{}/count?user_id=default", get_python_server_url());
    let response = reqwest::blocking::get(&url)
        .map_err(|e| e.to_string())?
        .json::<CountResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn export_data() -> Result<ExportResponse, String> {
    let url = format!("{}/export?user_id=default", get_python_server_url());
    let response = reqwest::blocking::get(&url)
        .map_err(|e| e.to_string())?
        .json::<ExportResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn clear_session() -> Result<ApiResponse, String> {
    let url = format!("{}/session?user_id=default", get_python_server_url());
    let response = reqwest::blocking::Client::new()
        .delete(&url)
        .send()
        .map_err(|e| e.to_string())?
        .json::<ApiResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn clear_all() -> Result<ApiResponse, String> {
    let url = format!("{}/all?user_id=default", get_python_server_url());
    let response = reqwest::blocking::Client::new()
        .delete(&url)
        .send()
        .map_err(|e| e.to_string())?
        .json::<ApiResponse>()
        .map_err(|e| e.to_string())?;
    Ok(response)
}

#[tauri::command]
pub fn start_server() -> Result<String, String> {
    start_python_server()?;
    Ok("Server started".to_string())
}

#[tauri::command]
pub fn check_server_health() -> Result<bool, String> {
    match reqwest::blocking::get("http://127.0.0.1:8000/health") {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}