import Image from 'next/image';
import styles from '../styles/pdf.module.css';
import { useState } from 'react';

export default function PDFComponent(props) {
  const { pdf, onChange, onDelete } = props;
  const [isChecking, setIsChecking] = useState(false);
  
  const handleCheckboxChange = (e) => {
    setIsChecking(true);
    onChange(e, pdf.id);
    // Desactivar el indicador de carga después de un tiempo
    setTimeout(() => setIsChecking(false), 1000);
  };
  
  return (
    <div className={`${styles.pdfRow} ${pdf.selected ? styles.selectedRow : ''}`}>
      <div className={styles.checkboxContainer}>
        <input
          className={styles.pdfCheckbox}
          name="selected"
          type="checkbox"
          checked={pdf.selected}
          onChange={handleCheckboxChange}
          id={`pdf-checkbox-${pdf.id}`}
        />
        <label 
          htmlFor={`pdf-checkbox-${pdf.id}`} 
          className={styles.checkboxLabel}
        >
          {isChecking && <div className={styles.checkingIndicator}></div>}
        </label>
      </div>
      <input
        className={styles.pdfInput}
        autoComplete="off"
        name="name"
        type="text"
        value={pdf.name}
        onChange={(e) => onChange(e, pdf.id)}
      />
      <div className={styles.pdfActions}>
        <a
          href={pdf.file}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewPdfLink}
          title="Ver PDF"
        >
          <Image src="/document-view.svg" width="22" height="22" alt="Ver PDF" />
        </a>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(pdf.id)}
          title="Eliminar PDF"
        >
          <Image src="/delete-outline.svg" width="24" height="24" alt="Eliminar PDF" />
        </button>
      </div>
    </div>
  );
}
