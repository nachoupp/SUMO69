from pybricks.hubs import InventorHub
from pybricks.pupdevices import Motor, UltrasonicSensor, Remote
from pybricks.parameters import Button, Color, Direction, Port, Side, Icon
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

# ============================================================
# 1. 📂 CONFIGURACIÓN Y ACTIVOS (ASSETS)
# ============================================================
FUENTES_COMPRIMIDAS = [
    "00999:00909:00909:00909:00999", "00090:00990:00090:00090:00999", "00999:00009:00999:00900:00999",
    "00999:00009:00999:00009:00999", "00909:00909:00999:00009:00009", "00999:00900:00999:00009:00999",
    "00999:00900:00999:00909:00999", "00999:00009:00090:00090:00090", "00999:00909:00999:00909:00999",
    "00999:00909:00999:00009:00999"
]

KANJI_SAKURA = [
    "00900:09990:00900:09990:00900", # Ejemplo de Kanji simple
    "00000:00900:09990:00900:00000"
]

# ============================================================
# 2. 🎮 VARIABLES GLOBALES (CONSOLA)
# ============================================================
V_MAX = 800
G_VEL = 300
R_RETROCESO = 150
M_ANGULO = 180
A_VOLUMEN = 5
P_PERSONALIDAD = 1
H_MAX_HACKS = 1

# ============================================================
# 3. 🛠️ INFRAESTRUCTURA MAESTRA (CAJA NEGRA)
# ============================================================
hub = InventorHub()
sw_global = StopWatch()

def mostrar_num_anton(n):
    n = max(0, min(99, n))
    decenas = n // 10
    unidades = n % 10
    mapa_d = FUENTES_COMPRIMIDAS[decenas]
    mapa_u = FUENTES_COMPRIMIDAS[unidades]
    for r in range(5):
        fila_d = mapa_d.split(":")[r]
        fila_u = mapa_u.split(":")[r]
        for c in range(5):
            brillo = 0
            if fila_u[c] == '9': brillo = 100
            elif fila_d[c] == '9': brillo = 30
            hub.display.pixel(r, c, brillo)

def tocar_sakura():
    # A(440), A(440), B(494), A(440), A(440), B(494), A(440), B(494), C(523), B(494), A(440), F(349)
    melodia = [
        (440, 400, 100), (440, 400, 100), (494, 800, 200),
        (440, 400, 100), (440, 400, 100), (494, 800, 200),
        (440, 300, 50), (494, 300, 50), (523, 600, 100),
        (494, 300, 50), (440, 300, 50), (349, 800, 200)
    ]
    for freq, dur, pause in melodia:
        hub.speaker.beep(freq, dur)
        wait(pause)

def animar_kanji():
    # Animación simple de rotación/brillo para el Kanji
    for b in [30, 60, 100, 60, 30]:
        for r in range(5):
            for c in range(5):
                if KANJI_SAKURA[0].split(":")[r][c] == '9':
                    hub.display.pixel(r, c, b)
        wait(100)

# ============================================================
# 4. INICIALIZACIÓN DE HARDWARE
# ============================================================
try:
    l_mot = Motor(Port.F, Direction.COUNTERCLOCKWISE)
    r_mot = Motor(Port.E, Direction.CLOCKWISE)
    db = DriveBase(l_mot, r_mot, 56, 80)
    db.settings(400, 600, 200, 400)
    
    mot_d = Motor(Port.D)
    sensor = UltrasonicSensor(Port.A)
except:
    print("Error: Port hardware mismatch.")

rc = None
m_idx = 0
modo_colores = [Color.GREEN, Color.ORANGE, Color.MAGENTA, Color.BLUE]

def set_mode(n):
    global m_idx
    m_idx = n
    hub.light.on(modo_colores[m_idx])
    if rc:
        try: rc.light.on(modo_colores[m_idx])
        except: pass

