use axum::{
    http::{HeaderMap, Request, StatusCode},
    middleware::Next,
    response::IntoResponse,
    body::Body,
    Json
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use crate::models::{LoginInfo, LoginResponse, Claims};

pub async fn login_handler(Json(login_info): Json<LoginInfo>) -> Result<Json<LoginResponse>, StatusCode> {
    let username = &login_info.username;
    let password = &login_info.password;

    let is_valid = is_valid_user(username, password);
    if is_valid {
        let claims = Claims {
            sub: username.clone(),
            exp: (chrono::Utc::now() + chrono::Duration::hours(8)).timestamp() as usize
        };
        let token = match encode(&Header::default(), &claims, &EncodingKey::from_secret("secret".as_ref())) {
            Ok(tok) => tok,
            Err(e) => {
                println!("Error Generating Token {}", e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR)
            },
        };
        Ok(Json(LoginResponse { token }))
    }
    else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

pub fn is_valid_user(username: &str, password: &str) -> bool {
    username != "" && password != ""
}

pub async fn get_info_handler(header_map: HeaderMap) -> Result<Json<String>, StatusCode> {
    if let Some(auth_header) = header_map.get("Authorization") {
        if let Ok(auth_header_str) = auth_header.to_str() {
            if auth_header_str.starts_with("Bearer ") {
                let token = auth_header_str.trim_start_matches("Bearer ").to_string();
                match decode::<Claims>(&token, &DecodingKey::from_secret("secret".as_ref()), &Validation::default()) {
                    Ok(_) => {
                        let info = "Authorized".to_string();
                        return Ok(Json(info));
                    },
                    Err(e) => {
                        println!("Error Validating Token {}", e);
                        return Err(StatusCode::UNAUTHORIZED);
                    },
                }
            }
        }
    }
    Err(StatusCode::UNAUTHORIZED)
}

// Fixed: Use the correct Next type without generic parameter
pub async fn auth_middleware(req: Request<Body>, next: Next) -> impl IntoResponse {
    let header_map = req.headers().clone();
    
    match get_info_handler(header_map).await {
        Ok(_) => next.run(req).await,
        Err(status) => status.into_response(),
    }
}