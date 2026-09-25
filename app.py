import os
import json
import threading
import time
from datetime import datetime, timedelta
import zoneinfo
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "bazar_tafraout_habib_lkens_secure_key_2026_torino")

# Directory per la persistenza dei dati
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

STATUS_FILE = os.path.join(DATA_DIR, "status_override.json")
ANALYTICS_FILE = os.path.join(DATA_DIR, "analytics.json")

# Password riservata moderatore
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Torino_2026")

# Fuso orario per l'Italia (Torino)
def get_torino_now():
    try:
        tz = zoneinfo.ZoneInfo("Europe/Rome")
        return datetime.now(tz)
    except Exception:
        # Fallback nel caso in cui zoneinfo non abbia tzdata su Windows
        # Calcolo approssimato per ora estiva / invernale italiana (UTC+2 in estate, UTC+1 in inverno)
        utc_now = datetime.utcnow()
        # Semplice offset +2 (ora legale) o +1
        # Tra fine marzo e fine ottobre è UTC+2
        is_dst = (3, 31) <= (utc_now.month, utc_now.day) <= (10, 31)
        offset = timedelta(hours=2 if is_dst else 1)
        return utc_now + offset

# Inizializza i file di configurazione se non esistono
def load_override():
    if not os.path.exists(STATUS_FILE):
        default_data = {
            "active": False,
            "color": "green",
            "notice": "",
            "start_date": "",
            "expires_at": ""
        }
        save_override(default_data)
        return default_data
    try:
        with open(STATUS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            
            # Controlla se l'override è scaduto
            if data.get("active") and data.get("expires_at"):
                try:
                    expiry_dt = datetime.fromisoformat(data["expires_at"])
                    now = get_torino_now()
                    # Rimuovi timezone per confronto se necessario
                    if expiry_dt.tzinfo is not None and now.tzinfo is not None:
                        is_expired = now >= expiry_dt
                    else:
                        is_expired = now.replace(tzinfo=None) >= expiry_dt.replace(tzinfo=None)
                    
                    if is_expired:
                        data["active"] = False
                        save_override(data)
                except Exception as ex:
                    print("Errore controllo scadenza override:", ex)
            return data
    except Exception:
        return {"active": False, "color": "green", "notice": "", "start_date": "", "expires_at": ""}

def save_override(data):
    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_analytics():
    if not os.path.exists(ANALYTICS_FILE):
        default_data = {
            "daily": {},
            "total": 0,
            "recent_ips": {}
        }
        save_analytics(default_data)
        return default_data
    try:
        with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"daily": {}, "total": 0, "recent_ips": {}}

