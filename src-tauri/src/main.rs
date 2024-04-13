// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod operations;
mod cloud;

use core::fmt;
use std::ffi::OsStr;
use std::fs;
use std::io::{Read, Write, BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{Manager, Window};
use regex::Regex;
use tokio::task;
use sysinfo::System;

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
            open_run_window,
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
            open_browser,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn get_cloud_tests(state: tauri::State<'_, ApplicationState>, project_name: &str) -> Result<Vec<models::CloudTest>, String> {
    let project_config = state
        .project_manager
        .load_project_config(project_name)
        .map_err(|e| e.to_string())?;

    if project_config.cloud_token.is_none() || project_config.cloud_project_id.is_none() {
        return Err("missing cloud_token/cloud_project_id config".to_string());
    }
    let cloud_token = project_config.cloud_token.unwrap();
    let cloud_project_id = project_config.cloud_project_id.unwrap();

    let cloud_tests: Vec<models::CloudTest> = cloud::get_cloud_tests(&cloud_token, &cloud_project_id)
        .await
        .map_err(|e| {
            e.to_string()
        })?;
    Ok(cloud_tests)
}

#[tauri::command]
async fn open_browser() {
    let mut browser_command = open::with_command("https://grafana.com", "Google Chrome");
    browser_command.arg("--new").args(["--args", "--user-data-dir=/tmp/kroco6", "--ignore-certificate-errors-spki-list=pXWvAFIlMGj9EcIWKFJOpLkB6v0xCWDmz4k4T/sdu6E=", "--proxy-server=http://localhost:8080", "--hide-crash-restore-bubble"]);

    let mut sys = System::new();
    sys.refresh_processes();

    let mut chrome_pids = vec![];
    for (pid, process) in sys.processes() {
        if process.name().contains("Google Chrome") {
            chrome_pids.push(pid.as_u32());
        }
    }

    task::spawn_blocking(move || {
        browser_command.spawn().expect("Failed to start browser");

        let new_chrome_pid = 'outer: loop {
            sys.refresh_processes();
            for (pid, process) in sys.processes() {
                if process.name() == "Google Chrome" && !chrome_pids.contains(&pid.as_u32()) {
                        break 'outer pid;
                }
            }
            std::thread::sleep(Duration::from_secs(1));
        };

        println!("FINALLY FOUND CHROME: {}", new_chrome_pid);
        println!("Sleeping for 10 secs and then killing");
        let mut x = 10;
        loop {
            if x == 0 {
                break;
            }
            x -= 1;
            println!("{}", x);
            std::thread::sleep(Duration::from_secs(1));
        }

        if let Some(process) = sys.process(*new_chrome_pid) {
            process.kill();
        }
    });


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
async fn delete_test(
    state: tauri::State<'_, ApplicationState>,
    project_name: &str,
    test_name: &str,
) -> Result<(), String> {
    state
        .project_manager
        .delete_test(project_name, test_name)
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

    // Legacy: the script to run
    script: Mutex<String>,
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
            script: Mutex::new(String::new()),
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
