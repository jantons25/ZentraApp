import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import MaquetaHtml from '../components/MaquetaHtml.jsx'
import OptAgregarUsuario from '../components/OptAgregarUsuario.jsx'

function AdministracionPage() {

  const { user, getUsers, signup, users } = useAuth()
  const [vistaActiva, setVistaActiva] = useState('');

  const refreshPagina = () => {
    getUsers()
  }

  useEffect(() => {
    refreshPagina()
  }, [])

  return (
    <div>
      <MaquetaHtml
        user={user}
        users={users}
        signup={signup}
        opt1={<OptAgregarUsuario onClick={() => setVistaActiva('AgregarUsuario')} />}
        pagina='Administracion'
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        refreshPagina={refreshPagina}
      />
    </div>
  )
}

export default AdministracionPage