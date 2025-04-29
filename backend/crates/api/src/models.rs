use serde::{Deserialize, Deserializer, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct LoginInfo{
    pub username:String,
    pub password:String
}

#[derive(Serialize)]
pub struct LoginResponse{
    pub token:String
}

#[derive(Serialize,Deserialize)]
pub struct Claims{
    pub sub : String,
    pub exp: usize
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Website {
    pub url: String,
    #[serde(deserialize_with = "deserialize_uuid")]
    pub user_id: Uuid,
    pub disabled: bool,
}

fn deserialize_uuid<'de, D>(deserializer: D) -> Result<Uuid, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;
    Uuid::parse_str(&s).map_err(serde::de::Error::custom)
}
#[derive(Debug, Serialize, Deserialize)]
pub struct WebsiteQuery{
    pub id: Uuid,
    pub user_id: Uuid
}
#[derive(Debug, Serialize, Deserialize)]
pub struct User{
    pub id: Uuid,
    pub email:String
}
#[derive(Deserialize)]
pub struct UserIdQuery {
    pub user_id: Uuid,
}