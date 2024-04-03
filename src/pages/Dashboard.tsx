import { motion } from 'framer-motion';
import FormInput from './Form';

export default function Dashboard() {
  //
  // const divStyle = {
  //   width: '20%',
  //   height: '100%',
  //   background: '#180E1E',
  //   boxShadow: '3px 3px 8px #A661CD50',
  // };

  return (
    <motion.div className='py-5'>
      {/* <div style={divStyle}></div> */}
      {/* Insertion forms */}
      <FormInput />
      {/*  */}
      {/* <div style={divStyle}></div> */}
    </motion.div>
  );
}
