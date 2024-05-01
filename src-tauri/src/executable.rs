use std::io::Cursor;
use anyhow::Result;
use std::path::{Path, PathBuf};
use std::fs;

#[cfg(target_os = "linux")]
use tar::Archive;
use flate2::read::GzDecoder;

const K6_EXECUTABLE_DOWNLOAD_PATH_BASE: &str = "https://github.com/grafana/k6/releases/download/v0.50.0/k6-v0.50.0-";

pub fn get_executable_path() -> PathBuf {
    dirs::config_dir().expect("failed to get config directory").join("kroco6").join("k6_executable").join("k6")
}

pub fn is_k6_executable_installed() -> Result<bool> {
    // ensure ~<config>/kroco6/k6_executable exists
    let config_dir = dirs::config_dir().expect("Failed to get config directory");
    let storage_path = Path::new(&config_dir).join("kroco6");
    if !&storage_path.exists() {
        fs::create_dir(&storage_path).expect("Failed to create storage directory");
    }
    let executable_path = storage_path.join("k6_executable");
    if !&executable_path.exists() {
        fs::create_dir(&executable_path).expect("Failed to create k6 executable directory");
    }

    // naively if the executable directory is not empty we assume we have the binary and do nothing
    if executable_path.read_dir().expect("failed to read the k6 executable directory").next().is_some() {
        println!("k6 executable found");
        return Ok(true);
    }

    println!("k6 executable not found");

    Ok(false)
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
pub async fn download_executable_for_platform(suffix: &str) -> Result<()> {
    let executable_path = dirs::config_dir().expect("failed to get config directory").join("kroco6").join("k6_executable");
    let response = reqwest::get(format!("{}{}", K6_EXECUTABLE_DOWNLOAD_PATH_BASE, suffix)).await?;
    let archive_bytes = response.bytes().await?;

    zip_extract::extract(Cursor::new(archive_bytes), &executable_path, true)?;

    Ok(())
}

#[cfg(all(target_os = "macos", target_arch = "aarch64"))]
pub async fn download_executable() -> Result<()>{
    download_executable_for_platform("macos-arm64.zip").await
}

#[cfg(all(target_os = "macos", target_arch = "x86_64"))]
pub async fn download_executable() -> Result<()> {
    download_executable_for_platform("macos-amd64.zip").await
}

#[cfg(target_os = "windows")]
pub async fn download_executable() -> Result<()> {
    download_executable_for_platform("windows-amd64.zip").await
}

#[cfg(all(target_os = "linux", target_arch = "aarch64"))]
pub async fn download_executable() -> Result<()> {
    download_executable_for_platform("linux-arm64.tar.gz").await
}

#[cfg(all(target_os = "linux", target_arch = "x86_64"))]
pub async fn download_executable() -> Result<()> {
    download_executable_for_platform("linux-amd64.tar.gz").await
}

#[cfg(target_os = "linux")]
pub async fn download_executable_for_platform(suffix: &str) -> Result<()> {
    let executable_path = dirs::config_dir().expect("failed to get config directory").join("kroco6").join("k6_executable").join("k6");
    let response = reqwest::get(format!("{}{}", K6_EXECUTABLE_DOWNLOAD_PATH_BASE, suffix)).await?;
    let archive_bytes = response.bytes().await?;

    let tar = GzDecoder::new(Cursor::new(archive_bytes));
    let mut archive = Archive::new(tar);

    // iterate to ignore directories in the archive
    for file in archive.entries().unwrap() {
        // make sure there wasn't an I/O error
        let mut file = file?;

        // the k6 binary is the only regular file in the archive
        if file.header().entry_type() == tar::EntryType::Regular {
            file.unpack(&executable_path)?;
        }
    }

    Ok(())
}
