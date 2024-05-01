use flate2::read::GzDecoder;
use std::io::Cursor;

#[cfg(target_os = "linux")]
use tar::Archive;

const K6_EXECUTABLE_DOWNLOAD_PATH_BASE: &str = "https://github.com/grafana/k6/releases/download/v0.50.0/k6-v0.50.0-";

// #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
// // #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
// pub async fn download_executable() {
//     let executable_path = dirs::config_dir().expect("failed to get config directory").join("kroco6").join("k6_executable").join("k6");
//     // let response = reqwest::get(format!("{}{}", K6_EXECUTABLE_DOWNLOAD_PATH_BASE, "macos-arm64.zip")).await.unwrap();
//     let response = reqwest::get(format!("{}{}", K6_EXECUTABLE_DOWNLOAD_PATH_BASE, "linux-arm64.tar.gz")).await.unwrap();
//     let body = response.bytes().await.unwrap();

//     let tar = GzDecoder::new(Cursor::new(body));
//     let mut archive = Archive::new(tar);

//     // iterate to ignore directories in the archive
//     for file in archive.entries().unwrap() {
//         // make sure there wasn't an I/O error
//         let mut file = file.unwrap();

//         // the k6 binary is the only regular file in the archive
//         if file.header().entry_type() == tar::EntryType::Regular {
//             file.unpack(&executable_path).unwrap();
//         }

//     }

//     println!("I AM COMPILED ARCCCHCH");
// }


#[cfg(all(target_os = "macos", target_arch = "aarch64"))]
// #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
pub async fn download_executable() {
    // download_executable_for_platform("linux-arm64.tar.gz").await;
    // download_executable_for_platform("linux-amd64.tar.gz").await;
}

#[cfg(all(target_os = "linux", target_arch = "aarch64"))]
pub async fn download_executable() {
    download_executable_for_platform("linux-arm64.tar.gz").await;
}

#[cfg(all(target_os = "linux", target_arch = "x86_64"))]
pub async fn download_executable() {
    download_executable_for_platform("linux-amd64.tar.gz").await;
}

#[cfg(target_os = "linux")]
pub async fn download_executable_for_platform(suffix: &str) {
    let executable_path = dirs::config_dir().expect("failed to get config directory").join("kroco6").join("k6_executable").join("k6");
    let response = reqwest::get(format!("{}{}", K6_EXECUTABLE_DOWNLOAD_PATH_BASE, suffix)).await.unwrap();
    let body = response.bytes().await.unwrap();

    let tar = GzDecoder::new(Cursor::new(body));
    let mut archive = Archive::new(tar);

    // iterate to ignore directories in the archive
    for file in archive.entries().unwrap() {
        // make sure there wasn't an I/O error
        let mut file = file.unwrap();

        // the k6 binary is the only regular file in the archive
        if file.header().entry_type() == tar::EntryType::Regular {
            file.unpack(&executable_path).unwrap();
        }
    }
}
