import styles from '../styles/loader.module.css';

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}>
        <div className={styles.loaderCircle}></div>
        <div className={styles.loaderCircle}></div>
        <div className={styles.loaderCircle}></div>
      </div>
    </div>
  );
};

export default Loader;