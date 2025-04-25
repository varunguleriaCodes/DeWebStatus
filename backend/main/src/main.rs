use actix_web::{App, HttpServer};
use api::routes::routes;
use config::get_config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = get_config();

    println!("Starting server at http://{}", config.host_port);

    HttpServer::new(move || {
        App::new()
            .configure(routes)
    })
    .bind(&config.host_port)?
    .run()
    .await
}
