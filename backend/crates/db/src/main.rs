// fn main() {
//     println!("Hello, world!");
// }
use sqlx::postgres::PgPoolOptions;
use dotenvy::dotenv;
use std::env;
#[derive(Debug, sqlx::FromRow)]
struct User {
    id: i32,
    name: String,
    email: String,
}

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    dotenv().ok(); // Loads .env
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&pool)
        .await?;

    println!("Total users: {}", row.0);

    let users: Vec<User> = sqlx::query_as::<_, User>("SELECT id, name, email FROM users")
    .fetch_all(&pool)
    .await?;

for user in users {
    println!("{:?}", user);
}


    Ok(())
}
