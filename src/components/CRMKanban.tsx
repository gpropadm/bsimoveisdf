'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface Lead {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  message?: string | null
  source: string
  currentStage: string
  stageUpdatedAt: Date
  propertyId?: string | null
  propertyTitle?: string | null
  propertyPrice?: number | null
  propertyType?: string | null
  createdAt: Date
  property?: {
    id: string
    title: string
    price: number
    type: string
    images: string | null
  } | null
}

interface Stage {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  order: number
  type: string
  leadsCount: number
}

interface KanbanColumn {
  stage: Stage
  leads: Lead[]
}

export default function CRMKanban() {
  const [kanbanData, setKanbanData] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)

  useEffect(() => {
    fetchKanbanData()
  }, [])

  const fetchKanbanData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/crm/kanban')
      if (response.ok) {
        const data = await response.json()
        setKanbanData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Kanban:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    setDraggingLeadId(null)

    // Se não houver destino ou se soltou no mesmo lugar
    if (!destination || (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )) {
      return
    }

    const sourceStageId = source.droppableId
    const destStageId = destination.droppableId
    const leadId = draggableId

    // Atualizar UI otimisticamente
    const newKanbanData = [...kanbanData]
    const sourceColumn = newKanbanData.find(col => col.stage.id === sourceStageId)
    const destColumn = newKanbanData.find(col => col.stage.id === destStageId)

    if (!sourceColumn || !destColumn) return

    // Remover lead da coluna de origem
    const [movedLead] = sourceColumn.leads.splice(source.index, 1)

    // Adicionar lead na coluna de destino
    destColumn.leads.splice(destination.index, 0, {
      ...movedLead,
      currentStage: destStageId
    })

    setKanbanData(newKanbanData)

    // Enviar para API
    try {
      const response = await fetch('/api/admin/crm/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          fromStageId: sourceStageId,
          toStageId: destStageId
        })
      })

      if (!response.ok) {
        // Reverter mudança se falhar
        fetchKanbanData()
        alert('Erro ao mover lead. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao mover lead:', error)
      // Reverter mudança
      fetchKanbanData()
      alert('Erro ao mover lead. Tente novamente.')
    }
  }

  const getFirstImage = (images: string | null) => {
    if (!images) return '/placeholder-property.jpg'
    try {
      const parsed = JSON.parse(images)
      return parsed[0] || '/placeholder-property.jpg'
    } catch {
      return '/placeholder-property.jpg'
    }
  }

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'Sob consulta'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={(start) => setDraggingLeadId(start.draggableId)}>
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {kanbanData.map((column) => (
            <div
              key={column.stage.id}
              className="flex-shrink-0 w-80"
            >
              {/* Header da coluna */}
              <div
                className="rounded-t-lg p-4 mb-2 shadow-sm"
                style={{ backgroundColor: column.stage.color }}
              >
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{column.stage.icon}</span>
                    <h3 className="font-semibold">{column.stage.name}</h3>
                  </div>
                  <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full text-sm">
                    {column.leads.length}
                  </span>
                </div>
                {column.stage.description && (
                  <p className="text-white text-opacity-90 text-xs mt-1">
                    {column.stage.description}
                  </p>
                )}
              </div>

              {/* Área de drop */}
              <Droppable droppableId={column.stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] rounded-b-lg p-2 transition-colors ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-50 border-2 border-dashed border-blue-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    {column.leads.map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={lead.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg shadow-sm p-4 mb-2 border border-gray-200 cursor-move hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-xl rotate-2' : ''
                            } ${draggingLeadId === lead.id ? 'opacity-50' : ''}`}
                          >
                            {/* Imóvel (se tiver) */}
                            {lead.property && (
                              <div className="mb-3">
                                <img
                                  src={getFirstImage(lead.property.images)}
                                  alt={lead.property.title}
                                  className="w-full h-24 object-cover rounded"
                                />
                                <p className="text-xs font-medium mt-1 text-gray-700 truncate">
                                  {lead.property.title}
                                </p>
                                <p className="text-xs text-green-600 font-semibold">
                                  {formatCurrency(lead.property.price)}
                                </p>
                              </div>
                            )}

                            {/* Informações do lead */}
                            <div className="space-y-1">
                              <h4 className="font-semibold text-gray-900">{lead.name}</h4>

                              {lead.phone && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  📱 {formatPhone(lead.phone)}
                                </p>
                              )}

                              {lead.email && (
                                <p className="text-xs text-gray-600 flex items-center gap-1 truncate">
                                  ✉️ {lead.email}
                                </p>
                              )}

                              {lead.message && (
                                <p className="text-xs text-gray-500 italic line-clamp-2 mt-2">
                                  "{lead.message}"
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                  {formatDate(lead.stageUpdatedAt)}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    lead.source === 'whatsapp'
                                      ? 'bg-green-100 text-green-700'
                                      : lead.source === 'chatbot'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {lead.source}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Mensagem quando vazio */}
                    {column.leads.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">Nenhum lead neste estágio</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
