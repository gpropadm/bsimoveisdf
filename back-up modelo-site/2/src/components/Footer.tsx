'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="text-gray-800 border-t border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-8">

          {/* Logo e Scale Up */}
          <div>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 143" className="h-6 w-18">
                  <path d="M41.257 37.516c-7.546 0-23.694 1.359-30.184 1.963l-.15 21.297c8.753-.906 22.788-1.51 34.56-1.51 11.922 0 18.41 7.703 18.41 17.822v.756H43.672C18.771 77.844.51 86.15.51 109.26v1.511c0 21.146 15.243 31.718 35.315 31.718 5.885 0 11.62-.906 15.997-2.869 3.169-1.36 5.584-3.021 7.244-4.532 1.66-1.661 3.47-3.776 4.829-6.192v9.817H88.04V77.391c-.15-27.641-17.355-39.876-46.784-39.876zm22.486 66.458c-.755 11.328-7.697 19.182-20.525 19.182-11.318 0-18.26-6.344-18.26-15.255 0-9.365 8.15-15.255 18.26-15.255h20.827l-.302 11.328zm47.689-27.339v62.229h24.298V76.182c0-12.234 6.942-17.219 17.808-17.219 3.773 0 9.055.151 14.186.605V37.364h-10.715c-29.731 0-45.577 12.084-45.577 39.271zm244.786-39.12c-31.844 0-54.179 20.844-54.179 52.412 0 32.474 21.128 52.562 53.575 52.562 31.994 0 54.028-20.239 54.028-52.109-.151-32.172-21.883-52.864-53.424-52.864zm-.604 83.678c-17.204 0-28.07-12.688-28.07-31.266 0-18.578 11.62-31.266 28.07-31.266 17.204 0 28.825 13.443 28.825 31.266 0 18.125-10.413 31.266-28.825 31.266zM245.295 37.516c-16.601 0-28.523 7.25-35.013 19.786V.51h-24.901v138.354h24.448v-12.989c7.093 10.271 18.714 16.614 33.655 16.614 28.674 0 46.633-22.505 46.633-53.015 0-29.906-17.808-51.959-44.822-51.959zm-7.999 83.677c-15.242 0-27.467-11.329-27.467-27.339v-7.099c0-17.068 12.526-28.094 27.92-28.094 17.204 0 27.014 12.235 27.014 30.813s-11.319 31.719-27.467 31.719z" fill="#4f2de8"></path>
                </svg>
                <img
                  src="/api/placeholder/105/70"
                  alt="Scale Up Endeavor"
                  className="h-17 w-25"
                />
              </div>
            </div>
          </div>

          {/* Conheça */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Conheça</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/imobiliarias" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Imobiliárias Parceiras
                </Link>
              </li>
              <li>
                <Link href="https://blog.arboimoveis.com.br/" target="_blank" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="https://superlogica.gupy.io/" target="_blank" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Trabalhe conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Produtos</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://plataforma.arboimoveis.com.br/produtos/crm" target="_blank" className="text-gray-500 hover:text-gray-700 transition-colors">
                  CRM imobiliário
                </Link>
              </li>
              <li>
                <Link href="https://plataforma.arboimoveis.com.br/produtos/crm" target="_blank" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Guia completo CRM imobiliárias
                </Link>
              </li>
              <li>
                <Link href="/financiamentoimobiliario" target="_blank" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Financiamento imobiliário
                </Link>
              </li>
              <li>
                <Link href="https://plataforma.arboimoveis.com.br/#" target="_blank" className="text-gray-500 hover:text-gray-700 transition-colors">
                  ERP imobiliário
                </Link>
              </li>
              <li>
                <Link href="https://superlogica.com/imobiliarias/" target="_blank" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Sistema imobiliário
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Contato</h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <a href="https://api.whatsapp.com/send?phone=551140403939" target="_blank" className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                  <i className="fab fa-whatsapp mr-2" style={{ fontSize: '14px' }}></i>
                  <span>(11) 4040-3939</span>
                </a>
              </div>
              <div>
                <Link href="/fale-conosco" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Fale conosco
                </Link>
              </div>
              <div>
                <Link href="https://ajuda.arboimoveis.com.br/" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Central de ajuda
                </Link>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="mt-6">
              <h6 className="text-base font-semibold mb-3">Acompanhe nossas redes</h6>
              <div className="flex space-x-3">
                <a href="https://www.facebook.com/arboimoveis" target="_blank" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <i className="fa-brands fa-facebook-f" style={{ fontSize: '16px' }}></i>
                </a>
                <a href="https://www.instagram.com/arboimoveis" target="_blank" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <i className="fa-brands fa-instagram" style={{ fontSize: '16px' }}></i>
                </a>
                <a href="https://br.linkedin.com/company/arboimoveis" target="_blank" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <i className="fa-brands fa-linkedin-in" style={{ fontSize: '16px' }}></i>
                </a>
                <a href="https://blog.arboimoveis.com.br/" target="_blank" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <i className="fa-brands fa-wordpress-simple" style={{ fontSize: '16px' }}></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center">
            <div className="text-sm mb-4 xl:mb-0">
              <span className="font-bold">© Superlógica Imobi.</span>
              <span className="ml-2">Todos os direitos reservados.</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
              <Link href="https://transparencia.arboimoveis.com.br/termos/termos-de-servico/termo-de-uso.pdf" className="hover:text-white transition-colors">
                Termos de uso
              </Link>
              <span>·</span>
              <Link href="/politica-privacidade" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <span>·</span>
              <Link href="https://transparencia.superlogica.com/arquivos/codigo-de-conduta.pdf" target="_blank" className="hover:text-white transition-colors">
                Código de Conduta
              </Link>
              <span>·</span>
              <Link href="https://www.contatoseguro.com.br/gruposuperlogica" target="_blank" className="hover:text-white transition-colors">
                Canal de denúncia
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}