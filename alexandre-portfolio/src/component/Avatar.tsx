import React from "react";
// @ts-ignore
import * as styles from "./Avatar.module.scss";

const Avatar: React.FC = () => {
  return (
    <div className={styles.avatar}>
      <div className={styles.avatarCircle1}>
        <div className={styles.avatarCircle2}></div>
      </div>
      <div className={styles.avatarPhoto}></div>
    </div>
  );
};
export default Avatar;
