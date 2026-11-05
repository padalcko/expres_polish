#!/usr/bin/env python3
"""Build in dependency order; --check verifies every output without writing."""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[1]
args=['--check'] if '--check' in sys.argv else []
for script in ('build-blog.py','build-ai-search.py'):
    subprocess.run([sys.executable,str(root/'scripts'/script),*args],cwd=root,check=True)
