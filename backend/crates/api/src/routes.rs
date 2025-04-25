use actix_web::{get, web, HttpResponse, Scope};

#[get("/hello")]
async fn hello() -> HttpResponse {
    HttpResponse::Ok().body("Hello from Rust backend!")
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/api").service(hello));
}
