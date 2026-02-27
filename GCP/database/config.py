#we are just creating a variable to use later here in this class. We dont use functions because pydantic requires class
#so in this class we just create already validated exported values like settings.DB_HOST
#this value is already validated by BaseSettings which is specifically designed class to validate automatically
#orelse we would have to write alot of code like we did in flask with UserSchema etc to validate
#Here pydantic auto detects the type like int , str and validates it
#Documentation : https://docs.pydantic.dev/latest/concepts/pydantic_settings/
import os
from pydantic import Field
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    #Database values and settings
    DB_HOST: str = Field(default="localhost")
    DB_USER: str = Field(default="manab")
    DB_PORT: int = Field(default=5432)
    DB_PASS: str = Field(default="strongpass")
    DB_NAME: str = Field(default="mydb")

    # #Redis config
    # REDIS_HOST: str = Field(default="redis") #if you are running python from inside container and you wanna access it to outside container redis then you use the container name especially in docker compose because if you use localhost:6379 from isnide python container than localhpost there isnt redis
    # REDIS_PORT: int = Field(default=6379)

    # Environment settings/non Technical just to define the environment
    ENV: str = Field(default="local")  # local, dev, staging, prod
    LOG_LEVEL: str = Field(default="INFO")

    #For JWT authentication we need some config parameters to generate JWT token
    # JWT_SECRET: str = Field(default="super-secret-change-me")
    # JWT_ALGORITHM: str = Field(default="HS256")
    # ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15)
    # REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    #We choose nested class name Config because it is written in pydantic documentation that pydantic
    #loads the config from the "Config" nested class this is case sensitive it is the rule to label it
    #as "Config" from documentation: https://docs.pydantic.dev/latest/concepts/models/#model-config
    class Config: #Dont write () in this nested class you dont inherit anything here
        env_file = ".env"
        env_file_encoding = "utf-8" #even the arguement name should be the same "env_file" case sensitive

settings = Settings() #To initialize the settings class