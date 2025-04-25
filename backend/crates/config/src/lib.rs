use std::env;

pub struct Config {
    pub host_port: String,
}

pub fn get_config() -> Config {
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());

    Config {
        host_port: format!("{}:{}", host, port),
    }
}
