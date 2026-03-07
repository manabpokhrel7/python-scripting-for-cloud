from sqlalchemy.orm import sessionmaker
from database.config import settings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# #Using asyncpg driver which is async non blocking instead of psycopg2
# engine = create_async_engine(
#     f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASS}"
#     f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}", echo=True
# )

#FOr cloud SQL
# Cloud SQL socket path
DB_SOCKET_PATH = f"/cloudsql/{settings.CLOUD_SQL_INSTANCE}" if hasattr(settings, "CLOUD_SQL_INSTANCE") else settings.DB_HOST

engine = create_async_engine(
    f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASS}@{DB_SOCKET_PATH}/{settings.DB_NAME}",
    echo=True
)

#Creating session maker
Session = sessionmaker(engine, class_=AsyncSession)
async def get_db():
    async with Session() as session:
        yield session