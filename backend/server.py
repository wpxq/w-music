import os, uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from mutagen import File
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
def get_tracks(name: str):
    playlist_path = os.path.join(music_dir, name)
    if not os.path.exists(playlist_path):
        raise HTTPException(status_code=404, detail="Playlist neexistuje")

    tracks = []
    for filename in os.listdir(playlist_path):
        if any(filename.lower().endswith(ext) for ext in [".flac", ".mp3", ".wav", ".m4a", ".ogg"]):
            f_path = os.path.join(playlist_path, filename)
            mtime = os.path.getmtime(f_path)
            date_added_str = datetime.fromtimestamp(mtime).isoformat()
            
            try:
                audio = File(f_path, easy=True) 
                
                duration = 0
                if audio and audio.info:
                    duration = int(audio.info.length)
                
                tracks.append({
                    "id": f"{name}/{filename}",
                    "title": audio.get("title", [filename])[0] if audio else filename,
                    "artist": audio.get("artist", ["Unknown"])[0] if audio else "Unknown",
                    "date_added": date_added_str,
                    "duration": duration,
                    "url": f"/stream-files/{name}/{filename}"
                })
            except Exception:
                tracks.append({
                    "id": f"{name}/{filename}", 
                    "title": filename, 
                    "artist": "Unknown", 
                    "date_added": date_added_str,
                    "duration": 0,
                    "url": f"/stream-files/{name}/{filename}"
                })
    return {"tracks": tracks}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)