#!/bin/bash

echo "🤖 Configurando sistema de agentes IA..."

# Criar ambiente virtual Python
echo "📦 Criando ambiente virtual..."
python3 -m venv agents_env
source agents_env/bin/activate

# Instalar dependências
echo "📥 Instalando dependências..."
pip install -r requirements.txt

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "⚙️ Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Configure as variáveis necessárias!"
else
    echo "✅ Arquivo .env já existe"
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p logs
mkdir -p data

# Verificar banco de dados
echo "🗄️ Verificando banco de dados..."
if [ -f "../prisma/dev.db" ]; then
    echo "✅ Banco SQLite encontrado"
elif [ ! -z "$DATABASE_URL" ]; then
    echo "✅ URL do banco configurada"
else
    echo "⚠️ Configure DATABASE_URL no arquivo .env"
fi

# Adicionar campos necessários ao Prisma (se necessário)
echo "🔧 Verificando schema do banco..."
cat << 'EOF' > schema_additions.txt

Adicione estes campos ao modelo Lead no schema.prisma se não existirem:

model Lead {
  // ... outros campos ...
  agentProcessed    Boolean?   @default(false)
  agentStatus       String?    // 'sent', 'error', 'processed'
  agentProcessedAt  DateTime?
}
EOF

echo "📄 Criado arquivo schema_additions.txt com instruções"

echo "🎯 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o arquivo .env com suas credenciais"
echo "2. Adicione os campos do agente ao schema.prisma (veja schema_additions.txt)"
echo "3. Execute: npx prisma db push (no diretório principal)"
echo "4. Inicie os agentes: python main.py"
echo ""
echo "🚀 Para testar: python -c \"import asyncio; from main import health_check; print(asyncio.run(health_check()))\""