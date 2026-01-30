'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <span className={styles.logoText}>
            <img src="images/logo.png" alt="BaroCompany Logo" />
          </span>
        </div>
        
        <div className={styles.footerInfo}>
          <p className={styles.infoLine}>대표 양병호 | 사업자등록번호 818-11-01901</p>
          <p className={styles.infoLine}>서울특별시 도봉구 방학로 183, 4층 401호(방학동)</p>
          <div className={styles.footerLinks}>
            <Link href="/terms" className={styles.footerLink}>이용약관</Link>
            <span className={styles.divider}>|</span>
            <Link href="/privacy" className={styles.footerLink}>개인정보처리방침</Link>
          </div>
          <p className={styles.infoLine}>문의 : korhrdpartners@gmail.com
 </p>
          <p className={styles.copyright}>2026 © Hanmaum Lab (KORHRD Partners). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
