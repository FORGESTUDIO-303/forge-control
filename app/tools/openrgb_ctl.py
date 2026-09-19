"""Forge OpenRGB bridge - list devices, set colors. Needs OpenRGB app with Server tab ON."""
import json
import sys

def offline():
    print(json.dumps({"error": "openrgb-offline",
                      "hint": "Open OpenRGB app > Settings > Server tab > Start Server, then retry"}))

def _client():
    from openrgb import OpenRGBClient
    return OpenRGBClient()

def cmd_list():
    c = _client()
    out = []
    for d in c.devices:
        modes = []
        try:
            modes = [m.name for m in d.modes]
        except Exception:
            pass
        out.append({"name": d.name, "type": str(getattr(d, "type", "?")),
                    "leds": len(d.leds), "modes": modes, "active": getattr(d.active_mode, "name", "")})
    print(json.dumps(out))

def cmd_set(dev_i, mode_name, r, g, b):
    from openrgb.utils import RGBColor
    c = _client()
    d = c.devices[int(dev_i)]
    mode = next((m for m in d.modes if m.name.lower() == mode_name.lower()), None)
    if mode is None:
        raise SystemExit(f"mode '{mode_name}' not on device (has: {[m.name for m in d.modes]})")
    d.set_mode(mode)
    d.set_color(RGBColor(int(r), int(g), int(b)))
    print(json.dumps({"ok": True, "device": d.name, "mode": mode.name}))

if __name__ == "__main__":
    try:
        if sys.argv[1] == "list":
            cmd_list()
        elif sys.argv[1] == "set":
            cmd_set(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6])
        else:
            raise SystemExit("use: list | set <dev> <mode> <r> <g> <b>")
    except ConnectionRefusedError:
        offline()
    except (TimeoutError, OSError) as e:
        if "timed out" in str(e).lower() or isinstance(e, TimeoutError):
            offline()
        else:
            print(json.dumps({"error": str(e)[:200]}))
    except Exception as e:
        print(json.dumps({"error": str(e)[:200]}))
