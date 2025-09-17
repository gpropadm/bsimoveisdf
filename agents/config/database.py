"""
Database configuration for agents
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any, List
import json
from loguru import logger

# Carregar variáveis de ambiente
load_dotenv()

class DatabaseConfig:
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL', 'sqlite:///./prisma/dev.db')

        # Configuração específica para produção
        engine_kwargs = {}
        if 'postgresql://' in self.database_url:
            # PostgreSQL em produção
            engine_kwargs.update({
                'pool_size': 10,
                'max_overflow': 20,
                'pool_pre_ping': True,
                'pool_recycle': 300
            })
        elif 'sqlite://' in self.database_url:
            # SQLite com otimizações
            engine_kwargs.update({
                'pool_pre_ping': True,
                'connect_args': {"check_same_thread": False}
            })

        self.engine = create_engine(self.database_url, **engine_kwargs)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def get_session(self):
        """Get database session"""
        return self.SessionLocal()

    def execute_query(self, query: str, params: Dict = None) -> List[Dict[Any, Any]]:
        """Execute raw SQL query"""
        try:
            with self.engine.connect() as conn:
                if params:
                    result = conn.execute(text(query), params)
                else:
                    result = conn.execute(text(query))

                # Convert to list of dicts
                columns = result.keys()
                rows = []
                for row in result:
                    rows.append({col: row[i] for i, col in enumerate(columns)})

                return rows
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return []

    def get_unprocessed_leads(self) -> List[Dict[Any, Any]]:
        """Get leads that haven't been processed by agents"""
        query = """
        SELECT *
        FROM leads
        WHERE status = 'novo'
        ORDER BY "createdAt" DESC
        LIMIT 50
        """
        return self.execute_query(query)

    def mark_lead_processed(self, lead_id: str, status: str = 'sent') -> bool:
        """Mark lead as processed by agent"""
        if 'postgresql://' in self.database_url:
            query = """
            UPDATE leads
            SET status = :status,
                "updatedAt" = NOW()
            WHERE id = :lead_id
            """
        else:
            query = """
            UPDATE leads
            SET status = :status,
                updatedAt = datetime('now')
            WHERE id = :lead_id
            """

        try:
            with self.engine.connect() as conn:
                result = conn.execute(text(query), {
                    'lead_id': lead_id,
                    'status': status
                })
                conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error marking lead processed: {e}")
            return False

    def get_site_settings(self) -> Dict[str, Any]:
        """Get site settings including WhatsApp config"""
        query = 'SELECT * FROM settings LIMIT 1'

        try:
            result = self.execute_query(query)
            if result:
                settings = result[0]
                # Retornar apenas os campos necessários
                return {
                    'contactWhatsapp': settings.get('contactWhatsapp', ''),
                    'siteName': settings.get('siteName', ''),
                    'contactEmail': settings.get('contactEmail', ''),
                    'contactPhone': settings.get('contactPhone', ''),
                    'siteDescription': settings.get('siteDescription', ''),
                    'siteUrl': 'https://modelo-site-imob.vercel.app'
                }
            return {}
        except Exception as e:
            logger.error(f"Error getting site settings: {e}")
            return {}

# Global database instance
db = DatabaseConfig()