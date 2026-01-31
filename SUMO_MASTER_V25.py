from pybricks.hubs import PrimeHub, InventorHub
from pybricks.pupdevices import Motor, UltrasonicSensor, Remote, ColorSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Icon, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch
import select
import sys

# ==============================================================================
# === LIVE CONFIG === (Bloque configurable vía Web App o Modo Ingeniero)
# ==============================================================================

# --- A. FÍSICA DEL ROBOT (Calibración de chasis) ---
DIAMETRO_RUEDA     = 56      # Estándar Lego: 56mm. Define la precisión de avance [6, 7].
ANCHO_EJE          = 80      # Distancia entre ruedas. Ajusta la precisión del giro [7, 8].

# --- B. MOTORES Y MARCHAS (Caja de Cambios) ---
# [1: Precisión, 2: Exploración, 3: Turbo]
MARCHAS_CONDUCCION = [350, 650, 1000] # [9-11]
V_MAX              = MARCHAS_CONDUCCION[1] # Velocidad punta activa (mm/s) [8, 13].
ACELERACION_BASE   = 600     # Evita derrapes. Rango seguro: 400-800 [8, 14].
G_VEL_SENS         = 150     # Velocidad de giro para que el sensor no se "maree" [13, 15].

# --- C. SISTEMA DE ARMA (Martillo y Puppeteering) ---
VELOCIDAD_GOLPE    = 1000    # Potencia del motor D (Máx: 1500) [13, 16].
ANGULO_GOLPE       = 180     # Recorrido en grados si no hay grabación manual [1, 16].
PUPPETEERING_ACTIVO = True    # Permite grabar movimientos moviendo el arma con la mano [2, 17].

# --- D. SENSORES Y ESTRATEGIA (IA de Combate) ---
DISTANCIA_ATAQUE   = 300     # "Ojo de Halcón": Rango para detectar al rival (mm) [5, 16].
DISTANCIA_DISPARO  = 100     # Distancia crítica para soltar el martillazo [16, 18].
ESTRATEGIA_ARIETE  = True    # Tras golpear, retrocede para ganar inercia [19, 20].
DIST_RETROCESO     = 150     # Cuántos mm salta hacia atrás en modo Ariete [5, 20].
UMBRAL_LINEA       = 35      # Calibración del suelo: <35 negro, >45 blanco [16, 21].

# --- E. INTERFAZ, PERSONALIDAD Y SONIDO ---
VOLUMEN_GENERAL    = 4       # 0 (Ninja) a 10 (Samurái) [4, 14].
INDICE_CARA        = 5       # 1:Feliz, 2:Enojado, 3:KO, 4:?, 5:Kanji "Dai" (大) [22, 23].
MODO_FANTASMA      = False   # Si es True, apaga la matriz en combate para no dar pistas [24, 25].
DOUBLE_VISION_ON   = True    # Muestra números solapados con dos brillos en el Hub [26, 27].
TIEMPO_ESPERA_INI  = 3000    # Pausa obligatoria por reglamento (ms) [14, 28].

# ==============================================================================

# --- GLOBALES Y ESTADO ---
GRABACION_PUPPET = []
gear_idx = 1
m_idx = 0
pc_control_activo = False
caido = False

# --- MOTOR GRÁFICO ---
FUENTES_COMPRIMIDAS = [
    "00999:00909:00909:00909:00999", "00090:00990:00090:00090:00999", "00999:00009:00999:00900:00999",
    "00999:00009:00999:00009:00999", "00909:00909:00999:00009:00009", "00999:00900:00999:00009:00999",
    "00999:00900:00999:00909:00999", "00999:00009:00090:00090:00090", "00999:00909:00999:00909:00999",
    "00999:00909:00999:00009:00999"
]

CARA_KO = [[100,0,0,0,100],[0,100,0,100,0],[0,0,0,0,0],[0,100,100,100,0],[0,0,0,0,0]]
KANJI_DAI = [[0,0,100,0,0],[100,100,100,100,100],[0,0,100,0,0],[0,100,0,100,0],[100,0,0,0,100]]

