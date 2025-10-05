'use client'

import { useState } from 'react'

export default function SellRentPropertySection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cep: '',
    propertyType: '',
    termsAccepted: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '')
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const formatCEP = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '')
    
    // Aplica a máscara XXXXX-XXX
    if (cleaned.length <= 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }))
  }

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setFormData(prev => ({
      ...prev,
      cep: formatted
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.name.trim()) {
      setMessage('Por favor, preencha seu nome completo')
      return
    }

    if (!formData.phone.trim()) {
      setMessage('Por favor, preencha seu celular')
      return
    }

    if (!formData.email.trim()) {
      setMessage('Por favor, preencha seu email')
      return
    }

    if (!formData.cep.trim()) {
      setMessage('Por favor, preencha o CEP do imóvel')
      return
    }

    if (!formData.propertyType) {
      setMessage('Por favor, selecione se quer vender ou alugar')
      return
    }

    if (!formData.termsAccepted) {
      setMessage('Por favor, aceite os termos da política de privacidade')
      return
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage('Por favor, digite um email válido')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // Salvar lead na API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Interesse em ${formData.propertyType} imóvel - CEP: ${formData.cep}`,
          propertyTitle: `${formData.propertyType} - Proprietário`,
          propertyPrice: 0,
          propertyType: formData.propertyType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar dados')
      }

      // WhatsApp message
      const message = `*PROPRIETÁRIO QUER ${formData.propertyType.toUpperCase()} IMÓVEL*

*Nome:* ${formData.name}
*Telefone:* ${formData.phone}
*Email:* ${formData.email}
*CEP do Imóvel:* ${formData.cep}
*Objetivo:* ${formData.propertyType}

*Data:* ${new Date().toLocaleString('pt-BR')}`

      // Buscar configurações para pegar o WhatsApp
      const settingsResponse = await fetch('/api/admin/settings')
      const settingsData = await settingsResponse.json()
      const whatsappNumber = settingsData.site?.contactWhatsapp || '5548998645864'
      
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappURL, '_blank')

      setMessage('✅ Dados enviados com sucesso! Em breve entraremos em contato.')
      
      // Limpar formulário após 3 segundos
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          cep: '',
          propertyType: '',
          termsAccepted: false
        })
        setMessage('')
      }, 3000)

    } catch (error) {
      console.error('Erro:', error)
      setMessage('❌ Erro ao enviar dados. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vender ou alugar meu imóvel
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Preencha o formulário e vá com quem entende para fechar um bom negócio
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Formulário - Centralizado mais à direita */}
            <div className="lg:col-span-3 lg:col-start-1">
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qual é o seu nome completo? *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Celular */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qual é o número do seu celular? *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +55
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(48) 99999-9999"
                  maxLength={15}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E o seu e-mail? *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* CEP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEP do imóvel *
              </label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleCEPChange}
                placeholder="00000-000"
                maxLength={9}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Tipo de Operação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vender ou alugar um imóvel? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="propertyType"
                    value="alugar"
                    checked={formData.propertyType === 'alugar'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Alugar imóvel</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="propertyType"
                    value="vender"
                    checked={formData.propertyType === 'vender'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Vender imóvel</span>
                </label>
              </div>
            </div>

            {/* Termos */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Li e aceito os Termos da Política de Privacidade
                </span>
              </label>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                  : message.includes('❌')
                  ? 'bg-red-100 text-red-800 border-2 border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
              }`}>
                {message}
              </div>
            )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      👉 Confirmar e enviar
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Este site é protegido por reCAPTCHA e a Política de Privacidade e os Termos de Serviço do Google se aplicam
              </p>
            </div>

            {/* Imagem da Atendente - Lado Direito */}
            <div className="hidden lg:flex justify-center items-start lg:col-span-2">
              <div className="relative">
                <img
                  src="/images/atendente-formulario.png"
                  alt="Atendente apontando para o formulário"
                  className="w-full max-w-md h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}