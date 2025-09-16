#!/bin/bash

# Monitor script for production agents
PIDFILE="production_main.pid"

check_agents() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat $PIDFILE)
        if ps -p $PID > /dev/null 2>&1; then
            echo "✅ Agentes rodando (PID: $PID)"
            return 0
        else
            echo "❌ PID file existe mas processo não está rodando"
            rm -f $PIDFILE
            return 1
        fi
    else
        echo "❌ Agentes não estão rodando"
        return 1
    fi
}

start_agents() {
    if check_agents; then
        echo "⚠️ Agentes já estão rodando"
        return 0
    fi

    echo "🚀 Iniciando agentes..."
    source production_env/bin/activate
    nohup python simple_main.py > logs/startup.log 2>&1 &
    echo $! > $PIDFILE
    echo "✅ Agentes iniciados (PID: $(cat $PIDFILE))"
}

stop_agents() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat $PIDFILE)
        echo "🛑 Parando agentes (PID: $PID)..."
        kill -TERM $PID 2>/dev/null

        # Aguardar shutdown graceful
        for i in {1..30}; do
            if ! ps -p $PID > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done

        # Force kill se necessário
        if ps -p $PID > /dev/null 2>&1; then
            echo "⚠️ Forçando parada..."
            kill -KILL $PID 2>/dev/null
        fi

        rm -f $PIDFILE
        echo "✅ Agentes parados"
    else
        echo "⚠️ Agentes não estão rodando"
    fi
}

restart_agents() {
    stop_agents
    sleep 2
    start_agents
}

case "$1" in
    start)
        start_agents
        ;;
    stop)
        stop_agents
        ;;
    restart)
        restart_agents
        ;;
    status)
        check_agents
        ;;
    logs)
        tail -f logs/production.log
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
