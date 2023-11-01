from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sqlite3
from models import Historial

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins="origins",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_database():
    conn = sqlite3.connect('historial.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS historial (
            userWord TEXT,
            isValidate BOOLEAN
        )
    ''')
    conn.commit()
    conn.close()
   
@app.get("/prueba")
def read_root():
    return {"Hello": "World"}

# Ruta para obtener el historialF
@app.get('/obtener_historial')
def obtener_historial():
    conn = sqlite3.connect('historial.db')
    c = conn.cursor()
    c.execute("SELECT userWord, isValidate FROM historial")
    h = c.fetchall()
    historial = list(map(lambda fila: Historial(userWord=fila[0], isValidate=fila[1]), h))
    conn.close()
    return historial

@app.post('/guardar_historial')
def guardar_historial(historial : Historial):
    conn = sqlite3.connect('historial.db')
    c = conn.cursor()
    c.execute("INSERT INTO historial (userWord, isValidate) VALUES (?, ?)", (historial.userWord, historial.isValidate))
    conn.commit()
    conn.close()
    return "Historial guardado con éxito"


if not os.path.exists("historial.db"):
    create_database()

