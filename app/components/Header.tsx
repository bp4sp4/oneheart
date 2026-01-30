
import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  // 메뉴 mount/애니메이션 관리
  useEffect(() => {
    if (menuOpen) {
      setShouldRender(true);
      // 한 프레임 뒤에 open
      const t = setTimeout(() => setPanelOpen(true), 10);
      return () => clearTimeout(t);
    } else if (shouldRender) {
      setPanelOpen(false);
      // 트랜지션 후 언마운트
      const t = setTimeout(() => setShouldRender(false), 350);
      return () => clearTimeout(t);
    }
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <Image 
              src="/images/logo.png" 
              alt="한마음연구소" 
              width={120} 
              height={36}
              priority
            />
          </Link>
        </div>
        <button
          className={styles.menuButton}
          aria-label={menuOpen ? "닫기" : "메뉴"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L24 24" stroke="#222" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M24 8L8 24" stroke="#222" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M28.5 24C29.3284 24 30 24.6716 30 25.5C30 26.3284 29.3284 27 28.5 27H7.5C6.67157 27 6 26.3284 6 25.5C6 24.6716 6.67157 24 7.5 24H28.5ZM28.5 16.5C29.3284 16.5 30 17.1716 30 18C30 18.8284 29.3284 19.5 28.5 19.5H7.5C6.67157 19.5 6 18.8284 6 18C6 17.1716 6.67157 16.5 7.5 16.5H28.5ZM28.5 9C29.3284 9 30 9.67157 30 10.5C30 11.3284 29.3284 12 28.5 12H7.5C6.67157 12 6 11.3284 6 10.5C6 9.67157 6.67157 9 7.5 9H28.5Z" fill="#3D3D3D"/>
            </svg>
          )}
        </button>
      </div>
      {/* 전체 오버레이 메뉴 */}
      {shouldRender && (
        <div className={styles.menuOverlay}>
          <div className={panelOpen ? `${styles.menuPanel} ${styles.open}` : styles.menuPanel} ref={menuRef}>
    
            <nav className={styles.menuNav}>
              <Link href="/about" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                엄마 유형 테스트 더 알아보기
              </Link>
              <Link href="/payment" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                내 유형 바로 점검하기
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

