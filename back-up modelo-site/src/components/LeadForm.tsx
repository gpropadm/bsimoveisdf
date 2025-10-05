'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

interface LeadFormProps {
  propertyId: string
  propertyTitle: string
  propertyPrice: number
  propertyType: string
}

export default function LeadForm({ propertyId, propertyTitle, propertyPrice, propertyType }: LeadFormProps) {
  const defaultMessage = `Olá! Tenho interesse no imóvel "${propertyTitle}". Gostaria de receber mais informações.`

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: defaultMessage
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Aplicar máscara de telefone
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '')
      let formatted = cleaned

      if (cleaned.length <= 10) {
        // (XX) XXXX-XXXX
        formatted = cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, ddd, part1, part2) => {
          return part2 ? `(${ddd}) ${part1}-${part2}` : part1 ? `(${ddd}) ${part1}` : ddd ? `(${ddd}` : ''
        })
      } else {
        // (XX) XXXXX-XXXX
        formatted = cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, part1, part2) => {
          return part2 ? `(${ddd}) ${part1}-${part2}` : `(${ddd}) ${part1}`
        })
      }

      setFormData({
        ...formData,
        [name]: formatted
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Por favor, informe seu nome')
      return
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      toast.error('Por favor, informe seu e-mail ou telefone')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          propertyId,
          propertyTitle,
          propertyPrice,
          propertyType,
          source: 'site'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar formulário')
      }

      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      })
    } catch (error) {
      console.error('Erro ao enviar lead:', error)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="my-2" style={{ width: '100%' }}>
      {/* Nome */}
      <label className="p-0 mb-2 text-muted position-relative" style={{ fontSize: '0.7rem', width: '100%', display: 'block' }}>
        <b className="position-absolute px-3" style={{ fontSize: '0.7rem', fontWeight: 600, top: '6px' }}>
          Nome
        </b>
        <input
          type="text"
          name="name"
          className="form-control lead-form-input"
          placeholder="Escreva seu nome"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
          style={{
            fontSize: '0.875rem',
            paddingTop: '1.35rem',
            paddingBottom: '0.4rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            height: '46px',
            width: '100%',
            borderRadius: '4px'
          }}
        />
      </label>

      {/* Telefone */}
      <label className="p-0 mb-2 text-muted position-relative" style={{ fontSize: '0.7rem', width: '100%', display: 'block' }}>
        <b className="position-absolute px-3" style={{ fontSize: '0.7rem', fontWeight: 600, top: '6px' }}>
          Telefone
        </b>
        <input
          type="tel"
          name="phone"
          className="form-control lead-form-input"
          placeholder="(00) 99999-9999"
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
          style={{
            fontSize: '0.875rem',
            paddingTop: '1.35rem',
            paddingBottom: '0.4rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            height: '46px',
            width: '100%',
            borderRadius: '4px'
          }}
        />
      </label>

      {/* E-mail */}
      <label className="p-0 mb-2 text-muted position-relative" style={{ fontSize: '0.7rem', width: '100%', display: 'block' }}>
        <b className="position-absolute px-3" style={{ fontSize: '0.7rem', fontWeight: 600, top: '6px' }}>
          E-mail
        </b>
        <input
          type="email"
          name="email"
          className="form-control lead-form-input"
          placeholder="email@dominio.com"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          style={{
            fontSize: '0.875rem',
            paddingTop: '1.35rem',
            paddingBottom: '0.4rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            height: '46px',
            width: '100%',
            borderRadius: '4px'
          }}
        />
      </label>

      {/* Mensagem */}
      <label className="p-0 mb-2 text-muted position-relative" style={{ fontSize: '0.7rem', width: '100%', display: 'block' }}>
        <b className="position-absolute px-3" style={{ fontSize: '0.7rem', fontWeight: 600, top: '6px' }}>
          Mensagem <span style={{ opacity: 0.6 }}>(opcional)</span>
        </b>
        <textarea
          name="message"
          className="form-control lead-form-input"
          rows={4}
          placeholder="Descreva sua dúvida"
          value={formData.message}
          onChange={handleChange}
          disabled={loading}
          style={{
            fontSize: '0.875rem',
            paddingTop: '1.6rem',
            paddingBottom: '0.4rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            minHeight: '100px',
            width: '100%',
            borderRadius: '4px',
            resize: 'vertical'
          }}
        />
      </label>

      {/* Botão Enviar */}
      <button
        type="submit"
        className="btn btn-outline-secondary btn-block w-100 my-3 font-sora fw-semibold"
        disabled={loading}
        style={{
          fontSize: '14px',
          padding: '0.75rem 1rem'
        }}
      >
        {loading ? 'Enviando...' : 'Enviar Interesse'}
      </button>

      <style jsx>{`
        .lead-form-input {
          border: 0.5px solid #f0f0f0 !important;
          background-color: #fff !important;
          transition: background-color 0.2s ease;
        }
        .lead-form-input:focus {
          border: 0.5px solid #e0e0e0 !important;
          background-color: #f8f8f8 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        label b {
          z-index: 1;
          background: transparent;
        }
      `}</style>
    </form>
  )
}