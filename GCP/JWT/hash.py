from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
async def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


async def get_password_hash(password):
    return password_hash.hash(password)