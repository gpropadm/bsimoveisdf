'use client'

import { useState, useEffect } from 'react'

export default function Footer() {
  const [contactPhone, setContactPhone] = useState('(61) 9999-9999')
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: ''
  })

  useEffect(() => {
    // Buscar configurações do site
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.settings?.contactPhone) {
          setContactPhone(data.settings.contactPhone)
        }
        if (data?.settings?.socialFacebook) {
          setSocialLinks(prev => ({ ...prev, facebook: data.settings.socialFacebook }))
        }
        if (data?.settings?.socialInstagram) {
          setSocialLinks(prev => ({ ...prev, instagram: data.settings.socialInstagram }))
        }
      })
      .catch(err => console.error('Erro ao carregar configurações:', err))
  }, [])

  return (
    <footer className="text-gray-800 border-t" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Logo e Endereço */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">BS Imóveis</h3>
            <div className="flex items-start text-sm text-gray-600 mb-3">
              <i className="fas fa-map-marker-alt mr-2 mt-1" style={{ fontSize: '14px' }}></i>
              <span>
                QR 218 Conj. O Lote 30<br />
                Brasília - DF
              </span>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h5 className="text-lg font-semibold mb-4 text-gray-800">Contato</h5>
            <div className="flex items-center text-sm">
              <i className="fab fa-whatsapp mr-2 text-gray-600" style={{ fontSize: '16px' }}></i>
              <span className="text-gray-600">{contactPhone}</span>
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h5 className="text-lg font-semibold mb-4 text-gray-800">Redes Sociais</h5>
            <div className="flex space-x-4">
              <a
                href={socialLinks.facebook || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Facebook"
                onClick={(e) => !socialLinks.facebook && e.preventDefault()}
              >
                <i className="fa-brands fa-facebook" style={{ fontSize: '24px' }}></i>
              </a>
              <a
                href={socialLinks.instagram || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Instagram"
                onClick={(e) => !socialLinks.instagram && e.preventDefault()}
              >
                <i className="fa-brands fa-instagram" style={{ fontSize: '24px' }}></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6" style={{ borderColor: '#dee2e6' }}>
          <div className="text-sm text-gray-600">
            <span className="font-bold">© BS Imóveis.</span>
            <span className="ml-1">Todos os direitos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}