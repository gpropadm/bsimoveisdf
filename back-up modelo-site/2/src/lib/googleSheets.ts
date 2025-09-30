import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = '1TKI9hGPd9SaHyIQVdW6QCcv0AK9DQ1_NISXpnKY4B2w';

// Configuração da autenticação com Google Sheets
// Você precisará criar credenciais no Google Cloud Console
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export interface ScheduleSlot {
  data: string;
  hora: string;
  corretor: string;
  status: 'disponível' | 'ocupado';
  cliente?: string;
  telefone?: string;
  imovel?: string;
}

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet;

  constructor() {
    this.doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
  }

  async init() {
    await this.doc.loadInfo();
  }

  // Buscar horários disponíveis
  async getAvailableSlots(date: string): Promise<ScheduleSlot[]> {
    await this.init();
    const sheet = this.doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const availableSlots: ScheduleSlot[] = [];

    rows.forEach((row) => {
      if (row.get('Data') === date && row.get('Status') === 'disponível') {
        availableSlots.push({
          data: row.get('Data'),
          hora: row.get('Hora'),
          corretor: row.get('Corretor'),
          status: row.get('Status'),
        });
      }
    });

    return availableSlots;
  }

  // Verificar se um horário específico está disponível
  async isSlotAvailable(date: string, time: string): Promise<boolean> {
    await this.init();
    const sheet = this.doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const slot = rows.find((row) => 
      row.get('Data') === date && 
      row.get('Hora') === time && 
      row.get('Status') === 'disponível'
    );

    return !!slot;
  }

  // Agendar um horário
  async bookSlot(
    date: string, 
    time: string, 
    clientName: string, 
    clientPhone: string, 
    propertyTitle: string
  ): Promise<{ success: boolean; corretor?: string; message: string }> {
    await this.init();
    const sheet = this.doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const slotRow = rows.find((row) => 
      row.get('Data') === date && 
      row.get('Hora') === time && 
      row.get('Status') === 'disponível'
    );

    if (!slotRow) {
      return {
        success: false,
        message: 'Horário não disponível'
      };
    }

    // Atualizar a linha
    slotRow.set('Status', 'ocupado');
    slotRow.set('Cliente', clientName);
    slotRow.set('Telefone', clientPhone);
    slotRow.set('Imovel', propertyTitle);
    
    await slotRow.save();

    return {
      success: true,
      corretor: slotRow.get('Corretor'),
      message: 'Horário agendado com sucesso'
    };
  }

  // Cancelar um agendamento
  async cancelSlot(date: string, time: string, clientPhone: string): Promise<boolean> {
    await this.init();
    const sheet = this.doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const slotRow = rows.find((row) => 
      row.get('Data') === date && 
      row.get('Hora') === time && 
      row.get('Telefone') === clientPhone
    );

    if (!slotRow) {
      return false;
    }

    // Limpar os dados e marcar como disponível
    slotRow.set('Status', 'disponível');
    slotRow.set('Cliente', '');
    slotRow.set('Telefone', '');
    slotRow.set('Imovel', '');
    
    await slotRow.save();
    return true;
  }

  // Buscar agendamentos do corretor
  async getCorretorAppointments(corretorName: string): Promise<ScheduleSlot[]> {
    await this.init();
    const sheet = this.doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const appointments: ScheduleSlot[] = [];

    rows.forEach((row) => {
      if (row.get('Corretor') === corretorName && row.get('Status') === 'ocupado') {
        appointments.push({
          data: row.get('Data'),
          hora: row.get('Hora'),
          corretor: row.get('Corretor'),
          status: row.get('Status'),
          cliente: row.get('Cliente'),
          telefone: row.get('Telefone'),
          imovel: row.get('Imovel'),
        });
      }
    });

    return appointments;
  }
}

export const googleSheetsService = new GoogleSheetsService();