path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { useEffect, useState } from "react";
import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";'''

new = '''import { useEffect, useState } from "react";
import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";
import ToggleSwitch from "@/components/ToggleSwitch";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

with open(path, "w") as f:
    f.write(content)
print("OK: paso 2 - imports agregados")
