import sys
import os
import types

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")

for d in [root_dir, backend_dir]:
    if os.path.exists(d) and d not in sys.path:
        sys.path.insert(0, d)

if 'backend' not in sys.modules:
    backend_mod = types.ModuleType('backend')
    backend_mod.__path__ = [root_dir, backend_dir]
    sys.modules['backend'] = backend_mod

try:
    from backend.main import app
except Exception:
    import main
    app = main.app

__all__ = ["app"]
