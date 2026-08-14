"""
Load Supabase credentials from .env and expose them as module-level constants.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load the .env file sitting one level above app/
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
# .env uses SUPABASE_SECRET_KEY; expose as SERVICE_ROLE_KEY for convenience
SUPABASE_SERVICE_ROLE_KEY: str = os.environ.get("SUPABASE_SECRET_KEY", "")

_missing = [
    name
    for name, val in [
        ("SUPABASE_URL", SUPABASE_URL),
        ("SUPABASE_SECRET_KEY", SUPABASE_SERVICE_ROLE_KEY),
    ]
    if not val
]

if _missing:
    raise RuntimeError(
        f"Missing required env var(s): {', '.join(_missing)}. "
        f"Check your .env file at {_env_path}"
    )
