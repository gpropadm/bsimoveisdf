import sharp from 'sharp'

interface WatermarkOptions {
  text: string
  fontSize?: number
  opacity?: number
  color?: string
  fontFamily?: string
  position?: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export async function addWatermark(
  imageBuffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  const {
    text = 'FAIMOVEIS',
    fontSize = 60,
    opacity = 0.3,
    color = 'white',
    fontFamily = 'Arial',
    position = 'center'
  } = options

  try {
    // Obter metadados da imagem
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Não foi possível obter dimensões da imagem')
    }

    // Calcular tamanho da fonte baseado na imagem
    const dynamicFontSize = Math.max(
      Math.min(metadata.width, metadata.height) * 0.08, // 8% da menor dimensão
      30 // Tamanho mínimo
    )

    // Limpar o texto para evitar problemas de encoding
    const cleanText = text
      .normalize('NFD') // Normalizar acentos
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^\w\s]/g, '') // Remover caracteres especiais
      .trim()
      .toUpperCase()

    console.log('Texto original:', text)
    console.log('Texto limpo:', cleanText)

    // Criar uma abordagem mais simples com Sharp text
    const textWidth = cleanText.length * dynamicFontSize * 0.6
    const textHeight = dynamicFontSize * 1.2

    // Calcular posição
    let x: number, y: number
    const margin = 20

    switch (position) {
      case 'center':
        x = Math.max(0, (metadata.width - textWidth) / 2)
        y = Math.max(0, (metadata.height - textHeight) / 2)
        break
      case 'bottom-right':
        x = Math.max(0, metadata.width - textWidth - margin)
        y = Math.max(0, metadata.height - textHeight - margin)
        break
      case 'bottom-left':
        x = margin
        y = Math.max(0, metadata.height - textHeight - margin)
        break
      case 'top-right':
        x = Math.max(0, metadata.width - textWidth - margin)
        y = margin
        break
      case 'top-left':
        x = margin
        y = margin
        break
      default:
        x = Math.max(0, (metadata.width - textWidth) / 2)
        y = Math.max(0, (metadata.height - textHeight) / 2)
    }

    // Criar uma imagem de texto simples usando Sharp
    const textSvg = Buffer.from(`
      <svg width="${metadata.width}" height="${metadata.height}">
        <style>
          .watermark {
            font-family: Arial, sans-serif;
            font-size: ${dynamicFontSize}px;
            font-weight: bold;
            fill: white;
            opacity: ${opacity};
            text-anchor: start;
            dominant-baseline: central;
          }
          .background {
            fill: black;
            opacity: 0.4;
          }
        </style>

        <!-- Fundo do texto -->
        <rect x="${x - 10}" y="${y - dynamicFontSize/2}"
              width="${textWidth + 20}" height="${dynamicFontSize + 10}"
              class="background" rx="5"/>

        <!-- Texto da marca d'água -->
        <text x="${x}" y="${y}" class="watermark">${cleanText}</text>
      </svg>
    `)

    // Aplicar marca d'água
    const watermarkedImage = await image
      .composite([
        {
          input: textSvg,
          blend: 'over'
        }
      ])
      .jpeg({ quality: 85 })
      .toBuffer()

    return watermarkedImage

  } catch (error) {
    console.error('Erro ao adicionar marca d\'água:', error)
    // Em caso de erro, retorna imagem original
    return imageBuffer
  }
}

export async function addLogoWatermark(
  imageBuffer: Buffer,
  logoPath?: string
): Promise<Buffer> {
  try {
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Não foi possível obter dimensões da imagem')
    }

    // Se não tiver logo, usar marca d'água de texto
    if (!logoPath) {
      return addWatermark(imageBuffer, { text: 'LOGO' })
    }

    // Redimensionar logo proporcionalmente
    const logoSize = Math.min(metadata.width, metadata.height) * 0.15 // 15% da menor dimensão
    const logo = await sharp(logoPath)
      .resize(logoSize, logoSize, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer()

    // Posicionar logo no centro
    const logoMetadata = await sharp(logo).metadata()
    const left = Math.round((metadata.width - (logoMetadata.width || 0)) / 2)
    const top = Math.round((metadata.height - (logoMetadata.height || 0)) / 2)

    const watermarkedImage = await image
      .composite([
        {
          input: logo,
          left,
          top,
          blend: 'over'
        }
      ])
      .jpeg({ quality: 85 })
      .toBuffer()

    return watermarkedImage

  } catch (error) {
    console.error('Erro ao adicionar logo como marca d\'água:', error)
    // Fallback para marca d'água de texto
    return addWatermark(imageBuffer, { text: 'LOGO' })
  }
}