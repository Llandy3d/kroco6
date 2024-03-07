use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::{fs, io};

use crate::application::Error;
use crate::models::{Environment, EnvironmentsData, Project, ProjectConfig, Test, TestKind};
use crate::project::Config as AltProjectConfig;

const PROJECTS_DIR: &str = "projects";
const DEFAULT_PROJECT_NAME: &str = "default";
const PROJECT_CONFIG_FILE: &str = "project_config.json";
const ENVIRONMENT_FILE: &str = "environments.json";

pub trait ProjectManager {
    // Initialize the project manager, ensuring that the underlying
    // projects storage is set up correctly.
    fn initialize(&self) -> io::Result<()>;

    // List all projects.
    //
    // Returns the list of projects that are currently stored
    // in the underlying storage.
    fn list_projects(&self) -> io::Result<Vec<Project>>;

    // Get a project by name.
    //
    // Returns the project with the given name, if it exists.
    // If it doesn't, returns an error of kind NotFound.
    fn get_project(&self, name: &str) -> io::Result<Project>;

    // Create a new project.
    //
    // Returns the newly created project.
    fn create_project(&self, project: Project) -> io::Result<Project>;

    // List all tests in a project.
    //
    // Returns the list of tests that are currently stored
    // in the underlying storage for the given project.
    fn list_tests(&self, project_name: &str) -> io::Result<Vec<Test>>;

    // Get a test by name.
    //
    // Returns the test with the given name, if it exists.
    fn get_test(&self, project_name: &str, test_name: &str) -> io::Result<Test>;

    // TODO: document
    fn delete_test(&self, project_name: &str, test_name: &str) -> io::Result<()>;

    // Create a new test in a project.
    //
    // Returns the newly created test.
    fn create_test(&self, project_name: &str, test: Test) -> io::Result<Test>;

    // Saves the content of a test in a project.
    //
    // This is meant to be used on the client side to save the content of a test
    // that has been edited in the UI.
    fn save_test(&self, project_name: &str, test_name: &str, new_content: &str) -> io::Result<()>;

    // TODO: document
    fn load_project_config(&self, project_name: &str) -> io::Result<ProjectConfig>;

    // TODO: document
    fn save_project_config(
        &self,
        project_name: &str,
        project_config: ProjectConfig,
    ) -> io::Result<()>;
}

pub struct LocalProjectManager {
    base_path: PathBuf,
}

impl LocalProjectManager {
    pub fn new(base_path: PathBuf) -> Self {
        Self { base_path }
    }

    // Returns the path of the projects directory
    fn projects_dir(&self) -> PathBuf {
        Path::new(&self.base_path).join(PROJECTS_DIR)
    }

    fn project_path(&self, name: &str) -> PathBuf {
        self.projects_dir().join(name)
    }
}

