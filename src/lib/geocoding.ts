// Geocodificação gratuita usando ViaCEP + OpenStreetMap
import { getDFRegionByCEP, isDFCEP } from './dfRegions'

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  cep: string;
  logradouro: string;
  localidade: string;
  uf: string;
  bairro: string;
}

// Função para buscar endereço pelo CEP via ViaCEP
export async function getAddressFromCEP(cep: string): Promise<Address | null> {
  try {
    // Limpar CEP (remover caracteres especiais)
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    // ✨ CORRIGIR CIDADE PARA REGIÕES ADMINISTRATIVAS DO DF
    let cidadeCorreta = data.localidade;

    // Se for CEP do DF e vier como "Brasília", usar a região administrativa correta
    if (isDFCEP(cleanCEP) && data.localidade === 'Brasília') {
      const regiao = getDFRegionByCEP(cleanCEP);
      if (regiao) {
        cidadeCorreta = regiao;
        console.log(`🗺️ CEP ${cleanCEP}: Corrigindo "${data.localidade}" → "${regiao}"`);
      }
    }

    return {
      cep: data.cep,
      logradouro: data.logradouro,
      localidade: cidadeCorreta, // 🎯 Usando cidade correta
      uf: data.uf,
      bairro: data.bairro
    };
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return null;
  }
}

// Função para converter endereço em coordenadas via OpenStreetMap Nominatim
export async function getCoordinatesFromAddress(address: Address): Promise<Coordinates | null> {
  try {
    console.log(`🔍 Buscando coordenadas para: ${address.localidade}/${address.uf}`);

    // Tentar múltiplas estratégias de busca
    const searchStrategies = [
      // Estratégia 1: Endereço completo
      `${address.logradouro}, ${address.bairro}, ${address.localidade}, ${address.uf}, Brazil`,
      // Estratégia 2: Sem bairro
      `${address.logradouro}, ${address.localidade}, ${address.uf}, Brazil`,
      // Estratégia 3: Só cidade e estado
      `${address.localidade}, ${address.uf}, Brazil`
    ];

    for (let i = 0; i < searchStrategies.length; i++) {
      try {
        const query = encodeURIComponent(searchStrategies[i]);
        console.log(`🔍 Tentativa ${i + 1}: ${searchStrategies[i]}`);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=br&limit=1`,
          {
            headers: {
              'User-Agent': 'Imobiliaria-App/1.0 (contato@faimoveis.com.br)'
            }
          }
        );

        if (!response.ok) {
          console.log(`⚠️ Tentativa ${i + 1} falhou: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();

        if (data.length > 0) {
          const result = data[0];
          const coordinates = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          };

          // Verificar se as coordenadas estão no Brasil
          if (isValidBrazilianCoordinates(coordinates.latitude, coordinates.longitude)) {
            console.log(`✅ Coordenadas encontradas na tentativa ${i + 1}:`, coordinates);
            return coordinates;
          } else {
            console.log(`⚠️ Coordenadas fora do Brasil na tentativa ${i + 1}`);
          }
        }

        // Delay entre tentativas para evitar rate limiting
        if (i < searchStrategies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (strategyError) {
        console.log(`⚠️ Erro na tentativa ${i + 1}:`, (strategyError as Error).message);
        continue;
      }
    }

    throw new Error('Nenhuma estratégia de busca foi bem-sucedida');
  } catch (error) {
    console.error('❌ Erro ao buscar coordenadas:', error);
    return null;
  }
}

// Função principal: CEP → Coordenadas (combina as duas funções acima)
export async function geocodeCEP(cep: string): Promise<{ coordinates: Coordinates; address: Address } | null> {
  try {
    console.log(`🔍 Geocodificando CEP: ${cep}`);

    // 1. Buscar endereço pelo CEP
    const address = await getAddressFromCEP(cep);
    if (!address) {
      throw new Error('Endereço não encontrado para o CEP');
    }

    console.log(`📍 Endereço encontrado: ${address.logradouro}, ${address.localidade}/${address.uf}`);

    // 2. Buscar coordenadas pelo endereço
    const coordinates = await getCoordinatesFromAddress(address);
    if (!coordinates) {
      throw new Error('Coordenadas não encontradas para o endereço');
    }

    console.log(`📌 Coordenadas: ${coordinates.latitude}, ${coordinates.longitude}`);

    return {
      coordinates,
      address
    };
  } catch (error) {
    console.error('❌ Erro na geocodificação:', error);
    return null;
  }
}

// Função para validar coordenadas do Brasil
export function isValidBrazilianCoordinates(lat: number, lng: number): boolean {
  // Brasil fica aproximadamente entre:
  // Latitude: -33.75 a 5.27
  // Longitude: -73.99 a -28.84
  return (
    lat >= -33.75 && lat <= 5.27 &&
    lng >= -73.99 && lng <= -28.84
  );
}

// Cache em memória para evitar geocodificações desnecessárias
const geocodingCache = new Map<string, { coordinates: Coordinates; address: Address; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export async function geocodeCEPWithCache(cep: string): Promise<{ coordinates: Coordinates; address: Address } | null> {
  const cleanCEP = cep.replace(/\D/g, '');

  // Verificar cache
  const cached = geocodingCache.get(cleanCEP);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`💾 Cache hit para CEP ${cleanCEP}`);
    return { coordinates: cached.coordinates, address: cached.address };
  }

  // Fazer geocodificação
  const result = await geocodeCEP(cep);
  if (result) {
    // Salvar no cache
    geocodingCache.set(cleanCEP, {
      ...result,
      timestamp: Date.now()
    });
  }

  return result;
}