def save_analytics(data):
    with open(ANALYTICS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Registra visita evitando spam di refresh (finestra di 30 minuti per stesso IP)
def record_visit(ip):
    analytics = load_analytics()
    now = get_torino_now()
    today_str = now.strftime("%Y-%m-%d")
    current_ts = int(now.timestamp())

    # Se l'IP ha già visitato negli ultimi 30 minuti (1800 secondi), aggiorna timestamp ma non il contatore
    recent_ips = analytics.get("recent_ips", {})
    last_visit = recent_ips.get(ip, 0)
    
    if current_ts - last_visit > 1800:
        recent_ips[ip] = current_ts
        # Pulisci IP più vecchi di 24 ore per non ingolfare il file
        cleaned_ips = {k: v for k, v in recent_ips.items() if current_ts - v < 86400}
        analytics["recent_ips"] = cleaned_ips
        
        # Incrementa visite di oggi
        daily = analytics.get("daily", {})
        daily[today_str] = daily.get(today_str, 0) + 1
        analytics["daily"] = daily
        analytics["total"] = analytics.get("total", 0) + 1
        save_analytics(analytics)

# Calcolo dello stato automatico del negozio
def calculate_shop_status():
    override = load_override()
    now = get_torino_now()
    weekday = now.weekday()  # 0=Lunedì, 5=Sabato, 6=Domenica
    current_time_str = now.strftime("%H:%M")
    current_minutes = now.hour * 60 + now.minute

    # Giorni della settimana in italiano
    giorni_it = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
    mesi_it = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
    
    giorno_corrente = f"{giorni_it[weekday]} {now.day} {mesi_it[now.month - 1]} {now.year}"
    orario_corrente = now.strftime("%H:%M:%S")

    # Se c'è un override attivo e valido
    if override.get("active"):
        color = override.get("color", "green")
        notice = override.get("notice", "Avviso speciale dal titolare")
        
        status_label = "Aperto (Straordinario)" if color == "green" else ("In chiusura / Avviso" if color == "orange" else "Chiuso (Straordinario)")
        return {
            "status": "override",
            "color": color,
            "label": status_label,
            "message": notice,
            "is_override": True,
            "expires_at": override.get("expires_at"),
            "now_time": orario_corrente,
            "now_date": giorno_corrente,
            "hours_today": "Gestione Straordinaria attiva"
        }

    # Orari ordinari:
    # Lunedì - Venerdì (0 - 4): 08:30 - 20:50
    # Sabato (5): 09:00 - 20:30
    # Domenica (6): Chiuso
    
    if weekday in [0, 1, 2, 3, 4]:
        # Lunedì - Venerdì
        hours_desc = "08:30 – 20:50"
        open_min = 8 * 60 + 30    # 510 min (08:30)
        close_min = 20 * 60 + 50  # 1250 min (20:50)
        warning_min = close_min - 10 # 1240 min (20:40)

        if current_minutes < open_min:
            return {
                "status": "closed",
                "color": "red",
                "label": "Chiuso",
                "message": "Il negozio è attualmente chiuso. Riapertura oggi alle ore 08:30.",
                "is_override": False,
                "now_time": orario_corrente,
                "now_date": giorno_corrente,
                "hours_today": hours_desc
            }
        elif open_min <= current_minutes < warning_min:
            return {
                "status": "open",
                "color": "green",
                "label": "Aperto Adesso",
                "message": "Il negozio è aperto! Ti aspettiamo in Via S. Giovanni Battista la Salle 9/F.",
                "is_override": False,
                "now_time": orario_corrente,
                "now_date": giorno_corrente,
                "hours_today": hours_desc
            }
        elif warning_min <= current_minutes < close_min:
            return {
                "status": "closing_soon",
                "color": "orange",
                "label": "In Fase di Chiusura",
                "message": "Il negozio è in fase di chiusura, passa domani mattina.",
                "is_override": False,
                "now_time": orario_corrente,
                "now_date": giorno_corrente,
                "hours_today": hours_desc
            }
        else:
            next_day_msg = "Riapertura domani mattina alle 08:30." if weekday < 4 else "Riapertura sabato alle ore 09:00."
            return {
                "status": "closed",
                "color": "red",
                "label": "Chiuso",
                "message": f"Il negozio ha chiuso per la giornata odierna. {next_day_msg}",
                "is_override": False,
                "now_time": orario_corrente,
                "now_date": giorno_corrente,
                "hours_today": hours_desc
            }

    elif weekday == 5:
        # Sabato
        hours_desc = "09:00 – 20:30"
        open_min = 9 * 60         # 540 min (09:00)
        close_min = 20 * 60 + 30  # 1230 min (20:30)
        warning_min = close_min - 10 # 1220 min (20:20)

        if current_minutes < open_min:
            return {
                "status": "closed",
                "color": "red",
                "label": "Chiuso",
                "message": "Il negozio è attualmente chiuso. Riapertura oggi alle ore 09:00.",
                "is_override": False,
                "now_time": orario_corrente,
                "now_date": giorno_corrente,
                "hours_today": hours_desc
            }
        elif open_min <= current_minutes < warning_min:
            return {
                "status": "open",
                "color": "green",
                "label": "Aperto Adesso",
                "message": "Il negozio è aperto! Ti aspettiamo in Via S. Giovanni Battista la Salle 9/F.",
                "is_override": False,
                "now_time": orario_corrente,
                "now_date": giorno_corrente,
                "hours_today": hours_desc
            }
        elif warning_min <= current_minutes < close_min:
            return {
                "status": "closing_soon",
                "color": "orange",
                "label": "In Fase di Chiusura",
                "message": "Il negozio è in fase di chiusura, passa domani mattina.",
                "is_override": False,
                "now_time": orario_corrente,
                "now_date": giorno_corrente,
                "hours_today": hours_desc
            }
        else:
            return {
                "status": "closed",
                "color": "red",
                "label": "Chiuso",
                "message": "Il negozio ha chiuso per il fine settimana. Riapertura Lunedì alle ore 08:30.",
                "is_override": False,
                "now_time": orario_corrente,
                "now_date": giorno_corrente,
                "hours_today": hours_desc
            }

    else:
        # Domenica (6)
        return {
            "status": "closed",
            "color": "red",
            "label": "Chiuso",
            "message": "Domenica: Chiuso per riposo settimanale. Vi aspettiamo Lunedì mattina alle 08:30!",
            "is_override": False,
            "now_time": orario_corrente,
            "now_date": giorno_corrente,
            "hours_today": "Chiuso per riposo settimanale"
        }

# Calcolo statistiche visite (Oggi, Settimana, Mese, e storico per grafico)
def get_analytics_summary():
    analytics = load_analytics()
    daily = analytics.get("daily", {})
    now = get_torino_now()
    
    today_str = now.strftime("%Y-%m-%d")
    visits_today = daily.get(today_str, 0)

    # Visite ultimi 7 giorni
    visits_week = 0
    chart_labels = []
    chart_data = []
    giorni_brevi = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]

    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        cnt = daily.get(day_str, 0)
        visits_week += cnt
        
        label = f"{giorni_brevi[day.weekday()]} {day.day}/{day.month}"
        chart_labels.append(label)
        chart_data.append(cnt)

    # Visite questo mese
    current_year_month = now.strftime("%Y-%m")
    visits_month = 0
    for day_str, count in daily.items():
        if day_str.startswith(current_year_month):
            visits_month += count

    return {
        "today": visits_today,
        "week": visits_week,
        "month": visits_month,
        "total": analytics.get("total", visits_month),
        "chart_labels": chart_labels,
        "chart_data": chart_data
    }

