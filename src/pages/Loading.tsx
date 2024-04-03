import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icon, Header } from 'semantic-ui-react';
import { useEffect } from 'react';

export default function Loading() {
  const navigate = useNavigate();

  const LoadAndComplete = async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 5000));
    navigate('/dashboard');
  };

  useEffect(() => {
    LoadAndComplete();
  });

  return (
    <>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ ease: 'linear', duration: 2, repeat: Infinity }}
      >
        <Icon name='spinner' color='yellow' size='huge' />
      </motion.div>
      <Header color='yellow'>Loading...</Header>
    </>
  );
}
