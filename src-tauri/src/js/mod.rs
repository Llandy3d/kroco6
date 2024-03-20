use std::{fs, io, path::Path};

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
}

#[tauri::command]
pub async fn refresh_project<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    root: String,
) -> Result<Project, String> {
    let path = std::path::Path::new(&root);
    let directory = load_project_dirs(path).map_err(|e| e.to_string())?;

    Ok(Project { root, directory })
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
    Saved { path: String },
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveFileParams {
    path: String,
    content: String,
}

#[tauri::command]
pub async fn save_file<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    params: SaveFileParams,
) -> Result<SaveResponse, String> {
    fs::write(params.path.clone(), params.content)
        .map_err(|err| format!("Failed to save file: {}", err))?;

    Ok(SaveResponse::Saved { path: params.path })
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
    _app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    params: SaveFileAsParams,
) -> Result<SaveResponse, String> {
    let builder = FileDialogBuilder::new().set_file_name(&params.file_name);

    let builder = match params.kind {
        TestKind::Blocks => builder.add_filter("k6 Blocks Test", &["blk6"]),
        TestKind::Script => builder.add_filter("Script", &["js"]),
    };

    let path = builder.save_file();

    match path {
        Some(path) => {
            fs::write(path.clone(), params.content)
                .map_err(|err| format!("Failed to save file: {}", err))?;

            let _ = window.emit("files_changed", {});

            Ok(SaveResponse::Saved {
                path: path.to_str().unwrap().to_string(),
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
#[serde(rename_all = "kebab-case", tag = "type")]
pub enum LoadProjectSettingsResult {
    #[serde(rename_all = "camelCase")]
    Default,
    #[serde(rename_all = "camelCase")]
    Custom { settings: String },
}

#[tauri::command]
pub async fn load_project_settings<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    root: String,
) -> Result<LoadProjectSettingsResult, String> {
    let exists = Path::new(&format!("{}/k6.json", root)).exists();

    if !exists {
        return Ok(LoadProjectSettingsResult::Default);
    }

    let settings = fs::read_to_string(format!("{}/k6.json", root))
        .map_err(|err| format!("Failed to read project settings at '{}': {}", root, err))?;

    Ok(LoadProjectSettingsResult::Custom { settings })
}
