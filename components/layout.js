import styles from '../styles/layout.module.css'
import Head from 'next/head'
import Image from 'next/image'

export default function Layout(props) {
  return (
    <div className={styles.layout}>
      <Head>
        <title>PDF Manager Pro</title>
        <meta name="description" content="Una aplicación profesional para gestionar tus documentos PDF" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#4f46e5" />
      </Head>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleContainer}>
            <Image 
              src="/pdf-icon.svg" 
              width={48} 
              height={48} 
              alt="PDF Icon" 
              className={styles.titleIcon}
            />
            <h1 className={styles.title}>PDF Manager Pro</h1>
          </div>
          <p className={styles.subtitle}>
            Una aplicación profesional para gestionar tus documentos PDF. 
            Desarrollada por <a href="https://aiaccelera.com/" target="_blank" rel="noopener noreferrer">AI Accelera</a> y <a href="https://aceleradoraai.com/" target="_blank" rel="noopener noreferrer">Aceleradora AI</a>
          </p>
        </div>
      </header>
      <main className={styles.content}>
        {props.children}
      </main>
    </div>
  )
}