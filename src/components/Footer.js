import React from "react";

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© 2025 Your Restaurant. All Rights Reserved.</p>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#ff6347",
    color: "white",
    textAlign: "center",
    padding: "10px",
    marginTop: "20px",
    position: "fixed",
    width: "100%",
    bottom: "0",
  },
};

export default Footer;
