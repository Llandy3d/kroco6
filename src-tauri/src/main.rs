// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod operations;

use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Mutex;
use tauri::Error;


fn main() {
    let application_state = ApplicationState::default();
    application_state.project_manager.initialize().expect("Failed to initialize application state");

    tauri::Builder::default()
        .manage(application_state)
        .invoke_handler(tauri::generate_handler![open_run_window, run_script, list_projects])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn open_run_window(
    handle: tauri::AppHandle,
    state: tauri::State<'_, ApplicationState>,
    script: String,
) -> Result<(), String> {
    let run_window = tauri::WindowBuilder::new(
        &handle,
        "run_window", /* the unique window label */
        tauri::WindowUrl::App("test/run".into()),
    )
    .inner_size(1400.0, 1000.0)
    .build()
    .unwrap();
    run_window.set_title("Kroco Gator").unwrap();

    let mut state_script = state.script.lock().unwrap();
    state_script.clear();
    state_script.push_str(script.as_str());
    println!("{:?}", state_script);

    Ok(())
}

#[tauri::command]
async fn list_projects(state: tauri::State<'_, ApplicationState>) -> Result<Vec<models::Project>, String> {
    state.project_manager.list_projects()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_script(state: tauri::State<'_, ApplicationState>) -> Result<String, String> {
    // let script = r#"

    // import http from 'k6/http';
    // import { sleep } from 'k6';

    // export const options = {
    //   vus: 1,
    //   duration: '2s',
    // };

    // export default function () {
    //   http.get('http://test.k6.io');
    //   sleep(1);
    // }
    // "#;

    let script = {
        let state_script = state.script.lock().unwrap();
        state_script.clone()
    };

    // TODO: make it toggable
    std::env::set_var("K6_WEB_DASHBOARD", "true");
    let mut child = Command::new("k6")
        .arg("run")
        .arg("-")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to execute command");

    if let Some(mut stdin) = child.stdin.take() {
        stdin
            .write_all(script.as_bytes())
            .expect("Failed to write script.");
    }

    let mut k6_output = String::new();
    if let Some(mut stdout) = child.stdout.take() {
        stdout
            .read_to_string(&mut k6_output)
            .expect("Failed to read stdout");
    }

    let _ = child.wait_with_output().expect("Failed to execute command");
    Ok(k6_output)
}

struct ApplicationState {
    pub storage_path: PathBuf,
    pub project_manager: operations::LocalProjectManager,

    script: Mutex<String>
}

impl ApplicationState {
    pub fn new() -> Self {
        let config_dir = dirs::config_dir().expect("Failed to get config directory");
        let storage_path = Path::new(&config_dir).join("kroco6");
        if !&storage_path.exists() {
            fs::create_dir(&storage_path).expect("Failed to create storage directory");
        }

        Self {
            storage_path: storage_path.clone(),
            project_manager: operations::LocalProjectManager::new(storage_path),
            script: Mutex::new(String::new())
        }
    }

    pub fn default() -> Self {
        Self::new()
    }
}
