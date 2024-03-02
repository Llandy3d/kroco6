use std::path::PathBuf;
use serde::Serialize;

// TestKind represents the kind of test we are dealing with
// (e.g. a block test, a javascript test, etc.)
#[derive(Clone, Debug, Serialize)]
pub enum TestKind {
    Block,
    Javascript,
}

// Test represents a single test that can be ran
// either independently or as part of a suite.
#[derive(Clone, Debug, Serialize)]
pub struct Test {
    kind: TestKind,
    name: String,
    file_path: PathBuf,
}

// A Collection represents either a single test, or
// a suite of tests (many tests meant to be ran sequentially
// or in parallel).
#[derive(Clone, Debug, Serialize)]
enum TestCollection {
    // A single test
    Test(Test),

    // A suite of tests
    Suite(Vec<Test>)
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
