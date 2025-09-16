#!/bin/bash

echo "🏭 Configurando agentes para PRODUÇÃO..."

# Verificar se está sendo executado como root/sudo
if [[ $EUID -eq 0 ]]; then
   echo "⚠️ Este script não deve ser executado como root"
   exit 1
fi

# Verificar Python 3.8+
python3_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "🐍 Python version: $python3_version"

if python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
    echo "✅ Python version OK"
else
    echo "❌ Python 3.8+ é necessário. Versão atual: $python3_version"
    exit 1
fi

# Criar ambiente virtual para produção
echo "📦 Criando ambiente virtual de produção..."
python3 -m venv production_env
source production_env/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências com versões fixas para produção
echo "📥 Instalando dependências de produção..."
cat > requirements_production.txt << 'EOF'
controlflow==0.12.1
asyncpg==0.29.0
python-dotenv==1.0.0
requests==2.31.0
aiohttp==3.9.0
loguru==0.7.2
pydantic==2.5.0
sqlalchemy==2.0.23
asyncio-mqtt==0.16.1
psycopg2-binary==2.9.7
uvloop==0.19.0
EOF

pip install -r requirements_production.txt

# Configurar arquivo .env para produção
echo "⚙️ Configurando ambiente de produção..."

if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env de produção..."
    cp ../.env.production .env

    echo ""
    echo "🔧 CONFIGURAÇÃO NECESSÁRIA:"
    echo "1. Edite o arquivo .env com suas credenciais de produção"
    echo "2. Configure DATABASE_URL para PostgreSQL"
    echo "3. Configure NEXTJS_URL para https://modelo-site-imob.vercel.app"
    echo "4. Configure AGENT_AUTH_TOKEN (gere uma chave forte)"
    echo "5. Configure webhooks de monitoramento (opcional)"
    echo ""
else
    echo "✅ Arquivo .env já existe"
fi

# Criar estrutura de logs
echo "📁 Criando estrutura de logs..."
mkdir -p logs
mkdir -p data
mkdir -p backups

# Configurar logrotate para produção
cat > logrotate.conf << 'EOF'
logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        # Restart agents se necessário
        pkill -f "python.*production_main.py" || true
        sleep 2
        nohup python production_main.py > logs/startup.log 2>&1 &
    endscript
}
EOF

# Criar script de inicialização systemd
echo "🔧 Criando serviço systemd..."
cat > imobinext-agents.service << 'EOF'
[Unit]
Description=ImobiNext AI Agents
After=network.target
Wants=network.target

[Service]
Type=simple
User=alex
Group=alex
WorkingDirectory=/home/alex/site-imobiliaria-v2/agents
Environment=PATH=/home/alex/site-imobiliaria-v2/agents/production_env/bin
ExecStart=/home/alex/site-imobiliaria-v2/agents/production_env/bin/python production_main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=imobinext-agents

# Limits de segurança
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

# Criar script de monitoramento
cat > monitor_agents.sh << 'EOF'
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
    nohup python production_main.py > logs/startup.log 2>&1 &
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
EOF

chmod +x monitor_agents.sh

# Criar script de backup
cat > backup_logs.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backups/logs_backup_$DATE.tar.gz" logs/
find backups/ -name "logs_backup_*.tar.gz" -mtime +7 -delete
echo "📦 Backup de logs criado: logs_backup_$DATE.tar.gz"
EOF

chmod +x backup_logs.sh

# Verificar banco de dados
echo "🗄️ Verificando configuração do banco..."
if grep -q "sqlite" .env 2>/dev/null; then
    echo "⚠️ ATENÇÃO: SQLite detectado. Para produção, recomenda-se PostgreSQL"
    echo "   Configure DATABASE_URL com PostgreSQL para melhor performance"
fi

# Teste de conectividade
echo "🧪 Testando configuração..."
source production_env/bin/activate

python3 -c "
try:
    from config.database import db
    settings = db.get_site_settings()
    print('✅ Conexão com banco OK')
    print(f'📱 WhatsApp configurado: {bool(settings.get(\"contactWhatsapp\"))}')
except Exception as e:
    print(f'❌ Erro de configuração: {e}')
" 2>/dev/null || echo "⚠️ Execute este teste após configurar o .env"

echo ""
echo "🎯 SETUP DE PRODUÇÃO CONCLUÍDO!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure o arquivo .env com valores de produção"
echo "2. Teste: ./monitor_agents.sh start"
echo "3. Verificar logs: ./monitor_agents.sh logs"
echo "4. Para systemd: sudo cp imobinext-agents.service /etc/systemd/system/"
echo "5. Habilitar serviço: sudo systemctl enable imobinext-agents"
echo ""
echo "🔧 COMANDOS ÚTEIS:"
echo "• Iniciar: ./monitor_agents.sh start"
echo "• Parar: ./monitor_agents.sh stop"
echo "• Status: ./monitor_agents.sh status"
echo "• Logs: ./monitor_agents.sh logs"
echo "• Backup: ./backup_logs.sh"
echo ""
echo "📊 MONITORAMENTO:"
echo "• Health check: curl https://modelo-site-imob.vercel.app/api/health"
echo "• Logs estruturados em: logs/production.log"
echo ""

# Final check
if [ -f .env ]; then
    echo "✅ Configuração base pronta"
else
    echo "⚠️ Configure o arquivo .env antes de usar"
fi