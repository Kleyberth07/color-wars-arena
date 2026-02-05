from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('usuarios.db')
    cursor = conn.cursor()
    # Guardamos correo, celular y clave
    cursor.execute('''CREATE TABLE IF NOT EXISTS usuarios 
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                       correo TEXT, celular TEXT, clave TEXT)''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return render_template('login.html', view='access')

@app.route('/registrar', methods=['POST'])
def registrar():
    c, tel, p = request.form.get('email'), request.form.get('phone'), request.form.get('password')
    if c and p:
        conn = sqlite3.connect('usuarios.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO usuarios (correo, celular, clave) VALUES (?, ?, ?)", (c, tel, p))
        conn.commit()
        conn.close()
        return render_template('login.html', view='dash', user=c, msg="CUENTA CREADA CON ÉXITO")
    return "Error en registro"

@app.route('/login', methods=['POST'])
def login():
    c, p = request.form.get('email'), request.form.get('password')
    conn = sqlite3.connect('usuarios.db')
    cursor = conn.cursor()
    cursor.execute("SELECT correo FROM usuarios WHERE correo=? AND clave=?", (c, p))
    user = cursor.fetchone()
    conn.close()
    if user:
        return render_template('login.html', view='dash', user=user[0])
    return "<h1>Credenciales incorrectas</h1><a href='/'>Volver</a>"

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=8080)
