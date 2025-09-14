'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

export const dynamic = 'force-dynamic'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    fetchUsers()
  }, [status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
      } else {
        console.error('Erro ao buscar usuários:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userToDelete.id))
        setShowDeleteModal(false)
        setUserToDelete(null)
      } else {
        const data = await response.json()
        alert('Erro ao excluir usuário: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7360ee] rounded-xl mb-4 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Acesso negado</p>
        </div>
      </div>
    )
  }

  const actions = (
    <Link
      href="/admin/users/new"
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#7360ee] border border-transparent rounded-lg hover:bg-[#7360ee]/90 focus:ring-4 focus:ring-[#7360ee]/30"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Adicionar Usuário
    </Link>
  )

  return (
    <>
      <AdminLayout
        title="Usuários"
        subtitle="Gerencie os usuários do sistema"
        currentPage="users"
        actions={actions}
      >
        {/* Mobile Users View */}
        <div className="lg:hidden p-4">
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#7360ee] text-white rounded-full flex items-center justify-center mr-3">
                      {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name || 'Sem nome'}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Criado: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                  <div className="flex space-x-3">
                    <Link
                      href={`/admin/users/edit/${user.id}`}
                      className="text-[#7360ee] hover:text-[#7360ee]/80"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => {
                        setUserToDelete(user)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Nome</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Função</th>
                  <th scope="col" className="px-6 py-3">Criado em</th>
                  <th scope="col" className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#7360ee] text-white rounded-full flex items-center justify-center mr-3">
                          {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        {user.name || 'Sem nome'}
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/users/edit/${user.id}`}
                          className="text-[#7360ee] hover:text-[#7360ee]/80"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => {
                            setUserToDelete(user)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o usuário <strong>{userToDelete.name || userToDelete.email}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setUserToDelete(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}