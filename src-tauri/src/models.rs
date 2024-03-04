use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fmt::Display;
use std::path::PathBuf;
use std::str::FromStr;

// TestKind represents the kind of test we are dealing with
// (e.g. a block test, a javascript test, etc.)
#[derive(Clone, Debug, Deserialize, Serialize)]
pub enum TestKind {
    Blocks,
    OpenAPI,
    Javascript,
}

impl Display for TestKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let str = match self {
            TestKind::Blocks => "blocks6".to_string(),
            TestKind::OpenAPI => "openapi".to_string(),
            TestKind::Javascript => "js".to_string(),
        };
        write!(f, "{}", str)
    }
}

impl FromStr for TestKind {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "blocks6" => Ok(TestKind::Blocks),
            "openapi" => Ok(TestKind::OpenAPI),
            "js" => Ok(TestKind::Javascript),
            _ => Err(format!("{} is not a valid TestKind", s)),
        }
    }
}

// Test represents a single test that can be ran
// either independently or as part of a suite.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Test {
    // Name of the test
    pub name: String,

    // The kind of test, e.g. block, javascript, OpenAPI, etc.
    pub kind: TestKind,

    // The content of the test
    //
    // This is the actual content of the test, as defined
    // in the user-interface, either through blocks, openAPI,
    // or javascript.
    //
    // This is stored as a string under the hood for convenience.
    // The default value is "".
    pub content: String,
}

impl Test {
    pub fn new(name: &str, kind: TestKind, content: &str) -> Self {
        Self {
            name: name.to_string(),
            kind,
            content: content.to_string(),
            // file_path: PathBuf::new(),
        }
    }
}

// A Collection represents either a single test, or
// a suite of tests (many tests meant to be ran sequentially
// or in parallel).
#[derive(Clone, Debug, Serialize)]
enum TestCollection {
    // A single test
    Test(Test),

    // A suite of tests
    Suite(Vec<Test>),
}

// A Project represents a collection of tests and suites
// that can be ran.
#[derive(Clone, Debug, Serialize)]
pub struct Project {
    // The test resources that are part of the project
    pub test_collections: Vec<TestCollection>,

    // The name of the Project
    pub name: String,

    // The (optional) description of the content
    // of the Project.
    pub description: Option<String>,
    // FIXME @oleiade: eventually, we want environment to be also definable
    // at the project level (and give it precedence) but for the hackathon
    // we start and stick with an app-wide "global" environment.
    // environment: Environment,
}

impl Project {
    pub fn new(name: &str, description: Option<&str>) -> Self {
        Self {
            test_collections: vec![],
            name: name.to_string(),
            description: description.map(|s| s.to_string()),
        }
    }

    pub fn default() -> Self {
        Self::new("default", None)
    }
}

// Represents an Environment with its key/value variable pairs
#[derive(Debug, Serialize, Deserialize)]
pub struct Environment {
    name: String,
    description: String,
    variables: BTreeMap<String, String>,
}

impl Environment {
    pub fn new(name: &str, description: &str, variables: BTreeMap<String, String>) -> Self {
        Self {
            name: name.to_string(),
            description: description.to_string(),
            variables,
        }
    }
}

// The environment data file, it includes the currently
// active environment.
#[derive(Debug, Serialize, Deserialize)]
pub struct EnvironmentsData {
    environments: Vec<Environment>,

    // active environment name
    pub active: String,
}

impl EnvironmentsData {
    pub fn new(environments: Vec<Environment>, active: &str) -> Self {
        Self {
            environments,
            active: active.to_string(),
        }
    }
}
