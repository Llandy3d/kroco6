use std::io::Write;
use std::{fs, io, path::Path};

use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::{api::dialog::blocking::FileDialogBuilder, Runtime};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum TestKind {
    Script,
    Blocks,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "type")]
pub enum OpenProjectResult {
    Cancelled,
    #[serde(rename_all = "camelCase")]
    ProjectOpened {
        project: Project,
    },
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "type")]
pub enum ProjectEntry {
    #[serde(rename_all = "camelCase")]
    File { kind: TestKind, path: String },
    #[serde(rename_all = "camelCase")]
    Directory {
        path: String,
        entries: Vec<ProjectEntry>,
    },
}

fn to_test_kind(ext: &std::ffi::OsStr) -> Option<TestKind> {
    if ext == "js" {
        return Some(TestKind::Script);
    }

    if ext == "blk6" {
        return Some(TestKind::Blocks);
    }

    None
}

fn load_project_dirs(path: &Path) -> io::Result<ProjectEntry> {
    let mut entries = vec![];

    for entry in path.read_dir()? {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            entries.push(load_project_dirs(&path)?);

            continue;
        }

        let path = path.to_str().unwrap().to_string();

        let kind = std::path::Path::new(&path)
            .extension()
            .and_then(to_test_kind);

        match kind {
            Some(kind) => {
                entries.push(ProjectEntry::File { kind, path });
            }
            None => {}
        }
    }

    Ok(ProjectEntry::Directory {
        path: path.to_str().unwrap().to_string(),
        entries,
    })
}

