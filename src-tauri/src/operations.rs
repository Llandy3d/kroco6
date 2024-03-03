use std::path;
use std::{fs, io};

use crate::models::{Environment, EnvironmentsData, Project};
use std::collections::BTreeMap;

const PROJECTS_DIR: &str = "projects";
const DEFAULT_PROJECT_NAME: &str = "default";
const ENVIRONMENT_FILE: &str = "environments.json";

pub struct LocalProjectManager {
    base_path: path::PathBuf,
}

impl LocalProjectManager {
    pub fn new(base_path: path::PathBuf) -> Self {
        Self { base_path }
    }

    pub fn initialize(&self) -> io::Result<()> {
        // Ensure the underlying projects directory exists
        let projects_dir = &self.projects_dir();
        if !projects_dir.exists() {
            fs::create_dir(self.projects_dir())?;
        }

        // Ensure the default project is created
        if !projects_dir.join(DEFAULT_PROJECT_NAME).exists() {
            self.create_project(Project::default())?;
        }

        Ok(())
    }

    // Create a new local project
    pub fn create_project(&self, project: Project) -> io::Result<Project> {
        let projects_dir = &self.projects_dir();

        // We store projects in a directory called "projects"
        // under the base path
        if !projects_dir.exists() {
            // If it doesn't already exist, create it
            fs::create_dir(self.projects_dir())?;
        }

        // Compute the path of the project in the "projects" directory
        let project_path = projects_dir.join(&project.name);

        // Create the underlying directory for the project
        fs::create_dir(project_path)?;

        Ok(project.clone())
    }

    // List local projects
    pub fn list_projects(&self) -> io::Result<Vec<Project>> {
        let projects_dir = &self.projects_dir();
        if !projects_dir.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                "projects directory not found",
            ));
        }

        let mut projects = vec![];
        for entry in fs::read_dir(projects_dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                let project = Project::new(path.file_name().unwrap().to_str().unwrap(), None);
                projects.push(project);
            }
        }

        Ok(projects)
    }

    fn projects_dir(&self) -> path::PathBuf {
        path::Path::new(&self.base_path).join(PROJECTS_DIR)
    }
}

pub struct EnvironmentManager {
    file_path: path::PathBuf,
}

impl EnvironmentManager {
    pub fn new(storage_path: path::PathBuf) -> Self {
        let file_path = path::Path::new(&storage_path).join(ENVIRONMENT_FILE);
        Self { file_path }
    }

    pub fn initialize(&self) -> io::Result<()> {
        // if the file doesn't exist create the default environment
        if !self.file_path.exists() {
            let file = fs::File::create(&self.file_path)?;

            let default_name = "default";
            let default_environment =
                Environment::new(default_name, "default environment", BTreeMap::new());

            let environment_data = EnvironmentsData::new(vec![default_environment], default_name);

            serde_json::to_writer_pretty(file, &environment_data)?;
        }

        Ok(())
    }

    pub fn load(&self) -> io::Result<EnvironmentsData> {
        let file = fs::File::open(&self.file_path)?;
        let environments_data = serde_json::from_reader(file)?;
        Ok(environments_data)
    }

    pub fn save(&self, environments_data: &EnvironmentsData) -> io::Result<()> {
        let file = fs::File::create(&self.file_path)?;
        serde_json::to_writer_pretty(file, environments_data)?;

        Ok(())
    }
}
