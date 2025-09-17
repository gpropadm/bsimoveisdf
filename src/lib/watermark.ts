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

    // Criar SVG da marca d'água
    const textWidth = text.length * dynamicFontSize * 0.6
    const textHeight = dynamicFontSize * 1.2

    // Calcular posição
    let x: number, y: number
    const margin = 20

    switch (position) {
      case 'center':
        x = (metadata.width - textWidth) / 2
        y = (metadata.height + textHeight) / 2
        break
      case 'bottom-right':
        x = metadata.width - textWidth - margin
        y = metadata.height - margin
        break
      case 'bottom-left':
        x = margin
        y = metadata.height - margin
        break
      case 'top-right':
        x = metadata.width - textWidth - margin
        y = textHeight + margin
        break
      case 'top-left':
        x = margin
        y = textHeight + margin
        break
      default:
        x = (metadata.width - textWidth) / 2
        y = (metadata.height + textHeight) / 2
    }

    // Criar SVG com fundo semi-transparente e borda
    const svgWatermark = `
      <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.8"/>
          </filter>
        </defs>

        <!-- Fundo semi-transparente atrás do texto -->
        <rect x="${x - 15}" y="${y - dynamicFontSize + 5}"
              width="${textWidth + 30}" height="${textHeight}"
              fill="black" opacity="0.4" rx="8"/>

        <!-- Texto principal -->
        <text x="${x}" y="${y}"
              font-family="${fontFamily}, Arial, sans-serif"
              font-size="${dynamicFontSize}"
              font-weight="bold"
              fill="${color}"
              opacity="${opacity}"
              filter="url(#shadow)">${text}</text>
      </svg>
    `

    // Aplicar marca d'água
    const watermarkedImage = await image
      .composite([
        {
          input: Buffer.from(svgWatermark),
          blend: 'over'
        }
      ])
      .jpeg({ quality: 85 }) // Manter boa qualidade
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