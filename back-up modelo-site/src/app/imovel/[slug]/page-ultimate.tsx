import { notFound } from 'next/navigation'

interface PropertyDetailProps {
  params: Promise<{ slug: string }>
}

async function getProperty(slug: string) {
  try {
    const response = await fetch(`https://modelo-site-imob.vercel.app/api/properties/${slug}`, {
      cache: 'no-store'
    })

    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function PropertyDetail({ params }: PropertyDetailProps) {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) notFound()

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>{property.title}</h1>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2a9d8f', margin: '0 0 10px 0' }}>
          R$ {property.price?.toLocaleString('pt-BR')}
        </p>
        <p style={{ color: '#666', margin: '0' }}>
          📍 {property.address}, {property.city} - {property.state}
        </p>
      </div>

      {property.description && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ lineHeight: '1.6', color: '#555' }}>{property.description}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {property.bedrooms && (
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e9f7fe', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{property.bedrooms && property.bedrooms > 0 ? property.bedrooms : ''}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Quartos</div>
          </div>
        )}
        {property.bathrooms && (
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e9f7fe', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{property.bathrooms && property.bathrooms > 0 ? property.bathrooms : ''}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Banheiros</div>
          </div>
        )}
        {property.parking && (
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e9f7fe', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{property.parking && property.parking > 0 ? property.parking : ''}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Vagas</div>
          </div>
        )}
        {property.area && (
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e9f7fe', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{property.area && property.area > 0 ? property.area : ""}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>m²</div>
          </div>
        )}
      </div>

      {property.images && (
        <div style={{ marginBottom: '30px' }}>
          <img
            src={property.images}
            alt={property.title}
            style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
          />
        </div>
      )}

      <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px', border: '2px solid #e9ecef' }}>
        <h3 style={{ color: '#333', marginBottom: '15px', textAlign: 'center' }}>
          💬 Interessado neste imóvel?
        </h3>

        <form method="POST" action="/api/leads" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="hidden" name="propertyId" value={property.id} />
          <input type="hidden" name="propertyTitle" value={property.title} />
          <input type="hidden" name="propertyPrice" value={`R$ ${property.price?.toLocaleString('pt-BR')}`} />
          <input type="hidden" name="propertyType" value={property.type} />

          <input
            type="text"
            name="name"
            placeholder="Seu nome completo"
            required
            style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
          />

          <input
            type="email"
            name="email"
            placeholder="Seu email"
            required
            style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Seu telefone (com DDD)"
            required
            style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
          />

          <textarea
            name="message"
            placeholder="Sua mensagem (opcional)"
            defaultValue={`Olá! Tenho interesse no imóvel "${property.title}". Gostaria de mais informações.`}
            style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', minHeight: '80px', resize: 'vertical' }}
          />

          <button
            type="submit"
            style={{
              padding: '15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📧 Enviar Interesse
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', margin: '10px 0 0 0' }}>
            📱 Você receberá uma resposta via WhatsApp!
          </p>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#333', color: 'white', borderRadius: '8px' }}>
        <p style={{ margin: '0', fontSize: '18px' }}>🏠 Site Imobiliário</p>
        <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>Encontre seu imóvel ideal!</p>
      </div>
    </div>
  )
}