use crate::application::Error;
use crate::models::{Project, ProjectConfig, Test};
use crate::operations::ProjectManager;
use crate::traits::{Load, Save};
use serde::{Deserialize, Serialize};
use serde_json::from_reader;
use std::path::{Path, PathBuf};
use std::{fs, io};

// Project config holds the configuration of a project.
//
// The project config is meant to be serialized to json and
// stored on disk in the project's directory.
#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    // The project name used to identify the project
    name: String,

    // The user defined description of the project
    description: String,

    // The project id used to identify the project in the cloud
    cloud_project_id: Option<String>,
}

impl Save<Config> for Config {
    fn save(&self, filepath: PathBuf) -> Result<(), Error> {
        let file = fs::File::create(filepath)?;
        serde_json::to_writer_pretty(file, self)?;
        Ok(())
    }
}

impl Load<Config> for Config {
    fn load(filepath: PathBuf) -> Result<Self, Error> {
        let file = fs::File::open(&filepath)?;
        from_reader(file).map_err(Error::from)
    }
}

const DEFAULT_PROJECT_FOLDER_NAME: &str = "k6";
const DEFAULT_PROJECT_CONFIG_FILE_NAME: &str = "config.json";

// pub fn create_project(
//     destination_folder: PathBuf,
//     path: PathBuf,
//     name: &str,
//     description: Option<&str>,
// ) -> Result<Project, Error> {
//     if !destination_folder.exists() {
//         return Err(Error::Io(io::Error::new(
//             io::ErrorKind::NotFound,
//             "project not found",
//         )));
//     }
//
//     let project_dir = destination_folder.join(DEFAULT_PROJECT_FOLDER_NAME);
//     if !project_dir.exists() {
//         fs::create_dir(&project_dir)?;
//     }
//
//     let project_config_file_path = project_dir.join(DEFAULT_PROJECT_CONFIG_FILE_NAME);
//
//     Ok(Project::new(new, description))
// }
