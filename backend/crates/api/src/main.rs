use api::auth::{login_handler,get_info_handler};
use axum::{routing::{get, post}, Router};

// fn main() {
//     println!("Hello, world!");
// }

#[tokio::main]

async fn main(){

    let app = Router::new().route("/login", post(login_handler)).route("/info", get(get_info_handler));

    let listener= tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("Listening");
    axum :: serve(listener,app).await.unwrap();
}