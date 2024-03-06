use crate::operations;
use serde::{Deserialize, Serialize};
use serde_json::{from_reader, Error as SerdeError};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("Serde error: {0}")]
    Serde(#[from] SerdeError),

    #[error("unknown data store error")]
    Unknown,
}

// Config holds the configuration of the application.
#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    // projects holds the paths to the projects tracked by the application
    pub projects: Vec<PathBuf>,

    // The cloud token used to authenticate with the cloud API
    pub cloud_token: Option<String>,
}

impl Config {
    // new creates a new configuration with the given cloud token.
    pub fn new(projects: Vec<PathBuf>, cloud_token: Option<&str>) -> Self {
        Self {
            projects,
            cloud_token: cloud_token.map(|s: &str| s.to_string()),
        }
    }

    // save writes the configuration to the file at the given path.
    pub fn save(&self, filepath: PathBuf) -> Result<(), Error> {
        let file = fs::File::create(filepath)?;
        serde_json::to_writer_pretty(file, self)?;
        Ok(())
    }

    // load reads the configuration file from the given path.
    pub fn load(filepath: PathBuf) -> Result<Self, Error> {
        let file = fs::File::open(&filepath)?;
        from_reader(file).map_err(Error::from)
    }

    // Dir returns the directory where the configuration file should be stored.
    pub fn dir() -> Option<PathBuf> {
        let system_config_dir = dirs::config_dir()?;
        Some(system_config_dir.join(DEFAULT_CONFIG_FOLDER))
    }

    pub fn file() -> Option<PathBuf> {
        let dir = Self::dir()?;
        Some(dir.join(DEFAULT_CONFIG_FILE))
    }
}

// DEFAULT_CONFIG_FOLDER is the name of the directory where the application
// stores its configuration file.
const DEFAULT_CONFIG_FOLDER: &str = "kroco6";

// DEFAULT_CONFIG_FILE is the name of the configuration file.
pub(crate) const DEFAULT_CONFIG_FILE: &str = "config.json";

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