impl ProjectManager for LocalProjectManager {
    fn initialize(&self) -> io::Result<()> {
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

    // List local projects
    fn list_projects(&self) -> io::Result<Vec<Project>> {
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
                let file_name = path
                    .file_name()
                    .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "missing file name"))?
                    .to_str()
                    .ok_or_else(|| {
                        io::Error::new(io::ErrorKind::InvalidData, "invalid UTF-8 in file name")
                    })?;
                projects.push(Project::new(file_name, None));
            }
        }

        Ok(projects)
    }

    // Get a project by name
    fn get_project(&self, name: &str) -> io::Result<Project> {
        let project_path = self.projects_dir().join(name);
        if !project_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "project not found"));
        }

        Ok(Project::new(name, None))
    }

    // Create a new local project
    fn create_project(&self, project: Project) -> io::Result<Project> {
        let projects_dir = &self.projects_dir();

        // We store projects in a directory called "projects"
        // under the base path
        if !projects_dir.exists() {
            // If it doesn't already exist, create it
            fs::create_dir(projects_dir)?;
        }

        // Compute the path of the project in the "projects" directory
        let project_path = projects_dir.join(&project.name);

        // Create the underlying directory for the project
        fs::create_dir(project_path)?;

        Ok(project.clone())
    }

    // Load project config
    fn load_project_config(&self, project_name: &str) -> io::Result<ProjectConfig> {
        let project_path = self.projects_dir().join(project_name);
        if !project_path.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                "project config not found",
            ));
        }

        let project_config_path = project_path.join(PROJECT_CONFIG_FILE);

        let file = fs::File::open(&project_config_path)?;
        let project_config = serde_json::from_reader(file)?;
        Ok(project_config)
    }

    // Save project config
    fn save_project_config(
        &self,
        project_name: &str,
        project_config: ProjectConfig,
    ) -> io::Result<()> {
        let project_path = self.projects_dir().join(project_name);
        if !project_path.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                "project config not found",
            ));
        }

        let project_config_path = project_path.join(PROJECT_CONFIG_FILE);

        let file = fs::File::create(&project_config_path)?;
        serde_json::to_writer_pretty(file, &project_config)?;

        Ok(())
    }

    fn list_tests(&self, project_name: &str) -> io::Result<Vec<Test>> {
        let project_path = self.projects_dir().join(project_name);
        if !project_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "project not found"));
        }

        let mut tests = vec![];
        for entry in fs::read_dir(project_path)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                let name = path
                    .file_stem()
                    .ok_or(io::Error::new(
                        io::ErrorKind::InvalidData,
                        "invalid file name",
                    ))?
                    .to_str()
                    .ok_or(io::Error::new(
                        io::ErrorKind::InvalidData,
                        "invalid file name",
                    ))?
                    .to_string();

                let kind = path
                    .extension()
                    .ok_or(io::Error::new(
                        io::ErrorKind::InvalidData,
                        "invalid file extension",
                    ))?
                    .to_str()
                    .ok_or(io::Error::new(
                        io::ErrorKind::InvalidData,
                        "invalid file extension",
                    ))?;

                // skip json as it's not a test but configuration
                if kind == "json" {
                    continue;
                }

                // Read the content of the file
                let content = fs::read_to_string(&path)?;

                let test = Test::new(
                    &name,
                    TestKind::from_str(kind).map_err(|_| {
                        io::Error::new(io::ErrorKind::InvalidData, "invalid test kind")
                    })?,
                    &content,
                );

                tests.push(test);
            }
        }

        Ok(tests)
    }

    fn get_test(&self, project_name: &str, test_name: &str) -> io::Result<Test> {
        let project_path = self.projects_dir().join(project_name);
        if !project_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "project not found"));
        }

        match get_file_with_basename(project_path.as_path(), test_name) {
            Some(test_path) => {
                let kind = test_path
                    .extension()
                    .ok_or(io::Error::new(
                        io::ErrorKind::InvalidData,
                        "invalid file extension",
                    ))?
                    .to_str()
                    .ok_or(io::Error::new(
                        io::ErrorKind::InvalidData,
                        "invalid file extension",
                    ))?;

                let content = fs::read_to_string(&test_path)?;

                let test = Test::new(
                    test_name,
                    TestKind::from_str(kind).map_err(|_| {
                        io::Error::new(io::ErrorKind::InvalidData, "invalid test kind")
                    })?,
                    &content,
                );

                Ok(test)
            }
            None => Err(io::Error::new(io::ErrorKind::NotFound, "test not found")),
        }
    }

    fn delete_test(&self, project_name: &str, test_name: &str) -> io::Result<()> {
        let project_path = self.projects_dir().join(project_name);
        if !project_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "project not found"));
        }

        match get_file_with_basename(project_path.as_path(), test_name) {
            Some(test_path) => {
                let kind = test_path
                    .extension()
                    .ok_or(io::Error::new(
                        io::ErrorKind::InvalidData,
                        "invalid file extension",
                    ))?
                    .to_str()
                    .ok_or(io::Error::new(
                        io::ErrorKind::InvalidData,
                        "invalid file extension",
                    ))?;

                fs::remove_file(test_path)
            }
            None => Err(io::Error::new(io::ErrorKind::NotFound, "test not found")),
        }
    }

    fn create_test(&self, project_name: &str, test: Test) -> io::Result<Test> {
        let project_path = self.projects_dir().join(project_name);
        if !project_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "project not found"));
        }

        let test_file_name = test.name.to_string() + "." + &test.kind.to_string();

        // We save the test in a file named after the test name, and
        // an extension that represents the kind of test it is: .blocks, .openapi, .js, etc.
        // The content of the file can be anything we want, as long as the extension
        // serializes the kind of content and how to interpret it.
        //
        // NOTE @oleiade: in production this would likely be done differently, I'm just
        // hacking it away here.
        let test_path = project_path.join(test_file_name);
        if test_path.exists() {
            return Err(io::Error::new(
                io::ErrorKind::AlreadyExists,
                "test already exists",
            ));
        }

        fs::write(&test_path, &test.content)?;

        Ok(Test::new(&test.name, test.kind, &test.content))
    }

    fn save_test(&self, project_name: &str, test_name: &str, new_content: &str) -> io::Result<()> {
        let project_path = self.project_path(project_name);
        if !project_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "project not found"));
        }

        let test_path = get_file_with_basename(&project_path, test_name);
        match test_path {
            Some(path) => {
                fs::write(path, new_content)?;
                Ok(())
            }
            None => Err(io::Error::new(io::ErrorKind::NotFound, "test not found")),
        }
    }
}

pub struct EnvironmentManager {
    file_path: PathBuf,
}

impl EnvironmentManager {
    pub fn new(storage_path: PathBuf) -> Self {
        let file_path = Path::new(&storage_path).join(ENVIRONMENT_FILE);
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

// Returns the path of the file with the given basename in the given directory, if it exists.
//
// This function allows to check if a test file with the provided `basename` exists in the
// project directory, regardless of its extension.
fn get_file_with_basename(directory: &Path, basename: &str) -> Option<PathBuf> {
    if directory.is_dir() {
        if let Ok(entries) = fs::read_dir(directory) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() && path.file_stem().map_or(false, |s| s == basename) {
                    return Some(path);
                }
            }
        }
    }
    None
}
