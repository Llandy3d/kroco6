use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::{fs, io, path};

use crate::models::{Environment, EnvironmentsData, Project, Test, TestKind};

const PROJECTS_DIR: &str = "projects";
const DEFAULT_PROJECT_NAME: &str = "default";
const ENVIRONMENT_FILE: &str = "environments.json";

trait ProjectManager {
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

    // Create a new test in a project.
    //
    // Returns the newly created test.
    fn create_test(&self, project_name: &str, test: Test) -> io::Result<Test>;
}

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

    // Get a project by name
    pub fn get_project(&self, name: &str) -> io::Result<Project> {
        let project_path = self.projects_dir().join(name);
        if !project_path.exists() {
            return Err(io::Error::new(io::ErrorKind::NotFound, "project not found"));
        }

        Ok(Project::new(name, None))
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

    pub fn list_tests(&self, project_name: &str) -> io::Result<Vec<Test>> {
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

                // Read the content of the file
                let content = fs::read_to_string(&path)?;

                let test = Test {
                    name,
                    kind: TestKind::from_str(kind).map_err(|_| {
                        io::Error::new(io::ErrorKind::InvalidData, "invalid test kind")
                    })?,
                    content,
                };
                tests.push(test);
            }
        }

        Ok(tests)
    }

    pub fn get_test(&self, project_name: &str, test_name: &str) -> io::Result<Test> {
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

                Ok(Test {
                    name: test_name.to_string(),
                    kind: TestKind::from_str(kind).map_err(|_| {
                        io::Error::new(io::ErrorKind::InvalidData, "invalid test kind")
                    })?,
                    content,
                })
            }
            None => Err(io::Error::new(io::ErrorKind::NotFound, "test not found")),
        }
    }

    pub fn create_test(&self, project_name: &str, test: Test) -> io::Result<Test> {
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

        println!("Creating test at {:?}", test_path);
        fs::write(&test_path, &test.content)?;

        Ok(Test {
            name: test.name,
            kind: test.kind,
            content: test.content,
        })
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
