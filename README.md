# WMUSIC

![wmusic](https://github.com/wpxq/w-music/blob/main/preview_wmusic.png)

---

`wmusic` is a minimalist FLAC streamer running on Docker.

---

## Features
- **Lightweight**: Minimal system requirements thanks to Docker limits.
- **Auto-Playlist**: Folders in `/app/music` are automatically converted to playlists.
- **Lossless Audio**: Full support for FLAC streaming without compression.
- **Searching**: Instant search for songs and artists.
- **Sorting**: Tracks the date files were added to your library.
- **Minimalist UI**: Modern interface without unnecessary clutter and ads. 

## Architecture
- **Frontend**: `Next.js` - Port:`3000`
- **Backend**: `FastAPI` - Port: `8000`
- **Music**: Mounted to `/app/music`

## Docker Limits
- **Web**: 512MB RAM, 0.5 CPU
- **API**: 256MB RAM, 0.25 CPU

## Requirements
- Docker (20.10+)
- Docker Compose (V2)

### Tech Stack (in Docker)
If you're curious about what's going on inside or want to debug it locally:

**Backend:**
- Python 3.11-slim
- FastAPI (Web framework)
- Uvicorn (ASGI server)
- Mutagen (FLAC metadata parser)

**Frontend:**
- Node.js 18+ (Next.js 14)
- Tailwind CSS (styling)
- Lucide React (Icons)

## Setup
```bash
docker compose up -d
```