# ============================================================
# 5. CONSOLA DE INGENIERÍA (MODO MENÚ)
# ============================================================
def ejecutar_modo_ingeniero():
    global V_MAX, G_VEL, R_RETROCESO, M_ANGULO, A_VOLUMEN, P_PERSONALIDAD, H_MAX_HACKS
    
    hub.speaker.beep(1000, 100)
    while Button.BLUETOOTH in hub.buttons.pressed(): wait(10)
    
    opciones = ["V", "G", "R", "M", "A", "P", "H"]
    o_idx = 0
    
    while True:
        hub.display.char(opciones[o_idx])
        btns = hub.buttons.pressed()
        
        if Button.RIGHT in btns:
            o_idx = (o_idx + 1) % len(opciones)
            hub.speaker.beep(1200, 50); wait(250)
        elif Button.LEFT in btns:
            o_idx = (o_idx - 1) % len(opciones)
            hub.speaker.beep(1200, 50); wait(250)
            
        if Button.BLUETOOTH in btns:
            hub.speaker.beep(1500, 100); wait(500)
            
            # SUBMENÚS DE AJUSTE
            if opciones[o_idx] == "M": # Calibración Manual Martillo
                mot_d.stop()
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    v_pantalla = abs(mot_d.angle()) // 10
                    mostrar_num_anton(v_pantalla)
                    wait(100)
                M_ANGULO = abs(mot_d.angle())
                mot_d.run_target(1000, 0)
                
            elif opciones[o_idx] == "V": # Velocidad
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    b = hub.buttons.pressed()
                    if Button.RIGHT in b: V_MAX = min(1000, V_MAX + 50); wait(150)
                    if Button.LEFT in b: V_MAX = max(100, V_MAX - 50); wait(150)
                    mostrar_num_anton(V_MAX // 10)
                    
            elif opciones[o_idx] == "A": # Volumen
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    b = hub.buttons.pressed()
                    if Button.RIGHT in b: A_VOLUMEN = min(10, A_VOLUMEN + 1); wait(150)
                    if Button.LEFT in b: A_VOLUMEN = max(0, A_VOLUMEN - 1); wait(150)
                    hub.speaker.volume(A_VOLUMEN * 10)
                    mostrar_num_anton(A_VOLUMEN)

            elif opciones[o_idx] == "G": # Giro
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    b = hub.buttons.pressed()
                    if Button.RIGHT in b: G_VEL = min(800, G_VEL + 50); wait(150)
                    if Button.LEFT in b: G_VEL = max(100, G_VEL - 50); wait(150)
                    mostrar_num_anton(G_VEL // 10)
            elif opciones[o_idx] == "R": # Retroceso
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    b = hub.buttons.pressed()
                    if Button.RIGHT in b: R_RETROCESO = min(500, R_RETROCESO + 10); wait(150)
                    if Button.LEFT in b: R_RETROCESO = max(0, R_RETROCESO - 10); wait(150)
                    mostrar_num_anton(R_RETROCESO // 10)
            elif opciones[o_idx] == "P": # Personalidad
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    b = hub.buttons.pressed()
                    if Button.RIGHT in b: P_PERSONALIDAD = (P_PERSONALIDAD % 5) + 1; wait(250)
                    hub.display.char(str(P_PERSONALIDAD)) # Simplificado
            elif opciones[o_idx] == "H": # Hacks limit
                while not Button.BLUETOOTH in hub.buttons.pressed():
                    b = hub.buttons.pressed()
                    if Button.RIGHT in b: H_MAX_HACKS = (H_MAX_HACKS % 3) + 1; wait(250)
                    hub.display.char(str(H_MAX_HACKS))

            hub.speaker.beep(2000, 200); hub.display.text("OK"); wait(500)
            while Button.BLUETOOTH in hub.buttons.pressed(): wait(10)
            # Volver al bucle principal con el modo restaurado
            set_mode(m_idx)
            break
        wait(10)

# ============================================================
# 6. BUCLE PRINCIPAL (EL CEREBRO)
# ============================================================
sw_caida, sw_ing, sw_hack = StopWatch(), StopWatch(), StopWatch()
caido, hacker_count = False, 0
pressed = []

set_mode(0)
while True:
    # --- 1. DETECCIÓN DE CAÍDA ---
    if hub.imu.up() != Side.FRONT:
        if not caido: caido = True; sw_caida.reset()
        t = 9000 - sw_caida.time()
        if t > 0: mostrar_num_anton(t // 1000)
        else:
            hub.display.icon(Icon.SAD)
            tocar_sakura()
            animar_kanji()
            while True: wait(1000) # Bloqueo post-derrota
    elif caido:
        caido = False; hub.display.char("-"); set_mode(m_idx)

    # --- 2. COMUNICACIÓN MANDO (REPETIDO PARA ESTABILIDAD) ---
    was_pressed = pressed
    try:
        pressed = rc.buttons.pressed()
    except:
        pressed = []; rc = None
        try: rc = Remote(timeout=0); set_mode(m_idx)
        except: pass

    # --- 3. CAMBIO DE MODO ---
    if (Button.CENTER in pressed) and not (Button.CENTER in was_pressed):
        set_mode((m_idx + 1) % 4)

    # --- 4. ACCIONES POR MODO ---
    if not caido:
        if m_idx == 0: # MODO DRIVE (VERDE)
            s, t = 0, 0
            if Button.LEFT_PLUS in pressed: s = V_MAX
            if Button.LEFT_MINUS in pressed: s = -V_MAX
            if Button.RIGHT_PLUS in pressed: t = V_MAX // 2
            if Button.RIGHT_MINUS in pressed: t = -V_MAX // 2
            db.drive(s, t)

        elif m_idx == 1: # MODO ACCIÓN (NARANJA)
            db.stop()
            if (Button.RIGHT in pressed) and not (Button.RIGHT in was_pressed):
                # Giro 360 + Sakura + Martillo (Asíncrono)
                db.turn(360, wait=False)
                mot_d.run_target(1000, M_ANGULO)
                mot_d.run_target(1000, 0)
            if (Button.LEFT in pressed) and not (Button.LEFT in was_pressed):
                db.turn(180) # Giro de escape

        elif m_idx == 2: # MODO AUTÓNOMO (MAGENTA)
            if sensor.distance() < 300: # Rango de detección
                db.drive(V_MAX, 0)
                mot_d.run_target(1000, M_ANGULO)
                wait(200)
                mot_d.run_target(1000, 0)
                db.straight(-R_RETROCESO) # Retroceso
            else:
                db.drive(0, G_VEL) # Girar buscando

        elif m_idx == 3: # MODO HACKER (AZUL)
            hub.display.icon(Icon.QUESTION)
            if (Button.RIGHT_PLUS in pressed) and hacker_count < H_MAX_HACKS:
                # Simulación de Hackeo: Vibración y Reset
                hacker_count += 1
                hub.speaker.beep(2000, 500)
                set_mode(1) # Auto-reset a Modo Acción

    # --- 5. ACCESO CONSOLA INGENIERO ---
    if Button.BLUETOOTH in hub.buttons.pressed():
        sw_ing.reset()
        while Button.BLUETOOTH in hub.buttons.pressed():
            if sw_ing.time() > 1500:
                ejecutar_modo_ingeniero()
                break
        wait(10)

    wait(10)
