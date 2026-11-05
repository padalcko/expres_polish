#!/usr/bin/env python3
"""Generate AI representations; --check detects drift without writing."""
import sys
sys.dont_write_bytecode=True
from ai_resources import ROOT, outputs

def main():
    expected=outputs();stale=[]
    for name,content in expected.items():
        path=ROOT/name
        if '--check' in sys.argv:
            if not path.exists() or path.read_text()!=content:stale.append(name)
        else:
            path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    if stale:raise SystemExit('Stale AI resources: '+', '.join(stale))
    print(f'AI resources: {len(expected)} files '+('fresh' if '--check' in sys.argv else 'generated'))
if __name__=='__main__':main()
