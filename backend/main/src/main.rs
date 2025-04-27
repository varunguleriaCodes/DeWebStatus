use axum::{Router, routing::get_service, Extension};
use api::routes::routes;
use config::get_config;
use db::connection::postgresDb;
use sqlx::PgPool;

#[tokio::main]
async fn main() {
    let config = get_config();

    let db = postgresDb::new().await.expect("Failed to initialize db");
    let pool = db.get_postgres_connection_pool().unwrap();

    // Debug: List tables
    let rows: Vec<(String,)> = sqlx::query_as(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    )
    .fetch_all(&pool)
    .await
    .expect("failed to fetch tables");
    
    println!("Tables in DB:");
    for (table_name,) in rows {
        println!("{}", table_name);
    }

    // Build Axum app
    let app = Router::new()
        .nest("/", routes())
        .layer(Extension(pool));

    let listener = tokio::net::TcpListener::bind(&config.host_port)
        .await
        .expect("Failed to bind");

    println!("Server running at http://{}", config.host_port);

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
