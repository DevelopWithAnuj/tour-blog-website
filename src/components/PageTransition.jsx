import { motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';

export default function PageTransition() {
  const { pathname } = useLocation();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Outlet />
    </motion.div>
  );
}
