import styles from '@/styles/components/DreamQuote.module.scss';

export default function DreamQuote() {
  return (
    <section className={styles.quote}>
      <div className="container">
        <h3 className={styles.title}>我的梦想</h3>
        <p className={styles.text}>
          有一个早晨我扔掉了所有的昨天，从此我的脚步就轻盈了。—— 泰戈尔
        </p>
      </div>
    </section>
  );
}
