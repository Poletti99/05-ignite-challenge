import React from 'react';
import Link from 'next/link';
import styles from './previewbutton.module.scss';

export default function ExitPreviewButton({ children }) {
  return (
    <aside className={styles.exitPreviewButtonContainer}>
      <Link href="/api/exit-preview">
        <a>{children}</a>
      </Link>
    </aside>
  );
}
