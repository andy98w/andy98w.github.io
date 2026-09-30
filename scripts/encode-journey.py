"""Regenerate scroll videos from committed frames; requires ffmpeg with libx264."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
assets = root / 'public/assets'
frames = [p for segment in ['courtyard', 'approach', 'desk']
          for p in sorted((assets / 'journey-frames' / segment).glob('*.jpg'))]
assert len(frames) == 423
with tempfile.TemporaryDirectory() as directory:
    playlist = Path(directory) / 'frames.txt'
    playlist.write_text(''.join(f"file '{p}'\nduration 0.0416666667\n" for p in frames))
    for height, crf in [(720, 24), (1080, 26)]:
        subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
                        '-f', 'concat', '-safe', '0', '-i', str(playlist),
                        '-vf', f'scale={height * 16 // 9}:{height}', '-r', '24',
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', str(crf),
                        '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-bf', '0',
                        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
                        str(assets / f'journey-scrub-{height}-v2.mp4')], check=True)
