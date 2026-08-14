import shutil
from pathlib import Path

git_dir = Path(r"c:\Users\heerg\Downloads\Hackathon\LegalAid1\backend\.git")
if git_dir.exists():
    shutil.rmtree(git_dir, ignore_errors=True)
    print("Removed backend/.git successfully.")
