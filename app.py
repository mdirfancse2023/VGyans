import sys
import os

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")

for d in [backend_dir, root_dir]:
    if os.path.exists(d) and d not in sys.path:
        sys.path.insert(0, d)

import main
app = main.app

__all__ = ["app"]
