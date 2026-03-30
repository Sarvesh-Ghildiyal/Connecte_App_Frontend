import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Root Layout - Navbar/Sidebar can go here */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
