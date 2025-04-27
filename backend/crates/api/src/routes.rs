use axum::{Router, routing::get, response::IntoResponse};

async fn hello() -> impl IntoResponse {
    "Hello from Rust backend!"
}

async fn createWebsite() -> impl IntoResponse{

}

async fn getWebsiteStatus() -> impl IntoResponse{

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
        )
}
