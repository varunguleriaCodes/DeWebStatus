use axum::{
    extract::Query,
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{delete, get, post},
    Extension, Router,
};
use chrono::Utc;
use jsonwebtoken::{EncodingKey, Header,encode};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{postgres::PgRow, PgPool, Row};
use uuid::Uuid;
use crate::{
    auth::auth_middleware,
    models::{Claims, User, UserIdQuery, UserRegister, Website, WebsiteQuery},
};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{SaltString, rand_core::OsRng};
use argon2::password_hash::Error;

#[derive(Serialize)]
struct ApiResponse<T> {
    success: bool,
    message: Option<String>,
    data: Option<T>,
}

fn json_success<T: Serialize>(data: T, message: Option<String>) -> Json<Value> {
    Json(json!({
        "success": true,
        "message": message,
        "data": data
    }))
}

fn json_error(message: &str) -> Json<Value> {
    Json(json!({
        "success": false,
        "message": message,
        "data": null
    }))
}

struct ApiJsonResponse(StatusCode, Json<Value>);

impl IntoResponse for ApiJsonResponse {
    fn into_response(self) -> axum::response::Response {
        (self.0, self.1).into_response()
    }
}

async fn hello() -> Json<Value> {
    json_success("Hello from Rust backend!", None)
}

async fn createWebsite(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<Website>,
) -> ApiJsonResponse {
    println!("Url: {}", payload.url);
    let result = sqlx::query!(
        "INSERT INTO websites (url, user_id, disabled) VALUES ($1, $2, $3)",
        payload.url,
        payload.user_id,
        payload.disabled
    )
    .execute(&pool)
    .await;

    match result {
        Ok(_) => ApiJsonResponse(
            StatusCode::CREATED,
            json_success(
                json!({"url": payload.url, "user_id": payload.user_id}),
                Some("Website created successfully!".to_string()),
            ),
        ),
        Err(e) => {
            println!("DB error: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to create website"),
            )
        }
    }
}

#[axum::debug_handler]
async fn getWebsiteStatus(
    Extension(pool): Extension<PgPool>,
    Query(query): Query<WebsiteQuery>,
) -> ApiJsonResponse {
    let website_id = query.id;
    let user_id = query.user_id;

    // First, get the website with the disabled condition
    let website_result = sqlx::query(
        "SELECT id, url, user_id, disabled 
         FROM websites 
         WHERE id = $1 AND user_id = $2 AND disabled = false",
    )
    .bind(website_id)
    .bind(user_id)
    .fetch_optional(&pool)
    .await;

    match website_result {
        Ok(Some(website_row)) => {
            // Website found, now get its ticks
            let website_id = website_row.get::<Uuid, _>("id");

            // Get ticks for this website
            let ticks_result = sqlx::query(
                "SELECT wt.id, wt.website_id, wt.validator_id, wt.created_at, wt.status, wt.latency
                 FROM website_ticks wt
                 WHERE wt.website_id = $1",
            )
            .bind(website_id)
            .fetch_all(&pool)
            .await;

            match ticks_result {
                Ok(tick_rows) => {
                    // Convert tick rows to JSON objects
                    let ticks = tick_rows
                        .iter()
                        .map(|row| {
                            json!({
                                "id": row.get::<Uuid, _>("id"),
                                "websiteId": row.get::<Uuid, _>("website_id"),
                                "validatorId": row.get::<Uuid, _>("validator_id"),
                                "status": row.get::<String, _>("status"),
                                "latency": row.get::<f64, _>("latency")
                            })
                        })
                        .collect::<Vec<_>>();

                    // Build complete response with website and ticks
                    let website_data = json!({
                        "id": website_id,
                        "url": website_row.get::<String, _>("url"),
                        "userId": website_row.get::<Uuid, _>("user_id"),
                        "disabled": website_row.get::<bool, _>("disabled"),
                        "ticks": ticks
                    });

                    ApiJsonResponse(StatusCode::OK, json_success(website_data, None))
                }
                Err(e) => {
                    println!("Error fetching ticks: {:?}", e);
                    // Return website without ticks if there was an error fetching ticks
                    let website_data = json!({
                        "id": website_id,
                        "url": website_row.get::<String, _>("url"),
                        "userId": website_row.get::<Uuid, _>("user_id"),
                        "disabled": website_row.get::<bool, _>("disabled"),
                        "ticks": []
                    });

                    ApiJsonResponse(StatusCode::OK, json_success(website_data, None))
                }
            }
        }
        Ok(None) => ApiJsonResponse(StatusCode::NOT_FOUND, json_error("Website not found")),
        Err(e) => {
            println!("Error fetching website: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to fetch website data"),
            )
        }
    }
}

