use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::application::Error;

pub trait Save<T: Serialize> {
    fn save(&self, filepath: PathBuf) -> Result<(), Error>
    where
        Self: Sized;
}

pub trait Load<T: for<'a> Deserialize<'a>> {
    fn load(filepath: PathBuf) -> Result<Self, Error>
    where
        Self: Sized;
}
