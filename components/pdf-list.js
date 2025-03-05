import styles from '../styles/pdf-list.module.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import PDFComponent from './pdf';
import Image from 'next/image';

export default function PdfList() {
  const [pdfs, setPdfs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const didFetchRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!didFetchRef.current) {
      didFetchRef.current = true;
      fetchPdfs();
    }
  }, []);

  async function fetchPdfs(selected) {
    setIsLoading(true);
    let path = '/pdfs';
    if (selected !== undefined) {
      path = `/pdfs?selected=${selected}`;
    }
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path);
      const json = await res.json();
      setPdfs(json);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const debouncedUpdatePdf = useCallback(debounce((pdf, fieldChanged) => {
    updatePdf(pdf, fieldChanged);
  }, 500), []);

  function handlePdfChange(e, id) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    const copy = [...pdfs];
    const idx = pdfs.findIndex((pdf) => pdf.id === id);
    const changedPdf = { ...pdfs[idx], [name]: value };
    copy[idx] = changedPdf;
    debouncedUpdatePdf(changedPdf, name);
    setPdfs(copy);
  }

  async function updatePdf(pdf, fieldChanged) {
    const data = { [fieldChanged]: pdf[fieldChanged] };
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/pdfs/${pdf.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Si la respuesta no es exitosa, lanzar un error
        const errorText = await response.text();
        console.error('Error updating PDF:', errorText);
        
        // Revertir el cambio en la interfaz de usuario
        const originalPdfs = [...pdfs];
        const idx = originalPdfs.findIndex((p) => p.id === pdf.id);
        if (idx !== -1) {
          // Revertir solo el campo que cambió
          originalPdfs[idx][fieldChanged] = !originalPdfs[idx][fieldChanged];
          setPdfs(originalPdfs);
        }
        
        // Mostrar un mensaje de error
        setUploadStatus({ 
          type: 'error', 
          message: `Error al actualizar el PDF: ${errorText || response.status}` 
        });
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        // Si la actualización es exitosa, actualizar la interfaz de usuario
        const updatedPdf = await response.json();
        const updatedPdfs = [...pdfs];
        const idx = updatedPdfs.findIndex((p) => p.id === updatedPdf.id);
        if (idx !== -1) {
          updatedPdfs[idx] = updatedPdf;
          setPdfs(updatedPdfs);
        }
      }
    } catch (error) {
      console.error('Error updating PDF:', error);
      
      // Revertir el cambio en la interfaz de usuario
      const originalPdfs = [...pdfs];
      const idx = originalPdfs.findIndex((p) => p.id === pdf.id);
      if (idx !== -1) {
        // Revertir solo el campo que cambió
        originalPdfs[idx][fieldChanged] = !originalPdfs[idx][fieldChanged];
        setPdfs(originalPdfs);
      }
      
      // Mostrar un mensaje de error
      setUploadStatus({ 
        type: 'error', 
        message: `Error al actualizar el PDF: ${error.message}` 
      });
      setTimeout(() => setUploadStatus(null), 3000);
    }
  }

  async function handleDeletePdf(id) {
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + `/pdfs/${id}`, {
        method: 'DELETE'
      });
      setPdfs(pdfs.filter(pdf => pdf.id !== id));
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setUploadStatus({ type: 'error', message: 'Por favor selecciona un archivo PDF válido' });
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Por favor selecciona un archivo PDF' });
      return;
    }

    setUploadStatus({ type: 'loading', message: 'Subiendo archivo...' });
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Asegurarse de que la URL del endpoint es correcta
      const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/pdfs/upload`;
      console.log('Uploading to:', uploadUrl);
      
      // Verificar que la API está disponible antes de intentar subir
      const apiCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }).catch(error => {
        console.error('API check error:', error);
        throw new Error('No se puede conectar al servidor. Verifica que el backend esté en ejecución.');
      });
      
      if (!apiCheckResponse.ok) {
        throw new Error(`El servidor no está respondiendo correctamente: ${apiCheckResponse.status}`);
      }
      
      // Proceder con la carga del archivo usando XMLHttpRequest para mostrar el progreso
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          setUploadStatus({ 
            type: 'loading', 
            message: `Subiendo archivo... ${progress}%` 
          });
        }
      });
      
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const newPdf = JSON.parse(xhr.responseText);
            setPdfs([...pdfs, newPdf]);
            setSelectedFile(null);
            setUploadProgress(100);
            setUploadStatus({ type: 'success', message: 'Archivo subido correctamente' });
            // Limpiar el input de archivo
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            // Limpiar el estado después de 3 segundos
            setTimeout(() => {
              setUploadStatus(null);
              setUploadProgress(0);
            }, 3000);
            // Refrescar la lista de PDFs
            fetchPdfs(filter);
          } catch (error) {
            console.error('Error parsing response:', error);
            setUploadStatus({ type: 'error', message: 'Error al procesar la respuesta del servidor' });
          }
        } else {
          let errorMessage = 'Error al subir el archivo';
          try {
            // Intentar obtener el mensaje de error detallado
            const errorData = xhr.responseText;
            console.error('Error response:', errorData);
            
            // Intentar parsear como JSON si es posible
            try {
              const jsonError = JSON.parse(errorData);
              errorMessage = jsonError.detail || errorMessage;
            } catch (e) {
              // Si no es JSON, usar el texto como está
              errorMessage = `${errorMessage}: ${errorData}`;
            }
          } catch (e) {
            errorMessage = `${errorMessage}: ${xhr.status}`;
          }
          
          setUploadStatus({ type: 'error', message: errorMessage });
        }
      });
      
      xhr.addEventListener('error', () => {
        setUploadStatus({ type: 'error', message: 'Error de red al subir el archivo' });
      });
      
      xhr.addEventListener('abort', () => {
        setUploadStatus({ type: 'error', message: 'Carga cancelada' });
      });
      
      xhr.open('POST', uploadUrl);
      xhr.send(formData);
      
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus({ type: 'error', message: 'Error al subir el archivo: ' + error.message });
    }
  };

  function handleFilterChange(value) {
    setFilter(value);
    setSearchTerm('');
    setIsLoading(true);
    fetchPdfs(value);
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        setUploadStatus({ type: 'error', message: 'Por favor selecciona un archivo PDF válido' });
        setTimeout(() => setUploadStatus(null), 3000);
      }
    }
  };

  const filteredPdfs = searchTerm 
    ? pdfs.filter(pdf => pdf.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : pdfs;

  return (
    <div className={styles.container}>
      <form className={styles.uploadForm} onSubmit={handleUpload}>
        <h2 className={styles.formTitle}>Subir nuevo PDF</h2>
        <div className={styles.uploadInputContainer}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            className={styles.uploadInput}
            id="file-upload"
          />
          <label 
            htmlFor="file-upload" 
            className={`${styles.uploadLabel} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? selectedFile.name : 'Arrastra tu archivo PDF aquí o haz clic para seleccionar'}
          </label>
          <div className={styles.uploadActions}>
            <button type="button" onClick={handleBrowseClick} className={styles.browseButton}>
              Explorar
            </button>
            <button 
              type="submit" 
              className={`${styles.uploadButton} ${!selectedFile ? styles.uploadButtonDisabled : ''}`}
              disabled={!selectedFile}
            >
              <Image src="/upload.svg" width="16" height="16" alt="Upload" style={{ marginRight: '8px' }} />
              Subir PDF
            </button>
          </div>
        </div>
        {uploadStatus && (
          <div className={`${styles.uploadStatus} ${styles[uploadStatus.type]}`}>
            {uploadStatus.type === 'loading' && (
              <>
                <div className={styles.loadingSpinner}></div>
                {uploadProgress > 0 && (
                  <div className={styles.progressBarContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </>
            )}
            {uploadStatus.type === 'error' && (
              <div className={styles.errorIcon}>❌</div>
            )}
            {uploadStatus.type === 'success' && (
              <div className={styles.successIcon}>✅</div>
            )}
            <span className={styles.statusMessage}>{uploadStatus.message}</span>
            {uploadStatus.type === 'error' && (
              <button 
                className={styles.retryButton}
                onClick={() => setUploadStatus(null)}
              >
                Cerrar
              </button>
            )}
          </div>
        )}
      </form>

      <div className={styles.mainInputContainer}>
        <div className={styles.searchIcon}>
          <Image src="/search.svg" width="16" height="16" alt="Search" />
        </div>
        <input
          type="text"
          placeholder="Buscar PDFs por nombre..."
          className={styles.mainInput}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className={styles.filters}>
        <span className={styles.filterLabel}>Filtrar por:</span>
        <button
          className={`${styles.filterBtn} ${filter === undefined ? styles.filterActive : ''}`}
          onClick={() => handleFilterChange(undefined)}
          aria-label="Mostrar todos los PDFs"
        >
          <span className={styles.filterText}>Todos</span>
          {filter === undefined && <span className={styles.filterIndicator}></span>}
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'true' ? styles.filterActive : ''}`}
          onClick={() => handleFilterChange('true')}
          aria-label="Mostrar solo PDFs seleccionados"
        >
          <span className={styles.filterText}>Seleccionados</span>
          {filter === 'true' && <span className={styles.filterIndicator}></span>}
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'false' ? styles.filterActive : ''}`}
          onClick={() => handleFilterChange('false')}
          aria-label="Mostrar solo PDFs no seleccionados"
        >
          <span className={styles.filterText}>No seleccionados</span>
          {filter === 'false' && <span className={styles.filterIndicator}></span>}
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando PDFs...</p>
        </div>
      ) : (
        <div className={styles.pdfList}>
          {filteredPdfs.length > 0 ? (
            filteredPdfs.map((pdf) => (
              <PDFComponent
                key={pdf.id}
                pdf={pdf}
                onChange={handlePdfChange}
                onDelete={handleDeletePdf}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📄</div>
              <p className={styles.emptyStateText}>No hay PDFs disponibles</p>
              <p>Sube un nuevo PDF para comenzar</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
