// Utilitários para processamento de vídeo no lado do cliente

export interface CompressOptions {
  quality?: number // 0.1 a 1.0
  maxWidth?: number
  maxHeight?: number
  maxSizeMB?: number
}

// Função para comprimir vídeo usando Canvas e MediaRecorder API
export async function compressVideo(
  file: File, 
  options: CompressOptions = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      quality = 0.7,
      maxWidth = 720,
      maxHeight = 1280, // Para formato shorts/vertical
      maxSizeMB = 10
    } = options

    // Se o arquivo já está pequeno o suficiente, retorna sem compressão
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file)
      return
    }

    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    video.onloadedmetadata = () => {
      // Calcular dimensões mantendo proporção
      let { videoWidth: width, videoHeight: height } = video
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        
        if (width > height) {
          // Landscape
          width = Math.min(width, maxWidth)
          height = width / aspectRatio
        } else {
          // Portrait (shorts)
          height = Math.min(height, maxHeight)
          width = height * aspectRatio
        }
      }

      canvas.width = width
      canvas.height = height

      // Configurar MediaRecorder
      const stream = canvas.captureStream(30) // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 1000000 // 1 Mbps
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: 'video/webm' })
        const compressedFile = new File([compressedBlob], file.name, {
          type: 'video/webm',
          lastModified: Date.now()
        })

        console.log('📹 Vídeo comprimido:', {
          originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
          compressionRatio: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
        })

        resolve(compressedFile)
      }

      mediaRecorder.onerror = (error) => {
        reject(error)
      }

      // Função para renderizar frames
      const renderFrame = () => {
        if (video.ended || video.paused) {
          mediaRecorder.stop()
          return
        }

        ctx.drawImage(video, 0, 0, width, height)
        requestAnimationFrame(renderFrame)
      }

      // Iniciar gravação
      mediaRecorder.start()
      video.currentTime = 0
      video.play()
      renderFrame()
    }

    video.onerror = () => {
      reject(new Error('Erro ao carregar o vídeo'))
    }

    video.src = URL.createObjectURL(file)
    video.load()
  })
}

// Função para obter informações do vídeo
export async function getVideoInfo(file: File): Promise<{
  duration: number
  width: number
  height: number
  size: number
  type: string
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        type: file.type
      })
      
      URL.revokeObjectURL(video.src)
    }

    video.onerror = () => {
      reject(new Error('Erro ao carregar informações do vídeo'))
      URL.revokeObjectURL(video.src)
    }

    video.src = URL.createObjectURL(file)
  })
}

// Função para validar se é um vídeo adequado para shorts
export async function validateShortsVideo(file: File): Promise<{
  valid: boolean
  issues: string[]
}> {
  const issues: string[] = []
  
  try {
    const info = await getVideoInfo(file)
    
    // Verificar duração (máximo 60 segundos para shorts)
    if (info.duration > 60) {
      issues.push(`Vídeo muito longo (${Math.round(info.duration)}s). Máximo 60 segundos.`)
    }
    
    // Verificar se é vertical (aspect ratio)
    const aspectRatio = info.width / info.height
    if (aspectRatio >= 1) {
      issues.push('Vídeo deve ser vertical (formato shorts)')
    }
    
    // Verificar tamanho
    if (info.size > 50 * 1024 * 1024) {
      issues.push(`Arquivo muito grande (${(info.size / 1024 / 1024).toFixed(1)}MB). Máximo 50MB.`)
    }
    
    return {
      valid: issues.length === 0,
      issues
    }
  } catch (error) {
    return {
      valid: false,
      issues: ['Erro ao analisar o vídeo']
    }
  }
}