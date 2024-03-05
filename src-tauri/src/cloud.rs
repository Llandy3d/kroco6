use crate::models::{CloudTest, CloudTestListResponse};

fn get_request(url: &str, cloud_token: &str) -> reqwest::RequestBuilder {

    // NOTE: messy but will do
    let client = reqwest::Client::new();
    let url = format!("https://api.k6.io{}", url);
    client.get(url)
        .header(reqwest::header::AUTHORIZATION, format!("Token {}", cloud_token))
        .header(reqwest::header::USER_AGENT, "kroco6")
}

pub async fn get_cloud_tests(cloud_token: &str, cloud_project_id: &str) -> Result<Vec<CloudTest>, String> {
    let tests_url = format!("/loadtests/v2/tests?$select=id,name,project_id,script&project_id={cloud_project_id}");

    let resp: CloudTestListResponse = get_request(&tests_url, cloud_token)
        .send()
        .await
        .map_err(|e| {
            eprintln!("{:?}", e.to_string());
            e.to_string()
        })?
        .json()
        .await
        .map_err(|e| {
            eprintln!("{:?}", e.to_string());
            e.to_string()
        })?;

    let cloud_test_list: Vec<CloudTest> = resp.k6_tests;

    Ok(cloud_test_list)
}
