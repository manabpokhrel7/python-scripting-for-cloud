@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")

@app.post('/api/ssh')
async def run_client(host: str, username: str, client_keys: UploadFile = File(...)) -> str:
    key_data = await client_keys.read()
    async with asyncssh.connect(host, username=username, client_keys=[key_data], known_hosts=None) as conn:
        try:
            result = await conn.run('ls /', check=True)
            return result.stdout
        except asyncssh.ProcessError as exc:
            print(exc.stderr, end='')
            print(f'Process exited with status {exc.exit_status}',
                  file=sys.stderr)
        else:
            print(result.stdout, end='')