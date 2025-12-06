#!/bin/bash
cd "$(dirname "$0")"

# Check for available port (8001 since 8000 is used by School 1)
PORT=8001
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Port $PORT is in use, trying 8002..."
    PORT=8002
    if lsof -ti:$PORT > /dev/null 2>&1; then
        echo "⚠️  Port $PORT is also in use, trying 8003..."
        PORT=8003
    fi
fi

echo "🚀 Starting School 2 - Enhanced Learning Platform..."
echo "📚 Course available at: http://localhost:$PORT"
echo "Press Ctrl+C to stop"
python3 -m http.server $PORT

