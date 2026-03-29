import os, uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from mutagen.flac import FLAC
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

music_dir = "/app/music" 
app.mount("/stream-files", StaticFiles(directory=music_dir), name="music")

@app.get("/playlists")
def list_playlists():
    if not os.path.exists(music_dir):
        return {"playlists": []}
    playlists = [d for d in os.listdir(music_dir) if os.path.isdir(os.path.join(music_dir, d))]
    return {"playlists": sorted(playlists)}

@app.get("/playlists/{name}")
def track_from_playlist(name: str):
    playlist_path = os.path.join(music_dir, name)
    if not os.path.exists(playlist_path):
        raise HTTPException(status_code=404, detail="Playlist does not exist")

    tracks = []
    for filename in os.listdir(playlist_path):
        if filename.endswith(".flac"):
            f_path = os.path.join(playlist_path, filename)
            mtime = os.path.getmtime(f_path)
            date_added_str = datetime.fromtimestamp(mtime).isoformat()
            try:
                audio = FLAC(f_path)
                tracks.append({
                    "id": f"{name}/{filename}",
                    "title": audio.get("title", [filename])[0],
                    "artist": audio.get("artist", ["Unknown"])[0],
                    "date_added": date_added_str,
                    "duration": int(audio.info.length)
                })
            except Exception:
                tracks.append({
                    "id": f"{name}/{filename}", 
                    "title": filename, 
                    "artist": "Unknown", 
                    "date_added": date_added_str,
                    "duration": 0
                })
    return {"tracks": tracks}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)