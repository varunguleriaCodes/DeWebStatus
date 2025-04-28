use axum::{extract::Query, middleware, response::IntoResponse, routing::{get, post}, Extension, Json, Router};
use serde_json::json;
use uuid::Uuid;
use crate::{auth::auth_middleware, models::{User, WebsiteQuery}};
use sqlx::{postgres::PgRow, PgPool, Row};
use serde::Deserialize;
use crate::models::Website;

async fn hello() -> impl IntoResponse {
    "Hello from Rust backend!"
}


async fn createWebsite(
    Extension(pool): Extension<PgPool>,
    Json(payload): Json<Website>,
) -> impl IntoResponse {
    println!("Url: {}",payload.url);
    let result = sqlx::query!(
        "INSERT INTO websites (url, user_id, disabled) VALUES ($1, $2, $3)",
        payload.url,
        payload.user_id,
        payload.disabled
    )
    .execute(&pool)
    .await;

    match result {
        Ok(_) => "Website created successfully!".into_response(),
        Err(e) => {
            println!("DB error: {:?}", e);
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Failed to create website").into_response()
        }
    }
}

async fn getWebsiteStatus(
    Extension(user): Extension<User>,  // <- New! Comes from auth_middleware
    Extension(pool): Extension<PgPool>,
    Query(query): Query<WebsiteQuery>
) -> impl IntoResponse {
    let website_id = query.id;
    let user_id = query.user_id;

    // First, get the website with the disabled condition
    let website_result = sqlx::query(
        "SELECT id, url, user_id, disabled 
         FROM websites 
         WHERE id = $1 AND user_id = $2 AND disabled = false"
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
                 WHERE wt.website_id = $1"
            )
            .bind(website_id)
            .fetch_all(&pool)
            .await;

            match ticks_result {
                Ok(tick_rows) => {
                    // Convert tick rows to JSON objects
                    let ticks = tick_rows.iter().map(|row| {
                        json!({
                            "id": row.get::<Uuid, _>("id"),
                            "websiteId": row.get::<Uuid, _>("website_id"),
                            "validatorId": row.get::<Uuid, _>("validator_id"),
                            "status": row.get::<String, _>("status"),
                            "latency": row.get::<f64, _>("latency")
                        })
                    }).collect::<Vec<_>>();

                    // Build complete response with website and ticks
                    let response = json!({
                        "id": website_id,
                        "url": website_row.get::<String, _>("url"),
                        "userId": website_row.get::<Uuid, _>("user_id"),
                        "disabled": website_row.get::<bool, _>("disabled"),
                        "ticks": ticks
                    });

                    Json(response).into_response()
                },
                Err(e) => {
                    println!("Error fetching ticks: {:?}", e);
                    // Return website without ticks if there was an error fetching ticks
                    let response = json!({
                        "id": website_id,
                        "url": website_row.get::<String, _>("url"),
                        "userId": website_row.get::<Uuid, _>("user_id"),
                        "disabled": website_row.get::<bool, _>("disabled"),
                        "ticks": []
                    });
                    
                    Json(response).into_response()
                }
            }
        },
        Ok(None) => {
            (axum::http::StatusCode::NOT_FOUND, "Website not found").into_response()
        },
        Err(e) => {
            println!("Error fetching website: {:?}", e);
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch website data").into_response()
        }
    }
}

async fn getWebsites() -> impl IntoResponse{

}

async fn deleteWebsite() -> impl IntoResponse{

}

pub fn routes() -> Router {
    Router::new()
        .nest(
            "/api",
            Router::new()
                .route("/hello", get(hello))
                .route("/create-website", post(createWebsite))
                // .route("/get-website-status", get(getWebsiteStatus))
                // .layer(middleware::from_fn(auth_middleware))
        )
}
