import time
import base64
import requests
import urllib.parse
from typing import List

try:
    from .base import MusicProviderStrategy
    from ...schemas.song import SongDTO
    from ...core.config import settings
except ModuleNotFoundError:
    from backend.providers.music.base import MusicProviderStrategy
    from backend.schemas.song import SongDTO
    from backend.core.config import settings

class SpotifyMusicProvider(MusicProviderStrategy):
    def __init__(self):
        self._token_cache = {"token": "", "expires_at": 0}

    def _get_access_token(self) -> str:
        now = time.time()
        if self._token_cache["token"] and self._token_cache["expires_at"] > now:
            return self._token_cache["token"]

        client_id = settings.SPOTIFY_CLIENT_ID
        client_secret = settings.SPOTIFY_CLIENT_SECRET

        try:
            auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode('utf-8')).decode('utf-8')
            resp = requests.post(
                "https://accounts.spotify.com/api/token",
                data={"grant_type": "client_credentials"},
                headers={
                    "Authorization": f"Basic {auth_header}",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout=8
            )
            if resp.status_code == 200:
                data = resp.json()
                token = data.get("access_token", "")
                expires_in = data.get("expires_in", 3600)
                self._token_cache = {
                    "token": token,
                    "expires_at": now + expires_in - 60
                }
                return token
        except Exception as e:
            print(f"Spotify token exception: {e}")
        return ""

    def search_tracks(self, query: str, limit: int = 10) -> List[SongDTO]:
        q_term = (query or "latest hindi songs").strip()
        token = self._get_access_token()
        if not token:
            return self._get_fallback_catalog(q_term)

        safe_limit = min(max(1, limit), 10)
        headers = {'Authorization': f'Bearer {token}', 'Accept': 'application/json'}

        items = []
        try:
            url = f"https://api.spotify.com/v1/search?q={urllib.parse.quote(q_term)}&type=track&limit={safe_limit}"
            r = requests.get(url, headers=headers, timeout=6)
            if r.status_code == 200:
                items = r.json().get("tracks", {}).get("items", [])
        except Exception as e:
            print(f"Primary Spotify search error: {e}")

        if not items:
            try:
                words = [w for w in q_term.split() if w.lower() not in ("latest", "top", "50", "hit", "hits", "songs", "music", "beats")]
                short_q = words[0] if words else (q_term.split()[0] if q_term.split() else "hindi")
                fb_url = f"https://api.spotify.com/v1/search?q={urllib.parse.quote(short_q)}&type=track&limit={safe_limit}"
                r_fb = requests.get(fb_url, headers=headers, timeout=6)
                if r_fb.status_code == 200:
                    items = r_fb.json().get("tracks", {}).get("items", [])
            except Exception as e:
                print(f"Fallback Spotify search error: {e}")

        tracks: List[SongDTO] = []
        for item in items:
            try:
                s_id = str(item.get("id", ""))
                title = str(item.get("name", ""))
                artists = [str(a.get("name", "")) for a in item.get("artists", []) if a.get("name")]
                artist_str = ", ".join(artists) if artists else "Official Artist"
                album_obj = item.get("album", {})
                album_name = str(album_obj.get("name", q_term.title()))
                images = album_obj.get("images", [])
                cover_url = images[0].get("url") if images else "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500"
                dur_ms = item.get("duration_ms", 240000)
                dur_sec = int(dur_ms / 1000)
                preview_url = str(item.get("preview_url") or "")
                spotify_link = str(item.get("external_urls", {}).get("spotify", f"https://open.spotify.com/track/{s_id}"))

                audio_src = preview_url if (preview_url and preview_url.startswith("http")) else ""
                if not audio_src:
                    try:
                        q_str = urllib.parse.quote(f"{title} {artist_str}".strip())
                        a_url = f"https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&query={q_str}"
                        a_req = requests.get(a_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=2)
                        if a_req.status_code == 200:
                            a_songs = a_req.json().get('songs', {}).get('data', [])
                            if a_songs:
                                vlink = str(a_songs[0].get('more_info', {}).get('vlink') or '')
                                if vlink and vlink.startswith('http'):
                                    audio_src = vlink
                    except Exception:
                        pass

                tracks.append(SongDTO(
                    id=f"sp-{s_id}",
                    spotifyId=s_id,
                    title=title,
                    artist=artist_str,
                    album=album_name,
                    category=q_term.title(),
                    coverUrl=cover_url,
                    audioUrl=audio_src or "https://jiotunepreview.jio.com/content/Converted/010910141580615.mp3",
                    url=spotify_link,
                    embedUrl=f"https://open.spotify.com/embed/track/{s_id}",
                    duration=dur_sec,
                    provider="spotify"
                ))
            except Exception as err:
                print(f"Error parsing track item: {err}")

        if not tracks:
            return self._get_fallback_catalog(q_term)

        return tracks

    def _get_fallback_catalog(self, q_term: str) -> List[SongDTO]:
        return [
            SongDTO(id="sp-fb1", spotifyId="1ai3itvPFcWilE9NX0JTCf", title="Mera Mann Kehne Laga", artist="Falak Shabir", album="Nautanki Saala!", category=q_term.title(), coverUrl="https://c.saavncdn.com/500/Nautanki-Saala-Hindi-2013-500x500.jpg", audioUrl="https://jiotunepreview.jio.com/content/Converted/010912023321219.mp3", url="https://open.spotify.com/track/1ai3itvPFcWilE9NX0JTCf", embedUrl="https://open.spotify.com/embed/track/1ai3itvPFcWilE9NX0JTCf", duration=225, provider="spotify"),
            SongDTO(id="sp-fb2", spotifyId="0qVNxbFE4EUV3mNFodXiln", title="Saadi Galli Aaja", artist="Ayushmann Khurrana, Neeti Mohan", album="Nautanki Saala!", category=q_term.title(), coverUrl="https://c.saavncdn.com/500/Nautanki-Saala-Hindi-2013-500x500.jpg", audioUrl="https://jiotunepreview.jio.com/content/Converted/010910090394927.mp3", url="https://open.spotify.com/track/0qVNxbFE4EUV3mNFodXiln", embedUrl="https://open.spotify.com/embed/track/0qVNxbFE4EUV3mNFodXiln", duration=255, provider="spotify"),
            SongDTO(id="sp-fb3", spotifyId="0Y6YW1552df031DjV8qBHv", title="Kesariya", artist="Arijit Singh, Pritam", album="Brahmastra", category=q_term.title(), coverUrl="https://c.saavncdn.com/500/Brahmastra-Hindi-2022-500x500.jpg", audioUrl="https://jiotunepreview.jio.com/content/Converted/010910141580615.mp3", url="https://open.spotify.com/track/0Y6YW1552df031DjV8qBHv", embedUrl="https://open.spotify.com/embed/track/0Y6YW1552df031DjV8qBHv", duration=268, provider="spotify"),
            SongDTO(id="sp-fb4", spotifyId="4IfzlXpqWp4jKK1RM84iOc", title="deepika", artist="KOAD", album="deepika", category=q_term.title(), coverUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500", audioUrl="https://jiotunepreview.jio.com/content/Converted/010912291932800.mp3", url="https://open.spotify.com/track/4IfzlXpqWp4jKK1RM84iOc", embedUrl="https://open.spotify.com/embed/track/4IfzlXpqWp4jKK1RM84iOc", duration=261, provider="spotify")
        ]
