use crate::operations;
use crate::traits::{Load, Save};
use serde::{Deserialize, Serialize};
use serde_json::{from_reader, Error as SerdeError};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use thiserror::Error;

pub const DEFAULT_STATE_FILENAME: &str = "state.json";

pub fn application_directory() -> Result<PathBuf, Error> {
    let system_config_dir = dirs::config_dir().ok_or(Error::NotFound)?;
    Ok(system_config_dir.join(DEFAULT_CONFIG_FOLDER))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewState {
    pub config: Config,
}

impl Default for NewState {
    fn default() -> Self {
        Self {
            config: Config::default(),
        }
    }
}

impl NewState {
    pub fn load_or_create(filepath: PathBuf) -> Result<Self, Error> {
        if filepath.exists() {
            Self::load(filepath)
        } else {
            let state = Self::default();
            state.save(filepath.clone())?;
            Ok(state)
        }
    }

    pub fn register_project(&mut self, project_path: PathBuf) {
        self.config.tracked_project_paths.push(project_path);
    }
}

// impl Default for NewState {
//     fn default() -> Self {
//         Self {
//             project_paths: vec![],
//         }
//     }
// }

impl Save<NewState> for NewState {
    fn save(&self, filepath: PathBuf) -> Result<(), Error>
    where
        Self: Sized,
    {
        let file = fs::File::create(filepath)?;
        serde_json::to_writer_pretty(file, self)?;
        Ok(())
    }
}

impl Load<NewState> for NewState {
    fn load(filepath: PathBuf) -> Result<Self, Error>
    where
        Self: Sized,
    {
        let file = fs::File::open(&filepath)?;
        from_reader(file).map_err(Error::from)
    }
}

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("serde error: {0}")]
    Serde(#[from] SerdeError),

    #[error("resource not found")]
    NotFound,

    #[error("unknown data store error")]
    Unknown,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectConfig {
    // The project name used to identify the project
    name: String,

    // The user defined description of the project
    description: String,

    // The project id used to identify the project in the cloud
    cloud_project_id: Option<String>,
}

// Config holds the configuration of the application.
#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    // The paths of the projects that the application is aware of
    pub tracked_project_paths: Vec<PathBuf>,

    // The cloud token used to authenticate with the cloud API
    pub cloud_token: Option<String>,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            tracked_project_paths: vec![],
            cloud_token: None,
        }
    }
}

impl Config {
    // new creates a new configuration with the given cloud token.
    pub fn new(cloud_token: Option<&str>) -> Self {
        Self {
            tracked_project_paths: vec![],
            cloud_token: cloud_token.map(|s: &str| s.to_string()),
        }
    }

    pub fn load_or_create(filepath: PathBuf) -> Result<Self, Error> {
        if filepath.exists() {
            Self::load(filepath)
        } else {
            let state = Self::default();
            state.save(filepath.clone())?;
            Ok(state)
        }
    }
}

impl Save<Config> for Config {
    fn save(&self, filepath: PathBuf) -> Result<(), Error>
    where
        Self: Sized,
    {
        let file = fs::File::create(filepath)?;
        serde_json::to_writer_pretty(file, self)?;
        Ok(())
    }
}

impl Load<Config> for Config {
    fn load(filepath: PathBuf) -> Result<Self, Error>
    where
        Self: Sized,
    {
        let file = fs::File::open(&filepath)?;
        from_reader(file).map_err(Error::from)
    }
}

// DEFAULT_CONFIG_FOLDER is the name of the directory where the application
// stores its configuration file.
const DEFAULT_CONFIG_FOLDER: &str = "kroco6";

// DEFAULT_CONFIG_FILE is the name of the configuration file.
pub const DEFAULT_CONFIG_FILE: &str = "config.json";

// ApplicationState holds the state of the application.
//
// It is used to store and expose configuration as well as
// constructs that are used throughout the application's tauri commands
// and life cycle.
pub struct State {
    // The path where the application stores its data
    // pub storage_path: PathBuf,

    // The project manager used to interact with local projects
    // exposing operations such as listing, creating, deleting, etc.
    pub project_manager: operations::LocalProjectManager,

    // The environment manager used to interact with environments
    pub environment_manager: operations::EnvironmentManager,

    // Legacy: the script to run
    pub script: Mutex<String>,
}

impl Default for State {
    fn default() -> Self {
        Self::new()
    }
}

impl State {
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
            project_manager: operations::LocalProjectManager::new(storage_path.clone()),
            environment_manager: operations::EnvironmentManager::new(storage_path.clone()),
            script: Mutex::new(String::new()),
        }
    }
}
