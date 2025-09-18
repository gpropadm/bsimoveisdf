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

    // Se o texto estiver vazio após limpeza, usar fallback
    const finalText = cleanText || 'IMOBILIARIA'

    // Criar marca d'água usando Sharp text() - funcionalidade nativa
    const textWidth = finalText.length * dynamicFontSize * 0.6
    const textHeight = dynamicFontSize
    const margin = 20

    let x: number, y: number
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

    // Tentar usar o Sharp text() se disponível
    try {
      const watermarkedImage = await image
        .composite([
          {
            input: {
              text: {
                text: finalText,
                font: 'Arial Bold',
                width: Math.round(textWidth),
                height: Math.round(dynamicFontSize),
                rgba: true
              }
            },
            left: Math.round(x),
            top: Math.round(y),
            blend: 'over'
          }
        ])
        .jpeg({ quality: 85 })
        .toBuffer()

      return watermarkedImage
    } catch (textError) {
      console.warn('Sharp text() não disponível, usando SVG simples')

      // Fallback para SVG mais básico possível
      const simpleSvg = `<svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .watermark-text {
              font-family: Arial, sans-serif;
              font-size: ${dynamicFontSize}px;
              font-weight: bold;
              fill: white;
              opacity: ${opacity};
            }
          </style>
        </defs>
        <rect x="${x - 10}" y="${y - 5}" width="${textWidth + 20}" height="${dynamicFontSize + 10}"
              fill="black" opacity="0.4" rx="5"/>
        <text x="${x}" y="${y + dynamicFontSize - 5}" class="watermark-text">${finalText}</text>
      </svg>`

      const watermarkedImage = await image
        .composite([
          {
            input: Buffer.from(simpleSvg),
            blend: 'over'
          }
        ])
        .jpeg({ quality: 85 })
        .toBuffer()

      return watermarkedImage
    }

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