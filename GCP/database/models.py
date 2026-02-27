#we are using sql alchemy to create the database instead of writing the RAW sql
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

class Base(DeclarativeBase): #DeclarativeBase is a special keyword from sqlalchemy it has structure of the tables and things required to create db
    pass #pass is special keyword in python to just create a class/fun and do nothing
class Items(Base):
    __tablename__ = "items"  #tablename is a special keyword in sqlalchemy used to define the table name
    id: Mapped[int] = mapped_column(primary_key=True) #mapped_column is also a special keyword used to create the column in db
    product: Mapped[str] = mapped_column(String(30))
    description: Mapped[str] = mapped_column(String(30))
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("auth_table.id"), nullable=False
    )
class Auth(Base):
    __tablename__ = "auth_table"  #tablename is a special keyword in sqlalchemy used to define the table name
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(30))
    hashed_password: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)