def mostrar_num_anton(n):
    if MODO_FANTASMA and m_idx == 2:
        hub.display.off()
        return
    n = max(0, min(99, n))
    d, u = n // 10, n % 10
    mapa_d, mapa_u = FUENTES_COMPRIMIDAS[d], FUENTES_COMPRIMIDAS[u]
    for r in range(5):
        fil_d, fil_u = mapa_d.split(":")[r], mapa_u.split(":")[r]
        for c in range(5):
            brillo = 0
            if fil_d[c] == '9' and DOUBLE_VISION_ON: brillo = 100
            if fil_u[c] == '9': 
                if DOUBLE_VISION_ON: brillo = max(brillo, 30)
                else: brillo = 100
            hub.display.pixel(r, c, brillo)

def tocar_sakura():
    # Sakura Sakura - Adagio (Lento y Solemne)
    melodia = [
        (440, 800), (440, 800), (494, 1600),
        (440, 800), (440, 800), (494, 1600),
        (440, 800), (494, 800), (523, 800), (494, 800), (440, 800), (494, 800), (392, 1600)
    ]
    for f, d in melodia:
        hub.speaker.beep(f, d)
        wait(d // 4)

# --- HARDWARE ---
try: hub = PrimeHub()
except: hub = InventorHub()
hub.speaker.volume(VOLUMEN_GENERAL * 10)

try:
    l_mot = Motor(Port.F, Direction.COUNTERCLOCKWISE)
    r_mot = Motor(Port.E, Direction.CLOCKWISE)
    db = DriveBase(l_mot, r_mot, DIAMETRO_RUEDA, ANCHO_EJE)
    db.settings(V_MAX, ACELERACION_BASE, G_VEL_SENS, ACELERACION_BASE)
    mot_d = Motor(Port.D)
    sensor_ojos = UltrasonicSensor(Port.A)
    sensor_suelo = ColorSensor(Port.B)
except:
    print("Error: Hardware ports.")

rc = None
while rc is None:
    try: rc = Remote(timeout=500); hub.display.icon(Icon.TRUE); wait(200)
    except: wait(200)

# --- LÓGICA DE COMBATE ---
def accionar_arma():
    if GRABACION_PUPPET:
        for p in GRABACION_PUPPET:
            mot_d.run_target(VELOCIDAD_GOLPE, p, wait=False)
            wait(50)
        mot_d.run_target(VELOCIDAD_GOLPE, 0)
    else:
        mot_d.run_target(VELOCIDAD_GOLPE, ANGULO_GOLPE)
        mot_d.run_target(VELOCIDAD_GOLPE, 0)

def set_mode(n):
    global m_idx
    m_idx = n
    cols = [Color.GREEN, Color.ORANGE, Color.MAGENTA, Color.BLUE]
    hub.light.on(cols[m_idx])
    if rc: 
        try: rc.light.on(cols[m_idx])
        except: pass

def ejecutar_modo_ingeniero():
    global V_MAX, gear_idx, GRABACION_PUPPET
    db.stop(); mot_d.stop()
    hub.speaker.beep(1000, 100)
    while Button.BLUETOOTH in hub.buttons.pressed(): wait(10)
    opciones = ["M", "V", "C"]; o_idx = 0
    while True:
        hub.display.char(opciones[o_idx])
        btns = hub.buttons.pressed()
        if Button.RIGHT in btns: o_idx = (o_idx + 1) % len(opciones); wait(250)
        elif Button.LEFT in btns: o_idx = (o_idx - 1) % len(opciones); wait(250)
        elif Button.BLUETOOTH in btns:
            op = opciones[o_idx]
            hub.speaker.beep(1500, 100); wait(500)
            if op == "M" and PUPPETEERING_ACTIVO:
                mot_d.stop(Stop.COAST)
                temp_gr = []
                hub.display.icon(Icon.CLOCK)
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    ang = mot_d.angle()
                    temp_gr.append(ang)
                    mostrar_num_anton(abs(ang) // 10)
                    wait(50)
                if len(temp_gr) > 5: GRABACION_PUPPET = temp_gr
                mot_d.run_target(VELOCIDAD_GOLPE, 0)
            elif op == "V":
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    b = hub.buttons.pressed()
                    if Button.RIGHT in b: gear_idx = (gear_idx + 1) % 3; wait(250)
                    V_MAX = MARCHAS_CONDUCCION[gear_idx]
                    mostrar_num_anton(V_MAX // 10)
            hub.display.text("OK"); wait(500); set_mode(m_idx); break
        wait(10)

# --- BUCLE PRINCIPAL ---
input_poll = select.poll()
input_poll.register(sys.stdin, select.POLLIN)
sw_caida, sw_ing = StopWatch(), StopWatch()
set_mode(0)

# Espera inicial por reglamento
hub.display.icon(KANJI_DAI if INDICE_CARA == 5 else Icon.HAPPY)
wait(TIEMPO_ESPERA_INI)

while True:
    # A. Detección Caída y Sakura Respect
    if hub.imu.up() != Side.FRONT:
        if not caido: caido = True; sw_caida.reset(); db.stop()
        t = 9000 - sw_caida.time()
        if t > 0: mostrar_num_anton(t // 1000)
        else:
            hub.display.icon(CARA_KO)
            tocar_sakura()
            while hub.imu.up() != Side.FRONT: wait(100)
    elif caido: caido = False; set_mode(m_idx)

    # B. Consola PC
    if input_poll.poll(0):
        c = sys.stdin.read(1)
        pc_control_activo = True
        if c == 'w': db.drive(V_MAX, 0)
        elif c == 's': db.drive(-V_MAX, 0)
        elif c == 'a': db.drive(0, -G_VEL_SENS*2)
        elif c == 'd': db.drive(0, G_VEL_SENS*2)
        elif c == ' ': accionar_arma()
        elif c == 'x': db.stop(); pc_control_activo = False

    # C. Control Mando
    try: pressed = rc.buttons.pressed()
    except: pressed = []; rc = None
    if rc is None:
        try: rc = Remote(timeout=0); set_mode(m_idx)
        except: pass

    if not caido and not pc_control_activo:
        if Button.CENTER in pressed: set_mode((m_idx + 1) % 3); wait(300)
        
        # Gearbox (Botón Derecho/Rojo)
        if Button.RIGHT in pressed and m_idx == 0:
            gear_idx = (gear_idx + 1) % 3
            V_MAX = MARCHAS_CONDUCCION[gear_idx]
            db.settings(V_MAX, ACELERACION_BASE, G_VEL_SENS, ACELERACION_BASE)
            hub.speaker.beep(400 + gear_idx*200, 100)
            wait(300)

        # MODO 0: DRIVE (Conducción)
        if m_idx == 0:
            s, t = 0, 0
            if Button.LEFT_PLUS in pressed: s = V_MAX
            if Button.LEFT_MINUS in pressed: s = -V_MAX
            if Button.RIGHT_PLUS in pressed: t = G_VEL_SENS * 3
            if Button.RIGHT_MINUS in pressed: t = -G_VEL_SENS * 3
            db.drive(s, t)
            if Button.LEFT in pressed: accionar_arma()

        # MODO 1: COMBAT (Semi-Automático)
        elif m_idx == 1:
            if sensor_ojos.distance() < DISTANCIA_ATAQUE:
                hub.light.pulse(Color.RED, 500)
                db.drive(V_MAX, 0)
                if sensor_ojos.distance() < DISTANCIA_DISPARO: accionar_arma()
            else:
                db.drive(0, G_VEL_SENS)

        # MODO 2: AUTO (IA Completa con Ariete)
        elif m_idx == 2:
            dist = sensor_ojos.distance()
            if dist < DISTANCIA_ATAQUE:
                db.drive(V_MAX, 0)
                if dist < DISTANCIA_DISPARO:
                    accionar_arma()
                    if ESTRATEGIA_ARIETE:
                        db.straight(-DIST_RETROCESO)
                        db.drive(V_MAX, 0) # Vuelve a la carga
                        wait(400)
            else:
                db.drive(0, G_VEL_SENS)
            
            # Anti-Salida
            if sensor_suelo.reflection() < UMBRAL_LINEA:
                db.straight(-100)
                db.turn(120)

    # D. Engineer Menu
    if Button.BLUETOOTH in hub.buttons.pressed():
        sw_ing.reset()
        while Button.BLUETOOTH in hub.buttons.pressed():
            if sw_ing.time() > 1500: ejecutar_modo_ingeniero(); break
    
    wait(20)
