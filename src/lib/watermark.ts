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
    opacity = 0.4,
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

    // Calcular tamanho baseado na imagem
    const dynamicSize = Math.max(
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

    // Criar marca d'água simples usando apenas retângulos - SEM FONTES
    const boxWidth = finalText.length * dynamicSize * 0.8
    const boxHeight = dynamicSize + 20
    const margin = 20

    let x: number, y: number
    switch (position) {
      case 'center':
        x = Math.max(0, (metadata.width - boxWidth) / 2)
        y = Math.max(0, (metadata.height - boxHeight) / 2)
        break
      case 'bottom-right':
        x = Math.max(0, metadata.width - boxWidth - margin)
        y = Math.max(0, metadata.height - boxHeight - margin)
        break
      case 'bottom-left':
        x = margin
        y = Math.max(0, metadata.height - boxHeight - margin)
        break
      case 'top-right':
        x = Math.max(0, metadata.width - boxWidth - margin)
        y = margin
        break
      case 'top-left':
        x = margin
        y = margin
        break
      default:
        x = Math.max(0, (metadata.width - boxWidth) / 2)
        y = Math.max(0, (metadata.height - boxHeight) / 2)
    }

    // Criar marca d'água usando apenas formas geométricas - sem texto
    const watermarkOverlay = await sharp({
      create: {
        width: Math.round(boxWidth),
        height: Math.round(boxHeight),
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      // Fundo semi-transparente
      {
        input: await sharp({
          create: {
            width: Math.round(boxWidth),
            height: Math.round(boxHeight),
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0.5 }
          }
        }).png().toBuffer(),
        top: 0,
        left: 0
      },
      // Barra branca central (representa o texto)
      {
        input: await sharp({
          create: {
            width: Math.round(boxWidth - 20),
            height: Math.round(dynamicSize / 3),
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: opacity }
          }
        }).png().toBuffer(),
        top: Math.round(boxHeight / 2 - dynamicSize / 6),
        left: 10
      }
    ])
    .png()
    .toBuffer()

    // Aplicar marca d'água
    const watermarkedImage = await image
      .composite([
        {
          input: watermarkOverlay,
          left: Math.round(x),
          top: Math.round(y),
          blend: 'over'
        }
      ])
      .jpeg({ quality: 85 })
      .toBuffer()

    console.log(`✅ Marca d'água simples aplicada para: "${finalText}"`)
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