# ----------------- ROTTE APPLICAZIONE -----------------

@app.route("/")
def index():
    # Registra visita
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()
    record_visit(client_ip or "127.0.0.1")
    
    status_info = calculate_shop_status()
    return render_template("index.html", status=status_info)

@app.route("/api/status")
def api_status():
    return jsonify(calculate_shop_status())

@app.route("/admin")
def admin_page():
    if not session.get("is_admin"):
        return render_template("admin.html", authenticated=False, error=None)
    
    stats = get_analytics_summary()
    status_info = calculate_shop_status()
    override = load_override()
    return render_template("admin.html", authenticated=True, stats=stats, status=status_info, override=override)

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}
    password = data.get("password", "").strip()
    
    if password == ADMIN_PASSWORD:
        session["is_admin"] = True
        return jsonify({"success": True, "redirect": url_for("admin_page")})
    else:
        return jsonify({"success": False, "message": "Password errata. Accesso non autorizzato."}), 401

@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.pop("is_admin", None)
    return jsonify({"success": True, "redirect": url_for("index")})

@app.route("/api/admin/override", methods=["POST"])
def api_admin_override():
    if not session.get("is_admin"):
        return jsonify({"success": False, "message": "Non autorizzato"}), 403
    
    data = request.get_json() or {}
    action = data.get("action")
    
    if action == "disable":
        # Disattiva override e ripristina orari automatici
        override_data = {
            "active": False,
            "color": "green",
            "notice": "",
            "start_date": "",
            "expires_at": ""
        }
        save_override(override_data)
        return jsonify({"success": True, "message": "Orari automatici ripristinati con successo!"})
    
    # Altrimenti attiva o aggiorna override
    color = data.get("color", "green")
    notice = data.get("notice", "").strip()
    start_date = data.get("start_date", "")
    expires_at = data.get("expires_at", "")
    
    if not expires_at:
        return jsonify({"success": False, "message": "È obbligatorio specificare la data e l'ora di fine validità."}), 400
    
    if not notice:
        notice = "Avviso speciale dal titolare del negozio."

    override_data = {
        "active": True,
        "color": color,
        "notice": notice,
        "start_date": start_date or get_torino_now().strftime("%Y-%m-%dT%H:%M"),
        "expires_at": expires_at
    }
    save_override(override_data)
    return jsonify({"success": True, "message": "Stato negozio aggiornato con successo!"})

@app.route("/api/admin/stats")
def api_admin_stats():
    if not session.get("is_admin"):
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify(get_analytics_summary())

# Endpoint Keep-Alive per Render (previene lo sleep con ping automatico)
@app.route("/api/ping")
@app.route("/healthz")
def keep_alive():
    return jsonify({
        "status": "healthy",
        "service": "bazar-tafraout-api",
        "time": get_torino_now().isoformat()
    })

# Thread opzionale di self-ping per Render Free tier
def start_anti_sleep_worker():
    render_url = os.environ.get("RENDER_EXTERNAL_URL")
    if not render_url:
        return
    
    import urllib.request
    def ping_job():
        ping_target = f"{render_url.rstrip('/')}/api/ping"
        while True:
            try:
                # Aspetta 12 minuti (720 secondi) prima del prossimo ping
                time.sleep(720)
                req = urllib.request.Request(ping_target, headers={'User-Agent': 'Bazar-AntiSleep-Daemon/1.0'})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    resp.read()
            except Exception as e:
                print("Anti-sleep ping:", e)
                time.sleep(60)

    worker = threading.Thread(target=ping_job, daemon=True)
    worker.start()

# Avvia worker se presente variabile di ambiente
if os.environ.get("RENDER_EXTERNAL_URL"):
    start_anti_sleep_worker()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Bazar Tafraout avviato con successo su http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
