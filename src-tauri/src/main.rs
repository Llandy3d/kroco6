// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{Write, Read};
use std::process::{Command, Stdio};
use std::sync::Mutex;

#[derive(Debug)]
struct Script(Mutex<String>);

fn main() {
  tauri::Builder::default()
    .manage(Script(Default::default()))
    .invoke_handler(tauri::generate_handler![open_run_window, run_script])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn open_run_window(handle: tauri::AppHandle, state: tauri::State<'_, Script>, script: String) -> Result<(), String>{
    let run_window = tauri::WindowBuilder::new(
      &handle,
      "run_window", /* the unique window label */
      tauri::WindowUrl::App("test/run".into())
    ).inner_size(1400.0, 1000.0).build().unwrap();
    run_window.set_title("Kroco Gator").unwrap();

    let mut mtx = state.0.lock().unwrap();
    mtx.clear();
    mtx.push_str(script.as_str());
    println!("{:?}", mtx);

    Ok(())

}


#[tauri::command]
async fn run_script(state: tauri::State<'_, Script>) -> Result<String, String>{
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
        let mtx = state.0.lock().unwrap();
        mtx.clone()
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
        stdin.write_all(script.as_bytes()).expect("Failed to write script.");
    }

    let mut k6_output = String::new();
    if let Some(mut stdout) = child.stdout.take() {
        stdout.read_to_string(&mut k6_output).expect("Failed to read stdout");
    }
    
    let _ = child.wait_with_output().expect("Failed to execute command");
    Ok(k6_output)

}