async fn getWebsites(
    Extension(pool): Extension<PgPool>,
    Query(query): Query<UserIdQuery>,
) -> ApiJsonResponse {
    let user_id = query.user_id;
    let websites_result = sqlx::query(
        "SELECT id, url, user_id, disabled 
         FROM websites 
         WHERE user_id = $1 AND disabled = false"
    )
    .bind(user_id)
    .fetch_all(&pool)
    .await;

    match websites_result {
        Ok(website_rows) => {
            let mut websites_with_ticks = Vec::new();
            
            // For each website, fetch its ticks
            for website_row in website_rows {
                let website_id = website_row.get::<Uuid, _>("id");
                let url = website_row.get::<String, _>("url");
                let user_id = website_row.get::<Uuid, _>("user_id");
                let disabled = website_row.get::<bool, _>("disabled");
                
                // Fetch ticks for this website
                let ticks_result = sqlx::query(
                    "SELECT id, website_id, validator_id, created_at, status, latency
                     FROM website_ticks
                     WHERE website_id = $1"
                )
                .bind(website_id)
                .fetch_all(&pool)
                .await;
                
                let ticks = match ticks_result {
                    Ok(tick_rows) => {
                        tick_rows.iter().map(|row| {
                            json!({
                                "id": row.get::<Uuid, _>("id"),
                                "websiteId": row.get::<Uuid, _>("website_id"),
                                "validatorId": row.get::<Uuid, _>("validator_id"),
                                "status": row.get::<String, _>("status"),
                                "latency": row.get::<f64, _>("latency")
                            })
                        }).collect::<Vec<_>>()
                    },
                    Err(e) => {
                        println!("Error fetching ticks for website {}: {:?}", website_id, e);
                        Vec::new() // Empty ticks array if there was an error
                    }
                };
                
                // Create website JSON with ticks included
                websites_with_ticks.push(json!({
                    "id": website_id,
                    "url": url,
                    "userId": user_id,
                    "disabled": disabled,
                    "ticks": ticks
                }));
            }

            ApiJsonResponse(StatusCode::OK, json_success(
                json!({"websites": websites_with_ticks}), 
                None
            ))
        }
        Err(e) => {
            println!("Error fetching websites: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to fetch websites"),
            )
        }
    }
}

async fn deleteWebsite(
    Extension(pool): Extension<PgPool>,
    Query(query): Query<WebsiteQuery>,
) -> ApiJsonResponse {
    let website_id = query.id;
    let user_id = query.user_id;

    let result = sqlx::query(
        "UPDATE websites SET disabled = true 
         WHERE id = $1 AND user_id = $2"
    )
    .bind(website_id)
    .bind(user_id)
    .execute(&pool)
    .await;

    match result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                ApiJsonResponse(
                    StatusCode::OK,
                    json_success(
                        json!({"id": website_id}),
                        Some("Website deleted successfully".to_string()),
                    ),
                )
            } else {
                ApiJsonResponse(StatusCode::NOT_FOUND, json_error("Website not found"))
            }
        }
        Err(e) => {
            println!("Error deleting website: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to delete website"),
            )
        }
    }
}

