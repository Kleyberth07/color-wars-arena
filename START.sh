#!/bin/bash
clear
echo "🎮 INICIANDO COLOR WARS ARENA..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Detectar IP Local
IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

node server.js &
SERVER_PID=$!

sleep 2
echo "✅ SERVIDOR ACTIVO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 ACCESO LOCAL: http://localhost:3000"
echo "🌐 ACCESO RED:   http://${IP}:3000"
echo "👨‍💼 ADMIN:       http://${IP}:3000/admin.html"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Presiona CTRL+C para apagar el servidor"
wait $SERVER_PID
