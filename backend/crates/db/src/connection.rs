use sqlx::postgres::PgPoolOptions;
use dotenvy::dotenv;
use std::env;
pub struct postgresDb{
    pool: sqlx::Pool<sqlx::Postgres>,
}

impl postgresDb{

    pub async fn new()->Result<Self,sqlx::Error>{
        dotenv().ok();
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
        

        let pool = PgPoolOptions::new().max_connections(5).connect(&database_url).await?;

        println!("Database Connected: {}", database_url);

        Ok(Self{pool})
    }

    pub fn get_postgres_connection_pool(&self)-> Result<sqlx::Pool<sqlx::Postgres>, sqlx::Error>{
        Ok(self.pool.clone())
    } 
}