pub async fn signup_handler(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<UserRegister>,
) -> ApiJsonResponse {
    let UserRegister {
        username,
        password,
        email,
        id,
    } = payload;

    // Hash the password
    let hashed_password = match hash_password(&password).await {
        Ok(hash) => hash,
        Err(e) => {
            println!("Password hashing failed: {:?}", e);
            return ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Internal error during password processing"),
            );
        }
    };

    let user_id = id.unwrap_or_else(Uuid::new_v4);

    let result = sqlx::query(
        "INSERT INTO users (id, username, email, password)
         VALUES ($1, $2, $3, $4)"
    )
    .bind(user_id)
    .bind(&username)
    .bind(&email)
    .bind(&hashed_password)
    .execute(&pool)
    .await;

    match result {
        Ok(_) => ApiJsonResponse(
            StatusCode::CREATED,
            json_success(
                json!({
                    "id": user_id,
                    "username": username,
                    "email": email
                }),
                Some("User created successfully".to_string()),
            ),
        ),
        Err(e) => {
            println!("Error creating user: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Failed to create user"),
            )
        }
    }
}

async fn hash_password(password: &str) -> Result<String, Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)?
        .to_string();

    Ok(password_hash)  
}

#[derive(Deserialize)]
pub struct LoginInfo {
    pub email: String,
    pub password: String,
}

pub async fn login_handler(
    Extension(pool): Extension<PgPool>,
    Json(login_info): Json<LoginInfo>,
) -> ApiJsonResponse {
    let LoginInfo { email, password } = login_info;

    match is_valid_user(&email, &password, &pool).await {
        Ok(Some(user_id)) => {
            let claims = Claims {
                sub: email.clone(),
                exp: (Utc::now() + chrono::Duration::hours(8)).timestamp() as usize,
            };

            match encode(&Header::default(), &claims, &EncodingKey::from_secret("secret".as_ref())) {
                Ok(token) => ApiJsonResponse(
                    StatusCode::OK,
                    json_success(
                        json!({
                            "token": token,
                            "user_id": user_id
                        }),
                        Some("Login successful".into()),
                    ),
                ),
                Err(e) => {
                    println!("JWT creation failed: {:?}", e);
                    ApiJsonResponse(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        json_error("Failed to generate authentication token"),
                    )
                }
            }
        }
        Ok(None) => ApiJsonResponse(
            StatusCode::UNAUTHORIZED,
            json_error("Invalid email or password"),
        ),
        Err(e) => {
            println!("Login DB error: {:?}", e);
            ApiJsonResponse(
                StatusCode::INTERNAL_SERVER_ERROR,
                json_error("Login failed due to internal error"),
            )
        }
    }
}
pub async fn is_valid_user(email: &str, password: &str, pool: &PgPool) -> Result<Option<Uuid>, sqlx::Error> {
    let row = sqlx::query("SELECT id, password FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(pool)
        .await?;

    if let Some(row) = row {
        let stored_hash: String = row.get("password");
        let user_id: Uuid = row.get("id");

        match PasswordHash::new(&stored_hash) {
            Ok(parsed_hash) => {
                let argon2 = Argon2::default();
                if argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok() {
                    return Ok(Some(user_id));
                }
            }
            Err(e) => {
                println!("Password hash parse error: {:?}", e);
            }
        }
    }

    Ok(None) // Either user not found or password mismatch
}
#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user_id: Uuid,
}
pub fn routes() -> Router {
    Router::new()
        .nest(
            "/api",
            Router::new()
                .route("/hello", get(hello))
                .route("/create-website", post(createWebsite))
                .route("/get-website-status", get(getWebsiteStatus))
                .route("/websites", get(getWebsites))
                .route("/delete-website", delete(deleteWebsite))
                .route("/sign-up", post(signup_handler))
                .route("/login", post(login_handler))
                // .layer(middleware::from_fn(auth_middleware))
        )
}