#[tauri::command]
pub async fn open_project<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
) -> Result<OpenProjectResult, String> {
    let path: Option<std::path::PathBuf> = FileDialogBuilder::new().pick_folder();

    match path {
        Some(path) => refresh_project(app, window, path.to_str().unwrap().to_string())
            .await
            .map(|project| OpenProjectResult::ProjectOpened { project }),
        None => Ok(OpenProjectResult::Cancelled),
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    root: String,
    directory: ProjectEntry,
    settings: ProjectSettings,
}

#[tauri::command]
pub async fn refresh_project<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    root: String,
) -> Result<Project, String> {
    let path = std::path::Path::new(&root);
    let directory = load_project_dirs(path).map_err(|e| e.to_string())?;
    let settings = load_project_settings(app, window, root.clone()).await?;

    Ok(Project {
        root,
        directory,
        settings,
    })
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenFileResult {
    path: String,
    content: String,
}

#[tauri::command]
pub async fn open_file<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    path: String,
) -> Result<OpenFileResult, String> {
    let path = std::path::Path::new(&path);

    let content = fs::read_to_string(path).map_err(|err| {
        format!(
            "Unable to read file at '{}': {}",
            path.to_string_lossy(),
            err
        )
    })?;

    Ok(OpenFileResult {
        path: path.to_str().unwrap().to_string(),
        content,
    })
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "type")]
pub enum SaveResponse {
    #[serde(rename_all = "camelCase")]
    Cancelled,
    #[serde(rename_all = "camelCase")]
    Saved { path: String, project: Project },
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveFileParams {
    root: String,
    path: String,
    content: String,
}

#[tauri::command]
pub async fn save_file<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    root: String,
    path: String,
    content: String,
) -> Result<SaveResponse, String> {
    fs::write(path.clone(), content).map_err(|err| format!("Failed to save file: {}", err))?;

    let project = refresh_project(app, window, root).await?;

    Ok(SaveResponse::Saved { path, project })
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveFileAsParams {
    kind: TestKind,
    file_name: String,
    content: String,
}

#[tauri::command]
pub async fn save_file_as<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    root: String,
    kind: TestKind,
    file_name: String,
    content: String,
) -> Result<SaveResponse, String> {
    let builder = FileDialogBuilder::new().set_file_name(&file_name);

    let builder = match kind {
        TestKind::Blocks => builder.add_filter("k6 Blocks Test", &["blk6"]),
        TestKind::Script => builder.add_filter("Script", &["js"]),
    };

    let path = builder.save_file();

    match path {
        Some(path) => {
            fs::write(path.clone(), content)
                .map_err(|err| format!("Failed to save file: {}", err))?;

            let project = refresh_project(app, window, root).await?;

            Ok(SaveResponse::Saved {
                path: path.to_str().unwrap().to_string(),
                project,
            })
        }
        None => Ok(SaveResponse::Cancelled),
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteFileResult {
    project: Project,
}

#[tauri::command]
pub async fn delete_file<R: Runtime>(
    _app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    root: String,
    path: String,
) -> Result<DeleteFileResult, String> {
    fs::remove_file(path.clone()).map_err(|err| format!("Failed to create file: {}", err))?;

    let project = refresh_project(_app, window, root).await?;

    Ok(DeleteFileResult { project })
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameResult {
    path: String,
}

#[tauri::command]
pub async fn rename<R: Runtime>(
    _app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    from: String,
    to: String,
) -> Result<RenameResult, String> {
    fs::rename(from, to.clone()).map_err(|err| format!("Failed to rename file: {}", err))?;

    let _ = window.emit("files_changed", {});

    Ok(RenameResult { path: to })
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateResult {
    path: String,
    project: Project,
}

#[tauri::command]
pub async fn create_directory<R: Runtime>(
    _app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    root: String,
    path: String,
) -> Result<CreateResult, String> {
    fs::create_dir(path.clone()).map_err(|err| format!("Failed to create directory: {}", err))?;

    let project = refresh_project(_app, window, root).await?;

    Ok(CreateResult { path, project })
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteDirectoryResult {
    path: String,
    project: Project,
}

#[tauri::command]
pub async fn delete_directory<R: Runtime>(
    _app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    root: String,
    path: String,
) -> Result<DeleteDirectoryResult, String> {
    fs::remove_dir_all(path.clone()).map_err(|err| format!("Failed to create file: {}", err))?;

    let project = refresh_project(_app, window, root).await?;

    Ok(DeleteDirectoryResult { path, project })
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CLISettings {
    version: String,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSettings {
    k6: CLISettings,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "type")]
pub enum LoadProjectSettingsResult {
    #[serde(rename_all = "camelCase")]
    Default,
    #[serde(rename_all = "camelCase")]
    Custom { settings: ProjectSettings },
}

#[tauri::command]
pub async fn load_project_settings<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    root: String,
) -> Result<ProjectSettings, String> {
    let exists = Path::new(&format!("{}/k6.json", root)).exists();

    if !exists {
        return Ok(ProjectSettings {
            k6: CLISettings {
                version: "v0.49.0".to_string(),
            },
        });
    }

    let settings = fs::read_to_string(format!("{}/k6.json", root))
        .map_err(|err| format!("Failed to read project settings at '{}': {}", root, err))?;

    let settings = serde_json::from_str::<ProjectSettings>(settings.as_str())
        .map_err(|err| format!("Failed to parse project settings at '{}': {}", root, err))?;

    Ok(settings)
}

#[tauri::command]
pub async fn is_k6_version_installed<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    version: String,
) -> Result<bool, String> {
    let binary_path = dirs::config_dir()
        .unwrap()
        .join(format!("k6-ui/binaries/k6/{}/k6", version));

    Ok(binary_path.is_file())
}

#[tauri::command]
pub async fn install_k6_version<R: Runtime>(
    _app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    version: String,
    name: String,
    url: String,
) -> Result<(), String> {
    let config_dir = dirs::config_dir().unwrap().join("k6-ui");

    let binary_dir = config_dir.join(format!("binaries/k6/{}", version));
    let target_bin_path = binary_dir.join("k6");

    if target_bin_path.is_file() {
        return Ok(());
    }

    let temp_dir = tempdir::TempDir::new("k6-ui")
        .map_err(|err| format!("Failed to create temp dir: {}", err))?;
    let temp_dir = temp_dir.path();

    fs::create_dir_all(&temp_dir).map_err(|err| format!("Failed to create temp dir: {}", err))?;

    let temp_file = temp_dir.join("k6.tar.gz");

    println!("Downloading from {:?} as {:?}", url, temp_file);

    let response = reqwest::get(&url)
        .await
        .map_err(|err| format!("Failed to download k6: {}", err))?;
    let mut file = fs::File::create(&temp_file)
        .map_err(|err| format!("Failed to create temp file: {}", err))?;

    let mut stream = response.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|err| format!("Failed to download k6: {}", err))?;

        file.write_all(&chunk)
            .map_err(|err| format!("Failed to write to temp file: {}", err))?;
    }

    let tar = std::process::Command::new("tar")
        .arg("-xzf")
        .arg(&temp_file)
        .arg("-C")
        .arg(&temp_dir)
        .output()
        .map_err(|err| format!("Failed to extract k6: {}", err))?;

    if !tar.status.success() {
        return Err(format!(
            "Failed to extract k6: {}",
            String::from_utf8_lossy(&tar.stderr)
        ));
    }

    let extracted_bin_dir = temp_dir.join(name);
    let extracted_bin_path = extracted_bin_dir.join("k6");

    println!("Extracted binary to {:?}", extracted_bin_path);
    println!("Copying binary to {:?}", target_bin_path);

    fs::create_dir_all(&binary_dir)
        .map_err(|err| format!("Failed to create binary dir: {}", err))?;
    fs::copy(extracted_bin_path, target_bin_path.clone())
        .map_err(|err| format!("Failed to copy k6 binary: {}", err))?;

    println!("Binary copied to {:?}", target_bin_path);
    println!("Running 'k6 version'...");

    let test = std::process::Command::new(&target_bin_path)
        .arg("version")
        .output()
        .map_err(|err| format!("Failed to run k6: {}", err))?;

    if !test.status.success() {
        return Err(format!(
            "Failed to run k6: {}",
            String::from_utf8_lossy(&test.stderr)
        ));
    }

    println!("Installed k6 version {:?} successfully", version);

    let _ = window.emit("k6_installed", version);

    Ok(())
}
