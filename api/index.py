import sys
import os
import types

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Alias root directory as 'backend' package in sys.modules for Vercel
if 'backend' not in sys.modules:
    backend_mod = types.ModuleType('backend')
    backend_mod.__path__ = [root_dir]
    sys.modules['backend'] = backend_mod

try:
    from backend.main import app
except Exception:
    import main
    app = main.app

__all__ = ["app"]
