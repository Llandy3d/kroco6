use std::{fs, io};
use std::path;

use crate::models::{Project};

const PROJECTS_DIR: &str = "projects";
const DEFAULT_PROJECT_NAME: &str = "default";

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
            fs::create_dir(&self.projects_dir())?;
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
            fs::create_dir(&self.projects_dir())?;
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
            return Err(io::Error::new(io::ErrorKind::NotFound, "projects directory not found"))
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