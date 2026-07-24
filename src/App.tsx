function App() {
  return (
    <main
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-4)',
      }}
    >
      <div className="card">
        <h1>MateCode</h1>
        <p>
          Base visual lista: paleta, tipografía, espaciado y componentes base
          de botón e input.
        </p>
        <label htmlFor="demo-input">Campo de ejemplo</label>
        <input id="demo-input" placeholder="Escribí algo..." />
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-4)',
          }}
        >
          <button className="primary">Acción principal</button>
          <button className="secondary">Secundaria</button>
        </div>
      </div>
    </main>
  )
}

export default App
