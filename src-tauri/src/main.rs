// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cloud;
mod js;
mod models;
mod operations;

use dirs::config_dir;
use regex::Regex;
use std::fs;
use std::io::{BufRead, BufReader, Read, Write};
use std::path::Path;
use std::process::{Command, Stdio};
use tauri::{Manager, Window};

use crate::operations::ProjectManager;

fn main() {
    let application_state = ApplicationState::default();

    // Initialize the application state's ProjectManager instance
    // to ensure that the underlying projects directory exists
    application_state
        .project_manager
        .initialize()
        .expect("Failed to initialize application state");

    // Initialize the application state's EnvironmentManager instance
    // to ensure that the underlying environment file exists
    application_state
        .environment_manager
        .initialize()
        .expect("Failed to initialize application state");

    tauri::Builder::default()
        .manage(application_state)
        .invoke_handler(tauri::generate_handler![
            get_cloud_tests,
            show_splashscreen,
            close_splashscreen,
            run_script,
            run_script_in_cloud,
            list_projects,
            get_project,
            create_project,
            set_cloud_token,
            get_cloud_token,
            load_environments,
            save_environments,
            create_test,
            list_tests,
            get_test,
            save_test,
            load_project_config,
            save_project_config,
            js::open_project,
            js::load_project_settings,
            js::open_file,
            js::save_file,
            js::save_file_as,
            js::delete_file,
            js::refresh_project,
            js::rename,
            js::create_directory,
            js::delete_directory,
            js::is_k6_version_installed,
            js::install_k6_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn get_cloud_tests(
    state: tauri::State<'_, ApplicationState>,
    project_name: &str,
) -> Result<Vec<models::CloudTest>, String> {
    let project_config = state
        .project_manager
        .load_project_config(project_name)
        .map_err(|e| e.to_string())?;

    if project_config.cloud_token.is_none() || project_config.cloud_project_id.is_none() {
        return Err("missing cloud_token/cloud_project_id config".to_string());
    }
    let cloud_token = project_config.cloud_token.unwrap();
    let cloud_project_id = project_config.cloud_project_id.unwrap();

    let cloud_tests: Vec<models::CloudTest> =
        cloud::get_cloud_tests(&cloud_token, &cloud_project_id)
            .await
            .map_err(|e| e.to_string())?;
    Ok(cloud_tests)
}

#[tauri::command]
async fn close_splashscreen(window: Window) {
    // Close splashscreen
    if let Some(window) = window.get_window("splashscreen") {
        window.close().unwrap();
    }

    // Show main window
    window
        .get_window("main")
        .expect("no window labeled 'main' found")
        .show()
        .unwrap();
}

#[tauri::command]
async fn show_splashscreen(window: Window) {
    // Show splashscreen
    window
        .get_window("splashscreen")
        .expect("no window labeled 'splashscreen' found")
        .show()
        .unwrap();
}

#[tauri::command]
async fn list_projects(
    state: tauri::State<'_, ApplicationState>,
) -> Result<Vec<models::Project>, String> {
    state
        .project_manager
        .list_projects()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_project(
    state: tauri::State<'_, ApplicationState>,
    name: &str,
    description: Option<&str>,
) -> Result<models::Project, String> {
    state
        .project_manager
        .create_project(models::Project::new(name, description))
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_project(
    state: tauri::State<'_, ApplicationState>,
    name: &str,
) -> Result<models::Project, String> {
    state
        .project_manager
        .get_project(name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_project_config(
    state: tauri::State<'_, ApplicationState>,
    project_name: &str,
) -> Result<models::ProjectConfig, String> {
    state
        .project_manager
        .load_project_config(project_name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_project_config(
    state: tauri::State<'_, ApplicationState>,
    project_name: &str,
    project_config: models::ProjectConfig,
) -> Result<(), String> {
    state
        .project_manager
        .save_project_config(project_name, project_config)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_environments(
    state: tauri::State<'_, ApplicationState>,
) -> Result<models::EnvironmentsData, String> {
    state.environment_manager.load().map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_environments(
    state: tauri::State<'_, ApplicationState>,
    environments_data: models::EnvironmentsData,
) -> Result<(), String> {
    state
        .environment_manager
        .save(&environments_data)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_test(
    state: tauri::State<'_, ApplicationState>,
    project_name: &str,
    test: models::Test,
) -> Result<models::Test, String> {
    state
        .project_manager
        .create_test(project_name, test)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_tests(
    state: tauri::State<'_, ApplicationState>,
    project_name: &str,
) -> Result<Vec<models::Test>, String> {
    state
        .project_manager
        .list_tests(project_name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_test(
    state: tauri::State<'_, ApplicationState>,
    project_name: &str,
    test_name: &str,
) -> Result<models::Test, String> {
    state
        .project_manager
        .get_test(project_name, test_name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_test(
    state: tauri::State<'_, ApplicationState>,
    project_name: &str,
    test_name: &str,
    new_content: &str,
) -> Result<(), String> {
    state
        .project_manager
        .save_test(project_name, test_name, new_content)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_script(
    _state: tauri::State<'_, ApplicationState>,
    script: String,
    version: String,
) -> Result<String, String> {
    let command = config_dir()
        .unwrap()
        .join(format!("k6-ui/binaries/k6/{}/k6", version));

    if !command.exists() {
        return Err(format!("k6 version {} is not installed", version));
    }

    println!("Running script using {:?}", command);

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

// ApplicationState holds the state of the application.
//
// It is used to store and expose configuration as well as
// constructs that are used throughout the application's tauri commands
// and life cycle.
struct ApplicationState {
    // The path where the application stores its data
    // pub storage_path: PathBuf,

    // The project manager used to interact with local projects
    // exposing operations such as listing, creating, deleting, etc.
    pub project_manager: operations::LocalProjectManager,

    // The environment manager used to interact with environments
    pub environment_manager: operations::EnvironmentManager,
}

impl ApplicationState {
    pub fn new() -> Self {
        // We obtain the system's configuration directory
        // from the `dirs` crate.
        let config_dir = dirs::config_dir().expect("Failed to get config directory");

        // We create a subdirectory for our application inside
        // of the configuration directory, if it does not already exist.
        let storage_path = Path::new(&config_dir).join("kroco6");
        if !&storage_path.exists() {
            fs::create_dir(&storage_path).expect("Failed to create storage directory");
        }

        Self {
            // storage_path: storage_path.clone(),
            project_manager: operations::LocalProjectManager::new(storage_path.clone()),
            environment_manager: operations::EnvironmentManager::new(storage_path.clone()),
        }
    }

    pub fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
async fn get_cloud_token() -> Result<String, String> {
    Ok(std::env::var(String::from("K6_CLOUD_TOKEN")).unwrap_or(String::from("")))
}

#[tauri::command]
fn set_cloud_token(token: String) -> Result<(), String> {
    std::env::set_var("K6_CLOUD_TOKEN", token);
    Ok(())
}

#[tauri::command]
async fn run_script_in_cloud(script: String, project_id: String) -> Result<String, String> {
    let mut child = Command::new("k6")
        .arg("cloud")
        .arg("-")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .env(
            "K6_CLOUD_TOKEN",
            std::env::var(String::from("K6_CLOUD_TOKEN")).unwrap_or(String::from("")),
        )
        .env("K6_CLOUD_PROJECT_ID", project_id)
        .env("K6_CLOUD_NAME", "kroco6 script.js")
        .spawn()
        .expect("Failed to execute command");

    if let Some(mut stdin) = child.stdin.take() {
        stdin
            .write_all(script.as_bytes())
            .expect("Failed to write script.");
    }

    let re = Regex::new(r"output: (https?://[^\s]+)").unwrap();
    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            let line = line.expect("Failed to read line");
            if let Some(cap) = re.captures(&line) {
                return Ok(cap[1].to_string());
            }
        }
    }

    let _ = child.wait_with_output().expect("Failed to execute command");
    Err("No URL found in output".to_string())
}
